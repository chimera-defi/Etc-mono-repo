"""Append-only JSONL job queue for deferred CLI runs (V1)."""

from __future__ import annotations

import json
import os
import subprocess
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import IO, Any

from orbit_pilot.schedule_argv import validate_schedule_argv
from orbit_pilot.schedule_recurrence import next_fire_after, normalize_recurrence

try:
    import fcntl  # Unix

    _HAS_FCNTL = True
except ImportError:
    fcntl = None  # type: ignore[assignment]
    _HAS_FCNTL = False


def default_schedule_path() -> Path:
    return Path(os.environ.get("ORBIT_SCHEDULE_PATH", Path.home() / ".orbit-pilot" / "schedule.jsonl"))


@contextmanager
def _schedule_file_locked(path: Path) -> Iterator[IO[str]]:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.touch()
    fp = open(path, "a+", encoding="utf-8")
    try:
        if _HAS_FCNTL and fcntl is not None:
            fcntl.flock(fp.fileno(), fcntl.LOCK_EX)
        yield fp
    finally:
        if _HAS_FCNTL and fcntl is not None:
            fcntl.flock(fp.fileno(), fcntl.LOCK_UN)
        fp.close()


def _read_rows_from_fp(fp: IO[str]) -> list[dict[str, Any]]:
    fp.seek(0)
    text = fp.read()
    rows: list[dict[str, Any]] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def _write_rows_to_fp(fp: IO[str], rows: list[dict[str, Any]]) -> None:
    fp.seek(0)
    fp.truncate()
    if rows:
        fp.write("\n".join(json.dumps(r, ensure_ascii=False) for r in rows) + "\n")
    fp.flush()
    os.fsync(fp.fileno())


@dataclass
class ScheduleEntry:
    id: str
    due_at: str
    cwd: str
    argv: list[str]
    created_at: str
    done: bool = False
    recurrence: str = "none"
    timezone: str | None = None

    def to_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {
            "id": self.id,
            "due_at": self.due_at,
            "cwd": self.cwd,
            "argv": self.argv,
            "created_at": self.created_at,
            "done": self.done,
            "recurrence": self.recurrence,
        }
        if self.timezone:
            d["timezone"] = self.timezone
        return d


def append_job(
    due_at_iso: str,
    cwd: str,
    argv: list[str],
    *,
    recurrence: str = "none",
    timezone_label: str | None = None,
) -> ScheduleEntry:
    v = validate_schedule_argv(argv)
    if not v["ok"]:
        raise ValueError(str(v.get("error", "invalid argv")))
    rec_norm = normalize_recurrence(recurrence)
    path = default_schedule_path()
    now = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    entry = ScheduleEntry(
        id=str(uuid.uuid4()),
        due_at=due_at_iso.strip(),
        cwd=str(Path(cwd).resolve()),
        argv=list(argv),
        created_at=now,
        done=False,
        recurrence=rec_norm,
        timezone=timezone_label.strip() if timezone_label else None,
    )
    with _schedule_file_locked(path) as fp:
        rows = _read_rows_from_fp(fp)
        rows.append(entry.to_dict())
        _write_rows_to_fp(fp, rows)
    return entry


def read_jobs(path: Path | None = None) -> list[dict[str, Any]]:
    p = path or default_schedule_path()
    if not p.is_file():
        return []
    with _schedule_file_locked(p) as fp:
        return _read_rows_from_fp(fp)


def list_pending(path: Path | None = None) -> list[dict[str, Any]]:
    return [r for r in read_jobs(path) if not r.get("done")]


def cancel_job(job_id: str, path: Path | None = None) -> dict[str, Any]:
    """Mark a pending job as cancelled (done + cancelled flag) or return not_found."""
    p = path or default_schedule_path()
    if not p.is_file():
        return {"ok": False, "error": "no_schedule_file", "id": job_id}
    with _schedule_file_locked(p) as fp:
        rows = _read_rows_from_fp(fp)
        found = False
        for row in rows:
            if row.get("id") != job_id:
                continue
            found = True
            if row.get("done"):
                _write_rows_to_fp(fp, rows)
                return {"ok": False, "error": "already_done", "id": job_id}
            row["done"] = True
            row["cancelled"] = True
            row["cancelled_at"] = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
            break
        if not found:
            _write_rows_to_fp(fp, rows)
            return {"ok": False, "error": "not_found", "id": job_id}
        _write_rows_to_fp(fp, rows)
    return {"ok": True, "id": job_id}


def _parse_due(s: str) -> datetime:
    t = s.strip().replace("Z", "+00:00")
    return datetime.fromisoformat(t)


def run_due_jobs(path: Path | None = None, *, now: datetime | None = None) -> list[dict[str, Any]]:
    """Run pending jobs whose due_at <= now; mark done by rewriting file under lock."""
    p = path or default_schedule_path()
    if not p.is_file():
        return []
    now = now or datetime.now(UTC)
    outcomes: list[dict[str, Any]] = []
    with _schedule_file_locked(p) as fp:
        all_rows = _read_rows_from_fp(fp)
        to_run: list[tuple[str, list[str], str]] = []
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
            jid = str(row.get("id") or "")
            argv = row.get("argv") or []
            cwd = row.get("cwd") or "."
            to_run.append((jid, argv, cwd))

    for jid, argv, cwd in to_run:
        try:
            proc = subprocess.run(argv, cwd=cwd, capture_output=True, text=True, timeout=3600)
            exit_code = proc.returncode
            stdout_tail = (proc.stdout or "")[-2000:]
            stderr_tail = (proc.stderr or "")[-2000:]
        except subprocess.TimeoutExpired:
            exit_code = -1
            stdout_tail = ""
            stderr_tail = "timeout after 3600s"
        except OSError as exc:
            exit_code = -1
            stdout_tail = ""
            stderr_tail = str(exc)
        outcomes.append(
            {
                "id": jid,
                "argv": argv,
                "exit_code": exit_code,
                "stdout_tail": stdout_tail,
                "stderr_tail": stderr_tail,
            }
        )
        with _schedule_file_locked(p) as fp:
            rows = _read_rows_from_fp(fp)
            for r in rows:
                if str(r.get("id")) != jid:
                    continue
                if r.get("done"):
                    break
                r["done"] = True
                r["last_run_at"] = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
                r["last_exit_code"] = exit_code
                if exit_code != 0:
                    r["last_stderr_tail"] = stderr_tail[-500:]
                rec_raw = str(r.get("recurrence") or "none")
                try:
                    norm = normalize_recurrence(rec_raw)
                except ValueError:
                    norm = "none"
                if norm != "none":
                    try:
                        anchor = _parse_due(str(r["due_at"]))
                        if anchor.tzinfo is None:
                            anchor = anchor.replace(tzinfo=UTC)
                        nxt = next_fire_after(anchor, norm)
                        child: dict[str, Any] = {
                            "id": str(uuid.uuid4()),
                            "due_at": nxt.strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "cwd": r.get("cwd"),
                            "argv": list(r.get("argv") or []),
                            "created_at": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "done": False,
                            "recurrence": rec_raw,
                            "parent_job_id": r.get("id"),
                        }
                        if r.get("timezone"):
                            child["timezone"] = r["timezone"]
                        rows.append(child)
                    except (ValueError, KeyError):
                        pass
                break
            _write_rows_to_fp(fp, rows)

    return outcomes
