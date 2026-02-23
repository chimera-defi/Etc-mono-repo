#!/usr/bin/env python3
"""
Verify RAMPS provider URLs from wallets/RAMPS.md.
Outputs JSON + text summary under wallets/artifacts/.
"""

from __future__ import annotations

import json
import re
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = Path(__file__).resolve().parents[1]
RAMPS_MD = ROOT / "RAMPS.md"
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(parents=True, exist_ok=True)


@dataclass
class CheckResult:
    name: str
    url: str
    direct_ok: bool
    direct_error: str | None
    direct_len: int
    proxy_ok: bool
    proxy_error: str | None
    proxy_len: int
    notes: list[str]


def parse_ramps_table(md_text: str) -> list[tuple[str, str]]:
    rows = []
    in_table = False
    for line in md_text.splitlines():
        if line.startswith("| Provider |"):
            in_table = True
            continue
        if in_table and line.startswith("|---"):
            continue
        if in_table:
            if not line.startswith("|"):
                break
            parts = [p.strip() for p in line.strip("|").split("|")]
            if not parts or len(parts) < 1:
                continue
            provider_cell = parts[0]
            match = re.search(r"\*\*(.+?)\*\*", provider_cell)
            name = match.group(1).strip() if match else provider_cell
            url_match = re.search(r"\((https?://[^)]+)\)", provider_cell)
            if not url_match:
                continue
            url = url_match.group(1)
            rows.append((name, url))
    return rows


def fetch_url(url: str, timeout: int = 15) -> tuple[bool, int, str | None, str]:
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=timeout) as resp:
            content = resp.read()
        text = content.decode("utf-8", "ignore")
        return True, len(text), None, text
    except (HTTPError, URLError, TimeoutError, Exception) as exc:
        return False, 0, str(exc), ""


def quick_head(url: str, timeout: int = 8) -> tuple[bool, str | None]:
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        req = Request(url, headers=headers, method="HEAD")
        with urlopen(req, timeout=timeout):
            return True, None
    except (HTTPError, URLError, TimeoutError, Exception) as exc:
        return False, str(exc)


def detect_notes(text: str, *, allow_not_found: bool = True) -> list[str]:
    notes = []
    lower = text.lower()
    if "just a moment" in lower or "cf-chl" in lower:
        notes.append("cloudflare_challenge")
    if "access denied" in lower or "forbidden" in lower:
        notes.append("access_denied")
    if "enable javascript" in lower:
        notes.append("js_required")
    if allow_not_found and "page not found" in lower:
        notes.append("not_found")
    return notes


def main() -> int:
    ramps_text = RAMPS_MD.read_text()
    rows = parse_ramps_table(ramps_text)
    if not rows:
        print("No ramps found in RAMPS.md", file=sys.stderr)
        return 1

    results: list[CheckResult] = []
    for name, url in rows:
        direct_ok, direct_len, direct_err, direct_text = fetch_url(url)
        notes = detect_notes(direct_text, allow_not_found=True)
        if not direct_ok:
            head_ok, head_err = quick_head(url)
            if head_ok:
                direct_ok = True
                direct_err = None
                notes.append("head_ok_only")
            else:
                direct_err = head_err or direct_err
        proxy_url = f"https://r.jina.ai/http://{url.replace('https://', '').replace('http://', '')}"
        proxy_ok, proxy_len, proxy_err, proxy_text = fetch_url(proxy_url)
        notes.extend(detect_notes(proxy_text, allow_not_found=False))
        results.append(
            CheckResult(
                name=name,
                url=url,
                direct_ok=direct_ok,
                direct_error=direct_err,
                direct_len=direct_len,
                proxy_ok=proxy_ok,
                proxy_error=proxy_err,
                proxy_len=proxy_len,
                notes=sorted(set(notes)),
            )
        )
        time.sleep(1)

    out_json = ARTIFACTS / "ramps-url-checks.json"
    out_txt = ARTIFACTS / "ramps-url-checks.txt"

    out_json.write_text(json.dumps([asdict(r) for r in results], indent=2))

    lines = ["RAMPS URL Verification", "=" * 28, ""]
    for r in results:
        status = "OK" if r.direct_ok else "FAIL"
        proxy = "OK" if r.proxy_ok else "FAIL"
        notes = ", ".join(r.notes) if r.notes else "-"
        lines.append(f"- {r.name}: direct={status} proxy={proxy} notes={notes}")
    out_txt.write_text("\n".join(lines) + "\n")

    print(out_json)
    print(out_txt)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
