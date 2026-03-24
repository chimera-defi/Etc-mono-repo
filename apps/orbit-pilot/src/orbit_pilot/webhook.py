"""Minimal FastAPI webhook receiver (SPEC: optional webhook trigger)."""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Orbit Pilot Webhook", version="0.2.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/hooks/launch")
def launch_hook(
    payload: dict[str, Any],
    x_orbit_secret: str | None = Header(default=None, alias="X-Orbit-Secret"),
) -> dict[str, Any]:
    """Accept external events. If ORBIT_WEBHOOK_SECRET is set, require X-Orbit-Secret header."""
    secret = os.environ.get("ORBIT_WEBHOOK_SECRET")
    if secret and x_orbit_secret != secret:
        raise HTTPException(status_code=401, detail="invalid webhook secret")
    return {"received": True, "event": payload.get("event", "unknown")}
