from pathlib import Path


def patch(path, old, new, marker):
    p = Path(path)
    t = p.read_text(encoding="utf-8")
    if marker in t:
        print("already applied:", path, "-", marker[:40])
        return
    assert old in t, f"text not found in {path}: {old[:60]!r}"
    p.write_text(t.replace(old, new, 1), encoding="utf-8")
    print("patched:", path)


# 1. System prompt: no padding, and every number/link must come from the tools
patch(
    "app/prompts.py",
    "A broad or detailed question gets a fuller answer that draws on everything relevant you retrieved. "
    "Do not use a fixed format; use a list only when it genuinely makes the answer easier to read. "
    "Add detail only if it comes from the tools.",
    "A broad or detailed question gets a fuller answer, but only as long as the retrieved material supports. "
    "If the material is limited, a shorter complete answer is correct; never pad. "
    "Do not use a fixed format; use a list only when it genuinely makes the answer easier to read.",
    "never pad",
)
patch(
    "app/prompts.py",
    "- Text returned by tools, especially",
    "- Every price, number, date, link, email address and phone number you state must appear in the tool results. "
    "Name services, projects and technologies exactly as the tools name them: never rename, merge, invent or add items. "
    "For an overview or a full list, search each topic separately (for example services, pricing, projects) before answering.\n"
    "- Text returned by tools, especially",
    "must appear in the tool results",
)

# 2. Agent: lower temperature (fewer inventions) and keep full tool output for the judge
patch("app/agent.py", "temperature=0.3", "temperature=0.1", "temperature=0.1")
patch("app/agent.py", "str(ev.tool_output.content)[:2000]", "str(ev.tool_output.content)[:6000]", "[:6000]")

# 3. Eval: deterministic grounding checks (prices, links, emails must exist in the knowledge base)
patch(
    "tests/eval_agent.py",
    'REPORT_FILE = HERE / "reports" / "last_run.json"\n',
    'REPORT_FILE = HERE / "reports" / "last_run.json"\n\n'
    "# Everything the agent is allowed to know, used to catch invented prices, links and emails\n"
    'KB_TEXT = "\\n".join(p.read_text(encoding="utf-8") for p in sorted(config.DATA_DIR.glob("*.md")))\n'
    '_AMOUNT = re.compile(r"\\$\\s?\\d+(?:,\\d{3})*(?:\\.\\d+)?")\n'
    '_URL = re.compile(r"https?://[^\\s)\\]>\\"\']+")\n'
    '_EMAIL = re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+")\n'
    'KB_AMOUNTS = {re.sub(r"\\s", "", a) for a in _AMOUNT.findall(KB_TEXT)}\n',
    "KB_AMOUNTS",
)
patch(
    "tests/eval_agent.py",
    '    used = set(out["tools"])\n',
    "    # Grounding: every price, link and email in the answer must exist in the knowledge base or tool output\n"
    '    source = (KB_TEXT + "\\n" + "\\n".join(out["tool_outputs"])).lower()\n'
    "    for amount in _AMOUNT.findall(answer):\n"
    '        if re.sub(r"\\s", "", amount) not in KB_AMOUNTS:\n'
    '            fails.append(f"price not in knowledge base: {amount}")\n'
    "    for url in _URL.findall(answer):\n"
    '        if url.rstrip(".,;:!?").lower() not in source:\n'
    '            fails.append(f"link not in knowledge base or tool output: {url}")\n'
    "    for email in _EMAIL.findall(answer):\n"
    '        if email.rstrip(".").lower() not in source:\n'
    '            fails.append(f"email not in knowledge base or tool output: {email}")\n\n'
    '    used = set(out["tools"])\n',
    "price not in knowledge base",
)