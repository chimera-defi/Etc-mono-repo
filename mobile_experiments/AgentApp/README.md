# Agent App

Native mobile app for AI coding agents. Self-hosted, privacy-focused alternative to Cursor Agents.

## Status

| Phase | Status |
|-------|--------|
| Research | ✅ Complete |
| Architecture | ✅ Complete |
| Design | ✅ Complete |
| Open Questions | ⏳ 19 pending decisions |
| Implementation | ⬜ Not started |

---

## Documents (Numbered)

### 📚 1. Research

| # | Document | Summary |
|---|----------|---------|
| 1.1 | [CURSOR_API_RESEARCH](./CURSOR_API_RESEARCH.md) | Cursor has no public API |
| 1.2 | [ALTERNATIVES_ANALYSIS](./ALTERNATIVES_ANALYSIS.md) | Claude API is best option |
| 1.3 | [CLAUDE_API_CAPABILITIES](./CLAUDE_API_CAPABILITIES.md) | Tool use, streaming, models |
| 1.4 | [FRAMEWORK_RECOMMENDATION](./FRAMEWORK_RECOMMENDATION.md) | React Native + Expo chosen |
| 1.5 | [COMPETITIVE_ANALYSIS](./COMPETITIVE_ANALYSIS.md) | Market gap analysis |
| 1.6 | [INFRASTRUCTURE_COMPARISON](./INFRASTRUCTURE_COMPARISON.md) | Platform options (verified data) |

### 🏗️ 2. Architecture

| # | Document | Summary |
|---|----------|---------|
| 2.1 | [ARCHITECTURE_DECISIONS](./ARCHITECTURE_DECISIONS.md) | All 15 decisions made |
| 2.2 | [FINAL_ARCHITECTURE](./FINAL_ARCHITECTURE.md) | System diagram + tech stack |

### 🎨 3. Design

| # | Document | Summary |
|---|----------|---------|
| 3.1 | [DETAILED_DESIGN](./DETAILED_DESIGN.md) | Components, APIs, data models |
| 3.2 | [MOBILE_APP_DESIGN](./MOBILE_APP_DESIGN.md) | Screens, UX, performance |
| 3.3 | [AGENT_WORKER_DESIGN](./AGENT_WORKER_DESIGN.md) | AI agent loop, tools |

### 📋 4. Implementation

| # | Document | Summary |
|---|----------|---------|
| 4.1 | [OPEN_QUESTIONS](./OPEN_QUESTIONS.md) | **19 decisions needed** |
| 4.2 | [TASKS](./TASKS.md) | 132 tasks, 8 epics |

### 📝 5. Meta

| # | Document | Summary |
|---|----------|---------|
| 5.1 | [ERRATA](./ERRATA.md) | Corrections made |

---

## Quick Summary

### What We're Building

```
┌─────────────────────────────────────────────────┐
│             MOBILE APP (React Native)           │
│   Login → Projects → Chat → View Results        │
└──────────────────────┬──────────────────────────┘
                       │ WebSocket
                       ▼
┌─────────────────────────────────────────────────┐
│           COORDINATOR SERVER (Bun + Hono)       │
│   REST API + WebSocket + SQLite + Docker        │
└──────────────────────┬──────────────────────────┘
                       │ Docker
                       ▼
┌─────────────────────────────────────────────────┐
│              WORKER CONTAINER                   │
│   Claude API + Tools + Git Operations           │
└─────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo |
| Server | Bun + Hono |
| Database | SQLite |
| Containers | Docker |
| AI | Claude API (user's key) |
| Auth | GitHub OAuth + JWT |

### Cost

| Item | Cost |
|------|------|
| VPS (Hetzner) | ~$6/mo |
| Claude API | User pays (BYOK) |

### Timeline

| Phase | Days |
|-------|------|
| Backend (Server + Docker + Agent) | 8-10 |
| Mobile App | 5-6 |
| Testing | 2-3 |
| **Total** | **~14-18 days** |

---

## Next Steps

### Option A: Answer Questions Individually

Review [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md) and provide decisions for all 19 items.

### Option B: Use All Recommendations

Say **"Use all recommendations"** to accept defaults and start implementation.

---

## Key Decisions Made

| Decision | Choice |
|----------|--------|
| Framework | React Native + Expo |
| Backend | Bun + Hono (self-hosted) |
| Database | SQLite |
| Workers | Docker containers |
| AI | Claude API (BYOK) |
| Auth | GitHub OAuth |
| Real-time | WebSocket |

---

**Files**: 15 documents  
**Deleted**: 8 duplicate files  
**Last Updated**: December 2025
