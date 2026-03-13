## SpecForge Open Questions

All questions resolved. See Resolved Decisions table below.

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
| Multi-workspace | Required from day one — single-user is a different product | Core thesis: real-time collab |
| Patch agent permissions | Agent = patch-proposal only; no direct write access | ARCHITECTURE_DECISIONS.md D8 |
| Q1: Section granularity | Heading-level only (H1/H2/H3). Paragraph-level deferred to V2. | ARCHITECTURE_DECISIONS.md D12 |
| Q2: Patch format | Hybrid: AST ops as canonical protocol, rendered as text diff in review UI | ARCHITECTURE_DECISIONS.md D13 |
| Q3: Auth provider | Clerk (covers org/team isolation, invitations, GitHub OAuth) | ARCHITECTURE_DECISIONS.md D5 (confirmed) |
| Q4: Self-host story | SaaS-only at launch. Open-source path deferred until adoption warrants. | ARCHITECTURE_DECISIONS.md D14 |
| Q5: CRDT sync host | PartyKit (SaaS-only unlocks this; eliminates WebSocket ops burden) | ARCHITECTURE_DECISIONS.md D15 |
| Q6: Large doc strategy | Section-level prompting: agent sees target section + 2 adjacent + outline. No full-doc context. | ARCHITECTURE_DECISIONS.md D16 |
| Q7: AI cost model | Hybrid: N patches/month included in subscription, metered overage above that. | ARCHITECTURE_DECISIONS.md D17 |
| Q8: Patch acceptance UX | Optimistic apply + rollback on conflict. No staged preview step. | ARCHITECTURE_DECISIONS.md D18 |
