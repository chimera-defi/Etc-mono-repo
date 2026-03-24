# Sprint Planning Implementation - Completion Tasks

**Status**: Partially complete - core functionality works, missing export enrichment and handoff provenance

## What's Already Implemented ✅

### Backend
- [x] Database schema (`plan_sessions`, `plan_stages` tables)
- [x] All 5 stage definitions with questions and patch builders
- [x] API routes: create session, advance stage, skip stage, list sessions
- [x] Patch proposal generation from stage answers
- [x] Session state management

### Frontend
- [x] `SprintPlanningPanel` component (688 lines)
- [x] Stage progression UI
- [x] Question/answer forms
- [x] Integration with workspace page

### CLI
- [x] `specforge plan` command
- [x] Stage selection (`--stage`, `--skip`)
- [x] JSON output mode
- [x] Interactive TUI integration

## What's Missing ❌

### 1. Export Enrichment
**Requirement** (from SPEC.md line 145-147):
> When planning stages are completed, the export bundle gains:
> - `DESIGN_SYSTEM.md` — from Design Review stage (omitted if skipped)
> - `SECURITY.md` — from Security Review stage (omitted if skipped)

**Current State**: `exportDocumentBundle()` in `export.ts` doesn't check for completed planning stages

**Tasks**:
- [ ] 1.1 Query `plan_stages` table in `exportDocument()` to get completed stages
- [ ] 1.2 Add `buildDesignSystem()` function that extracts Design Review outputs
- [ ] 1.3 Add `buildSecurity()` function that extracts Security Review outputs
- [ ] 1.4 Conditionally include these files in export bundle if stages are completed
- [ ] 1.5 Test: complete Design Review → export → verify DESIGN_SYSTEM.md exists
- [ ] 1.6 Test: skip Design Review → export → verify DESIGN_SYSTEM.md omitted

### 2. Handoff JSON Provenance
**Requirement** (from SPEC.md line 149-159):
```json
{
  "planningSession": {
    "stages": [
      { "name": "discovery", "status": "completed", "patchId": "...", "outputs": {...} },
      { "name": "ceo-review", "status": "completed", "patchId": "...", "outputs": {...} },
      { "name": "eng-review", "status": "skipped", "patchId": null, "outputs": null },
      { "name": "design-review", "status": "completed", "patchId": "...", "outputs": {...} },
      { "name": "security", "status": "skipped", "patchId": null, "outputs": null }
    ]
  }
}
```

**Current State**: `buildAgentSpecJson()` in `export.ts` doesn't include planning session metadata

**Tasks**:
- [ ] 2.1 Query `plan_sessions` and `plan_stages` in `exportDocument()`
- [ ] 2.2 Add `planningSession` field to `agent_spec.json` structure
- [ ] 2.3 Include stage name, status, patchId, outputs for each stage
- [ ] 2.4 Handle case where no planning session exists (omit field)
- [ ] 2.5 Test: complete planning → export → verify agent_spec.json has provenance
- [ ] 2.6 Test: no planning → export → verify agent_spec.json omits planningSession

### 3. Handoff Route Enhancement
**Requirement**: `/api/documents/:id/handoff` should include planning provenance

**Current State**: Handoff route exists but doesn't query planning sessions

**Tasks**:
- [ ] 3.1 Update handoff route to query plan_sessions
- [ ] 3.2 Include planning provenance in handoff response
- [ ] 3.3 CLI `specforge handoff` should display planning summary
- [ ] 3.4 Test: handoff after planning → verify provenance included

## Implementation Plan

### Phase 1: Export Enrichment (2-3 hours)
1. Modify `exportDocument()` in `store.ts` to query plan_stages
2. Add `buildDesignSystem()` and `buildSecurity()` to `export.ts`
3. Update `exportDocumentBundle()` to conditionally include new files
4. Write tests for conditional inclusion

### Phase 2: Handoff Provenance (1-2 hours)
1. Modify `buildAgentSpecJson()` to accept planning session data
2. Add `planningSession` field to JSON structure
3. Update `exportDocument()` to pass planning data
4. Write tests for provenance inclusion

### Phase 3: Handoff Route (1 hour)
1. Update `/api/documents/[id]/handoff/route.ts` to query sessions
2. Include provenance in response
3. Update CLI to display planning summary
4. Write integration test

### Phase 4: Testing & Documentation (1 hour)
1. End-to-end test: planning → export → verify all files
2. Update SPEC.md to mark Sprint Planning as "fully implemented"
3. Update README with Sprint Planning usage examples

## Acceptance Criteria

- [ ] Completing Design Review stage → export includes DESIGN_SYSTEM.md
- [ ] Skipping Design Review stage → export omits DESIGN_SYSTEM.md
- [ ] Completing Security Review stage → export includes SECURITY.md
- [ ] Skipping Security Review stage → export omits SECURITY.md
- [ ] agent_spec.json includes `planningSession` with all stage statuses
- [ ] Handoff route returns planning provenance
- [ ] CLI `specforge handoff` displays planning summary
- [ ] All existing tests still pass
- [ ] New tests cover planning export scenarios

## Files to Modify

1. `web/src/lib/specforge/store.ts` - exportDocument()
2. `web/src/lib/specforge/export.ts` - exportDocumentBundle(), buildDesignSystem(), buildSecurity(), buildAgentSpecJson()
3. `web/src/app/api/documents/[id]/handoff/route.ts` - include planning provenance
4. `cli/src/index.mjs` - display planning summary in handoff command
5. `web/src/lib/specforge/export.test.ts` - add tests for conditional exports

## Estimated Time: 5-7 hours

