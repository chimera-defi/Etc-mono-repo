# Cadence: Voice-Enabled AI Coding Assistant

> **The first mobile-native AI coding assistant with voice interface**
>
> React Native + Expo | Claude Agent SDK | Status: **Ready for Implementation**

---

## What is Cadence?

A **mobile app** that lets developers:
- **Code with voice** - 3.75x faster than typing (150 WPM vs 40 WPM)
- **Work anywhere** - Code on phone/tablet, not just desk
- **AI agents** - Autonomous coding assistants powered by Claude Agent SDK
- **Stay updated** - Real-time progress, push notifications

**Example:**
```
You:  "Start an agent on wallet-frontend to add dark mode"
App:  "Analyzing codebase... Found React + TypeScript"
      "Creating DarkModeContext, updating theme..."
      (3 minutes later)
App:  "Done! 4 files changed, +127 lines. PR ready."
```

**The Opportunity:** NO ONE offers mobile + voice + AI coding. We're first.

---

## Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** | **START HERE** - Task breakdown, code samples | 20 min |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete technical reference | 30 min |
| [01-business/EXECUTIVE_SUMMARY.md](./01-planning/EXECUTIVE_SUMMARY.md) | Business overview, financials | 10 min |
| [01-business/RISK_ANALYSIS.md](./01-planning/RISK_ANALYSIS_AND_VIABILITY.md) | Risks, competitor analysis | 20 min |
| [02-design/UI_WIREFRAMES.md](./04-design/UI_WIREFRAMES.md) | 10 screen mockups | 10 min |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | React Native + Expo SDK 52 | Cross-platform, fast iteration |
| **Backend** | Fastify 4 + **Claude Agent SDK** | AI-native architecture |
| **AI Core** | `@anthropic-ai/claude-code` | Agent execution engine |
| **STT** | OpenAI Whisper API | 95-98% accuracy |
| **TTS** | expo-speech | On-device, <50ms latency |
| **Database** | PostgreSQL 16 (Neon) | Serverless, auto-scale |
| **State** | Zustand + TanStack Query | Lightweight, cached |
| **Auth** | OAuth 2.0 PKCE + GitHub | Secure, standard |

---

## Feature Parity with Cursor/Claude Code

### What We Match:
| Feature | Cursor | Claude Code | Cadence |
|---------|--------|-------------|---------|
| Create AI agents | ✅ | ✅ | ✅ |
| Execute on repos | ✅ | ✅ | ✅ |
| File read/write | ✅ | ✅ | ✅ |
| Git operations | ✅ | ✅ | ✅ |
| Real-time status | ✅ | ✅ | ✅ |
| Pause/resume | ✅ | ✅ | ✅ |
| Multi-model | ✅ | ✅ | ✅ |
| Codebase context | ✅ | ✅ | ✅ (via CodebaseAnalyzer) |

### Our Unique Advantages:
| Feature | Cursor | Claude Code | Cadence |
|---------|--------|-------------|---------|
| **Voice input** | ❌ | ❌ | ✅ |
| **Voice output** | ❌ | ❌ | ✅ |
| **Mobile-native** | ❌ | ⚠️ Basic | ✅ Full |
| **Push notifications** | ❌ | ❌ | ✅ |
| **Offline viewing** | ❌ | ❌ | ✅ |
| **Price** | $20/mo | $20/mo | $15/mo |

---

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0: Foundation** | Week 1 | Expo project, folder structure |
| **1: Auth** | Week 2 | GitHub OAuth, token storage |
| **2: Voice** | Weeks 3-4 | Whisper STT, expo-speech TTS |
| **3: Agents** | Weeks 5-6 | Agent CRUD, command parsing |
| **4: Backend** | Weeks 5-7 | Claude SDK, Fly.io execution |
| **5: Context** | Weeks 7-8 | CodebaseAnalyzer |
| **6: Real-time** | Weeks 8-9 | Polling, push notifications |
| **7: Polish** | Weeks 10-11 | Testing, error handling |
| **8: Launch** | Week 12 | App store prep |

**Total: 12 weeks to MVP**

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed task breakdown.

---

## Decision Gates

| Gate | When | Kill Criteria |
|------|------|---------------|
| **Alpha** | Week 4 | NPS < 50, Voice accuracy < 90% |
| **Beta** | Week 8 | WAU < 30%, < 100 users |
| **Paid** | Week 16 | Conversion < 10%, MRR < $1K |

---

## Quick Start

```bash
# Mobile app
npx create-expo-app@latest cadence --template expo-template-blank-typescript
cd cadence

# Install dependencies
npx expo install expo-speech expo-av expo-secure-store expo-notifications
npm install zustand @tanstack/react-query axios

# Start development
npx expo start
```

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for full setup instructions.

---

## Business Summary

| Metric | Value |
|--------|-------|
| **TAM** | 1.44M mobile-first developers |
| **Pricing** | Free / $15/mo Pro / $75/mo Enterprise |
| **Year 1 Target** | 5,000 users, $135K ARR |
| **Gross Margin** | 35% → 60% (optimizing) |
| **Outcome** | Lifestyle business ($10K-50K MRR) |

---

## Documentation Structure

```
voice-coding-assistant/
├── README.md                 ← You are here
├── IMPLEMENTATION.md         ← Task breakdown (START HERE)
├── ARCHITECTURE.md           ← Technical reference
├── 01-planning/
│   ├── EXECUTIVE_SUMMARY.md  ← Business overview
│   └── RISK_ANALYSIS_AND_VIABILITY.md
├── 04-design/
│   └── UI_WIREFRAMES.md      ← Screen mockups
└── pitch-deck/               ← Investor materials
```

---

**Status:** Ready for Implementation
**Decision:** CONDITIONAL GO with decision gates
**Window:** 12-18 months before Cursor/Claude Code add mobile

*Built with Claude Agent SDK for developers who want to code from anywhere*
