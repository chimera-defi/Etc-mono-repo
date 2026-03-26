# Orbit Pilot — agent guide

**Package:** one `launch.yaml`, registry YAML, `out/<campaign>/run-*/` packs, optional API publish. **Humans:** [`HUMAN_GUIDE.md`](./HUMAN_GUIDE.md).

**Claude Code skill (workflow + drift notes):** [`.claude/skills/orbit-pilot-operator/SKILL.md`](../../.claude/skills/orbit-pilot-operator/SKILL.md) — high-level procedure; **`orbit --help`** and this file stay authoritative for flags and JSON.

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

Then: `orbit publish --run … --platform … --json` (dry-run / `--execute`), `orbit mark-done`, **`orbit work --run … --json`** (next queue item + `submit_url` + `mark_done_command`; optional `--playwright` for `browser_assisted`), `orbit report/next/guide/audit/export --json`.

**Init preset:** `orbit init --preset walletradar --dir …` → WalletRadar-shaped `launch.yaml`.

**Doctor:** `browser_assisted` rows may include `browser_autofill_selectors`, `browser_autofill_note`, or `browser_auto_submit_note` (schema allows extra properties on each result).

## JSON Schemas

```bash
orbit schemas --json
orbit schemas --show plan
orbit validate-json plan - < plan.json
```

Aliases: `plan`, `doctor`, `generate`, `publish`, `pipeline`, `work`, `registry-lint`, … (see manifest).

## Browser automation (Playwright)

For `browser_assisted` (policy + `browser_fallback_opt_in` registry):

| Layer | Requirement |
|--------|-------------|
| Open browser | Default OS browser: **`orbit work --run …`** (submit URL). Playwright: `risk.allow_browser_fallback` + `allow_browser_automation`; env `ORBIT_ALLOW_BROWSER_AUTOMATION=1` + secret pair; **`orbit work --run … --playwright`** or `orbit publish … --execute --browser` |
| Autofill fields | `allow_browser_autofill` + `ORBIT_ALLOW_BROWSER_AUTOFILL=1` + registry `browser_form_selectors` (`title`/`body`/`url` keys) |
| Click submit | **Also** `allow_browser_auto_submit` + `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT=1` + selector `submit` or `submit_button` |
| Logged-in session | **`ORBIT_BROWSER_CDP_URL`** → `connect_over_cdp` (hosted Chrome / Kernel with persisted profile), or **`ORBIT_BROWSER_USER_DATA_DIR`** → local `launch_persistent_context` |

Install: `pip install -e ".[browser]"` && `playwright install chromium`. Never put **API tokens** in form fields; use env/keyring.

## Scheduling

`schedule-add` / `schedule-list` / `schedule-run` / `schedule-cancel`; `ORBIT_SCHEDULE_PATH`, `ORBIT_SCHEDULE_POLL_SECONDS`, `ORBIT_SCHEDULE_ALLOW_ARBITRARY=1` to bypass argv allowlist.

## Webhook / TUI

`orbit serve`; optional `ORBIT_WEBHOOK_ALLOW_GENERATE`. TUI: `pip install 'orbit-pilot[tui]'` → `orbit tui --run …`.

## CI

`.github/workflows/orbit-pilot.yml`: single job — install **`[dev,browser]`**, **`playwright install --with-deps chromium`**, then **ruff**, **`orbit_pilot registry-lint`**, **full pytest** with **`CI` + `RUN_BROWSER_E2E`** so **no tests are skipped**. Live directory sites: operator-owned.

## Verify

```bash
cd apps/orbit-pilot && ruff check src tests && pytest -q
# Full parity with CI (includes Playwright E2E):
# CI=1 RUN_BROWSER_E2E=1 pip install -e '.[dev,browser]' && playwright install chromium && pytest -q
```

**Specs:** `ideas/orbit-pilot/` · **Tracker:** `ideas/orbit-pilot/V1_ROADMAP.md`
