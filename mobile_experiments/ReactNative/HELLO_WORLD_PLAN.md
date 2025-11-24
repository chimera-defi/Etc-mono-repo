# Hello World Implementation Plan (React Native)

## Goal
Produce a minimal React Native screen that mirrors the Valdi and Flutter greetings: bold headline, supporting copy comparing frameworks, and a CTA button that toggles a short message. The emphasis is on experience documentation rather than code sophistication.

## Milestones
1. **Scaffold & Baseline**
   - Initialize `app/ValdiParity` with the TypeScript template (when code work is allowed).
   - Confirm Metro bundler launches and the default app loads on at least one platform.
2. **UI Customization**
   - Replace default copy with "Hello from Valdi Labs" headline and descriptive subtitle.
   - Add a button labeled "Toggle insight" that flips a piece of state (e.g., show/hide comparison note).
   - Apply basic branding (custom color palette, SafeAreaView padding) for differentiation.
3. **Verification**
   - Run `npx react-native run-ios` and `run-android` (or appropriate device commands) to ensure parity.
   - Capture simulator/emulator screenshots plus bundler logs in `.cursor/artifacts/`.
4. **Documentation Pass**
   - Update `DOCUMENTATION.md` with any non-obvious steps (e.g., pod install issues, Gradle tweaks).
   - Log DX comparisons in `UNDERSTANDING.md` (hot reload vs. Fast Refresh, bundler speed, etc.).

## Work Breakdown
- **Environment**: Node, watchman, Android Studio, Xcode.
- **Project Setup**: Install dependencies (`npm install`/`yarn`), run `pod install` for iOS, verify `npm run lint/test`.
- **Development**: Implement the single-screen layout using React Native primitive components (Text, View, Pressable) once allowed.
- **Testing**: Keep the default Jest test but update snapshot/string expectations for the new copy.

## Definition of Done
- App renders the custom greeting and interactive toggle on both platforms.
- Fast Refresh works reliably; observations recorded in docs.
- `npm test` (or Yarn equivalent) passes without modifications beyond snapshot updates.
- All instructions for reproducing the setup and running the app are captured in the repo docs.

## Risks & Mitigations
- **Cocoapods / Xcode drift**: Document pod install commands and Ruby version requirements immediately.
- **Android SDK path issues**: Provide explicit environment variable guidance in `SETUP.md` if doctor surfaces problems.
- **State management scope creep**: Keep to React hooks for this milestone; defer libraries like Redux.

## Stretch Ideas (post-Hello World)
- Add navigation using `@react-navigation/native` for a two-screen demo.
- Integrate a native module (e.g., camera access) to test bridging complexity.
- Enable Hermes to compare bundle size and performance.
