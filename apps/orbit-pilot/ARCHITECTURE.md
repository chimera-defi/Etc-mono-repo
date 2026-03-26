# Orbit Pilot — architecture

One page: **how the pieces fit**, especially **JSON Schemas vs Python** and **where to look in the tree**.

## 1. Two trees (don’t mix them up)

| Tree | Role |
|------|------|
| **`ideas/orbit-pilot/`** | Product spec, platform matrix, roadmaps, sample JSON *snippets* for humans. **No runtime code.** |
| **`apps/orbit-pilot/`** | The **Python package** (`orbit_pilot`), CLI, tests, bundled YAML + **authoritative JSON Schemas**, agent/human guides. |

When you “change behavior,” you edit **`apps/orbit-pilot`**. When you “change intent or checklist,” you often edit **`ideas/orbit-pilot`** too.

## 2. End-to-end data flow (mental model)

```text
launch.yaml + platforms.yaml + optional risk policy
        │
        ▼
   plan / doctor     ← graph + policy + registry (read-only)
        │
        ▼
   generate          ← orchestrate + manual_pack + assets → run_dir/
        │              (per platform: payload.json, meta.json, PROMPT_USER.txt, …)
        ▼
   publish / mark-done / work / report …
        │
        ▼
   SQLite + audit.jsonl  (state + append-only log)
```

- **Inputs** are YAML on disk; **outputs** are files under `out/<campaign>/run-<ts>/` plus stdout **`--json`** when requested.
- **`publish`** calls **`publishers/`** for **`official_api`**, or **`browser_assist`** (Playwright / CDP) when **`planned_mode`** is **`browser_assisted`** (from registry **`browser_fallback_opt_in`** or from **`manual`** rows when policy sets **`allow_browser_assist_manual`** + **`allow_browser_automation`**). **`orbit work --json`** adds **`operator_agent_guide`** so a **local** coding agent (Claude/Codex/MCP/local LLM) can drive the user’s browser without bundling an LLM in PyPI.

## 3. Python package layout (layers)

Think **outside → in**:

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Entry** | `cli.py`, `__main__.py` | `orbit` / `python -m orbit_pilot` → `cli_commands.main` |
| **CLI** | `cli_commands.py` | argparse, dispatch, print JSON or text |
| **I/O helpers** | `cli_io.py` | e.g. `require_run_dir` for consistent errors |
| **Domain config** | `config.py`, `profile_loader.py`, `registry.py`, `policy.py`, `models.py` | Load YAML → typed structures; risk decisions |
| **Orchestration** | `orchestrate.py`, `graph.py` | LangGraph plan/generate pipelines |
| **Services** | `services/*` | **Use cases**: `generation`, `publishing`, `reporting`, `validation`, `campaigns`, `export_run`, `work_queue` |
| **Side effects** | `publishers/*`, `browser_assist.py`, `audit.py`, `scheduler.py` | HTTP/API, Playwright, DB + JSONL, deferred jobs |
| **Bundled assets** | `bundled/*.yaml`, `bundled/schemas/*.json` | Default registry, risk policy, **JSON Schemas** |
| **Optional** | `webhook.py`, `tui_app.py` | FastAPI hook, Textual UI |

**Rule of thumb:** add business logic in **`services/`** or **`graph.py`**; keep **`cli_commands`** thin (parse → call one function → emit).

## 4. JSON Schemas vs Python (the confusing bit)

| What | Where | Purpose |
|------|--------|---------|
| **CLI `--json` output** | Produced by Python (`emit`, `json.dumps`, etc.) | What agents parse at runtime. |
| **Bundled `.schema.json` files** | `src/orbit_pilot/bundled/schemas/` | **Optional contract tests** + **`orbit validate-json`** — “does this JSON look like `orbit doctor --json`?” |
| **Aliases** | `schemas_cmd.SCHEMA_ALIASES` (`plan` → `plan-output`, …) | Short names for `validate-json`. |

**Important:** Schemas use **`additionalProperties: true`** in many places so publishers can add fields without breaking validation. They **document and guard shape**, they are not the only source of truth — **the Python that builds the dict is**.

**Workflow for agents:**

1. Run `orbit <cmd> --json` and capture stdout.
2. Optionally `orbit validate-json <alias> - < file.json` (or pipe).
3. If validation fails after a CLI upgrade, compare **`orbit schemas --show <alias>`** to your parser and update one side.

CI **`tests/test_schema_validation.py`** keeps representative payloads aligned with schemas.

## 5. Run directory (`run-*`) essentials

| Artifact | Meaning |
|----------|---------|
| `run.json` | Manifest: launch path, registry path, policy path, versions |
| `orbit.sqlite` | Latest row per platform (submission status) |
| `audit.jsonl` | Append-only timeline |
| `<slug>/meta.json` | `planned_mode`, `submit_url`, selectors, … |
| `<slug>/payload.json` | Title/body/url etc. for that platform |

**`orbit check-run`** validates manifest + paths; **`orbit export`** builds shareable bundles.

## 6. Policy vs `planned_mode` (keep SPEC + packs aligned)

| Registry `mode` (from YAML) | `plan_platform` base | After `apply_risk_policy` (typical) |
|----------------------------|----------------------|-------------------------------------|
| `browser_fallback_opt_in` | `manual` | `skipped` if `allow_browser_fallback` false; else `browser_assisted` if `allow_browser_automation`; else `browser_fallback` |
| `manual`, `manual_by_default`, … | `manual` | `browser_assisted` if **`allow_browser_assist_manual`** + **`allow_browser_automation`** + non-empty `submit_url`; else stays `manual` |
| `official_api` (with token) | `official_api` | May downgrade to `manual` if risk exceeds `risk.tolerance` |

**`browser_assisted`** packs (`README.txt` / `PROMPT_USER.txt`) describe Playwright env gates; they apply to **both** upgrade paths above.

## 7. Related docs

| Doc | Use |
|-----|-----|
| [`AGENTS.md`](./AGENTS.md) | Commands, env vars, agent workflows |
| [`HUMAN_GUIDE.md`](./HUMAN_GUIDE.md) | Operator steps |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Module-level “where to edit” bullets |
| [`ideas/orbit-pilot/SPEC.md`](../ideas/orbit-pilot/SPEC.md) | Product / config contract |
| [`ideas/orbit-pilot/ARCHITECTURE_DIAGRAMS.md`](../ideas/orbit-pilot/ARCHITECTURE_DIAGRAMS.md) | Broader product diagrams (if present) |

This file is the **app-centric** map; the ideas folder stays the **spec** layer. When behavior changes, update **this file**, **`SPEC.md` Publish Router + Config Contract**, and **`manual_pack`** assist text in one pass.
