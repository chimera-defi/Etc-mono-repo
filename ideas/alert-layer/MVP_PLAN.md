# MVP Plan

## Phase 0 — personal utility

Build the smallest useful system for one operator:

1. Postgres tables for rules, devices, source snapshots, runs, and deliveries.
2. Webhook + calendar/ICS + RSS/JSON adapters.
3. Pushover delivery first; add APNs/FCM app delivery after rule behavior is proven.
4. CLI and MCP tools for preview/create/pause/test.
5. Three real rules: birthday tomorrow, market open/close, and one threshold alert.

## Phase 1 — private beta

- Native or cross-platform mobile app with device registration and notification preferences.
- Google Calendar OAuth, one licensed market-data adapter, and one web monitor adapter.
- Run history, mute/feedback, alert digests, source failure handling, and basic billing.
- MCP authentication, per-user authorization, confirmation gates, and audit logs.

## Phase 2 — product differentiation

- Natural-language relevance filters with deterministic previews.
- Cross-rule deduplication and “bundle these into one digest” behavior.
- User-defined webhook sources and safe templating.
- Reliability dashboard and delivery SLA by channel.

## Validation experiments

1. Give 10 people IFTTT/Pushover or a thin prototype and ask them to keep five alerts active for two weeks.
2. Measure which rules survive, not which rules users create.
3. Charge the first cohort $5/month before adding a large integration catalog.
4. Test whether users prefer a single “alert inbox” or direct native notifications.

## Kill criteria

- Users create alerts but mute them within two weeks.
- The most valuable use cases are already adequately served by TradingView, Calendar, and IFTTT with no willingness to consolidate.
- Market-data/API licensing makes the desired coverage uneconomic.
- Reliability cannot be explained or measured at the source and delivery layers.
