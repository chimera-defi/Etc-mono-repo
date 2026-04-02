# Architecture Decisions

## D1. Demo Mode First

Decision:
- Build a deterministic demo mode with seeded fixtures as the primary runtime.

Why:
- Hackathon reliability matters more than live-market breadth.

## D2. One Hero Yield Source

Decision:
- Prediction-market yield is the only hero rotation path for the first demo.

Why:
- More than one showcase source dilutes the pitch.

## D3. Human Approval On Sensitive Actions

Decision:
- Any action that moves more than a configured threshold or changes emissions requires identity-backed approval.

Why:
- This makes the World integration materially important rather than cosmetic.

## D4. No Live Liquidations In MVP

Decision:
- Do not build or demo real liquidation behavior in the first pass.

Why:
- Liquidation paths add complexity and fragility without helping the main narrative.

## D5. Prize Wrappers Come Last

Decision:
- Core protocol loop first, integration wrappers second.

Why:
- A clean standalone product is easier to judge and easier to demo.

## D6. 0G Owns Agent Decision Memory Only

Decision:
- Use 0G only for persisted agent decision dossiers in MVP, not for scoring or route selection.

Why:
- This keeps 0G concrete, demo-visible, and honest without making the core action-selection path depend on a second fragile subsystem.
