# One-Shot Build Checklist

Use this checklist before calling an idea pack "build-ready".

## End Artifact
- [ ] The pack states exactly what exists at the end:
  - docs only
  - web app
  - CLI
  - desktop app
  - contracts
  - hybrid full-stack product
- [ ] The pack states what is explicitly out of scope for v1.

## Product Surface
- [ ] Primary user path is named and fully described.
- [ ] Primary failure path is named and fully described.
- [ ] Human-facing products define their main screens/views.
- [ ] Human-facing products define responsive expectations or explicitly say desktop-only.
- [ ] Human-facing products define basic design-system constraints:
  - component grammar
  - layout rules
  - visual tone

## Technical Shape
- [ ] `SPEC.md` names modules, interfaces, invariants, and error cases.
- [ ] `STATE_MODEL.md` describes canonical lifecycle states.
- [ ] `TASKS.md` is dependency-ordered and includes cutlines.
- [ ] Target app/package layout is written down.

## Determinism
- [ ] `fixtures/` or equivalent deterministic seed data is defined.
- [ ] `contracts/` or equivalent interface examples exist where relevant.
- [ ] `ACCEPTANCE_TEST_MATRIX.md` maps flows to evidence.
- [ ] `FIRST_60_MINUTES.md` can bootstrap the project without invention.

## Demo And Deploy
- [ ] The pack says what runs locally.
- [ ] The pack says what is deployable on testnet/mainnet or hosted web, if relevant.
- [ ] The pack says what remains mocked or simulated.
- [ ] The demo story is judge/user legible in under 5 minutes.

## Optional, Not Default
- [ ] Add `COMPETITOR_ANALYSIS` only if market positioning matters now.
- [ ] Add `FINANCIAL_MODEL` only if unit economics or emissions meaningfully affect the product.
- [ ] Add `META_LEARNINGS` / `MULTIPASS_REVIEW` when the idea is iterating quickly enough to justify them.
