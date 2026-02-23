# Source

This folder contains the safety-first execution scaffolding for the Automated Trading System.

Key modules:
- `ats/trading/oms.py`: OMS with flip-flop safeguards (dirty flags, reconciliation fail-fast, rate limits, WS health gating)
- `ats/trading/audit.py`: append-only JSONL audit logger
- `ats/trading/venue.py`: venue adapter interface
- `ats/trading/ccxt_pro_adapter.py`: minimal ccxt.pro adapter skeleton (verify venue-specific position semantics)

Example integration:
- `examples/asyncio_market_maker.py`

Tests:
- `../tests/test_oms_safeguards.py`
