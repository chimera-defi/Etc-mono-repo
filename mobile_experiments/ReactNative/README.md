# React Native Experiment

Meta's cross-platform framework using JavaScript/TypeScript with native components.

## Status: ✅ Complete

| Check | Status |
|-------|--------|
| Code | ✅ Complete |
| Tests | ✅ 3 passing |
| Linting | ✅ Clean |
| TypeScript | ✅ Clean |

## Quick Start

```bash
cd app/ValdiParity
npm install
npm run lint
npm test
npm start           # Start Metro bundler
npm run android     # Run on Android
npm run ios         # Run on iOS (macOS only)
```

## Features

- Material-inspired design with light/dark themes
- React hooks (useState, useRef) state management
- Native Animated API with fade/scale transitions
- useColorScheme for system theme detection
- Full TypeScript support

## Project Structure

```
app/ValdiParity/
├── App.tsx                # Main application
├── __tests__/App.test.tsx # Jest tests
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── metro.config.js        # Bundler config
└── jest.config.js         # Test config
```

## Setup Requirements

- **Node.js** 18+ with npm
- **watchman** (macOS): `brew install watchman`
- **JDK 17** for Android
- **Android Studio** with SDK 34
- **Xcode 15+** for iOS (macOS only)

### Verify Setup
```bash
npx react-native doctor
```

### iOS Setup (macOS)
```bash
cd app/ValdiParity/ios
pod install
```

## Technical Details

- **React Native**: 0.82.1
- **Template**: @react-native-community/template (TypeScript)
- **Bundler**: Metro with Fast Refresh (~1s)

## Building

```bash
# iOS
npx react-native run-ios --simulator "iPhone 15"

# Android
npx react-native run-android

# Release APK
cd android && ./gradlew assembleRelease
```

## Comparison Notes

| vs Valdi | React Native |
|----------|--------------|
| Language | TypeScript (both) |
| Bridge | JS bridge (vs native) |
| Ecosystem | Much larger |

| vs Flutter | React Native |
|------------|--------------|
| Language | TS/JS (vs Dart) |
| Learning | Easier for web devs |
| Hot Reload | Fast Refresh ~1s |

## Resources

- https://reactnative.dev
- https://reactnative.dev/docs/environment-setup
- https://www.npmjs.com (packages)
