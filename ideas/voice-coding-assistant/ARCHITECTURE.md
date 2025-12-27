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
| **Execution (MVP)** | **Fly.io Machines (Firecracker)** | **~$0.0003/sec** |
| **Execution (Scale)** | **Hetzner VPS per user** | **$4.85/user/mo** |

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
│                    EXECUTION ENVIRONMENT (MVP: Fly.io)                  │
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

## 4. Execution Environment: MVP Decision

### The Decision: **Fly.io Machines (Firecracker VMs)**

We will use Fly.io Machines for the MVP phase. They are lightweight Firecracker microVMs that balance the need for isolation with low operational overhead.

| Factor | Fly.io Machines | VPS-per-User | Winner |
|--------|-----------------|--------------|--------|
| **Ops Complexity** | **Low** (API-driven) | **High** (Config Mgmt) | **Fly.io** |
| **Isolation** | **High** (MicroVM) | **Medium** (User/Container) | **Fly.io** |
| **Cold Start** | ~300ms - 2s | 0s | **Tie** (Acceptable) |
| **Cost Efficiency** | Pay per second | Pay per month | **Fly.io** |

### Warm Pool Strategy
To mitigate the 2-5s cold start of fetching the Docker image and cloning the repo:
1. Maintain a small "warm pool" of generic runner machines.
2. When a user requests an agent, claim a warm machine instantly.
3. Use **Codebase Context (RAG)** to fetch only *relevant* files initially.

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

## 5. Voice Pipeline

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

---

## 6. Context Engine (RAG)

**Critical Addition:** We cannot rely on Claude just "guessing" file paths in large repos. We need a semantic search index.

1.  **Ingestion:**
    *   On Agent creation (or periodic sync), fetch repo file tree.
    *   Download key files (README, package.json, high-level structure).
    *   Split code into chunks and generate embeddings.
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

## 8. Future Architecture: Scalability (The "Pro" Tier)

> **Note:** The following architecture is preserved for the "Scale" phase (Phase 9 in Implementation). It represents the target state for high-margin power users.

### 8.1 VPS-per-User Architecture

**Why:**
- **Zero cold start** - VM always running
- **Persistent workspace** - repos stay cloned
- **Faster subsequent agents** - dependencies cached
- **Predictable pricing** - flat monthly cost

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VPS-PER-USER ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  When user subscribes ($15/mo):                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  PROVISION: Hetzner Cloud CX22 (2 vCPU, 4GB RAM, 40GB SSD)       │   │
│  │  Cost: ~$4.50/mo → Margin: ~$10.50/mo (70%)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  User's Dedicated VPS:                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────────────────┐     │   │
│  │  │              Agent Daemon                               │     │   │
│  │  │                                                         │     │   │
│  │  │  • Listens for tasks via API/WebSocket                  │     │   │
│  │  │  • Manages cloned repositories (~5 repos cached)        │     │   │
│  │  │  • Runs Claude Agent SDK                                │     │   │
│  │  │  • Streams logs back to backend                         │     │   │
│  │  └─────────────────────────────────────────────────────────┘     │   │
│  │                                                                   │   │
│  │  /home/cadence/                                                   │   │
│  │  ├── repos/                                                       │   │
│  │  │   ├── wallet-frontend/     (cloned, npm installed)             │   │
│  │  │   ├── api-service/         (cloned, cached)                    │   │
│  │  │   └── ...                                                      │   │
│  │  ├── agent-daemon/            (our execution service)             │   │
│  │  └── .anthropic/              (API key, config)                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Hybrid Architecture Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HYBRID EXECUTION MODEL                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FREE TIER ($0/mo):                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Serverless execution (Fly.io Machines)                          │   │
│  │  • 5 agents/month limit                                          │   │
│  │  • Cold start: 2-5 seconds                                       │   │
│  │  • Repos cloned fresh each time                                  │   │
│  │  • Cost to us: ~$0.50/agent                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  PRO TIER ($15/mo):                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Dedicated VPS (Hetzner CX22)                                    │   │
│  │  • Unlimited agents                                              │   │
│  │  • Zero cold start                                               │   │
│  │  • Repos cached, deps installed                                  │   │
│  │  • Cost to us: ~$4.85/mo → 68% margin                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Implementation: Agent Daemon (Reference Code)

```typescript
// agent-daemon/src/index.ts
import { query } from '@anthropic-ai/claude-code';
import { WebSocket } from 'ws';

class AgentDaemon {
  private ws: WebSocket;
  private reposDir = '/home/cadence/repos';

  async connect(backendUrl: string, userToken: string) {
    this.ws = new WebSocket(`${backendUrl}/ws/daemon`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    this.ws.on('message', async (data) => {
      const task = JSON.parse(data.toString());
      await this.executeTask(task);
    });
  }

  async executeTask(task: AgentTask) {
    // 1. Ensure repo is cloned and up-to-date
    const repoPath = await this.prepareRepo(task.repoUrl, task.branch);

    // 2. Execute Claude Agent SDK
    const response = await query({
      prompt: task.prompt,
      cwd: repoPath,
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.ANTHROPIC_API_KEY,
      hooks: {
        PostToolUse: [{
          matcher: '*',
          callback: async (input) => {
            // Stream progress back to backend
            this.ws.send(JSON.stringify({
              type: 'progress',
              agentId: task.id,
              tool: input.tool_name,
              result: input.tool_result
            }));
            return {};
          }
        }]
      }
    });

    // 3. Process streaming response and notify completion
    // ...
  }
}
```

---

## 9. Cost Comparison

### Per-User Economics

| Model | Infrastructure | Claude API | Total/User/Mo | Margin at $15 |
|-------|---------------|------------|---------------|---------------|
| **Fly.io (MVP)** | ~$0.50-2.00 | ~$5-10 | $6-12 | 20-60% |
| **VPS (Scale)** | $4.85 | ~$5-10 | $10-15 | 0-33% |
| **Hybrid Pro** | $4.85 | ~$5-10 | $10-15 | 0-33% |

**Note:** Claude API costs dominate. VPS saves money only for very heavy users who would otherwise churn 100s of Fly.io machines.

---

**Architecture Version:** 2.2 (Restored & Enhanced)
**Updated:** December 26, 2025
**Status:** Ready for Implementation
