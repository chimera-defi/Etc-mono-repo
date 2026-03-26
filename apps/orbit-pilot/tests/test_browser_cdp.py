from __future__ import annotations

from unittest.mock import MagicMock, patch

from orbit_pilot.browser_assist import cdp_endpoint, chromium_launchable, run_submit_portal_assist


def test_cdp_endpoint_reads_env(monkeypatch) -> None:
    monkeypatch.delenv("ORBIT_BROWSER_CDP_URL", raising=False)
    assert cdp_endpoint() == ""
    monkeypatch.setenv("ORBIT_BROWSER_CDP_URL", "  ws://host/devtools  ")
    assert cdp_endpoint() == "ws://host/devtools"


def test_chromium_launchable_prefers_cdp_when_set(monkeypatch) -> None:
    monkeypatch.setenv("ORBIT_BROWSER_CDP_URL", "ws://example/cdp")
    mock_browser = MagicMock()
    mock_playwright = MagicMock()
    mock_playwright.chromium.connect_over_cdp.return_value = mock_browser

    class _Ctx:
        def __enter__(self) -> MagicMock:
            return mock_playwright

        def __exit__(self, *a: object) -> None:
            return None

    with patch("orbit_pilot.browser_assist.playwright_available", return_value=True):
        with patch("playwright.sync_api.sync_playwright", return_value=_Ctx()):
            ok, err = chromium_launchable()
    assert ok is True
    assert err == ""
    mock_playwright.chromium.connect_over_cdp.assert_called_once_with("ws://example/cdp")
    mock_browser.close.assert_called_once()


def test_run_submit_portal_assist_cdp_path(monkeypatch) -> None:
    monkeypatch.setenv("ORBIT_BROWSER_CDP_URL", "ws://kernel/cdp")
    monkeypatch.setenv("ORBIT_BROWSER_WAIT_MS", "50")

    mock_page = MagicMock()
    mock_context = MagicMock()
    mock_context.new_page.return_value = mock_page
    mock_browser = MagicMock()
    mock_browser.contexts = [mock_context]
    mock_pw = MagicMock()
    mock_pw.chromium.connect_over_cdp.return_value = mock_browser

    class _Ctx:
        def __enter__(self) -> MagicMock:
            return mock_pw

        def __exit__(self, *a: object) -> None:
            return None

    with patch("playwright.sync_api.sync_playwright", return_value=_Ctx()):
        out = run_submit_portal_assist(
            "https://form.example/submit",
            {"title": "T", "body": "B", "url": "https://u"},
            {"title": "#t"},
            headless=True,
            autofill=True,
            auto_submit=False,
        )

    assert out["cdp_remote"] is True
    assert out["persistent_profile"] is False
    assert out["autofill"] is True
    mock_pw.chromium.connect_over_cdp.assert_called_once_with("ws://kernel/cdp")
    mock_page.goto.assert_called_once()
    mock_page.close.assert_called_once()
    mock_browser.close.assert_called_once()
