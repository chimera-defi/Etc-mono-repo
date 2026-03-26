from __future__ import annotations

from orbit_pilot.scheduler import append_job, list_pending, run_due_jobs


def test_schedule_roundtrip(tmp_path, monkeypatch) -> None:
    p = tmp_path / "sched.jsonl"
    monkeypatch.setenv("ORBIT_SCHEDULE_PATH", str(p))
    append_job("2000-01-01T00:00:00Z", str(tmp_path), ["echo", "hi"])
    pending = list_pending()
    assert len(pending) == 1
    out = run_due_jobs()
    assert out and out[0]["exit_code"] == 0
    pending2 = list_pending()
    assert len(pending2) == 0
