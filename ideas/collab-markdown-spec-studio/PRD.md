## SpecForge PRD

**Status**: Scoped MVP/spec parity reached on the build branch | **Last Updated**: 2026-03-18 | **Owner**: SpecForge

### Problem
Teams doing startup/product planning often draft PRD/spec/design docs in fragmented tools:
1. chat in one place,
2. docs in another,
3. AI output pasted manually,
4. poor provenance and messy merges.

### Product Thesis
Create a focused collaborative spec IDE for humans and AI agents where work happens on the same markdown canvas and edits are:
1. real-time,
2. attributable,
3. merge-safe,
4. depth-gated before milestone close,
5. workflow-linked to implementation.
6. optionally convertible into a starter GitHub repository flow.

### Current Shipped Product
The branch currently ships:
1. guided spec creation,
2. mini agent-assist for populating guided fields,
3. multiplayer drafting,
4. governed agent patch review,
5. comments, clarifications, provenance, and readiness,
6. export + starter handoff + execution brief + launch packet,
7. local admin controls for fast MVP testing,
8. marketing/overview and pricing surfaces at `/` and `/pricing`,
9. a hosted-runtime rehearsal path with `web`, `collab-server`, and `postgres`.

### Company Plan After MVP Parity
The broader company plan is still larger than the shipped MVP:
1. validate design-partner demand and retention,
2. decide hosted SaaS vs self-hosted OSS packaging,
3. deepen commercial onboarding, conversion instrumentation, and self-serve setup,
4. add billing, metering, backup/restore, and operational dashboards,
5. expand starter generation only after real demand proves which templates matter.

### What Exists Already (Reality Check)
- Real-time collaborative docs are mature (Google Docs, Notion, Coda).
- Collaborative Markdown tools exist (HackMD, HedgeDoc).
- Therefore the wedge is not "another editor"; it is **agent-native specification workflow on a shared human+agent canvas**.

### Differentiation Wedge
1. AI agent edits as patch proposals (not silent overwrites).
2. Section/block-level attribution, review, and approval gates.
3. Depth gates that force missing decisions, risks, and recap before phase close.
4. Citation/provenance tagging per generated block.
5. "Spec-to-build" outputs (tasks, acceptance criteria, agent handoff bundles).

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
2. Agent-assist surface that helps populate guided spec fields from a rough brief.
3. Accept/reject/cherry-pick AI edits at block or section granularity.
4. Version history + per-edit attribution (human/agent).
5. Readiness gates and clarification loops before build handoff.
6. Export to markdown + JSON spec bundle.
7. Delivery loop that can keep pushing the minimum extensible product toward scoped parity.
8. Public landing and pricing surfaces that explain the product and route users into the workspace.

### Phase 2 Scope (If MVP Validates)
1. Starter repository generation from approved spec bundle.
2. Broader template-driven scaffolds (web app/API/docs-first presets).
3. Traceability from generated tasks/issues back to spec sections.
4. Roll out on curated `ideas/` examples before opening arbitrary project generation.
5. Commercial onboarding, billing, and plan enforcement.

### Guided Idea-Depth Assistant (SpecForge Productization)
1. Built-in broad-to-deep wizard with required gates for PRD/SPEC/risk/validation/economics.
2. Agent asks targeted continuation questions when required detail is missing.
3. Agent must produce end-of-iteration recap:
   - thesis now
   - what changed
   - open decisions
   - current go/no-go posture
4. Goal: prevent shallow specs and reduce idea drift between user intent and produced artifacts.
5. Delivery principle: every approved spec should first yield a minimum extensible product that is runnable and then be driven toward parity by the delivery loop.

### Example Corpus Strategy
Use selected packs under `ideas/` as:
1. internal fixtures for regression and end-to-end evaluation,
2. proof that authored specs can become executable downstream outputs,
3. a benchmark corpus across rough, mid-fidelity, and mature idea stages.

### Business Model
1. Team subscription by seats + AI usage credits.
2. Premium for advanced governance/workflow controls.
3. Enterprise plan for SSO/audit/compliance retention.
4. Optional self-hosted packaging can widen adoption, but multiplayer still requires a backend runtime.

### TAM/SAM/SOM Framing (Bottom-Up)
Use workflow-based TAM, not broad "document software" TAM:

- `target teams x monthly willingness-to-pay x attach rate`

Illustrative planning model:
- 25,000 target startup/eng teams x $40/team/mo x 20% reachable attach
- = ~$2.4M ARR initial reachable segment

Add-on AI usage and enterprise governance can expand this if retention is strong.

### GTM
1. Wedge into AI-heavy startup teams and dev shops.
2. Lead with authoring and governance value before broad repo-generation claims.
3. Treat autonomous backlog-driving as product value, not just internal build hygiene.
4. Integrate with GitHub/Jira/Linear to connect spec -> execution.
5. Content-led growth via templates and "good spec" playbooks.
6. Viral loop: shared docs with guest review + easy import/export.
7. Expand from "spec IDE" narrative to "spec-to-code" narrative once example-backed generation is stable.

### Success Metrics
1. Activation: first collaborative spec reaches milestone-close recap.
2. Value: percentage of AI patch suggestions accepted, segmented by patch type.
3. Retention: weekly active teams writing/updating specs.
4. Throughput: time from initial draft to implementation-ready spec.
5. Quality: reduction in downstream rework for instrumented example builds.
6. Trust: reviewer-rated confidence in accepted agent patches.

### Risks
1. Crowded doc market with strong incumbents.
2. AI patch quality may reduce trust if noisy.
3. Multiplayer consistency and merge UX complexity.
4. Cost control for AI-heavy sessions.
5. Repo generation can distract from proving authoring behavior.

### Kill Criteria
1. Teams use it once for ideation but return to incumbent docs for final specs.
2. AI patch acceptance is persistently low.
3. Collaboration reliability issues (conflicts/data loss) hurt trust.
4. Example builds show little quality improvement despite heavier authoring flow.

### Why This Could Work
A narrow, workflow-native product for "specs that lead to code" can win even in a crowded editor market if it makes collaborative authoring trustworthy, forces better decisions, and materially reduces planning-to-build rework.

### Naming Direction
See `archive/NAME_OPTIONS.md`. Current preferred names: `SpecForge` or `ShipSpec`.
