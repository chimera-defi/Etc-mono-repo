# SpecForge First 60 Minutes

Template basis: `ideas/_templates/FIRST_60_MINUTES.template.md`

## Goal
Bring up local services, load deterministic fixtures, and pass core acceptance checks.

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
