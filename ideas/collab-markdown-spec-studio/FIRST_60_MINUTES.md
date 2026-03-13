# SpecForge First 60 Minutes

Template basis: `ideas/_templates/FIRST_60_MINUTES.template.md`

> **Pre-build status:** No implementation exists yet. This runbook defines the target acceptance surface for when a build agent scaffolds the project. Use the Stack Bootstrap section first.

## Stack Bootstrap (run once before first `pnpm dev:up`)
```bash
# Web editor
pnpm create next-app@latest specforge-web --typescript --tailwind --app
cd specforge-web
pnpm add yjs y-websocket @codemirror/collab codemirror @clerk/nextjs

# API (separate package)
cd ../specforge-api
bun create hono .
bun add drizzle-orm postgres @electric-sql/pglite  # pglite for local dev

# Run a local Postgres (or use pglite for dev)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16
```

## Goal
Define the target local bring-up path for the first runnable implementation.

## Status
This is a target implementation checklist, not a claim that the current idea pack already contains the referenced services and commands.

## Commands
```bash
cd ideas/collab-markdown-spec-studio
cp .env.example .env.local

pnpm install
pnpm dev:up

pnpm seed --fixture ./fixtures/workspace.seed.json
pnpm seed:patches --fixture ./fixtures/patches.seed.jsonl

pnpm contracts:validate --dir ./contracts/v1 --examples ./contracts/v1/examples

pnpm test:acceptance --filter specforge:create-document
pnpm test:acceptance --filter specforge:accept-patch
pnpm test:acceptance --filter specforge:final-output

pnpm dev:down
```

## Success Criteria (within 60 min)
1. Services boot without manual config edits.
2. Fixtures load and final markdown matches `fixtures/expected.final.md`.
3. Critical acceptance checks pass.
4. The first runnable implementation preserves governed patch review, attribution, and depth-gate behavior.
