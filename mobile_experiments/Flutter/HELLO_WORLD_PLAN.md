# Hello World Implementation Plan

## Goal
Deliver a minimal-but-polished Flutter app that prints a friendly message (“Hello from Valdi Labs”) and demonstrates both Material 3 styling and a simple interactive element (button or gesture) so we can benchmark Flutter’s DX vs. the existing Valdi sample.

## Milestones
1. **Bootstrap (0.5 day)**
   - Run `flutter create hello_flutter` inside `app/`.
   - Configure `analysis_options.yaml` with `lints` package.
   - Add `flutter_launcher_icons` only if we need branded assets (optional).
2. **UI Pass (0.5 day)**
   - Replace `main.dart` with a single-screen `Scaffold` containing:
     - AppBar titled “Valdi × Flutter”.
     - Center column showcasing the greeting text, a subtitle comparing frameworks, and a CTA button.
     - Optional `AnimatedOpacity` or `AnimatedSwitcher` to show hot-reload friendly state.
3. **Run & Verify (0.5 day)**
   - `flutter run -d <emulator>` (Android) and `-d <ios>` when available.
   - Capture screenshots + `flutter doctor -v` output to `.cursor/artifacts/`.
4. **Docs & Comparison (0.5 day)**
   - Update `DOCUMENTATION.md` with lessons learned.
   - Extend `UNDERSTANDING.md` with Valdi vs. Flutter observations (state model, tooling speed, build size).

## Work Breakdown Structure
- **Environment**: install SDK, accept licenses, create emulator.
- **Project Scaffolding**: configure `pubspec.yaml`, ensure `flutter analyze` passes.
- **Development**: implement `HelloScreen` widget, add simple `ElevatedButton` toggling a message.
- **Testing**: add one widget test verifying the greeting text renders.
- **Packaging (stretch)**: produce a debug APK/IPA to ensure builds succeed.

## Definition of Done
- `app/hello_flutter/lib/main.dart` matches the proposed UI and passes `flutter analyze`.
- `flutter test` succeeds.
- At least one platform run recorded with logs or screenshot in artifacts.
- Docs updated (`SETUP.md`, `DOCUMENTATION.md`, `NEXT_STEPS.md`).

## Risks & Mitigations
- **No macOS runner** → focus on Android first, document missing iOS coverage.
- **SDK download size** → cache the `flutter` directory outside repo or use `.gitignore` to keep history lean.
- **Stateful widget drift** → keep state minimal (e.g., toggle boolean) to avoid premature architecture decisions.

## Stretch Ideas
- Add a second route demonstrating navigation + transition.
- Integrate `flutter_bloc` or `Provider` to mirror Valdi’s state management once baseline is done.
