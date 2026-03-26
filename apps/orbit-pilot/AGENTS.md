# Orbit Pilot — agent guide

**Package:** one `launch.yaml`, registry YAML, `out/<campaign>/run-*/` packs, optional API publish. **Humans:** [`HUMAN_GUIDE.md`](./HUMAN_GUIDE.md). **Code map:** [`ARCHITECTURE.md`](./ARCHITECTURE.md).

**Claude Code skill (workflow + drift notes):** [`claude-skills/orbit-pilot-operator/SKILL.md`](./claude-skills/orbit-pilot-operator/SKILL.md) — ships with the app; symlink or copy to `.claude/skills/orbit-pilot-operator/` (see [`claude-skills/README.md`](./claude-skills/README.md)). **`orbit --help`** and this file stay authoritative for flags and JSON.

## Install

```bash
cd apps/orbit-pilot && pip install -e ".[dev]"
# or: uv pip install -e ".[dev]"
orbit --help && orbit version
```

**Discovery:** `orbit --help` lists subcommands with short descriptions; `orbit <cmd> --help` for flags. Root help mentions `pipeline`, `schemas`, `validate-json`, and `python -m orbit_pilot`.

## End-to-end (machine)

```bash
orbit pipeline --launch launch.yaml --platforms seed_platforms.yaml --out out/ --json
# Exit 0 ⇔ ok_all (complete launch, doctor ready, check_run ok). Validate:
orbit validate-json pipeline - < pipeline.json
orbit check-run --run <run_dir> --json
orbit registry-lint --platforms seed_platforms.yaml --json
```

Then: `orbit publish --run … --platform … --json` (dry-run / `--execute`), `orbit mark-done`, **`orbit work --run … --json`** (next queue item + `submit_url` + `mark_done_command` + **`operator_agent_guide`** for local Claude/Codex/MCP/local-LLM shells; optional `--playwright` for `browser_assisted`), `orbit report/next/guide/audit/export --json`.

**Init preset:** `orbit init --preset walletradar --dir …` → WalletRadar-shaped `launch.yaml`.

**Doctor:** `browser_assisted` rows may include `browser_autofill_selectors`, `browser_autofill_note`, or `browser_auto_submit_note` (schema allows extra properties on each result).

## JSON Schemas

```bash
orbit schemas --json
orbit schemas --show plan
orbit validate-json plan - < plan.json
```

Aliases: `plan`, `doctor`, `generate`, `publish`, `pipeline`, `work`, `registry-lint`, … (see manifest).

## Browser automation (directories + MCP)

**`browser_assisted`** is planned when:

1. Registry **`browser_fallback_opt_in`** and **`risk.allow_browser_fallback`** + **`allow_browser_automation`**, or  
2. Registry planned as **`manual`** (Product Hunt, Crunchbase, directories, …) and **`risk.allow_browser_assist_manual`** + **`allow_browser_automation`** (both must be true; site must have **`submit_url`**).

Then **`orbit publish --run … --platform <slug> --execute --browser`** (env secret pair) runs Playwright against **`submit_url`**. **Local agents (Claude Code, Codex, Cursor, Chrome MCP, local LLM):** use **`orbit work --run … --json`** — read **`operator_agent_guide`**, navigate to **`submit_url`**, paste from **`payload`** / **`PROMPT_USER.txt`** (public copy only); then **`orbit mark-done`**. No LLM ships inside `orbit-pilot` on PyPI.

| Layer | Requirement |
|--------|-------------|
| Plan `browser_assisted` | Case (1) or (2) above; **`orbit plan --json`** shows `planned_mode` |
| Playwright assist | `ORBIT_ALLOW_BROWSER_AUTOMATION=1` + matching secret pair; **`ORBIT_BROWSER_CDP_URL`** (Kernel/hosted) or local Chromium / **`ORBIT_BROWSER_USER_DATA_DIR`** |
| Human / MCP assist | **`orbit work`** opens URL or outputs JSON for MCP; no Playwright required for paste-only flows |
| Autofill | `allow_browser_autofill` + `ORBIT_ALLOW_BROWSER_AUTOFILL=1` + registry `browser_form_selectors` |
| Auto-submit | `allow_browser_auto_submit` + `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT=1` + `submit` selector |

Install: `pip install -e ".[browser]"` && `playwright install chromium`. Never put **API tokens** in third-party forms; use env/keyring for **official API** publishers only.

## Scheduling

`schedule-add` / `schedule-list` / `schedule-run` / `schedule-cancel`; `ORBIT_SCHEDULE_PATH`, `ORBIT_SCHEDULE_POLL_SECONDS`, `ORBIT_SCHEDULE_ALLOW_ARBITRARY=1` to bypass argv allowlist.

## Webhook / TUI

`orbit serve`; optional `ORBIT_WEBHOOK_ALLOW_GENERATE`. TUI: `pip install 'orbit-pilot[tui]'` → `orbit tui --run …`.

## CI

`.github/workflows/orbit-pilot.yml`: single job — install **`[dev,browser]`**, **`playwright install --with-deps chromium`**, then **ruff**, **`orbit_pilot registry-lint`**, **full pytest** with **`CI` + `RUN_BROWSER_E2E`** so **no tests are skipped**. Live directory sites: operator-owned.

## Verify

```bash
cd apps/orbit-pilot && python3 -m ruff check src tests && python3 -m pytest -q
# Full parity with CI (includes Playwright E2E):
# CI=1 RUN_BROWSER_E2E=1 pip install -e '.[dev,browser]' && playwright install chromium && python3 -m pytest -q
```

**Specs:** `ideas/orbit-pilot/` · **Tracker:** `ideas/orbit-pilot/V1_ROADMAP.md`
