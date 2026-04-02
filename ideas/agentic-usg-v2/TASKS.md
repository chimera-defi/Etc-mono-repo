# Tasks

## Dependency Order

1. Core contracts and fixtures
2. Agent proposal / execution loop
3. Frontend happy path
4. Demo script and fallback mode
5. Prize wrappers

## P0 Ship List

- CDP happy path
- tranche selector and accounting
- one prediction-yield rotation
- World-backed sensitive approval
- Arc-backed stablecoin / prediction framing
- 0G-backed decision dossier for one completed action
- audit log and prize explanation

## P1 Only If Time Allows

- `$AGNT` and bond flow
- leverage loop UX
- 0G integration polish
- nanopayment mechanics beyond narrative

## Workstream 1: Contracts

- Define `IYieldSource`, `StablecoinEngine`, `TrancheVault`, `AgentController`
- Implement local fixtures for productive LP and prediction arb sources
- Add tests for mint, repay, redeem, source rotation, tranche rebalance

Done criteria:
- green contract test suite for core flows

## Workstream 2: Agent Runtime

- Build policy engine for sensitive actions
- Add action proposal / approval / execution loop
- Emit structured logs for all agent actions

Done criteria:
- deterministic rotation and peg-defense actions succeed locally

## Workstream 3: Frontend

- Landing page and thesis explanation
- Deposit / mint / tranche views
- Agent console and audit rail
- Prize mapping explainer

Done criteria:
- 5-minute demo works without terminal output

## Workstream 4: Integrations

- World human verification wrapper
- Arc stablecoin / prediction / narrow nanopayment adapter
- 0G decision-memory adapter

Done criteria:
- each integration is visible and not hand-wavy

Implementation details:
- World
  - add proof-verification stub and approval-state UI
  - wire approval gating into `AgentController.approveAction`
  - show blocked-vs-approved flow in demo mode
- Arc
  - ensure the stablecoin and prediction-market logic are part of the same user flow
  - add one explicit programmable action such as peg-triggered emission adjustment or repay incentive switch
  - keep nanopayments to one visible transaction or mocked settlement event
- 0G
  - persist a signed decision dossier after proposal approval and before execution complete
  - show the resulting URI and dossier fields in the audit panel
  - do not add compute or scoring to P0

## Workstream 5: Demo Ops

- Seed local fixtures
- Record demo script
- Add screenshots and fallback local mode

Done criteria:
- one-command local demo startup

## Recommended Passes

### Pass 1: Scope Reduction

- remove anything not needed for the 5-minute story

### Pass 2: Demo Honesty

- label every mocked or simulated component

### Pass 3: Prize Precision

- keep World, Arc, and 0G in scope if all three attach to the same core demo
- keep 0G storage-only unless extra time remains after the core demo is stable

### Pass 4: Judge UX

- remove protocol jargon where it hides the core mechanism
