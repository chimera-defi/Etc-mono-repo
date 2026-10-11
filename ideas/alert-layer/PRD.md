# Alert Layer — Product Brief

## Problem

Important signals are fragmented across calendars, finance apps, websites, feeds, and personal notes. Existing apps optimize for engagement and generate noise. Users either disable notifications or maintain several specialized tools.

## Product promise

“Tell me what matters, when it matters, in one trusted stream.”

The system must make every alert understandable, editable, testable, and suppressible. Reliability and low noise matter more than the number of integrations.

## Primary user

Technically comfortable individuals who track a few markets, relationships, events, and web signals but do not want to build or maintain automation infrastructure.

## Golden path

1. User says: “Remind me one day before birthdays in my Family group, at 9am local time.”
2. MCP returns a structured preview: source, timezone, schedule, condition, delivery, dedupe, and example next firing.
3. User confirms.
4. The rule is stored, tested against fixtures/live data, and activated.
5. The evaluator records its run and sends one push with a deep link back to the rule.

## MVP scope

- iOS and Android push delivery through one native app or a delivery provider.
- Web dashboard with rule list, recent runs, delivery status, pause/edit/delete, and test notification.
- Natural-language rule creation through a remote MCP server.
- Structured rule types: schedule, calendar/birthday, market threshold, RSS/JSON, and webhook.
- Quiet hours, timezone, cooldown, deduplication, expiry, and “notify once.”
- Audit log: evaluated, matched, delivered, failed, retried, acknowledged.
- At-least-once execution with idempotent delivery keys; never claim guaranteed real-time delivery.

## Explicit non-goals for v1

- Arbitrary user code or unrestricted shell execution.
- Trading execution or financial advice.
- Scraping authenticated sites without a supported connector.
- SMS/voice as a core channel.
- Social-graph birthday imports that depend on private or prohibited APIs.

## Success criteria

- A first alert can be created, tested, and received in under 5 minutes.
- 95%+ of scheduled evaluations complete within the target window in pilot usage.
- Fewer than 1 unwanted notification per active user per week, measured by dismiss/mute feedback.
- At least 50% of pilot users keep 3+ active rules after 14 days.
- Every delivered alert has a visible run record and a reproducible reason.

## Primary failure path

If the source is unavailable, stale, rate-limited, ambiguous, or unauthorized, do not silently fire. Mark the run degraded, explain the cause, retry according to policy, and optionally send a single “source unavailable” alert with suppression to prevent a second noise stream.
