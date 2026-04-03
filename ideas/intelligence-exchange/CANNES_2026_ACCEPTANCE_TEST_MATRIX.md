## Cannes 2026 Acceptance Test Matrix

| Flow | Fixture(s) | Verification | Pass Condition |
|---|---|---|---|
| Verify poster | seeded poster identity | `pnpm test:acceptance --filter iex-cannes:verify-poster` | funded idea creation blocked until poster is verified |
| Fund idea escrow | funded idea fixture | `pnpm test:acceptance --filter iex-cannes:fund-idea` | escrow created and milestone budget reserved |
| Generate build brief | idea fixture | `pnpm test:acceptance --filter iex-cannes:brief` | deterministic `BuildBrief` and milestone graph produced |
| Verify worker | seeded worker identity | `pnpm test:acceptance --filter iex-cannes:verify-worker` | worker claim blocked until verified |
| Claim milestone | worker + queued milestone fixture | `pnpm test:acceptance --filter iex-cannes:claim` | eligible worker receives lease |
| Expire claim | claimed milestone fixture | `pnpm test:acceptance --filter iex-cannes:expire-claim` | expired claim requeues job |
| Submit artifact | worker submission fixture | `pnpm test:acceptance --filter iex-cannes:submit` | artifact and trace stored with valid schema |
| Score output | valid + invalid submission fixtures | `pnpm test:acceptance --filter iex-cannes:score` | valid output passes, invalid output goes to `rework` |
| Store dossier | accepted job fixture | `pnpm test:acceptance --filter iex-cannes:dossier` | dossier URI attached to build brief |
| Release payout | accepted milestone fixture | `pnpm test:acceptance --filter iex-cannes:release` | Arc escrow releases expected amount |
| Reject and refund | rejected or expired milestone fixture | `pnpm test:acceptance --filter iex-cannes:refund` | funds remain locked or refunded per policy |
| Demo fallback | public infra disabled fixture | `pnpm test:acceptance --filter iex-cannes:fallback` | local deterministic mode still completes end-to-end |
