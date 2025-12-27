# Cadence Architecture Guide

> **Architecture reference for the Voice AI Coding Assistant**
>
> Last Updated: December 26, 2025 | Status: Ready for Implementation
>
> ⚠️ **Note:** For implementation details, task breakdowns, and code examples, see **[IMPLEMENTATION.md](./IMPLEMENTATION.md)**.

---

## Strategy Selection: Multi-Path Approach

We are executing a **Multi-Path Strategy** to de-risk the launch.

| Feature | **Path A: Managed SaaS** (Mass Market) | **Path B: Self-Hosted / BYOC** (Developer MVP) |
| :--- | :--- | :--- |
| **Target User** | Junior/Mid devs, Agencies | Senior devs, Privacy-conscious, Power users |
| **Compute** | Managed Fly.io / Hetzner | User's own VPS / Desktop |
| **Setup** | One-click | Run `npm install -g cadence-agent` |
| **Cost to Us** | High ($10+/user) | **Near Zero** (Signaling only) |
| **Privacy** | We process code | **End-to-End Encrypted** (Code stays on VPS) |
| **Architecture** | Complex Orchestrator | **Simple Relay** |

> **Recommendation:** Start with **Path B (Self-Hosted)** to validate the product with zero infrastructure cost, then build Path A for mass adoption.

---

## 1. System Overview (Path B: Self-Hosted)

The "Thin Client" architecture relies on a **WebSocket Relay** to connect the Mobile App to the User's VPS without requiring open ports or static IPs.

```
┌──────────────────────────┐             ┌──────────────────────────┐
│      MOBILE APP          │             │      USER'S VPS          │
│    (React Native)        │             │    (Ubuntu / Docker)     │
│                          │             │                          │
│ ┌──────────────────────┐ │             │ ┌──────────────────────┐ │
│ │  Voice Interface     │ │             │ │    Cadence Agent     │ │
│ │  (Whisper API)       │ │   E2EE      │ │    (Node.js CLI)     │ │
│ └──────────┬───────────┘ │ WebSocket   │ └──────────┬───────────┘ │
│            │             │   Tunnel    │            │             │
│            ▼             │<----------->│            ▼             │
│ ┌──────────────────────┐ │             │ ┌──────────────────────┐ │
│ │ WebSocket Client     │ │             │ │ WebSocket Client     │ │
│ └──────────┬───────────┘ │             │ └──────────┬───────────┘ │
└────────────┼─────────────┘             └────────────┼─────────────┘
             │                                        │
             │           ┌──────────────────────┐     │
             │           │    RELAY SERVER      │     │
             └──────────>│   (Fastify / Go)     │<────┘
                         │                      │
                         │  • Authenticates     │
                         │  • Bridges Streams   │
                         │  • No Data Storage   │
                         └──────────────────────┘
```

---

## 2. Component Architecture

### 2.1 The Agent (User-Side)
A simple CLI tool users install on their VPS.

```bash
# User installation
npm install -g @cadence/agent
cadence login  # Authenticates with GitHub
cadence start  # Connects to Relay
```

**Responsibilities:**
1.  **Connection:** Maintains persistent WebSocket to `wss://api.cadence.dev/relay`.
2.  **Execution:** Runs the **Claude Agent SDK** locally.
3.  **Context:** Uses local `ripgrep` / `find` for context (fast!).
4.  **Filesystem:** Direct access to user's cloned repos.

### 2.2 The Relay Server (Our Backend)
A dumb pipe. It does not execute agents or store code.

**Endpoints:**
*   `POST /auth/handshake`: Exchange Auth Tokens for Session ID.
*   `WS /relay/:session_id`: WebSocket endpoint for both App and Agent.

### 2.3 The Mobile App
The "Remote Control."

**Responsibilities:**
*   **Voice Processing:** Records audio, sends to Whisper API.
*   **Command Parsing:** Sends text command to Relay.
*   **UI Rendering:** Displays streaming logs/diffs received from Relay.

---

## 3. Data Models (Simplified)

### AgentMessage (WebSocket Protocol)
```typescript
type AgentMessage =
  | { type: 'COMMAND', text: string, context?: any }
  | { type: 'PROGRESS', step: string, logs: string[] }
  | { type: 'FILE_READ', path: string, content: string }
  | { type: 'FILE_DIFF', path: string, diff: string }
  | { type: 'COMPLETED', prUrl: string }
  | { type: 'ERROR', message: string };
```

---

## 4. Security Requirements (Path B)

1.  **End-to-End Encryption (Optional but Recommended):**
    *   App and Agent share a symmetric key (ECDH).
    *   Relay Server sees only encrypted blobs.
    *   *Result:* We literally cannot steal user code.

2.  **Authentication:**
    *   User logs in via GitHub on both App and Agent.
    *   Relay Server verifies both belong to same GitHub ID before bridging.

---

## 5. Path A: Managed SaaS (Reference)

> *Preserved for Future Scale-Up / Mass Market*

### 5.1 System Overview
*(Original Fly.io/Hetzner architecture goes here...)*
- **Mobile App** -> **API** -> **Orchestrator** -> **Fly.io Machine**
- **RAG Engine** needed (because we don't have local persistent context).

*(Detailed Path A diagrams preserved from previous version...)*

---

## 6. Cost Comparison: Path A vs Path B

| Cost Item | Path A (Managed) | Path B (Self-Hosted) |
| :--- | :--- | :--- |
| **Compute** | $10 - $50 / user / mo | **$0** (User pays Hetzner) |
| **Storage** | $2 / user / mo (DB+Vector) | **$0** (User disk) |
| **Bandwidth** | High (Code streaming) | Low (Signaling) |
| **STT/LLM** | ~$5 / user / mo | ~$5 / user / mo |
| **TOTAL** | **~$20 / user / mo** | **~$5 / user / mo** |
| **Breakeven** | $25/mo subscription | $6/mo subscription |

---

**Architecture Version:** 3.0 (Multi-Path Strategy)
**Updated:** December 26, 2025
**Status:** Ready for Implementation (Path B Priority)
