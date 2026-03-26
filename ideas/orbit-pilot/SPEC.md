## Orbit Pilot Technical Spec

**Product progress:** [`V1_ROADMAP.md`](./V1_ROADMAP.md) (V1 scope, done / next / deferred).

### Summary
Build a launch orchestration system with:
1. canonical launch profile storage,
2. platform registry and policy engine,
3. content variation and asset adaptation,
4. official API publishers,
5. manual queueing,
6. optional webhook trigger,
7. explicit browser-fallback guardrails.

### High-Level Architecture
See `ARCHITECTURE_DIAGRAMS.md` (product-level). **Implementation map (Python layers, JSON Schemas, run dir):** [`apps/orbit-pilot/ARCHITECTURE.md`](../../apps/orbit-pilot/ARCHITECTURE.md).

### Core Components

#### 1) Launch Profile Store
- canonical product facts
- short / medium / long descriptions
- founder and company metadata
- links, screenshots, logos, tags
- optional `cta_policy`: `default_include_link` and per-platform `platforms.<slug>.include_link` (omit tracked URL from generated body copy when false)

#### 2) Platform Registry
- platform name and official URL
- submit URL
- automation mode: `official_api | manual | browser_fallback_opt_in | unknown`
- risk level
- required fields
- image constraints (`image_constraints.max_width` / `max_height`; falls back to built-in presets when absent)
- optional `cta_in_body` (default true): when false, generated body omits primary tracked link for that platform
- optional `browser_form_selectors`: map of field → CSS selector for optional supervised Playwright autofill (`title`/`body`/`url` keys, plus `submit` / `submit_button` / `submit_selector` for optional click-to-submit); only used when operator policy and env gates allow — operators must verify each site’s Terms of Service
- notes on moderation and commercial restrictions

#### 3) Content Generation Layer
- platform-native tone packs
- length-aware variants
- duplicate-avoidance checks
- optional CTA policy per platform

#### 4) Link Processing
- canonicalization
- UTM appending
- campaign naming rules
- platform-specific tracking output

#### 5) Image Processing
- resize, crop, compress
- stable filenames
- alt text retention

#### 6) Publish Router
- official publishers
- manual queue
- browser fallback gate
- **V1 browser assist** (optional): when operator risk policy sets `allow_browser_fallback` and `allow_browser_automation`, registry `browser_fallback_opt_in` can plan as `browser_assisted`; `publish --execute` drives `submit_url` via Playwright — **local Chromium**, **`ORBIT_BROWSER_USER_DATA_DIR`** (persistent context), or **`ORBIT_BROWSER_CDP_URL`** (`connect_over_cdp`, e.g. hosted Chrome / Kernel); optional **supervised autofill** (`allow_browser_autofill` + `ORBIT_ALLOW_BROWSER_AUTOFILL` + `browser_form_selectors`); optional **auto-submit** (`allow_browser_auto_submit` + `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT` + submit selector); gated by env `ORBIT_ALLOW_BROWSER_AUTOMATION` + matching secret pair; `orbit doctor` may surface `browser_autofill_note`, `browser_auto_submit_note`, `browser_autofill_selectors` on `browser_assisted` rows
- **V1 scheduling**: JSONL job queue (`orbit schedule-add`, `schedule-list`, `schedule-run`, `schedule-cancel`); file lock on Unix; daemon runs subprocess argv at or after due ISO time

#### 7) Logging and Audit
- every decision logged
- publish attempt logged
- skip reason logged
- final live URL logged if available
- append-only JSONL per run (`audit.jsonl`); CLI `orbit audit --run …` to inspect

### State Model
- `LaunchProfile`
- `PlatformRecord`
- `CredentialRef`
- `SubmissionDraft`
- `SubmissionDecision`
- `SubmissionAttempt`
- `SubmissionResult`
- `AuditEvent`

### Default Implementation
1. Python CLI + services with LangGraph for plan and full generate pipelines (`orbit_pilot.orchestrate`); readiness via `orbit doctor --json` (including browser_assisted Playwright checks and optional notes above).
2. YAML: launch profile, platform registry, risk policy (`risk.*`, `platforms.<slug>.enabled|mode`).
3. OS keychain-backed credentials via `keyring`.
4. SQLite submission history + append-only `audit.jsonl`; optional operator notes on manual completion.
5. FastAPI webhook (`orbit serve`): health + launch hook; optional server-side generate when `ORBIT_WEBHOOK_ALLOW_GENERATE=1` and payload includes paths.
6. Operator web UI: deferred (see `FRONTEND_VISION.md`); shareable **HTML run export** and optional **Textual TUI** live in `apps/orbit-pilot/` (`orbit export --format html`, `orbit tui`).
7. **JSON Schema** documents ship with the package (`bundled/schemas/`) for agent validation of `--json` CLI outputs; **`orbit schemas`** lists paths; **`orbit validate-json <schema> [file]`** validates JSON (stdin if file omitted).
8. **`run.json`** includes **`orbit_manifest_version`** (integer) and **`orbit_pilot_version`** (string); older CLIs error if manifest version is newer than supported. **`orbit check-run`** validates manifest and referenced paths.
9. **V1** optional extras: `orbit-pilot[browser]` (Playwright) for portal assist, optional autofill + optional auto-submit (`risk.allow_browser_auto_submit`, `ORBIT_ALLOW_BROWSER_AUTO_SUBMIT`, registry `submit` selector), `ORBIT_BROWSER_USER_DATA_DIR` or **`ORBIT_BROWSER_CDP_URL`** for logged-in / remote browser; `python -m orbit_pilot` = `orbit`; **`orbit schedule-*`**; **`orbit registry-lint`**; **`orbit pipeline`**; **`orbit init --preset walletradar`**; **`orbit work`** (next manual queue item: open default browser to `submit_url`, copy-paste `mark-done`; `--playwright` shortcut for `browser_assisted` publish assist).

### Config Contract
```yaml
risk:
  tolerance: low
  allow_browser_fallback: false
  # V1: allow_browser_automation: false  # with allow_browser_fallback, enables Playwright portal assist
  # allow_browser_autofill: false  # + ORBIT_ALLOW_BROWSER_AUTOFILL + registry selectors
  # allow_browser_auto_submit: false  # + ORBIT_ALLOW_BROWSER_AUTO_SUBMIT + submit selector in registry
platforms:
  medium:
    enabled: true
    mode: official_api_if_token_else_manual
  crunchbase:
    enabled: true
    mode: manual
```

### Execution Contract
For each platform return:
- `platform`
- `mode`
- `risk_level`
- `reason`
- `payload`
- `assets`
- `final_url`
- `result`

### Safety Rules
1. Never fabricate official write support.
2. Default to manual when uncertain.
3. Never bypass anti-bot controls.
4. Never mass-post identical content.
5. Label browser automation exactly as high-risk.

### Deliverable Appendices
1. `SYSTEM_PROMPT.md`
2. `PLATFORM_MATRIX.md`
3. `SAMPLE_OUTPUTS.md`
4. `apps/orbit-pilot/src/orbit_pilot/` (canonical implementation; this `ideas/` tree holds specs only)
