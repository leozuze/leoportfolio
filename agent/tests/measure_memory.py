"""Dev-only memory probe. Put this in agent/tests/ and run from the agent folder:

    python -m tests.measure_memory

Prints process memory (RSS) after each heavy step so we can see what costs what.
Needs:  pip install psutil   (dev only, not in production requirements)

Note: Windows and Linux report memory a little differently. Treat these numbers as
a guide for what to remove. The final truth is the Render metrics tab.
"""
import asyncio
import os

import psutil

_proc = psutil.Process(os.getpid())
_last = 0.0


def _mb() -> float:
    return _proc.memory_info().rss / 1e6


def step(label: str) -> None:
    global _last
    now = _mb()
    print(f"{label:<40}{now:7.0f} MB   (+{now - _last:4.0f})")
    _last = now


async def _ask_once(agent, question: str) -> str:
    from app.agent import ask

    async for ev in ask(agent, question):
        if ev.kind == "final":
            return f"ok ({len(ev.text)} chars)"
        if ev.kind == "error":
            return f"error: {ev.detail}"
    return "no final event"


def main() -> None:
    step("python + psutil")

    import fastapi  # noqa: F401
    import uvicorn  # noqa: F401
    step("fastapi + uvicorn")

    import llama_index.core  # noqa: F401
    step("llama-index-core")

    from llama_index.core.agent.workflow import FunctionAgent  # noqa: F401
    step("llama-index agent workflow")

    import llama_index.llms.groq  # noqa: F401
    step("llama-index groq")

    import chromadb  # noqa: F401
    step("chromadb import")

    import fastembed  # noqa: F401
    step("fastembed import")

    from app import llm
    from app.agent import build_agent

    llm.configure_embeddings()
    step("embedding model loaded")

    agent = build_agent()
    step("agent + retriever built")

    print("  ->", asyncio.run(_ask_once(agent, "What services does Leo offer and what do they cost?")))
    step("after first question")

    print("  ->", asyncio.run(_ask_once(agent, "Which of his projects are live?")))
    step("after second question")

    peak = getattr(_proc.memory_info(), "peak_wset", None)  # Windows only
    if peak:
        print(f"\nPeak working set: {peak / 1e6:.0f} MB")
    print(f"Final RSS: {_mb():.0f} MB  (budget: 512 MB, target: under 350 MB)")


if __name__ == "__main__":
    main()