# SpecForge First 60 Minutes

## Goal
Bring up the actual local SpecForge MVP, verify the contracts, and run the end-to-end browser flow.

## Commands
```bash
cd ideas/collab-markdown-spec-studio

bun install
cp web/.env.example web/.env.local
bun run state:reset
bun run contracts:validate

# Terminal 1
bun run dev:web

# Terminal 2
bun run dev:collab

# Verification
bun run lint
bun run test
bun run test:acceptance
bun run test:e2e
```

## Success Criteria (within 60 min)
1. Web app loads locally and the collab server accepts room connections.
2. Local state re-seeds from `fixtures/` after `bun run state:reset`.
3. Contract JSON validates.
4. Unit, acceptance, and browser tests pass.
5. The app proves guided draft -> review -> decision -> export/handoff end to end.
