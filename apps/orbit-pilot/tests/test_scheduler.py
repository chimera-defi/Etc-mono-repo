from __future__ import annotations

from orbit_pilot.scheduler import append_job, cancel_job, list_pending, read_jobs, run_due_jobs


def test_schedule_roundtrip(tmp_path, monkeypatch) -> None:
    p = tmp_path / "sched.jsonl"
    monkeypatch.setenv("ORBIT_SCHEDULE_PATH", str(p))
    monkeypatch.setenv("ORBIT_SCHEDULE_ALLOW_ARBITRARY", "1")
    append_job("2000-01-01T00:00:00Z", str(tmp_path), ["echo", "hi"])
    pending = list_pending()
    assert len(pending) == 1
    out = run_due_jobs()
    assert out and out[0]["exit_code"] == 0
    pending2 = list_pending()
    assert len(pending2) == 0


def test_schedule_cancel(tmp_path, monkeypatch) -> None:
    p = tmp_path / "sched.jsonl"
    monkeypatch.setenv("ORBIT_SCHEDULE_PATH", str(p))
    monkeypatch.setenv("ORBIT_SCHEDULE_ALLOW_ARBITRARY", "1")
    entry = append_job("2099-01-01T00:00:00Z", str(tmp_path), ["echo", "x"])
    assert cancel_job(entry.id)["ok"] is True
    assert len(list_pending()) == 0
    assert any(r.get("cancelled") for r in read_jobs(p))


def test_schedule_recurrence_enqueues_next(tmp_path, monkeypatch) -> None:
    p = tmp_path / "sched.jsonl"
    monkeypatch.setenv("ORBIT_SCHEDULE_PATH", str(p))
    monkeypatch.setenv("ORBIT_SCHEDULE_ALLOW_ARBITRARY", "1")
    append_job("2000-01-01T00:00:00Z", str(tmp_path), ["true"], recurrence="daily")
    run_due_jobs()
    all_j = read_jobs(p)
    assert len(all_j) == 2
    pending = [x for x in all_j if not x.get("done")]
    assert len(pending) == 1
    assert pending[0]["recurrence"] == "daily"
    assert "2000-01-02" in pending[0]["due_at"]


def test_schedule_argv_rejects_non_orbit() -> None:
    from orbit_pilot.schedule_argv import validate_schedule_argv

    assert not validate_schedule_argv(["rm", "-rf", "/"])["ok"]
    assert validate_schedule_argv(["orbit", "version"])["ok"]


def test_append_job_rejects_bad_argv(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("ORBIT_SCHEDULE_PATH", str(tmp_path / "s.jsonl"))
    import pytest

    from orbit_pilot.scheduler import append_job

    with pytest.raises(ValueError, match="first command"):
        append_job("2099-01-01T00:00:00Z", str(tmp_path), ["curl", "http://evil"])
