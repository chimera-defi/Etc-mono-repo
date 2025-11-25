# Understanding: Outlines Track

## Context
- Outlines focuses on *hard* constraints (grammar-constrained decoding) instead of post-hoc validation.
- Ideal for features where malformed JSON or code would crash clients; pair with other safety layers for semantic checks.
- Works with both hosted APIs (OpenAI, Anthropic) and self-hosted models via HuggingFace Transformers or vLLM.

## Assumptions
- We can run this logic on the server; client-side (mobile) execution is unrealistic for now.
- Target providers expose integrations maintained by Outlines (OpenAI + Anthropic are covered today).
- Developers are comfortable defining JSON Schema or Pydantic models for each structured output.

## Unknowns
1. How does Outlines behave with streaming responses over HTTP (chunked) vs. local inference?
2. Can we combine Outlines grammars with semantic validators (e.g., Guardrails) without excessive latency?
3. How difficult is it to update grammars when the schema evolves frequently?

## Notes
- Because constraints apply during decoding, token counts may increase slightly vs. unconstrained sampling.
- Outlines recently added `structured regex` helpers—worth evaluating for quick prototypes.
