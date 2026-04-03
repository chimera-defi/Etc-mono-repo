## Cannes 2026 Acceptance Test Matrix

| Flow | Fixture(s) | Contract(s) | Verification Command | Pass Condition |
|---|---|---|---|---|
| Verify poster | `idea.seed.json` + poster identity fixture | `shared/contracts/identity.schema.json` | `pnpm test:acceptance --filter iex-cannes:verify-poster` | funded idea creation blocked until poster is verified |
| Fund idea escrow | funded idea fixture | `contracts/idea_escrow.event.schema.json` | `pnpm test:acceptance --filter iex-cannes:fund-idea` | escrow created and milestone budget reserved |
| Generate build brief | idea fixture | `shared/contracts/build_brief.schema.json` | `pnpm test:acceptance --filter iex-cannes:brief` | deterministic `BuildBrief` and milestone graph produced |
| Verify worker | worker identity fixture | `shared/contracts/identity.schema.json` | `pnpm test:acceptance --filter iex-cannes:verify-worker` | worker claim blocked until verified |
| Claim milestone | worker + queued milestone fixture | `shared/contracts/job_claim.schema.json` | `pnpm test:acceptance --filter iex-cannes:claim` | eligible worker receives lease |
| Expire claim | claimed milestone fixture | `shared/contracts/job_state_event.schema.json` | `pnpm test:acceptance --filter iex-cannes:expire-claim` | expired claim requeues job |
| Submit artifact | valid submission fixture | `shared/contracts/execution_submission.schema.json` | `pnpm test:acceptance --filter iex-cannes:submit` | artifact and trace stored with valid schema |
| Score output | valid + invalid submission fixtures | `shared/contracts/score_result.schema.json` | `pnpm test:acceptance --filter iex-cannes:score` | valid output passes, invalid output goes to `rework` |
| Store dossier | accepted job fixture | `shared/contracts/dossier_record.schema.json` | `pnpm test:acceptance --filter iex-cannes:dossier` | dossier URI attached to build brief |
| Release payout | accepted milestone fixture | `contracts/idea_escrow.event.schema.json` | `pnpm test:acceptance --filter iex-cannes:release` | Arc escrow releases expected amount |
| Reject and refund | rejected or expired milestone fixture | `contracts/idea_escrow.event.schema.json` | `pnpm test:acceptance --filter iex-cannes:refund` | funds remain locked or refunded per policy |
| Demo fallback | public infra disabled fixture | combined local fixtures | `pnpm test:acceptance --filter iex-cannes:fallback` | local deterministic mode still completes end-to-end |
