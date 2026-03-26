# Pilot launch run (Milestone 4)

Operator checklist to complete **V1 milestone 4** in [`V1_ROADMAP.md`](./V1_ROADMAP.md). Tick boxes and paste paths/URLs as you go.

## Before

- [ ] `cd apps/orbit-pilot && pip install -e ".[dev]"` (or full install with `[browser]` if using assist)
- [ ] Copy or init: `orbit init --dir ~/my-launch` then edit `launch.yaml` (real product name, URL, tagline, summary)
- [ ] Registry: start from `seed_platforms.yaml`; trim or extend; run `orbit registry-lint --platforms …`
- [ ] Optional: custom `risk.yaml` (defaults from `orbit init`)

## Run pipeline

- [ ] `orbit plan --launch … --platforms … --json` → fix `missing_fields` / `questions` until satisfied
- [ ] `orbit doctor --launch … --platforms … --json` → note `missing_secrets` / `missing_payload` for API rows
- [ ] `orbit generate --launch … --platforms … --out out/ --json` → record `run_dir`
- [ ] `orbit check-run --run <run_dir> --json`
- [ ] `orbit guide --run <run_dir> --json` and/or `orbit next --run <run_dir> --json`

## Publish / complete

- [ ] For each manual platform: post from pack → `orbit mark-done --run … --platform … --live-url … [--note …]`
- [ ] For each official row: `orbit publish --run … --platform … --json` (dry-run) then `--execute` when ready
- [ ] `orbit report --run … --json` and `orbit audit --run … --json` for closure

## Record outcome (for roadmap)

- [ ] Note: campaign id, `run_dir`, date, platforms completed vs skipped, blockers
- [ ] Optional: attach or link `orbit export --run … --format html` report

When done, mark milestone 4 in `TASKS.md` / `V1_ROADMAP.md` or add a one-line entry under **Pilot runs** in your ops log.

## Template log line (paste when complete)

```
Pilot run YYYY-MM-DD: campaign=<id> run_dir=<path> completed=<slugs> skipped=<slugs> notes=<url-or-doc>
```
