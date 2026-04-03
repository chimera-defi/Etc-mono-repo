# State Model

## Goal

Turn the concept into a deterministic system with explicit entities, transitions, and invariants.

## Core Entities

### User Position

Fields:
- `userId`
- `collateralShares`
- `ausgDebt`
- `trancheId`
- `lockClass`
- `lockStartedAt`
- `lockEndsAt`
- `escrowReceiptShares`
- `exitRequestId`
- `worldProofState`
- `positionHealthFactor`

States:
- `EMPTY`
- `COLLATERALIZED`
- `MINTED`
- `LOCKED`
- `EXIT_REQUESTED`
- `REDEEMING`
- `CLOSED`

Transitions:
- `EMPTY -> COLLATERALIZED` on `deposit`
- `COLLATERALIZED -> MINTED` on `mint`
- `MINTED -> LOCKED` when user enters a tranche with lock terms
- `MINTED|LOCKED -> EXIT_REQUESTED` on `requestExit`
- `EXIT_REQUESTED -> REDEEMING` when cooldown or lock expiry is satisfied and debt is being unwound
- `REDEEMING -> CLOSED` when debt is zero and shares are withdrawn

### Global Yield Allocation

Fields:
- `activeSourceId`
- `sourceAllocationBps`
- `expectedApyBps`
- `sourceRiskFlags`
- `lastRotationAt`

States:
- `SOURCE_IDLE`
- `SOURCE_ACTIVE`
- `ROTATION_PROPOSED`
- `ROTATION_APPROVED`
- `ROTATION_EXECUTED`
- `ROTATION_REJECTED`

### Tranche System

Fields:
- `seniorNav`
- `mezzNav`
- `juniorNav`
- `seniorTargetBps`
- `mezzTargetBps`
- `juniorTargetBps`
- `seniorMinLockSeconds`
- `mezzMinLockSeconds`
- `juniorMinLockSeconds`
- `seniorRedemptionPriority`
- `mezzRedemptionPriority`
- `juniorRedemptionPriority`
- `juniorFirstLossBps`
- `rebalanceStatus`

States:
- `BALANCED`
- `DRIFTED`
- `REBALANCE_PROPOSED`
- `REBALANCE_APPROVED`
- `REBALANCE_EXECUTED`

### Agent Action

Fields:
- `actionId`
- `actionType`
- `status`
- `requestedBy`
- `requiresHumanProof`
- `decisionBundleUri`
- `createdAt`
- `expiresAt`

States:
- `DRAFT`
- `PROPOSED`
- `AWAITING_PROOF`
- `APPROVED`
- `EXECUTING`
- `EXECUTED`
- `REJECTED`
- `EXPIRED`
- `CANCELLED`

Transitions:
- `DRAFT -> PROPOSED` on `proposeAction`
- `PROPOSED -> AWAITING_PROOF` if the policy requires World approval
- `PROPOSED -> APPROVED` if no proof is required
- `AWAITING_PROOF -> APPROVED` on successful proof verification
- `APPROVED -> EXECUTING` on `executeAction`
- `EXECUTING -> EXECUTED` on success
- `PROPOSED|AWAITING_PROOF|APPROVED -> REJECTED` on operator rejection
- `PROPOSED|AWAITING_PROOF|APPROVED -> EXPIRED` on TTL expiry
- `PROPOSED|AWAITING_PROOF|APPROVED -> CANCELLED` on manual cancel

### Peg Policy

Fields:
- `pegPrice`
- `pegBandStatus`
- `lastPolicyAction`
- `emissionRate`

States:
- `HEALTHY`
- `SOFT_DEPEG`
- `POLICY_ACTION_PENDING`
- `POLICY_ACTION_EXECUTED`

## Cross-Entity Invariants

1. `ausgDebt` must never exceed `maxMintable(user)` in valid happy-path transitions.
2. Only one agent action may be `APPROVED` or `EXECUTING` at a time in MVP.
3. `decisionBundleUri` must exist before any action reaches `EXECUTED`.
4. `ROTATE_YIELD_SOURCE`, `REBALANCE_TRANCHES`, and `ADJUST_EMISSIONS` above threshold require proof before execution.
5. `0G` is storage-only in MVP and cannot determine the chosen action.
6. Junior capital is the first-loss buffer and therefore cannot also be the fastest-exiting capital class.
7. A position cannot exit before its tranche lock rules are satisfied unless the protocol defines an explicit emergency unwind path.
8. Senior exits must not consume junior-protected capital in a way that inverts the intended loss waterfall.

## Event Model

Required events:
- `CollateralDeposited`
- `AUSGMinted`
- `AUSGRepaid`
- `CollateralRedeemed`
- `AgentActionProposed`
- `AgentActionApprovalRequired`
- `AgentActionApproved`
- `AgentActionExecuted`
- `YieldSourceRotated`
- `TranchesRebalanced`
- `TrancheExitRequested`
- `TrancheExitClaimed`
- `PegPolicyAdjusted`
- `DecisionBundlePersisted`

## UI-State Mapping

- Portfolio panel reads `User Position`
- Yield panel reads `Global Yield Allocation`
- Tranche panel reads `Tranche System`
- Exit queue panel reads `lockEndsAt`, `exitRequestId`, and redemption priority
- Agent console reads `Agent Action`
- Safety banner reads `Peg Policy` and `worldProofState`
