"""Central configuration. Tunable values live here; secrets live in .env."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _csv(name: str, default: str = "") -> tuple[str, ...]:
    return tuple(p.strip() for p in os.getenv(name, default).split(",") if p.strip())


# --- Groq ---------------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
# Final answers and tool use
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
# gpt-oss models are reasoning models; "low" stops them burning tokens on thinking
REASONING_EFFORT = os.getenv("REASONING_EFFORT", "low")

# --- Knowledge ---------------------------------------------------------------
# Projects, services and skills come from the website feed (agent-knowledge.json).
# FEED_SOURCE is a URL (production: https://leozuze.com/agent-knowledge.json)
# or a file path. The default points at the file the website export script writes.
FEED_SOURCE = os.getenv(
    "FEED_SOURCE", str(BASE_DIR.parent / "public" / "agent-knowledge.json")
)
FEED_TIMEOUT_SECONDS = 10

# Hand-written knowledge that does not live in the website data files.
DATA_DIR = BASE_DIR / "data"
MARKDOWN_FILES = ("identity.md", "faq-contact.md")

# --- Sync --------------------------------------------------------------------
# How often the knowledge is re-fetched from the feed. Changeable at runtime
# through PUT /api/sync/interval (held in memory, resets on restart).
SYNC_INTERVAL_HOURS = float(os.getenv("SYNC_INTERVAL_HOURS", "24"))
SYNC_MIN_INTERVAL_HOURS = 1.0
SYNC_TICK_SECONDS = 30     # how often the background loop checks whether a sync is due
SYNC_RETRY_SECONDS = 60    # wait before retrying after a failed sync or before the first success
# A feed with fewer items than this is treated as broken and never replaces the index.
SYNC_MIN_PROJECTS = int(os.getenv("SYNC_MIN_PROJECTS", "3"))
SYNC_MIN_SERVICES = int(os.getenv("SYNC_MIN_SERVICES", "3"))
# Bearer token for the /api/sync endpoints. If empty, those endpoints are disabled.
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

# --- Retrieval -------------------------------------------------------------
TOP_K = int(os.getenv("TOP_K", "6"))

# Text that must never reach the knowledge base. Building the index fails if found.
FORBIDDEN_IN_CORPUS = [
    "leozuzedev.vercel.app",
    "nexus-lending.vercel.app",
    "vishwakarma",
    "gpa",
    "scholarship",
    "a-level",
    "a-levels",
    "years old",
]

# --- Agent -------------------------------------------------------------------
ANSWER_MAX_TOKENS = int(os.getenv("ANSWER_MAX_TOKENS", "1500"))  # a ceiling, not a target
HISTORY_MESSAGES = 6   # past messages resent to the model each turn (limits token use)
HISTORY_MESSAGE_MAX_CHARS = int(os.getenv("HISTORY_MESSAGE_MAX_CHARS", "3000"))
MAX_AGENT_STEPS = 6    # hard cap on LLM/tool loops per question

# --- API ---------------------------------------------------------------------
# Origins allowed to call the API from a browser (comma separated in the env var).
FRONTEND_ORIGINS = tuple(
    origin.rstrip("/")
    for origin in _csv(
        "FRONTEND_ORIGINS",
        "https://leozuze.com,https://www.leozuze.com,"
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173",
    )
)

# Rate limits (in memory, one worker). Per client = per IP address.
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "6"))
RATE_LIMIT_PER_HOUR = int(os.getenv("RATE_LIMIT_PER_HOUR", "40"))
# Across all visitors. The day limit protects the Groq free tier (1000 requests a day,
# and one chat can use several requests).
GLOBAL_PER_MINUTE = int(os.getenv("GLOBAL_PER_MINUTE", "12"))
GLOBAL_PER_DAY = int(os.getenv("GLOBAL_PER_DAY", "250"))
# Chats running at the same time (Groq free tier is 8000 tokens a minute).
MAX_CONCURRENT_CHATS = int(os.getenv("MAX_CONCURRENT_CHATS", "2"))
CHAT_QUEUE_TIMEOUT_SECONDS = 20
# Behind Render's proxy the visitor's IP is in X-Forwarded-For (first entry).
TRUST_FORWARDED_FOR = os.getenv("TRUST_FORWARDED_FOR", "true").lower() in ("1", "true", "yes")
# Minimum gap between streamed "answer" events. The final event is always sent in full.
STREAM_MIN_INTERVAL_SECONDS = float(os.getenv("STREAM_MIN_INTERVAL_SECONDS", "0.05"))

# --- GitHub (read-only, public repos only) ---------------------------------
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_USER = os.getenv("GITHUB_USER", "leozuze")
# Organizations whose membership is private on GitHub (invisible to the API).
# Public memberships are discovered automatically.
GITHUB_EXTRA_ORGS = _csv("GITHUB_EXTRA_ORGS")
# Repositories the bot must never show or discuss. Use "name" or "owner/name".
GITHUB_HIDDEN_REPOS = _csv("GITHUB_HIDDEN_REPOS", "ATO-Shield")
GITHUB_CACHE_SECONDS = 600
GITHUB_ORG_CACHE_SECONDS = 3600   # the list of public organizations changes rarely
GITHUB_CACHE_MAX_ENTRIES = 150
GITHUB_CACHE_MAX_BYTES = 2_000_000
GITHUB_MAX_PARALLEL = 4           # simultaneous requests to api.github.com
GITHUB_README_CHARS = 3000
GITHUB_FILE_CHARS = 4000
GITHUB_MAX_FILE_BYTES = 100_000   # larger files are refused, not downloaded