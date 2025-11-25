# Spec Kit (github/spec-kit)

## Overview
Spec Kit is GitHub's experimental toolkit for turning natural-language specs into enforceable contracts for LLM-powered features. You describe the desired behavior in Markdown (inputs, outputs, rules, evaluation criteria), then the CLI compiles that spec into machine-readable JSON Schema and guard policies that wrap a model call. At runtime Spec Kit can automatically re-prompt, block, or flag responses that fail validation, giving us deterministic surfaces over otherwise stochastic models.

## Why It Helps Constrain AI
- **Spec-first workflow** keeps human intent as the source of truth and keeps prompts in sync with tests.
- **Generated validators** (JSON Schema + custom checks) provide hard guarantees about structure, ranges, and enumerations.
- **Traceability**: every model response is checked against a spec version, producing auditable artifacts for compliance.
- **Tool-agnostic**: works with OpenAI, Anthropic, Azure, or any model reachable via an adapter.

## Integration Sketch
1. Install the CLI (`npm install -g @github/spec-kit` or use `npx`).
2. Create a spec (`specs/<feature>.md`) covering intents, inputs, outputs, and rubrics.
3. Run `speckit build specs/<feature>.md --out builds/<feature>.json` to compile guards & sample prompts.
4. Import the generated runner in our app server, wrap the target LLM call, and execute `validate()` on every response.
5. Feed failures back into prompt iteration until the validator passes consistently.

## Limitations & Risks
- TypeScript-first tooling; Python SDK is still immature.
- Specs beyond a few hundred lines become hard to maintain—split large workflows into composable specs.
- Runtime validation adds latency (~50-150 ms) and requires access to the compiled artifacts.

## Key Links
- Repo: https://github.com/github/spec-kit
- Docs: https://githubnext.com/projects/spec-kit
- Example walkthrough: `examples/help-bot/spec.md` inside the repo.
