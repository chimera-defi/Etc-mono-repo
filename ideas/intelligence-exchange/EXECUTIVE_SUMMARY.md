## Intelligence Exchange Executive Summary

### One-Liner
A marketplace where users run a local or cloud worker using their own AI access and sell completed AI jobs through a central broker.

### Why It Matters
1. Buyers need reliable, low-cost completion of queued AI work.
2. Many users and teams have underutilized AI access and spare workflow capacity.
3. A brokered market can aggregate this long-tail supply into usable execution capacity.

### Wedge
- Worker-first supply model: contributors run a standardized worker app.
- Broker-managed routing, quality scoring, metering, and settlement.
- Agent-first compatibility: user-owned black-box agents with protocol adapters in v2.
- Start with constrained tasks where outputs are easy to score.

### MVP
1. Central job broker with queueing and matching.
2. Worker daemon (local app + optional hosted runner mode).
3. Prompt packaging, execution tracing, and quality scoring.
4. Usage ledger + payouts.

### GTM
- Start with founder/dev teams that already run agents and need overflow execution.
- Acquire supply via "earn from idle setup" onboarding and simple worker install.
- Acquire demand via API-first "submit jobs, get scored outputs" workflow.

### Biggest Risks
1. Output quality variance across heterogeneous workers.
2. Cold-start liquidity on both demand and supply.
3. Abuse/spam/Sybil behavior from low-trust contributors.
4. Margin compression if broker value-add is weak.

### Decision Rule
Proceed only if pilot demonstrates: enough retained worker supply, acceptable quality/rework rates, and positive unit economics after risk costs.
