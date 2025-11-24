# Understanding & Research Notes

## Why React Native After Flutter?
- According to `FRAMEWORK_COMPARISON.md`, React Native remains a top performer with a massive ecosystem and community support, making it the logical follow-up after Valdi and Flutter.
- Provides contrast between TypeScript-to-native bridge architecture and Flutter's Skia rendering or Valdi's TSX-to-native approach.

## Key Themes to Investigate
- **Bundler Workflow**: Metro vs. Flutter's hot reload vs. Valdi's instant reload. Record cold start times and reload latency.
- **Native Integration**: How often we need to touch `android/` or `ios/` directories for even simple apps.
- **State & UI Model**: React component model with hooks vs. Flutter widgets vs. Valdi classes.
- **Tooling Requirements**: Impact of multiple package managers, Cocoapods, Gradle caches, etc.

## Assumptions
- Targeting React Native 0.74+ with TypeScript template.
- macOS host available for iOS builds; Linux-only path will focus on Android.
- Expo is out-of-scope for now; we want bare React Native for parity with native modules.

## Research Plan
1. Review the official docs: Getting Started, Environment Setup, CLI usage, Metro bundler basics.
2. Identify common gotchas (Android SDK licenses, watchman permissions, pods) and preemptively document fixes.
3. Map Flutter/Valdi concepts (e.g., navigation stack, styling systems) to React Native equivalents for easier comparison later.
4. Track build/run metrics once the app exists (time to first bundle, hot reload responsiveness, binary sizes).

## Risks
- iOS builds require a Mac; if unavailable, document blockers clearly.
- `node_modules` size may bloat repo if accidentally committed; rely on `.gitignore` and avoid copying builds into the repo.
- Frequent RN version releases can shift template behavior; pin the version in documentation when scaffolding.
