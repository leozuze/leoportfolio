"""Model setup: Groq for text generation. Retrieval is BM25, so no embedding model is needed."""
from llama_index.llms.groq import Groq

from app import config


def get_llm(model: str, max_tokens: int, temperature: float = 0.1) -> Groq:
    if not config.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is missing. Add it to agent/.env")
    extra = {}
    if "gpt-oss" in model:  # only reasoning models accept this parameter
        extra["additional_kwargs"] = {"reasoning_effort": config.REASONING_EFFORT}
    return Groq(
        model=model,
        api_key=config.GROQ_API_KEY,
        max_tokens=max_tokens,
        temperature=temperature,
        context_window=32768,  # LlamaIndex defaults to 3900 for OpenAI-compatible LLMs
        **extra,
    )