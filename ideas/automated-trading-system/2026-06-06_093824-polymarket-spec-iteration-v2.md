# Polymarket Bot / Write-Side Spec Iteration v2

> Companion addendum to `2026-05-31_212551-polymarket-write-trading-side.md`.
>
> Purpose: turn the May 31 implementation plan into a more build-ready product/spec slice without pretending the system is already a profitable autonomous bot.

## Verified Repo / PR Context

- Existing automated-trading-system PRs already merged:
  - #176: `Expand trading system spec and plan`
  - #177: `Add automated trading system spec and plan`
  - #202: `Flip-flop bug safeguards`
- The May 31 Polymarket write-side file is currently a local untracked artifact in `ideas/automated-trading-system/`.
- This addendum is also local until committed and pushed.

## Product Reframe

### v1 artifact

Build a safety-first Polymarket venue adapter and operator-run trading harness for the existing automated trading system research scaffold.

The v1 artifact is **not** a fully autonomous alpha-generating bot. It is a verified write-side integration that can:

1. map Polymarket outcome-token markets into the existing OMS asset model;
2. place and cancel authenticated orders through an adapter boundary;
3. ingest authenticated user fills;
4. reconcile token balances against internal fill-sum state;
5. fail closed in DRY_RUN/REPLAY/LIVE safety modes;
6. produce replayable audit logs.

### v1 users

- Strategy developer testing Polymarket execution against fake clients and recorded fixtures.
- Operator who can manually arm LIVE mode after reviewing risk, market, and wallet state.
- Future agent/strategy layer that emits intents, but does not bypass OMS/risk gates.

### Explicit non-goals for this slice

- No promise of profitable autonomous trading.
- No geofence or compliance bypass.
- No unattended LIVE order placement.
- No automatic unlimited allowance approval.
- No settlement/redeem automation unless split into a separate, explicitly armed admin workflow.

## Decisions To Lock Before Implementation

### D1 — Asset identity

Keep the OMS `asset` as the raw Polymarket `token_id` for v1 adapter simplicity.

Add a separate metadata cache so humans and logs can resolve:

- `event_slug`
- `market_slug` / `market_id`
- `condition_id`
- `token_id`
- `outcome` (`YES`, `NO`, or exact outcome label)
- `question`
- `end_date`
- `active` / `closed` / `archived` state

Do **not** encode `NO` as negative `YES`. Treat every outcome token as its own spot asset.

### D2 — Order quantity semantics

Keep the invariant:

- `qty` = outcome-token shares.
- `quote_amount` = USDC spend, only for quote-denominated market BUY orders.

Implementation rule:

- Limit BUY/SELL: require `qty` and `limit_price`.
- Market SELL: require `qty`.
- Market BUY: require `quote_amount`; either require conservative `qty` as a risk-bound estimate or block market BUY in v1 until a pre-trade depth estimator exists.

Preferred v1 stance: **support limit orders first, block market BUY by default** unless a dedicated test proves the risk model handles max spend and max acquired shares.

### D3 — Order state machine

Add a Polymarket-specific adapter state mapping, but keep canonical OMS states venue-neutral.

Minimum normalized flow:

```text
INTENT_VALIDATED
  -> SDK_POST_ATTEMPTED
  -> ACCEPTED_WORKING | ACCEPTED_DELAYED | ACCEPTED_MATCHED_PENDING_FILL | REJECTED
  -> PARTIALLY_FILLED | FILLED | CANCEL_REQUESTED | CANCELED | CANCEL_REJECTED
  -> RECONCILED | RECONCILE_MISMATCH_SAFE
```

Important rule: SDK status `matched` is **not** canonical `FILLED` until a user trade/fill event or reconciliation confirms quantity.

### D4 — Fill source of truth

Canonical fill source order:

1. authenticated user trade/fill stream;
2. REST account trades if stream gap or reconnect occurs;
3. REST token balance reconciliation as final drift detector.

Never create synthetic fills from order acks alone.

### D5 — Reconciliation threshold

For each `token_id`, compute:

```text
expected_balance = starting_balance + sum(deduped BUY fills) - sum(deduped SELL fills)
actual_balance = normalized get_balance_allowance(CONDITIONAL, token_id).balance
```

Rules:

- `abs(expected_balance - actual_balance) <= share_epsilon` clears dirty state.
- mismatch beyond threshold enters SAFE mode for that token and blocks new orders.
- unknown decimals or missing balance response fails closed.
- reconciliation events are appended to audit JSONL.

### D6 — LIVE arming

LIVE requires all gates:

1. `ATS_MODE=LIVE`
2. `ATS_ALLOW_LIVE_TRADING=I_UNDERSTAND`
3. matching one-shot `ATS_ARM_TOKEN` and `ATS_CONFIRM_ARM_TOKEN`
4. non-empty allowlisted token/market list
5. wallet/collateral/allowance readiness check succeeds
6. stream health is fresh before first order
7. operator-facing risk summary printed before arming

The runner must fail closed if any gate is absent.

## New Spec Sections To Add To Canonical `SPEC.md`

### Polymarket venue model

Add a subsection under venue adapters:

- Polymarket is spot trading of conditional outcome tokens against USDC.
- Outcome token balances are assets; YES/NO are independent token positions.
- Gamma API is discovery/metadata, CLOB is price/book/order venue, Data API is historical/account data where applicable.
- Public market data is read-only; authenticated trading uses the official beta `polymarket-client` SDK behind an adapter protocol.

### Polymarket risk guardrails

Minimum guardrails:

- max USDC notional per order;
- max USDC notional per market;
- max shares per outcome token;
- max open orders per market;
- max cancels/orders per rolling window;
- limit price bounds, e.g. no price <= 0 or >= 1, plus configurable min/max price bands;
- post-only crossing protection;
- stale book/stream gating;
- closed/expired/resolved market gating;
- per-market YES+NO exposure reporting;
- daily loss/halt threshold;
- manual kill switch.

### Allowance and wallet readiness

Readiness check should report, without logging secrets:

- wallet address present;
- USDC balance available;
- conditional token allowance status;
- CTF/exchange approvals status if SDK exposes it;
- whether approval setup is needed.

Approval setup should be a separate command/path with explicit human confirmation.

### Replay fixtures

Add required fixtures before claiming build-ready:

- fake accepted limit order response;
- fake rejected order response (`not_enough_balance`, `post_only_would_cross`, FAK/FOK not filled);
- fake user trade event;
- fake duplicate trade event;
- fake balance snapshot matching fills;
- fake balance snapshot mismatching fills;
- fake stale market stream.

## Proposed PR Slices

### PR A — Spec/docs only

- Promote the May 31 Polymarket plan into a canonical tracked doc, e.g. `docs/POLYMARKET_ADAPTER.md` or `POLYMARKET_WRITE_SIDE_PLAN.md`.
- Patch `SPEC.md` with venue model, risk guardrails, LIVE arming, and test matrix.
- No runtime code beyond docs.

### PR B — Package/test harness and shared types

- Add local `pyproject.toml`.
- Add `quote_amount` to `OrderRequest`.
- Add Polymarket config dataclass with secret redaction.
- Unit tests only, no SDK import required.

### PR C — Adapter with fake SDK

- Add `polymarket_adapter.py`.
- Add response/status/error mapping.
- Add fake SDK tests for limit order, cancel, balance normalization, and rejected order mapping.
- Keep LIVE runner absent.

### PR D — Streams and reconciliation

- Add user trade event normalization.
- Add market stream health updates.
- Add Polymarket OMS integration tests.
- Add replay fixtures.

### PR E — LIVE runner, disabled by default

- Add `src/examples/polymarket_trader.py`.
- Hard fail closed without all LIVE gates.
- Add readiness checks and docs.
- Optional metered tests remain skipped unless explicitly enabled.

## Acceptance Criteria v2

A build-ready Polymarket write-side slice is accepted only when:

- existing OMS safeguard tests pass;
- all Polymarket unit tests pass with fake clients and no network;
- docs explain that the artifact is an adapter/harness, not an autonomous profit bot;
- every order path goes through OMS/risk checks;
- LIVE runner cannot place an order unless all arming gates pass;
- market BUY cannot use ambiguous `qty` spend semantics;
- fills are deduped and never synthesized from order acks;
- reconciliation mismatch enters SAFE mode;
- no secrets appear in logs, exceptions, tests, docs, or audit output;
- PR description includes the actual agent/model used and `Co-authored-by: Chimera` per ideas repo guidance.

## Open Questions For Next Iteration

1. Should v1 block all market orders and support only limit orders until depth/slippage estimation is implemented?
2. Should Polymarket `asset` remain raw `token_id`, or should logs use a namespaced display ID while code keeps raw token IDs?
3. What is the smallest acceptable operator UI: CLI summary only, Telegram confirmation, or a local web dashboard?
4. Should approval setup be a one-off script, a CLI subcommand, or out of scope entirely?
5. Which strategy comes first after adapter readiness: manual intents, simple market making, news/event reaction, or cross-market arbitrage?
6. What is the desired first PR: docs-only spec hardening or implementation of the fake-client adapter slice?

## Recommended Next Move

Create PR A first. It is low-risk, preserves the May 31 plan, and turns the Polymarket idea into a tracked canonical spec before code changes interact with the repo's existing dirty working tree.
