# Agent App

A native, high-performance mobile app for AI Coding Agents.

## Goal

Create a mobile app with feature parity to Cursor Agents / Background Agents:
- 📱 Native performance (60fps, smooth interactions)
- ⚡ Real-time agent task monitoring
- 📝 Code viewing and diff display
- 🔀 Git operations and PR management
- 🍎🤖 Cross-platform (iOS & Android)

---

## Current Status: Ready for Implementation

| Phase | Status | Document |
|-------|--------|----------|
| ✅ Research | Complete | See Research Documents below |
| ✅ Architecture Decisions | Complete | [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) |
| ✅ System Design | Complete | [FINAL_ARCHITECTURE.md](./FINAL_ARCHITECTURE.md) |
| ✅ Detailed Design | Complete | [DETAILED_DESIGN.md](./DETAILED_DESIGN.md) |
| ✅ Mobile App Design | Complete | [MOBILE_APP_DESIGN.md](./MOBILE_APP_DESIGN.md) |
| ✅ Agent Worker Design | Complete | [AGENT_WORKER_DESIGN.md](./AGENT_WORKER_DESIGN.md) |
| ✅ Task Breakdown | Complete | [TASKS.md](./TASKS.md) |
| ⏳ **Open Questions** | **19 pending** | [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md) |
| ⬜ Implementation | Not started | — |

---

## Key Documents

### 📋 Implementation Guides (Start Here)

| Document | Description |
|----------|-------------|
| [**OPEN_QUESTIONS.md**](./OPEN_QUESTIONS.md) | ❓ **19 decisions needed before coding** |
| [**TASKS.md**](./TASKS.md) | 📝 132 tasks across 8 epics (~27 days) |
| [**FINAL_ARCHITECTURE.md**](./FINAL_ARCHITECTURE.md) | 🏗️ System architecture diagram + tech stack |

### 🎨 Design Documents

| Document | Description |
|----------|-------------|
| [MOBILE_APP_DESIGN.md](./MOBILE_APP_DESIGN.md) | 📱 Screens, UX, performance, offline support |
| [AGENT_WORKER_DESIGN.md](./AGENT_WORKER_DESIGN.md) | 🤖 AI agent loop, tools, Claude integration |
| [DETAILED_DESIGN.md](./DETAILED_DESIGN.md) | 🔧 Components, data models, API contracts |

### 🔬 Research Documents

| Document | Description |
|----------|-------------|
| [CURSOR_API_RESEARCH.md](./CURSOR_API_RESEARCH.md) | Cursor API availability (none) |
| [ALTERNATIVES_ANALYSIS.md](./ALTERNATIVES_ANALYSIS.md) | Alternative AI agents compared |
| [CLAUDE_API_CAPABILITIES.md](./CLAUDE_API_CAPABILITIES.md) | Claude API deep dive |
| [FRAMEWORK_RECOMMENDATION.md](./FRAMEWORK_RECOMMENDATION.md) | Why React Native |
| [INFRASTRUCTURE_COMPARISON.md](./INFRASTRUCTURE_COMPARISON.md) | Compute/DB options |
| [BUILD_VS_BUY_ANALYSIS.md](./BUILD_VS_BUY_ANALYSIS.md) | Self-hosted vs managed |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                           │
│                 (React Native + Expo)                   │
│  • Login, Projects, Chat, History, Settings screens    │
│  • WebSocket for real-time updates                     │
│  • Offline queue for reliability                       │
└─────────────────────┬───────────────────────────────────┘
                      │ WSS
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 COORDINATOR SERVER                      │
│                    (Bun + Hono)                         │
│  • REST API + WebSocket server                         │
│  • SQLite database                                     │
│  • Docker container spawner                            │
└─────────────────────┬───────────────────────────────────┘
                      │ Docker
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  WORKER CONTAINER                       │
│  • Claude API client                                   │
│  • Tools: read_file, write_file, run_command, etc.    │
│  • Git: clone, commit, push, create PR                │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile | React Native + Expo 54 |
| State | Zustand + React Query |
| Server | Bun + Hono |
| Database | SQLite |
| Containers | Docker + dockerode |
| AI | Claude API (Anthropic) |
| Auth | GitHub OAuth + JWT |

---

## Estimated Timeline

| Phase | Days | What |
|-------|------|------|
| Server Setup | 2 | Bun, Hono, SQLite, health checks |
| Authentication | 2.5 | GitHub OAuth, JWT, API key encryption |
| Task Management | 3 | CRUD, queue, status tracking |
| Docker Integration | 4 | Spawner, lifecycle, cleanup |
| Agent Worker | 5 | Claude client, tools, git operations |
| Real-time | 2 | WebSocket server + broadcasting |
| Mobile App | 6 | All screens, offline support |
| Testing | 2.5 | Unit, integration, E2E |
| **Total** | **~27 days** | (Can be reduced with parallel work) |

**Critical path MVP**: ~14-18 days

---

## Cost Estimate

| Item | Monthly Cost |
|------|-------------|
| VPS (Hetzner CX22) | $4-6 |
| Domain | ~$1 |
| **Server Total** | **~$6/mo** |
| Claude API | User pays (BYOK) |

---

## Next Steps

1. **Answer open questions** → [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md)
   - 19 decisions needed (or say "use all recommendations")
   
2. **Begin implementation** → [TASKS.md](./TASKS.md)
   - Start with Epic 1 (Server Setup)
   - Can parallelize Mobile App work

---

## Quick Answer Option

If you want to proceed quickly:

> **"Use all recommendations and start implementation"**

This will:
- Accept all 19 recommended decisions
- Begin scaffolding the project

---

**Last Updated**: December 2025
