## Architecture Decisions (Spec-to-Ship Workspace)

## Decision 1: CRDT Collaboration Core — Yjs
- Choice: **Yjs** as the CRDT library (y-websocket or PartyKit as the sync server).
- Why: Yjs is the most production-proven CRDT for document editing; used by Heptabase, GitBook, and others. PartyKit simplifies WebSocket infra for early builds.
- Tradeoff: Yjs awareness types have an AST learning curve; PartyKit adds a vendor dependency.
- Alternative considered: Automerge (less mature ecosystem, slower for large docs).

## Decision 2: Frontend — Next.js App Router + CodeMirror 6
- Choice: Next.js 15 (App Router) + CodeMirror 6 as the editor foundation.
- Why: Next.js is the project's default stack; CodeMirror 6 supports CRDT binding via `@codemirror/collab` and is well-maintained.
- Tradeoff: CodeMirror requires a custom markdown preview pane alongside the editor; ProseMirror gives richer WYSIWYG but is heavier to integrate.

## Decision 3: Backend API — Hono (TypeScript) on Bun
- Choice: Hono + Bun runtime for the document/metadata API.
- Why: Consistent with the cadence-api pattern (TypeScript, fast startup, lean); Bun is the project default.
- Tradeoff: Hono/Bun ecosystem is younger. Fall back to Fastify/Node if production issues arise.

## Decision 4: Database — Postgres (metadata + events) + R2/S3 (snapshots)
- Choice: Postgres for documents, sections, patches, users, and append-only audit events; Cloudflare R2 for snapshot blobs.
- Why: Relational model fits the patch queue and audit log well; R2 is cheaper than S3 for blob storage.
- Tradeoff: Append-only event discipline must be enforced by application code; no native event-sourcing guarantee.

## Decision 5: Auth — Clerk (GitHub/Google OAuth)
- Choice: Clerk for authentication; GitHub OAuth as primary identity for the dev-team audience.
- Why: Clerk covers auth, teams/orgs, and invitations without building it. GitHub OAuth matches the developer persona.
- Tradeoff: Clerk is a paid SaaS dependency; replaceable with Auth.js if needed.
- Open: see OPEN_QUESTIONS.md Q3.

## Decision 6: AI Patch Engine — Claude API (provider-pluggable)
- Choice: Claude API (claude-sonnet-4-6 minimum) for patch generation; provider abstracted behind an adapter interface.
- Why: Best instruction-following and long-context document awareness for structured patch proposals.
- Tradeoff: AI cost-per-session is the primary COGS driver; must be metered per workspace.

## Decision 7: Section ID Stability
- Choice: UUIDs assigned at AST parse time, stored as invisible comment markers (`<!-- sf:id:uuid -->`) in the markdown source, stripped on final export.
- Why: Header text is not a stable ID (users rename sections constantly). UUIDs provide stable patch targets and provenance anchors.
- Tradeoff: Comment markers are visible in raw markdown during editing; rendering layer must hide them. Section moves must transfer the ID, not regenerate it.

## Decision 8: Patch Proposal Model for Agents
- Choice: agent edits are patch proposals by default; agents cannot directly write to the canonical doc.
- Why: Preserves human trust and merge control in multi-author environments.
- Tradeoff: Extra review step can slow throughput. Provide a "bulk accept" shortcut for trusted agents.

## Decision 9: Repo Generation in Phase 2
- Choice: repo scaffolding ships after MVP collaboration fit is proven.
- Why: Repo generation is a separate product surface; overloading MVP risks quality on both.
- Tradeoff: The full "spec-to-ship" value narrative is delayed.

## Decision 10: Export Bundle as Contract
- Choice: PRD.md, SPEC.md, TASKS.md, and agent_spec.json are versioned output contracts.
- Why: Downstream build agents need deterministic, schema-stable inputs.
- Tradeoff: Schema maintenance overhead increases as the product evolves.

## Decision 11: Idea-Depth Orchestrator — Phase 2 Only
- Choice: The depth wizard and clarification engine are NOT in MVP scope.
- Why: The wizard conflates the editor product with AI meta-tooling. MVP must prove the core collaboration + patch review value first.
- Tradeoff: The "SpecForge built with SpecForge" narrative is deferred.
