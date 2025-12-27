# Cadence Architecture Guide

> **Architecture reference for the Voice AI Coding Assistant**
>
> Last Updated: December 26, 2025 | Status: Ready for Implementation
>
> ⚠️ **Note:** For implementation details, task breakdowns, and code examples, see **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - that is the primary document for developers.

---

## Quick Reference

| Component | Technology | Cost |
|-----------|-----------|------|
| Mobile App | React Native + Expo SDK 52 | Free |
| Backend API | Fastify 4 + TypeScript | $20-50/mo |
| AI Agents | Claude API | ~$0.50/agent |
| STT | OpenAI Whisper API (MVP) / Deepgram Nova-2 (Scale) | $0.006/min |
| TTS | expo-speech (on-device) | Free |
| Database | PostgreSQL (Neon) | $0-25/mo |
| **Vector DB** | **pgvector (on Neon)** | **Included in DB** |
| Real-time | Supabase Realtime / Polling | $0-25/mo |
| **Execution** | **Fly.io Machines (Firecracker VMs)** | **~$0.0003/sec** |

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (React Native)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Voice Input │  │ Agent List  │  │Agent Detail │  │  Settings   │    │
│  │ (Whisper)   │  │             │  │             │  │             │    │
│  └──────┬──────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Voice Processing: expo-av → Whisper API → CommandParser         │   │
│  │  (Structured Output via Outlines/Instructor)                     │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
│                                   │ HTTPS                               │
│                                   ▼                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Fastify)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Auth Routes │  │Agent Routes │  │ Context Eng │  │ Webhooks    │     │
│  │ (GitHub)    │  │ (CRUD)      │  │ (RAG/Index) │  │ (GitHub)    │     │
│  └─────────────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘     │
│                          │                │                             │
│                          │                ▼                             │
│                          │        ┌──────────────┐                      │
│                          │        │  pgvector    │                      │
│                          │        │ (Embeddings) │                      │
│                          │        └──────────────┘                      │
│                          ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Agent Orchestrator (Queue + State + Health)         │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXECUTION ENVIRONMENT (Fly.io Machines)              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Claude Agent SDK Execution                    │   │
│  │  • Clone repo  • Read/Edit files  • Run commands  • Create PR    │   │
│  │  • STRICT NETWORK POLICY (Egress Filtering)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Models

### Agent
```typescript
interface Agent {
  id: string;
  userId: string;
  repoUrl: string;
  repoName: string;
  branch: string;
  taskDescription: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100
  model: 'claude-sonnet-4-20250514' | 'claude-opus-4-20250514';
  source: 'MOBILE_APP';
  metadata: {
    filesChanged?: number;
    linesAdded?: number;
    linesRemoved?: number;
    prUrl?: string;
    estimatedCost?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

### VoiceCommand
```typescript
interface VoiceCommand {
  id: string;
  transcript: string;
  intent: 'create_agent' | 'check_status' | 'pause_agent' | 'resume_agent' | 'stop_agent' | 'unknown';
  entities: {
    repoUrl?: string;
    agentId?: string;
    taskDescription?: string;
    branch?: string;
  };
  confidence: number; // 0-1
  processingTimeMs: number;
  timestamp: Date;
}
```

### CodebaseContext (RAG)
```typescript
interface CodebaseContext {
  repoUrl: string;
  branch: string;
  framework: 'react' | 'vue' | 'next' | 'express' | 'fastify' | 'unknown';
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'unknown';
  // Relevant files found via Vector Search + Heuristics
  relevantFiles: {
    path: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    score: number; // Similarity score
  }[];
  dependencies: { name: string; version: string }[];
  analyzedAt: Date;
}
```

---

## 3. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/github` | OAuth callback |
| `POST` | `/api/agents` | Create agent |
| `GET` | `/api/agents` | List agents |
| `GET` | `/api/agents/:id` | Get agent detail |
| `POST` | `/api/agents/:id/pause` | Pause agent |
| `POST` | `/api/agents/:id/resume` | Resume agent |
| `DELETE` | `/api/agents/:id` | Cancel agent |
| `GET` | `/api/agents/:id/logs` | Get agent logs |
| `POST` | `/api/codebase/analyze` | Analyze repository (Index) |
| `GET` | `/api/repos` | List user repositories |

---

## 4. Execution Environment: ✅ REVISED DECISION

### The Problem with VPS-per-User (Revisited)
While "VPS-per-user" eliminates cold starts, it introduces massive **DevOps complexity**:
- **Zombie Processes:** Agents crashing and leaving high-CPU processes running.
- **Security Patching:** Managing OS updates for 1000+ VMs.
- **Disk Corruption:** Corrupt git states requiring manual intervention.
- **Cost:** Paying for idle time (nights/weekends).

### Final Decision: **Fly.io Machines (Firecracker VMs)**

We will use Fly.io Machines, which are lightweight Firecracker microVMs. They start in <300ms.

| Factor | Fly.io Machines | VPS-per-User | Winner |
|--------|-----------------|--------------|--------|
| **Ops Complexity** | **Low** (API-driven) | **High** (Config Mgmt) | **Fly.io** |
| **Isolation** | **High** (MicroVM) | **Medium** (User/Container) | **Fly.io** |
| **Cold Start** | ~300ms - 2s | 0s | **Tie** (Acceptable) |
| **Cost Efficiency** | Pay per second | Pay per month | **Fly.io** |

### Warm Pool Strategy
To mitigate the 2-5s cold start of fetching the Docker image and cloning the repo:
1. Maintain a small "warm pool" of generic runner machines (e.g., 5-10 machines).
2. When a user requests an agent, claim a warm machine instantly.
3. Use **Codebase Context (RAG)** to fetch only *relevant* files initially, rather than a full clone for massive repos (or shallow clone).

### Fly.io Configuration

```toml
# fly.toml
app = "cadence-agent-runner"

[build]
  dockerfile = "Dockerfile.agent"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0 # Use API to spawn explicitly

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 4096
```

---

## 5. Voice Pipeline & Command Parsing

### Updated Pipeline (Deepgram Option)

For MVP, we use **Whisper API**. For Scale (latency sensitive), we upgrade to **Deepgram Nova-2**.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           VOICE PIPELINE                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. RECORD                    2. TRANSCRIBE              3. PARSE        │
│  ┌─────────────┐             ┌─────────────┐            ┌─────────────┐  │
│  │   expo-av   │────M4A─────>│  Whisper    │───Text───> │ Structured  │  │
│  │  Recording  │   (50KB)    │    API      │            │ Output (LLM)│  │
│  │             │             │             │            │ (Outlines)  │  │
│  │ Target: 30s │             │ ~300ms      │            │ ~200ms      │  │
│  │ max         │             │ 95-98% acc  │            │ STRICT JSON │  │
│  └─────────────┘             └─────────────┘            └──────┬──────┘  │
│                                                                 │         │
│  4. EXECUTE                   5. RESPOND                       │         │
│  ┌─────────────┐             ┌─────────────┐                   │         │
│  │   Backend   │<────────────│   Router    │<──────────────────┘         │
│  │   Agent     │             │             │                              │
│  │  Creation   │             │ Route to    │                              │
│  │             │             │ handler     │                              │
│  └──────┬──────┘             └─────────────┘                              │
│         │                                                                  │
│         ▼                                                                  │
│  ┌─────────────┐  "Agent started on branch feature/login."                │
│  │ expo-speech │                                                          │
│  │   (TTS)     │                                                          │
│  │  <50ms      │                                                          │
│  └─────────────┘                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Task-Based Interaction (Important)
We are building a **Task-Based** assistant, not a "Dictate-Code-Character-by-Character" editor.
*   ✅ "Create a login form using React Hook Form"
*   ❌ "Go to line 50 and change 'var' to 'const'" (Latency/Accuracy makes this frustrating via voice)

---

## 6. Context Engine (RAG)

**Critical Addition:** We cannot rely on Claude just "guessing" file paths in large repos. We need a semantic search index.

1.  **Ingestion:**
    *   On Agent creation (or periodic sync), fetch repo file tree.
    *   Download key files (README, package.json, high-level structure).
    *   Split code into chunks and generate embeddings (e.g., using OpenAI `text-embedding-3-small`).
    *   Store in **Neon Postgres (pgvector)**.

2.  **Retrieval:**
    *   When user asks "Update auth logic", generate query embedding.
    *   Search pgvector for top 20 relevant chunks.
    *   Feed file paths and summaries to Claude Agent SDK.

---

## 7. Security Requirements

### Sandbox Security Checklist

*   [ ] **Network Egress Filtering:** Agents should ONLY be able to talk to:
    *   GitHub (git operations)
    *   NPM/PyPI (dependencies)
    *   Anthropic API (LLM calls)
    *   **BLOCK** all internal IPs (10.x.x.x, 192.168.x.x) to prevent SSRF against our infrastructure.
    *   **BLOCK** arbitrary internet access (crypto mining prevention).
*   [ ] **Resource Limits:** Hard CPU/RAM limits via Fly.io Machine config.
*   [ ] **Ephemeral Storage:** Machine filesystem is destroyed after task completion.
*   [ ] **Secrets Redaction:** Agent logs must be scanned for API keys before storage.

---

## 8. Summary: Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mobile Framework** | React Native + Expo | Cross-platform, fast iteration |
| **Backend** | Fastify + TypeScript | Fast, type-safe, familiar |
| **Database** | Neon PostgreSQL + **pgvector** | Serverless, auto-scale, **RAG support** |
| **STT** | OpenAI Whisper (Start) -> Deepgram | Balance of ease (now) vs speed (later) |
| **Command Parsing** | **Structured Output (Outlines/Instructor)** | Guarantee valid JSON, no parsing errors |
| **Execution** | **Fly.io Machines** | **Reduced DevOps complexity** vs VPS-per-user |
| **AI Core** | Claude API + Agent tools | Best coding capability |

---

## 9. Future Enhancements & Optimization

These items are technically feasible but deferred to reduce MVP complexity. They represent the "Scale" phase of the architecture.

### 9.1 Dedicated VPS-per-User (The "Pro" Tier Infrastructure)
While Fly.io is perfect for MVP, at scale (10,000+ users), maintaining a dedicated VPS for power users offers:
*   **Zero Cold Start:** The VM is always running (or suspended/resumed instantly).
*   **Persistent Workspace:** No need to re-clone the repo; `node_modules` stays cached.
*   **Higher Margins:** Hetzner CX22 (€4.50/mo) is cheaper than running a Fly.io machine 24/7 if usage is high.

**Implementation Trigger:** When API costs exceed $15,000/mo or user churn due to startup latency increases.

### 9.2 Deepgram Nova-2 Integration
*   **Current:** Whisper API (non-streaming).
*   **Future:** Deepgram Nova-2 (streaming WebSocket).
*   **Benefit:** Reduces voice latency from ~2s to ~300ms, enabling near-real-time conversational coding.
*   **Complexity:** Requires WebSocket handling on mobile and backend stream processing.

### 9.3 Multi-File "Composer" Editing
*   **Current:** Single-file edits or sequential edits via SDK.
*   **Future:** Context-aware multi-file editing (like Cursor's Composer).
*   **Benefit:** Complex refactors (e.g., "Rename this component and update all 50 imports").
*   **Complexity:** Requires advanced dependency graph analysis and transactional file system rollbacks.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Task breakdowns and code guides |
| [RISK_ANALYSIS.md](./01-planning/RISK_ANALYSIS_AND_VIABILITY.md) | Business viability & Risks |

---

**Architecture Version:** 2.2 (Future Enhancements Added)
**Updated:** December 26, 2025
**Status:** Ready for Implementation
