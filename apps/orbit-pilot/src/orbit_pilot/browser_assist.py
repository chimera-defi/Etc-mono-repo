"""Optional Playwright assist for high-risk submit pages (V1).

Install: pip install 'orbit-pilot[browser]' && playwright install chromium
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any


def playwright_available() -> bool:
    try:
        import playwright  # noqa: F401

        return True
    except ImportError:
        return False


def chromium_launchable() -> tuple[bool, str]:
    """Best-effort check that Playwright can start Chromium (for doctor)."""
    if not playwright_available():
        return False, "playwright Python package not installed"
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            browser.close()
        return True, ""
    except Exception as exc:  # pragma: no cover - env specific
        return False, str(exc)


def _fill_if(page: Any, selector: str, text: str, max_len: int = 8000) -> None:
    s = (text or "").strip()
    if not s or not selector:
        return
    page.fill(selector, s[:max_len])


def apply_browser_autofill(page: Any, payload: dict[str, Any], selectors: dict[str, str]) -> None:
    """Fill title/body/url fields using registry CSS selectors (used by publish + tests)."""
    if not selectors:
        return
    title_sel = selectors.get("title") or selectors.get("name") or ""
    body_sel = (
        selectors.get("body")
        or selectors.get("description")
        or selectors.get("content")
        or selectors.get("message")
        or ""
    )
    url_sel = selectors.get("url") or selectors.get("link") or selectors.get("website") or ""
    title = str(payload.get("title") or "")
    body = str(payload.get("body") or "")
    url = str(payload.get("url") or "")
    _fill_if(page, title_sel, title)
    _fill_if(page, body_sel, body, max_len=32000)
    _fill_if(page, url_sel, url)


def run_submit_portal_assist(
    submit_url: str,
    platform_dir: Path,
    payload: dict[str, Any],
    selectors: dict[str, str],
    *,
    headless: bool,
    autofill: bool,
) -> str:
    """
    Open submit URL. If autofill, type title/body/url into registry CSS selectors (human reviews and submits).
    """
    from playwright.sync_api import sync_playwright

    wait_ms = int(os.environ.get("ORBIT_BROWSER_WAIT_MS", "300000" if not headless else "3000"))
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()
        page.goto(submit_url, wait_until="domcontentloaded", timeout=120000)
        if autofill and selectors:
            apply_browser_autofill(page, payload, selectors)
        page.wait_for_timeout(wait_ms)
        browser.close()
    return submit_url
