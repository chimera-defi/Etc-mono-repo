# Agent Playbook – React Native

## Mission
Stand up a React Native Hello World experience comparable to our Valdi and Flutter samples, documenting tooling steps and DX observations without deviating from established repo conventions.

## Definition of Success
- Tooling validated with `npx react-native doctor` on the target OS (macOS preferred for dual-platform).
- New project scaffolded under `app/ValdiParity` using the TypeScript template.
- Metro bundler runs successfully and serves the app to at least one simulator/emulator.
- State of the world logged in `DOCUMENTATION.md` and open actions recorded in `NEXT_STEPS.md` / `TASKS.md`.

## Operating Notes
- Keep generated artifacts ignored per `.gitignore` (no `node_modules/` or platform folders checked in).
- Prefer Yarn or npm consistently; document whichever you choose in `SETUP.md`.
- Capture commands or logs in `.cursor/artifacts/` when they provide useful evidence (`doctor` output, emulator screenshots).
- Before writing code, review `HELLO_WORLD_PLAN.md` to align on layout, copy, and comparison goals.

## Quick References
- Framework comparison anchor: `../FRAMEWORK_COMPARISON.md`
- Setup: `SETUP.md`
- Plan: `HELLO_WORLD_PLAN.md`
- Doc digest: `DOCUMENTATION.md`
- Handoff snapshot: `HANDOFF.md`
