## Collaborative Spec-to-Ship Workspace PRD

**Status**: Draft | **Last Updated**: 2026-03-06 | **Owner**: TBD

### Problem
Teams doing startup/product planning often draft PRD/spec/design docs in fragmented tools:
1. chat in one place,
2. docs in another,
3. AI output pasted manually,
4. poor provenance and messy merges.

### PRD Note
`PRD` means **Product Requirements Document**: the canonical statement of user problem, scope, success criteria, and delivery constraints.

### Product Thesis
Create a focused collaborative Markdown workspace for humans and AI agents where edits are:
1. real-time,
2. attributable,
3. merge-safe,
4. workflow-linked to implementation.
5. convertible into a starter GitHub repository flow.

### What Exists Already (Reality Check)
- Real-time collaborative docs are mature (Google Docs, Notion, Coda).
- Collaborative Markdown tools exist (HackMD, HedgeDoc).
- Therefore the wedge is not "another editor"; it is **agent-native specification workflow**.

### Differentiation Wedge
1. AI agent edits as patch proposals (not silent overwrites).
2. Section-level branch/merge with approval gates.
3. Citation/provenance tagging per generated block.
4. "Spec-to-build" outputs (tasks, acceptance criteria, agent handoff bundles).

### Core Users (MVP)
1. Startup teams writing PRD/specs with AI assistance.
2. Engineering leads managing multiple agent contributors.
3. Product+engineering pods needing auditable decision history.

### Non-Goals (MVP)
1. Full Google Docs replacement for all document types.
2. General office suite features (slides/spreadsheets).
3. Enterprise knowledge-base platform scope.

### MVP Scope
1. Multiplayer Markdown editor with presence/cursors/comments.
2. AI side panel that proposes doc patches.
3. Accept/reject/cherry-pick AI edits at section granularity.
4. Version history + per-edit attribution (human/agent).
5. Export to markdown + JSON spec bundle.

### Phase 2 Scope (If MVP Validates)
1. One-click starter repository generation from approved spec bundle.
2. Template-driven scaffolds (web app/API/docs-first presets).
3. Traceability from generated tasks/issues back to spec sections.

### Guided Idea-Depth Assistant (SpecForge Productization)
1. Built-in broad-to-deep wizard with required gates for PRD/SPEC/risk/validation/economics.
2. Agent asks targeted continuation questions when required detail is missing.
3. Agent must produce end-of-iteration recap:
   - thesis now
   - what changed
   - open decisions
   - current go/no-go posture
4. Goal: prevent shallow specs and reduce idea drift between user intent and produced artifacts.

### Guided Clarification UX (Ask-User Pattern)
1. When confidence is low, assistant pauses and asks a focused clarification question.
2. User gets 2-3 constrained options with tradeoffs.
3. Selected answer is written into PRD/spec sections and decision log.
4. Agent generation continues only after required clarifications are resolved.

### Business Model
1. Team subscription by seats + AI usage credits.
2. Premium for advanced governance/workflow controls.
3. Enterprise plan for SSO/audit/compliance retention.

### TAM/SAM/SOM Framing (Bottom-Up)
Use workflow-based TAM, not broad "document software" TAM:

- `target teams x monthly willingness-to-pay x attach rate`

Illustrative planning model:
- 25,000 target startup/eng teams x $40/team/mo x 20% reachable attach
- = ~$2.4M ARR initial reachable segment

Add-on AI usage and enterprise governance can expand this if retention is strong.

### GTM
1. Wedge into AI-heavy startup teams and dev shops.
2. Integrate with GitHub/Jira/Linear to connect spec -> execution.
3. Content-led growth via templates and "good spec" playbooks.
4. Viral loop: shared docs with guest review + easy import/export.
5. Expand from \"spec editor\" narrative to \"spec-to-ship\" narrative once repo generation is stable.

### Success Metrics
1. Activation: first collaborative spec completed.
2. Value: percentage of AI patch suggestions accepted.
3. Retention: weekly active teams writing/updating specs.
4. Throughput: time from initial draft to implementation-ready spec.

### Risks
1. Crowded doc market with strong incumbents.
2. AI patch quality may reduce trust if noisy.
3. Multiplayer consistency and merge UX complexity.
4. Cost control for AI-heavy sessions.

### Kill Criteria
1. Teams use it once for ideation but return to incumbent docs for final specs.
2. AI patch acceptance is persistently low.
3. Collaboration reliability issues (conflicts/data loss) hurt trust.

### Why This Could Work
A narrow, workflow-native product for "specs that lead to code" can win even in a crowded editor market if it materially reduces planning-to-build cycle time.

### Naming Direction
See `NAME_OPTIONS.md`. Current preferred names: `SpecForge` or `ShipSpec`.
