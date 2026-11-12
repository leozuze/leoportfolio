"""Dev-only: does the model drop spaces when it repeats text exactly?

    python -m tests.probe_spacing                         # uses GROQ_MODEL
    python -m tests.probe_spacing llama-3.3-70b-versatile # compare another model

Calls Groq directly (no LlamaIndex). Runs each mode several times and prints every place
where the output differs from the original text.
"""
import asyncio
import difflib
import json
import sys

import httpx

from app import config

URL = "https://api.groq.com/openai/v1/chat/completions"
RUNS = 4
PAUSE = 4  # seconds between calls, kind to the per-minute token limit

TEXT = (
    "Showcases the builder’s portfolio and lets customers request quotes online, with a "
    "private admin dashboard for managing enquiries. Helps users find flights, track price "
    "changes and see live airport arrival and departure boards, with automated email alerts. "
    "Presents the agency’s services, case studies and a creative showcase, making it easy for "
    "business owners to see what they can offer. Provides small manufacturers a single place "
    "to track production, orders, inventory and profit, plus an AI chatbot assistant. A modern "
    "landing page that explains fast approvals and transparent terms, guiding visitors toward "
    "applying for a loan. Feel free to explore any of these links, and let me know if you’d "
    "like more details about a particular project or how Leo can help with a similar solution."
)


def payload(model: str, stream: bool) -> dict:
    body = {
        "model": model,
        "stream": stream,
        "temperature": 0,
        "max_tokens": 800,
        "messages": [
            {"role": "system", "content": "Repeat the user's text exactly, character for character. Output only that text."},
            {"role": "user", "content": TEXT},
        ],
    }
    if "gpt-oss" in model:
        body["reasoning_effort"] = config.REASONING_EFFORT
    return body


async def run(client: httpx.AsyncClient, model: str, stream: bool) -> str:
    headers = {"Authorization": f"Bearer {config.GROQ_API_KEY}"}
    if not stream:
        r = await client.post(URL, json=payload(model, False), headers=headers, timeout=60)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"] or ""
    out = []
    async with client.stream("POST", URL, json=payload(model, True), headers=headers, timeout=60) as r:
        r.raise_for_status()
        async for line in r.aiter_lines():
            if not line.startswith("data: "):
                continue
            data = line[6:]
            if data == "[DONE]":
                break
            delta = json.loads(data)["choices"][0]["delta"].get("content") or ""
            out.append(delta)
    return "".join(out)


def report(label: str, got: str) -> bool:
    got = got.strip()
    if got == TEXT:
        print(f"  {label}: exact")
        return True
    print(f"  {label}: DIFFERS")
    sm = difflib.SequenceMatcher(None, TEXT, got, autojunk=False)
    shown = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "equal" and shown < 6:
            print(f"     {tag}: expected {TEXT[max(0, i1 - 12):i2 + 12]!r}  got {got[max(0, j1 - 12):j2 + 12]!r}")
            shown += 1
    return False


async def main(model: str) -> None:
    if not config.GROQ_API_KEY:
        raise SystemExit("GROQ_API_KEY missing in agent/.env")
    print(f"model: {model}, {RUNS} runs per mode")
    bad = {"stream": 0, "non-stream": 0}
    async with httpx.AsyncClient() as client:
        for mode, stream in (("stream", True), ("non-stream", False)):
            for i in range(RUNS):
                got = await run(client, model, stream)
                if not report(f"{mode} #{i + 1}", got):
                    bad[mode] += 1
                await asyncio.sleep(PAUSE)
    print(f"\nmismatches: stream {bad['stream']}/{RUNS}, non-stream {bad['non-stream']}/{RUNS}")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else config.GROQ_MODEL))