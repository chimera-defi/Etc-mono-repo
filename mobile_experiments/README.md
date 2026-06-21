# Mobile Experiments

Comparison of cross-platform mobile frameworks for AI-assisted development.

## 🆕 Agent App Research

**[AgentApp/](./AgentApp/)** - Research for building a native mobile AI coding agent app.

| Document | Description |
|----------|-------------|
| [README.md](./AgentApp/README.md) | Project overview and quick summary |
| [CURSOR_API_RESEARCH.md](./AgentApp/CURSOR_API_RESEARCH.md) | Cursor API availability analysis |
| [ALTERNATIVES_ANALYSIS.md](./AgentApp/ALTERNATIVES_ANALYSIS.md) | Survey of AI coding agents with APIs |
| [MOBILE_ARCHITECTURE.md](./AgentApp/MOBILE_ARCHITECTURE.md) | Proposed mobile app architecture |
| [FRAMEWORK_RECOMMENDATION.md](./AgentApp/FRAMEWORK_RECOMMENDATION.md) | Framework selection guide |

**Key Finding**: Cursor has no public API. Build custom agent using **Claude API + React Native** (recommendation updated based on 58x StackOverflow advantage).

---

## Frameworks

| Framework | Language | Status | Tests | Quick Start |
|-----------|----------|--------|-------|-------------|
| [Capacitor](./Capacitor/) | TypeScript | ✅ Complete | ✅ 4/4 | `cd Capacitor/app && npm run dev` |
| [React Native](./ReactNative/) | TypeScript | ✅ Complete | ✅ 3/3 | `cd ReactNative/app/ValdiParity && npm start` |
| [Flutter](./Flutter/) | Dart | ✅ Complete | ✅ 3/3 | `cd Flutter/app && flutter run` |
| [Valdi](./Valdi/) | TypeScript | ⚠️ Needs CLI | — | `valdi hotreload` |

## AI Development Scores (Updated Dec 2025)

| Rank | Framework | Score | Δ | Best For |
|------|-----------|-------|---|----------|
| 🥇 | **Capacitor** | 4.80/5 | — | Web devs, browser + mobile |
| 🥈 | **React Native** | 4.43/5 | -0.37 | Native perf + large ecosystem |
| 🥉 | **Flutter** | 4.05/5 | -0.75 | Best raw performance |
| 4️⃣ | **Valdi** | 2.95/5 | -1.85 | Snapchat ecosystem |

> **Score Update**: React Native score increased from 4.25→4.43 based on verified ecosystem data (58x more StackOverflow questions). Gap with Capacitor narrowed from 0.65 to 0.37.

### Ecosystem Size (Verified Dec 2025)

| Metric | React Native | Capacitor | Flutter | RN vs Cap |
|--------|--------------|-----------|---------|-----------|
| **npm Downloads/mo** | 18.8M | 3.7M | — | **5.1x** |
| **GitHub Stars** | 124.6k | 14.4k | 174k | **8.6x** |
| **GitHub Forks** | 25k | 1.1k | 29.6k | **22x** |
| **StackOverflow Qs** | 139,433 | 2,369 | 181,988 | **58x** |

### AI Training Data Implications

The **58x difference in StackOverflow questions** is critical for AI code generation:
- More Q&A pairs = better AI debugging suggestions
- More code examples = fewer hallucinations  
- Larger forum presence = faster community fixes in training data

### Performance Characteristics

| Aspect | Capacitor | React Native | Flutter |
|--------|-----------|--------------|---------|
| **Runtime** | WebView | Native components | Native rendering |
| **60fps animations** | Harder | ✅ Native driver | ✅ Best |
| **App size (hello world)** | ~5MB | ~15-25MB | ~15-20MB |
| **JS bundle (gzip)** | 61KB | ~500KB | — |
| **Cold start** | Moderate | Fast | Fast |
| **Dev server startup** | 120ms ✅ | ~3-5s | ~2-3s |
| **Production build** | 1.8s ✅ | ~60-90s | ~30-60s |

### Developer Tooling (Verified Dec 2025)

| Tool Category | React Native | Capacitor | Flutter |
|---------------|--------------|-----------|---------|
| **Debugger** | Flipper (251k/mo), React DevTools (526k/mo) | Browser DevTools | Dart DevTools |
| **Profiler** | Reactotron (15.4k ⭐) | Chrome Performance | Flutter Inspector |
| **Linting** | eslint-plugin-react-native (5.3M/mo) | Standard ESLint | dart analyze |
| **Hot Reload** | Fast Refresh | Vite HMR (instant) | Stateful Hot Reload |
| **CLI Tools** | @react-native-community/cli (7.4M/mo) | @capacitor/cli (3.7M/mo) | flutter CLI |

### Animation & Gesture Libraries

| Library | Downloads/mo | Notes |
|---------|--------------|-------|
| react-native-reanimated | 8.8M | 60fps native animations |
| react-native-gesture-handler | 10.6M | Native touch handling |
| react-native-web | 8M | Web platform support |

### AI-Specific Tooling

| Framework | AI Tools | Notes |
|-----------|----------|-------|
| **React Native** | react-native-copilot (36k/mo) | Guided user tours |
| **React Native** | Expo AI integrations | AI-powered dev workflows |
| **All TypeScript** | GitHub Copilot | Best support for TS/TSX |
| **Flutter** | Gemini integration | Google AI services |

**AI Development Advantage**: TypeScript frameworks (React Native, Capacitor) have better AI code completion due to type hints. React Native's larger codebase means more training examples for AI models.

### Unique Framework Strengths

| Framework | Unique Advantage | Use Case |
|-----------|------------------|----------|
| **React Native** | NativeWind (1.8M/mo) - Tailwind for RN | Familiar web styling |
| **React Native** | Expo EAS Build - cloud builds | CI/CD without local setup |
| **React Native** | New Architecture (Fabric) | Improved performance |
| **Capacitor** | Same code runs in browser | Progressive Web Apps |
| **Capacitor** | Instant dev reload (120ms) | Fastest iteration |
| **Capacitor** | Smallest bundle (61KB gzip) | Performance-constrained |
| **Flutter** | Impeller renderer | Best graphics performance |
| **Flutter** | Widget Inspector | Visual debugging |
| **Flutter** | Dart null safety | Compile-time safety |

### Enterprise Considerations

| Factor | React Native | Capacitor | Flutter |
|--------|--------------|-----------|---------|
| **Talent Pool** | Largest (JS devs) | Large (web devs) | Growing (Dart) |
| **Corporate Backing** | Meta | Ionic/Capacitor | Google |
| **Fortune 500 Usage** | Facebook, Instagram, Shopify | Progressive apps | Google Pay, BMW |
| **Long-term Support** | 10+ years | 5+ years | 6+ years |

### Test Harness Results (Dec 2025)

| Framework | Tests | Lint | Type-check | Status |
|-----------|-------|------|------------|--------|
| Capacitor | ✅ 4/4 | ✅ Clean | ✅ Pass | Verified |
| React Native | ✅ 3/3 | ✅ Clean | ✅ Pass | Verified |
| Flutter | ✅ 3/3 | — | — | Needs CLI |

### Code Verbosity (Identical Features)

| Framework | Code | Styles | **Total** | Notes |
|-----------|------|--------|-----------|-------|
| **Capacitor** | 92 | 190 | **282** | TSX + separate CSS |
| **Flutter** | 218 | — | **218** | Dart with inline styles |
| **React Native** | 264 | — | **264** | TSX with StyleSheet |

**Analysis**: Capacitor splits code/styles into two files. Flutter and React Native are single-file solutions. All use similar patterns: component structure, state hooks, theme colors, and animations.

## Quick Decision Guide

```
Have existing web app?
  → YES: Capacitor (wrap it)
  → NO: Continue

Need same code in browser (PWA)?
  → YES: Capacitor
  → NO: Continue

Need 60fps animations or complex gestures?
  → YES: Flutter (best) or React Native (good)
  → NO: Continue

Fastest dev iteration?
  → YES: Capacitor (120ms reload, 1.8s build)
  → NO: Continue

Largest ecosystem + AI assistance?
  → YES: React Native (58x more SO data, 10M+ gesture library)
  → NO: Continue

Best graphics/gaming performance?
  → YES: Flutter (Impeller renderer)
  → NO: Any framework works
```

### Framework Selection Summary

| Priority | Best Choice | Why |
|----------|-------------|-----|
| **AI-assisted dev** | React Native | 58x more StackOverflow, largest npm ecosystem |
| **Web + Mobile** | Capacitor | Same code runs in browser |
| **Raw performance** | Flutter | Impeller renderer, 60fps guaranteed |
| **Fastest iteration** | Capacitor | 120ms dev reload, 1.8s build |
| **Largest talent pool** | React Native | JavaScript developers |
| **Smallest bundle** | Capacitor | 61KB gzip vs 500KB+ |

## Project Structure

Each framework folder contains:
- `README.md` - Setup and usage
- `app/` - The actual application code

## Detailed Analysis

See `.artifacts/` folder for detailed comparison documents:
- `AI_COMPARISON.md` - Detailed AI scoring methodology
- `FRAMEWORK_COMPARISON.md` - Full framework comparison matrix
- `SUCCESS_FRAMEWORK.md` - Measurement methodology

---

**Status**: Phase 1 (Hello World) complete for all frameworks
