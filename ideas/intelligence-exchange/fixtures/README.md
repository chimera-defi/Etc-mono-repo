# Intelligence Exchange Fixtures

Template basis: `ideas/_templates/FIXTURES_README.template.md`

## Files
- `jobs.seed.jsonl`: canonical job submissions.
- `workers.seed.json`: worker capability registry seed.
- `results.seed.jsonl`: deterministic execution result submissions.
- `expected.settlement.json`: expected settlement batch output.

## Determinism Rules
1. Use fixed IDs, bids, and timestamps in fixture files.
2. Keep matching policy deterministic for fixture tests.
3. Settlement output must match `expected.settlement.json` exactly.
