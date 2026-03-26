## Orbit Pilot Sample Outputs

Human-facing copy examples are below. For **machine contracts**, use `--json` on CLI commands and validate with `orbit validate-json` (see [`AGENTS.md`](../../apps/orbit-pilot/AGENTS.md)).

### CLI `--json` shape (representative)

Generated from bundled `launch.sample.yaml` + `seed_platforms.yaml` (paths vary on your machine). Keys match bundled JSON Schemas (`orbit schemas --json`).

**`orbit plan … --json`** (truncated `platform_preview`):

```json
{
  "missing_fields": [],
  "questions": [],
  "platform_count": 22,
  "platforms": ["medium", "reddit", "github", "…", "microlaunch", "open_alternative"],
  "platform_preview": [
    {
      "slug": "github",
      "planned_mode": "official_api",
      "risk": "low",
      "reason": "V0 official publisher"
    },
    {
      "slug": "reddit",
      "planned_mode": "manual",
      "risk": "medium_high",
      "reason": "Registry mode: manual_by_default"
    }
  ]
}
```

**`orbit doctor … --json`** (one row each platform):

```json
{
  "results": [
    {
      "platform": "github",
      "mode": "official_api",
      "ready": false,
      "missing_secrets": ["GITHUB_TOKEN"],
      "missing_payload": []
    },
    {
      "platform": "reddit",
      "mode": "manual",
      "ready": true,
      "missing_secrets": [],
      "missing_payload": []
    },
    {
      "platform": "example_directory",
      "mode": "browser_assisted",
      "ready": true,
      "missing_secrets": [],
      "missing_payload": [],
      "browser_autofill_selectors": ["title", "body", "url", "submit"]
    }
  ]
}
```

Optional keys on **`browser_assisted`** rows (when policy enables automation): `browser_autofill_selectors`, `browser_autofill_note`, `browser_auto_submit_note` (e.g. missing submit selector while `allow_browser_auto_submit` is true).

**`orbit work --run … --json`** (next manual queue item; agents use `submit_url`, `mark_done_command`, optional `playwright_assist_command`):

```json
{
  "kind": "task",
  "platform": "product_hunt",
  "status": "pending",
  "prompt": "Next manual task: …",
  "payload": {"title": "…", "body": "…"},
  "planned_mode": "manual",
  "submit_url": "https://www.producthunt.com/posts/new",
  "prompt_path": "/path/run/product_hunt/PROMPT_USER.txt",
  "mark_done_command": "orbit mark-done --run '/path/run' --platform product_hunt --live-url <URL>",
  "opened_browser": true
}
```

**`orbit generate … --json`**:

```json
{
  "run_dir": "/path/out/orbitpilot/run-20260326T084653Z",
  "results": [
    {
      "platform": "github",
      "mode": "official_api",
      "risk_level": "low",
      "reason": "V0 official publisher",
      "payload_path": "/path/.../github/payload.json",
      "duplicate": false,
      "asset_count": 0
    }
  ]
}
```

**`orbit registry-lint --platforms … --json`**:

```json
{
  "ok": true,
  "errors": [],
  "warnings": [],
  "platform_count": 22
}
```

Regenerate locally after CLI changes: run the same commands with your fixtures and diff; update this section if required keys change.

### Example Launch
Product: OrbitPilot
Tagline: AI launch research and distribution ops for SaaS teams
URL: `https://orbitpilot.ai`

### Medium Article
```markdown
# OrbitPilot: launch research and distribution without the spreadsheet mess

OrbitPilot helps SaaS teams turn one launch brief into platform-specific submissions, tracked links, and approval-ready drafts.

Instead of rewriting the same product description for every site, OrbitPilot stores a canonical profile, generates differentiated variants, appends UTM tags, adapts assets, and routes each target into official API, manual, or high-risk fallback mode.

This is built for operators who care about launch coverage and compliance, not vanity automation.

Try it here: https://orbitpilot.ai?utm_source=launch_orchestrator_medium&utm_medium=community&utm_campaign=launch&utm_content=medium
```

### Reddit Post
```text
Title: Built OrbitPilot to help with directory submissions and launch distribution. Looking for blunt feedback.

We kept hitting the same problem on every launch: dozens of sites wanted the same info in different formats, links were inconsistent, and anything beyond manual work got risky fast.

So we built OrbitPilot:
- one canonical launch profile
- unique platform-specific drafts
- UTM tagging on every link
- image resizing per target
- manual-first queue for anything policy-unclear

Would this be useful, or does it feel like too much process for a launch workflow?
```

### Crunchbase Description
```text
OrbitPilot is a SaaS platform that helps product and growth teams manage launch distribution across directories, product databases, company profiles, and content channels. The platform centralizes product metadata, generates platform-specific submission copy, appends tracked links, adapts images to target requirements, and supports official API publishing or manual review workflows depending on platform policy and automation feasibility.
```
