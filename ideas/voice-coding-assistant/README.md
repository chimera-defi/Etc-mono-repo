# Vox: Voice-Enabled AI Coding Assistant 🎤🤖

> **The first mobile-native AI coding assistant with voice interface**
>
> Built on Claude Agent SDK | Status: **Architecture Complete** | Decision: **CONDITIONAL GO**

---

## 📁 Documentation Map

```
voice-coding-assistant/
│
├── README.md                    ← You are here (start here)
│
├── 01-planning/                 # Business & Strategy
│   ├── EXECUTIVE_SUMMARY.md     # 5-min overview for decision makers
│   ├── RISK_ANALYSIS_AND_VIABILITY.md  # Comprehensive risk assessment
│   └── PITCH_DECK_GUIDE.md      # Investor presentation guide
│
├── 02-architecture/             # Technical Design
│   ├── CONSOLIDATED_OVERVIEW.md # Technical architecture source of truth
│   ├── ARCHITECTURE_DIAGRAMS.md # System flows, data models
│   ├── ARCHITECTURE_REVIEW.md   # Unknown unknowns, gaps, missing pieces
│   └── CONSOLIDATED_CLAUDE_ARCHITECTURE.md  # Cursor → Claude SDK mapping
│
├── 03-development/              # Implementation
│   ├── DEVELOPMENT_KICKOFF.md   # Task breakdown, prompts, Claude AI setup
│   ├── TECHNICAL_DECISIONS_REVIEW.md  # All 12 tech decisions validated
│   ├── MARKET_RESEARCH_AND_FEATURE_PARITY.md  # Cursor feature parity
│   └── STT_WISPR_FLOW_QUALITY.md # Whisper API specs, 95-98% accuracy
│
├── 04-design/                   # UI/UX
│   └── UI_WIREFRAMES.md         # 10 screen mockups
│
├── pitch-deck/                  # Investor Materials
│   └── ...                      # LaTeX + HTML presentations
│
└── assets/                      # Screenshots, images
    └── ...
```

---

## 🎯 Reading Order

| Audience | Start Here | Then Read | Time |
|----------|------------|-----------|------|
| **Decision makers** | [Executive Summary](./01-planning/EXECUTIVE_SUMMARY.md) | [Risk Analysis](./01-planning/RISK_ANALYSIS_AND_VIABILITY.md) | 15 min |
| **Investors** | [Pitch Deck](./pitch-deck/) | [Executive Summary](./01-planning/EXECUTIVE_SUMMARY.md) | 20 min |
| **Architects** | [Architecture Review](./02-architecture/ARCHITECTURE_REVIEW.md) | [Claude SDK Mapping](./02-architecture/CONSOLIDATED_CLAUDE_ARCHITECTURE.md) | 45 min |
| **Developers** | [Development Kickoff](./03-development/DEVELOPMENT_KICKOFF.md) | [Technical Decisions](./03-development/TECHNICAL_DECISIONS_REVIEW.md) | 60 min |
| **Everyone** | This README | All of the above | 2 hrs |

---

## 📱 What Are We Building?

A **mobile app** that lets developers:
- 🎤 **Code with voice** - 3.75x faster than typing (150 WPM vs 40 WPM)
- 📱 **Work anywhere** - Code on phone/tablet, not just desk
- 🤖 **AI agents** - Autonomous coding assistants powered by Claude Agent SDK
- 🔔 **Stay updated** - Real-time progress, push notifications

**Example:**
```
You:  🗣️ "Start an agent on wallet-frontend to add dark mode"
App:  🤖 "Analyzing codebase... Found React + TypeScript"
      🤖 "Creating DarkModeContext, updating theme..."
      (3 minutes later)
App:  📱 "Done! 4 files changed, +127 lines. PR ready."
```

**The Opportunity:** NO ONE offers mobile + voice + AI coding. We're first.

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | React Native + Expo SDK 52 | Cross-platform, fast iteration |
| **Backend** | Fastify 4 + **Claude Agent SDK** | AI-native architecture |
| **AI Core** | `@anthropic-ai/claude-agent-sdk` | Agent execution engine |
| **STT** | OpenAI Whisper API | 95-98% accuracy |
| **TTS** | expo-speech | On-device, <50ms latency |
| **Database** | PostgreSQL 16 (Neon) | Serverless, auto-scale |
| **State** | Zustand + TanStack Query | Lightweight, cached |
| **Auth** | OAuth 2.0 PKCE + GitHub | Secure, standard |

---

## 🔑 Key Documents

### Architecture (Most Important)

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | **Single-page architecture guide (START HERE)** |
| **[Architecture Review](./02-architecture/ARCHITECTURE_REVIEW.md)** | Unknown unknowns, critical gaps, what's missing |
| **[Claude SDK Mapping](./02-architecture/CONSOLIDATED_CLAUDE_ARCHITECTURE.md)** | How Cursor features map to Claude Agent SDK |
| **[Development Kickoff](./03-development/DEVELOPMENT_KICKOFF.md)** | Task breakdown, ideal prompts, Claude AI integration |

### Critical Findings

| Finding | Impact | Document |
|---------|--------|----------|
| ✅ **Execution: Fly.io → Hetzner VPS** | Decision made, ready to build | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Claude SDK covers 80%+ of Cursor** | Less custom code needed | [Claude SDK Mapping](./02-architecture/CONSOLIDATED_CLAUDE_ARCHITECTURE.md) |
| **7 critical feature gaps** | Must close for parity | [Market Research](./03-development/MARKET_RESEARCH_AND_FEATURE_PARITY.md) |
| **Cost underestimated 24x** | Pricing must be $15+/mo | [Risk Analysis](./01-planning/RISK_ANALYSIS_AND_VIABILITY.md) |

---

## ✅ Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Project name** | Vox | Voice-focused, memorable |
| **Execution (MVP)** | **Fly.io Machines** | 5x cheaper than Modal, Node.js native, warm machines |
| **Execution (Scale)** | Hetzner VPS per user | Zero cold start, predictable costs |
| **Real-time updates** | Supabase Realtime | WebSocket, free tier available |
| **STT** | OpenAI Whisper API | 95-98% accuracy |
| **TTS** | expo-speech | On-device, <50ms latency |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete technical decisions.

---

## 🚀 Next Steps

### Immediate (Ready to Start)
1. ✅ Project name decided: **Vox**
2. ✅ Execution platform decided: **Fly.io** (MVP) → **Hetzner VPS** (Scale)
3. ☐ Set up Fly.io account and deploy test container
4. ☐ Prototype voice → Whisper → Claude flow
5. ☐ Create Expo project scaffold

### Phase 1: Infrastructure (Weeks 1-3)
- Build ExecutionService (container provisioning)
- Build AgentOrchestrator (job queue, lifecycle)
- Build CodebaseAnalyzer (repo context)

### Phase 2: Mobile (Weeks 2-4)
- Expo project setup
- Voice recording + Whisper integration
- Agent list/detail UI

### Phase 3: Integration (Weeks 4-6)
- Voice → Agent creation flow
- Real-time status updates
- Push notifications

See [Development Kickoff](./03-development/DEVELOPMENT_KICKOFF.md) for complete task breakdown.

---

## 💰 Business Summary

| Metric | Value |
|--------|-------|
| **TAM** | 1.44M mobile-first developers |
| **Pricing** | Free / $15/mo Pro / $75/mo Enterprise |
| **Year 1 Target** | 5,000 users, $135K ARR |
| **Year 3 Target** | 50,000 users, $2.25M ARR |
| **LTV:CAC** | 6:1 |
| **Outcome** | Lifestyle business ($10K-50K MRR) |

See [Executive Summary](./01-planning/EXECUTIVE_SUMMARY.md) for full analysis.

---

## 🎯 Recommendation

**CONDITIONAL GO** - Proceed with reduced scope and clear decision gates.

| Gate | When | Criteria | Action |
|------|------|----------|--------|
| Alpha | Week 4 | 10 users, NPS >50 | Kill if not met |
| Beta | Week 8 | 100 users, WAU >30% | Kill if not met |
| Paid | Week 16 | Conversion >10%, $1K MRR | Kill if not met |

**Window:** 12-18 months before Cursor/Claude Code add mobile

---

**Status:** Architecture Complete ✅ | Ready for Prototyping 🔧

*Built with Claude Agent SDK for developers who want to code from anywhere*
