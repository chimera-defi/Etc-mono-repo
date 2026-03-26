"""Real Playwright/Chromium tests.

In CI (``CI=true``), these run automatically when ``orbit-pilot[browser]`` and Chromium are installed.
Locally: ``RUN_BROWSER_E2E=1 pip install -e '.[browser]' && playwright install chromium`` then pytest.
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

pytestmark = pytest.mark.e2e_browser


def _e2e_enabled() -> bool:
    flag = os.environ.get("RUN_BROWSER_E2E", "").strip().lower()
    if flag in ("1", "true", "yes"):
        return True
    # GitHub Actions and most CI set CI=true — run E2E in unified orbit-pilot workflow (browser installed)
    return os.environ.get("CI", "").strip().lower() in ("1", "true", "yes")


skip_e2e = pytest.mark.skipif(
    not _e2e_enabled(),
    reason="set RUN_BROWSER_E2E=1 or CI=1, plus pip install -e '.[browser]' && playwright install chromium",
)


@skip_e2e
def test_playwright_chromium_launch_smoke() -> None:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("about:blank")
        assert page.evaluate("() => document.readyState") == "complete"
        browser.close()


@skip_e2e
def test_apply_browser_autofill_local_html(tmp_path: Path) -> None:
    from playwright.sync_api import sync_playwright

    from orbit_pilot.browser_assist import apply_browser_autofill

    html = """<!DOCTYPE html><html><body>
    <input id="title" name="title" type="text" />
    <textarea id="desc"></textarea>
    <input id="link" type="url" />
    </body></html>"""
    f = tmp_path / "form.html"
    f.write_text(html, encoding="utf-8")
    url = f.as_uri()

    payload = {"title": "Orbit E2E", "body": "Hello from test", "url": "https://example.com/p"}
    selectors = {"title": "#title", "body": "#desc", "url": "#link"}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        apply_browser_autofill(page, payload, selectors)
        assert page.input_value("#title") == "Orbit E2E"
        assert page.input_value("#desc") == "Hello from test"
        assert page.input_value("#link") == "https://example.com/p"
        browser.close()


@skip_e2e
def test_run_submit_portal_assist_autofill_and_submit(tmp_path: Path, monkeypatch) -> None:
    from orbit_pilot.browser_assist import run_submit_portal_assist

    monkeypatch.setenv("ORBIT_BROWSER_WAIT_MS", "500")
    html = """<!DOCTYPE html><html><body>
    <input id="title" type="text" />
    <textarea id="desc"></textarea>
    <button id="go" type="button">Send</button>
    </body></html>"""
    f = tmp_path / "form.html"
    f.write_text(html, encoding="utf-8")
    url = f.as_uri()
    payload = {"title": "E2E", "body": "Body", "url": "https://x.com"}
    selectors = {"title": "#title", "body": "#desc", "submit": "#go"}
    out = run_submit_portal_assist(
        url,
        payload,
        selectors,
        headless=True,
        autofill=True,
        auto_submit=True,
    )
    assert out["autofill"] is True
    assert out["auto_submit"] is True
    assert out.get("auto_submit_error") is None
