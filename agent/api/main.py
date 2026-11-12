"""HTTP API for JayZ, Leo Zuze's portfolio assistant.

Run from the agent directory:
    python -m uvicorn api.main:app --port 8000
"""

import asyncio
import json
import logging
import os
import secrets
from contextlib import asynccontextmanager
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app import config
from app.agent import ask, build_agent
from app.sync import KnowledgeStore


logger = logging.getLogger("uvicorn.error")


# ---------------------------------------------------------------------------
# Request and response models
# ---------------------------------------------------------------------------

MessageText = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=2000,
    ),
]

HistoryText = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=12000,
    ),
]


class HistoryMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: HistoryText


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: MessageText
    history: list[HistoryMessage] = Field(
        default_factory=list,
        max_length=20,
    )


class ChatResponse(BaseModel):
    reply: str


class IntervalRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hours: float = Field(ge=config.SYNC_MIN_INTERVAL_HOURS, le=720)


# ---------------------------------------------------------------------------
# Startup and shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.agent = None
    store = KnowledgeStore()
    application.state.store = store

    logger.info("Loading portfolio knowledge...")

    # First sync before serving. If it fails the server still starts, the search tool
    # reports "still loading", and the background loop retries every minute.
    await store.sync("startup")
    store.start()

    application.state.agent = build_agent(store)

    logger.info("JayZ portfolio assistant is ready.")

    try:
        yield
    finally:
        await store.stop()
        application.state.agent = None
        logger.info("JayZ portfolio assistant stopped.")


app = FastAPI(
    title="JayZ Portfolio Assistant",
    description="API for Leo Zuze's portfolio assistant.",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

# app.config loads agent/.env before this setting is read.
# Updated properly in step 7 (leozuze.com and the local ports).
DEFAULT_FRONTEND_ORIGINS = (
    "https://leozuzedev.vercel.app,"
    "http://localhost:5173,"
    "http://127.0.0.1:5173"
)

allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        DEFAULT_FRONTEND_ORIGINS,
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def get_agent(request: Request):
    agent = getattr(request.app.state, "agent", None)

    if agent is None:
        raise HTTPException(
            status_code=503,
            detail="The assistant is unavailable. Please try again shortly.",
        )

    return agent


def get_history(payload: ChatRequest) -> list[dict]:
    return [
        message.model_dump()
        for message in payload.history[-config.HISTORY_MESSAGES :]
    ]


def encode_event(data: dict) -> str:
    """Encode one newline-delimited JSON event."""
    return json.dumps(data, ensure_ascii=False) + "\n"


def require_admin(request: Request) -> None:
    """Bearer-token check for the sync admin endpoints."""
    token = config.ADMIN_TOKEN

    if not token:
        raise HTTPException(
            status_code=503,
            detail="Admin endpoints are disabled. Set ADMIN_TOKEN to enable them.",
        )

    header = request.headers.get("authorization", "")
    supplied = header[7:] if header.lower().startswith("bearer ") else ""

    if not secrets.compare_digest(supplied.encode("utf-8"), token.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Unauthorized.")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health")
async def health(request: Request):
    get_agent(request)
    store: KnowledgeStore = request.app.state.store
    return {"status": "ok", "knowledge_ready": store.retriever is not None}


# ---------------------------------------------------------------------------
# Sync admin
# ---------------------------------------------------------------------------

@app.get("/api/sync/status", dependencies=[Depends(require_admin)])
async def sync_status(request: Request):
    return request.app.state.store.status()


@app.post("/api/sync", dependencies=[Depends(require_admin)])
async def sync_now(request: Request):
    store: KnowledgeStore = request.app.state.store
    await store.sync("manual")
    return store.status()


@app.put("/api/sync/interval", dependencies=[Depends(require_admin)])
async def sync_interval(payload: IntervalRequest, request: Request):
    store: KnowledgeStore = request.app.state.store
    store.set_interval(payload.hours)
    return store.status()


# ---------------------------------------------------------------------------
# Standard JSON chat
# ---------------------------------------------------------------------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request):
    agent = get_agent(request)
    request.app.state.store.touch()
    history = get_history(payload)

    final_answer = ""

    try:
        async for event in ask(
            agent,
            question=payload.message,
            history=history,
        ):
            if event.kind == "error":
                logger.error(
                    "Portfolio agent failed: %s",
                    event.detail,
                )

                raise HTTPException(
                    status_code=502,
                    detail=event.text
                    or "Something went wrong. Please try again.",
                )

            if event.kind == "final":
                final_answer = event.text.strip()
                break

    except HTTPException:
        raise

    except Exception:
        logger.exception("Unexpected portfolio chat failure")

        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again.",
        ) from None

    if not final_answer:
        logger.error("Portfolio agent finished without a final answer")

        raise HTTPException(
            status_code=502,
            detail="I couldn't finish that answer. Please try again.",
        )

    return ChatResponse(reply=final_answer)


# ---------------------------------------------------------------------------
# Streaming chat
# ---------------------------------------------------------------------------

@app.post("/api/chat/stream")
async def stream_chat(payload: ChatRequest, request: Request):
    agent = get_agent(request)
    request.app.state.store.touch()
    history = get_history(payload)

    async def events():
        try:
            yield encode_event({
                "type": "status",
                "text": "Thinking about your question",
            })

            async for event in ask(
                agent,
                question=payload.message,
                history=history,
            ):
                if await request.is_disconnected():
                    return

                if event.kind == "tool_call":
                    # React clears any preliminary answer when a tool starts,
                    # matching the reset performed by app.agent.ask().
                    yield encode_event({
                        "type": "tool",
                        "name": event.name,
                        "state": "running",
                    })

                elif event.kind == "tool_result":
                    # Send activity only, not raw retrieved chunks or results.
                    yield encode_event({
                        "type": "tool",
                        "name": event.name,
                        "state": "complete",
                    })

                elif event.kind == "token":
                    # app.agent.ask() emits the whole answer so far.
                    # React must replace its text, not append this event.
                    yield encode_event({
                        "type": "answer",
                        "text": event.text,
                    })

                elif event.kind == "final":
                    text = event.text.strip()

                    if not text:
                        logger.error(
                            "Portfolio stream returned an empty final answer"
                        )

                        yield encode_event({
                            "type": "error",
                            "text": (
                                "I couldn't finish that answer. "
                                "Please try again."
                            ),
                        })
                        return

                    yield encode_event({
                        "type": "final",
                        "text": text,
                    })
                    return

                elif event.kind == "error":
                    logger.error(
                        "Portfolio stream failed: %s",
                        event.detail,
                    )

                    yield encode_event({
                        "type": "error",
                        "text": event.text
                        or "Something went wrong. Please try again.",
                    })
                    return

            # Reaching this point means no final or error event was received.
            yield encode_event({
                "type": "error",
                "text": "The response ended early. Please try again.",
            })

        except asyncio.CancelledError:
            # Let the server handle client disconnects and cancellation.
            raise

        except Exception:
            logger.exception("Unexpected portfolio streaming failure")

            yield encode_event({
                "type": "error",
                "text": "Something went wrong. Please try again.",
            })

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )