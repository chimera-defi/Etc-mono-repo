# Guardrails AI (`guardrails-ai/guardrails`)

## Overview
Guardrails AI adds a programmable safety layer around LLM calls. You describe the allowed structure and safety policies in a `RAIL` file, then Guardrails parses generations, validates them (type checks, regex, JSON Schema, semantic filters), and automatically re-prompts or escalates when the model drifts. It supports OpenAI, Anthropic, Azure, Cohere, and local models via LangChain.

## Constraint Mechanisms
- **Structured outputs:** Schema and type enforcement with automatic coercion / repair when possible.
- **Validators:** Built-in and custom Python validators for PII redaction, URL allow-lists, profanity filters, etc.
- **Re-asking strategies:** Automatic retry loops with reasoned feedback to the model.
- **Streaming guardrails:** Observe partial tokens and stop harmful content mid-generation.

## Integration Sketch
1. `pip install guardrails-ai` in the backend service that brokers LLM calls.
2. Author a `.rail` spec containing instructions, schema, and validators; store it alongside the feature code.
3. Wrap existing LLM calls with `Guard()` and pass the `.rail` path; configure telemetry sink (stdout, OpenTelemetry, or custom logger).
4. Capture pass/fail metrics to inform prompt and validator tuning.

## Considerations
- Runtime is Python-first; Node support exists via REST bridging but is less ergonomic.
- Validator execution time can add noticeable latency; evaluate timeouts before shipping to mobile clients.
- Rails can call out to custom Python functions—treat them as part of the security boundary.

## Key Links
- Repo: https://github.com/guardrails-ai/guardrails
- Docs: https://www.guardrailsai.com/docs
- Example `.rail`: `examples/prompt_qa/prompt.rail`
