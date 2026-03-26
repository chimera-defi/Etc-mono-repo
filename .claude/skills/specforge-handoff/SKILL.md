---
name: specforge-handoff
description: |
  MANUAL TRIGGER ONLY: invoke only when user types /specforge-handoff.
  Emits the final SpecForge handoff JSON. Packages the full export bundle (PRD, SPEC,
  TASKS, agent_spec.json) together with sprint planning stage provenance (completed/skipped
  stages and their outputs) into a single build-ready handoff.json. Build tooling is
  agnostic — the handoff points to no specific build tool.
  Use /specforge-plan for Act 1, /specforge for the full workflow.
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# SpecForge Handoff — Final Export

You are emitting the final SpecForge handoff package. This produces `handoff.json` with full provenance.

## Context Detection

```bash
_LOCAL=$(ls ideas/collab-markdown-spec-studio/web/package.json 2>/dev/null && echo "yes" || echo "no")
_API_URL="${SPECFORGE_API_URL:-}"
echo "LOCAL: $_LOCAL | API_URL: $_API_URL"
```

## Handoff JSON Schema

```json
{
  "version": "1",
  "documentId": "...",
  "workspaceId": "...",
  "generatedAt": "...",
  "planningSession": {
    "stages": [
      { "name": "discovery",          "status": "completed", "patchId": "...", "outputs": {} },
      { "name": "ceo-review",         "status": "completed", "patchId": "...", "outputs": {} },
      { "name": "eng-review",         "status": "skipped",   "patchId": null,  "outputs": null },
      { "name": "design-review",      "status": "completed", "patchId": "...", "outputs": {} },
      { "name": "security-review",    "status": "skipped",   "patchId": null,  "outputs": null }
    ]
  },
  "exportBundle": {
    "prd":          "PRD.md contents",
    "spec":         "SPEC.md contents",
    "tasks":        "TASKS.md contents",
    "agentSpec":    {},
    "designSystem": "DESIGN_SYSTEM.md (if design stage completed)",
    "security":     "SECURITY.md (if security stage completed)"
  },
  "executionBrief": "...",
  "launchPacket":   {}
}
```

## Emitting the Handoff

```bash
# Via API:
POST /api/documents/:documentId/handoff
# Returns: handoff.json with full export bundle + planning provenance

# Via export stage in the web UI:
# Navigate to ?stage=export
# Click "Launch the build handoff"
```

## What's Included

| Field | Source | Condition |
|-------|--------|-----------|
| `exportBundle.prd` | Generated PRD markdown | Always |
| `exportBundle.spec` | Generated SPEC markdown | Always |
| `exportBundle.tasks` | Generated TASKS markdown | Always |
| `exportBundle.agentSpec` | agent_spec.json | Always |
| `exportBundle.designSystem` | DESIGN_SYSTEM.md | Only if `design-review` stage completed |
| `exportBundle.security` | SECURITY.md | Only if `security-review` stage completed |
| `planningSession.stages` | Plan session stage rows | Always (shows done/skipped/pending per stage) |

## After Handoff

Tell the user:
> "Your handoff.json is ready. It contains:
> - Full export bundle (PRD, SPEC, TASKS, agent_spec.json)
> - Planning stage provenance (which stages were completed vs skipped, with outputs)
> - Execution brief and launch packet
>
> Hand this to your build tooling of choice — SpecForge is build-tool agnostic."
