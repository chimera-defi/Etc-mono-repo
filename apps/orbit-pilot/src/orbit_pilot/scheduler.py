"""Append-only JSONL job queue for deferred CLI runs (V1)."""

from __future__ import annotations

import json
import os
import subprocess
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


def default_schedule_path() -> Path:
    return Path(os.environ.get("ORBIT_SCHEDULE_PATH", Path.home() / ".orbit-pilot" / "schedule.jsonl"))


@dataclass
class ScheduleEntry:
    id: str
    due_at: str
    cwd: str
    argv: list[str]
    created_at: str
    done: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "due_at": self.due_at,
            "cwd": self.cwd,
            "argv": self.argv,
            "created_at": self.created_at,
            "done": self.done,
        }


def append_job(due_at_iso: str, cwd: str, argv: list[str]) -> ScheduleEntry:
    path = default_schedule_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    entry = ScheduleEntry(
        id=str(uuid.uuid4()),
        due_at=due_at_iso.strip(),
        cwd=str(Path(cwd).resolve()),
        argv=list(argv),
        created_at=now,
        done=False,
    )
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry.to_dict(), ensure_ascii=False) + "\n")
    return entry


def read_jobs(path: Path | None = None) -> list[dict[str, Any]]:
    p = path or default_schedule_path()
    if not p.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def list_pending(path: Path | None = None) -> list[dict[str, Any]]:
    return [r for r in read_jobs(path) if not r.get("done")]


def _parse_due(s: str) -> datetime:
    # Accept ...Z or +00:00
    t = s.strip().replace("Z", "+00:00")
    return datetime.fromisoformat(t)


def run_due_jobs(path: Path | None = None, *, now: datetime | None = None) -> list[dict[str, Any]]:
    """Run pending jobs whose due_at <= now; mark done by rewriting file (best-effort)."""
    p = path or default_schedule_path()
    if not p.is_file():
        return []
    now = now or datetime.now(UTC)
    all_rows = read_jobs(p)
    outcomes: list[dict[str, Any]] = []
    changed = False
    for row in all_rows:
        if row.get("done"):
            continue
        try:
            due = _parse_due(row["due_at"])
            if due.tzinfo is None:
                due = due.replace(tzinfo=UTC)
        except (KeyError, ValueError):
            continue
        if due > now:
            continue
        argv = row.get("argv") or []
        cwd = row.get("cwd") or "."
        proc = subprocess.run(argv, cwd=cwd, capture_output=True, text=True, timeout=3600)
        row["done"] = True
        row["last_run_at"] = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        row["last_exit_code"] = proc.returncode
        changed = True
        outcomes.append(
            {
                "id": row.get("id"),
                "argv": argv,
                "exit_code": proc.returncode,
                "stdout_tail": (proc.stdout or "")[-2000:],
                "stderr_tail": (proc.stderr or "")[-2000:],
            }
        )
    if changed:
        p.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in all_rows) + "\n", encoding="utf-8")
    return outcomes
