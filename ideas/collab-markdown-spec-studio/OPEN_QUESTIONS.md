## SpecForge Open Questions

These questions must be answered before the MVP build can be one-shot executed. They represent genuine unknown unknowns or decisions that require human input.

---

### Q1: What is the exact granularity of a "section"?

Options:
1. Heading-level only (H1/H2/H3 blocks the natural boundary).
2. Paragraph-level (finer control but massively more patch targets).
3. Configurable per document type.

**Why it matters:** Section granularity determines the patch diffing strategy, the comment threading model, the section ID count per document, and the UX complexity. Heading-level is the recommended starting point.

**Decision needed from:** product owner.

---

### Q2: Should patches be text-based diffs (unified diff) or AST-based operations?

Options:
1. Unified text diff (simpler, human-readable, familiar to devs).
2. AST-level operations (`insert-paragraph`, `replace-section`, `delete-block`).
3. Both: AST ops as the canonical format, rendered as text diff for review UX.

**Why it matters:** The patch format is the core protocol. It affects the agent prompt design, the merge/conflict engine, and the audit trail schema. AST ops are more powerful but require the schema to be locked early.

**Decision needed from:** tech lead.

---

### Q3: Auth strategy — Clerk vs Auth.js vs roll-your-own?

Options:
1. Clerk (recommended): full-service auth + teams/orgs; fastest to implement.
2. Auth.js (Next-Auth): open source, self-hostable, more setup.
3. Custom JWT with GitHub OAuth: maximum control, maximum work.

**Why it matters:** Multi-tenant workspace isolation depends on the auth/org model. Choose before writing any API layer.

**Decision needed from:** tech lead or owner (cost tolerance question).

---

### Q4: What is the self-host story at launch?

Options:
1. SaaS-only at launch (fastest).
2. Docker-based self-hosted tier from day one (important for enterprise trust).
3. SaaS-first, open-source later (if adoption warrants).

**Why it matters:** Self-hosted changes the deployment story, auth requirements, and pricing model. Affects whether PartyKit (cloud-only) can be used for CRDT sync.

**Decision needed from:** founder.

---

### Q5: Which real-time hosting approach for the CRDT sync server?

Options:
1. **PartyKit** (managed WebSocket infra, cloud-only, fastest): `npx partykit create`.
2. **Self-hosted y-websocket** (open source, self-hostable, more ops): Docker container.
3. **Liveblocks** (managed, higher cost, richer presence APIs).

**Why it matters:** If self-hosting is required (Q4), PartyKit is not viable. Choose before writing the editor integration code.

**Decision needed from:** tech lead.

---

### Q6: How do you handle documents that exceed the AI context window?

Large specs (>50K tokens) cannot be patched in full-document context. Options:
1. Section-level prompting only (agent sees the target section + surrounding context, not the whole doc).
2. RAG retrieval of relevant sections to build a rolling context window.
3. Hard limit: documents over X sections cannot use AI patching.

**Why it matters:** Most real PRDs/specs will exceed 32K tokens with examples and tables. This needs to be designed in, not retrofitted.

**Decision needed from:** tech lead.

---

### Q7: What is the AI cost pass-through model?

Options:
1. Include AI usage in subscription (fixed cost per team; easier UX, harder margin).
2. Metered AI credits (usage-based, complex billing, transparent cost).
3. Hybrid: subscription includes N patches/month, then metered overage.

**Why it matters:** AI cost is the primary COGS variable. The billing model must be decided before the AI usage metering is built.

**Decision needed from:** founder.

---

### Q8: What are the exact MVP acceptance criteria for "patch accepted"?

A user accepts a patch. What state transitions happen?
1. Patch applied to canonical doc immediately?
2. Patch staged in a preview layer until the user saves/publishes?
3. Patch applied optimistically + rolled back on conflict?

**Why it matters:** This is the core UX contract. It affects the state machine, the CRDT merge strategy, and the version snapshot triggers.

**Decision needed from:** product lead.

---

### Q9: Does the MVP need multi-workspace support (teams) from day one?

Options:
1. Single-tenant personal workspaces only at MVP (fastest build).
2. Multi-user shared workspaces from day one (required for the core value prop).

**Why it matters:** Real-time collaboration requires shared workspaces. If the MVP is single-user with AI patch suggestions, it's a different product than multi-user collab. The thesis requires multi-user.

**Recommendation:** Multi-user shared workspaces are required from day one; this is not optional.

---

## Resolved Decisions

| Question | Resolution | Source |
|---|---|---|
| CRDT library | Yjs | ARCHITECTURE_DECISIONS.md D1 |
| Frontend framework | Next.js 15 + CodeMirror 6 | ARCHITECTURE_DECISIONS.md D2 |
| API runtime | Hono + Bun | ARCHITECTURE_DECISIONS.md D3 |
| Database | Postgres + R2 | ARCHITECTURE_DECISIONS.md D4 |
| AI provider | Claude API (pluggable) | ARCHITECTURE_DECISIONS.md D6 |
| Section ID scheme | UUID comment markers | ARCHITECTURE_DECISIONS.md D7 |
| Depth wizard scope | Phase 2 only | ARCHITECTURE_DECISIONS.md D11 |
