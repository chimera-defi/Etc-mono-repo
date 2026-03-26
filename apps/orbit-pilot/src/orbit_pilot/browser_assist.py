"""Playwright helper for browser_assisted publish (optional dep: orbit-pilot[browser])."""

from __future__ import annotations

import os
from typing import Any


def playwright_available() -> bool:
    try:
        import playwright  # noqa: F401

        return True
    except ImportError:
        return False


def cdp_endpoint() -> str:
    """Chrome DevTools Protocol WebSocket or http URL (e.g. Kernel, remote Chrome)."""
    return os.environ.get("ORBIT_BROWSER_CDP_URL", "").strip()


def cdp_connectable() -> tuple[bool, str]:
    """Best-effort: can Playwright attach to ORBIT_BROWSER_CDP_URL."""
    if not playwright_available():
        return False, "playwright Python package not installed"
    url = cdp_endpoint()
    if not url:
        return False, "ORBIT_BROWSER_CDP_URL not set"
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(url)
            browser.close()
        return True, ""
    except Exception as exc:  # pragma: no cover - env specific
        return False, str(exc)


def chromium_launchable() -> tuple[bool, str]:
    """Best-effort check for browser_assisted doctor: CDP remote or local Chromium."""
    if not playwright_available():
        return False, "playwright Python package not installed"
    if cdp_endpoint():
        return cdp_connectable()
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


def submit_selector_for_registry(selectors: dict[str, str]) -> str:
    """CSS selector for the submit control; empty if registry does not define one."""
    return (
        selectors.get("submit")
        or selectors.get("submit_button")
        or selectors.get("submit_selector")
        or ""
    ).strip()


def _assist_on_page(
    page: Any,
    submit_url: str,
    payload: dict[str, Any],
    selectors: dict[str, str],
    *,
    autofill: bool,
    auto_submit: bool,
    wait_ms: int,
    out: dict[str, Any],
) -> None:
    submit_sel = submit_selector_for_registry(selectors)
    do_submit = bool(auto_submit and autofill and selectors and submit_sel)

    page.goto(submit_url, wait_until="domcontentloaded", timeout=120000)
    if autofill and selectors:
        apply_browser_autofill(page, payload, selectors)
    if do_submit:
        out["auto_submit"] = True
        try:
            page.click(submit_sel, timeout=15000)
            page.wait_for_load_state("domcontentloaded", timeout=20000)
        except Exception as exc:  # pragma: no cover - browser specific
            out["auto_submit_error"] = str(exc)
    elif auto_submit and autofill and selectors and not submit_sel:
        out["auto_submit_error"] = (
            "auto_submit requested but registry missing submit/submit_button selector"
        )
    page.wait_for_timeout(wait_ms)


def run_submit_portal_assist(
    submit_url: str,
    payload: dict[str, Any],
    selectors: dict[str, str],
    *,
    headless: bool,
    autofill: bool,
    auto_submit: bool,
) -> dict[str, Any]:
    """
    Open submit_url. Optional autofill + optional click submit (both gated upstream).

    Browser backend (first match):
    - ORBIT_BROWSER_CDP_URL: connect_over_cdp (hosted Chrome / Kernel / remote debugger).
    - ORBIT_BROWSER_USER_DATA_DIR: launch_persistent_context (local logged-in profile).
    - Else: launch local Chromium (headless per ORBIT_BROWSER_HEADLESS).
    """
    from playwright.sync_api import sync_playwright

    wait_ms = int(os.environ.get("ORBIT_BROWSER_WAIT_MS", "300000" if not headless else "3000"))
    cdp_url = cdp_endpoint()
    user_data = os.environ.get("ORBIT_BROWSER_USER_DATA_DIR", "").strip()
    out: dict[str, Any] = {
        "url": submit_url,
        "autofill": bool(autofill and selectors),
        "auto_submit": False,
        "auto_submit_error": None,
        "persistent_profile": bool(user_data) and not cdp_url,
        "cdp_remote": bool(cdp_url),
    }

    with sync_playwright() as p:
        if cdp_url:
            browser = p.chromium.connect_over_cdp(cdp_url)
            try:
                context = browser.contexts[0] if browser.contexts else browser.new_context()
                page = context.new_page()
                try:
                    _assist_on_page(
                        page,
                        submit_url,
                        payload,
                        selectors,
                        autofill=autofill,
                        auto_submit=auto_submit,
                        wait_ms=wait_ms,
                        out=out,
                    )
                finally:
                    page.close()
            finally:
                browser.close()
            return out

        if user_data:
            context = p.chromium.launch_persistent_context(
                user_data,
                headless=headless,
                args=["--disable-blink-features=AutomationControlled"],
            )
            try:
                page = context.pages[0] if context.pages else context.new_page()
                _assist_on_page(
                    page,
                    submit_url,
                    payload,
                    selectors,
                    autofill=autofill,
                    auto_submit=auto_submit,
                    wait_ms=wait_ms,
                    out=out,
                )
            finally:
                context.close()
            return out

        browser = p.chromium.launch(headless=headless)
        try:
            context = browser.new_context()
            page = context.new_page()
            try:
                _assist_on_page(
                    page,
                    submit_url,
                    payload,
                    selectors,
                    autofill=autofill,
                    auto_submit=auto_submit,
                    wait_ms=wait_ms,
                    out=out,
                )
            finally:
                context.close()
        finally:
            browser.close()
