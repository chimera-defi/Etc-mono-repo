# Understanding & Research Notes

## Why Flutter Next?
- Highest performance and maturity among the shortlisted cross-platform frameworks (see `../FRAMEWORK_COMPARISON.md`).
- Strong community, tooling, and documentation that complement the experimental Valdi stack.
- Provides a useful baseline for comparing declarative UI patterns (Widget tree vs. Valdi's class-based TSX).

## Key Concepts to Track
- **Flutter engine & Skia**: Flutter renders everything via Skia, which explains its consistent look across platforms.
- **Widget hierarchy**: Everything is a widget; state is handled via `StatefulWidget` / `State` or modern patterns like Riverpod/BLoC (out of scope for Hello World).
- **Hot reload vs. hot restart**: Document the developer ergonomics compared to Valdi's instant reload.
- **Project structure**: `lib/` for Dart source, `pubspec.yaml` for deps/assets, platform folders (`ios/`, `android/`) for native integration.

## Assumptions
- We will target Flutter 3.22+ with Dart 3 (verify actual version after installation with `flutter --version`).
- Linux host is available for CLI work; iOS builds may require macOS CI or a teammate’s Mac.
- Minimal plugin usage for the first milestone (keep dependencies to `flutter` + `cupertino_icons`).
- **Note**: Update this document with the actual Flutter/Dart versions after installation for future reference.

## Research Plan
1. Read the official "Get started" and "Write your first Flutter app" docs (links captured in `DOCUMENTATION.md`).
2. Map Valdi concepts (e.g., `ListView`, `Stack`) to their Flutter equivalents to ease cross-training.
3. Identify any licensing or policy considerations before distributing Flutter-built binaries.
4. Track performance metrics (build time, hot reload latency) once the app runs; compare with Valdi results.

## Open Risks
- Flutter repo adds ~200 MB; ensure the main repo can handle the size or consider using Git LFS for artifacts.
- Android emulator performance on CI might be limited; consider Flutter desktop as a fallback for demos.
- Future Valdi updates may change the comparison baseline, so keep docs modular.
