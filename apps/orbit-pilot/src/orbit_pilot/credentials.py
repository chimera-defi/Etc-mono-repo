from __future__ import annotations

import os

try:
    import keyring
except ImportError:  # pragma: no cover
    keyring = None

SERVICE_NAME = "orbit-pilot"


def get_secret(name: str) -> str | None:
    value = os.environ.get(name)
    if value:
        return value
    if keyring is None:
        return None
    try:
        return keyring.get_password(SERVICE_NAME, name)
    except Exception:  # pragma: no cover
        return None
