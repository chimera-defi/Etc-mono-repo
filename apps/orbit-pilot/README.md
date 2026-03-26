# Orbit Pilot

**What it is:** CLI that turns one **`launch.yaml`** + a **platform registry** into per-site submission packs under **`out/`**, optional **API publish** (dry-run by default), **audit**, and **agent-friendly `--json`**.

**Human: start here → [`HUMAN_GUIDE.md`](./HUMAN_GUIDE.md)** (end-to-end flow).  
**Architecture → [`ARCHITECTURE.md`](./ARCHITECTURE.md)** (layers, JSON Schemas vs Python, data flow).  
**Agents → [`AGENTS.md`](./AGENTS.md)** (schemas, `orbit pipeline`, validation).  
**Claude Code:** [`claude-skills/`](./claude-skills/) (operator skill; symlink into `.claude/skills/` per README there).

**Specs / roadmap → [`../../ideas/orbit-pilot/`](../../ideas/orbit-pilot/)** ([`V1_SHIPPED.md`](../../ideas/orbit-pilot/V1_SHIPPED.md), [`V1_ROADMAP.md`](../../ideas/orbit-pilot/V1_ROADMAP.md), [`V2_ROADMAP.md`](../../ideas/orbit-pilot/V2_ROADMAP.md) monetization/GTM planning).

## Install

**Standard (pip):**

```bash
cd apps/orbit-pilot
pip install -e ".[dev]"
orbit --help
```

**Modern tooling ([uv](https://github.com/astral-sh/uv))** — same package, faster resolver/install:

```bash
cd apps/orbit-pilot
uv venv && source .venv/bin/activate   # or: uv run …
uv pip install -e ".[dev]"
orbit --help
```

Optional extras: `orbit-pilot[tui]`, `orbit-pilot[browser]` (e.g. `uv pip install -e ".[dev,browser]"`).

## One-minute flow

```bash
orbit init --dir ~/my-launch && cd ~/my-launch
# edit launch.yaml
orbit pipeline --launch launch.yaml --platforms seed_platforms.yaml --out out/ --json
orbit guide --run out/*/run-*    # then mark-done / publish as in HUMAN_GUIDE.md
```

## Reference

| Topic | Doc / command |
|--------|----------------|
| Full E2E steps | [`HUMAN_GUIDE.md`](./HUMAN_GUIDE.md) |
| JSON + schemas | [`AGENTS.md`](./AGENTS.md), `orbit schemas`, `orbit validate-json` |
| Credentials | Env + keyring (table below) |
| Contribute | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |

## Capabilities (short)

| Area | Notes |
|------|--------|
| Core | `plan`, `doctor`, `generate`, `regenerate`, `publish`, `mark-done`, **`work`** (queue + open browser), `report`, `next`, `guide`, `campaigns`, `latest`, `export` (json/md/html), `audit`, `init`, `serve` |
| Agents | `orbit pipeline --json`, bundled JSON Schemas, `check-run`, `registry-lint` |
| Schedule | `schedule-add` / `list` / `run` / `cancel` |
| Browser | Playwright assist; `ORBIT_BROWSER_CDP_URL` (remote CDP) or `ORBIT_BROWSER_USER_DATA_DIR` (local profile); autofill / auto-submit optional |
| Optional | TUI `[tui]`, webhook `orbit serve` |

## Credentials (API publishers)

| Variable | Platform |
|----------|----------|
| `GITHUB_TOKEN` | GitHub |
| `DEVTO_API_KEY` | DEV |
| `MEDIUM_TOKEN` + `publish.medium.author_id` in launch.yaml | Medium |
| `LINKEDIN_ACCESS_TOKEN` + `publish.linkedin.author` | LinkedIn |
| `X_ACCESS_TOKEN` | X |

## Verify

```bash
cd apps/orbit-pilot
ruff check src tests && pytest -q
```
