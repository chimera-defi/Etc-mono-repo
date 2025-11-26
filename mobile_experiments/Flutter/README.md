# Flutter Experiment

This folder tracks our cross-platform experiment using Flutter. Based on the comparison in `../FRAMEWORK_COMPARISON.md`, Flutter is a top candidate thanks to:

- Very high performance with a single Dart codebase compiled to native ARM code.
- Broad platform coverage (iOS, Android, web, desktop) backed by Google.
- Mature tooling (`flutter doctor`, DevTools, hot reload) and extensive learning material.

## Status ✅ COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| Project Structure | ✅ Complete | Scaffolded with `flutter create` |
| Hello World Code | ✅ Complete | Material 3, animations, state management |
| iOS Support | ✅ Ready | `ios/` folder with Xcode project |
| Android Support | ✅ Ready | `android/` folder with Gradle build |
| Web Support | ✅ Ready | `web/` folder included |
| Tests | ✅ Passing | 3 widget tests |
| Linting | ✅ Clean | `flutter analyze` passes |

## Quick Start

```bash
# Navigate to the app directory
cd app

# Get dependencies
flutter pub get

# Run analysis
flutter analyze

# Run tests
flutter test

# Run on connected device/emulator
flutter run
```

## Key Files

- `app/lib/main.dart` – Main application with Material 3 Hello World implementation
- `app/pubspec.yaml` – Package dependencies and project configuration
- `app/test/widget_test.dart` – Widget tests for the Hello World screen
- `HELLO_WORLD_PLAN.md` – Original step-by-step plan for building the sample app
- `SETUP.md` – Environment prerequisites and verification commands
- `DOCUMENTATION.md` – Curated notes from the official Flutter docs
- `TASKS.md` / `NEXT_STEPS.md` – Prioritized backlog for continuing the experiment
- `HANDOFF.md` / `README_AGENT.md` – Quickstart instructions for the next agent

## Features Demonstrated

The Hello World app showcases:
- **Material 3 Design** - Modern Material You theming with `ColorScheme.fromSeed()`
- **State Management** - StatefulWidget with toggle functionality
- **Animations** - AnimatedSwitcher, AnimatedContainer, scale transitions
- **Dark/Light Mode** - System theme detection and adaptation
- **Cross-Platform** - Runs on iOS, Android, and Web

## Project Structure

```
app/
├── lib/
│   └── main.dart          # Main application code
├── test/
│   └── widget_test.dart   # Widget tests
├── android/               # Android platform code
├── ios/                   # iOS platform code
├── web/                   # Web platform code
├── pubspec.yaml           # Package configuration
└── analysis_options.yaml  # Linter configuration
```

## Comparison Notes

### vs. Valdi
- **Setup Time**: ~5 minutes with `flutter create` vs. manual project structure
- **Hot Reload**: Sub-second in both frameworks
- **Type Safety**: Strong type system in Dart similar to TypeScript
- **Build System**: Single `flutter build` command vs. platform-specific tooling

### vs. React Native
- **Language**: Dart vs. JavaScript/TypeScript
- **Performance**: Compiles to native ARM code, no bridge overhead
- **UI**: Built-in widgets vs. native components
- **Testing**: Built-in widget testing vs. Jest + external libraries

## Next Steps

1. ⏭️ Run on physical devices for performance benchmarks
2. ⏭️ Implement feature parity tests (navigation, API calls, lists)
3. ⏭️ Measure against SUCCESS_FRAMEWORK.md metrics
4. ⏭️ Compare build sizes across platforms

Refer to `HANDOFF.md` for an actionable checklist when you pick this up next.
