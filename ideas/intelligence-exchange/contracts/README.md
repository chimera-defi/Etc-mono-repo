# Intelligence Exchange Contracts

Template basis: `ideas/_templates/CONTRACTS_README.template.md`

## Version
- Current: `v1`
- Stability: draft, implementation-targeted

## API Contracts (v1)
- `v1/job_create.request.schema.json`
- `v1/job_claim.request.schema.json`
- `v1/job_result_submit.request.schema.json`
- `v1/error_envelope.schema.json`

## Event Contracts (v1)
- `v1/job_state_event.schema.json`

## Examples
- `v1/examples/job_create.request.json`
- `v1/examples/job_claim.request.json`
- `v1/examples/job_result_submit.request.json`
- `v1/examples/job_state_event.json`

## Contract Rules
1. `v1` is pre-compatibility and may include breaking changes until frozen.
2. Backward compatibility is required starting from `v2` onward.
3. Every schema change must include an updated example payload.
