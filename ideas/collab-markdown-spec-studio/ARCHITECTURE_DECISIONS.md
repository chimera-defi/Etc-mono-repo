## Architecture Decisions (SpecForge)

## Decision 1: CRDT Collaboration Core
- Choice: CRDT-backed real-time editing via Yjs + Hocuspocus.
- Why: robust offline/reconnect and concurrent edits.
- Status (MVP): Infrastructure is in place and browser-covered locally, including concurrent-user and stale-room recovery flows. This is implemented and tested for the local MVP path, but not yet design-partner validated in hosted production use.
- Recommendation: keep distinguishing local multiplayer verification from hosted design-partner validation.
- Tradeoff: operational complexity and debugging overhead.

## Decision 2: Patch Proposal Model for Agents
- Choice: agent edits must be patch proposals by default.
- Why: preserve trust and control in multi-user environments.
- Tradeoff: extra review step can slow throughput.

## Decision 3: Stable Block and Section IDs as First-Class Primitive
- Choice: stable block/section IDs plus target fingerprints for patching and traceability.
- Why: required for provenance, stale-patch detection, and repo linkage.
- Tradeoff: index maintenance complexity.

## Decision 4: Repo Generation in Phase 2
- Choice: keep repo generation after core collaboration fit is proven.
- Why: avoid overloading MVP.
- Tradeoff: delayed full value narrative realization.

## Decision 5: Export Bundle as Contract
- Choice: PRD/SPEC/TASKS/agent_spec JSON are contract outputs.
- Why: deterministic handoff to humans and build agents.
- Tradeoff: schema maintenance overhead as product evolves.

## Decision 6: Single TypeScript App + Collaboration Service
- Choice: use one TypeScript web app plus a dedicated collaboration service and lightweight worker.
- Why: keeps the product mostly monolithic while isolating websocket sync concerns.
- Tradeoff: collaboration service is still a separate runtime to own.

## Decision 7: Canonical Editor JSON, Derived Block Index
- Choice: treat editor JSON as canonical and derive block/section indexes for governance and export.
- Why: avoids dual-write complexity while preserving stable patch targets.
- Tradeoff: block extraction logic becomes critical infrastructure.

## Decision 8: `block_id` as Primary Patch Target
- Choice: patches target `block_id`; `section_id` is secondary context.
- Why: more precise targeting and safer stale detection than section-only patching.
- Tradeoff: block identity must remain stable through editor transforms.

## Decision 9: No Automatic Rebase in v1
- Choice: stale patches are rejected for regeneration or manual review instead of auto-rebased.
- Why: easier to reason about and safer for an attribution-heavy MVP.
- Tradeoff: more proposals will need regeneration in busy documents.

## Decision 10: GitHub OAuth for Pilots
- Choice: local dev bypass for demos, GitHub OAuth for pilot human users, service identities for agents.
- Why: simplest path for a technical early-user cohort.
- Tradeoff: non-GitHub users are excluded until later auth expansion.

## Decision 11: Simple Anchored Comments in v1
- Choice: ship basic anchored comment threads before richer inline comment UX.
- Why: patch review and depth gates matter more than advanced comment ergonomics.
- Status (MVP): Implemented. Comment threads are visible in the review workspace with create/resolve flows and tests.
- Tradeoff: comments will feel less polished than mature editor platforms.

## Decision 12: Curated Example Generation Only
- Choice: restrict first repo generation to docs-only export plus one curated TypeScript app template.
- Why: proves the authoring-to-code loop without exploding support surface area.
- Tradeoff: narrower demo than a framework-agnostic generator.

## Decision 13: Codex Parity Runner
- Choice: ship a local orchestration runner that wraps `codex exec` and advances the highest-priority remaining parity item automatically.
- Why: teams should not have to manually re-prompt the coding agent after every integrated pass.
- Tradeoff: the runner depends on disciplined task tracking and can only automate as far as the backlog and stop conditions are explicit.

## Decision 14: Signed Collab Room Handshake
- Choice: mint short-lived room tokens in the web app and verify them in the collaboration server.
- Why: keeps the local MVP close to the pilot auth model without exposing room trust to unauthenticated websocket joins.
- Tradeoff: adds one more integration seam between the app and collab runtime.

## Decision 15: Structured Room Telemetry and Local Runbook
- Choice: emit structured collab-server events and keep a local failure-mode runbook beside the MVP.
- Why: reconnect/auth issues are otherwise hard to debug in a multiplayer product.
- Tradeoff: local logs are useful but still far short of full production observability.

## Decision 16: Swarm-Style Delivery Loop for Buildout
- Choice: model the post-spec build loop as `intent -> claim -> context -> signal`.
- Why: once the spec is approved, the hardest problem shifts from writing to coordinating bounded agent passes without losing state.
- Tradeoff: this adds a second workflow model after patch governance, so the seam between authoring and delivery must stay explicit.

## Decision 17: Minimum Extensible Product Before Final-Form Buildout
- Choice: the first generated/buildable result should be a minimum extensible product that is runnable and easy to evolve, not an attempt at the final shape in one unsafe leap.
- Why: this keeps the output honest, verifiable, and compatible with the delivery loop's bounded-pass model.
- Tradeoff: the first handoff may look intentionally narrower than the full approved vision, so the backlog and parity targets must stay explicit.

## Decision 18: Delivery Loop Is a Product Primitive, Not Just Internal Tooling
- Choice: surface backlog state, next brief, claims, and signals inside SpecForge itself instead of hiding orchestration in external scripts only.
- Why: teams need to see whether the product is stalled, progressing, or waiting on human clarification without inspecting raw agent logs.
- Status (MVP): ✓ Fully implemented. Status/brief/context endpoints are live and tested. Parity runner is operational.
- Tradeoff: the product now owns one more workflow surface that must stay consistent with the underlying runner.

## Decision 19: Depth Gates and Recap Enforcement (DEFERRED)
- **Status**: NOT IMPLEMENTED in MVP, despite being claimed in SPEC.md.
- Choice: Treat idea depth as first-class product state via required gates and recap checkpoints.
- Clarifications table exists in database but logic layer is missing.
- Recommendation: Move to Phase 2. Add when there's product evidence that users need structured depth enforcement.
- Why deferred: The MVP patch-review flow is sufficient for initial validation. Depth gates add significant decision-tree logic that can wait.

## Decision 20: Honest Scope Boundaries (NEW)
- **Status**: Must enforce in all docs and messaging going forward.
- Choice: Be explicit about what works for single-user vs multiplayer scenarios.
- Why: Product claims can drift faster than implementation. Multiplayer validation is still weaker than the single-user path even though the core UI and comment system now work.
- Recommendation: Keep distinguishing "implemented locally" from "design-partner validated" and update the runner/task list when that boundary changes.
- Implication: This is a real local multiplayer-capable MVP with some hosted/runtime validation still outstanding.

## Decision 21: Shared OpenSpec Core
- Choice: extract the shared spec model, guided wizard logic, readiness rules, and handoff builders into a reusable core package instead of keeping them web-only.
- Why: the web app, CLI/TUI, and orchestrator should not drift into three different product contracts.
- Status (current branch): guided wizard logic and readiness are already shared in `core/`; export/handoff/workflow extraction remains in progress.
- Tradeoff: package boundaries add migration work in the near term.

## Decision 22: CLI/TUI Is a First-Class Product Surface
- Choice: treat `/specforge` style terminal flows as a real product surface, not just internal tooling.
- Why: agent-heavy teams already work in terminals; the same guided spec workflow should be reachable there without requiring the browser first.
- Status (current branch): a first guided `specforge` CLI wizard is shipped; richer TUI and slash-command ergonomics remain follow-on work.
- Tradeoff: terminal ergonomics must stay consistent with the web product or this becomes another drift source.

## Decision 23: Canonical Share URLs with Membership-Gated Access
- Choice: share specs via stable workspace URLs, not anonymous bearer links.
- Why: SpecForge is collaborative SaaS software, so access should remain controlled by workspace membership and GitHub-authenticated identity rather than leaked URLs.
- Status (current branch): membership management exists, and the workspace UI should expose a copyable canonical URL plus the membership requirement alongside it.
- Tradeoff: sharing is slightly less frictionless than a public doc link, but it is safer and aligns with pilot workspace permissions.

## Decision 24: Sprint Planning as Act 1 of SpecForge (not a bolt-on mode)
- Choice: integrate the G-Stack-inspired planning stages (Discovery → CEO Review → Eng Review → Design Review → Security Review) as the natural front-of-workflow Act 1 in SpecForge, not as an optional addon. Users see a choice at document creation: "Start with Sprint Planning" or "Jump to Spec Wizard". Both paths lead to the same Act 2 (spec generation).
- Why: bolt-on modes get skipped. Making planning the default entry point raises spec quality before any doc editing begins. G-Stack validated this stage sequence; SpecForge adapts it inside the governed patch workflow so all AI-generated planning outputs are attributed and reversible.
- Status: Phase 2 (not yet implemented).
- Stages: `discovery` | `ceo-review` | `eng-review` | `design-review` | `security-review`
- Each stage produces a governed patch proposal; no stage auto-applies changes; all stages optional and skippable.
- Tradeoff: one review step per planning stage adds interaction cost. This is intentional — SpecForge's value is attribution and governance. Users who want raw planning speed can skip all stages and jump to the wizard.

## Decision 25: Skills as First-Class Distribution Format
- Choice: ship SpecForge's planning pipeline as Claude Code skill files (`.md` in `skills/specforge/`) alongside the web app and CLI. Three initial skills: `/specforge` (existing), `/specforge-plan` (Act 1 pipeline), `/specforge-handoff` (emit handoff.json).
- Why: G-Stack proved that Markdown skill packs spread virally and get adopted without onboarding friction. SpecForge should be reachable from any Claude Code session, not just the browser.
- Status: Phase 2.
- Context detection: skills call `bun run specforge -- plan` when the local repo is present; fall back to `SPECFORGE_API_URL` if set; prompt for setup if neither.
- Tradeoff: local mode requires the repo installed. Hosted mode requires `SPECFORGE_API_URL`. Skills must handle both paths gracefully without hard-coding assumptions.

## Decision 26: Build-Agnostic Handoff JSON
- Choice: SpecForge emits `handoff.json` (export bundle + planning stage provenance) as its terminal output. It does not reference any specific build tool, CI pipeline, or downstream framework. Users pick their own build workflow.
- Why: SpecForge's boundary is idea → thoroughly governed spec. Encoding a specific build tool couples SpecForge to a downstream choice that will change per project. Keeping handoff JSON agnostic makes it consumable by G-Stack, Codex, CI pipelines, or manual workflows equally.
- Status: Phase 2. `POST /documents/:id/handoff` + `specforge handoff` CLI + `/specforge-handoff` skill.
- Handoff JSON includes: export bundle, planning stage provenance (done/skipped/outputs per stage), execution brief, launch packet.
- Tradeoff: users who want direct G-Stack continuation have to wire that up themselves. The handoff JSON is self-describing enough to guide any build workflow without additional documentation.

## Decision 27: Multiplayer in Act 1 (Planning stages are collaborative, not solo)
- Choice: Act 1 planning stages run inside the same Hocuspocus room as the document. All workspace collaborators see the AI conversation, stage progress, and patch previews in real time. Any collaborator can answer questions or skip a stage.
- Why: the planning phase is often where the most important alignment happens. Doing it solo and handing results to collaborators creates misalignment. Running it in the live multiplayer room makes the planning conversation itself an artifact that everyone contributed to and can see.
- Status: Phase 2.
- Implementation: planning stage presence events are CRDT-synced through the existing Yjs provider. Stage conversation state (questions + answers) is persisted as document metadata, not ephemeral presence.
- Tradeoff: concurrent answers from multiple collaborators create ambiguity in what the AI should synthesize. Resolve by: last-write-wins on answer fields (CRDT merge), with all contributor identities recorded in the stage audit event.

## Decision 28: Section-Level Iteration via Governed Patch
- Choice: every output box in the product (planning stage outputs, PRD sections, SPEC sections, TASKS) exposes an "Iterate with AI" entry point. The interaction injects section content + doc context as agent context, collects a user message, and produces a governed patch proposal targeting that section's `block_id`.
- Why: users don't want to re-run entire planning stages to improve one paragraph. Section-level iteration gives surgical control while keeping the governance model intact — all changes attributed, reviewable, and reversible.
- Status: Phase 2. `POST /documents/:id/sections/:blockId/iterate` + `specforge iterate` CLI.
- Implementation: the iterate endpoint reuses the existing `agent-assist.ts` mini-LLM call infrastructure but outputs a full `PatchProposal` instead of a field suggestion.
- Multiplayer: concurrent iteration on the same section by different collaborators produces separate patch proposals, resolved via the existing cherry-pick queue.
- Tradeoff: adds one more entry point to the patch review queue. Risk of patch queue bloat if iteration is overused. Mitigate by showing the queue depth in the UI and allowing bulk triage.
