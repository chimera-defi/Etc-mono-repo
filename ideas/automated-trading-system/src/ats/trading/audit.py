from __future__ import annotations

import json
import os
import threading
import time
from dataclasses import asdict, is_dataclass
from typing import Any, Mapping, Optional


def _utc_iso(ts_ms: Optional[int] = None) -> str:
    if ts_ms is None:
        ts_ms = int(time.time() * 1000)
    # ISO 8601 with milliseconds, UTC "Z"
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(ts_ms / 1000)) + f".{ts_ms % 1000:03d}Z"


class AuditLogger:
    """
    Append-only JSONL audit log.

    Notes:
    - Never log secrets (API keys, signatures).
    - Designed to be low overhead; flushes each line for crash survivability.
    """

    def __init__(self, path: str) -> None:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self._path = path
        self._lock = threading.Lock()

    @property
    def path(self) -> str:
        return self._path

    def log(self, event_type: str, payload: Mapping[str, Any]) -> None:
        rec: dict[str, Any] = {
            "event_type": event_type,
            "ts": _utc_iso(),
            **payload,
        }
        self._write_line(rec)

    def log_dataclass(self, event_type: str, obj: Any, extra: Optional[Mapping[str, Any]] = None) -> None:
        if not is_dataclass(obj):
            raise TypeError("log_dataclass expects a dataclass instance")
        payload = asdict(obj)
        if extra:
            payload.update(extra)
        self.log(event_type, payload)

    def _write_line(self, rec: Mapping[str, Any]) -> None:
        line = json.dumps(rec, sort_keys=True, separators=(",", ":"))
        with self._lock:
            with open(self._path, "a", encoding="utf-8") as f:
                f.write(line + "\n")
                f.flush()

