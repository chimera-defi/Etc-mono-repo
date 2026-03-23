## Orbit Pilot Technical Spec

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
See `ARCHITECTURE_DIAGRAMS.md`.

### Core Components

#### 1) Launch Profile Store
- canonical product facts
- short / medium / long descriptions
- founder and company metadata
- links, screenshots, logos, tags

#### 2) Platform Registry
- platform name and official URL
- submit URL
- automation mode: `official_api | manual | browser_fallback_opt_in | unknown`
- risk level
- required fields
- image constraints
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

#### 7) Logging and Audit
- every decision logged
- publish attempt logged
- skip reason logged
- final live URL logged if available

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
1. Python service with LangGraph for orchestration.
2. YAML config for platform settings and user risk tolerance.
3. OS keychain-backed credentials via `keyring`.
4. SQLite or Postgres for audit events and submission history.
5. FastAPI webhook and operator UI later.

### Config Contract
```yaml
risk:
  tolerance: low
  allow_browser_fallback: false
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
4. `src/orbit_pilot_skeleton.py`
