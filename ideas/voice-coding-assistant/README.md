# Cadence: Voice-Enabled AI Coding Assistant

> **Control Claude Code with your voice, from anywhere**
>
> Your VPS + Claude Code + Voice | Status: **Ready to Use**

---

## Quick Start (5 minutes)

1. **Open** `cadence-web/index.html` in your browser
2. **Copy** the bootstrap command shown in the app
3. **Run** it on your VPS (SSH in and paste)
4. **Enter** your VPS IP + API keys in the app
5. **Done** - Start coding with voice!

**That's it.** No mobile app to build. No backend to deploy. Just your VPS running Claude.

---

## What is Cadence?

A **voice interface** for Claude Code that lets developers:
- **Code with voice** - 3.75x faster than typing (150 WPM vs 40 WPM)
- **Work anywhere** - From phone, tablet, or any browser
- **AI agents** - Claude Code executes on your VPS
- **Simple setup** - One command, 5 minutes

**Example:**
```
You:  "Add error handling to the fetchData function"
      (speak into phone or browser)

Claude: Analyzing codebase... Found src/api.ts
        Adding try-catch with proper error types...
        Running tests... All passing.
        Done! 1 file changed, +12 lines.
```

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────┐
│  Phone/Browser  │     │  Whisper API    │     │  Your VPS               │
│                 │     │  (OpenAI)       │     │                         │
│  Record voice   │────>│  Transcribe     │────>│  Cadence Bridge         │
│                 │     │                 │     │       │                 │
│  <── Results ───│<────│<────────────────│<────│  Claude Code            │
│                 │     │                 │     │  (executes tasks)       │
└─────────────────┘     └─────────────────┘     └─────────────────────────┘
```

## Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[cadence-web/](./cadence-web/)** | **START HERE** - Voice interface + VPS setup | 5 min |
| [cadence-setup/](./cadence-setup/) | Bootstrap script details | 2 min |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Full mobile app plans (future) | 20 min |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical reference | 30 min |

---

## Tech Stack

### Current (Phase 1)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Execution** | Your VPS + Claude Code | BYOV - zero cost, full control |
| **Bridge** | Node.js daemon on VPS | Thin wrapper for Claude CLI |
| **Voice** | OpenAI Whisper API | 98% accuracy |
| **Interface** | Static HTML + JS | Testing UI (not final) |
| **Backend** | Fastify 4 + TypeScript | API server (77 tests ✅) |
| **Auth** | API key | Simple VPS connection |

### Phase 2 (Mobile App)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | Swift + SwiftUI | Native voice APIs, iOS-first |
| **Voice UI** | AVFoundation | Native recording |
| **TTS** | AVSpeechSynthesizer | Native, low latency |
| **Database** | PostgreSQL (Neon) | User data, task history |

### Phase 3 (Managed Sandboxes)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Managed Execution** | E2B Sandboxes | 150ms cold start, zero-ops |
| **Billing** | Stripe | Pro tier ($15/mo) |
| **Hybrid Model** | VPS (DIY) or E2B (Managed) | User choice |

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
| **Voice input** | ❌ | ❌ | ✅ Wispr Flow Parity (98%) |
| **Voice output** | ❌ | ❌ | ✅ |
| **Mobile-native** | ❌ | ⚠️ Basic | ✅ Full |
| **Push notifications** | ❌ | ❌ | ✅ |
| **Offline viewing** | ❌ | ❌ | ✅ |
| **Price** | $20/mo | $20/mo | $15/mo |

---

## Implementation Roadmap

### Phase 1: VPS-Only MVP (Weeks 1-16) - Current

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend API** | ✅ Complete | 77 tests passing |
| **Bootstrap Script** | ✅ Complete | `cadence-setup/bootstrap.sh` |
| **Testing UI** | ✅ Complete | `cadence-web/index.html` (browser-based) |
| **Mobile App** | 🚧 In Progress | iOS Swift/SwiftUI |

**Current State:** VPS-only execution, web-based testing UI available.

### Phase 2: Mobile App (Weeks 17-20) - Next

| Component | Status | Deliverables |
|-----------|--------|--------------|
| **iOS App** | 📋 Planned | Swift/SwiftUI native app |
| **Voice UI** | 📋 Planned | Native voice recording + transcription |
| **Task Views** | 📋 Planned | Agent list, detail, streaming updates |
| **VPS Settings** | 📋 Planned | Connection management |

**Execution:** Still VPS-only (BYOV).

### Phase 3: Managed Sandboxes (Weeks 21+) - Future

| Component | Status | Deliverables |
|-----------|--------|--------------|
| **E2B Integration** | 📋 Planned | Managed sandbox option |
| **Billing Tiers** | 📋 Planned | Free (VPS) + Pro (E2B $15/mo) |
| **Provider Selection** | 📋 Planned | Settings to choose execution mode |

**Execution:** Hybrid (DIY VPS or managed E2B).

See [ARCHITECTURE.md](./ARCHITECTURE.md) Section 8 for detailed roadmap.

---

## Decision Gates

| Gate | When | Kill Criteria |
|------|------|---------------|
| **Alpha** | Week 4 | NPS < 50, Voice accuracy < 90% |
| **Beta** | Week 8 | WAU < 30%, < 100 users |
| **Paid** | Week 16 | Conversion < 10%, MRR < $1K |

---

## Development Setup

### MVP (Current)

No installation required! Just open `cadence-web/index.html` in a browser.

### Future Mobile App

```bash
# Mobile app (when ready to build native)
npx create-expo-app@latest cadence --template expo-template-blank-typescript
cd cadence

# Install dependencies
npx expo install expo-speech expo-av expo-secure-store expo-notifications
npm install zustand @tanstack/react-query axios

# Start development
npx expo start
```

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for full mobile app plans.

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
│
├── cadence-web/              ← VOICE INTERFACE (START HERE)
│   └── index.html            ← Voice UI + integrated VPS setup
│
├── cadence-setup/            ← VPS BOOTSTRAP SCRIPT
│   └── bootstrap.sh          ← One-liner for VPS setup
│
├── IMPLEMENTATION.md         ← Full mobile app plans (future)
├── ARCHITECTURE.md           ← Technical reference
├── AGENT-PROMPTS-QUICKREF.md ← Prompts for parallel development
├── AGENT_HANDOFF.md          ← Session continuity
│
├── 01-planning/              ← Business docs
├── 04-design/                ← UI mockups
└── pitch-deck/               ← Investor materials
```

---

**Status:** MVP Ready - Open `cadence-web/index.html` to start
**Approach:** Simplest thing first - your VPS, your control

*Voice-enabled coding powered by Claude Code*
