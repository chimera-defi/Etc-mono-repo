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
