# Capacitor Experiment

Ionic's web-to-native wrapper - wrap any web app into native iOS/Android apps.

## Status: ✅ Complete

| Check | Status |
|-------|--------|
| Code | ✅ Complete |
| Tests | ✅ 4 passing |
| Linting | ✅ Clean |
| Build | ✅ Working |

## Quick Start

```bash
cd app
npm install
npm run dev      # Run in browser
npm run test     # Run tests
npm run lint     # Run linter
npm run build    # Build for production
```

## Features

- Material-inspired UI design
- Toggle button with state management
- CSS animations and transitions
- Dark/light mode detection
- Full TypeScript support

## Project Structure

```
app/
├── src/
│   ├── App.tsx          # Main component
│   ├── App.css          # Styles
│   ├── App.test.tsx     # Tests
│   └── setupTests.ts    # Test config
├── index.html           # Entry point
├── package.json         # Dependencies
├── vitest.config.ts     # Test config
└── tsconfig.json        # TypeScript config
```

## Setup Requirements

- **Node.js** v14+
- **iOS**: macOS with Xcode
- **Android**: Android Studio with SDK

## Deploying to Native

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Build web app first
cd app && npm run build && cd ..

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

## Development Workflow

1. **Develop**: `cd app && npm run dev` (browser)
2. **Build**: `npm run build`
3. **Sync**: `npx cap sync`
4. **Run**: Open in Xcode/Android Studio

## Native Plugins

```javascript
// Camera
import { Camera } from '@capacitor/camera';
const image = await Camera.getPhoto({ quality: 90, resultType: 'base64' });

// Geolocation
import { Geolocation } from '@capacitor/geolocation';
const pos = await Geolocation.getCurrentPosition();
```

## Comparison Notes

| vs React Native | Capacitor |
|-----------------|-----------|
| Code Reuse | 100% web code |
| Performance | WebView (vs native) |
| Learning | Easy for web devs |

| vs Flutter | Capacitor |
|------------|-----------|
| Language | JS/TS (vs Dart) |
| Performance | WebView (vs native) |
| Web Deploy | Same code runs in browser |

## Why Capacitor?

- ✅ Existing web apps → mobile instantly
- ✅ Web developer expertise
- ✅ Shared web/mobile codebase
- ✅ Browser DevTools debugging
- ⚠️ WebView performance overhead

## Resources

- https://capacitorjs.com/docs
- https://capacitorjs.com/docs/plugins
- https://github.com/ionic-team/capacitor
