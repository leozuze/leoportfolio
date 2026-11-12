"""Dev-only evals: runs every question through the real agent and checks plain-text rules.

    python -m tests.run_eval                      # all questions
    python -m tests.run_eval --only age,contact   # some questions
    python -m tests.run_eval --sleep 15           # slower, kinder to the Groq per-minute limit
    python -m tests.run_eval --show               # print every answer, not just failures

Rules per question (all optional, case-insensitive):
    expect_tools        every tool listed must have been called
    expect_any_tool     at least one of these tools must have been called
    forbid_tools        none of these tools may be called
    must_contain        every string must appear in the answer
    must_contain_any    at least one string must appear   (must_contain_any_2 is a second group)
    must_not_contain    none of these strings may appear
    min_chars / max_chars   answer length bounds

Uses about 2 to 4 Groq requests per question. Exit code is 1 if any question fails.
"""
import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

from app.agent import ask, build_agent
from app.sync import KnowledgeStore

QUESTIONS = Path(__file__).with_name("eval_questions.json")


async def run_one(agent, question: str) -> tuple[str, list[str], str]:
    tools: list[str] = []
    final = ""
    error = ""
    async for ev in ask(agent, question):
        if ev.kind == "tool_call":
            tools.append(ev.name)
        elif ev.kind == "final":
            final = ev.text
        elif ev.kind == "error":
            error = ev.detail or ev.text
    return final, tools, error


def check(case: dict, answer: str, tools: list[str]) -> list[str]:
    problems = []
    low = answer.lower()

    for tool in case.get("expect_tools", []):
        if tool not in tools:
            problems.append(f"tool not used: {tool}")
    wanted = case.get("expect_any_tool")
    if wanted and not any(t in tools for t in wanted):
        problems.append(f"none of these tools used: {', '.join(wanted)}")
    for tool in case.get("forbid_tools", []):
        if tool in tools:
            problems.append(f"forbidden tool used: {tool}")

    for text in case.get("must_contain", []):
        if text.lower() not in low:
            problems.append(f"missing: {text}")
    for key in ("must_contain_any", "must_contain_any_2"):
        options = case.get(key)
        if options and not any(o.lower() in low for o in options):
            problems.append(f"none of: {', '.join(options)}")
    for text in case.get("must_not_contain", []):
        if text.lower() in low:
            problems.append(f"should not contain: {text}")

    if len(answer) < case.get("min_chars", 1):
        problems.append(f"too short ({len(answer)} chars)")
    if len(answer) > case.get("max_chars", 10**9):
        problems.append(f"too long ({len(answer)} chars)")
    return problems


async def main(only: set[str], pause: float, show: bool) -> int:
    cases = json.loads(QUESTIONS.read_text(encoding="utf-8"))
    if only:
        cases = [c for c in cases if c["id"] in only]
    if not cases:
        print("No matching questions.")
        return 1

    store = KnowledgeStore()
    await store.sync("eval")
    if store.retriever is None:
        print("Knowledge index failed to build:", store.last_result)
        return 1
    agent = build_agent(store)

    failed = 0
    for i, case in enumerate(cases):
        started = time.perf_counter()
        answer, tools, error = await run_one(agent, case["question"])
        if error and "rate" in error.lower():
            print(f"   rate limited on {case['id']}, waiting 40 s and retrying once")
            await asyncio.sleep(40)
            answer, tools, error = await run_one(agent, case["question"])

        problems = [f"agent error: {error}"] if error else check(case, answer, tools)
        status = "PASS" if not problems else "FAIL"
        failed += bool(problems)
        print(f"{status}  {case['id']:<28} {time.perf_counter() - started:5.1f}s  tools={tools or '-'}")
        for problem in problems:
            print(f"        - {problem}")
        if problems or show:
            print("        answer: " + answer.replace("\n", "\n                ")[:700])

        if i < len(cases) - 1:
            await asyncio.sleep(pause)

    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="", help="comma separated question ids")
    parser.add_argument("--sleep", type=float, default=10.0, help="seconds between questions")
    parser.add_argument("--show", action="store_true", help="print every answer")
    args = parser.parse_args()
    ids = {s.strip() for s in args.only.split(",") if s.strip()}
    sys.exit(asyncio.run(main(ids, args.sleep, args.show)))