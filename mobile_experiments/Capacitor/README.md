# Capacitor Experiment

This project explores **Capacitor**, the modern successor to PhoneGap/Cordova, for converting web applications into native mobile apps.

## Status

✅ **Complete** - Hello World app with parity features implemented and tested.

| Check | Status |
|-------|--------|
| Code | ✅ Complete |
| Tests | ✅ 4 passing |
| Linting | ✅ Clean |
| Build | ✅ Working |
| Documentation | ✅ Complete |

## Overview

Capacitor allows you to:
- Wrap existing web apps (React, Vue, Angular, vanilla JS) into native iOS/Android apps
- Access native device features (camera, GPS, notifications, etc.) via JavaScript APIs
- Deploy a single codebase to iOS, Android, and Web
- Maintain 100% code reuse from your web application

## Quick Start

```bash
cd app
npm install
npm run dev      # Run in browser
npm run test     # Run tests
npm run lint     # Run linter
npm run build    # Build for production
```

## Features Implemented (Parity with Other Frameworks)

- ✅ Material-inspired UI design
- ✅ Toggle button with state management
- ✅ Show/hide details panel
- ✅ CSS animations and transitions
- ✅ Dark/light mode detection
- ✅ Framework badge
- ✅ Full test coverage (4 tests)
- ✅ TypeScript support
- ✅ Clean linting

## Project Structure

```
Capacitor/
├── app/                    # Vite + React TypeScript app
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── App.css        # Styles with CSS variables
│   │   ├── App.test.tsx   # Test suite
│   │   └── setupTests.ts  # Test configuration
│   ├── index.html         # Entry point with mobile viewport
│   ├── package.json       # Dependencies and scripts
│   ├── vitest.config.ts   # Test configuration
│   └── tsconfig.json      # TypeScript configuration
├── README.md              # This file
├── IMPLEMENTATION_GUIDE.md # Step-by-step native setup
├── HANDOFF.md             # Quick start guide
└── ... other docs
```

## Deploying to Native

To deploy to iOS/Android, follow `IMPLEMENTATION_GUIDE.md`:

```bash
# Install Capacitor platform packages
npm install @capacitor/ios @capacitor/android

# Build web app
npm run build

# Initialize Capacitor
npx cap init CapacitorHelloWorld com.example.capacitorhelloworld --web-dir app/dist

# Add platforms
npx cap add ios
npx cap add android

# Sync and open
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

## Why Capacitor for AI Development?

Capacitor scored **highest (4.9/5)** in our AI-focused comparison because:

1. **Standard Web Technologies**: React + TypeScript = maximum AI training data
2. **Instant Iteration**: Vite HMR provides sub-second hot reload
3. **Familiar Tooling**: ESLint, Vitest, Chrome DevTools all work perfectly
4. **AI Code Quality**: Generated code works without modification most of the time

See `../AI_COMPARISON.md` for the full analysis.

## Resources

- **Official Docs**: https://capacitorjs.com/docs
- **GitHub**: https://github.com/ionic-team/capacitor
- **Plugins**: https://capacitorjs.com/docs/plugins

## Related Projects

- `../ReactNative/` - React Native experiment
- `../Flutter/` - Flutter experiment
- `../Valdi/` - Valdi experiment
- `../AI_COMPARISON.md` - Framework comparison for AI development

---

**Last Updated**: 2024-12-19  
**Status**: Complete (Phase 1)
