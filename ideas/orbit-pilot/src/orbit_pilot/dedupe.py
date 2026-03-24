from __future__ import annotations

import hashlib


def normalize_text(text: str) -> str:
    return " ".join(text.lower().split())


def digest_text(text: str) -> str:
    return hashlib.sha256(normalize_text(text).encode("utf-8")).hexdigest()
