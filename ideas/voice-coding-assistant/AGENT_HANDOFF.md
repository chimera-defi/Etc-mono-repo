# Agent Handoff Document

> **Use this file to maintain continuity between agent sessions**

Last Updated: December 28, 2025
Current Sprint: **Sprint 0 - Validation**
Status: **Ready to Begin**

---

## Pre-Flight Checklist

Before starting any work, verify your environment:

```bash
# 1. Check Node.js version (need 20+)
node --version

# 2. Verify you're in the right directory
pwd
# Should be: .../Etc-mono-repo/ideas/voice-coding-assistant

# 3. Check that scaffold directories exist
ls -la cadence-prototype/ cadence-backend/ cadence-app/

# 4. Read the documentation
# - AGENT-PROMPTS-QUICKREF.md (your task breakdown)
# - IMPLEMENTATION.md (detailed specs)
# - ARCHITECTURE.md (technical decisions)
```

---

## Current Status

### Sprint 0: Validation Prototype

| Task ID | Task | Status | Assignee |
|---------|------|--------|----------|
| V-01 | Create prototype project | Not Started | - |
| V-02 | Implement Whisper transcription | Not Started | - |
| V-03 | Implement Claude Agent wrapper | Not Started | - |
| V-04 | Create end-to-end CLI | Not Started | - |
| V-05 | Record 5 test voice commands | Not Started | - |
| V-06 | Run validation tests | Not Started | - |
| V-07 | Document results | Not Started | - |

### Sprint 1: Backend Foundation

| Task ID | Task | Status | Assignee |
|---------|------|--------|----------|
| B-01 | Initialize backend project | Not Started | - |
| B-02 | Create project structure | Not Started | - |
| B-03 | Implement health routes | Not Started | - |
| B-04 | Implement database schema | Not Started | - |
| B-05 | Implement GitHub OAuth | Not Started | - |
| B-06 | Implement JWT middleware | Not Started | - |
| B-07 | Set up Redis | Not Started | - |
| B-08 | Set up BullMQ | Not Started | - |
| B-09 | Create Dockerfile | Not Started | - |

### Sprint 2: Mobile Shell

| Task ID | Task | Status | Assignee |
|---------|------|--------|----------|
| M-01 | Create Expo project | Not Started | - |
| M-02 | Create folder structure | Not Started | - |
| M-03 | Configure navigation | Not Started | - |
| M-04 | Create Zustand stores | Not Started | - |
| M-05 | Implement GitHub OAuth | Not Started | - |
| M-06 | Create login screen | Not Started | - |
| M-07 | Implement secure storage | Not Started | - |
| M-08 | Create navigation guards | Not Started | - |

---

## Known Issues & Workarounds

### None Yet

*Issues will be documented here as they're discovered*

---

## Architecture Decisions Made

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Mobile Framework | React Native + Expo | Cross-platform, fast iteration | Dec 26, 2025 |
| Backend | Fastify + TypeScript | Fast, type-safe | Dec 26, 2025 |
| STT Provider | OpenAI Whisper | Best accuracy | Dec 26, 2025 |
| TTS Provider | expo-speech | On-device, low latency | Dec 26, 2025 |
| Execution (MVP) | Fly.io Machines | Simple, pay-per-use | Dec 27, 2025 |
| Execution (Scale) | Hetzner VPS | Zero cold start | Dec 27, 2025 |

---

## Environment Setup

### Required API Keys

```bash
# Anthropic (Claude Agent SDK)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Whisper STT)
OPENAI_API_KEY=sk-...

# GitHub OAuth App
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Recommended Development Tools

- VS Code or Cursor
- Node.js 20+
- Expo CLI
- iOS Simulator (Xcode) or Android Studio
- Postman/Insomnia for API testing

---

## Definition of Done

A task is complete when:

1. **Code works:** Compiles, runs, no errors
2. **Tests pass:** Unit tests with 80%+ coverage
3. **Verified locally:** Manually tested
4. **Documentation updated:** README, comments
5. **Review complete:** 5-perspective checklist passed
6. **Committed:** Clean commit message

---

## Next Agent Instructions

### If Starting Sprint 0 (Validation):

1. Read `AGENT-PROMPTS-QUICKREF.md` - Prompt 1
2. Create the prototype in `cadence-prototype/`
3. Complete tasks V-01 through V-07
4. Update this file with results
5. Make GO/NO-GO recommendation

### If Sprint 0 Passed, Starting Sprint 1 or 2:

1. Read `AGENT-PROMPTS-QUICKREF.md` - Prompt 2 or 3
2. Can run Sprint 1 and 2 in parallel
3. Complete all tasks in the sprint
4. Update this file with status
5. Push code to repository

---

## Files Modified This Session

*List files you modified so the next agent knows what changed*

| File | Change | Date |
|------|--------|------|
| AGENT-PROMPTS-QUICKREF.md | Created | Dec 28, 2025 |
| AGENT_HANDOFF.md | Created | Dec 28, 2025 |
| cadence-prototype/README.md | Created | Dec 28, 2025 |
| cadence-backend/README.md | Created | Dec 28, 2025 |
| cadence-app/README.md | Created | Dec 28, 2025 |

---

## Contact / Escalation

If blocked or need clarification:
- Review IMPLEMENTATION.md first
- Check ARCHITECTURE.md for technical decisions
- Document the issue in this file
- Flag as blocker in task status

---

**Document Version:** 1.0
**Created:** December 28, 2025
