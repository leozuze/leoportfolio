"""Link guard: a link only reaches the visitor if a tool returned that exact link.

The model is told never to invent links, but a prompt is not a guarantee. This
module is the guarantee. During one request, every URL that appears in a tool
result (portfolio search, GitHub tools) is collected. Before any answer text is
sent, links that were never returned by a tool are removed.
"""
import re

# URLs inside tool output. Stops at whitespace, quotes and closing brackets.
_URL_IN_TEXT = re.compile(r"(?:https?://|mailto:|tel:)[^\s<>\"'\)\]]+", re.IGNORECASE)

# [label](url "optional title")
_MD_LINK = re.compile(r"\[([^\]]*)\]\(\s*<?([^)\s>]+)>?[^)]*\)")

# A bare URL in the answer text.
_BARE_URL = re.compile(r"(?:https?://|mailto:|tel:)[^\s<>\"'\)\]]+", re.IGNORECASE)

_TRAILING = ".,;:!?*_`\"'"


def normalise(url: str) -> str:
    """Comparison form: no trailing punctuation or slash, lower case."""
    return url.strip().rstrip(_TRAILING).rstrip("/").lower()


def extract_urls(text: str) -> set[str]:
    """All normalised URLs found in a piece of tool output."""
    return {normalise(match) for match in _URL_IN_TEXT.findall(text or "")}


def hide_unfinished_link(text: str) -> str:
    """While streaming, cut a link that is still being written.

    Without this a half-typed address would flash on screen before it can be
    checked. The complete text is checked again when it arrives.
    """
    index = text.rfind("](")
    if index != -1 and ")" not in text[index:]:
        start = text.rfind("[", 0, index)
        text = text[:start] if start != -1 else text[:index]

    return re.sub(r"(?:https?://|mailto:|tel:)\S*$", "", text, flags=re.IGNORECASE)


def sanitise(text: str, allowed: set[str]) -> tuple[str, int]:
    """Remove links that no tool returned. Returns (clean text, links removed)."""
    removed = 0

    def fix_markdown(match: re.Match) -> str:
        nonlocal removed
        label, url = match.group(1), match.group(2)
        if normalise(url) in allowed:
            return match.group(0)
        removed += 1
        return label  # keep the words, drop the link

    def fix_bare(match: re.Match) -> str:
        nonlocal removed
        if normalise(match.group(0)) in allowed:
            return match.group(0)
        removed += 1
        return ""

    text = _MD_LINK.sub(fix_markdown, text)
    text = _BARE_URL.sub(fix_bare, text)

    if removed:
        text = text.replace("<>", "")
        text = re.sub(r"[ \t]{2,}", " ", text)
        text = re.sub(r"\(\s*\)", "", text)

    return text, removed