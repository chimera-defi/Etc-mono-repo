# Intelligence Exchange First 60 Minutes (Local Bootstrap)

## Goal
Run local broker + worker simulation, process seed jobs, and verify deterministic settlement.

## Commands
```bash
# 0) Environment
cd ideas/intelligence-exchange
cp .env.example .env.local

# 1) Install + boot
pnpm install
pnpm dev:up

# 2) Seed workers and jobs
pnpm seed:workers --fixture ./fixtures/workers.seed.json
pnpm seed:jobs --fixture ./fixtures/jobs.seed.jsonl

# 3) Validate contracts
pnpm contracts:validate --dir ./contracts/v1 --examples ./contracts/v1/examples

# 4) Run critical acceptance set
pnpm test:acceptance --filter iex:submit-job
pnpm test:acceptance --filter iex:claim-job
pnpm test:acceptance --filter iex:settlement

# 5) Teardown
pnpm dev:down
```

## Success Criteria (within 60 min)
1. Broker and worker simulator boot locally.
2. Jobs route and complete deterministically using fixture data.
3. Settlement output matches `fixtures/expected.settlement.json`.
