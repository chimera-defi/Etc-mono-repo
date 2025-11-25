# Handoff — Outlines Track

- **Setup:** `python -m venv .venv && source .venv/bin/activate && pip install outlines openai anthropic`.
- **Start here:** `README.md` for context, then `TASKS.md` (OL-01/02) for concrete milestones.
- **Goal:** Deliver a reference implementation that accepts a prompt + schema name, uses Outlines to constrain the model, and returns guaranteed-valid JSON.
- **Risks:** Provider integrations may lag behind API changes; pin versions. Large schemas can slow decoding—benchmark early.
- **Done when:** We have a repeatable script/service plus docs explaining how to adapt schemas and extend to new workflows.
