"""Optional Playwright assist for high-risk submit pages (V1).

Install: pip install 'orbit-pilot[browser]' && playwright install chromium
"""

from __future__ import annotations

import os
from pathlib import Path


def playwright_available() -> bool:
    try:
        import playwright  # noqa: F401

        return True
    except ImportError:
        return False


def run_submit_portal_assist(submit_url: str, platform_dir: Path, *, headless: bool) -> str:
    """
    Open the platform submit URL in Chromium. Operator completes the form manually (paste from PROMPT_USER.txt).
    No auto-fill — avoids brittle selectors and reduces ToS abuse surface.
    Headed: waits ORBIT_BROWSER_WAIT_MS (default 300_000 ms) then closes.
    """
    from playwright.sync_api import sync_playwright

    wait_ms = int(os.environ.get("ORBIT_BROWSER_WAIT_MS", "300000" if not headless else "3000"))
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()
        page.goto(submit_url, wait_until="domcontentloaded", timeout=120000)
        page.wait_for_timeout(wait_ms)
        browser.close()
    return submit_url
