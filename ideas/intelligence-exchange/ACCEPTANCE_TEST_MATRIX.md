# Intelligence Exchange Acceptance Test Matrix

| Flow | Fixture(s) | Contract(s) | Verification Command | Pass Condition |
|---|---|---|---|---|
| Submit job | `fixtures/jobs.seed.jsonl` | `contracts/v1/job_create.request.schema.json` | `pnpm test:acceptance --filter iex:submit-job` | Job accepted with deterministic ID |
| Claim job | `fixtures/workers.seed.json` | `contracts/v1/job_claim.request.schema.json` | `pnpm test:acceptance --filter iex:claim-job` | Eligible worker receives claim lease |
| Submit results | `fixtures/results.seed.jsonl` | `contracts/v1/job_result_submit.request.schema.json` | `pnpm test:acceptance --filter iex:submit-results` | Completed result passes schema + state transition |
| Emit state events | combined fixtures | `contracts/v1/job_state_event.schema.json` | `pnpm test:acceptance --filter iex:state-events` | State stream is ordered and valid |
| Settlement batch | `fixtures/expected.settlement.json` | N/A | `pnpm test:acceptance --filter iex:settlement` | Produced settlement equals expected fixture |

## Notes
- Replace `pnpm` with project package manager during implementation.
- Keep test names stable; CI can shard by `--filter`.
