# Handoff — Spec Kit Track

- **Where to start:** Install Node 18+, run `npm install -g @github/spec-kit`, then `speckit init` to scaffold a sample spec.
- **Key artifacts:** See `README.md` for overview and `TASKS.md` for concrete work items SK-01 → SK-05.
- **What we need:** A working proof-of-concept validator wrapped around a single LLM call plus latency metrics.
- **Risks to watch:** Rapid API changes, TypeScript-only custom validators, speculative status of Python support.
- **Definition of done:** Spec + compiled validator checked into repo, automated tests failing fast when the model drifts.
