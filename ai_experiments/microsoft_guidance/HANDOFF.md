# Handoff — Microsoft Guidance Track

- **Setup:** `python -m venv .venv && source .venv/bin/activate && pip install guidance openai` (swap providers as needed).
- **Entry point:** Start with `README.md` for overview and `TASKS.md` (MG-01/02) for concrete experiments.
- **Deliverable:** A Guidance template that enforces JSON schema + multi-step reasoning for one target workflow.
- **Risks:** Template syntax can be brittle; add tests before refactoring. Guidance currently prioritizes Python—TypeScript/JS support is unofficial.
- **Finish line:** Template + harness committed, with docs that explain how to adapt it to future workflows.
