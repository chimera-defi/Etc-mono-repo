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
- Why: Clerk covers auth, teams/orgs, and invitations without building it. GitHub OAuth matches the developer persona. Multi-tenant workspace isolation requires org/team primitives before the first API route is written — Auth.js needs a week of manual org table wiring.
- Tradeoff: Clerk is a paid SaaS dependency; replaceable with Auth.js if self-hosting is required later.

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

## Decision 12: Section Granularity — Heading-Level Only
- Choice: A "section" is defined as a heading block (H1/H2/H3) and its content until the next heading.
- Why: Heading-level is the natural unit teams think in when writing specs. Paragraph-level granularity explodes the patch target count, makes the review queue unmanageable, and adds UUID marker noise to every paragraph.
- Tradeoff: Cannot propose patches at sub-section resolution. V2 can add paragraph-level as an opt-in per document type.

## Decision 13: Patch Format — AST Operations (canonical) + Text Diff (review UI)
- Choice: Agent patches are stored and transmitted as AST operations (`replace-section`, `insert-section`, `delete-section`, `insert-paragraph`). The review UI renders them as a human-readable text diff.
- Why: Text diff alone breaks on structural moves (section rename, reorder). AST ops are the correct protocol for a machine-readable system. Humans review a rendered diff — they don't read JSON.
- Tradeoff: AST schema must be locked before agent prompt templates are written. Schema changes are breaking.
- Action: Lock `patch_proposal.request.schema.json` in `contracts/v1/` before starting agent prompt work.

## Decision 14: Deployment — SaaS-Only at Launch
- Choice: Cloud-hosted SaaS only at launch. No Docker self-hosted tier in MVP.
- Why: Self-hosting requires documented ops runbooks, update paths, and alternative CRDT sync (no PartyKit). This blocks MVP without a single paying customer to justify it.
- Tradeoff: Enterprise buyers who require on-prem are excluded at launch. Open-source path deferred until adoption warrants the investment.

## Decision 15: CRDT Sync Host — PartyKit
- Choice: PartyKit as the managed WebSocket sync server for Yjs.
- Why: SaaS-only deployment (D14) removes the self-hosting constraint. `npx partykit create` + Yjs provider is the fastest path to a working multiplayer editor. Eliminates the need to run, monitor, and scale a WebSocket server.
- Tradeoff: PartyKit is a cloud vendor dependency. Migration to self-hosted y-websocket is possible if needed (same Yjs protocol).

## Decision 16: Large Document AI Strategy — Section-Level Prompting
- Choice: Agent sees the target section + 2 adjacent sections + the document's heading outline. Never the full document.
- Why: Real PRDs/specs easily exceed 50K tokens. Full-doc context is not viable. Section-level prompting handles 95%+ of real patch requests well. RAG is over-engineered for MVP.
- Tradeoff: Agent lacks full document context; may produce patches inconsistent with distant sections. Mitigate with the heading outline providing structural awareness.
- Action: Document outline (heading tree) must be included in every agent patch request as a compact context anchor.

## Decision 17: AI Cost Model — Hybrid (Included + Metered Overage)
- Choice: Subscription tier includes N AI patches/month per team (e.g. 200). Usage above that is metered overage billed at cost + margin.
- Why: Pure subscription is a COGS time bomb — one heavy team can destroy margin. Pure metered billing creates friction at every AI interaction and kills flow. Hybrid gives users predictable cost and protects platform margin.
- Tradeoff: Billing metering logic must be built before launch. Start with a generous included limit so most teams never see an overage bill.

## Decision 18: Patch Acceptance UX — Optimistic Apply with Rollback on Conflict
- Choice: When a user accepts a patch, it is applied immediately and optimistically to the canonical document via CRDT. If a conflict is detected (concurrent edit on the same section), the patch is surfaced in the conflict resolver — it does not auto-apply.
- Why: Staged preview adds a modal/save step that breaks collaborative flow. The mental model users already have (Google Docs suggestions, GitHub PR reviews) is inline accept/reject without a separate publish step. CRDT guarantees safe rollback on conflict.
- Tradeoff: Users may accept a patch and see it briefly rolled back if a conflict fires. Conflict rate should be low for heading-level granularity (D12). Surface conflicts clearly in the review queue with both versions visible.
