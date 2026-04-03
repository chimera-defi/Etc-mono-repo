## Cannes 2026 Adversarial Review

### Main Question

Is this actually a coherent hackathon product, or just:
- marketplace buzzwords
- agent buzzwords
- prize wrappers

### Verdict

It can work, but only as a controlled pilot demo.

If pitched as:
- an open marketplace
- with real supply liquidity
- and autonomous agent payments at scale

it is overstated.

If pitched as:
- a trusted idea-to-build pilot
- with one controlled poster
- one controlled worker
- and visible escrow, identity, and dossier rails

it is credible.

## Main Attacks

### 1. "Marketplace" is the weakest claim

The system does not prove marketplace liquidity with one seeded worker.
It proves:
- job intake
- claim flow
- acceptance
- payment release

That is enough for a hackathon MVP, but it is not enough to claim a functioning marketplace.

### 2. World does not solve collusion

World helps with:
- uniqueness
- human backing
- anti-sybil friction

It does not solve:
- poster and worker colluding
- low-effort self-approved work
- low-quality but formally valid submissions

So World is useful, but not sufficient as a trust layer.

### 3. The scoring story is only strong for constrained task types

`brief`, `tasks`, `scaffold`, and `review` are not equally machine-scorable.

Strongest:
- `tasks`
- `scaffold`
- `review`

Weakest:
- `brief`

If the product claims objective scoring across all milestone types, judges can challenge it easily.

### 4. Arc nanopayments can become fake

If the "agent economy" is just one decorative payment event, that is weak.
The demo should show:
- why the spend happened
- who paid
- whether it affected the result

Otherwise the prize integration is cosmetic.

### 5. 0G can still drift toward logo theater

The dossier is useful only if it materially helps:
- review
- replay
- dispute

If it is just a link to stored JSON, the integration is thin.

### 6. Planning can become a spam sink

If any poster can submit raw ideas and force the planner to generate structured briefs before meaningful commitment, the system invites spam and free extraction.

The plan needs:
- either a deposit before full planning
- or a shallow preflight before funding

### 7. Paid dependency economics are unclear

If the agent spends money during execution:
- who authorizes it
- who bears failed-spend cost
- is it reimbursed

Without that, the "agent economy" is underspecified.

## Recommended Corrections

1. Pitch it as a controlled-supply pilot, not an open marketplace.
2. Make the first funded step explicit:
   - poster funds before full planning
   - or poster gets only a shallow preview before funding
3. Restrict objective scoring claims to milestone types that are actually checkable.
4. Make the nanopayment purposeful and bounded.
5. Make dossier storage part of acceptance and review, not decorative post-processing.

## Go / No-Go

### Go if:

- marketplace claims stay narrow
- scoring claims stay honest
- one real payout happens
- one real identity gate matters
- one real dossier is used in review

### No-Go if:

- it tries to prove open market liquidity
- sponsor integrations are only ornamental
- payment and scoring semantics remain fuzzy
