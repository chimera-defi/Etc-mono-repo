# Intelligence Exchange First 60 Minutes

Template basis: `ideas/_templates/FIRST_60_MINUTES.template.md`

> **Pre-build status:** No implementation exists yet. This runbook defines the target acceptance surface for when a build agent scaffolds the project. Use the Stack Bootstrap section first.

## Stack Bootstrap (run once before first `pnpm dev:up`)
```bash
# Broker API (Hono + Bun)
mkdir iex-broker && cd iex-broker
bun create hono .
bun add drizzle-orm postgres bullmq ioredis stripe

# Worker CLI (Node + TypeScript)
mkdir ../iex-worker && cd ../iex-worker
bun init -y
bun add @anthropic-ai/sdk openai axios commander dotenv  # connectors

# Local deps
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16
docker run -d -p 6379:6379 redis:7  # for job queue (BullMQ)
```

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
