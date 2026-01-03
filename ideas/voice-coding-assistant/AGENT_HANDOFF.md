# Agent Handoff Document

> **Use this file to maintain continuity between agent sessions**

Last Updated: December 28, 2025
Current Status: **Backend Complete - Ready for iOS Development & Integration**
Approach: **Swift iOS App + Backend API + User's VPS**

---

## Current Direction (Dec 28, 2025)

**Major pivot:** Building a native Swift iOS app with a fully-featured backend API.

| Component | Status | Description |
|-----------|--------|-------------|
| `cadence-api` | ✅ Complete | Backend API with streaming, webhooks, tests |
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
│   iOS App (Swift)   │◄────►│   Backend API       │◄────►│   User's VPS        │
│                     │  WS  │   (Fastify)         │  SSE │   (Claude Code)     │
│ • Voice recording   │      │ • Task management   │      │ • Code execution    │
│ • Text input        │      │ • Whisper proxy     │      │ • Git operations    │
│ • WebSocket client  │      │ • WebSocket stream  │      │ • File editing      │
│ • Live streaming    │      │ • GitHub webhooks   │      │ • PR creation       │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

---

## Session Summary (Dec 28, 2025)

### New Features Added This Session

1. **WebSocket Streaming** - Real-time output from Claude to iOS app
   - `stream-manager.ts` - Subscription management
   - `websocket.ts` - WebSocket endpoint
   - Events: `task_started`, `tool_use`, `file_edit`, `command_run`, `output`, `error`, `task_completed`

2. **Text Input Support** - Keyboard input alongside voice
   - `input.ts` - Text input + direct command endpoints
   - `/api/input/text` - Accept keyboard text
   - `/api/input/command` - Direct command execution

3. **GitHub Webhooks** - Git workflow automation
   - `webhooks.ts` - PR event handlers
   - Signature verification (HMAC SHA-256)
   - @cadence-ai mention parsing
   - Auto-archive on PR merge

4. **VPS Bridge Streaming** - SSE parsing from VPS
   - `executeTaskStreaming()` - Stream events from VPS
   - Mock mode with realistic event simulation
   - Error handling and timeout support

5. **Comprehensive Test Suite**
   - `input.test.ts` - Text input tests
   - `stream-manager.test.ts` - WebSocket tests
   - `webhooks.test.ts` - Webhook tests
   - `vps-bridge.test.ts` - Streaming tests

---

## Components

### 1. Backend API (`cadence-api/`)

**Status:** ✅ Complete with streaming and webhooks

| File | Purpose |
|------|---------|
| `src/index.ts` | Fastify app entry |
| `src/types.ts` | Types + Zod schemas (StreamEvent, Task, Webhook types) |
| `src/routes/tasks.ts` | Task CRUD |
| `src/routes/voice.ts` | Transcription + parsing |
| `src/routes/input.ts` | **NEW:** Text input + commands |
| `src/routes/websocket.ts` | **NEW:** WebSocket streaming |
| `src/routes/webhooks.ts` | **NEW:** GitHub webhooks |
| `src/services/whisper.ts` | OpenAI Whisper integration |
| `src/services/command-parser.ts` | Voice → intent |
| `src/services/vps-bridge.ts` | **UPDATED:** Streaming support |
| `src/services/stream-manager.ts` | **NEW:** WebSocket subscriptions |
| `src/tests/*.test.ts` | Comprehensive test suite |

```bash
cd cadence-api
npm install
npm test        # Run all tests
npm run dev     # Start server
npm run typecheck  # TypeScript check
```

### 2. iOS App (`cadence-ios/`)

**Status:** 📋 Planned (see `cadence-ios/PLAN.md`)

| Component | Technology |
|-----------|------------|
| UI | SwiftUI (iOS 17+) |
| Audio | AVFoundation |
| WebSocket | URLSessionWebSocketTask |
| Networking | URLSession + async/await |
| State | @Observable |
| Storage | SwiftData + Keychain |

**Key Views Updated:**
- `InputView` - Combined voice + text input with segmented control
- `TaskDetailView` - Live streaming updates via WebSocket
- `WebSocketClient` - Real-time event subscription

### 3. VPS Setup (`cadence-setup/`)

**Status:** ✅ Complete

Bootstrap script that user runs on their VPS to set up Claude Code bridge.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| DELETE | `/api/tasks/:id` | Cancel task |
| POST | `/api/voice/transcribe` | Transcribe audio |
| POST | `/api/voice/parse` | Parse text to command |
| POST | `/api/voice/command` | Transcribe + parse |
| **POST** | `/api/input/text` | **Text input** |
| **POST** | `/api/input/command` | **Direct command** |
| **WS** | `/api/ws/stream` | **WebSocket streaming** |
| **POST** | `/api/webhooks/github` | **GitHub webhooks** |

---

## Agent Prompts for Parallel Development

**See: `AGENT-PROMPTS.md`** for self-contained prompts for 6 parallel agents:

| Agent | Focus | Can Run With |
|-------|-------|--------------|
| Agent 1 | Backend WebSocket Streaming | 2, 6 |
| Agent 2 | Backend GitHub Webhooks | 1, 6 |
| Agent 3 | iOS Voice Recording | 4, 5 |
| Agent 4 | iOS WebSocket Client | 3, 5 |
| Agent 5 | iOS Text Input | 3, 4 |
| Agent 6 | VPS Bridge Streaming | 1, 2 |

**Backend agents (1, 2, 6)** can run in parallel.
**iOS agents (3, 4, 5)** can run in parallel.
Cross-team integration requires backend running.

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
| **Streaming** | WebSocket (iOS) + SSE (VPS) | Real-time updates | Dec 28, 2025 |
| **Input** | Voice + Text | Flexibility for users | Dec 28, 2025 |

---

## Files Created/Modified This Session

| File | Change | Date |
|------|--------|------|
| `src/types.ts` | Added StreamEvent, TextInput, Webhook types | Dec 28, 2025 |
| `src/routes/input.ts` | **Created** - Text input + command endpoints | Dec 28, 2025 |
| `src/routes/websocket.ts` | **Created** - WebSocket streaming | Dec 28, 2025 |
| `src/routes/webhooks.ts` | **Created** - GitHub webhook handlers | Dec 28, 2025 |
| `src/services/stream-manager.ts` | **Created** - Subscription management | Dec 28, 2025 |
| `src/services/vps-bridge.ts` | **Updated** - Added streaming support | Dec 28, 2025 |
| `src/tests/input.test.ts` | **Created** - Input endpoint tests | Dec 28, 2025 |
| `src/tests/stream-manager.test.ts` | **Created** - Streaming tests | Dec 28, 2025 |
| `src/tests/webhooks.test.ts` | **Created** - Webhook tests | Dec 28, 2025 |
| `src/tests/vps-bridge.test.ts` | **Created** - VPS bridge tests | Dec 28, 2025 |
| `cadence-ios/PLAN.md` | **Updated** - Added WebSocket, TextInput, streaming | Dec 28, 2025 |
| `AGENT-PROMPTS.md` | **Created** - 6 agent prompts for parallel dev | Dec 28, 2025 |
| `AGENT_HANDOFF.md` | **Updated** - Full session summary | Dec 28, 2025 |

---

## Next Steps

### Immediate (Pick from Agent Prompts)

**Option A: Start iOS Development**
1. Copy Agent 3 prompt → Create Xcode project + voice recording
2. Copy Agent 4 prompt → Add WebSocket client
3. Copy Agent 5 prompt → Add text input
4. Integration test with running backend

**Option B: Complete Backend**
1. Copy Agent 1 prompt → Verify WebSocket streaming
2. Copy Agent 2 prompt → Complete GitHub webhook features
3. Copy Agent 6 prompt → Production VPS bridge

**Option C: Parallel Development**
- Run Agents 1, 2, 6 simultaneously (backend)
- Run Agents 3, 4, 5 simultaneously (iOS)
- Integrate when both complete

### Future Enhancements

1. **Database** - Replace in-memory with PostgreSQL
2. **Authentication** - GitHub OAuth
3. **Deployment** - Vercel or Railway for backend
4. **TestFlight** - iOS app distribution

---

## Required API Keys

```bash
# Anthropic (Claude Code on VPS)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Whisper - for voice)
OPENAI_API_KEY=sk-...

# GitHub (Webhooks - optional)
GITHUB_WEBHOOK_SECRET=your-secret
```

---

## Test Commands

```bash
# Backend tests
cd cadence-api
npm test                    # All tests
npm test -- --grep stream   # Streaming tests
npm test -- --grep webhook  # Webhook tests
npm test -- --grep input    # Input tests
npm run typecheck           # TypeScript

# Manual API testing
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/input/text \
  -H "Content-Type: application/json" \
  -d '{"text": "add dark mode to settings"}'
```

---

## Deprecated Components

The following were created during earlier iterations but are now superseded:

| Component | Reason | Replacement |
|-----------|--------|-------------|
| `cadence-web/` | Web prototype | Swift iOS app |
| React Native plans | Cross-platform not needed | Swift native |

---

**Document Version:** 4.0
**Created:** December 28, 2025
**Updated:** December 28, 2025 - Added streaming, text input, webhooks, agent prompts
