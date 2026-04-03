## Cannes 2026 Deployment And Demo

### Deployment Shape

#### Local deterministic mode

- broker, planner, scorer, and web app run locally
- Arc contract interactions mocked or pointed to local chain
- World and 0G have local or stubbed fallback modes

Purpose:
- guaranteed demo backup

#### Public demo mode

- web app deployed publicly
- broker, planner, scorer, and dossier writer on hosted backend
- escrow contract deployed on Arc public network
- sponsor integrations wired to real services where stable enough

Purpose:
- prize eligibility and live proof

### Recommended Mainnet Strategy

1. Deploy the smallest possible escrow contract surface.
2. Keep planner, broker, scoring, and dossier orchestration offchain.
3. Require human approval for all irreversible payout actions.
4. Use a single seeded poster and seeded worker operator for the demo.

### Demo Script

1. Poster verifies identity.
2. Poster funds one idea job.
3. Planner emits `BuildBrief`.
4. Worker verifies identity and claims one milestone.
5. Worker agent submits:
   - output artifact
   - trace
   - one paid dependency event
6. Scorer accepts.
7. Poster approves release.
8. Arc escrow releases payout.
9. 0G dossier link is opened.

### Demo Failure Fallbacks

#### Arc unavailable

- show local deterministic replay with the same escrow state transitions

#### World unavailable

- use clearly labeled preverified operator account for demo continuity

#### 0G unavailable

- show queued dossier state and local mirror, but mark storage as pending

### Mainnet Readiness Checklist

- contract addresses recorded
- funded poster account seeded
- funded payout account seeded
- worker operator account verified
- public dossier write tested
- acceptance and payout tested once before stage demo
- fallback mode rehearsed

### Mainnet Honesty Rules

1. Do not claim open marketplace liquidity if only one worker exists.
2. Do not claim autonomous payouts if approval remains human-gated.
3. Do not claim censorship-resistant dispute resolution if disputes remain offchain.
4. Clearly label any stubbed sponsor integration.
