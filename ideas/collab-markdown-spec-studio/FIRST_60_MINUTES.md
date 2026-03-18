# SpecForge First 60 Minutes

## Goal
Bring up the actual local SpecForge MVP, verify the contracts, and run the end-to-end browser flow.

## Commands
```bash
cd ideas/collab-markdown-spec-studio

pnpm install
cp web/.env.example web/.env.local
pnpm state:reset
pnpm contracts:validate

# Terminal 1
pnpm dev:web

# Terminal 2
pnpm dev:collab

# Verification
pnpm lint
pnpm test
pnpm test:acceptance
pnpm test:e2e
```

## Success Criteria (within 60 min)
1. Web app loads locally and the collab server accepts room connections.
2. Local state re-seeds from `fixtures/` after `pnpm state:reset`.
3. Contract JSON validates.
4. Unit, acceptance, and browser tests pass.
5. The app proves guided draft -> review -> decision -> export/handoff end to end.
