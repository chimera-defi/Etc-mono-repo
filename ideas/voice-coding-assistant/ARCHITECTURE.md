# Cadence Architecture Guide

> **Architecture reference for the Voice AI Coding Assistant**
>
> Last Updated: December 26, 2025 | Status: Ready for Implementation
>
> ⚠️ **Note:** For implementation details, task breakdowns, and code examples, see **[IMPLEMENTATION.md](./IMPLEMENTATION.md)**.

---

## Strategy: The Unified Platform

We employ a **Unified Core Architecture**. We do not build two separate systems. We build **one** execution engine (the Agent CLI) that can be run in two modes:

1.  **Path B (Self-Hosted):** User runs the Agent CLI on their machine.
2.  **Path A (Managed):** We run the Agent CLI on a Fly.io machine.

This ensures feature parity and drastically simplifies development. We build Path B first, which automatically gives us the core logic for Path A.

---

## 1. System Overview

```
┌──────────────────────────┐             ┌──────────────────────────┐
│      MOBILE APP          │             │    EXECUTION ENVIRONMENT │
│    (React Native)        │             │   (User VPS OR Fly.io)   │
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

## 2. Component Details

### 2.1 The Relay Server (The Bridge)
A lightweight WebSocket router. It knows nothing about code or agents.
*   **Role:** Connects a `Controller` (Mobile App) to a `Runner` (Agent CLI).
*   **Security:** Authenticates both ends via GitHub. Enforces E2EE (optional).
*   **State:** Ephemeral. Messages are ephemeral.

### 2.2 The Agent CLI (The Brain)
The core logic resides here.
*   **Stack:** Node.js, `@anthropic-ai/claude-agent-sdk`.
*   **Capabilities:**
    *   Connects outbound to Relay.
    *   Executes Agent SDK (reads/writes files).
    *   **Context:** Uses local tools (`ripgrep`, `find`, `git`) for context finding.
*   **Modes:**
    *   `cadence start` (Interactive/Terminal mode)
    *   `cadence daemon` (Headless/Server mode)

### 2.3 The Mobile App (The Remote)
The UI for the user.
*   **Voice:** Captures audio -> Whisper API -> Text Command.
*   **Display:** Renders the stream of events from the Agent CLI.
*   **Control:** pause/resume/stop signals.

---

## 3. Deployment Modes (The "Paths")

| Feature | **Path B: Self-Hosted** (MVP) | **Path A: Managed SaaS** (Scale) |
| :--- | :--- | :--- |
| **Runner** | User's Machine | Fly.io Machine (Firecracker) |
| **Agent CLI** | `npm install -g cadence-agent` | Pre-installed in Docker image |
| **Repo Access** | Local Filesystem | `git clone` (Ephemeral) |
| **Context** | Local `ripgrep` | Local `ripgrep` + Vector DB (Optional) |
| **Cost** | $0 Infrastructure | ~$0.02/hr |

---

## 4. Security

1.  **Isolation:**
    *   **Self-Hosted:** User relies on their own OS security.
    *   **Managed:** We use Fly.io Firecracker VMs + Network Egress Filtering.
2.  **Authentication:**
    *   Standard GitHub OAuth.
    *   Relay ensures `User(App) == User(Agent)`.

---

## 5. Summary

By building the **Agent CLI** first, we validate the core "Voice -> Code" loop without paying for infrastructure. Once validated, we simply wrap that exact same CLI in a Docker container to offer the "Managed" experience.

---

**Architecture Version:** 3.1 (Unified Platform)
**Updated:** December 26, 2025
**Status:** Ready for Implementation
