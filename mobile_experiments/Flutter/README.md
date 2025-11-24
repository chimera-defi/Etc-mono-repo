# Flutter Experiment

This folder tracks our next cross-platform experiment after Valdi. Based on the comparison in `../FRAMEWORK_COMPARISON.md`, Flutter is the next best candidate thanks to:

- Very high performance with a single Dart codebase compiled to native ARM code.
- Broad platform coverage (iOS, Android, web, desktop) backed by Google.
- Mature tooling (`flutter doctor`, DevTools, hot reload) and extensive learning material.

## Experiment Scope

1. Validate the local Flutter toolchain on macOS/Linux hosts.
2. Stand up a minimal "Hello Flutter" app that renders a platform-aware `Scaffold` with text and a button.
3. Document deviations vs. Valdi (tooling, build, debugging) for future comparison work.

## Key Files

- `HELLO_WORLD_PLAN.md` – step-by-step plan for building the sample app.
- `SETUP.md` – environment prerequisites and verification commands.
- `DOCUMENTATION.md` – curated notes from the official Flutter docs that the next agent will need.
- `TASKS.md` / `NEXT_STEPS.md` – prioritized backlog for continuing the experiment.
- `HANDOFF.md` / `README_AGENT.md` – quickstart instructions for the next agent.
- `app/lib/main.dart` – placeholder for the future Flutter entry point.

## Status

- ✅ Framework chosen (Flutter) and documentation scaffolded.
- ⏳ Awaiting environment provisioning and actual project creation via `flutter create`.

Refer to `HANDOFF.md` for an actionable checklist when you pick this up next.
