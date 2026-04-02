# Decisions Register

## Purpose

Track phase-gate product decisions so the build does not drift back into open-ended scope.

## Frozen Decisions

### F1. Demo mode is primary

Status:
- frozen

Decision:
- deterministic fixtures are the default runtime for MVP

Why:
- reliability beats breadth in a hackathon judge flow

### F2. One hero yield source

Status:
- frozen

Decision:
- prediction-market yield rotation is the only showcase source in the judge path

Why:
- more than one hero source muddies the story

### F3. 0G is storage-only

Status:
- frozen

Decision:
- 0G only stores and serves decision dossiers in MVP

Why:
- this preserves prize fit without adding execution fragility

### F4. `$AGNT` is out of P0

Status:
- frozen

Decision:
- tokenomics remain optional polish, not part of the core acceptance bar

Why:
- the main proof is the control plane, not the emissions loop

## Decisions Still Open

### O1. Prediction data mode

Options:
- fully mocked
- delayed-live
- live-read with fixture fallback

Current lean:
- delayed-live or fixture-first

### O2. Tranche rebalance control

Options:
- automatic
- suggested
- manual-with-approval

Current lean:
- suggested for normal operations, approval-gated for large changes

### O3. Peg policy surface

Options:
- emissions adjustment only
- buyback simulation
- both

Current lean:
- one policy action only
