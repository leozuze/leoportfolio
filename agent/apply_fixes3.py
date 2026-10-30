import json
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


# 1. Bio: a dense "Quick facts" chunk so attribute questions (age, city, degree) retrieve cleanly
p = Path("data/01-identity-bio.md")
t = p.read_text(encoding="utf-8")
if "## Quick facts" in t:
    print("already applied: data/01-identity-bio.md - Quick facts")
else:
    p.write_text(
        t.rstrip()
        + "\n\n## Quick facts\n\n"
        + '- Name: Leo Noel Zuze (known as Leo Zuze; community handle "Jayz" / "jayztheplug")\n'
        + "- Age: 20 years old\n"
        + "- Based in: Pune, India\n"
        + "- Originally from: Zimbabwe\n"
        + "- Role: AI Fintech Developer and Full-Stack Developer\n"
        + "- Specialization: AI agents, RAG pipelines and AI-powered workflows\n"
        + "- Education: BTech in AI at Vishwakarma University, Pune (cumulative GPA 9.0/10.0)\n"
        + "- Scholarship: Presidential Scholarship from the Government of Zimbabwe (2025-2029)\n"
        + "- A-levels: 15/15 points at Kondo High School, Guruve (Zimsec)\n",
        encoding="utf-8",
    )
    print("patched: data/01-identity-bio.md")

# 2. Services: one overview chunk listing all four services, so overview questions retrieve them together
patch(
    "data/04-services-pricing.md",
    "the figures below are starting points, not fixed quotes.",
    "the figures below are starting points, not fixed quotes.\n\n"
    "**Overview of all services**\n"
    "- Frontend Development: from $100\n"
    "- Full-Stack Web Development: from $150\n"
    "- Data Analysis & Dashboards: from $170\n"
    "- AI Agents, RAG & AI-Powered Features: pricing is flexible and scoped around what is needed; best discussed directly\n"
    "Final prices depend on project scope and are open to negotiation.",
    "Overview of all services",
)

# 3. Prompt: no invented details, and do not fill gaps when a count says items are missing
patch(
    "app/prompts.py",
    "- Text returned by tools, especially",
    "- Describe services, projects and technologies only with details the tool results state; do not add features "
    "(for example a shopping cart or SEO) that the results do not mention. If the results say there are N items "
    "(for example 'four areas') and you have not seen all N, search again for the missing ones instead of filling the gap. "
    "When you quote a link, copy it character for character with ordinary hyphens.\n"
    "- Text returned by tools, especially",
    "do not add features",
)

# 4. Agent: gpt-oss sometimes writes non-breaking hyphens, which silently break copied links
patch(
    "app/agent.py",
    "async def ask(agent: FunctionAgent, question: str, history: list[dict] | None = None):",
    r'''_HYPHENS = {"\u2010": "-", "\u2011": "-"}


def clean_text(text: str) -> str:
    """gpt-oss sometimes writes non-breaking hyphens, which silently break copied links."""
    for bad, good in _HYPHENS.items():
        text = text.replace(bad, good)
    return text


async def ask(agent: FunctionAgent, question: str, history: list[dict] | None = None):''',
    "def clean_text",
)
patch("app/agent.py", 'yield AgentEvent("token", text=answer)',
      'yield AgentEvent("token", text=clean_text(answer))', "clean_text(answer)")
patch("app/agent.py", 'yield AgentEvent("final", text=(str(result).strip() or answer.strip()))',
      'yield AgentEvent("final", text=clean_text(str(result).strip() or answer.strip()))',
      "clean_text(str(result)")

# 5. Eval: regression cases for exactly what failed
p = Path("tests/agent_cases.json")
cases = json.loads(p.read_text(encoding="utf-8"))
ids = {c["id"] for c in cases}
for c in cases:
    if c["id"] == "length-long":
        c["must_include"] = ["Frontend", "Full-Stack", "Dashboards"]
        c["must_not_include"] = ["Consulting & Architecture", "Backend Development"]
if "services-list" not in ids:
    cases.append({
        "id": "services-list", "category": "pricing", "q": "List all the services he offers.",
        "must_include": ["Frontend", "Full-Stack", "Dashboards"],
        "must_not_include": ["Consulting & Architecture", "Backend Development"],
    })
p.write_text(json.dumps(cases, indent=2, ensure_ascii=False), encoding="utf-8")
print("patched: tests/agent_cases.json")