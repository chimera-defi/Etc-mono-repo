# Orbit Pilot — guide for AI agents

Orbit Pilot is a **CLI-first** launch operator: one canonical `launch.yaml`, a **platform registry** YAML, generated per-platform packs under `out/<campaign>/run-<ts>/`, and optional **official API** publishes (dry-run by default).

**Specs and product docs:** `ideas/orbit-pilot/` in this repo (**[`V1_ROADMAP.md`](../../ideas/orbit-pilot/V1_ROADMAP.md)** = single forward progress tracker). **Implementation:** this directory.

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
orbit registry-lint --platforms seed_platforms.yaml --json
```

## Agent-first workflow (recommended)

**Fast path (one command):** **`orbit pipeline --launch … --platforms … --out out/ --json`** runs plan → doctor → generate → `check-run` and prints one JSON object with `ok_all`, `plan`, `doctor`, `generate`, `check_run`. Exit **0** only if launch fields are complete, every doctor row is `ready`, and `check_run.ok` is true (set tokens / `publish.*` first or expect exit **1** with full diagnostics). Schema: `orbit validate-json pipeline - < pipeline.json`.

**WalletRadar-shaped stub:** **`orbit init --preset walletradar --dir ~/my-launch`** writes `launch.yaml` from `launch.walletradar.sample.yaml` (edit URLs/repo before generate).

**Step-by-step** (same as pipeline internals):

1. **`orbit init`** in a working directory (or use existing `launch.yaml` + registry paths).
2. **`orbit plan --launch … --platforms … --json`**
3. **`orbit doctor --launch … --platforms … --json`**
4. **`orbit generate --launch … --platforms … --out out/ --json`**
5. **Human or browser:** manual posts from packs; **`orbit mark-done --run <run_dir> --platform <slug> --live-url <url> [--note "…"]`**
6. **`orbit publish --run … --platform github --json`** — dry-run unless **`--execute`**
7. **Status:** **`orbit report --json`**, **`orbit next --json`**, **`orbit guide --json`**, **`orbit audit --run … --json`**, **`orbit export --run … --format json`**

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

- **`--timezone IANA`** with a naive `--due` interprets local wall time in that zone (stored as UTC `due_at`).
- **`--recurrence daily|weekly|monthly`**: after a job completes, a new pending row is appended with the next `due_at` (UTC).
- **Argv safety:** first command must be `orbit` or `python -m orbit_pilot` unless **`ORBIT_SCHEDULE_ALLOW_ARBITRARY=1`**.

## V1: browser assist (Playwright)

For registry rows with **`browser_fallback_opt_in`**, policy can enable assisted mode:

- Set **`risk.allow_browser_fallback: true`** and **`risk.allow_browser_automation: true`** in your policy YAML.
- **`generate`** then plans **`browser_assisted`** (manual pack still written; **`orbit next`** surfaces it).
- **`orbit publish --run … --platform <slug> --execute`** requires:
  - **`ORBIT_ALLOW_BROWSER_AUTOMATION=1`**
  - **`ORBIT_BROWSER_AUTOMATION_SECRET`** and **`ORBIT_BROWSER_AUTOMATION_CONFIRM`** (same value)
  - Optional: **`orbit publish … --browser`** sets **`ORBIT_ALLOW_BROWSER_AUTOMATION=1`** only (you still must set the secret pair).
- Install: **`pip install 'orbit-pilot[browser]'`** then **`playwright install chromium`**.
- Default: opens **`submit_url`** in Chromium; operator pastes from **`PROMPT_USER.txt`**, then **`orbit mark-done`**. Headed wait: **`ORBIT_BROWSER_WAIT_MS`** (default 300000). Headless: **`ORBIT_BROWSER_HEADLESS=1`** (default).
- **Optional autofill (supervised):** set **`risk.allow_browser_autofill: true`** in policy, add **`browser_form_selectors`** in the platform registry (CSS for `title`, `body`, `url` / aliases), and set **`ORBIT_ALLOW_BROWSER_AUTOFILL=1`**. Orbit types into fields; **the human must still review and click submit**. **You are responsible for each site’s Terms of Service** — autofill can still violate anti-automation or spam rules even with a human present.

## Risk policy

Default bundled policy is used unless **`--policy path/to/risk.yaml`**. Policy can set `platforms.<slug>.enabled: false` or `mode: manual`. **`run.json`** stores `policy_path` for **`orbit regenerate`**. V1 adds **`risk.allow_browser_automation`** (see above).

## Machine-readable contracts

| Output | Command |
|--------|---------|
| Plan preview | `orbit plan --json` |
| Readiness | `orbit doctor --json` |
| One-shot plan+doctor+generate+check | `orbit pipeline --json` |
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
- Do not enable **autofill** unless the operator has confirmed the target site allows this use; prefer manual paste when unsure.
- Do not bypass **`ORBIT_WEBHOOK_SECRET`** when the server sets it.
- Treat **credentials** as secrets; prefer env + keyring, never commit tokens.

## What is tested in CI

GitHub Actions (`.github/workflows/orbit-pilot.yml`) runs **ruff** + **pytest** on every push/PR that touches `apps/orbit-pilot/`. That includes:

- Core planning, generate, publish (mocked), policy, schemas, `check-run`, webhook (TestClient), scheduler, timezone/recurrence, argv allowlist
- **`browser_assist` / Playwright paths are mocked** in tests — CI does **not** install browsers or drive real Chromium
- **Playwright E2E:** CI job `browser-e2e` runs `tests/test_browser_playwright_e2e.py` with `RUN_BROWSER_E2E=1` after `playwright install --with-deps chromium`. Locally: `pip install -e ".[browser]" && python -m playwright install chromium && RUN_BROWSER_E2E=1 pytest tests/test_browser_playwright_e2e.py -v`
- **Live site E2E** (`orbit publish` against real URLs) remains manual / operator-owned

Bundled **`seed_platforms.yaml`** is checked against **`ideas/orbit-pilot/PLATFORM_MATRIX.md`** in `tests/test_platform_matrix_parity.py` (same platforms, same order/slugs). That matrix + YAML are the repo’s **canonical “initial list”**, not every backlink site on the web.

## Verify changes

```bash
cd apps/orbit-pilot
ruff check src tests
pytest -q
```
