# Automated Trading System Docs

Primary references:
- `SPEC.md`
- `IMPLEMENTATION-PLAN.md`

Additional primers:
- `OMS_PRIMER.md` (what an OMS is, typical components, why it matters for flip-flop safety)
- `../2026-05-31_212551-polymarket-write-trading-side.md` (Polymarket authenticated write-side implementation plan)
- `../2026-06-06_093824-polymarket-spec-iteration-v2.md` (Polymarket spec iteration addendum and PR slicing proposal)

## Architecture Notes (Current)

This repo now includes a minimal OMS safety scaffold implementing flip-flop safeguards:
- internal running sum of fills + optional sequence-gap detection
- dirty-position gating (block new orders until position confirmed)
- periodic REST reconciliation (fail-fast SAFE mode on drift)
- WS staleness gating (block new orders if feed unhealthy)
- per-asset order rate limiting + flip-flop place/cancel detector
- append-only audit logging (JSONL)

See:
- `src/ats/trading/oms.py`
- `src/examples/asyncio_market_maker.py`
- `tests/test_oms_safeguards.py`

