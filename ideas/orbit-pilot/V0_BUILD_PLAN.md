## Orbit Pilot V0 Build Plan

### Recommendation

Build V0 as a **CLI-first operator** with a stable machine-readable contract. Do not build a TUI yet.

Why:
1. lowest implementation cost,
2. easiest for agents to call,
3. easiest to demo in terminal recordings,
4. keeps the core model, registry, and publisher interfaces clean,
5. does not lock us into a UI we may replace.

### V0 Scope

Ship only these capabilities:

1. `plan`
   - validate launch profile
   - detect missing fields
   - output questions for the human
2. `generate`
   - produce per-platform drafts
   - append UTM parameters
   - generate manual submission packs
3. `publish`
   - publish to a very small official-safe set
4. `mark-done`
   - record manual submission completion
5. `report`
   - show campaign status, live URLs, and skipped targets

### Explicit Non-Goals For V0

1. TUI
2. web app
3. browser automation
4. scheduling
5. analytics dashboards
6. broad API surface
7. autonomous posting to high-risk platforms

### Recommended Initial Publisher Set

#### Official publishers

1. GitHub releases or discussions
2. DEV / Forem
3. Medium only if the user already has a working legacy integration token

#### Manual-only in V0

1. Crunchbase
2. Product Hunt
3. Hacker News
4. Reddit
5. Tiny Startups
6. TrustMRR
7. BetaList
8. Indie Hackers
9. SaaSHub
10. AlternativeTo

This is enough to show the real value without getting trapped in brittle automation work.

### Operator Experience

#### Human flow

1. create `launch.yaml`
2. run `orbit plan`
3. answer missing questions
4. run `orbit generate`
5. review output folder
6. run `orbit publish` for safe platforms
7. complete manual submissions
8. run `orbit mark-done`

#### Agent flow

1. call `orbit plan --json`
2. ask the human only the missing questions
3. write answers back into `launch.yaml`
4. call `orbit generate --json`
5. call `orbit publish` for approved official platforms
6. present the manual queue to the human

### Proposed CLI

```bash
orbit init
orbit plan --launch launch.yaml --platforms data/seed_platforms.yaml
orbit generate --launch launch.yaml --platforms data/seed_platforms.yaml --out out/
orbit publish --run out/run-2026-03-23 --platform github --platform dev
orbit mark-done --run out/run-2026-03-23 --platform crunchbase --live-url https://www.crunchbase.com/organization/example
orbit report --run out/run-2026-03-23
```

### Proposed File Structure

```text
orbit-pilot/
  pyproject.toml
  src/orbit_pilot/
    cli.py
    config.py
    models.py
    graph.py
    prompts.py
    registry.py
    audit.py
    dedupe.py
    links.py
    assets.py
    manual_pack.py
    publishers/
      __init__.py
      github.py
      devto.py
      medium.py
  examples/
    launch.sample.yaml
  data/
    seed_platforms.yaml
  out/
```

### Minimal Data Contracts

#### `launch.yaml`

```yaml
product_name: OrbitPilot
website_url: https://orbitpilot.ai
tagline: AI launch research and distribution ops for SaaS teams
summary: Turns one launch brief into tracked, platform-specific submission drafts.
descriptions:
  short: Launch distribution ops for SaaS teams.
  medium: OrbitPilot helps teams manage launch submissions across directories and content channels.
  long: >
    OrbitPilot is a compliance-first launch ops system that centralizes launch data,
    generates platform-specific variants, appends tracked links, and routes each
    platform into official API or manual workflows.
features:
  - UTM appending
  - platform registry
  - duplicate detection
  - manual queue
assets:
  logo: ./assets/logo.png
  screenshots:
    - ./assets/hero.png
```

#### `platform result`

```json
{
  "platform": "github",
  "mode": "official_api",
  "risk_level": "low",
  "reason": "GitHub token available",
  "payload_path": "out/run-2026-03-23/github/payload.json",
  "result": {
    "status": "published",
    "url": "https://github.com/acme/orbitpilot/releases/tag/v1"
  }
}
```

### Implementation Order

#### Milestone 1: core CLI shell

1. `models.py`
2. `config.py`
3. `registry.py`
4. `cli.py`

Done when:
- `orbit plan` loads files and prints missing fields.

#### Milestone 2: draft generation

1. `links.py`
2. `dedupe.py`
3. `manual_pack.py`
4. `prompts.py`

Done when:
- `orbit generate` creates per-platform folders with copy and UTM links.

#### Milestone 3: audit and persistence

1. `audit.py`
2. SQLite state store
3. `report` and `mark-done`

Done when:
- manual workflow state survives across runs.

#### Milestone 4: official publishers

1. GitHub
2. DEV
3. Medium optional

Done when:
- at least two official publishers work end-to-end.

### Demo Script

1. `orbit init`
2. open sample `launch.yaml`
3. `orbit plan --json`
4. fill missing fields
5. `orbit generate`
6. show generated manual packs
7. `orbit publish --platform github`
8. `orbit report`

This is enough for a convincing MVP demo.

### Extensibility Rules

1. Every platform integration must implement the same result contract.
2. The registry is the source of truth for mode and risk.
3. The CLI must always support `--json` for agent consumption.
4. Future TUI or web UI should call the same internal services, not fork logic.
5. Browser automation stays in a separate optional module.

### Build Recommendation

If the goal is least work with maximum demo value, the right V0 is:

- Python CLI
- YAML inputs
- SQLite audit log
- generated output folders
- 2-3 safe official publishers
- 10-20 manual platforms

That is the narrowest version that is still real.
