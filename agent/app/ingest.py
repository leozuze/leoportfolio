"""Build knowledge chunks from the website feed and the hand-written markdown files.

Nothing is stored on disk. The retriever builds its index in memory from these chunks.

Stages (used by app.sync):
    load_sources()   read the raw feed text and the md files
    fingerprint()    content hash, ignores the feed's generatedAt timestamp
    build_chunks()   validate and turn the sources into chunks

Check the chunks:  python -m app.ingest
"""
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path

import httpx

from app import config

MIN_CHUNK_CHARS = 40  # skip heading-only markdown sections


@dataclass(frozen=True)
class Chunk:
    text: str
    category: str       # projects | services | skills | identity | faq-contact | ...
    title: str
    status: str = "n/a"  # live | not_live for projects, n/a otherwise
    source: str = ""     # feed or md file name


@dataclass(frozen=True)
class Sources:
    feed_text: str
    markdown: dict  # file name -> text


# ---------------------------------------------------------------------------
# Loading and validation
# ---------------------------------------------------------------------------

def _fetch_feed_text() -> str:
    source = str(config.FEED_SOURCE)
    if source.startswith(("http://", "https://")):
        response = httpx.get(
            source, timeout=config.FEED_TIMEOUT_SECONDS, follow_redirects=True
        )
        response.raise_for_status()
        return response.text
    return Path(source).read_text(encoding="utf-8")


def load_sources() -> Sources:
    markdown = {
        name: (config.DATA_DIR / name).read_text(encoding="utf-8")
        for name in config.MARKDOWN_FILES
    }
    return Sources(feed_text=_fetch_feed_text(), markdown=markdown)


def parse_feed(feed_text: str) -> dict:
    """Parse and sanity-check the feed. A broken feed must never replace a good index."""
    feed = json.loads(feed_text)
    if not isinstance(feed, dict):
        raise ValueError("Feed must be a JSON object")
    projects = feed.get("projects") or []
    services = feed.get("services") or []
    if len(projects) < config.SYNC_MIN_PROJECTS:
        raise ValueError(
            f"Feed has {len(projects)} projects, expected at least {config.SYNC_MIN_PROJECTS}"
        )
    if len(services) < config.SYNC_MIN_SERVICES:
        raise ValueError(
            f"Feed has {len(services)} services, expected at least {config.SYNC_MIN_SERVICES}"
        )
    return feed


def fingerprint(sources: Sources) -> str:
    """Hash of the content that matters. generatedAt changes on every export, so it is ignored."""
    feed = json.loads(sources.feed_text)
    if isinstance(feed, dict):
        feed.pop("generatedAt", None)
    digest = hashlib.sha256()
    digest.update(json.dumps(feed, sort_keys=True, ensure_ascii=False).encode("utf-8"))
    for name in sorted(sources.markdown):
        digest.update(name.encode("utf-8"))
        digest.update(sources.markdown[name].encode("utf-8"))
    return digest.hexdigest()


# ---------------------------------------------------------------------------
# Feed chunks
# ---------------------------------------------------------------------------

def _clean(value) -> str:
    return re.sub(r"\s+", " ", str(value)).strip() if value else ""


def _is_live(p: dict) -> bool:
    return (p.get("status") or "live").lower() == "live"


def _project_chunk(p: dict) -> Chunk:
    title = _clean(p.get("title"))
    live = _is_live(p)
    lines = [f"Project: {title}"]
    if p.get("category"):
        sub = f" / {_clean(p['subCategory'])}" if p.get("subCategory") else ""
        lines.append(f"Category: {_clean(p['category'])}{sub}")
    lines.append("Status: live" if live else "Status: not live yet (no link)")
    if p.get("tagline"):
        lines.append(f"Summary: {_clean(p['tagline'])}")
    if p.get("description"):
        lines.append(f"Description: {_clean(p['description'])}")
    if p.get("stack"):
        stack = p["stack"]
        lines.append("Technologies: " + (", ".join(stack) if isinstance(stack, list) else _clean(stack)))
    if p.get("github"):
        lines.append(f"GitHub repository name: {_clean(p['github'])}")
    if p.get("aliases"):
        aliases = p["aliases"]
        lines.append("Also known as: " + (", ".join(aliases) if isinstance(aliases, list) else _clean(aliases)))
    if live and p.get("url"):
        lines.append(f"Link: {_clean(p['url'])}")
    return Chunk("\n".join(lines), "projects", title, "live" if live else "not_live", "feed")


def _service_chunk(s: dict) -> Chunk:
    title = _clean(s.get("title"))
    lines = [f"Service: {title}"]
    if s.get("tagline"):
        lines.append(f"Summary: {_clean(s['tagline'])}")
    if s.get("description"):
        lines.append(f"Description: {_clean(s['description'])}")
    if s.get("features"):
        lines.append("Includes: " + "; ".join(_clean(f) for f in s["features"]))
    if s.get("price"):
        lines.append(f"Price: {_clean(s['price'])}")
    if s.get("priceNote"):
        lines.append(f"Pricing note: {_clean(s['priceNote'])}")
    return Chunk("\n".join(lines), "services", title, "n/a", "feed")


def _skill_chunk(c: dict) -> Chunk:
    title = _clean(c.get("title"))
    lines = [f"Skill category: {title}"]
    if c.get("tagline"):
        lines.append(f"Summary: {_clean(c['tagline'])}")
    for skill in c.get("skills", []):
        detail = f": {_clean(skill['detail'])}" if skill.get("detail") else ""
        lines.append(f"- {_clean(skill.get('name'))}{detail}")
    return Chunk("\n".join(lines), "skills", title, "n/a", "feed")


def _overview_line(item: dict, extra: str = "") -> str:
    """'Title (extra): tagline' with empty parts left out."""
    line = _clean(item.get("title"))
    if extra:
        line += f" ({extra})"
    if item.get("tagline"):
        line += f": {_clean(item['tagline'])}"
    return line


def feed_chunks(feed: dict) -> list[Chunk]:
    projects = feed.get("projects", [])
    services = feed.get("services", [])
    categories = feed.get("skillCategories", [])

    chunks = [_project_chunk(p) for p in projects]
    chunks += [_service_chunk(s) for s in services]
    chunks += [_skill_chunk(c) for c in categories]

    # Overview chunks are self-contained: one search returns every item with its summary,
    # so the model never has to fill gaps.
    live = [p for p in projects if _is_live(p)]
    if projects:
        lines = "\n".join(
            "- " + _overview_line(p, _clean(p.get("category"))) for p in projects
        )
        chunks.append(Chunk(
            f"Projects overview: Leo has {len(projects)} projects, {len(live)} of them live.\n{lines}",
            "projects", "Projects overview", "n/a", "feed",
        ))
    if services:
        lines = "\n".join(
            "- " + _overview_line(s, f"starting at {_clean(s['price'])}" if s.get("price") else "")
            for s in services
        )
        chunks.append(Chunk(
            f"Services overview and pricing: Leo offers {len(services)} services.\n{lines}",
            "services", "Services overview", "n/a", "feed",
        ))
    if categories:
        lines = "\n".join(
            f"- {_clean(c.get('title'))}: " + ", ".join(_clean(s.get("name")) for s in c.get("skills", []))
            for c in categories
        )
        chunks.append(Chunk(
            f"Skills overview: {len(categories)} skill categories.\n{lines}",
            "skills", "Skills overview", "n/a", "feed",
        ))
    return chunks


# ---------------------------------------------------------------------------
# Markdown chunks (identity and FAQ, hand-written)
# ---------------------------------------------------------------------------

_HEADING = re.compile(r"^(#+)\s*(.+?)\s*$")


def _category(file_name: str) -> str:
    """'01-identity.md' -> 'identity'"""
    return re.sub(r"^\d+-", "", Path(file_name).stem)


def markdown_chunks(name: str, text: str) -> list[Chunk]:
    category = _category(name)
    sections: list[tuple[str, list[str]]] = [("", [])]
    for line in text.splitlines():
        match = _HEADING.match(line.strip())
        if match:
            sections.append((match.group(2), []))
        elif line.strip() and line.strip() != "---":
            sections[-1][1].append(line.strip())

    chunks = []
    for title, body in sections:
        joined = " ".join(body)
        if len(joined) < MIN_CHUNK_CHARS:
            continue
        content = f"{title}\n{joined}" if title else joined
        chunks.append(Chunk(content, category, title, "n/a", name))
    return chunks


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def _check_forbidden(chunks: list[Chunk]) -> None:
    for bad in config.FORBIDDEN_IN_CORPUS:
        pattern = re.compile(rf"(?<!\w){re.escape(bad)}(?!\w)", re.IGNORECASE)
        for chunk in chunks:
            if pattern.search(chunk.text):
                raise RuntimeError(
                    f"Forbidden text '{bad}' found in {chunk.source} / {chunk.title}. "
                    "Fix the source and rebuild."
                )


def build_chunks(sources: Sources) -> list[Chunk]:
    chunks = feed_chunks(parse_feed(sources.feed_text))
    for name, text in sources.markdown.items():
        chunks += markdown_chunks(name, text)
    if not chunks:
        raise RuntimeError("No knowledge chunks were built")
    _check_forbidden(chunks)
    return chunks


def load_chunks() -> list[Chunk]:
    return build_chunks(load_sources())


if __name__ == "__main__":
    all_chunks = load_chunks()
    counts: dict[str, int] = {}
    for c in all_chunks:
        counts[c.category] = counts.get(c.category, 0) + 1
    for name, count in sorted(counts.items()):
        print(f"  {name}: {count} chunks")
    print(f"{len(all_chunks)} chunks built from {config.FEED_SOURCE}")