# Mobile Experiments

Comparison of cross-platform mobile frameworks for AI-assisted development.

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

### Test Harness Results (Dec 2025)

| Framework | Tests | Lint | Type-check | Status |
|-----------|-------|------|------------|--------|
| Capacitor | ✅ 4/4 | ✅ Clean | ✅ Pass | Verified |
| React Native | ✅ 3/3 | ✅ Clean | ✅ Pass | Verified |
| Flutter | ✅ 3/3 | — | — | Needs CLI |

### Code Verbosity (Identical Features)

| Framework | Code | Styles | **Total** | Notes |
|-----------|------|--------|-----------|-------|
| **React Native** | 99 | — | **99** | Single file, inline styles |
| **Flutter** | 101 | — | **101** | Single file, inline styles |
| **Capacitor** | 56 | 69 | **125** | Separate CSS file |

All three now implement identical features with similar code size (~100-125 lines).

## Quick Decision Guide

```
Have existing web app?
  → YES: Capacitor (wrap it)
  → NO: Continue

Need same code in browser?
  → YES: Capacitor
  → NO: Continue

Need native 60fps performance?
  → YES: Flutter or React Native
  → NO: Continue

Prioritize AI assistance + large ecosystem?
  → YES: React Native (58x more StackOverflow data)
  → NO: Capacitor (simpler, fewer LOC)
```

### Updated Recommendation (Dec 2025)

Based on verified ecosystem metrics, **React Native's larger ecosystem** (5x npm downloads, 58x StackOverflow questions) provides significant advantages for AI-assisted development:

1. **More training data** → AI handles edge cases better
2. **Native performance** → 60fps animations with native driver
3. **Expo ecosystem** → 10M+ downloads/month for rapid prototyping

**Capacitor remains best for:**
- Web-first apps that need mobile deployment
- Teams with strong web/HTML backgrounds
- Projects requiring browser + native from same codebase

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
