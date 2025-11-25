# Understanding: Guardrails AI Track

## Context
- Guardrails is mature and production-proven; it is heavier-weight than Spec Kit but offers deep validation controls.
- Works best when an always-on Python service brokers requests for otherwise distributed clients (mobile, web).
- We can mix Guardrails with LangChain or LlamaIndex but it also works standalone.

## Assumptions
- Python 3.9+ environment is available for hosting the guard service.
- We are comfortable writing custom validators (Python) to encode domain-specific constraints.
- Latency targets allow for up to ~300ms overhead during worst-case multi-ask scenarios.

## Unknowns
1. How well does Guardrails integrate with streaming tool calls (function calling) versus pure text outputs?
2. Can we re-use existing JSON Schemas by converting them into `.rail` definitions without manual duplication?
3. What telemetry hooks are available for compliance logging (e.g., to DataDog or custom dashboards)?

## Notes
- Guardrails recently added "Shield" patterns for app-layer security; evaluate if that overlaps with our needs.
- Built-in validators cover profanity, PII, bias; additional domain rules will still require coding.
