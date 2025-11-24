# Flutter Documentation Snapshot

Curated excerpts & links from the official Flutter documentation (https://docs.flutter.dev) and tooling references. Use these as a starting point; append new findings as you read deeper.

## Install & Tooling
- **Get started** – https://docs.flutter.dev/get-started/install
  - Download the platform-specific SDK archive or use `brew install --cask flutter` on macOS.
  - Run `flutter doctor -v` after extracting to ensure Dart, Android toolchain, Xcode, and connected devices are ready.
- **Editor setup** – https://docs.flutter.dev/tools
  - VS Code: install *Flutter* + *Dart* extensions, enable `Flutter: Hot Reload On Save`.
  - Android Studio / IntelliJ: install the Flutter plugin to get project templates, widgets inspector, and DevTools integration.
- **Device/Simulators** – https://docs.flutter.dev/get-started/install/macos#deploy-to-ios-devices
  - iOS requires Xcode + `sudo xcode-select --switch /Applications/Xcode.app` and `sudo xcodebuild -license`.
  - Android requires Android SDK + `sdkmanager --licenses` and an AVD (Pixel / API 34 recommended).

## Project Structure Basics
- **`flutter create my_app`** scaffolds:
  - `lib/main.dart` – entry point with `void main() => runApp(const MyApp());`
  - `pubspec.yaml` – dependencies, assets, fonts.
  - `android/`, `ios/`, `web/`, `linux/`, `macos/`, `windows/` – platform shells.
- **Hot reload vs. hot restart** – https://docs.flutter.dev/tools/hot-reload
  - Hot reload preserves state; use for UI tweaks.
  - Hot restart recompiles the app and resets state.

## Hello World Reference
- **"Write your first Flutter app" (part 1 & 2)** – https://docs.flutter.dev/get-started/codelab
  - Shows how to replace the counter example with custom widgets and navigate between screens.
- Minimal `main.dart` outline:
  ```dart
  import 'package:flutter/material.dart';

  void main() => runApp(const HelloApp());

  class HelloApp extends StatelessWidget {
    const HelloApp({super.key});

    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        title: 'Valdi vs Flutter Demo',
        theme: ThemeData(colorSchemeSeed: const Color(0xFF9146FF), useMaterial3: true),
        home: const HelloScreen(),
      );
    }
  }
  ```
  - For the full layout we intend to build, see `HELLO_WORLD_PLAN.md`.

## Debugging & Profiling
- **DevTools** – https://docs.flutter.dev/development/tools/devtools/overview
  - Widget inspector, performance overlays, memory, CPU profiling.
- **Logging** – `flutter run -d <device> -v` for verbose logs, or use `debugPrint()`.

## Testing & CI
- **Unit/widget tests** – https://docs.flutter.dev/cookbook/testing/unit/introduction
  - Run with `flutter test`.
- **Integration testing** – https://docs.flutter.dev/cookbook/testing/integration/introduction
  - Uses `flutter test integration_test`. Requires emulator/device.
- **Continuous delivery** – GitHub Actions template: https://github.com/flutter/flutter/tree/master/dev/integration_tests/flutter_gallery/gallery

## Packaging & Distribution
- **Android** – https://docs.flutter.dev/deployment/android
  - `flutter build apk --release` and sign with `keystore`.
- **iOS** – https://docs.flutter.dev/deployment/ios
  - Requires Apple Developer account, provisioning profiles, and `flutter build ipa`.

## Glossary / Concept Reminders
- **Widget**: immutable description of part of the UI tree.
- **StatefulWidget**: widget paired with a mutable `State` object.
- **Layout**: `Row`, `Column`, `Flex`, `Stack` compose UI; `MediaQuery` for responsive info.
- **Navigation**: `Navigator` + `MaterialPageRoute`; for Hello World we only need a single screen.

Keep this document updated with any API nuances, plugin research, or performance measurements as the experiment progresses.
