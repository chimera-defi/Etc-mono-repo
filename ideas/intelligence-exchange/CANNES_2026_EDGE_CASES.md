## Cannes 2026 Edge Cases

### Identity

1. Poster not verified
   - expected: cannot fund or publish claimable milestone
2. Worker not verified
   - expected: cannot claim paid job
3. Same human attempts multiple worker identities
   - expected: trust tier reduced or duplicate claims blocked

### Escrow And Payments

4. Poster funds insufficient for all milestones
   - expected: unfunded milestones never enter queue
5. Payout release transaction fails
   - expected: job stays `accepted` but settlement remains pending with retry path
6. Worker submits output after lease expiry
   - expected: submission rejected or routed to manual review

### Execution

7. Worker claims but never starts
   - expected: lease expires and job requeues
8. Worker submits malformed artifact
   - expected: schema failure and `rework`
9. Worker overspends on paid dependencies
   - expected: spend recorded, not auto-reimbursed, flagged in review

### Scoring And Review

10. Score passes but human rejects
   - expected: move to `rework` or `disputed`, no payout
11. Score fails but human wants override
   - expected: explicit override path with audit log
12. Two workers submit for same milestone
   - expected: only valid lease holder can settle unless mode explicitly allows benchmark duplication

### Storage And Provenance

13. Dossier write fails
   - expected: payout pauses or degraded-mode warning blocks final completion
14. Artifact URI missing
   - expected: submission invalid

### Mainnet Demo

15. Arc RPC unavailable
   - expected: local fallback mode available and clearly labeled
16. World proof service unstable
   - expected: demo-safe stub path only if explicitly labeled, otherwise block action
17. 0G storage write delayed
   - expected: show pending dossier state and do not pretend write succeeded

### Abuse

18. Poster and worker collude to self-accept junk
   - expected: human-backed identity and acceptance audit trail make this visible; out of scope to solve fully in MVP
19. Worker farms low-effort submissions
   - expected: score gate and rework loop absorb this
20. Marketplace has only one worker
   - expected: acceptable for hackathon MVP if the product is pitched as controlled-supply pilot, not open liquidity
