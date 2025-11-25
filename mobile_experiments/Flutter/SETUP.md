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
# Check latest stable version at https://docs.flutter.dev/get-started/install/linux
# Example (update version as needed):
curl -LO https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.0-stable.tar.xz
tar xf flutter_linux_3.24.0-stable.tar.xz
export PATH="$PATH:$HOME/development/flutter/bin"
```
Add the exported PATH to your shell rc file.

**Note**: After installation, verify version with `flutter --version` and update `UNDERSTANDING.md` with the actual version used.

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
# Option A: Create subdirectory (recommended)
flutter create hello_flutter
# Copy existing code into the new project
cp lib/main.dart hello_flutter/lib/main.dart
cd hello_flutter

# Option B: Scaffold in place
# flutter create .
# (may require moving existing lib/ folder)

flutter run
```

**Note**: `app/lib/main.dart` already contains a complete Hello World implementation. Integrate it into the scaffolded project rather than starting from scratch. See `HELLO_WORLD_PLAN.md` for details.

## 7. Helpful Commands
- `flutter pub get` – fetch dependencies.
- `flutter analyze` – static analysis.
- `flutter test` – unit tests.
- `flutter build ios --simulator` / `flutter build apk` – platform builds.

Document any deviations or platform-specific notes in `DOCUMENTATION.md`.
