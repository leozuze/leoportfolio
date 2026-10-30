"""End-to-end agent eval: real questions -> real agent -> checks on the FINAL answers.

Run:
  python tests/eval_agent.py                       # all cases (about 100 Groq requests)
  python tests/eval_agent.py --only nexus,pricing  # by category or case id
  python tests/eval_agent.py --judge               # also fact-check answers against the retrieved context
  python tests/eval_agent.py --runs 2              # repeat each case (answers vary run to run)
  python tests/eval_agent.py --skip-github         # skip cases that need live GitHub

A full report (answers, tools used, tool output) is written to tests/reports/last_run.json.
Add or edit cases in tests/agent_cases.json.
"""
import argparse
import asyncio
import json
import re
import sys
import time
from collections import defaultdict
from contextlib import nullcontext
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import config, llm  # noqa: E402
from app.agent import ask, build_agent  # noqa: E402
from app.tools import github  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = Path(__file__).parent
CASES_FILE = HERE / "agent_cases.json"
REPORT_FILE = HERE / "reports" / "last_run.json"

# Everything the agent is allowed to know, used to catch invented prices, links and emails
KB_TEXT = "\n".join(p.read_text(encoding="utf-8") for p in sorted(config.DATA_DIR.glob("*.md")))
_AMOUNT = re.compile(r"\$\s?\d+(?:,\d{3})*(?:\.\d+)?")
_URL = re.compile(r"https?://[^\s)\]>\"']+")
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
KB_AMOUNTS = {re.sub(r"\s", "", a) for a in _AMOUNT.findall(KB_TEXT)}


def fake_github_get(readme: str):
    """Canned GitHub responses so the README-injection case needs no network."""
    repo = {
        "name": "skyscout",
        "description": "Travel exploration app",
        "stargazers_count": 1,
        "pushed_at": "2026-09-01T00:00:00Z",
        "html_url": "https://github.com/leozuze/skyscout",
        "topics": [],
    }

    def _fake(path, *, raw=False, params=None):
        if path.endswith("/readme"):
            return readme
        if path.endswith("/languages"):
            return json.dumps({"Python": 7000, "JavaScript": 3000})
        if path.endswith("/repos"):
            return json.dumps([{**repo, "fork": False, "language": "Python"}])
        return json.dumps(repo)

    return _fake


async def run_case(agent, case: dict) -> dict:
    out = {"answer": "", "tools": [], "tool_outputs": [], "error": "", "seconds": 0.0}
    if "mock_github_readme" in case:
        patcher = patch.object(github, "_get", fake_github_get(case["mock_github_readme"]))
    else:
        patcher = nullcontext()
    started = time.time()
    with patcher:
        for attempt in range(2):
            out.update(answer="", tools=[], tool_outputs=[], error="")
            busy = False
            async for ev in ask(agent, case["q"], case.get("history")):
                if ev.kind == "tool_call":
                    out["tools"].append(ev.name)
                elif ev.kind == "tool_result":
                    out["tool_outputs"].append(ev.text)
                elif ev.kind == "final":
                    out["answer"] = ev.text
                elif ev.kind == "error":
                    out["error"] = ev.detail or ev.text
                    busy = "busy" in ev.text
            if busy and attempt == 0:
                print("    rate limited - waiting 60s, then retrying once...")
                await asyncio.sleep(60)
                continue
            break
    out["seconds"] = round(time.time() - started, 1)
    return out


def check(case: dict, out: dict) -> list[str]:
    """Deterministic checks. Returns a list of failure reasons (empty = pass)."""
    if out["error"]:
        return [f"agent error: {out['error']}"]
    fails: list[str] = []
    answer = out["answer"]
    low = answer.lower()
    if not answer.strip():
        return ["empty answer"]

    for s in case.get("must_include", []):
        if s.lower() not in low:
            fails.append(f"missing: {s!r}")
    for group in case.get("any_of", []):
        if not any(s.lower() in low for s in group):
            fails.append(f"none of these appear: {group}")
    for s in case.get("must_not_include", []):
        if s.lower() in low:
            fails.append(f"forbidden text present: {s!r}")
    for rx in case.get("must_not_regex", []):
        m = re.search(rx, answer)
        if m:
            fails.append(f"forbidden pattern matched: {m.group(0)!r}")

    # Grounding: every price, link and email in the answer must exist in the knowledge base or tool output
    source = (KB_TEXT + "\n" + "\n".join(out["tool_outputs"])).lower()
    for amount in _AMOUNT.findall(answer):
        if re.sub(r"\s", "", amount) not in KB_AMOUNTS:
            fails.append(f"price not in knowledge base: {amount}")
    for url in _URL.findall(answer):
        if url.rstrip(".,;:!?").lower() not in source:
            fails.append(f"link not in knowledge base or tool output: {url}")
    for email in _EMAIL.findall(answer):
        if email.rstrip(".").lower() not in source:
            fails.append(f"email not in knowledge base or tool output: {email}")

    used = set(out["tools"])
    for t in case.get("tools_called", []):
        if t not in used:
            fails.append(f"tool not called: {t}")
    if case.get("tools_any") and not used & set(case["tools_any"]):
        fails.append(f"expected one of these tools: {case['tools_any']}, got {sorted(used) or 'none'}")
    for t in case.get("tools_not_called", []):
        if t == "*" and used:
            fails.append(f"no tools expected, but called: {sorted(used)}")
        elif t in used:
            fails.append(f"tool should not be called: {t}")

    words = len(answer.split())
    if "max_words" in case and words > case["max_words"]:
        fails.append(f"too long: {words} words (max {case['max_words']})")
    if "min_words" in case and words < case["min_words"]:
        fails.append(f"too short: {words} words (min {case['min_words']})")
    return fails


def judge(case: dict, out: dict) -> list[str]:
    """Groundedness check by a second LLM. Noisy, so results are warnings to review, not failures."""
    if out["error"] or not out["tool_outputs"] or not out["answer"].strip():
        return []
    context = "\n\n=====\n\n".join(out["tool_outputs"])[:6000]
    prompt = (
        "You are a strict fact-checker for a retrieval-based assistant.\n"
        "The CONTEXT is the only allowed source of facts about the person.\n\n"
        f"QUESTION: {case['q']}\n\nCONTEXT:\n{context}\n\nANSWER:\n{out['answer']}\n\n"
        "List every factual claim in the ANSWER that is not supported by the CONTEXT. "
        "Greetings, and statements that information is unavailable, are fine.\n"
        'Reply with JSON only, like {"unsupported": ["claim 1", "claim 2"]}. '
        'Use {"unsupported": []} if everything is supported.'
    )
    try:
        text = llm.get_llm(config.GROQ_QUERY_MODEL, 800).complete(prompt).text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return ["judge returned no JSON"]
        data = json.loads(match.group(0))
        return [f"unsupported claim: {c}" for c in data.get("unsupported", [])]
    except Exception as e:  # noqa: BLE001
        return [f"judge failed ({type(e).__name__})"]


def parse_args(argv=None):
    p = argparse.ArgumentParser(description="End-to-end agent eval")
    p.add_argument("--only", help="comma-separated case ids or categories")
    p.add_argument("--runs", type=int, default=1, help="repeat each case N times")
    p.add_argument("--delay", type=float, default=25, help="seconds between runs (free-tier token limits)")
    p.add_argument("--judge", action="store_true", help="LLM groundedness check (warnings only)")
    p.add_argument("--skip-github", action="store_true", help="skip cases that need live GitHub")
    return p.parse_args(argv)


async def run(args) -> int:
    cases = json.loads(CASES_FILE.read_text(encoding="utf-8"))
    if args.only:
        wanted = {s.strip() for s in args.only.split(",")}
        cases = [c for c in cases if c["id"] in wanted or c["category"] in wanted]
    if args.skip_github:
        cases = [c for c in cases if not c.get("needs_github")]
    if not cases:
        print("No cases selected.")
        return 1

    llm.configure_embeddings()
    agent = build_agent()
    total_runs = len(cases) * args.runs
    print(f"Running {len(cases)} cases x {args.runs} run(s), ~{args.delay:.0f}s apart.\n")

    report, done = [], 0
    for case in cases:
        runs = []
        for _ in range(args.runs):
            done += 1
            out = await run_case(agent, case)
            fails = check(case, out)
            warns = judge(case, out) if args.judge else []
            runs.append({**out, "fails": fails, "warnings": warns})
            status = "PASS" if not fails else "FAIL"
            tools = ",".join(out["tools"]) or "no tools"
            print(f"{status} [{case['category']}] {case['id']} ({out['seconds']}s, {len(out['answer'].split())} words, {tools})")
            for f in fails:
                print(f"      - {f}")
            for w in warns:
                print(f"      ? {w}")
            if done < total_runs:
                await asyncio.sleep(args.delay)
        passed = sum(1 for r in runs if not r["fails"])
        report.append({"case": case, "passed_runs": passed, "runs": runs})

    by_cat = defaultdict(lambda: [0, 0])
    for item in report:
        by_cat[item["case"]["category"]][1] += 1
        by_cat[item["case"]["category"]][0] += item["passed_runs"] == len(item["runs"])
    print("\nSummary by category (cases where every run passed):")
    for cat, (ok, n) in sorted(by_cat.items()):
        print(f"  {cat:10} {ok}/{n}")
    ok_total = sum(v[0] for v in by_cat.values())
    n_total = sum(v[1] for v in by_cat.values())
    print(f"\nOverall: {ok_total}/{n_total} cases passed")

    REPORT_FILE.parent.mkdir(exist_ok=True)
    REPORT_FILE.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Full report with answers: {REPORT_FILE}")
    return 0 if ok_total == n_total else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(run(parse_args())))