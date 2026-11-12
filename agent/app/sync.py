"""Knowledge store with automatic sync.

- Startup: main.py awaits one sync before serving.
- Background loop: checks every SYNC_TICK_SECONDS whether a sync is due. The interval is
  read on every tick, so changing it at runtime applies without a restart.
- Stale check: touch() is called on each chat request. If the last good sync is older than
  the interval, a sync starts in the background. The visitor is never made to wait.
- A sync hashes the content first and stops if nothing changed. Otherwise it builds a new
  index off the event loop and swaps it in with one assignment. Any failure keeps the old index.
"""
import asyncio
import contextlib
import logging
import time
from datetime import datetime, timezone

from app import config
from app.ingest import build_chunks, fingerprint, load_sources
from app.retriever import BM25Retriever

logger = logging.getLogger("uvicorn.error")


def _iso(timestamp: float | None) -> str | None:
    if not timestamp:
        return None
    return datetime.fromtimestamp(timestamp, timezone.utc).isoformat(timespec="seconds")


class KnowledgeStore:
    def __init__(self) -> None:
        self.retriever: BM25Retriever | None = None
        self.content_hash = ""
        self.chunk_count = 0
        self.interval_hours = max(config.SYNC_INTERVAL_HOURS, config.SYNC_MIN_INTERVAL_HOURS)
        self.last_attempt: float | None = None
        self.last_success: float | None = None
        self.last_result = "never synced"
        self._failing = False
        self._lock = asyncio.Lock()
        self._loop_task: asyncio.Task | None = None
        self._background: set[asyncio.Task] = set()

    # -- lifecycle ----------------------------------------------------------

    def start(self) -> None:
        if self._loop_task is None:
            self._loop_task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        tasks = [t for t in (self._loop_task, *self._background) if t is not None]
        for task in tasks:
            task.cancel()
        for task in tasks:
            with contextlib.suppress(asyncio.CancelledError, Exception):
                await task
        self._loop_task = None

    # -- sync ---------------------------------------------------------------

    async def sync(self, reason: str) -> None:
        if self._lock.locked():
            logger.info("Sync skipped (%s): another sync is running", reason)
            return
        async with self._lock:
            self.last_attempt = time.time()
            try:
                sources = await asyncio.to_thread(load_sources)
                digest = await asyncio.to_thread(fingerprint, sources)

                if digest == self.content_hash and self.retriever is not None:
                    self._mark_ok("unchanged")
                    logger.info("Sync (%s): content unchanged", reason)
                    return

                chunks = await asyncio.to_thread(build_chunks, sources)
                retriever = await asyncio.to_thread(BM25Retriever, chunks)

                self.retriever = retriever  # atomic swap; the old index is garbage collected
                self.content_hash = digest
                self.chunk_count = len(chunks)
                self._mark_ok(f"updated ({len(chunks)} chunks)")
                logger.info("Sync (%s): updated, %d chunks", reason, len(chunks))
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                # Never wipe good data on a failed sync.
                self._failing = True
                self.last_result = f"failed: {type(exc).__name__}: {exc}"
                logger.exception("Sync (%s) failed; keeping the previous index", reason)

    def _mark_ok(self, result: str) -> None:
        self.last_success = time.time()
        self.last_result = result
        self._failing = False

    # -- scheduling ---------------------------------------------------------

    def _due(self, now: float) -> bool:
        waited = now - (self.last_attempt or 0)
        if self.retriever is None or self._failing:
            return waited >= config.SYNC_RETRY_SECONDS
        return waited >= self.interval_hours * 3600

    async def _loop(self) -> None:
        while True:
            await asyncio.sleep(config.SYNC_TICK_SECONDS)
            if self._due(time.time()):
                await self.sync("scheduled")

    def touch(self) -> None:
        """Called on each chat request. Starts a background sync if the knowledge is stale."""
        if self._lock.locked():
            return
        now = time.time()
        stale = self.last_success is None or now - self.last_success > self.interval_hours * 3600
        recently_tried = now - (self.last_attempt or 0) < config.SYNC_RETRY_SECONDS
        if stale and not recently_tried:
            task = asyncio.create_task(self.sync("stale"))
            self._background.add(task)
            task.add_done_callback(self._background.discard)

    # -- admin --------------------------------------------------------------

    def set_interval(self, hours: float) -> None:
        self.interval_hours = max(hours, config.SYNC_MIN_INTERVAL_HOURS)

    def status(self) -> dict:
        next_due = None
        if self.last_attempt:
            next_due = _iso(self.last_attempt + self.interval_hours * 3600)
        return {
            "ready": self.retriever is not None,
            "syncing": self._lock.locked(),
            "last_attempt": _iso(self.last_attempt),
            "last_success": _iso(self.last_success),
            "last_result": self.last_result,
            "content_hash": self.content_hash[:12],
            "chunk_count": self.chunk_count,
            "interval_hours": self.interval_hours,
            "next_scheduled_after": next_due,
        }