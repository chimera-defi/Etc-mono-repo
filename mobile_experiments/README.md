# Mobile Experiments

This folder contains experiments with different mobile app frameworks to evaluate their suitability for cross-platform development.

## Frameworks Under Evaluation

1. **[Valdi](./Valdi/)** - Snapchat's cross-platform framework (TypeScript, iOS/Android/macOS)
2. **[Flutter](./Flutter/)** - Google's UI toolkit (Dart, iOS/Android/Web/Desktop)
3. **[React Native](./ReactNative/)** - Meta's framework (JavaScript/TypeScript, iOS/Android/Web)

## Current Status

| Framework | Status | Code | Structure | Documentation |
|-----------|--------|------|-----------|---------------|
| **Valdi** | ✅ Complete | ✅ | ✅ | ✅ |
| **Flutter** | ⚠️ Needs Scaffolding | ✅ | ❌ | ✅ |
| **React Native** | 📋 Planning | ❌ | ❌ | ✅ |

See [REVIEW.md](./REVIEW.md) for detailed status and findings.

## Key Documents

- **[REVIEW.md](./REVIEW.md)** - Initial comprehensive review of all experiments
- **[DEEP_REVIEW.md](./DEEP_REVIEW.md)** - Multi-path deep analysis with self-assessment and critical issues
- **[REVIEW_SUMMARY.md](./REVIEW_SUMMARY.md)** - Quick summary and action items
- **[SUCCESS_FRAMEWORK.md](./SUCCESS_FRAMEWORK.md)** - Framework for measuring and comparing framework success
- **[FRAMEWORK_COMPARISON.md](./FRAMEWORK_COMPARISON.md)** - Comparison matrix of mobile frameworks

## Success Measurement

We use a structured approach to measure framework success across five dimensions:

1. **Developer Experience (25%)** - Setup time, hot reload, build time, documentation
2. **Performance (25%)** - Launch time, frame rate, memory usage, app size
3. **Code Quality (20%)** - Type safety, reusability, testability, maintainability
4. **Ecosystem (15%)** - Package availability, community size, documentation quality
5. **Platform Support (15%)** - Platform coverage, native API access, feature parity

See [SUCCESS_FRAMEWORK.md](./SUCCESS_FRAMEWORK.md) for detailed metrics and measurement methodology.

## Next Steps

1. ✅ Complete review of experiments
2. ✅ Create success measurement framework
3. ✅ Deep multi-path review with self-assessment
4. ⚠️ **CRITICAL**: Fix Valdi project structure (doesn't match framework requirements)
5. ⏭️ Scaffold Flutter project structure
6. ⏭️ Verify Valdi import paths against actual installation
7. ⏭️ Begin baseline measurements per SUCCESS_FRAMEWORK.md

**⚠️ Important**: See [DEEP_REVIEW.md](./DEEP_REVIEW.md) for critical structural issues discovered.

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
