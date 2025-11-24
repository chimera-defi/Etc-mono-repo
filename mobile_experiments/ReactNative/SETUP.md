# React Native Environment Setup

These steps condense the official guides at https://reactnative.dev/docs/environment-setup. Choose the **React Native CLI Quickstart** (not Expo) so we can access native platforms directly.

## 1. Prerequisites
- **Node.js** 18 LTS (install via nvm or Homebrew).
- **Package manager**: npm 10+ or Yarn 1.22+. Stick to one per project.
- **Watchman** (macOS) via `brew install watchman` for faster file watching.
- **JDK 17** (Temurin / Zulu) for Android builds.
- **Android Studio** with:
  - Android SDK Platform 34
  - Android SDK Build-Tools 34.x
  - Android Emulator + Intel x86_64 / ARM system images
- **Xcode 15+** for iOS builds, including command-line tools and Cocoapods (`sudo gem install cocoapods`).

## 2. Install React Native CLI Tooling
We rely on `npx react-native` which ships with the template; no global CLI required. Ensure `npx react-native --version` prints a version after Node is installed.

## 3. Validate Tooling
Run the doctor script at repo root (or inside `mobile_experiments/ReactNative`):
```bash
npx react-native doctor
```
Follow the interactive prompts to fix missing dependencies. Save a redacted copy of the output to `.cursor/artifacts/react-native-doctor.md` for reference.

## 4. Android Specific
- Launch Android Studio > Device Manager and create a Pixel 6 API 34 emulator.
- Accept SDK licenses: `yes | sdkmanager --licenses`.
- Set `ANDROID_HOME` (Linux) or rely on default macOS paths.
- Add platform-tools to PATH: `export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"` (macOS) or equivalent.

## 5. iOS Specific
- Run `sudo xcode-select --switch /Applications/Xcode.app`.
- Accept license: `sudo xcodebuild -license`.
- Install pods after project creation: `cd app/ValdiParity/ios && pod install`.

## 6. Seed Project (later)
Once tooling is green:
```bash
cd mobile_experiments/ReactNative/app
npx react-native init ValdiParity --template react-native-template-typescript
```
Do **not** commit the generated code yet if it violates the "no code" constraint; stash locally until instructed otherwise.

## 7. Helpful Commands (reference only)
- `npx react-native run-ios --simulator "iPhone 15"`
- `npx react-native run-android`
- `npx react-native start` (Metro bundler)
- `npx react-native test` (Jest) once configured

Record any deviations or platform-specific fixes in `DOCUMENTATION.md`.
