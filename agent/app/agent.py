"""The portfolio agent: a LlamaIndex FunctionAgent with a knowledge-base tool and GitHub tools."""
from dataclasses import dataclass, field

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
        llm=llm.get_llm(config.GROQ_MODEL, config.ANSWER_MAX_TOKENS, temperature=0.3),
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


async def ask(agent: FunctionAgent, question: str, history: list[dict] | None = None):
    """Async generator of AgentEvent. The last event is 'final' or 'error'."""
    answer = ""
    try:
        handler = agent.run(
            user_msg=question,
            chat_history=to_chat_history(history or []),
            max_iterations=config.MAX_AGENT_STEPS,
        )
        async for ev in handler.stream_events():
            if isinstance(ev, ToolCall):
                answer = ""  # drop any preamble the model wrote before calling a tool
                yield AgentEvent("tool_call", name=ev.tool_name, args=dict(ev.tool_kwargs))
            elif isinstance(ev, ToolCallResult):
                yield AgentEvent(
                    "tool_result", name=ev.tool_name, text=str(ev.tool_output.content)[:2000]
                )
            elif isinstance(ev, AgentStream):
                answer += ev.delta or ""
                yield AgentEvent("token", text=answer)
        result = await handler
        yield AgentEvent("final", text=(str(result).strip() or answer.strip()))
    except Exception as e:  # noqa: BLE001 - surface any failure to the UI
        yield AgentEvent("error", text=friendly_error(e), detail=f"{type(e).__name__}: {e}")
