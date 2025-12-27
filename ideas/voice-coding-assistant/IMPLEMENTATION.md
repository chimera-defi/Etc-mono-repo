# Cadence - Implementation Guide

> **Project:** Voice-Enabled AI Coding Assistant (React Native Mobile App)
> **Approach:** Unified Core (Agent CLI First)
> **Timeline:** 8 weeks MVP

---

## The Master Plan

We build components in an order that validates value immediately while laying the foundation for scale.

1.  **Phase 1: The Core (Relay + Agent CLI)** -> *Enables "Terminal Coding"*
2.  **Phase 2: The Remote (Mobile App)** -> *Enables "Voice Coding"*
3.  **Phase 3: The Polish (RAG + UX)** -> *Enables "Production Coding"*
4.  **Phase 4: The Scale (Managed Infra)** -> *Enables "Mass Market"*

---

## Phase 0: Validation (3-5 days)

> **Goal:** Prove voice → agent → code changes works using a throwaway script.

*(Same validation prototype script as before)*

---

## Phase 1: The Core (Weeks 1-2)

> **Goal:** A working "Remote Agent" system. You can type into a web UI and see your terminal execute it.

### 1.1 The Relay Server
*   **Stack:** Fastify + WebSockets + Redis.
*   **Endpoints:** `/relay` (WebSocket), `/auth` (GitHub).
*   **Deliverable:** A server that blindly forwards JSON between two connected sockets.

### 1.2 The Agent CLI (`@cadence/agent`)
*   **Stack:** Node.js, Claude Agent SDK.
*   **Commands:**
    *   `cadence login`: Authenticates device.
    *   `cadence start`: Connects to Relay, waits for tasks.
*   **Logic:** Receives JSON `{ task: "..." }` -> Runs SDK -> Streams logs back.

**Verification:** Connect a simple HTML test page to Relay. Type "create hello.txt". Verify `hello.txt` appears on your laptop.

---

## Phase 2: The Remote (Weeks 3-5)

> **Goal:** The Mobile App controlling the Agent.

### 2.1 Mobile Foundation
*   **Stack:** React Native + Expo.
*   **Features:** GitHub Login, WebSocket Client to Relay.

### 2.2 Voice Integration
*   **Stack:** expo-av (Recording) -> Whisper API -> Text.
*   **Flow:**
    1.  Record Audio.
    2.  Send to Whisper.
    3.  Receive Text.
    4.  Send Text to Relay (as command).

**Verification:** Speak "Create a README file" to phone. Verify `README.md` appears on your laptop.

---

## Phase 3: The Polish (Weeks 6-7)

> **Goal:** Robustness and Context.

### 3.1 Context Engine (Local)
*   **Problem:** Agent blindly guesses file paths.
*   **Solution:** Integrate `ripgrep` into Agent CLI.
*   **Logic:** Before running agent, search for relevant files based on keywords in the prompt.

### 3.2 Robustness
*   **Reconnection:** Handle mobile network drops gracefully (message queueing in Relay).
*   **Output:** Format logs nicely in Mobile App (Ansi to UI).

---

## Phase 4: The Scale (Future / Post-MVP)

> **Goal:** Offer "Managed Mode" for users without VPS.

### 4.1 Fly.io Runners
*   **Concept:** A Docker container that runs `cadence start`.
*   **Flow:**
    1.  User clicks "Start Cloud Agent" in App.
    2.  API spawns Fly.io Machine with `cadence-agent` image.
    3.  Machine connects to Relay.
    4.  App controls it exactly like a local agent.

---

## Task Breakdown (Sprint View)

| Sprint | Focus | Tasks |
| :--- | :--- | :--- |
| **Sprint 1** | **Core Plumbing** | `Relay Server`, `Agent CLI Skeleton`, `WebSocket Bridge` |
| **Sprint 2** | **Agent Intelligence** | `Claude SDK Integration`, `File Tools`, `Local Context` |
| **Sprint 3** | **Mobile Base** | `Auth`, `UI Shell`, `WebSocket Client` |
| **Sprint 4** | **Voice & Polish** | `Voice Recording`, `Whisper API`, `UI Polish` |

---

**Document Version:** 3.1 (Unified)
**Created:** December 26, 2025
**Status:** Ready for Implementation
