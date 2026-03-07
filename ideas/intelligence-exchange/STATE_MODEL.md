## State Model (Canonical)

This document defines canonical lifecycle states used across spec, flows, and wireframes.

## Job Lifecycle
1. `created`: job accepted by API, not yet queued.
2. `queued`: eligible for matching/claim.
3. `claimed`: lease issued to a worker.
4. `running`: worker actively executing.
5. `submitted`: output + trace submitted, awaiting review.
6. `accepted`: output approved and settled.
7. `rework`: output requires revision and resubmission.
8. `rejected`: output failed acceptance.
9. `expired`: claim lease expired without valid submission.
10. `disputed`: settlement/review in dispute process.

## Case Lifecycle (Risk/Disputes)
1. `open`: case created and awaiting action.
2. `triaged`: owner and severity assigned.
3. `investigating`: evidence review in progress.
4. `resolved`: remediation complete.
5. `closed`: administratively closed with audit record.

## Severity / Risk Chips
1. `R:low`
2. `R:med`
3. `R:high`

## Trust Tier Chips
1. `T:T0` onboarding / constrained
2. `T:T1` limited production
3. `T:T2` standard production
4. `T:T3` high-trust / priority pools

## Invariants
1. `accepted`, `rejected`, and `closed` are terminal states.
2. Any `disputed` job must reference the originating `accepted` or `rejected` event.
3. State transitions must be append-only in the execution ledger.
