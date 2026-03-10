# Intelligence Exchange First 60 Minutes

Template basis: `ideas/_templates/FIRST_60_MINUTES.template.md`

## Goal
Run local broker + worker simulation, process seed jobs, and verify deterministic settlement.

## Commands
```bash
cd ideas/intelligence-exchange
cp .env.example .env.local

pnpm install
pnpm dev:up

pnpm seed:workers --fixture ./fixtures/workers.seed.json
pnpm seed:jobs --fixture ./fixtures/jobs.seed.jsonl

pnpm contracts:validate --dir ./contracts/v1 --examples ./contracts/v1/examples

pnpm test:acceptance --filter iex:submit-job
pnpm test:acceptance --filter iex:claim-job
pnpm test:acceptance --filter iex:settlement

pnpm dev:down
```

## Success Criteria (within 60 min)
1. Broker and worker simulator boot locally.
2. Jobs route and complete deterministically from fixtures.
3. Settlement output matches `fixtures/expected.settlement.json`.
