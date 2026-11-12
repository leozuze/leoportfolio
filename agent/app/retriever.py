"""In-memory BM25 retriever. No embeddings, no vector database, no extra LLM call.

Try it:  python -m app.retriever "which projects are live?"
"""
import math
import re
from collections import Counter
from dataclasses import dataclass

from app import config
from app.ingest import Chunk, load_chunks

TITLE_BOOST = 3  # a title match counts as if the title appeared this many times

_STOPWORDS = frozenset(
    "a an and are as at be by can do does for from has have how i in is it its of on or "
    "that the this to was what when where which who why will with you your he his leo "
    "tell me about".split()
)


def _stem(token: str) -> str:
    """Very light plural stripping so 'projects' matches 'project'."""
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
        return token[:-1]
    return token


def tokenize(text: str) -> list[str]:
    return [
        _stem(t)
        for t in re.findall(r"[a-z0-9]+", text.lower())
        if t not in _STOPWORDS
    ]


@dataclass(frozen=True)
class Result:
    chunk: Chunk
    score: float


class BM25Retriever:
    def __init__(self, chunks: list[Chunk], top_k: int = config.TOP_K,
                 k1: float = 1.5, b: float = 0.75):
        self.chunks = list(chunks)
        self.top_k = top_k
        self.k1 = k1
        self.b = b

        self._tf: list[Counter] = []
        self._len: list[int] = []
        df: Counter = Counter()
        for chunk in self.chunks:
            meta_tokens = tokenize(f"{chunk.category} {chunk.status}")
            tokens = tokenize(chunk.title) * TITLE_BOOST + meta_tokens + tokenize(chunk.text)
            tf = Counter(tokens)
            self._tf.append(tf)
            self._len.append(len(tokens))
            df.update(tf.keys())

        n = len(self.chunks)
        self._avgdl = (sum(self._len) / n) if n else 1.0
        self._idf = {
            term: math.log(1 + (n - d + 0.5) / (d + 0.5)) for term, d in df.items()
        }

    def retrieve(self, query: str) -> list[Result]:
        terms = {t for t in tokenize(query) if t in self._idf}
        if not terms:
            return []

        scored = []
        for i, tf in enumerate(self._tf):
            score = 0.0
            norm = self.k1 * (1 - self.b + self.b * self._len[i] / self._avgdl)
            for term in terms:
                freq = tf.get(term, 0)
                if freq:
                    score += self._idf[term] * freq * (self.k1 + 1) / (freq + norm)
            if score > 0:
                scored.append(Result(self.chunks[i], score))

        scored.sort(key=lambda r: r.score, reverse=True)
        return scored[: self.top_k]


def build_retriever(chunks: list[Chunk] | None = None) -> BM25Retriever:
    return BM25Retriever(chunks if chunks is not None else load_chunks())


if __name__ == "__main__":
    import sys
    import time

    question = " ".join(sys.argv[1:]) or "Which projects are live?"
    retriever = build_retriever()
    start = time.perf_counter()
    results = retriever.retrieve(question)
    ms = (time.perf_counter() - start) * 1000
    print(f"\n{len(results)} chunks in {ms:.1f} ms for: {question}\n")
    for r in results:
        c = r.chunk
        print(f"[{r.score:.3f}] {c.category} | {c.title} | status={c.status}")
        print(f"    {c.text.replace(chr(10), ' ')[:220]}...\n")
