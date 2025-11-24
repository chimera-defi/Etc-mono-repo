# Flutter Environment Setup

These steps summarize the official installation flow (see `DOCUMENTATION.md` for reference links). Adjust paths for macOS vs. Linux.

## 1. Prerequisites
- Git 2.40+
- Xcode 15+ (macOS) or Android Studio (Linux/macOS) with the latest SDK + platform tools.
- Java 17 (bundled with Android Studio) if targeting Android.
- Device/simulator access (iOS Simulator, Android Emulator, or physical devices with developer mode enabled).

## 2. Install Flutter SDK
```bash
# macOS (bash/zsh)
brew install --cask flutter
# Linux manual install
cd ~/development
curl -LO https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz
tar xf flutter_linux_3.24.0-stable.tar.xz
export PATH="$PATH:$HOME/development/flutter/bin"
```
Add the exported PATH to your shell rc file.

## 3. Run Doctor & Accept Licenses
```bash
flutter doctor
after doctor reports Android issues:
flutter doctor --android-licenses
```
Resolve all ✗ items before continuing.

## 4. Editor Tooling
- Install the Flutter + Dart extensions in VS Code or enable Flutter plugin inside Android Studio.
- Confirm `dart --version` works (bundled with Flutter).

## 5. Simulators / Emulators
- **iOS**: open Xcode > Settings > Platforms to ensure the simulator runtime is installed; launch `Simulator.app` once.
- **Android**: create a Pixel device via Android Studio > Device Manager; enable hardware acceleration (HAXM/Hypervisor.framework on macOS, KVM on Linux).

## 6. Seed Project
Inside `mobile_experiments/Flutter/app/`:
```bash
flutter create hello_flutter
cd hello_flutter
flutter run
```
Use `HELLO_WORLD_PLAN.md` to customize the generated app.

## 7. Helpful Commands
- `flutter pub get` – fetch dependencies.
- `flutter analyze` – static analysis.
- `flutter test` – unit tests.
- `flutter build ios --simulator` / `flutter build apk` – platform builds.

Document any deviations or platform-specific notes in `DOCUMENTATION.md`.
