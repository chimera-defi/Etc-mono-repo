# Microsoft Guidance (`microsoft/guidance`)

## Overview
Guidance is a templating and orchestration library that gives token-level control over LLM outputs. Instead of crafting static prompts, you write Guidance programs that interleave instructions, model invocations, structured placeholders, regex/JSON-schema constraints, and tool calls. The runtime streams tokens, enforces the rules you defined, and exposes programmatic hooks for retries or function execution.

## Constraint Features
- **Deterministic templating:** Compose prompts with loops, conditionals, and model calls to maintain state across steps.
- **Grammar enforcement:** Constrain model output via regular expressions, JSON schemas, or custom matchers.
- **Mixed execution:** Combine deterministic Python logic with LLM segments (e.g., `{{gen 'answer' stop='\n'}}`).
- **Streaming/tool use:** Inspect tokens as they stream and trigger functions mid-generation.

## Integration Sketch
1. `pip install guidance` (supports Python 3.9+ with optional CUDA backends for local models).
2. Write a `.py` or `.guidance` program describing the conversation flow and constraints.
3. Bind it to a provider (OpenAI, Azure, Anthropic, local transformers) via Guidance's provider API.
4. Execute the program inside your service, capturing structured outputs directly from the Guidance runtime.

## Considerations
- Guidance works best when you can keep the control code server-side; not suitable for on-device execution.
- Complex templates can become hard to read—modularize with helper functions and comments.
- Some providers (e.g., Anthropic) require streaming endpoints for best behavior; ensure SDK access.

## Key Links
- Repo: https://github.com/microsoft/guidance
- Docs: https://guidance.readthedocs.io/
- Examples: `examples/json2/json2.py` and `examples/evals/` in the repo.
