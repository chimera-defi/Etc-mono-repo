---
name: orbit-pilot-operator
description: |
  Run Orbit Pilot launch workflows from Claude: CLI as source-of-truth contracts, optional browser
  (computer use / MCP) for manual sites, Playwright path via orbit work --playwright or orbit publish.
  Use when: user is launching a product, clearing the manual queue, or wants agent-driven orbit
  pipeline + mark-done. Repo paths: apps/orbit-pilot/ (code), ideas/orbit-pilot/ (specs).
metadata:
  author: Etc mono-repo
  version: "1.0.0"
  companion_docs:
    - apps/orbit-pilot/AGENTS.md
    - apps/orbit-pilot/HUMAN_GUIDE.md
    - ideas/orbit-pilot/SPEC.md
allowed-tools:
  - Read
  - Grep
  - Bash
  - Edit
---

# Orbit Pilot operator (Claude skill)

Orbit Pilot is **CLI-first**: one `launch.yaml`, a platform registry YAML, generated packs under `out/<campaign>/run-*/`, JSON outputs, and audit. This skill is the **high-level procedure**; the **executable contract** is the CLI + bundled JSON Schemas.

## Three layers (use together, catch drift)

| Layer | What it is | Drift risk |
|-------|------------|------------|
| **This skill** | Narrative workflow for Claude + optional browser tools | Doc lag vs CLI |
| **CLI + schemas** | `orbit …`, `orbit validate-json`, `orbit schemas` | Code is canonical for flags/output shape |
| **Registry YAML** | `browser_form_selectors`, `submit_url`, modes | Sites change DOM; selectors break |

**Drift checks (run periodically or when behavior feels wrong):**

1. Read `apps/orbit-pilot/AGENTS.md` and `HUMAN_GUIDE.md` — if this skill disagrees, **trust the repo docs**, then update this skill.
2. `orbit --help` and `orbit <cmd> --help` — new flags win.
3. In repo: `cd apps/orbit-pilot && pytest -q` — schemas and CLI payloads stay aligned in CI.
4. If **Playwright autofill** misbehaves but **computer-use** still works, suspect **registry selectors** or site DOM change — update `seed_platforms.yaml` / your registry copy, not only this skill.

## Default agent workflow (machine-first)

Run from the directory that contains `launch.yaml` and the registry (or use absolute paths).

```bash
cd apps/orbit-pilot   # or the user's init dir
orbit pipeline --launch /path/to/launch.yaml --platforms /path/to/seed_platforms.yaml --out out/ --json
```

- Exit **0** only if `ok_all` is true (complete launch, doctor ready, check-run OK). Otherwise fix `doctor` / launch fields and rerun.
- Validate: `orbit validate-json pipeline - < pipeline.json`

Then either:

- **API platforms:** `orbit publish --run <run_dir> --platform <slug> --json` (dry-run) then `--execute` when ready.
- **Manual / browser queue:** loop **`orbit work --run <run_dir> --json`** (see below).

## Human queue loop (`orbit work`)

**JSON for agents:**

```bash
orbit work --run /path/to/run-* --json
```

Parse the object:

- **`kind: "empty"`** — queue clear for manual/browser-assist items; switch to API publishes or stop.
- **`kind: "task"`** — use **`submit_url`**, **`prompt`**, **`payload`**, **`mark_done_command`**, optional **`playwright_assist_command`**.

**Paths:**

- **`--no-open`** — if you will open the URL via computer-use / MCP instead of the OS default browser.

**With Claude computer-use / browser MCP (user’s Chrome):**

1. Call `orbit work --run … --json --no-open` (or allow open — redundant if you also navigate).
2. Navigate to **`submit_url`** in the user’s browser; paste or type from **`prompt`** / pack text (**public marketing copy only** — never API tokens or private keys into third-party forms).
3. After the user confirms the listing is live, run the **`mark_done_command`** with the real URL (replace `<URL>`), or invoke `orbit mark-done --run … --platform … --live-url … --json`.

**Playwright inside Orbit (no computer-use):**

- **`browser_assisted` only:** `orbit work --run … --playwright` (sets automation allow flag; user must still set **`ORBIT_BROWSER_AUTOMATION_SECRET`** + **`ORBIT_BROWSER_AUTOMATION_CONFIRM`**, install `orbit-pilot[browser]`, etc.) — see `AGENTS.md`.
- **Hosted / remote Chrome (CDP):** set **`ORBIT_BROWSER_CDP_URL`** to the WebSocket or HTTP debugger URL (e.g. Kernel). Playwright uses **`connect_over_cdp`**; session cookies stay on that browser. Do not paste CDP URLs containing secrets into chats or commits.

## Safety (non-negotiable)

- Do not **`publish --execute`** or drive browser posting without **explicit user approval** for that platform.
- **Credentials:** env + keyring for API publishers; **never** paste secrets into directory site forms.
- Respect site **Terms of Service**; autofill / automation can still be disallowed even with a human nearby.

## Repo map

- **Implementation:** `apps/orbit-pilot/`
- **Specs / matrix:** `ideas/orbit-pilot/`
- **Agent reference:** `apps/orbit-pilot/AGENTS.md`
- **Human runbook:** `apps/orbit-pilot/HUMAN_GUIDE.md`

## Maintaining this skill

When you add CLI commands or change JSON shapes: update this file’s commands section and ensure `ideas/orbit-pilot/SAMPLE_OUTPUTS.md` / `AGENTS.md` match. Treat mismatches between this skill and **`orbit --help`** as a **bug in the skill** until fixed.
