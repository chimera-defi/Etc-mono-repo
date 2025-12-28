# Agent Handoff Document

> **Use this file to maintain continuity between agent sessions**

Last Updated: December 28, 2025
Current Status: **MVP Complete**
Approach: **Simplified - User's VPS + Voice Bridge**

---

## Major Simplification (Dec 28, 2025)

The project was simplified from a 12-week mobile app build to:

| Component | Status | Description |
|-----------|--------|-------------|
| `cadence-web` | ✅ Complete | Browser-based voice interface WITH setup flow |
| `cadence-setup/bootstrap.sh` | ✅ Complete | One-liner VPS bootstrap script |
| `cadence-bridge` | ✅ Complete | HTTP server wrapping Claude CLI (deployed via bootstrap) |

**Total code: ~700 lines instead of 10,000+**

### Why the Simplification?

1. User already has a VPS → Don't build VPS provisioning
2. Claude Code CLI exists → Don't build agent execution
3. Browser can record audio → Don't need mobile app for MVP
4. Whisper API exists → Don't build STT
5. **Setup happens IN THE APP** → No separate CLI needed

### What We Actually Built

```
cadence-web/       → Static HTML page with setup flow + voice recording
cadence-setup/     → bootstrap.sh one-liner for VPS (shown in the app)
cadence-bridge     → ~100 LOC HTTP server, auto-deployed to VPS
```

### The Setup Flow

1. User opens `cadence-web/index.html`
2. App shows bootstrap command to copy
3. User SSHs into VPS, runs the one-liner
4. User enters VPS IP + API keys in the app
5. App connects to VPS over HTTP, sends config
6. VPS installs Claude Code, deploys bridge, returns endpoint + key
7. User starts coding with voice

---

## Pre-Flight Checklist

Before working on Cadence:

```bash
# 1. Check Node.js version (need 20+)
node --version

# 2. Verify directory
pwd
# Should be: .../Etc-mono-repo/ideas/voice-coding-assistant

# 3. Check components exist
ls cadence-setup/ cadence-web/
```

---

## Current Status

### MVP Components

| Component | Status | Location |
|-----------|--------|----------|
| Web Interface (+ setup) | ✅ Ready | `cadence-web/index.html` |
| Bootstrap Script | ✅ Ready | `cadence-setup/bootstrap.sh` |
| Bridge Server | ✅ Ready | Embedded in bootstrap.sh, deployed to VPS |
| Documentation | ✅ Updated | `README.md` |

### Future Work (Optional)

| Task | Priority | Description |
|------|----------|-------------|
| Mobile app | P2 | React Native version of cadence-web |
| HTTPS setup | P1 | Add Caddy/nginx for SSL |
| Multi-repo | P2 | Better repo management UI |
| Streaming | P2 | Stream Claude output in real-time |

---

## Architecture Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Execution | User's VPS | User controls environment | Dec 28, 2025 |
| Bridge | Node.js HTTP | Minimal, ~100 LOC | Dec 28, 2025 |
| Voice | Browser MediaRecorder | Works everywhere | Dec 28, 2025 |
| STT | OpenAI Whisper API | 98% accuracy | Dec 28, 2025 |
| Auth | API key | Simple, secure | Dec 28, 2025 |
| VPS Setup | In-app bootstrap | User runs one-liner, app configures | Dec 28, 2025 |
| Mobile app | Deferred | Start simple | Dec 28, 2025 |

---

## Files Created/Modified This Session

| File | Change | Date |
|------|--------|------|
| cadence-setup/bootstrap.sh | Created - in-app setup script | Dec 28, 2025 |
| cadence-web/index.html | Updated - integrated setup flow | Dec 28, 2025 |
| README.md | Updated - bootstrap approach | Dec 28, 2025 |
| AGENT_HANDOFF.md | Updated | Dec 28, 2025 |

---

## Next Agent Instructions

### To Test the MVP:

1. Get a VPS (Hetzner, DigitalOcean, etc.)
2. Open `cadence-web/index.html` in browser
3. Copy the bootstrap command shown
4. SSH into your VPS and run the command
5. Enter VPS IP + API keys in the app
6. Click "Connect & Setup" - app will configure VPS
7. Test voice recording and task execution

### To Continue Development:

1. **Add HTTPS**: Create Caddy config for SSL
2. **Improve UI**: Better output display, history
3. **Add streaming**: SSE for real-time Claude output
4. **Mobile app**: Port cadence-web to React Native

---

## Required API Keys

```bash
# Anthropic (Claude Code)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Whisper - for voice)
OPENAI_API_KEY=sk-...
```

---

**Document Version:** 2.1
**Created:** December 28, 2025
**Updated:** December 28, 2025 - In-app bootstrap setup
