from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, Literal, Optional

EventType = Literal["PLACE", "CANCEL"]


@dataclass
class FlipFlopDetector:
    """
    Detects suspicious place/cancel flip-flopping patterns.

    Heuristic:
    - Count "pairs" where a CANCEL happens shortly after a PLACE.
    - If pairs exceed threshold inside a window, trigger a halt.
    """

    window_s: float = 60.0
    pair_max_delay_s: float = 5.0
    max_pairs_per_window: int = 15

    _events: dict[str, Deque[tuple[float, EventType]]] = field(default_factory=dict)

    def record(self, instrument: str, event: EventType, now_s: Optional[float] = None) -> None:
        if now_s is None:
            now_s = time.time()
        q = self._events.setdefault(instrument, deque())
        q.append((now_s, event))
        self._trim(q, now_s)

    def should_halt(self, instrument: str, now_s: Optional[float] = None) -> bool:
        if now_s is None:
            now_s = time.time()
        q = self._events.get(instrument)
        if not q:
            return False
        self._trim(q, now_s)

        # Count cancel-after-place pairs within pair_max_delay_s.
        last_place_ts: Optional[float] = None
        pairs = 0
        for ts, ev in q:
            if ev == "PLACE":
                last_place_ts = ts
            elif ev == "CANCEL":
                if last_place_ts is not None and 0.0 <= (ts - last_place_ts) <= self.pair_max_delay_s:
                    pairs += 1
        return pairs >= self.max_pairs_per_window

    def _trim(self, q: Deque[tuple[float, EventType]], now_s: float) -> None:
        cutoff = now_s - self.window_s
        while q and q[0][0] < cutoff:
            q.popleft()

