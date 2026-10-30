"""Multi-query retriever: rewrite the question into several search queries,
search ChromaDB with each, and merge the results with reciprocal rank fusion.

Try it:  python -m app.retriever "which projects are live?"
"""
import chromadb
from llama_index.core import VectorStoreIndex
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.core.retrievers.fusion_retriever import FUSION_MODES
from llama_index.vector_stores.chroma import ChromaVectorStore

from app import config, llm

QUERY_GEN_PROMPT = (
    "You rewrite a visitor's question into search queries for a developer portfolio "
    "knowledge base (bio, skills, projects, services and pricing, FAQ and contact).\n"
    "Write {num_queries} different search queries, one per line, with no numbering, "
    "no quotes and no commentary.\n"
    "If the question has several parts, give each part its own query. "
    "Otherwise rephrase it using different wording and likely keywords.\n"
    "Question: {query}\n"
    "Queries:\n"
)


def load_index() -> VectorStoreIndex:
    client = chromadb.PersistentClient(path=str(config.CHROMA_DIR))
    collection = client.get_collection(config.COLLECTION_NAME)  # run ingest first
    return VectorStoreIndex.from_vector_store(ChromaVectorStore(chroma_collection=collection))


def build_retriever(index: VectorStoreIndex | None = None, verbose: bool = False) -> QueryFusionRetriever:
    index = index or load_index()
    return QueryFusionRetriever(
        [index.as_retriever(similarity_top_k=config.TOP_K)],
        llm=llm.get_llm(config.GROQ_QUERY_MODEL, config.QUERY_MAX_TOKENS),
        query_gen_prompt=QUERY_GEN_PROMPT,
        mode=FUSION_MODES.RECIPROCAL_RANK,
        similarity_top_k=config.TOP_K,
        num_queries=config.NUM_QUERIES,
        use_async=False,  # avoids event-loop clashes inside Gradio / FastAPI
        verbose=verbose,
    )


if __name__ == "__main__":
    import sys
    import time

    question = " ".join(sys.argv[1:]) or "Which projects are live?"
    llm.configure_embeddings()
    retriever = build_retriever(verbose=True)
    start = time.time()
    results = retriever.retrieve(question)
    print(f"\n{len(results)} chunks in {time.time() - start:.1f}s for: {question}\n")
    for r in results:
        m = r.node.metadata
        text = r.node.get_content(metadata_mode="none").replace("\n", " ")
        print(f"[{r.score:.4f}] {m['category']} | {m['title']} | status={m['status']}")
        print(f"    {text[:220]}...\n")
