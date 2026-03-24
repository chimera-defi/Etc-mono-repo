"""Optional Textual operator console: pip install 'orbit-pilot[tui]' or orbit-pilot[dev]."""

from __future__ import annotations

from pathlib import Path
from typing import ClassVar


def tui_available() -> bool:
    try:
        import textual  # noqa: F401

        return True
    except ImportError:
        return False


def run_tui(run_dir: Path) -> None:
    from textual.app import App, ComposeResult
    from textual.binding import Binding
    from textual.containers import Vertical, VerticalScroll
    from textual.widgets import DataTable, Footer, Header, Static

    from orbit_pilot.services.campaigns import load_run_manifest
    from orbit_pilot.services.reporting import report_payload

    rd = run_dir.resolve()

    class OrbitTuiApp(App[None]):
        CSS = """
        Screen { background: $surface; }
        #meta { padding: 1 2; height: auto; border-bottom: solid $primary; }
        #table-scroll { height: 1fr; min-height: 10; }
        DataTable { height: auto; min-height: 8; }
        #hint { padding: 1 2; dock: bottom; background: $panel; color: $text-muted; }
        """

        BINDINGS: ClassVar[list[Binding]] = [
            Binding("q", "quit", "Quit", show=True),
            Binding("r", "refresh", "Refresh", show=True),
        ]

        def compose(self) -> ComposeResult:
            yield Header(show_clock=True)
            yield Vertical(
                Static(id="meta"),
                VerticalScroll(
                    DataTable(id="platform-table", cursor_type="row", zebra_stripes=True),
                    id="table-scroll",
                ),
                Static(id="hint"),
            )
            yield Footer()

        def on_mount(self) -> None:
            table = self.query_one("#platform-table", DataTable)
            table.add_columns("Platform", "Mode", "Status", "URL / reason")
            self.refresh_data()

        def action_refresh(self) -> None:
            self.refresh_data()

        def refresh_data(self) -> None:
            meta_el = self.query_one("#meta", Static)
            hint = self.query_one("#hint", Static)
            table = self.query_one("#platform-table", DataTable)
            table.clear(columns=False)
            try:
                manifest = load_run_manifest(rd)
                camp = manifest.get("campaign") or {}
                name = camp.get("name") or camp.get("id") or "run"
                meta_el.update(
                    f"[bold]{name}[/]  ·  {rd}\n"
                    f"Launch: {manifest.get('launch_path', '')}\n"
                    f"Registry: {manifest.get('platform_registry_path', '')}"
                )
                data = report_payload(rd)
                for row in data["results"]:
                    url = row.get("live_url") or (row.get("result") or {}).get("url") or ""
                    tail = url or row.get("reason", "")
                    table.add_row(row["platform"], row["mode"], row["status"], tail[:200])
                pend = data.get("pending_manual") or []
                hint.update(
                    f"Pending manual: {', '.join(pend) if pend else 'none'}  ·  "
                    f"Next: {data.get('next_manual') or '—'}  ·  [r] refresh  [q] quit"
                )
            except Exception as exc:  # pragma: no cover
                meta_el.update(f"[red]Error loading run:[/] {exc}")
                hint.update("Fix the run path and press [r] to refresh.")

    OrbitTuiApp().run()
