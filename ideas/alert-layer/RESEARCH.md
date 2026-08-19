# Research and Competitive Landscape

**Checked:** 2026-08-20. Prices and capabilities change; verify before launch.

## What already exists

| Product/category | Strength | Gap relative to Alert Layer |
|---|---|---|
| [IFTTT](https://ifttt.com/plans) | Broad app/device integrations, notification actions, filters, and an MCP workflow that can create notification Applets from Claude/ChatGPT | Applet/integration model is broad and sometimes opaque; not a focused, low-noise personal alert inbox |
| [Pushover](https://pushover.net/pricing) | Extremely simple iOS/Android/Desktop push endpoint; $4.99 one-time per platform for individuals, 10,000 API messages/month included | Delivery pipe, not a rule engine, source layer, or conversational setup product |
| [Pushcut](https://www.pushcut.io/) | iOS smart notifications, webhooks, Shortcuts, actions, and automation server; $1.99/month, $17.99/year, or $39.99 lifetime for the listed plan | Primarily Apple-centric and automation-oriented; not a cross-platform personal signal model |
| [TradingView](https://www.tradingview.com/pricing/) | Deep market/technical alerts and mobile apps; Essential lists $12.95/month billed annually and 20 price + 20 technical alerts | Excellent for trading signals, weak for birthdays, general events, and cross-source alert orchestration |
| [Distill](https://distill.io/pricing/) | Web monitoring, conditions, push/email/SMS, cloud checks; free tier and paid plans starting at $15/month | Strong page monitoring, not a general personal rule layer; configuration is still monitor-centric |
| [changedetection.io](https://changedetection.io/) | Open-source/self-hostable website change and restock monitoring | Requires operating/configuring the system; not a polished mobile-first personal product |
| Calendar/reminder apps | Reliable for time-based reminders and birthdays | Each source has its own UI, notification preferences, and limited cross-source conditions |

## Important validation

The exact ChatGPT integration is feasible, but distribution constraints matter. OpenAI documents custom MCP apps with write/modify actions for Business and Enterprise/Edu workspaces; Pro supports Apps SDK development and read/fetch MCP use, while full MCP write support is currently more limited. See [OpenAI’s MCP app guidance](https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt) and [Apps SDK guidance](https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk). The product should therefore expose a normal web/API setup path as well as MCP.

## Mobile delivery reality

- iOS remote notifications require the app to register a device token and the provider server to send a request to [APNs](https://developer.apple.com/documentation/usernotifications/setting-up-a-remote-notification-server). APNs is best-effort: it may reorder, throttle, store, or drop notifications.
- Android can use [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging), with a trusted app server sending to device tokens. Android 13+ requires runtime notification permission; high-priority messages can be deprioritized when they do not result in user-visible notifications.
- Therefore “reliable” must mean observable, retried, deduplicated, and honest about delivery state—not guaranteed arrival at an exact second.

## Market gap

The gap is a product layer between “specialized alert app” and “developer automation platform”:

1. One rule vocabulary across time, APIs, feeds, calendars, and market data.
2. Natural-language authoring with a deterministic, reviewable rule preview.
3. Alert quality controls: relevance filters, digesting, cooldowns, quiet hours, escalation, and feedback.
4. A provider-neutral delivery inbox that can route to iOS, Android, email, webhook, or Pushover.
5. An audit trail that answers “why did I get this?” and “why did I not get this?”

## Use it today

1. For a no-code trial, create IFTTT notification Applets; its plans list free, Pro ($2.99/month annualized), and Pro+ ($8.99/month annualized) tiers.
2. For a single personal push endpoint, buy Pushover and call its API from a script, webhook, or automation.
3. On iPhone, combine Pushcut with Shortcuts for local actions and rich notification controls.
4. Use TradingView for market-specific alerts rather than rebuilding price feeds immediately.
5. Put birthdays and fixed events in Apple/Google Calendar, then route selected calendar events through IFTTT or a small scheduled worker.

These tools validate the need and can serve as a personal stopgap, but they leave the user managing several rule systems.
