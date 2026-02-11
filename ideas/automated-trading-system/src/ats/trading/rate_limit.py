from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field


@dataclass
class SlidingWindowRateLimiter:
    """
    Simple per-key sliding-window limiter.
    Intended for OMS-level protection against order spam in race conditions.
    """

    max_events: int
    window_s: float
    _events: dict[str, deque[float]] = field(default_factory=dict)

    def allow(self, key: str, now_s: float | None = None) -> bool:
        if now_s is None:
            now_s = time.time()
        q = self._events.setdefault(key, deque())
        cutoff = now_s - self.window_s
        while q and q[0] < cutoff:
            q.popleft()
        if len(q) >= self.max_events:
            return False
        q.append(now_s)
        return True

