from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

SCHEMA = """
create table if not exists submissions (
    platform text primary key,
    mode text not null,
    status text not null,
    live_url text,
    reason text not null,
    result_json text not null,
    operator_note text
);
"""


def _migrate_db(conn: sqlite3.Connection) -> None:
    rows = conn.execute("pragma table_info(submissions)").fetchall()
    cols = {r[1] for r in rows}
    if "operator_note" not in cols:
        conn.execute("alter table submissions add column operator_note text")


def init_db(run_dir: Path) -> Path:
    db_path = run_dir / "orbit.sqlite"
    conn = sqlite3.connect(db_path)
    conn.execute(SCHEMA)
    _migrate_db(conn)
    conn.commit()
    conn.close()
    return db_path


def append_audit_event(run_dir: Path, event: dict[str, Any]) -> None:
    """Append-only JSONL audit log (spec: every decision / attempt traceable)."""
    line = json.dumps({"ts": datetime.now(UTC).isoformat(), **event}, ensure_ascii=False)
    path = run_dir / "audit.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")


def record_submission(
    run_dir: Path,
    platform: str,
    mode: str,
    status: str,
    reason: str,
    result: dict[str, Any],
    operator_note: str | None = None,
) -> None:
    db_path = init_db(run_dir)
    conn = sqlite3.connect(db_path)
    _migrate_db(conn)
    merged = dict(result)
    if operator_note is not None:
        merged["operator_note"] = operator_note
    conn.execute(
        """
        insert into submissions (platform, mode, status, live_url, reason, result_json, operator_note)
        values (?, ?, ?, ?, ?, ?, ?)
        on conflict(platform) do update set
            mode = excluded.mode,
            status = excluded.status,
            live_url = excluded.live_url,
            reason = excluded.reason,
            result_json = excluded.result_json,
            operator_note = coalesce(excluded.operator_note, submissions.operator_note)
        """,
        (platform, mode, status, merged.get("url"), reason, json.dumps(merged), operator_note),
    )
    conn.commit()
    conn.close()
    append_audit_event(
        run_dir,
        {
            "type": "submission_row",
            "platform": platform,
            "mode": mode,
            "status": status,
            "reason": reason,
        },
    )


def read_audit_events(run_dir: Path, tail: int | None = None) -> list[dict[str, Any]]:
    path = run_dir / "audit.jsonl"
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    if tail is not None and tail > 0:
        lines = lines[-tail:]
    out: list[dict[str, Any]] = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        out.append(json.loads(line))
    return out


def list_submissions(run_dir: Path) -> list[dict[str, Any]]:
    db_path = init_db(run_dir)
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "select platform, mode, status, live_url, reason, result_json, operator_note "
        "from submissions order by rowid"
    ).fetchall()
    conn.close()
    out: list[dict[str, Any]] = []
    for row in rows:
        rj = json.loads(row[5])
        note = row[6]
        if note and "operator_note" not in rj:
            rj = {**rj, "operator_note": note}
        out.append(
            {
                "platform": row[0],
                "mode": row[1],
                "status": row[2],
                "live_url": row[3],
                "reason": row[4],
                "result": rj,
                "operator_note": note,
            }
        )
    return out
