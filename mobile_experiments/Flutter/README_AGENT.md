# Agent Playbook

## Mission
Spin up a Flutter "Hello World" experience that demonstrates our baseline expectations for a cross-platform experiment: fast iteration, platform parity notes, and parity docs vs. Valdi.

## Success Criteria
- Flutter SDK installed and validated with `flutter doctor`.
- Fresh project scaffolded under `app/` (use `flutter create hello_flutter`).
- `lib/main.dart` renders branded copy so we can distinguish this app from the stock template.
- Build & run instructions captured for both iOS simulator and Android emulator (or real devices).
- Any blockers, environment issues, or doc discoveries logged in `DOCUMENTATION.md` & `NEXT_STEPS.md`.

## Ways of Working
- Keep generated artifacts (build/, .dart_tool/, etc.) out of version control (see `.gitignore`).
- Prefer documenting assumptions before writing speculative code.
- If you discover better docs than the ones referenced here, append them to `DOCUMENTATION.md` with short summaries.
- Align all plans with `HELLO_WORLD_PLAN.md`; update it if scope changes.

## Quick Links
- Comparison Source: `../FRAMEWORK_COMPARISON.md`
- Primary doc summary: `DOCUMENTATION.md`
- Active backlog: `TASKS.md`
- Fast handoff steps: `HANDOFF.md`
