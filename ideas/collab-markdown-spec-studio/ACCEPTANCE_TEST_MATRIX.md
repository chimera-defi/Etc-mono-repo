# SpecForge Acceptance Test Matrix

Template basis: `ideas/_templates/ACCEPTANCE_TEST_MATRIX.template.md`

Target matrix for the first runnable implementation. Current idea-pack contracts and fixtures define the intended behavior, not a fully implemented local stack.

| Flow | Fixture(s) | Contract(s) | Verification Command | Pass Condition |
|---|---|---|---|---|
| Create document | `fixtures/workspace.seed.json` | `contracts/v1/document_create.request.schema.json` | `bun run test:acceptance --filter specforge:create-document` | Document persists with `version=1` |
| Propose patch | `fixtures/patches.seed.jsonl` | `contracts/v1/patch_proposal.request.schema.json` | `bun run test:acceptance --filter specforge:propose-patch` | Patch queue contains proposed patch with base version |
| Accept patch | `fixtures/patches.seed.jsonl` | `contracts/v1/patch_decision.request.schema.json` | `bun run test:acceptance --filter specforge:accept-patch` | Accepted patch updates canonical markdown |
| Event emission | `fixtures/patches.seed.jsonl` | `contracts/v1/document_event.schema.json` | `bun run test:acceptance --filter specforge:event-stream` | Ordered events emitted with monotonic versions |
| Final merge output | `fixtures/expected.final.md` | N/A | `bun run test:acceptance --filter specforge:final-output` | Byte-equal output to fixture |
