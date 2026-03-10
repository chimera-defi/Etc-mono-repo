# SpecForge Fixtures

Template basis: `ideas/_templates/FIXTURES_README.template.md`

## Files
- `workspace.seed.json`: baseline workspace/doc seed.
- `patches.seed.jsonl`: ordered patch proposals.
- `expected.final.md`: expected merged markdown after accepted patches.

## Determinism Rules
1. Use fixed IDs and timestamps from these fixtures in tests.
2. Apply patches in listed order unless a test explicitly reorders.
3. Compare final output byte-for-byte with `expected.final.md`.
