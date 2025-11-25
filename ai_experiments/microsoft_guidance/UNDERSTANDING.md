# Understanding: Microsoft Guidance Track

## Context
- Guidance originated inside Microsoft to power Copilot-style workflows where deterministic scaffolding is required.
- Works as a lightweight runtime we can embed in existing Python services; also integrates with Semantic Kernel if needed.
- Particularly strong for multi-step workflows (e.g., gather facts, critique, synthesize) where we need to keep state.

## Assumptions
- We can afford to run the orchestration server-side (most logic is Python + API calls).
- Developers are comfortable editing Guidance templates (mix of Python, Jinja-like syntax, and guidance primitives).
- Telemetry/observability will come from our host service; Guidance itself only exposes hooks we must instrument.

## Unknowns
1. Does Guidance interoperate cleanly with our planned tool-calling APIs (OpenAI functions, Anthropic tool use)?
2. How costly is it to author hand-written grammars vs. relying on JSON schema constraints?
3. Is there a Typescript port we could use in edge runtimes, or do we need to proxy through Python only?

## Notes
- Templates can be version-controlled and code-reviewed like regular source.
- Official examples show grammar-constrained JSON generation with near-perfect accuracy.
