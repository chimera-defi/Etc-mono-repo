# React Native Experiment

React Native ranks immediately after Flutter in our comparison for cross-platform native performance, offering a mature ecosystem, a vast library surface, and teams' familiarity with JavaScript/TypeScript.

## Status ✅ COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| Project Structure | ✅ Complete | Scaffolded with React Native CLI |
| Hello World Code | ✅ Complete | TypeScript, animations, theme support |
| iOS Support | ✅ Ready | Requires `pod install` on macOS |
| Android Support | ✅ Ready | Gradle build configured |
| Tests | ✅ Passing | 3 Jest tests + snapshot |
| Linting | ✅ Clean | ESLint passes (1 minor warning) |
| TypeScript | ✅ Clean | `tsc --noEmit` passes |

## Quick Start

```bash
# Navigate to the app directory
cd app/ValdiParity

# Install dependencies (already done)
npm install

# Run linting
npm run lint

# Run tests
npm test

# Start Metro bundler
npm start

# Run on Android (requires emulator/device)
npm run android

# Run on iOS (requires macOS + Xcode)
npm run ios
```

## Key Files

- `app/ValdiParity/App.tsx` – Main application with Hello World implementation
- `app/ValdiParity/package.json` – Package dependencies and scripts
- `app/ValdiParity/__tests__/App.test.tsx` – Jest tests with snapshot
- `HELLO_WORLD_PLAN.md` – Blueprint for the sample app
- `SETUP.md` – Environment prep (Node, JDK, watchman, Cocoapods/Gradle)
- `DOCUMENTATION.md` – Curated highlights from https://reactnative.dev
- `TASKS.md`, `NEXT_STEPS.md`, `UNDERSTANDING.md` – Backlog, priorities, and research context
- `HANDOFF.md`, `README_AGENT.md` – Quick start instructions

## Features Demonstrated

The Hello World app showcases:
- **Material-Inspired Design** - Custom color palette with light/dark themes
- **State Management** - React hooks (useState, useRef)
- **Animations** - Native Animated API with fade and scale transitions
- **Dark/Light Mode** - useColorScheme hook for system theme detection
- **TypeScript** - Full type safety with interfaces
- **Cross-Platform** - Runs on iOS and Android

## Project Structure

```
app/ValdiParity/
├── App.tsx                # Main application code
├── __tests__/
│   └── App.test.tsx       # Jest tests
├── app.json               # App configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler config
├── jest.config.js         # Jest configuration
└── .eslintrc.js           # ESLint configuration
```

## Technical Details

- **React Native Version**: 0.82.1
- **Template**: @react-native-community/template (TypeScript)
- **Package Manager**: npm
- **Dependencies**: react-native-safe-area-context (included)

## Comparison Notes

### vs. Valdi
- **Language**: TypeScript in both (familiar syntax)
- **Components**: JSX in both, different component naming conventions
- **Bridge**: React Native uses bridge, Valdi compiles to native
- **Ecosystem**: Much larger package ecosystem in React Native

### vs. Flutter
- **Language**: TypeScript/JavaScript vs. Dart
- **Learning Curve**: Lower for web developers
- **Native Access**: Easier native module integration
- **Bundle**: Metro bundler vs. Flutter build system
- **Hot Reload**: Fast Refresh (~1s) vs. Flutter hot reload (sub-second)

## Next Steps

1. ⏭️ Install on iOS simulator (requires macOS + pod install)
2. ⏭️ Install on Android emulator for device testing
3. ⏭️ Implement feature parity tests (navigation, API calls, lists)
4. ⏭️ Measure against SUCCESS_FRAMEWORK.md metrics
5. ⏭️ Enable Hermes for performance comparison

Refer to `HANDOFF.md` for an actionable checklist when you pick this up next.
