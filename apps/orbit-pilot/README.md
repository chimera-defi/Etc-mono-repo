# Orbit Pilot (CLI + services)

Launch distribution operator: one `launch.yaml`, many platform-specific drafts, UTM-tagged links, SQLite + JSONL audit, optional **risk policy YAML**, **LangGraph** plan orchestration (`orchestrate`), and a minimal **FastAPI** webhook (`orbit serve`).

Specs and product docs live in [`../../ideas/orbit-pilot/`](../../ideas/orbit-pilot/). **Agents:** see [`AGENTS.md`](./AGENTS.md) for `--json` workflows and contracts. **`orbit schemas`** / **`orbit validate-json`** for bundled JSON Schemas.

## Install

```bash
cd apps/orbit-pilot
pip install -e ".[dev]"
orbit --help
```

## Quick start

```bash
mkdir ~/my-launch && cd ~/my-launch
orbit init
# edit launch.yaml (add publish.github.repo for real GitHub releases)
orbit plan --launch launch.yaml --platforms seed_platforms.yaml
# optional: --policy risk.defaults.yaml (copied by orbit init; defaults bundled)
orbit doctor --launch launch.yaml --platforms seed_platforms.yaml
orbit generate --launch launch.yaml --platforms seed_platforms.yaml --out out/
# runs land under out/<campaign-id>/run-<timestamp>/ (default campaign id from product name)
orbit campaigns --out out/
orbit latest --out out/ --campaign my-launch
orbit guide --run out/<campaign-id>/run-*
orbit next --run out/<campaign-id>/run-*
orbit report --run out/<campaign-id>/run-*
orbit export --run out/<campaign-id>/run-* --format json
orbit export --run out/<campaign-id>/run-* --format html   # writes run dir report.html if no -o
orbit export --run out/<campaign-id>/run-* --format md -o launch-report.md
orbit audit --run out/<campaign-id>/run-* --json
# optional TUI (pip install 'orbit-pilot[tui]'): orbit tui --run out/<campaign-id>/run-*
# API publish is dry-run by default; use --execute once doctor/guide says a platform is ready
orbit publish --run out/<campaign-id>/run-* --platform github
orbit publish --run out/<campaign-id>/run-* --platform dev --execute
# regenerate only the platforms you want to revise inside the same run
orbit regenerate --run out/<campaign-id>/run-* --platform github --platform product_hunt
```

## Full buildout pieces

| Piece | What |
|-------|------|
| Risk policy | `risk.defaults.yaml`: `risk.tolerance`, `allow_browser_fallback`, optional `platforms.<slug>.enabled` / `mode` |
| LangGraph | `run_plan_graph` / `run_generate_graph` in `orbit_pilot.orchestrate` (plan + full generate pipeline) |
| Webhook | `orbit serve` — `GET /health`, `POST /hooks/launch`; `ORBIT_WEBHOOK_SECRET` + `X-Orbit-Secret`; optional `ORBIT_WEBHOOK_ALLOW_GENERATE=1` + JSON body `launch_path`, `platforms_path`, `out` to run generate on the server |
| CTA policy | `launch.yaml` `cta_policy` + registry `cta_in_body` — omit tracked URL from body text where inappropriate |
| Registry images | `image_constraints.max_width` / `max_height` per platform in `seed_platforms.yaml` |
| Manual notes | `orbit mark-done --note "…"` stored in SQLite + result JSON |
| Audit tail | `orbit audit [--tail N]` prints `audit.jsonl` events |
| HTML report | `orbit export --format html` — single-file dark-theme table for sharing |
| TUI | `orbit tui --run …` after `pip install 'orbit-pilot[tui]'` |

## Credentials

Official publishers read credentials from environment variables first and then OS keychain via `keyring`.

| Variable | Platform |
|----------|----------|
| `GITHUB_TOKEN` | GitHub releases |
| `DEVTO_API_KEY` | DEV |
| `MEDIUM_TOKEN` + `publish.medium.author_id` in launch.yaml | Medium |
| `LINKEDIN_ACCESS_TOKEN` + `publish.linkedin.author` | LinkedIn |
| `X_ACCESS_TOKEN` | X |

Manual platforms never call `publish` with `--execute`; use `orbit mark-done --live-url … [--note …]` after posting by hand.

## Tests

```bash
cd apps/orbit-pilot
pytest
ruff check src tests
```
