# Contributing to Orbit Pilot

Thanks for helping improve launch ops for humans and agents.

## Where things live

| Area | Path |
|------|------|
| Application | `apps/orbit-pilot/` |
| Specs / product docs | `ideas/orbit-pilot/` (no app code) |
| Agent playbook | `apps/orbit-pilot/AGENTS.md` |
| Claude skills | `apps/orbit-pilot/claude-skills/` (export with app; see `claude-skills/README.md`) |
| **Architecture overview** | **`apps/orbit-pilot/ARCHITECTURE.md`** (layers, schemas vs code, run dir) |

## Architecture (refactor targets)

- **`profile_loader.profile_from_parsed_yaml`** — single place to turn parsed `launch.yaml` dict into `LaunchProfile` (CLI `load_launch`, LangGraph `orchestrate`, keep in sync here only).
- **`policy.bundled_default_policy_path`** — default risk policy path for CLI, graphs, and webhooks.
- **`services/publishing`** — orchestration only; publisher HTTP stays under `publishers/`.
- **`cli.py`** — thin re-exports `main` / `serve_main` for setuptools entry points.
- **`cli_commands.py`** — argparse setup, all subcommands (including **`pipeline`** one-shot, **`work`** queue helper), `load_launch` for tests.
- **`services/work_queue.py`** — `work_next_payload`, default-browser open for `orbit work`.
- **`cli_io.py`** — shared CLI UX bits (e.g. `require_run_dir` for consistent JSON vs stderr errors).
- **`scheduler.py`** — JSONL schedule queue for deferred subprocess runs (fcntl lock on Unix; `schedule-cancel`).
- **`schedule_argv.py`** / **`schedule_recurrence.py`** / **`schedule_timezone.py`** — queue validation and scheduling helpers.
- **`browser_assist.py`** — Playwright: autofill, optional submit click; **`ORBIT_BROWSER_CDP_URL`** (`connect_over_cdp`) or **`ORBIT_BROWSER_USER_DATA_DIR`** (persistent local context) or local launch.
- **`registry_lint.py`** — `orbit registry-lint` for CI/agents (duplicate slugs, `unknown` URLs, prefer https).

## Development setup

```bash
cd apps/orbit-pilot
pip install -e ".[dev]"
# or: uv venv && source .venv/bin/activate && uv pip install -e ".[dev]"
ruff check src tests
pytest -q
# Full CI parity (Playwright E2E included):
# pip install -e ".[dev,browser]" && python -m playwright install chromium
# CI=1 RUN_BROWSER_E2E=1 pytest -q
```

Use **uv** if you prefer; the project is standard **pyproject.toml / setuptools** — no lockfile is committed in-repo.

## Design principles

1. **CLI stays thin** — parse args, delegate to `services/` and `graph`.
2. **Agents first** — stable `--json` outputs; validate with `orbit validate-json` and bundled schemas (`orbit schemas`).
3. **Safety** — default manual when uncertain; `publish --execute` only after readiness checks; never fake official APIs.
4. **Versioned manifests** — `run.json` includes `orbit_manifest_version` and `orbit_pilot_version`; bump `ORBIT_MANIFEST_VERSION` in `services/campaigns.py` only for incompatible shape changes.

## Adding a schema

1. Add `bundled/schemas/<name>.schema.json`.
2. Register in `schemas_cmd.SCHEMA_FILES` and optional `SCHEMA_ALIASES`.
3. Extend `tests/test_schema_validation.py` with a representative instance.

## Browser assist for `manual` registry rows

Policy **`risk.allow_browser_assist_manual: true`** with **`allow_browser_automation: true`** upgrades platforms planned as **`manual`** to **`browser_assisted`** (requires `submit_url`). Used for directories in `seed_platforms.yaml` without changing each row to `browser_fallback_opt_in`.

## Adding an official publisher

1. Implement `publish(payload, dry_run)` under `publishers/` returning `{status, url?, publisher, error?}`.
2. Register in `publishers/router.py` and `publishers/requirements.py`.
3. Extend `graph.plan_platform` for mode/token gating.
4. Add tests in `tests/test_publishers.py` or dedicated file.

## Pull requests

Follow the repo’s PR rules (Agent line, Co-authored-by, etc.). Keep changes focused; update `AGENTS.md` / `README.md` if you add commands or contracts.
