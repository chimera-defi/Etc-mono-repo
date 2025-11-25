# React Native Documentation Snapshot

Curated references from https://reactnative.dev and supporting tooling docs. Update this file as you discover new nuances.

## Install & Environment
- **Official setup guide** – https://reactnative.dev/docs/environment-setup (choose *React Native CLI Quickstart*).
- **Node management** – https://github.com/nvm-sh/nvm for installing and switching Node versions.
- **watchman** – https://facebook.github.io/watchman/docs/install for faster filesystem events (required on macOS for reliability).
- **Android tooling** – https://developer.android.com/studio#downloads for Studio + SDK Manager instructions.
- **Cocoapods** – https://guides.cocoapods.org/using/getting-started.html for iOS dependency management after project creation.

## Project Scaffolding
- `npx react-native init <ProjectName> --template react-native-template-typescript` generates a bare template with TypeScript support.
- Template layout:
  - `App.tsx` – entry component.
  - `android/`, `ios/` – native host projects (Gradle/Xcode).
  - `metro.config.js` – bundler config (optional to tweak).
  - `babel.config.js`, `tsconfig.json` – transpilation settings.
- Use `npx react-native config` to inspect native module auto-linking once dependencies are added.

## Running & Debugging
- **Metro bundler** – `npx react-native start` launches Metro; hot reloading is automatic when using the RN Dev Menu.
- **Run commands**:
  - `npx react-native run-ios --simulator "iPhone 15"`
  - `npx react-native run-android`
- **Dev Menu** – `Cmd+D` (iOS simulator) / `Cmd+M` (Android emulator) for enabling Fast Refresh, remote JS debugging, and performance overlays.
- **Debugging Tools** – React Native DevTools (built-in) for debugging. Note: Flipper was deprecated by Meta; verify current recommended debugging tools when setting up.

## Testing & Quality
- **Jest** – included by default. Run `npm test` / `yarn test`. Snapshot testing recommended for simple components.
- **ESLint + TypeScript** – template ships with baseline config; `npm run lint` ensures style compliance.
- **End-to-end** – Detox (https://wix.github.io/Detox/) is the go-to E2E runner once the app matures.

## Deployment References
- **Android** – https://reactnative.dev/docs/signed-apk-android for generating release APK/AAB via Gradle.
- **iOS** – https://reactnative.dev/docs/publishing-to-app-store for provisioning, archives, and App Store Connect.

## Key Concepts Reminders
- **Bridge architecture**: JS thread communicates with native modules; Hermes engine can reduce overhead.
- **Fast Refresh**: RN’s hot reload mechanism; note differences vs. Flutter/Valdi when evaluating DX.
- **StyleSheet**: CSS-like styling; uses Yoga layout engine (Flexbox semantics).
- **Platform modules**: Access native APIs via `Platform`, `NativeModules`, or community packages (e.g., `react-native-device-info`).

Keep adding deep links or troubleshooting steps (e.g., Cocoapods cache clears, Gradle daemon tweaks) as you encounter them.
