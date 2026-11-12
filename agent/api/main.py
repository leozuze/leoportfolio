"""HTTP API for JayZ, Leo Zuze's portfolio assistant.

Run from the agent directory:
    python -m uvicorn api.main:app --port 8000
"""

import asyncio
import hashlib
import json
import logging
import math
import secrets
import time
from contextlib import asynccontextmanager
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app import config
from app.agent import ask, build_agent
from app.ratelimit import RateLimiter, Rule
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

def build_limiter() -> RateLimiter:
    return RateLimiter([
        Rule("client_minute", config.RATE_LIMIT_PER_MINUTE, 60, True),
        Rule("client_hour", config.RATE_LIMIT_PER_HOUR, 3600, True),
        Rule("global_minute", config.GLOBAL_PER_MINUTE, 60, False),
        Rule("global_day", config.GLOBAL_PER_DAY, 86400, False),
    ])


@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.agent = None
    application.state.limiter = build_limiter()
    application.state.chat_slots = asyncio.Semaphore(config.MAX_CONCURRENT_CHATS)
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
    version="1.1.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(config.FRONTEND_ORIGINS),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    expose_headers=["Retry-After"],
)


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def client_ip(request: Request) -> str:
    """The visitor's IP. Behind Render's proxy it is the first X-Forwarded-For entry."""
    if config.TRUST_FORWARDED_FOR:
        forwarded = request.headers.get("x-forwarded-for", "")
        first = forwarded.split(",")[0].strip()
        if first:
            return first
    return request.client.host if request.client else "unknown"


def anonymise(ip: str) -> str:
    """Short hash for logs, so repeat visitors can be told apart without storing IPs."""
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()[:8]


def get_agent(request: Request):
    agent = getattr(request.app.state, "agent", None)

    if agent is None:
        raise HTTPException(
            status_code=503,
            detail="The assistant is unavailable. Please try again shortly.",
        )

    return agent


def enforce_rate_limit(request: Request) -> None:
    ip = client_ip(request)
    allowed, wait, rule = request.app.state.limiter.check(ip)

    if allowed:
        return

    logger.warning("Rate limited (%s) client=%s", rule, anonymise(ip))

    if rule.startswith("client"):
        message = "You're sending messages quickly. Please wait a moment and try again."
    else:
        message = "The assistant is very busy right now. Please try again in a few minutes."

    raise HTTPException(
        status_code=429,
        detail=message,
        headers={"Retry-After": str(max(1, math.ceil(wait)))},
    )


async def acquire_chat_slot(request: Request) -> bool:
    """Wait briefly for one of the concurrent-chat slots. False means too busy."""
    try:
        await asyncio.wait_for(
            request.app.state.chat_slots.acquire(),
            timeout=config.CHAT_QUEUE_TIMEOUT_SECONDS,
        )
        return True
    except asyncio.TimeoutError:
        return False


def get_history(payload: ChatRequest) -> list[dict]:
    return [
        {
            "role": message.role,
            "content": message.content[: config.HISTORY_MESSAGE_MAX_CHARS],
        }
        for message in payload.history[-config.HISTORY_MESSAGES :]
    ]


def encode_event(data: dict) -> str:
    """Encode one newline-delimited JSON event."""
    return json.dumps(data, ensure_ascii=False) + "\n"


def require_admin(request: Request) -> None:
    """Bearer-token check for the admin endpoints."""
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
# Request logging (path, status and timing only, never message content)
# ---------------------------------------------------------------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)

    started = time.perf_counter()
    response = await call_next(request)

    # For streaming responses this is the time until the response starts.
    logger.info(
        "%s %s -> %d in %.2fs client=%s",
        request.method,
        request.url.path,
        response.status_code,
        time.perf_counter() - started,
        anonymise(client_ip(request)),
    )
    return response


# ---------------------------------------------------------------------------
# Root and health
# ---------------------------------------------------------------------------

@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def root():
    return {"service": "JayZ portfolio assistant", "status": "ok"}


@app.get("/health")
async def health(request: Request):
    get_agent(request)
    store: KnowledgeStore = request.app.state.store
    return {"status": "ok", "knowledge_ready": store.retriever is not None}


# ---------------------------------------------------------------------------
# Admin
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


@app.get("/api/debug/ip", dependencies=[Depends(require_admin)])
async def debug_ip(request: Request):
    """Shows which address the rate limiter uses, to confirm the proxy setup."""
    return {
        "client_used_for_limits": client_ip(request),
        "x_forwarded_for": request.headers.get("x-forwarded-for"),
        "direct_peer": request.client.host if request.client else None,
    }


# ---------------------------------------------------------------------------
# Standard JSON chat
# ---------------------------------------------------------------------------

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request):
    agent = get_agent(request)
    enforce_rate_limit(request)
    request.app.state.store.touch()
    history = get_history(payload)

    if not await acquire_chat_slot(request):
        raise HTTPException(
            status_code=503,
            detail="The assistant is busy right now. Please try again in a moment.",
            headers={"Retry-After": "10"},
        )

    final_answer = ""

    try:
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

    finally:
        request.app.state.chat_slots.release()

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
    enforce_rate_limit(request)
    request.app.state.store.touch()
    history = get_history(payload)

    async def events():
        have_slot = False

        try:
            yield encode_event({
                "type": "status",
                "text": "Thinking about your question",
            })

            have_slot = await acquire_chat_slot(request)

            if not have_slot:
                yield encode_event({
                    "type": "error",
                    "text": "The assistant is busy right now. Please try again in a moment.",
                })
                return

            last_answer_sent = 0.0

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
                    last_answer_sent = 0.0
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
                    # Throttled: the "final" event always carries the complete text.
                    now = time.monotonic()

                    if now - last_answer_sent >= config.STREAM_MIN_INTERVAL_SECONDS:
                        last_answer_sent = now
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

        finally:
            if have_slot:
                request.app.state.chat_slots.release()

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )