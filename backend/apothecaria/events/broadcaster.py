from __future__ import annotations

import asyncio
from typing import Any


class Broadcaster:
    """In-memory pub/sub for WebSocket fan-out. One queue per subscriber."""

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        q: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
        self._subscribers.add(q)
        return q

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(queue)

    async def publish(self, event: dict[str, Any]) -> None:
        for q in list(self._subscribers):
            await q.put(event)


broadcaster = Broadcaster()
