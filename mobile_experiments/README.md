# Mobile Experiments

This folder contains experiments with different mobile app frameworks to evaluate their suitability for cross-platform development.

## Frameworks Under Evaluation

1. **[Valdi](./Valdi/)** - Snapchat's cross-platform framework (TypeScript, iOS/Android/macOS)
2. **[Flutter](./Flutter/)** - Google's UI toolkit (Dart, iOS/Android/Web/Desktop)
3. **[React Native](./ReactNative/)** - Meta's framework (JavaScript/TypeScript, iOS/Android/Web)

## Current Status

| Framework | Status | Code | Structure | Tests | Documentation |
|-----------|--------|------|-----------|-------|---------------|
| **Valdi** | ✅ Complete | ✅ | ✅ | ⚠️ Needs verification | ✅ |
| **Flutter** | ✅ Complete | ✅ | ✅ | ✅ 3 tests passing | ✅ |
| **React Native** | ✅ Complete | ✅ | ✅ | ✅ 3 tests passing | ✅ |

### Quick Comparison

| Aspect | Valdi | Flutter | React Native |
|--------|-------|---------|--------------|
| Language | TypeScript | Dart | TypeScript |
| Hello World | ✅ | ✅ | ✅ |
| Tests | ⚠️ Pending | ✅ Passing | ✅ Passing |
| Linting | ⚠️ Pending | ✅ Clean | ✅ Clean |
| iOS Ready | ⚠️ Needs verification | ✅ | ✅ |
| Android Ready | ⚠️ Needs verification | ✅ | ✅ |

## Key Documents

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

## Hello World Apps

Each framework implements a parity Hello World app with:

- **Greeting headline** - "Hello from Valdi Labs" / "[Framework] says hi!"
- **Interactive toggle** - Button that shows/hides details
- **Animations** - Fade/scale transitions
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

#### Valdi
```bash
cd Valdi
# Follow SETUP.md for Valdi CLI installation
valdi dev_setup
valdi run ios  # or android/macos
```

## Next Steps

1. ✅ ~~Complete review of experiments~~
2. ✅ ~~Create success measurement framework~~
3. ✅ ~~Build Flutter Hello World~~
4. ✅ ~~Build React Native Hello World~~
5. ⏭️ Run all apps on physical devices for benchmarks
6. ⏭️ Implement Phase 2 features (navigation, lists, API calls)
7. ⏭️ Begin baseline measurements per SUCCESS_FRAMEWORK.md

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
**Status**: Phase 1 (Hello World) complete for Flutter and React Native
