# Alert Layer

**Status:** Research / personal MVP candidate
**Working name:** Alert Layer (name is not validated)
**Last updated:** 2026-08-20

## Thesis

People do not need more app notifications. They need a small, trusted stream of alerts for things they explicitly care about.

Alert Layer is a cross-platform personal alert engine: a user describes an alert in natural language, the system turns it into a reviewable rule, evaluates the rule on a schedule or event, and delivers a concise push notification to iPhone or Android.

Examples:

- “Tell me when the S&P 500 falls 2% from yesterday’s close.”
- “Remind me the day before my mother’s birthday at 9:00 local time.”
- “Tell me when this product is back in stock, but only once.”
- “At market open and close in New York, send me a short briefing.”

## Recommendation

**Yes, the idea makes sense, but the wedge should be reliable personal rules—not arbitrary user-written cron jobs.** Start with structured adapters and a small set of high-value alert types. Let ChatGPT or Claude create and edit rules through MCP, but require a preview and explicit confirmation before activation.

The immediate personal solution is available now: use IFTTT’s notification actions and MCP integration, Pushover for cross-platform delivery, Pushcut/Apple Shortcuts for iOS-specific workflows, TradingView for market alerts, and Google/Apple Calendar for birthdays. The product becomes valuable when it unifies those fragmented systems and makes alert quality/reliability the primary experience.

## Related work

This supersedes neither [Birthday Bot](../birthday-bot/README.md) nor the existing market-alert tools. Birthday reminders become a first-class adapter/use case inside the broader engine.

## Pack

- [Product brief and MVP](PRD.md)
- [Research and competitors](RESEARCH.md)
- [Architecture](ARCHITECTURE.md)
- [Pricing and cost model](PRICING.md)
- [MVP execution plan](MVP_PLAN.md)
- [Original request](ORIGINAL_REQUEST.md)

## Open questions

1. Should the first product be a personal tool for one operator, or a multi-user SaaS from day one?
2. Which two source adapters create the strongest first-week habit: calendar/birthdays, market data, or web-change/restock alerts?
3. Is “AI-created rule” enough differentiation, or must the product also provide a noticeably better alert inbox, deduplication, and escalation policy?
