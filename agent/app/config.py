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
# Small, fast model that rewrites the visitor's question into search queries
GROQ_QUERY_MODEL = os.getenv("GROQ_QUERY_MODEL", "openai/gpt-oss-20b")
# gpt-oss models are reasoning models; "low" stops them burning tokens on thinking
REASONING_EFFORT = os.getenv("REASONING_EFFORT", "low")

# --- Embeddings (local, because Groq has no embeddings endpoint) ----------
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-small-en-v1.5")
EMBED_CACHE_DIR = BASE_DIR / ".cache" / "fastembed"

# --- Storage ---------------------------------------------------------------
DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "storage" / "chroma"
COLLECTION_NAME = "portfolio"

# --- Retrieval -------------------------------------------------------------
TOP_K = int(os.getenv("TOP_K", "4"))
NUM_QUERIES = int(os.getenv("NUM_QUERIES", "3"))  # original + (NUM_QUERIES - 1) rewrites
QUERY_MAX_TOKENS = 512  # room for reasoning tokens plus a few short queries
MIN_CHUNK_CHARS = 40    # drop heading-only chunks

# Strings that must never appear in the knowledge base (ingest warns if they do)
FORBIDDEN_IN_CORPUS = ["nexus-lending.vercel.app"]

# --- Agent -------------------------------------------------------------------
ANSWER_MAX_TOKENS = int(os.getenv("ANSWER_MAX_TOKENS", "1500"))  # a ceiling, not a target
HISTORY_MESSAGES = 6   # past messages resent to the model each turn (limits token use)
MAX_AGENT_STEPS = 6    # hard cap on LLM/tool loops per question

# --- GitHub (read-only, public repos only) ---------------------------------
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_USER = os.getenv("GITHUB_USER", "leozuze")
GITHUB_CACHE_SECONDS = 600
GITHUB_README_CHARS = 3000
