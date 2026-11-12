"""In-memory sliding-window rate limiter (single worker)."""

import time
from collections import defaultdict, deque
from dataclasses import dataclass


@dataclass(frozen=True)
class Rule:
    name: str
    limit: int
    window: float
    per_client: bool


class RateLimiter:
    def __init__(self, rules: list[Rule]):
        self.rules = rules
        # (rule name, key) -> timestamps of recent hits
        self._hits: dict[tuple[str, str], deque] = defaultdict(deque)
        self._last_cleanup = time.monotonic()

    def _prune(self, hits: deque, now: float, window: float) -> None:
        while hits and now - hits[0] >= window:
            hits.popleft()

    def _cleanup(self, now: float) -> None:
        """Drop idle keys so memory doesn't grow with every visitor."""
        if now - self._last_cleanup < 300:
            return
        self._last_cleanup = now
        longest = max(rule.window for rule in self.rules)
        for key in list(self._hits):
            hits = self._hits[key]
            self._prune(hits, now, longest)
            if not hits:
                del self._hits[key]

    def check(self, client: str) -> tuple[bool, float, str]:
        """Returns (allowed, seconds_to_wait, rule_name_that_blocked).

        A request is counted only if every rule allows it, so a blocked
        request doesn't eat into other limits.
        """
        now = time.monotonic()
        self._cleanup(now)

        # First pass: is any rule exhausted?
        for rule in self.rules:
            key = (rule.name, client if rule.per_client else "*")
            hits = self._hits[key]
            self._prune(hits, now, rule.window)
            if len(hits) >= rule.limit:
                wait = rule.window - (now - hits[0])
                return False, max(wait, 0.0), rule.name

        # Second pass: record the hit against every rule.
        for rule in self.rules:
            key = (rule.name, client if rule.per_client else "*")
            self._hits[key].append(now)

        return True, 0.0, ""