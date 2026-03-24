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
    result_json text not null
);
"""


def init_db(run_dir: Path) -> Path:
    db_path = run_dir / "orbit.sqlite"
    conn = sqlite3.connect(db_path)
    conn.execute(SCHEMA)
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
) -> None:
    db_path = init_db(run_dir)
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        insert into submissions (platform, mode, status, live_url, reason, result_json)
        values (?, ?, ?, ?, ?, ?)
        on conflict(platform) do update set
            mode = excluded.mode,
            status = excluded.status,
            live_url = excluded.live_url,
            reason = excluded.reason,
            result_json = excluded.result_json
        """,
        (platform, mode, status, result.get("url"), reason, json.dumps(result)),
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


def list_submissions(run_dir: Path) -> list[dict[str, Any]]:
    db_path = init_db(run_dir)
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "select platform, mode, status, live_url, reason, result_json "
        "from submissions order by rowid"
    ).fetchall()
    conn.close()
    return [
        {
            "platform": row[0],
            "mode": row[1],
            "status": row[2],
            "live_url": row[3],
            "reason": row[4],
            "result": json.loads(row[5]),
        }
        for row in rows
    ]
