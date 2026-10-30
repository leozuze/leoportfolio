"""The portfolio agent: a LlamaIndex FunctionAgent with a knowledge-base tool and GitHub tools."""
from dataclasses import dataclass, field
import logging
import time

from llama_index.core.agent.workflow import (
    AgentStream,
    FunctionAgent,
    ToolCall,
    ToolCallResult,
)
from llama_index.core.base.llms.types import ChatMessage

from app import config, llm
from app.prompts import SYSTEM_PROMPT
from app.retriever import build_retriever
from app.tools.github import github_tools
from app.tools.knowledge import make_search_tool


@dataclass
class AgentEvent:
    kind: str  # tool_call | tool_result | token | final | error
    text: str = ""
    name: str = ""
    args: dict = field(default_factory=dict)
    detail: str = ""


def build_agent() -> FunctionAgent:
    tools = [make_search_tool(build_retriever()), *github_tools()]
    return FunctionAgent(
        name="portfolio_agent",
        description="Answers questions about Leo Zuze's work, services and GitHub.",
        tools=tools,
        llm=llm.get_llm(config.GROQ_MODEL, config.ANSWER_MAX_TOKENS, temperature=0.1),
        system_prompt=SYSTEM_PROMPT,
    )


def _content_text(content) -> str:
    """Gradio can hand back message content as str or as a list of parts."""
    if isinstance(content, str):
        return content
    if isinstance(content, dict):
        return str(content.get("text", ""))
    if isinstance(content, list):
        return " ".join(_content_text(part) for part in content)
    return ""


def to_chat_history(history: list[dict]) -> list[ChatMessage]:
    """Keep only the last few user/assistant messages to protect the token budget."""
    messages = []
    for m in history[-config.HISTORY_MESSAGES :]:
        text = _content_text(m.get("content", "")).strip()
        if m.get("role") in ("user", "assistant") and text:
            messages.append(ChatMessage(role=m["role"], content=text))
    return messages


def friendly_error(e: Exception) -> str:
    if "rate limit" in str(e).lower() or type(e).__name__ == "RateLimitError":
        return "The assistant is busy right now. Please try again in a minute."
    return "Something went wrong while answering. Please try again."


_HYPHENS = {"\u2010": "-", "\u2011": "-"}


def clean_text(text: str) -> str:
    """gpt-oss sometimes writes non-breaking hyphens, which silently break copied links."""
    for bad, good in _HYPHENS.items():
        text = text.replace(bad, good)
    return text


async def ask(
    agent: FunctionAgent,
    question: str,
    history: list[dict] | None = None,
):
    """Emit agent events and log timing without logging conversation content."""
    logger = logging.getLogger("uvicorn.error")

    started = time.perf_counter()
    first_token_seen = False
    answer = ""
    tool_started: dict[str, float] = {}

    def elapsed() -> float:
        return time.perf_counter() - started

    try:
        logger.info("Agent request started")

        handler = agent.run(
            user_msg=question,
            chat_history=to_chat_history(history or []),
            max_iterations=config.MAX_AGENT_STEPS,
        )

        async for ev in handler.stream_events():
            if isinstance(ev, ToolCall):
                answer = ""
                tool_started[ev.tool_name] = time.perf_counter()

                logger.info(
                    "Agent tool started: %s at %.2fs",
                    ev.tool_name,
                    elapsed(),
                )

                yield AgentEvent(
                    "tool_call",
                    name=ev.tool_name,
                    args=dict(ev.tool_kwargs),
                )

            elif isinstance(ev, ToolCallResult):
                began = tool_started.pop(ev.tool_name, None)

                duration = (
                    time.perf_counter() - began
                    if began is not None
                    else 0.0
                )

                logger.info(
                    "Agent tool finished: %s duration=%.2fs elapsed=%.2fs",
                    ev.tool_name,
                    duration,
                    elapsed(),
                )

                yield AgentEvent(
                    "tool_result",
                    name=ev.tool_name,
                    text=str(ev.tool_output.content)[:6000],
                )

            elif isinstance(ev, AgentStream):
                delta = ev.delta or ""

                if delta and not first_token_seen:
                    first_token_seen = True

                    logger.info(
                        "Agent first text token at %.2fs",
                        elapsed(),
                    )

                answer += delta

                yield AgentEvent(
                    "token",
                    text=clean_text(answer),
                )

        result = await handler

        final_text = clean_text(
            str(result).strip() or answer.strip()
        )

        logger.info(
            "Agent finished in %.2fs; answer_chars=%d",
            elapsed(),
            len(final_text),
        )

        yield AgentEvent("final", text=final_text)

    except Exception as e:
        logger.exception(
            "Agent failed after %.2fs",
            elapsed(),
        )

        yield AgentEvent(
            "error",
            text=friendly_error(e),
            detail=f"{type(e).__name__}: {e}",
        )