# Flutter Experiment

Cross-platform mobile framework by Google using Dart, compiled to native ARM code.

## Status: ✅ Complete

| Check | Status |
|-------|--------|
| Code | ✅ Complete |
| Tests | ✅ 3 passing |
| Linting | ✅ Clean |
| iOS/Android | ✅ Ready |

## Quick Start

```bash
cd app
flutter pub get
flutter analyze
flutter test
flutter run
```

## Features

- Material 3 design with `ColorScheme.fromSeed()`
- StatefulWidget with toggle functionality
- AnimatedSwitcher and scale transitions
- Dark/light mode detection
- Cross-platform (iOS, Android, Web)

## Project Structure

```
app/
├── lib/main.dart           # Main application
├── test/widget_test.dart   # Widget tests
├── pubspec.yaml            # Dependencies
├── android/                # Android platform
├── ios/                    # iOS platform
└── web/                    # Web platform
```

## Setup Requirements

- **Flutter SDK**: `flutter --version` to verify
- **iOS**: macOS with Xcode
- **Android**: Android Studio with SDK

### Install Flutter (macOS)
```bash
brew install --cask flutter
flutter doctor
```

## Building

```bash
# iOS Simulator
flutter build ios --simulator

# Android APK
flutter build apk

# Web
flutter build web
```

## Comparison Notes

| vs Valdi | Flutter |
|----------|---------|
| Language | Dart (vs TypeScript) |
| Hot Reload | Sub-second |
| Build | Single `flutter build` |

| vs React Native | Flutter |
|-----------------|---------|
| Performance | Native ARM, no bridge |
| UI | Built-in widgets |
| Testing | Built-in widget testing |

## Resources

- https://flutter.dev
- https://docs.flutter.dev/get-started/install
- https://pub.dev (packages)
