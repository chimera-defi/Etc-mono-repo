# SpecForge First 60 Minutes (Local Bootstrap)

## Goal
Bring up local services, load deterministic fixtures, and pass core acceptance checks.

## Commands
```bash
# 0) Environment
cd ideas/collab-markdown-spec-studio
cp .env.example .env.local

# 1) Install + boot
pnpm install
pnpm dev:up

# 2) Seed fixtures
pnpm seed --fixture ./fixtures/workspace.seed.json
pnpm seed:patches --fixture ./fixtures/patches.seed.jsonl

# 3) Validate contracts
pnpm contracts:validate --dir ./contracts/v1 --examples ./contracts/v1/examples

# 4) Run critical acceptance set
pnpm test:acceptance --filter specforge:create-document
pnpm test:acceptance --filter specforge:accept-patch
pnpm test:acceptance --filter specforge:final-output

# 5) Teardown
pnpm dev:down
```

## Success Criteria (within 60 min)
1. Services boot without manual config edits.
2. Fixtures load and final markdown matches `fixtures/expected.final.md`.
3. At least 3 critical acceptance flows pass.
