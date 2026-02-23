# InfraKit Handoff Prompts

## Primary: Full Implementation Handoff
**Use `HANDOFF_PROMPT.md`** -- This is the comprehensive, self-contained prompt for implementing the InfraKit skeleton. It includes context, what exists, what to build, constraints, and verification checklist.

## Targeted Prompts (For Smaller Tasks)

### 1) Extract Shared Primitives from Monad Scripts
"Read `staking/research/infra-kit/HANDOFF_PROMPT.md` Step 2. Extract shared primitives from `staking/monad/infra/scripts/` into `staking/infra-kit/shared/`. Parameterize user/group, ports, and paths via env vars. Each script must source `shared/lib/common.sh` and have a `--help` flag."

### 2) Create Shared Library (common.sh)
"Read `staking/research/infra-kit/HANDOFF_PROMPT.md` Step 1. Create `staking/infra-kit/shared/lib/common.sh` by merging patterns from eth2-quickstart `lib/common_functions.sh`, Aztec `scripts/lib/common.sh`, and Monad scripts. Include the Reference section functions. Verify with `tests/test_shared.sh`."

### 3) Create Adapters
"Read `staking/research/infra-kit/HANDOFF_PROMPT.md` Step 3. Create thin adapters in `staking/infra-kit/adapters/` for Monad, Ethereum, and Aztec. Each adapter sources the shared library and calls shared primitives with chain-specific args."

### 4) Create Runbooks
"Read `staking/research/infra-kit/HANDOFF_PROMPT.md` Step 4. Create runbooks in `staking/infra-kit/runbooks/` for each chain plus a template. Follow the structure: Prerequisites, Setup, Monitoring, Troubleshooting, Maintenance."

### 5) Final Review Pass
"Run the multi-pass `REVIEW_CHECKLIST.md` against the implemented `staking/infra-kit/` and resolve any gaps. Verify all scripts pass shellcheck. Ensure no duplicated logic between shared primitives and existing scripts."
