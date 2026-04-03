# Acceptance Test Matrix

## Goal

Map each judge-facing flow to a concrete build outcome and verification target.

| Flow | Preconditions | Action | Expected Result | Evidence |
|------|---------------|--------|-----------------|----------|
| Deposit collateral | local chain running, fixtures seeded | user deposits mock collateral | position becomes `COLLATERALIZED` | UI balance update + `CollateralDeposited` event |
| Mint `aUSG` | collateral deposited, health factor valid | user mints within limit | debt opens, `aUSG` balance increases | UI debt card + `AUSGMinted` event |
| Choose tranche | minted position exists | user selects senior / mezz / junior | funds map to chosen tranche with visible lock and exit terms | tranche nav, lock card, and allocation view update |
| Request senior exit | senior position exists and cooldown met | user requests exit | request enters queue and shows high redemption priority | exit ticket + `TrancheExitRequested` event |
| Block junior early exit | junior position exists and lock not expired | user requests exit early | request is rejected or queued as blocked | error banner + `TrancheStillLocked` error |
| Agent proposes rotation | prediction opportunity fixture active | agent proposes source change | action enters `PROPOSED` or `AWAITING_PROOF` | agent console entry |
| World-gated approval | proposed action exceeds threshold | human approves with proof | action moves to `APPROVED` | approval badge + `AgentActionApproved` event |
| Execute yield rotation | action approved | agent executes | `activeSourceId` changes and projected yield updates | `YieldSourceRotated` event + updated APY |
| Persist 0G dossier | action approved and executing | dossier persisted | `decisionBundleUri` visible | clickable dossier link + `DecisionBundlePersisted` event |
| Peg policy response | peg fixture moves outside band | agent proposes policy action | one policy action is shown and executed | `PegPolicyAdjusted` event |
| Repay and redeem | minted position exists | user repays and redeems | debt decreases and collateral exits | `AUSGRepaid` + `CollateralRedeemed` events |
| Demo fallback mode | live data unavailable | operator toggles fixture mode | app remains functional with deterministic state | fallback banner + successful flow replay |

## Exit Standard

The package is build-ready when every row above has:
- a mapped implementation file area
- a deterministic fixture
- a visible UI proof
- a contract or runtime event proving completion
