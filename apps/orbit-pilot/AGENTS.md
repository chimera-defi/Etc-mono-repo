# Orbit Pilot — guide for AI agents

Orbit Pilot is a **CLI-first** launch operator: one canonical `launch.yaml`, a **platform registry** YAML, generated per-platform packs under `out/<campaign>/run-<ts>/`, and optional **official API** publishes (dry-run by default).

**Specs and product docs:** `ideas/orbit-pilot/` in this repo. **Implementation:** this directory.

## Install (CI / sandboxes)

```bash
cd apps/orbit-pilot
pip install -e ".[dev]"   # pytest, ruff, httpx, textual (for tests + optional TUI)
orbit --help
orbit version
```

After `generate`, sanity-check a run directory:

```bash
orbit check-run --run out/<campaign>/run-* --json
```

## Agent-first workflow (recommended)

1. **`orbit init`** in a working directory (or use existing `launch.yaml` + registry paths).
2. **`orbit plan --launch … --platforms … --json`** — parse `missing_fields`, `questions`, `platform_preview` (each: `slug`, `planned_mode`, `risk`, `reason`). Fill gaps in `launch.yaml`; re-run until satisfied.
3. **`orbit doctor --launch … --platforms … --json`** — check `results[].ready`, `missing_secrets`, `missing_payload` for `official_api` rows.
4. **`orbit generate --launch … --platforms … --out out/ --json`** — capture `run_dir`; every platform gets a folder with `payload.json`, `PROMPT_USER.txt`, `meta.json`, optional `assets/`.
5. **Human or browser:** manual posts from packs; record with **`orbit mark-done --run <run_dir> --platform <slug> --live-url <url> [--note "…"]`**.
6. **`orbit publish --run … --platform github --json`** — dry-run unless **`--execute`** (only after doctor says ready and human approves).
7. **Status:** **`orbit report --json`**, **`orbit next --json`**, **`orbit guide --json`**, **`orbit audit --run … --json`**, **`orbit export --run … --format json`**.

Always prefer **`--json`** for machine parsing. Paths in JSON are strings; expand relative paths from the operator cwd.

## V1: scheduling

Defer work to a JSONL queue (default `~/.orbit-pilot/schedule.jsonl`, override with **`ORBIT_SCHEDULE_PATH`**):

```bash
orbit schedule-add --due 2026-03-25T18:00:00Z -- orbit publish --run out/c/run-1 --platform github --execute --json
orbit schedule-list --json
orbit schedule-run              # run due jobs once
orbit schedule-run --loop       # daemon; poll ORBIT_SCHEDULE_POLL_SECONDS (default 60)
orbit schedule-cancel --id <uuid> [--json]
```

Queue file updates use a file lock on Unix (`fcntl`) so concurrent daemons do not corrupt JSONL.

## V1: browser assist (Playwright)

For registry rows with **`browser_fallback_opt_in`**, policy can enable assisted mode:

- Set **`risk.allow_browser_fallback: true`** and **`risk.allow_browser_automation: true`** in your policy YAML.
- **`generate`** then plans **`browser_assisted`** (manual pack still written; **`orbit next`** surfaces it).
- **`orbit publish --run … --platform <slug> --execute`** requires:
  - **`ORBIT_ALLOW_BROWSER_AUTOMATION=1`**
  - **`ORBIT_BROWSER_AUTOMATION_SECRET`** and **`ORBIT_BROWSER_AUTOMATION_CONFIRM`** (same value)
  - Optional: **`orbit publish … --browser`** sets **`ORBIT_ALLOW_BROWSER_AUTOMATION=1`** only (you still must set the secret pair).
- Install: **`pip install 'orbit-pilot[browser]'`** then **`playwright install chromium`**.
- Behavior: opens **`submit_url`** in Chromium; **no auto-fill** — operator pastes from **`PROMPT_USER.txt`**, then **`orbit mark-done`**. Headed wait: **`ORBIT_BROWSER_WAIT_MS`** (default 300000). Headless: **`ORBIT_BROWSER_HEADLESS=1`** (default).

## Risk policy

Default bundled policy is used unless **`--policy path/to/risk.yaml`**. Policy can set `platforms.<slug>.enabled: false` or `mode: manual`. **`run.json`** stores `policy_path` for **`orbit regenerate`**. V1 adds **`risk.allow_browser_automation`** (see above).

## Machine-readable contracts

| Output | Command |
|--------|---------|
| Plan preview | `orbit plan --json` |
| Readiness | `orbit doctor --json` |
| Generate summary | `orbit generate --json` |
| Publish results | `orbit publish --json` |
| Queue / next manual | `orbit next --json`, `orbit guide --json` |
| Full run snapshot | `orbit export --format json` (add `--json` for `{"error":…}` if run path is wrong) |
| Audit timeline | `orbit audit --json` |
| HTML shareable report | `orbit export --format html` (writes `report.html` in run dir if `-o` omitted) |

### JSON Schema (validate agent parsers)

Bundled under the package as `orbit_pilot/bundled/schemas/*.schema.json`.

```bash
orbit schemas                 # tab-separated: id<TAB>absolute_path
orbit schemas --json          # manifest with paths + command_alias per schema
orbit schemas --show plan     # print schema (alias or id, e.g. plan-output)
orbit validate-json plan - < plan.json   # exit 0 if valid; stderr errors or --json
orbit validate-json report out.json --json
```

`jsonschema` is a **runtime** dependency so `orbit validate-json` works after `pip install orbit-pilot`. Schemas use `additionalProperties: true` where publishers may add fields.

**CI:** `tests/test_schema_validation.py` keeps schemas aligned with real payloads.

## Optional: TUI and webhook

- **TUI:** `pip install 'orbit-pilot[tui]'` then **`orbit tui --run <run_dir>`** — table of platforms, refresh `r`, quit `q`.
- **Webhook:** **`orbit serve`** — `POST /hooks/launch` with optional **`ORBIT_WEBHOOK_ALLOW_GENERATE=1`** and body `launch_path`, `platforms_path`, `out` to generate on the server (use only in trusted environments).

## Safety (do not violate)

- Do not **`publish --execute`** on manual-only or high-risk platforms without explicit human approval.
- Do not enable **browser automation** without explicit operator consent and a matching secret pair; never commit **`ORBIT_BROWSER_AUTOMATION_SECRET`**.
- Do not bypass **`ORBIT_WEBHOOK_SECRET`** when the server sets it.
- Treat **credentials** as secrets; prefer env + keyring, never commit tokens.

## Verify changes

```bash
cd apps/orbit-pilot
ruff check src tests
pytest -q
```
