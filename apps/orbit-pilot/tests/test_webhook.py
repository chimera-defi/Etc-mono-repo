from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from orbit_pilot.webhook import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_health(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_launch_hook_no_secret(client: TestClient) -> None:
    os.environ.pop("ORBIT_WEBHOOK_SECRET", None)
    r = client.post("/hooks/launch", json={"event": "test"})
    assert r.status_code == 200
    assert r.json()["received"] is True


def test_launch_hook_requires_secret(client: TestClient) -> None:
    os.environ["ORBIT_WEBHOOK_SECRET"] = "secret"
    r = client.post("/hooks/launch", json={"event": "x"})
    assert r.status_code == 401
    r2 = client.post("/hooks/launch", json={"event": "x"}, headers={"X-Orbit-Secret": "secret"})
    assert r2.status_code == 200
    del os.environ["ORBIT_WEBHOOK_SECRET"]


def test_launch_hook_generate_when_enabled(client: TestClient, tmp_path) -> None:
    root = tmp_path
    launch = root / "l.yaml"
    launch.write_text(
        "product_name: P\nwebsite_url: https://p.example\ntagline: t\nsummary: s\n",
        encoding="utf-8",
    )
    plat = root / "p.yaml"
    plat.write_text(
        "platforms:\n  - name: G\n    slug: github\n    mode: official_api\n    risk: low\n",
        encoding="utf-8",
    )
    os.environ.pop("ORBIT_WEBHOOK_SECRET", None)
    os.environ["ORBIT_WEBHOOK_ALLOW_GENERATE"] = "1"
    r = client.post(
        "/hooks/launch",
        json={
            "event": "generate",
            "launch_path": str(launch),
            "platforms_path": str(plat),
            "out": str(root / "out"),
        },
    )
    assert r.status_code == 200
    gen = r.json()["generate"]
    assert gen.get("skipped") is False
    assert gen.get("run_dir")
    del os.environ["ORBIT_WEBHOOK_ALLOW_GENERATE"]
