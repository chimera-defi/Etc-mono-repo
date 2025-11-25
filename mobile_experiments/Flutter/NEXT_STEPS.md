# Next Steps (Prioritized)

1. **Provision Flutter toolchain** – Follow `SETUP.md`, ensure `flutter doctor` is happy, and note environment specifics (OS, versions, connected devices) in `DOCUMENTATION.md`.
2. **Scaffold Flutter project** – Run `flutter create hello_flutter` inside `app/` (or `flutter create .` to scaffold in place). This creates `pubspec.yaml` and platform folders (`android/`, `ios/`).
3. **Integrate existing code** – Copy `app/lib/main.dart` into the scaffolded project's `lib/main.dart`. The Hello World implementation is already complete and matches `HELLO_WORLD_PLAN.md`.
4. **Run on target platforms** – Validate on at least one Android emulator and (if available) an iOS simulator; capture screenshots or logs under `.cursor/artifacts/`.
5. **Compare to Valdi** – Document key differences in developer workflow, hot reload behavior, and UI composition in `UNDERSTANDING.md`.
6. **Extend plan** – Once Hello World is stable, define the next experiment milestone (e.g., navigation + API fetch) and append it to `TASKS.md`.

### Open Questions
- Do we want to integrate Flutter with existing CI, or spin up a separate workflow?
- Should we keep the generated project inside this repo or initialize a dedicated submodule?

Record answers in `UNDERSTANDING.md` as they become clear.
