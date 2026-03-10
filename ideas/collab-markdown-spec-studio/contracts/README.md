# SpecForge Contracts

Versioned interface contracts for one-shot implementation.

## Version
- Current: `v1`
- Stability: draft, implementation-targeted

## API Contracts (v1)
- `v1/document_create.request.schema.json`
- `v1/patch_proposal.request.schema.json`
- `v1/patch_decision.request.schema.json`
- `v1/error_envelope.schema.json`

## Event Contracts (v1)
- `v1/document_event.schema.json`

## Examples
- `v1/examples/document_create.request.json`
- `v1/examples/patch_proposal.request.json`
- `v1/examples/patch_decision.request.json`
- `v1/examples/document_event.json`

## Contract Rules
1. Backward-compatible additions are allowed within `v1`.
2. Breaking changes require a new version directory.
3. Every schema change must include an updated example payload.
