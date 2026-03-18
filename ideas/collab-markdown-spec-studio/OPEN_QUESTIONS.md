## SpecForge Open Questions

These are the remaining product/runtime questions after the local MVP cleanup pass.

## Still Open

| Question | Current Default | What Still Needs Deciding |
|---|---|---|
| Pilot auth and membership | Local actor switching plus GitHub OAuth hooks | Whether to fully replace local actor switching in the main UI once pilot membership persistence is complete |
| Hosted persistence | Local PGlite snapshot sharing | Which hosted database/storage shape becomes the first deployable SaaS target |
| Template expansion | One curated TypeScript starter | Which second template, if any, is worth adding before design-partner validation |
| Runner autonomy | Bounded parity runner with handoff/review cadence | How much unattended execution is acceptable before requiring a human checkpoint |
| Deployment model | Local web + local collab server | The minimal hosted topology for pilot environments, logs, and incident handling |

## Resolved Runtime Direction

| Area | Current Runtime |
|---|---|
| Editor | Next.js 16 + Tiptap |
| Collaboration | Yjs + Hocuspocus |
| Local persistence | Embedded PGlite with snapshot sharing |
| Auth | Local fallback plus GitHub OAuth hooks |
| Delivery loop | Node parity runner around `codex exec` |

## Source Of Truth

For implemented behavior and defaults, prefer:
- `SPEC.md`
- `ARCHITECTURE_DECISIONS.md`
- `TECH_STACK.md`
- `TASKS.md`
- `web/README.md`
