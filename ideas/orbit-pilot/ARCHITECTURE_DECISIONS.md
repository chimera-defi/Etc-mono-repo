## Orbit Pilot Architecture Decisions

### Decision 1: Keep the CLI Thin
`cli.py` should parse args and delegate to services. It should not own orchestration logic.

### Decision 2: Introduce a Campaign / Run Model
Every generated run belongs to a named campaign and writes a `run.json` manifest. This makes resume/report/publish workflows more stable than ad-hoc timestamp folders alone.

### Decision 3: Separate Per-Run and Cross-Run State
- per-run: payloads, assets, prompts, audit db
- cross-run: dedupe digests and publish cooldown state

### Decision 4: Treat Publishers as Adapters
Publisher code should accept a normalized payload and return a normalized result. Platform-specific HTTP details stay behind the publisher boundary.

### Decision 5: Manual Queue Is First-Class
The system is not allowed to treat manual mode as a failure state. Manual packs, ranked next actions, and best-practice guidance are part of the core product.
