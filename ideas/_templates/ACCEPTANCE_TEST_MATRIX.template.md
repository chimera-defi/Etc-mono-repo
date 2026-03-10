# Acceptance Test Matrix Template

| Flow | Fixture(s) | Contract(s) | Verification Command | Pass Condition |
|---|---|---|---|---|
| <flow> | <fixture-path> | <schema-path-or-N/A> | `<command>` | <deterministic pass condition> |

## Rules
1. One row per user-critical flow.
2. Commands should be shardable (`--filter`/equivalent).
3. Pass conditions must be machine-verifiable where possible.
