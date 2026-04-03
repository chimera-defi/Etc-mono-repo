# AgenticUSG Package Scaffold

This package scaffold exists to turn the idea pack in `ideas/agentic-usg-v2/` into a concrete implementation starting point.

## Commands

```bash
node packages/agentic-usg-v2/scripts/check.mjs
node packages/agentic-usg-v2/contracts/test-placeholder.mjs
node packages/agentic-usg-v2/agent/test-placeholder.mjs
node packages/agentic-usg-v2/fixtures/validate-fixtures.mjs
node packages/agentic-usg-v2/web/dev-server.mjs
```

## Included Layout

- `contracts/` - stablecoin engine, tranche vaults, lock-policy contracts, yield adapters, policy contracts
- `agent/` - deterministic uAgent runtime and policy evaluation
- `web/` - judge-facing frontend
- `integrations/` - thin wrappers for World, Arc, and 0G tied to the same core flow
- `fixtures/` - seeded market state, prediction outcomes, peg stress scenarios
- `docs/` - local implementation notes and demo assets

## MVP Build Order

1. contracts
2. agent
3. web
4. fixtures
5. integrations

Bootstrap files now included:
- `package.json`
- placeholder entry files in `contracts/`, `agent/`, and `web/`
- fixture schema + sample scenario in `fixtures/`
- placeholder check scripts in `scripts/`

See:
- [idea pack](../../ideas/agentic-usg-v2/README.md)
- [tasks](../../ideas/agentic-usg-v2/TASKS.md)
- [demo script](../../ideas/agentic-usg-v2/DEMO_SCRIPT.md)
