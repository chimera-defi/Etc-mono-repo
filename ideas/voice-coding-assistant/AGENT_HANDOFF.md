# Agent Handoff Document

> **Use this file to maintain continuity between agent sessions**

Last Updated: December 28, 2025
Current Status: **Planning Complete - Ready for iOS Development**
Approach: **Swift iOS App + Backend API + User's VPS**

---

## Current Direction (Dec 28, 2025)

**Major pivot:** Building a native Swift iOS app instead of React Native or web interface.

| Component | Status | Description |
|-----------|--------|-------------|
| `cadence-api` | ✅ Scaffolded | Backend API with tests (Fastify + TypeScript) |
| `cadence-ios` | 📋 Planned | Native Swift/SwiftUI iOS app |
| `cadence-setup` | ✅ Complete | VPS bootstrap script |

### Why Swift over React Native?

| Factor | Swift | React Native |
|--------|-------|--------------|
| **Voice APIs** | ✅ Native AVFoundation | ⚠️ Wrapper libraries |
| **Performance** | ✅ No JS bridge | ⚠️ Bridge overhead |
| **iOS Integration** | ✅ Siri, Widgets, Shortcuts | ⚠️ Limited |
| **Target Audience** | ✅ iOS developers | - |

**Decision:** Native Swift for best voice experience. iOS-only for MVP.

---

## Architecture Overview

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   iOS App (Swift)   │ ──── │   Backend API       │ ──── │   User's VPS        │
│                     │      │   (Fastify)         │      │   (Claude Code)     │
│ • Voice recording   │      │ • Task management   │      │ • Code execution    │
│ • AVFoundation      │      │ • Whisper proxy     │      │ • Git operations    │
│ • SwiftUI           │      │ • VPS bridge        │      │ • File editing      │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

---

## Components

### 1. Backend API (`cadence-api/`)

**Status:** ✅ Scaffolded with tests

| File | Purpose |
|------|---------|
| `src/index.ts` | Fastify app entry |
| `src/routes/tasks.ts` | Task CRUD |
| `src/routes/voice.ts` | Transcription + parsing |
| `src/services/whisper.ts` | OpenAI Whisper integration |
| `src/services/command-parser.ts` | Voice → intent |
| `src/services/vps-bridge.ts` | Forward to user's VPS |
| `src/tests/*.test.ts` | Vitest test suite |

```bash
cd cadence-api
npm install
npm test        # Run tests
npm run dev     # Start server
```

### 2. iOS App (`cadence-ios/`)

**Status:** 📋 Planned (see `cadence-ios/PLAN.md`)

| Component | Technology |
|-----------|------------|
| UI | SwiftUI (iOS 17+) |
| Audio | AVFoundation |
| Networking | URLSession + async/await |
| State | @Observable |
| Storage | SwiftData + Keychain |

**Implementation phases:**
1. Core voice recording (Week 1)
2. API integration (Week 1-2)
3. Task management (Week 2)
4. Settings & VPS setup (Week 2-3)
5. Polish & TestFlight (Week 3)

### 3. VPS Setup (`cadence-setup/`)

**Status:** ✅ Complete

Bootstrap script that user runs on their VPS to set up Claude Code bridge.

---

## Pre-Flight Checklist

```bash
# 1. Check Node.js version (need 20+)
node --version

# 2. Verify directory
pwd
# Should be: .../Etc-mono-repo/ideas/voice-coding-assistant

# 3. Check components exist
ls cadence-api/ cadence-ios/ cadence-setup/

# 4. API tests pass
cd cadence-api && npm install && npm test
```

---

## Architecture Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| iOS Framework | **Swift + SwiftUI** | Native voice APIs, best UX | Dec 28, 2025 |
| Backend | Fastify + TypeScript | Fast, type-safe | Dec 28, 2025 |
| STT | OpenAI Whisper API | 98% accuracy | Dec 28, 2025 |
| TTS | AVSpeechSynthesizer | Native, free | Dec 28, 2025 |
| Execution | User's VPS + Claude Code | User controls environment | Dec 28, 2025 |
| Auth | API key + Keychain | Simple, secure | Dec 28, 2025 |

---

## Files Created/Modified This Session

| File | Change | Date |
|------|--------|------|
| ARCHITECTURE.md | Updated for Swift | Dec 28, 2025 |
| cadence-api/* | Created backend scaffold | Dec 28, 2025 |
| cadence-ios/PLAN.md | Created Swift implementation plan | Dec 28, 2025 |
| AGENT_HANDOFF.md | Updated for new direction | Dec 28, 2025 |

---

## Next Steps

### Immediate (iOS Development)

1. **Create Xcode project** - New SwiftUI app targeting iOS 17+
2. **Implement AudioRecorder** - AVAudioRecorder wrapper
3. **Build VoiceView** - Record button + waveform
4. **Integrate with API** - Transcription endpoint
5. **Add task management** - List + detail views

### Backend Improvements

1. **WebSocket support** - Real-time task updates
2. **Database** - Replace in-memory with PostgreSQL
3. **Authentication** - GitHub OAuth
4. **Deployment** - Vercel or Railway

---

## Required API Keys

```bash
# Anthropic (Claude Code on VPS)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Whisper - for voice)
OPENAI_API_KEY=sk-...
```

---

## Deprecated Components

The following were created during earlier iterations but are now superseded:

| Component | Reason | Replacement |
|-----------|--------|-------------|
| `cadence-web/` | Web prototype | Swift iOS app |
| React Native plans | Cross-platform not needed | Swift native |

---

**Document Version:** 3.0
**Created:** December 28, 2025
**Updated:** December 28, 2025 - Swift iOS app direction
