# Orbit Pilot (V0 CLI)

Launch distribution operator: one `launch.yaml`, many platform-specific drafts, UTM-tagged links, SQLite run state, and a small set of official API publishers.

Specs and product docs live in [`../../ideas/orbit-pilot/`](../../ideas/orbit-pilot/).

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
orbit generate --launch launch.yaml --platforms seed_platforms.yaml --out out/
# runs land under out/<campaign-id>/run-<timestamp>/ (default campaign id from product name)
orbit next --run out/<campaign-id>/run-*
orbit report --run out/run-*
# API publish (dry-run by default; use --execute + env tokens)
orbit publish --run out/run-* --platform github
orbit publish --run out/run-* --platform dev --execute
```

## Environment variables (optional publishers)

| Variable | Platform |
|----------|----------|
| `GITHUB_TOKEN` | GitHub releases |
| `DEVTO_API_KEY` | DEV |
| `MEDIUM_TOKEN` + `publish.medium.author_id` in launch.yaml | Medium |
| `LINKEDIN_ACCESS_TOKEN` + `publish.linkedin.author` | LinkedIn |
| `X_ACCESS_TOKEN` | X |

Manual platforms never call `publish` with `--execute`; use `orbit mark-done --live-url ...` after posting by hand.

## Tests

```bash
cd apps/orbit-pilot
pytest
ruff check src tests
```
