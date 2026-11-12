"""Central configuration. Tunable values live here; secrets live in .env."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

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
MAX_AGENT_STEPS = 6    # hard cap on LLM/tool loops per question

# --- GitHub (read-only, public repos only) ---------------------------------
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_USER = os.getenv("GITHUB_USER", "leozuze")
GITHUB_CACHE_SECONDS = 600
GITHUB_README_CHARS = 3000