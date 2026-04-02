# Prize Mapping

## Primary Strategy

The project should optimize for one coherent story:
- human-backed agent safely manages productive stablecoin collateral
- prediction-market yield is the memorable source rotation
- integrations are adapters around that story, not separate products

Primary build posture:
- World + Arc + 0G, if each has a visible product role in the same demo

Fallback posture:
- keep all three in the narrative, but allow one to be lighter-weight if execution risk rises

## Official Target Buckets From User-Provided Prompt

### World

- Best use of Agent Kit
  - Agent actions are gated by proof of personhood for sensitive operations.
- Best use of World ID 4.0
  - Human uniqueness is used for rate limits, anti-sybil rewards, and approval gating.
- Best use of MiniKit 2.0
  - Optional mobile shell for judge demo or consumer framing.

Implementation plan:
- Gate `approveAction(actionId)` on a valid World-backed proof for high-sensitivity action types.
- Require human proof for:
  - `ROTATE_YIELD_SOURCE` above threshold
  - `REBALANCE_TRANCHES` above threshold
  - `ADJUST_EMISSIONS`
- Show proof state and approval reason in the action drawer so the judge can see this is not cosmetic.
- If MiniKit is included, use it only as a thin mobile approval client, not a second product.

### 0G

- Best OpenClaw Agent on 0G
  - The uAgent writes a decision dossier for every major action to 0G-backed storage.
- Best DeFi App on 0G
  - The protocol is an AI-native DeFi controller, not a passive vault, because the agent proposes and logs productive collateral decisions.
- Wildcard
  - Use if the architecture is clean but not a direct category fit.

Implementation plan:
- Persist one decision dossier for each executed action:
  - action type
  - candidate source list
  - chosen source
  - expected APY delta
  - risk flags
  - peg snapshot
  - tranche exposure snapshot
  - approval requirement and approval result
- Surface a clickable `decisionBundleUri` in the UI and demo script.
- Do not make 0G part of route scoring or action execution; storage-only keeps the integration real and robust.

### Arc

- Advanced stablecoin logic
  - `aUSG` minting, peg policy, and programmable control plane.
- Prediction markets with real-world signal
  - Prediction-yield source as hedge / forecast utility.
- Agentic economy with nanopayments
  - Agent pays or settles for execution / routing actions.
- Chain-abstracted USDC apps
  - Arc can be shown as liquidity or settlement hub if needed.

Implementation plan:
- Keep Arc attached to the main product loop, not as a detached bonus:
  - `aUSG` mint/burn and peg-policy events are the smart-contract center of the demo
  - the hero yield source is prediction-market related, which supports the forecasting / hedging framing
  - any nanopayment story should stay narrow: one explicit agent settlement or routing payment in the happy path
- If chain-abstracted USDC is shown, use it as a settlement or liquidity explanation around the same mint / rotate / repay flow.

## Build Implications

1. World is not optional if it is being used as the safety thesis.
2. Arc should own the stablecoin logic framing and the prediction-market framing.
3. 0G should own the agent decision-memory layer: rationale bundle persistence and replayable audit links.

## Cutline

If time gets tight:
1. Keep World
2. Keep Arc
3. Keep 0G by reducing it to persisted decision dossiers rather than removing it entirely
