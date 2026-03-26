# SpecForge Claude Buildout Plan

This document lists the remaining buildable work that can be handed to Claude in clean slices.

The rule for inclusion here is simple:

- the work is concrete enough to implement
- the seams are known
- the acceptance criteria are clear
- it does not require unresolved product strategy before coding starts

## Status Key

- `not started`: no meaningful implementation exists on the branch yet
- `partial`: some groundwork or surface exists, but the workstream is not actually finished
- `mostly planning`: documentation or spike-level work exists, but the implementation should still be treated as open

## Current Status Snapshot

1. Tauri desktop shell — `not started`
2. Desktop runtime status panel — `partial`
3. Local install / download flow polish — `partial`
4. Local CLI assist diagnostics — `partial`
5. Billing provider skeleton — `not started`
6. Entitlements enforcement cleanup — `partial`
7. Pilot membership UX polish — `partial`
8. Hosted ops surfaces — `partial`
9. Store decomposition — `partial`
10. Workspace page decomposition — `partial`
11. Design review workflow polish — `partial`
12. Acceptance test UX — `partial`
13. Local log export / diagnostics pack — `not started`
14. Hybrid local bridge design spike — `mostly planning`
15. Future idea-generation improvements inside SpecForge — `mostly planning`

## 1. Tauri Desktop Shell

### Goal

Wrap the working local SpecForge product in a desktop app so users can run the current local-first flow without manually starting services.

### Scope

- scaffold Tauri in the SpecForge pack
- launch the local web app as a sidecar
- launch the local collab server as a sidecar
- wait for both health checks before opening the main window
- show a basic failure/retry screen if a sidecar does not come up

### Files / Areas

- new `desktop/` or Tauri app directory
- root scripts in `package.json`
- health endpoints already exist in:
  - `web/src/app/api/health/route.ts`
  - `collab-server/src/index.js`

### Acceptance Criteria

- `bun run dev:desktop` starts a desktop shell and opens SpecForge
- the desktop app can reach `/workspace`
- the local product still works with multiplayer
- shutdown cleans up sidecars

### Notes

Do not rewrite the current local app. Package it.

### Status

`not started`

## 2. Desktop Runtime Status Panel

### Goal

Make local runtime state visible to end users inside the product.

### Scope

- show local mode vs hosted mode vs future bridge mode
- show Codex CLI detection
- show Claude Code CLI detection
- show web health state
- show collab health state

### Files / Areas

- `web/src/app/workspace/page.tsx`
- session/runtime components in `web/src/app/workspace/`
- `web/src/lib/specforge/agent-assist.ts`

### Acceptance Criteria

- workspace clearly shows whether local assist is available
- user can tell why assist is unavailable
- runtime state is visible without opening logs

### Status

`partial`

Current branch already shows some local runtime links and CLI options, but not a true consolidated desktop/runtime state surface.

## 3. Local Install / Download Flow Polish

### Goal

Turn the current homepage + download page into a cleaner local-first onboarding path.

### Scope

- improve `/download`
- add platform-specific local install steps
- add desktop-alpha messaging
- reduce manual setup confusion

### Files / Areas

- `web/src/app/page.tsx`
- `web/src/app/download/page.tsx`
- `web/src/app/marketing.module.css`

### Acceptance Criteria

- a new user can understand:
  - what SpecForge is
  - how to run it locally
  - that desktop packaging is the next step
- browser tests cover the updated flow

### Status

`partial`

`/` and `/download` are live and tested, but platform-specific onboarding and desktop-ready packaging instructions are still incomplete.

## 4. Local CLI Assist Diagnostics

### Goal

Make local Codex / Claude reuse easier to debug.

### Scope

- expose richer CLI detection details
- show common failure reasons
- add explicit runtime checks in UI
- improve failed-assist error states

### Files / Areas

- `web/src/lib/specforge/agent-assist.ts`
- `web/src/app/api/agent/assist/route.ts`
- workspace UI

### Acceptance Criteria

- if `codex` is missing, user sees that clearly
- if `claude` is missing, user sees that clearly
- if a CLI times out or returns malformed output, the error is actionable

### Status

`partial`

CLI detection and local assist already exist, but the diagnostics surface is still thin.

## 5. Billing Provider Skeleton

### Goal

Replace the current billing-preview-only state with a real provider integration scaffold.

### Scope

- choose `Stripe` as the first provider
- add provider abstraction layer
- map workspace plan state to provider-facing objects
- add webhook/event handling scaffold
- keep local mode working without real billing

### Files / Areas

- `web/src/lib/specforge/plans.ts`
- billing endpoints under `web/src/app/api/workspace/`
- new provider module(s)

### Acceptance Criteria

- provider abstraction exists
- local mode can stub billing safely
- plan / entitlement state has a clear path to Stripe objects

### Notes

This is a scaffold with honest boundaries, not “payments done”.

### Status

`not started`

## 6. Entitlements Enforcement Cleanup

### Goal

Centralize feature gating and quota enforcement.

### Scope

- unify assist quota logic
- unify member limit logic
- centralize plan-to-feature checks
- make API and UI use the same contract

### Files / Areas

- `web/src/lib/specforge/plans.ts`
- `web/src/lib/specforge/workspace-summary.ts`
- workspace APIs and UI

### Acceptance Criteria

- one entitlement source of truth
- no duplicated feature gating logic
- UI explanations match backend enforcement

### Status

`partial`

Plans, quotas, billing preview, and entitlements exist, but the contract still needs cleanup and provider-facing structure.

## 7. Pilot Membership UX Polish

### Goal

Make pilot workspace membership feel like a real product flow instead of an internal alpha flow.

### Scope

- cleaner invite UX
- clearer role edit UX
- better membership error handling
- better GitHub-linked member messaging

### Files / Areas

- `web/src/app/workspace/`
- `web/src/app/actions.ts`
- `web/src/app/workspace/workspace-actions.ts`
- `web/src/lib/specforge/session.ts`
- `web/src/lib/specforge/store-workspaces.ts`

### Acceptance Criteria

- user can add/remove/update roles with clear feedback
- pilot-vs-local rules are understandable in UI
- browser tests cover the main membership lifecycle

### Status

`partial`

## 8. Hosted Ops Surfaces

### Goal

Push hosted ops beyond local rehearsal JSON endpoints.

### Scope

- better incident summaries
- backup / restore status visibility
- operator-facing dashboard polish
- cleaner runbook links from UI

### Files / Areas

- `/api/ops/*`
- workspace ops panels
- `LOCAL_RUNBOOK.md`

### Acceptance Criteria

- hosted rehearsal path exposes actionable operator state
- backups and incidents are understandable without reading raw JSON

### Status

`partial`

## 9. Store Decomposition

### Goal

Finish thinning the remaining large persistence module.

### Scope

- continue splitting `store.ts` by domain
- keep public contracts stable
- reduce risk and skimmability issues

### Files / Areas

- `web/src/lib/specforge/store.ts`
- nearby domain modules

### Acceptance Criteria

- `store.ts` shrinks materially
- responsibilities move into clear domain modules
- tests remain green

### Status

`partial`

## 10. Workspace Page Decomposition

### Goal

Keep trimming page-level composition glue so the workspace stays readable.

### Scope

- extract more panels/helpers if still large
- keep stage composition clean
- reduce mixed data-loading + rendering sprawl

### Files / Areas

- `web/src/app/workspace/page.tsx`
- `web/src/app/workspace/*`

### Acceptance Criteria

- page remains mostly orchestration/composition
- heavy UI sections live in focused components

### Status

`partial`

## 11. Design Review Workflow Polish

### Goal

Make design review feel first-class after spec creation.

### Scope

- improve design handoff presentation
- improve design feedback UX
- make returned design review changes easier to inspect in decide/review flows

### Files / Areas

- `web/src/app/workspace/design-handoff-panel.tsx`
- `web/src/app/api/documents/[id]/design-feedback/route.ts`
- patch review UI

### Acceptance Criteria

- a design partner can review and return feedback without custom explanation
- design feedback appears clearly as governed patches

### Status

`partial`

## 12. Acceptance Test UX

### Goal

Make the acceptance-test feature visible and useful in the product, not just in APIs/tests.

### Scope

- add UI for running acceptance tests
- show pass/fail status clearly
- show actionable missing-spec notes

### Files / Areas

- `web/src/app/workspace/`
- `web/src/app/api/documents/[id]/acceptance-tests/run/route.ts`

### Acceptance Criteria

- user can trigger spec evaluation from UI
- failures tell them what to add

### Status

`partial`

Acceptance test CRUD and run components already exist, and the evaluation API is live. What is still missing is a first-class workspace-stage surface that makes the feature easy to discover and use.

## 13. Local Log Export / Diagnostics Pack

### Goal

Help users and design partners share reproducible failures.

### Scope

- gather web diagnostics
- gather collab diagnostics
- gather assist runtime state
- export a support/debug bundle

### Files / Areas

- desktop/runtime settings UI
- ops endpoints
- local tooling

### Acceptance Criteria

- user can export a debug pack without terminal work

### Status

`not started`

## 14. Hybrid Local Bridge Design Spike

### Goal

Design, but do not fully ship, the bridge that would let hosted SpecForge use local Codex / Claude CLI.

### Scope

- define trust model
- define local bridge protocol
- define auth/handshake
- define safety constraints

### Output

- implementation plan
- protocol sketch
- threat model

### Notes

This is a spike/planning slice, not a “ship it now” slice.

### Status

`mostly planning`

## 15. Future Idea Generation Inside SpecForge

### Goal

Make SpecForge itself better at generating future `ideas/` packs in this repo.

### Scope

- add stronger guided fields for:
  - distribution model
  - runtime topology
  - agent integration contract
  - release stage
  - acceptance tests
- improve exported idea pack structure

### Files / Areas

- guided spec model
- readiness/depth gates
- export/handoff bundle

### Acceptance Criteria

- a future idea generated in SpecForge is closer to a one-shot buildable pack

### Status

`mostly planning`

## Parallelization Guidance

These can be worked mostly in parallel:

1. Tauri desktop shell
2. desktop runtime status panel
3. download/install flow polish
4. local CLI assist diagnostics
5. billing provider skeleton
6. entitlements enforcement cleanup
7. pilot membership UX polish
8. hosted ops surfaces
9. store decomposition
10. workspace page decomposition
11. design review workflow polish
12. acceptance test UX
13. local log export / diagnostics pack
14. hybrid local bridge design spike
15. future idea-generation improvements

## What Still Needs Human Product Decisions

These should not be treated as pure build tasks yet:

1. final pricing and packaging
2. hosted SaaS commercial motion
3. whether desktop is free, paid, or both
4. whether hybrid bridge is part of paid hosted plans or local-only
5. which starter templates matter after the current baseline
