# Outlines (`normal-computing/outlines`)

## Overview
Outlines is a Python library for grammar-based text generation. It compiles JSON Schema or EBNF grammars into finite-state machines, then drives compatible models (OpenAI, Anthropic, Cohere, vLLM, local GGUF) so every token adheres to the grammar. It is lightweight, dependency-light, and excels when we need 100% valid structured outputs such as JSON records, SQL, or code snippets.

## Constraint Mechanisms
- **Grammar compilation:** Turn JSON Schema, Pydantic models, or custom EBNF into automata that restrict the decoder.
- **Sampling control:** Supports greedy, top-k, nucleus, and contrastive decoding while staying inside the grammar.
- **Streaming-friendly:** Works with transformer backends that expose logits so we can enforce constraints token-by-token.
- **Composable functions:** Wraps common structured formats (JSON, regex) into helper functions for quick prototypes.

## Integration Sketch
1. `pip install outlines` (optionally alongside `transformers`, `vllm`, or provider SDKs).
2. Define the schema (via JSON Schema dict, Pydantic model, or `outlines.fsm.regex`).
3. Instantiate a model (e.g., `from outlines import models; model = models.openai("gpt-4o-mini")`).
4. Call `generator = outlines.generate.json(model, schema)` and execute `generator(prompt)` to get validated output.

## Considerations
- Requires model backends that expose token probabilities—pure API interfaces work only if the provider integration exists.
- Complex grammars can impact decoding speed; benchmark for mobile latency budgets.
- Tool primarily targets Python; Rust bindings exist but are experimental.

## Key Links
- Repo: https://github.com/normal-computing/outlines
- Docs: https://normalcomputing.github.io/outlines/
- Examples: `examples/json_generation.py`
