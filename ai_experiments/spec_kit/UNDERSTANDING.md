# Understanding: Spec Kit Track

## Context
- Goal is to explore how Spec Kit can enforce policy-compliant generations inside future mobile or web experiments.
- Treat Spec Kit as the enforcement layer while prompts/tools live elsewhere; we only need to validate outputs, not host the model.
- GitHub/spec-kit currently targets Node 18+; adapters for Python exist but lag behind.

## Assumptions
- We can store compiled spec artifacts in the repo (non-secret) while keeping provider keys in env vars.
- LLM outputs can be coerced into JSON; if not, Spec Kit's auto-retry loop can reflow responses.
- CLI remains open-source and actively maintained by GitHub Next (last commit mid-2024); expect breaking changes.

## Open Questions
1. How do we plug Spec Kit validators into React Native / Valdi flows where network latency matters?
2. What is the recommended workflow for versioning specs across environments (dev / staging / prod)?
3. Can we author shared custom validators (TypeScript) and reuse across specs without copying boilerplate?

## Research Notes
- Public demos show success building “spec tests” for support bots and policy QA.
- No first-party iOS bindings today; server-side validation remains the best approach.
- Consider pairing Spec Kit with GitHub Copilot Eval if we need automated regression suites.
