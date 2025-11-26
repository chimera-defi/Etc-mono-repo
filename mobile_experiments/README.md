# Mobile Experiments

This folder contains experiments with different mobile app frameworks to evaluate their suitability for cross-platform development and AI-assisted coding.

## Frameworks Under Evaluation

1. **[Valdi](./Valdi/)** - Snapchat's cross-platform framework (TypeScript, iOS/Android/macOS)
2. **[Flutter](./Flutter/)** - Google's UI toolkit (Dart, iOS/Android/Web/Desktop)
3. **[React Native](./ReactNative/)** - Meta's framework (JavaScript/TypeScript, iOS/Android/Web)
4. **[Capacitor](./Capacitor/)** - Ionic's web-to-native wrapper (TypeScript, iOS/Android/Web)

## Current Status

| Framework | Status | Code | Structure | Tests | Linting | Documentation |
|-----------|--------|------|-----------|-------|---------|---------------|
| **Valdi** | ✅ Complete | ✅ | ✅ | ⚠️ Needs Valdi CLI | ⚠️ Needs Valdi CLI | ✅ |
| **Flutter** | ✅ Complete | ✅ | ✅ | ✅ 3 tests passing | ⚠️ Needs Flutter CLI | ✅ |
| **React Native** | ✅ Complete | ✅ | ✅ | ✅ 3 tests passing | ✅ Clean (1 warning) | ✅ |
| **Capacitor** | ✅ Complete | ✅ | ✅ | ✅ 4 tests passing | ✅ Clean | ✅ |

### Quick Comparison

| Aspect | Valdi | Flutter | React Native | Capacitor |
|--------|-------|---------|--------------|-----------|
| Language | TypeScript | Dart | TypeScript | TypeScript |
| Hello World | ✅ | ✅ | ✅ | ✅ |
| Toggle/State | ✅ | ✅ | ✅ | ✅ |
| Animations | ✅ Native | ✅ | ✅ | ✅ CSS |
| Tests Passing | ⚠️ | ✅ | ✅ | ✅ |
| Linting Clean | ⚠️ | ⚠️ | ✅ | ✅ |
| iOS Ready | ✅ | ✅ | ✅ | ✅ |
| Android Ready | ✅ | ✅ | ✅ | ✅ |
| Web Ready | ❌ | ✅ | ✅ | ✅ |

## Key Documents

- **[AI_COMPARISON.md](./AI_COMPARISON.md)** - AI-focused framework comparison (best for AI development)
- **[REVIEW.md](./REVIEW.md)** - Initial comprehensive review of all experiments
- **[SUCCESS_FRAMEWORK.md](./SUCCESS_FRAMEWORK.md)** - Framework for measuring and comparing framework success
- **[FRAMEWORK_COMPARISON.md](./FRAMEWORK_COMPARISON.md)** - Comparison matrix of mobile frameworks
- **[WEB_TO_MOBILE_GUIDE.md](./WEB_TO_MOBILE_GUIDE.md)** - Guide for web developers transitioning to mobile

## Success Measurement

We use a structured approach to measure framework success across five dimensions:

1. **Developer Experience (25%)** - Setup time, hot reload, build time, documentation
2. **Performance (25%)** - Launch time, frame rate, memory usage, app size
3. **Code Quality (20%)** - Type safety, reusability, testability, maintainability
4. **Ecosystem (15%)** - Package availability, community size, documentation quality
5. **Platform Support (15%)** - Platform coverage, native API access, feature parity

See [SUCCESS_FRAMEWORK.md](./SUCCESS_FRAMEWORK.md) for detailed metrics and measurement methodology.

## Hello World Apps (Parity Features)

Each framework implements identical Hello World features for fair comparison:

- **Greeting headline** - "Hello from Valdi Labs" + "[Framework] says hi!"
- **Interactive toggle** - Button that shows/hides details panel
- **State management** - Toggle state with visual feedback
- **Animations** - Fade/scale transitions (native or CSS)
- **Theme support** - Light/dark mode detection
- **Material-inspired design** - Modern UI with proper spacing

### Running the Apps

#### Flutter
```bash
cd Flutter/app
flutter pub get
flutter run
```

#### React Native
```bash
cd ReactNative/app/ValdiParity
npm install
npm start
# In another terminal:
npm run android  # or npm run ios
```

#### Capacitor
```bash
cd Capacitor/app
npm install
npm run dev      # Web preview
npm run build    # Build for native
npx cap sync     # Sync to native projects
```

#### Valdi
```bash
cd Valdi
# Follow SETUP.md for Valdi CLI installation
valdi dev_setup
valdi run ios  # or android/macos
```

## Framework Summary for AI Development

| Criteria | Best Choice | Why |
|----------|-------------|-----|
| **Easiest AI coding** | Capacitor | Web technologies, most training data |
| **Best performance** | Valdi/Flutter | Native compilation, no bridges |
| **Largest ecosystem** | React Native | Huge npm/community support |
| **Web + Mobile** | Capacitor | Same codebase everywhere |
| **Type Safety** | All except Flutter | TypeScript (Dart also strongly typed) |

See [AI_COMPARISON.md](./AI_COMPARISON.md) for the complete AI-focused analysis.

## Next Steps

1. ✅ ~~Complete review of experiments~~
2. ✅ ~~Create success measurement framework~~
3. ✅ ~~Build Flutter Hello World with parity~~
4. ✅ ~~Build React Native Hello World with parity~~
5. ✅ ~~Build Capacitor Hello World with parity~~
6. ✅ ~~Enhance Valdi Hello World with parity~~
7. ⏭️ Run all apps on physical devices for benchmarks
8. ⏭️ Implement Phase 2 features (navigation, lists, API calls)
9. ⏭️ Begin baseline measurements per SUCCESS_FRAMEWORK.md

## Framework-Specific Documentation

Each framework folder contains:
- `README.md` - Overview and status
- `SETUP.md` - Installation and environment setup
- `DOCUMENTATION.md` - Framework-specific notes
- `HANDOFF.md` - Quick start for next developer
- `TASKS.md` - Task breakdown
- `NEXT_STEPS.md` - Prioritized action items
- `UNDERSTANDING.md` - Research context and strategy

## Contributing

When adding new experiments or updating existing ones:
1. Follow the established documentation structure
2. Update [REVIEW.md](./REVIEW.md) with findings
3. Record measurements in [SUCCESS_FRAMEWORK.md](./SUCCESS_FRAMEWORK.md)
4. Keep [FRAMEWORK_COMPARISON.md](./FRAMEWORK_COMPARISON.md) updated
5. Ensure tests pass and linting is clean

---

**Last Updated**: 2024-12-19  
**Status**: Phase 1 (Hello World) complete for all four frameworks
