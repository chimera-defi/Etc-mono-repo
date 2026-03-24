# Orbit Pilot — guide for AI agents

Orbit Pilot is a **CLI-first** launch operator: one canonical `launch.yaml`, a **platform registry** YAML, generated per-platform packs under `out/<campaign>/run-<ts>/`, and optional **official API** publishes (dry-run by default).

**Specs and product docs:** `ideas/orbit-pilot/` in this repo. **Implementation:** this directory.

## Install (CI / sandboxes)

```bash
cd apps/orbit-pilot
pip install -e ".[dev]"   # pytest, ruff, httpx, textual (for tests + optional TUI)
orbit --help
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

## Risk policy

Default bundled policy is used unless **`--policy path/to/risk.yaml`**. Policy can set `platforms.<slug>.enabled: false` or `mode: manual`. **`run.json`** stores `policy_path` for **`orbit regenerate`**.

## Machine-readable contracts

| Output | Command |
|--------|---------|
| Plan preview | `orbit plan --json` |
| Readiness | `orbit doctor --json` |
| Generate summary | `orbit generate --json` |
| Publish results | `orbit publish --json` |
| Queue / next manual | `orbit next --json`, `orbit guide --json` |
| Full run snapshot | `orbit export --format json` |
| Audit timeline | `orbit audit --json` |
| HTML shareable report | `orbit export --format html` (writes `report.html` in run dir if `-o` omitted) |

### JSON Schema (validate agent parsers)

Bundled under the package as `orbit_pilot/bundled/schemas/*.schema.json`.

```bash
orbit schemas                 # tab-separated: id<TAB>absolute_path
orbit schemas --json          # manifest with all paths
orbit schemas --show plan-output   # print one schema document
```

Use any Draft 2020-12 validator (e.g. `jsonschema` package in your harness) against CLI stdout. Schemas use `additionalProperties: true` where publishers may add fields.

## Optional: TUI and webhook

- **TUI:** `pip install 'orbit-pilot[tui]'` then **`orbit tui --run <run_dir>`** — table of platforms, refresh `r`, quit `q`.
- **Webhook:** **`orbit serve`** — `POST /hooks/launch` with optional **`ORBIT_WEBHOOK_ALLOW_GENERATE=1`** and body `launch_path`, `platforms_path`, `out` to generate on the server (use only in trusted environments).

## Safety (do not violate)

- Do not **`publish --execute`** on manual-only or high-risk platforms without explicit human approval.
- Do not bypass **`ORBIT_WEBHOOK_SECRET`** when the server sets it.
- Treat **credentials** as secrets; prefer env + keyring, never commit tokens.

## Verify changes

```bash
cd apps/orbit-pilot
ruff check src tests
pytest -q
```
