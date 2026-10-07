"""Retrieval-only eval: does the right text come back for each question?

Run:  python tests/run_eval.py
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import llm  # noqa: E402
from app.retriever import build_retriever  # noqa: E402


def main() -> None:
    llm.configure_embeddings()
    retriever = build_retriever()
    cases = json.loads((Path(__file__).parent / "eval_questions.json").read_text(encoding="utf-8"))
    failures = 0
    for case in cases:
        nodes = retriever.retrieve(case["q"])
        text = "\n".join(n.node.get_content(metadata_mode="none") for n in nodes).lower()
        missing = [s for s in case.get("must_contain", []) if s.lower() not in text]
        leaked = [s for s in case.get("must_not_contain", []) if s.lower() in text]
        ok = not missing and not leaked
        failures += 0 if ok else 1
        print(("PASS" if ok else "FAIL"), "-", case["q"])
        if missing:
            print("    missing:", missing)
        if leaked:
            print("    leaked:", leaked)
        time.sleep(2)  # stay well inside the free-tier rate limits
    print(f"\n{len(cases) - failures}/{len(cases)} passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
