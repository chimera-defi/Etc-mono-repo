# Cadence - Implementation Guide

> **Project:** Voice-Enabled AI Coding Assistant (React Native Mobile App)
> **Strategy:** Path B (Self-Hosted Agent) First
> **Timeline:** 8 weeks MVP (Simplified)

---

## Phase 0: Validation (3-5 days)

> **Goal:** Prove voice → agent → code changes works BEFORE building mobile app

*(Validation Prototype steps remain the same...)*

---

## Phase 1: The Relay Server (Week 1)

> **Goal:** Build the bridge between Mobile App and User's VPS.

**Stack:** Fastify + `@fastify/websocket` + Redis (for session mapping).

**Tasks:**
1.  `R-01` Init Fastify project.
2.  `R-02` Implement WebSocket route `/relay`.
3.  `R-03` Implement simple authentication (Session ID exchange).
4.  `R-04` Implement message routing (A → Relay → B).

**Code Example (Relay):**
```typescript
fastify.register(require('@fastify/websocket'));

fastify.get('/relay', { websocket: true }, (connection, req) => {
  const { sessionId, role } = req.query; // role: 'app' or 'agent'
  
  // Store connection in Redis/Map
  sessionManager.register(sessionId, role, connection.socket);

  connection.socket.on('message', (message) => {
    // Forward to counterpart
    const targetRole = role === 'app' ? 'agent' : 'app';
    const targetSocket = sessionManager.get(sessionId, targetRole);
    if (targetSocket) targetSocket.send(message);
  });
});
```

---

## Phase 2: The Agent CLI (Week 2)

> **Goal:** The binary that runs on the user's VPS.

**Stack:** Node.js, `ws` client, `@anthropic-ai/claude-agent-sdk`.

**Tasks:**
1.  `A-01` Create CLI scaffold (`commander`).
2.  `A-02` Implement `cadence login` (Device Code flow).
3.  `A-03` Implement `cadence start` (Connect to Relay).
4.  `A-04` Integrate Claude Agent SDK to listen for messages from Relay.

**Code Example (Agent):**
```typescript
// agent.ts
import { query } from '@anthropic-ai/claude-code';
import WebSocket from 'ws';

const ws = new WebSocket('wss://api.cadence.dev/relay?role=agent');

ws.on('message', async (data) => {
  const command = JSON.parse(data);
  if (command.type === 'EXECUTE') {
    // Run Agent
    const stream = await query({ prompt: command.text, cwd: process.cwd() });
    for await (const chunk of stream) {
      ws.send(JSON.stringify({ type: 'PROGRESS', chunk }));
    }
  }
});
```

---

## Phase 3: Mobile App (Week 3-6)

> **Goal:** The remote control.

*(Follows original mobile app steps, but connects to Relay instead of Orchestrator).*

---

## Task Breakdown (Path B Priority)

| Sprint | Task | Focus |
| :--- | :--- | :--- |
| **Sprint 1** | Relay Server | Backend plumbing (WebSockets) |
| **Sprint 2** | Agent CLI | The "Brain" on the VPS |
| **Sprint 3** | Mobile Shell | Auth + Voice Recording |
| **Sprint 4** | Integration | Connecting Voice -> Relay -> CLI |

---

**Document Version:** 3.0 (Path B Focused)
**Created:** December 26, 2025
**Status:** Ready for Implementation
