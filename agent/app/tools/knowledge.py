"""Agent tool: search the portfolio knowledge base (in-memory BM25, swapped by app.sync)."""
from llama_index.core.tools import FunctionTool


def make_search_tool(store) -> FunctionTool:
    def search_portfolio(query: str) -> str:
        """Search Leo's portfolio knowledge base: his background, skills, projects (with
        live links and whether each is live), services and pricing, availability, FAQ and
        contact details. Pass a short, specific keyword query. If the results miss what
        you need, search again with different keywords."""
        retriever = store.retriever  # read once, so a sync swap mid-request is harmless
        if retriever is None:
            return "The knowledge base is still loading. Ask the visitor to try again in a minute."
        results = retriever.retrieve(query)
        if not results:
            return "No relevant information found. Try different keywords."
        parts = []
        for r in results:
            c = r.chunk
            label = f"{c.category} / {c.title}"
            if c.status != "n/a":
                label += f" / {c.status}"
            parts.append(f"[{label}]\n{c.text.strip()}")
        return "\n\n---\n\n".join(parts)

    return FunctionTool.from_defaults(fn=search_portfolio)