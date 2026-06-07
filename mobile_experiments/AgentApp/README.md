# Agent App

Native mobile app for AI coding agents. Self-hosted alternative to Cursor Agents.

---

## Documents

| # | Document | Contents |
|---|----------|----------|
| 01 | [Research](./01_RESEARCH.md) | Why Claude API, why React Native, market gap |
| 02 | [Architecture](./02_ARCHITECTURE.md) | System diagram, tech stack, 15 decisions |
| 03 | [Design](./03_DESIGN.md) | Mobile screens, server components, agent loop, tools |
| 04 | [Implementation](./04_IMPLEMENTATION.md) | **19 open questions**, 132 tasks, timeline |

---

## Quick Summary

### What We're Building

```
Mobile App (React Native)
    │
    │ WebSocket
    ▼
Coordinator (Bun + Hono + SQLite)
    │
    │ Docker
    ▼
Worker Container (Claude API + Tools + Git)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo |
| Server | Bun + Hono |
| Database | SQLite |
| Containers | Docker |
| AI | Claude API (BYOK) |

### Cost

~$6/mo VPS + user's Claude API costs

### Timeline

~14-18 days MVP (with parallel work)

---

## Current Status

| Phase | Status |
|-------|--------|
| Research | ✅ Complete |
| Architecture | ✅ Complete |
| Design | ✅ Complete |
| **Open Questions** | ⏳ **19 pending** |
| Implementation | ⬜ Not started |

---

## Next Step

Review [04_IMPLEMENTATION.md](./04_IMPLEMENTATION.md) and either:

1. **Answer 19 questions individually**, or
2. Say **"Use all recommendations"** to accept defaults

Then we scaffold the code.

---

**Files:** 5 (down from 23)  
**Last Updated:** December 2025
