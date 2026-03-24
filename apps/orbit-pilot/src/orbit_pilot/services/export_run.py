from __future__ import annotations

import html as html_module
import json
from pathlib import Path
from typing import Any

from orbit_pilot.audit import list_submissions
from orbit_pilot.services.campaigns import load_run_manifest
from orbit_pilot.services.reporting import report_payload


def export_run(run_dir: Path, fmt: str) -> str:
    manifest = load_run_manifest(run_dir)
    report = report_payload(run_dir)
    rows = list_submissions(run_dir)
    payload: dict[str, Any] = {
        "run_dir": str(run_dir),
        "manifest": manifest,
        "report": report,
        "submissions": rows,
    }
    if fmt == "json":
        return json.dumps(payload, indent=2, ensure_ascii=False)
    if fmt == "html":
        return _to_html(payload)
    return _to_markdown(payload)


def _to_markdown(data: dict[str, Any]) -> str:
    lines = [
        "# Orbit Pilot run export",
        "",
        f"**Run:** `{data['run_dir']}`",
        "",
        "## Platforms",
        "",
        "| Platform | Mode | Status | Live URL |",
        "|----------|------|--------|----------|",
    ]
    for row in data["submissions"]:
        url = row.get("live_url") or ""
        lines.append(f"| {row['platform']} | {row['mode']} | {row['status']} | {url} |")
    lines.extend(["", "## Pending manual", ""])
    pending = data["report"].get("pending_manual") or []
    if pending:
        lines.append(", ".join(pending))
    else:
        lines.append("(none)")
    lines.append("")
    return "\n".join(lines)


def _e(s: Any) -> str:
    return html_module.escape(str(s) if s is not None else "", quote=False)


def _url_cell(url: str) -> str:
    u = str(url or "").strip()
    if u.startswith(("http://", "https://")):
        return f'<a href="{html_module.escape(u, quote=True)}" rel="noopener noreferrer">{_e(u)}</a>'
    return _e(u)


def _pill_row(items: list[str]) -> str:
    if not items:
        return "<em>none</em>"
    return "".join(f'<span class="pill">{_e(p)}</span>' for p in items)


def _to_html(data: dict[str, Any]) -> str:
    """Single-file HTML report for humans or attachment sharing (all dynamic text escaped)."""
    m = data["manifest"]
    camp = m.get("campaign") or {}
    title = _e(camp.get("name") or camp.get("id") or "Launch run")
    run_path = str(data["run_dir"])
    pending = data["report"].get("pending_manual") or []
    skipped = data["report"].get("skipped") or []
    browser_fb = data["report"].get("browser_fallback") or []

    rows_html = []
    for row in data["submissions"]:
        url = row.get("live_url") or (row.get("result") or {}).get("url") or ""
        note = (row.get("result") or {}).get("operator_note") or row.get("operator_note") or ""
        rows_html.append(
            "<tr>"
            f"<td><code>{_e(row['platform'])}</code></td>"
            f"<td>{_e(row['mode'])}</td>"
            f"<td>{_e(row['status'])}</td>"
            f"<td>{_url_cell(url)}</td>"
            f"<td>{_e(note)}</td>"
            "</tr>"
        )

    meta_rows = [
        ("Run directory", _e(run_path)),
        ("Launch", _e(m.get("launch_path", ""))),
        ("Platforms registry", _e(m.get("platform_registry_path", ""))),
        ("Policy", _e(m.get("policy_path", ""))),
    ]
    meta_html = "".join(f"<tr><th>{k}</th><td>{v}</td></tr>" for k, v in meta_rows)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Orbit Pilot — {title}</title>
  <style>
    :root {{ font-family: system-ui, sans-serif; line-height: 1.45; }}
    body {{ max-width: 1100px; margin: 2rem auto; padding: 0 1rem; color: #e8eaed; background: #13151a; }}
    h1 {{ font-size: 1.35rem; margin-bottom: 0.25rem; }}
    .sub {{ color: #9aa0a6; font-size: 0.9rem; margin-bottom: 1.5rem; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 0.9rem; }}
    th, td {{ border: 1px solid #3c4043; padding: 0.5rem 0.6rem; text-align: left; vertical-align: top; }}
    th {{ background: #1e2128; color: #bdc1c6; }}
    tr:nth-child(even) {{ background: #1a1d24; }}
    code {{ font-size: 0.85em; }}
    .pill {{ display: inline-block; margin: 0.15rem 0.35rem 0 0; padding: 0.2rem 0.5rem;
             background: #30343c; border-radius: 4px; font-size: 0.8rem; }}
    section {{ margin-top: 1.75rem; }}
  </style>
</head>
<body>
  <h1>Orbit Pilot run report</h1>
  <p class="sub">Campaign: {title} · Generated for operator / agent review</p>

  <table aria-label="Run metadata">{meta_html}</table>

  <section>
    <h2>Platforms</h2>
    <table aria-label="Per-platform status">
      <thead><tr><th>Platform</th><th>Mode</th><th>Status</th><th>URL</th><th>Note</th></tr></thead>
      <tbody>{"".join(rows_html) or "<tr><td colspan='5'>No rows yet</td></tr>"}</tbody>
    </table>
  </section>

  <section>
    <h2>Queues</h2>
    <p><strong>Pending manual:</strong> {_pill_row(pending)}</p>
    <p><strong>Skipped:</strong> {_pill_row(skipped)}</p>
    <p><strong>Browser fallback:</strong> {_pill_row(browser_fb)}</p>
  </section>
</body>
</html>
"""
