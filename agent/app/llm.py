"""Model setup: Groq for text generation, FastEmbed (local) for embeddings."""
from fastembed import TextEmbedding
from llama_index.core import Settings
from llama_index.core.base.embeddings.base import BaseEmbedding
from llama_index.core.bridge.pydantic import PrivateAttr
from llama_index.llms.groq import Groq

from app import config


class FastEmbedEmbedding(BaseEmbedding):
    """Thin LlamaIndex wrapper around the fastembed library."""

    _model: TextEmbedding = PrivateAttr()

    def __init__(self, model_name: str = config.EMBED_MODEL, **kwargs):
        super().__init__(model_name=model_name, **kwargs)
        config.EMBED_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self._model = TextEmbedding(
            model_name=model_name, cache_dir=str(config.EMBED_CACHE_DIR)
        )

    def _get_query_embedding(self, query: str) -> list[float]:
        return next(iter(self._model.query_embed(query))).tolist()

    def _get_text_embedding(self, text: str) -> list[float]:
        return next(iter(self._model.embed([text]))).tolist()

    def _get_text_embeddings(self, texts: list[str]) -> list[list[float]]:
        return [vec.tolist() for vec in self._model.embed(texts)]

    async def _aget_query_embedding(self, query: str) -> list[float]:
        return self._get_query_embedding(query)

    async def _aget_text_embedding(self, text: str) -> list[float]:
        return self._get_text_embedding(text)


def configure_embeddings() -> None:
    """Needed by ingest and retrieval. Does not need a Groq key."""
    Settings.embed_model = FastEmbedEmbedding()


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
