from __future__ import annotations

import sqlite3
import time
from pathlib import Path

SCHEMA = """
create table if not exists payload_digests (
    digest text primary key,
    platform text not null,
    created_at integer not null
);
create table if not exists publish_attempts (
    platform text primary key,
    last_attempt_at integer not null
);
"""


def state_db_path(run_dir: Path) -> Path:
    return run_dir.parent / "orbit_state.sqlite"


def init_state_db(run_dir: Path) -> Path:
    db_path = state_db_path(run_dir)
    conn = sqlite3.connect(db_path)
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
    return db_path


def seen_digest(run_dir: Path, digest: str) -> bool:
    conn = sqlite3.connect(init_state_db(run_dir))
    row = conn.execute("select 1 from payload_digests where digest = ?", (digest,)).fetchone()
    conn.close()
    return row is not None


def record_digest(run_dir: Path, digest: str, platform: str) -> None:
    conn = sqlite3.connect(init_state_db(run_dir))
    conn.execute(
        "insert or ignore into payload_digests (digest, platform, created_at) values (?, ?, ?)",
        (digest, platform, int(time.time())),
    )
    conn.commit()
    conn.close()


def cooldown_remaining(run_dir: Path, platform: str, cooldown_seconds: int) -> int:
    conn = sqlite3.connect(init_state_db(run_dir))
    row = conn.execute("select last_attempt_at from publish_attempts where platform = ?", (platform,)).fetchone()
    conn.close()
    if row is None:
        return 0
    elapsed = int(time.time()) - int(row[0])
    remaining = cooldown_seconds - elapsed
    return remaining if remaining > 0 else 0


def record_publish_attempt(run_dir: Path, platform: str) -> None:
    conn = sqlite3.connect(init_state_db(run_dir))
    conn.execute(
        """
        insert into publish_attempts (platform, last_attempt_at) values (?, ?)
        on conflict(platform) do update set last_attempt_at = excluded.last_attempt_at
        """,
        (platform, int(time.time())),
    )
    conn.commit()
    conn.close()
