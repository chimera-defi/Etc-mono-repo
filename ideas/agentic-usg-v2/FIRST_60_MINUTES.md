# First 60 Minutes

1. Use the scaffold at `packages/agentic-usg-v2/`
2. Add contracts workspace and local test runner
3. Implement mock `IYieldSource` adapters
4. Scaffold minimal frontend with fake data first
5. Add a deterministic agent service that reads fixture APYs
6. Wire one happy-path flow: deposit -> mint -> rotate -> approve -> view audit log
7. Add World and Arc wrappers only after the core flow works

Validation checks:
- local tests run
- UI loads
- one agent action executes
- one tranche view renders
