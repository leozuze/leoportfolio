"""Dev-only: run the GitHub tools directly and print their output.

    python -m tests.try_github                 # uses Flight-Finder as the sample repo
    python -m tests.try_github some-repo-name
"""
import asyncio
import sys

from app.tools import github as g


async def main(repo: str) -> None:
    checks = [
        ("github_overview", g.github_overview()),
        ("list_github_repos", g.list_github_repos()),
        ("list_github_repos query=flight", g.list_github_repos(query="flight")),
        (f"get_github_repo {repo}", g.get_github_repo(repo)),
        (f"read_github_file {repo} (root folder)", g.read_github_file(repo, "")),
        (f"read_github_file {repo} README.md", g.read_github_file(repo, "README.md")),
        ("github_recent_activity", g.github_recent_activity()),
        ("blocked owner", g.list_github_repos(owner="torvalds")),
        ("blocked file", g.read_github_file(repo, ".env")),
        ("path traversal", g.read_github_file(repo, "../etc/passwd")),
        ("missing repo", g.get_github_repo("does-not-exist-xyz")),
    ]
    for label, coro in checks:
        print(f"\n===== {label} =====")
        print(await coro)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "Flight-Finder"))