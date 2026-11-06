# Pricing and Cost Model

## Pricing hypothesis

| Tier | Price | Intended boundary |
|---|---:|---|
| Free | $0 | 5 active rules, 1 device, daily polling, 100 evaluations/month |
| Personal | $5/month or $49/year | 50 rules, faster polling, multiple devices, quiet hours, history, calendar/market/webhook adapters |
| Power | $12/month or $120/year | 250 rules, higher frequency, digests/escalation, custom MCP/API quota, longer history |
| Team/API | From $29/month | Shared rules, service accounts, higher quotas, audit/export, webhook delivery |

The $5 anchor is supported by adjacent products: Pushover charges $4.99 once per platform, Pushcut lists $1.99/month, IFTTT lists $2.99/month annualized for Pro and $8.99/month annualized for Pro+, and TradingView lists $12.95/month annualized for Essential. Alert Layer should charge for saved time, reliability, and unification—not for raw push volume.

## Pilot cost

For a personal/private pilot:

- App/server: one small VM can be roughly $3–$15/month; [Fly.io’s published shared VM table](https://fly.io/docs/about/pricing/) lists low-end shared instances in that range.
- Database/auth: Supabase’s free tier is enough for experiments; its listed Pro plan is $10/month. See [Supabase pricing](https://supabase.com/pricing).
- Push delivery: APNs/FCM are platform transports; budget for provider infrastructure, not a per-message business model. Apple developer membership is $99/year for App Store distribution ([Apple](https://developer.apple.com/programs/whats-included/)).
- Market data: likely the first meaningful variable cost and licensing risk; use a licensed provider with explicit end-user terms.
- LLM: rule creation is intermittent, so treat it as a metered control-plane cost. Cache/normalize rules and do not invoke an LLM on every evaluation.
- Email/SMS: avoid SMS in v1; it introduces material per-message cost and compliance complexity.

Expected personal pilot infrastructure: **about $15–$75/month plus market-data and LLM usage**, depending on hosting and provider choices. At 1,000 users, the main cost risks become market-data licensing, high-frequency polling, LLM usage, support, and mobile-store fees—not Postgres rows or push payloads.

## Unit economics guardrails

- Never price by “cron job”; price by active rules/evaluations and delivery channels.
- Include generous push volume; charge or rate-limit expensive SMS, browser automation, high-frequency polling, and LLM runs.
- Require a source freshness/latency tier in the rule preview so users understand what they are buying.
- Keep gross margin target above 80% for Personal before support and app-store fees.
