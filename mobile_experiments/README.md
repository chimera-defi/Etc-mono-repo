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

**Key Finding**: Cursor has no public API. Build custom agent using Claude API + Flutter/React Native.

---

## Frameworks

| Framework | Language | Status | Tests | Quick Start |
|-----------|----------|--------|-------|-------------|
| [Capacitor](./Capacitor/) | TypeScript | ✅ Complete | ✅ 4/4 | `cd Capacitor/app && npm run dev` |
| [React Native](./ReactNative/) | TypeScript | ✅ Complete | ✅ 3/3 | `cd ReactNative/app/ValdiParity && npm start` |
| [Flutter](./Flutter/) | Dart | ✅ Complete | ✅ 3/3 | `cd Flutter/app && flutter run` |
| [Valdi](./Valdi/) | TypeScript | ⚠️ Needs CLI | — | `valdi hotreload` |

## AI Development Scores

| Framework | Score | Best For |
|-----------|-------|----------|
| **Capacitor** | 4.9/5 | Web devs, browser + mobile |
| **React Native** | 4.25/5 | Native perf + large ecosystem |
| **Flutter** | 4.05/5 | Best raw performance |
| **Valdi** | 2.95/5 | Snapchat ecosystem |

## Quick Decision Guide

```
Have existing web app?
  → YES: Capacitor (wrap it)
  → NO: Continue

Need same code in browser?
  → YES: Capacitor
  → NO: Continue

Need native 60fps performance?
  → YES: Flutter
  → NO: React Native or Capacitor
```

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
