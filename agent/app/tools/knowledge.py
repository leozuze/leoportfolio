"""Agent tool: search the portfolio knowledge base (ChromaDB via the multi-query retriever)."""
from llama_index.core.tools import FunctionTool


def make_search_tool(retriever) -> FunctionTool:
    def search_portfolio(query: str) -> str:
        """Search Leo's portfolio knowledge base: his background, skills, projects (with
        live links and whether each is live), services and pricing, availability, FAQ and
        contact details. Pass a short, specific search query."""
        nodes = retriever.retrieve(query)
        if not nodes:
            return "No relevant information found."
        parts = []
        for n in nodes:
            m = n.node.metadata
            label = f"{m.get('category', '')} / {m.get('title', '')}"
            if m.get("status", "n/a") != "n/a":
                label += f" / {m['status']}"
            parts.append(f"[{label}]\n{n.node.get_content(metadata_mode='none').strip()}")
        return "\n\n---\n\n".join(parts)

    return FunctionTool.from_defaults(fn=search_portfolio)
