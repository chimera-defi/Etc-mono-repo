# Handoff — Guardrails AI Track

- **Bootstrap:** `python -m venv .venv && source .venv/bin/activate && pip install guardrails-ai fastapi uvicorn`.
- **Artifacts:** `.rail` specs live beside the service code; see `README.md` + `TASKS.md` for context and backlog.
- **Deliverable:** Demo endpoint `POST /guarded` that returns validated JSON and emits telemetry for each generation.
- **Watchouts:** Validators run arbitrary Python—treat them like untrusted code and add tests. Re-ask loops can explode latency if we allow >3 retries.
- **Exit Criteria:** Ability to enforce schema + safety rules on at least one real prompt set, with metrics proving improvement over baseline.
