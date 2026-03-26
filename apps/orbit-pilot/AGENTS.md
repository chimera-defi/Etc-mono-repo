# Orbit Pilot — agent guide

**Package:** one `launch.yaml`, registry YAML, `out/<campaign>/run-*/` packs, optional API publish. **Humans:** [`HUMAN_GUIDE.md`](./HUMAN_GUIDE.md).

## Install

```bash
cd apps/orbit-pilot && pip install -e ".[dev]"
orbit --help && orbit version
```

## End-to-end (machine)

```bash
orbit pipeline --launch launch.yaml --platforms seed_platforms.yaml --out out/ --json
# Exit 0 ⇔ ok_all (complete launch, doctor ready, check_run ok). Validate:
orbit validate-json pipeline - < pipeline.json
orbit check-run --run <run_dir> --json
orbit registry-lint --platforms seed_platforms.yaml --json
```

Then: `orbit publish --run … --platform … --json` (dry-run / `--execute`), `orbit mark-done`, `orbit report/next/guide/audit/export --json`.

**Init preset:** `orbit init --preset walletradar --dir …` → WalletRadar-shaped `launch.yaml`.

## JSON Schemas

```bash
orbit schemas --json
orbit schemas --show plan
orbit validate-json plan - < plan.json
```

Aliases: `plan`, `doctor`, `generate`, `publish`, `pipeline`, `registry-lint`, … (see manifest).

## Browser automation (Playwright)

For `browser_assisted` (policy + `browser_fallback_opt_in` registry):

| Layer | Requirement |
|--------|-------------|
| Open browser | `risk.allow_browser_fallback` + `allow_browser_automation`; env `ORBIT_ALLOW_BROWSER_AUTOMATION=1` + secret pair; `orbit publish … --execute --browser` sets allow flag only |
| Autofill fields | `allow_browser_autofill` + `ORBIT_ALLOW_BROWSER_AUTOFILL=1` + registry `browser_form_selectors` (`title`/`body`/`url` keys) |
| Click submit | **Also** `allow_browser_auto_submit` + `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT=1` + selector `submit` or `submit_button` |
| Logged-in session | `ORBIT_BROWSER_USER_DATA_DIR` → `launch_persistent_context` (log in once headed, reuse path) |

Install: `pip install -e ".[browser]"` && `playwright install chromium`. Never put **API tokens** in form fields; use env/keyring.

## Scheduling

`schedule-add` / `schedule-list` / `schedule-run` / `schedule-cancel`; `ORBIT_SCHEDULE_PATH`, `ORBIT_SCHEDULE_POLL_SECONDS`, `ORBIT_SCHEDULE_ALLOW_ARBITRARY=1` to bypass argv allowlist.

## Webhook / TUI

`orbit serve`; optional `ORBIT_WEBHOOK_ALLOW_GENERATE`. TUI: `pip install 'orbit-pilot[tui]'` → `orbit tui --run …`.

## CI

`.github/workflows/orbit-pilot.yml`: ruff, pytest, `registry-lint`, job `browser-e2e` with `RUN_BROWSER_E2E=1`. Live directory sites: operator-owned.

## Verify

```bash
cd apps/orbit-pilot && ruff check src tests && pytest -q
```

**Specs:** `ideas/orbit-pilot/` · **Tracker:** `ideas/orbit-pilot/V1_ROADMAP.md`
