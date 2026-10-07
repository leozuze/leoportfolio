"""Load data/*.md -> split by markdown heading -> tag with metadata -> store in ChromaDB.

Run:  python -m app.ingest
"""
import re
from pathlib import Path

import chromadb
from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import MarkdownNodeParser
from llama_index.vector_stores.chroma import ChromaVectorStore

from app import config, llm

_HEADING = re.compile(r"^#+\s*(.+?)\s*$")


def _body_text(text: str) -> str:
    """Chunk text without heading lines and horizontal rules."""
    lines = [
        ln.strip()
        for ln in text.splitlines()
        if ln.strip() and not ln.lstrip().startswith("#") and ln.strip() != "---"
    ]
    return " ".join(lines)


def _title(text: str) -> str:
    for ln in text.splitlines():
        if ln.strip():
            m = _HEADING.match(ln.strip())
            return m.group(1) if m else ""
    return ""


def _category(file_name: str) -> str:
    """'03-projects.md' -> 'projects'"""
    return re.sub(r"^\d+-", "", Path(file_name).stem)


def _status(category: str, header_path: str, title: str) -> str:
    """Live / not-live tag, only meaningful for the projects file."""
    if category != "projects":
        return "n/a"
    path = f"{header_path} {title}".lower()
    if "not live" in path:
        return "not_live"
    if "live projects" in path:
        return "live"
    return "n/a"


def load_nodes():
    docs = SimpleDirectoryReader(
        input_dir=str(config.DATA_DIR), required_exts=[".md"]
    ).load_data()
    if not docs:
        raise RuntimeError(f"No .md files found in {config.DATA_DIR}")

    nodes = []
    for node in MarkdownNodeParser().get_nodes_from_documents(docs):
        raw = node.get_content(metadata_mode="none")
        if len(_body_text(raw)) < config.MIN_CHUNK_CHARS:
            continue  # heading-only chunk, nothing worth retrieving
        file_name = node.metadata.get("file_name", "")
        category = _category(file_name)
        header_path = node.metadata.get("header_path", "/")
        title = _title(raw)
        node.metadata = {
            "source": file_name,
            "category": category,
            "title": title,
            "header_path": header_path,
            "status": _status(category, header_path, title),
        }
        node.excluded_embed_metadata_keys = ["source"]
        nodes.append(node)

    for node in nodes:
        text = node.get_content(metadata_mode="none").lower()
        for bad in config.FORBIDDEN_IN_CORPUS:
            if bad.lower() in text:
                print(f"WARNING: '{bad}' found in {node.metadata['source']} - fix the markdown file")
    return nodes


def build_index() -> VectorStoreIndex:
    nodes = load_nodes()
    config.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(config.CHROMA_DIR))
    try:
        client.delete_collection(config.COLLECTION_NAME)  # clean rebuild, no duplicates
    except Exception:
        pass
    collection = client.get_or_create_collection(config.COLLECTION_NAME)
    store = ChromaVectorStore(chroma_collection=collection)
    index = VectorStoreIndex(
        nodes, storage_context=StorageContext.from_defaults(vector_store=store)
    )
    counts: dict[str, int] = {}
    for n in nodes:
        counts[n.metadata["source"]] = counts.get(n.metadata["source"], 0) + 1
    for name, count in sorted(counts.items()):
        print(f"  {name}: {count} chunks")
    print(f"Indexed {len(nodes)} chunks into {config.CHROMA_DIR}")
    return index


if __name__ == "__main__":
    llm.configure_embeddings()
    build_index()
