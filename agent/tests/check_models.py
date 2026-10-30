import os
import httpx
from dotenv import load_dotenv

load_dotenv()
KEY = os.environ["GROQ_API_KEY"]
URL = "https://api.groq.com/openai/v1/chat/completions"
CANDIDATES = [
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]
TOOLS = [{
    "type": "function",
    "function": {
        "name": "get_repo_readme",
        "description": "Fetch the README of one of the owner's GitHub repos",
        "parameters": {
            "type": "object",
            "properties": {"repo": {"type": "string"}},
            "required": ["repo"],
        },
    },
}]

for model in CANDIDATES:
    r = httpx.post( 
        URL,
        headers={"Authorization": f"Bearer {KEY}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": "Show me the README of the skyscout repo"}],
            "tools": TOOLS,
            "max_tokens": 600,
        },
        timeout=30,
    )
    tool_called = None
    if r.status_code == 200:
        tool_called = bool(r.json()["choices"][0]["message"].get("tool_calls"))
    h = r.headers
    print(
        f"{model:28} status={r.status_code} tool_call={tool_called} "
        f"RPD={h.get('x-ratelimit-limit-requests')} TPM={h.get('x-ratelimit-limit-tokens')}"
    )
    if r.status_code != 200:
        print("   ", r.text[:200])