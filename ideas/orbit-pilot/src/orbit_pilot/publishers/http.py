from __future__ import annotations

import json
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def json_post(url: str, headers: dict[str, str], body: dict[str, Any], max_attempts: int = 3) -> dict[str, Any]:
    for attempt in range(1, max_attempts + 1):
        request = Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={**headers, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=30) as response:
                return {"ok": True, "data": json.loads(response.read().decode("utf-8"))}
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            if exc.code in {429, 500, 502, 503, 504} and attempt < max_attempts:
                time.sleep(attempt)
                continue
            return {"ok": False, "error": f"HTTP {exc.code}: {detail}"}
        except URLError as exc:
            if attempt < max_attempts:
                time.sleep(attempt)
                continue
            return {"ok": False, "error": str(exc.reason)}
    return {"ok": False, "error": "Unknown retry failure"}
