# Cadence Architecture Guide

> **Architecture reference for the Voice AI Coding Assistant**
>
> Last Updated: December 28, 2025 | Status: Backend Complete - iOS Development Pending
>
> ⚠️ **Note:** This architecture has been updated to use **Swift/SwiftUI** for iOS instead of React Native.
>
> **Implementation Status:** Backend API is fully scaffolded with streaming, text input, and webhook support. See Section 3 for actual endpoints.

---

## Quick Reference

| Component | Technology | Cost |
|-----------|-----------|------|
| **iOS App** | **Swift + SwiftUI** | Free |
| Backend API | Fastify 4 + TypeScript | $20-50/mo |
| AI Agents | Claude Code CLI | ~$0.50/agent |
| STT | OpenAI Whisper API | $0.006/min |
| TTS | AVSpeechSynthesizer (native) | Free |
| Database | PostgreSQL (Neon) | $0-25/mo |
| Real-time | WebSocket | $0 |
| **Execution** | **User's VPS + Claude Code** | **User provides** |

---

## Architecture Decision: Swift over React Native

| Factor | Swift | React Native |
|--------|-------|--------------|
| **Voice APIs** | ✅ Native AVFoundation, Speech.framework | ⚠️ Wrapper libraries |
| **Performance** | ✅ Native, no bridge | ⚠️ JS bridge overhead |
| **iOS Integration** | ✅ Siri, Shortcuts, Widgets | ⚠️ Limited |
| **App Size** | ✅ Smaller | ⚠️ Larger (include RN runtime) |
| **Target Audience** | ✅ iOS developers appreciate native | - |
| **Development Time** | ⚠️ iOS only | ✅ Cross-platform |
| **Team Size** | ⚠️ Need Swift expertise | ✅ JS developers |

**Decision:** Swift. We're targeting iOS-only for MVP. Voice is core functionality - native APIs provide better experience.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         iOS APP (Swift/SwiftUI)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Voice Input │  │ Agent List  │  │Agent Detail │  │  Settings   │    │
│  │ (AVAudio)   │  │             │  │             │  │             │    │
│  └──────┬──────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Voice: AVAudioRecorder → Whisper API → CommandParser (Haiku)    │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Fastify)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Auth Routes │  │ Task Routes │  │ VPS Bridge  │  │ Webhooks    │    │
│  │ (GitHub)    │  │ (CRUD)      │  │             │  │ (GitHub)    │    │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └─────────────┘    │
│                          │                                               │
│                          ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Task Queue + WebSocket for real-time updates         │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER'S VPS (Claude Code Bridge)                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Claude Code CLI Execution                      │   │
│  │  • Clone repo  • Read/Edit files  • Run commands  • Create PR    │   │
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

### CodebaseContext
```typescript
interface CodebaseContext {
  repoUrl: string;
  branch: string;
  framework: 'react' | 'vue' | 'next' | 'express' | 'fastify' | 'unknown';
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'unknown';
  relevantFiles: {
    path: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  dependencies: { name: string; version: string }[];
  analyzedAt: Date;
}
```

---

## 3. API Endpoints

### Implemented Endpoints (cadence-api/)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `GET` | `/api/health` | Health check | ✅ Implemented |
| `GET` | `/api/tasks` | List all tasks | ✅ Implemented |
| `GET` | `/api/tasks/:id` | Get task detail | ✅ Implemented |
| `POST` | `/api/tasks` | Create new task | ✅ Implemented |
| `DELETE` | `/api/tasks/:id` | Cancel task | ✅ Implemented |
| `POST` | `/api/voice/transcribe` | Transcribe audio (Whisper) | ✅ Implemented |
| `POST` | `/api/voice/parse` | Parse text to command | ✅ Implemented |
| `POST` | `/api/voice/command` | Transcribe + parse combo | ✅ Implemented |
| `POST` | `/api/input/text` | Text input (keyboard) | ✅ Implemented |
| `POST` | `/api/input/command` | Direct command execution | ✅ Implemented |
| `WS` | `/api/ws/stream` | WebSocket streaming | ✅ Implemented |
| `GET` | `/api/ws/health` | WebSocket health check | ✅ Implemented |
| `POST` | `/api/webhooks/github` | GitHub webhook handler | ✅ Implemented |

### Planned Endpoints (Not Yet Implemented)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `POST` | `/api/auth/github` | OAuth callback | 📋 Planned |
| `GET` | `/api/repos` | List user repositories | 📋 Planned |
| `POST` | `/api/codebase/analyze` | Analyze repository | 📋 Planned |

> **Note:** The API uses "tasks" terminology (not "agents") to match the backend implementation.

---

## 4. Execution Environment: ✅ DECISION MADE

### The Problem

Claude agents need a runtime environment with:
- File system access (clone repos, read/write files)
- Command execution (npm install, tests, git)
- Network access (GitHub API, npm registry)
- Isolation (security sandbox per user)

### MVP Decision: **Fly.io Machines**

After comparing Modal.com vs Fly.io for MVP validation:

| Factor | Modal.com | Fly.io | Winner |
|--------|-----------|--------|--------|
| **Minimum cost** | $0 (pay per use) | $0 (pay per use) | Tie |
| **Cold start** | 1-5s | 0s (with warm) | **Fly.io** |
| **Keep warm option** | No native | `min_machines_running=1` | **Fly.io** |
| **Node.js support** | Beta (Python-first) | **Native** | **Fly.io** |
| **Docker support** | Custom images | **Full Docker** | **Fly.io** |
| **Persistent volumes** | Limited | **Full support** | **Fly.io** |
| **Hourly cost** | $0.10/hr | $0.02/hr | **Fly.io** |
| **Setup complexity** | Very simple | Simple | Modal |

### MVP Cost Estimate (Fly.io)

```
Base (1 warm machine):  $0.02/hr × 24hr × 30 days = $14.40/mo
Burst (extra machines): ~$5-15/mo during high usage
────────────────────────────────────────────────────────────
Total MVP cost:         ~$20-30/mo (regardless of user count)
```

### Why Fly.io Wins for MVP

1. **Node.js is first-class** - Backend is Fastify/TypeScript. Modal is Python-first.
2. **Warm machines = zero cold start** - ~$15/mo for instant response
3. **5x cheaper** - $0.02/hr vs $0.10/hr
4. **Full Docker** - Clone repos, run npm, git push all native
5. **Easy VPS migration** - Fly containers are just Docker

### Fly.io Configuration

```toml
# fly.toml
app = "cadence-agent-runner"

[build]
  dockerfile = "Dockerfile.agent"

[http_service]
  internal_port = 8080
  force_https = true
  min_machines_running = 1  # Keep 1 warm (zero cold start)

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 4096

[mounts]
  source = "repos_cache"
  destination = "/home/cadence/repos"
```

### Scale Decision: Hetzner VPS per User

See **Section 6** for detailed VPS-per-user architecture for Pro tier.

---

## 5. Voice Pipeline (Swift Native)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      VOICE PIPELINE (iOS Native)                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. RECORD                    2. TRANSCRIBE              3. PARSE        │
│  ┌─────────────┐             ┌─────────────┐            ┌─────────────┐  │
│  │AVAudioRec-  │────M4A─────>│ Whisper API │───Text───> │Claude Haiku │  │
│  │order        │   (50KB)    │ (OpenAI)    │            │  (Parser)   │  │
│  │             │             │             │            │             │  │
│  │ Target: 30s │             │ ~300ms      │            │ ~200ms      │  │
│  │ max         │             │ 98% acc     │            │ Intent+Ents │  │
│  └─────────────┘             └──────┬──────┘            └──────┬──────┘  │
│                                     ^                          │         │
│                                     │ (Inject Keywords)        │         │
│                              ┌──────┴──────┐                   │         │
│                              │  Context    │                   │         │
│                              │  Analyzer   │                   │         │
│                              └─────────────┘                   │         │
│                                                                 │         │
│  4. EXECUTE                   5. RESPOND                       │         │
│  ┌─────────────┐             ┌─────────────┐                   │         │
│  │   Backend   │<────────────│   Router    │<──────────────────┘         │
│  │   + VPS     │             │             │                              │
│  │   Bridge    │             │ Route to    │                              │
│  │             │             │ handler     │                              │
│  └──────┬──────┘             └─────────────┘                              │
│         │                                                                  │
│         ▼                                                                  │
│  ┌─────────────┐                                                          │
│  │AVSpeech-    │  "Agent started. I'll notify you when complete."        │
│  │Synthesizer  │                                                          │
│  │  <50ms      │                                                          │
│  └─────────────┘                                                          │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

Total latency target: <2 seconds end-to-end
```

### Wispr Flow Parity Strategy (Reverse Engineered)

To match **Wispr Flow's 95-98% accuracy**, we use a **Context Injection** strategy:

1.  **Codebase Analysis**: Before recording, we scan the user's recent files/active repo.
2.  **Keyword Extraction**: Extract variable names, libraries, and functions (e.g., `useEffect`, `FastifyInstance`).
3.  **Prompt Injection**: Pass these keywords to Whisper's `prompt` parameter.
    *   *Result:* Whisper hears "use effect" -> transcribes `useEffect` because it's in the prompt.

**Architecture Reference:** See `WISPR_FLOW_RESEARCH_SUMMARY.md` for full reverse-engineering details.

---

## 5.1 Real-Time Streaming Architecture (Implemented)

The backend implements a two-layer streaming architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     STREAMING ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  iOS App (Swift)                Backend API                User's VPS   │
│  ┌─────────────┐              ┌─────────────┐            ┌─────────────┐│
│  │ WebSocket   │◄─────WS─────►│ StreamMan-  │◄────SSE───►│ Claude Code ││
│  │ Client      │   Events     │ ager        │  Events    │ Execution   ││
│  └─────────────┘              └─────────────┘            └─────────────┘│
│                                                                          │
│  Events:                       Subscription:              SSE Format:    │
│  • task_started               • subscribe(taskId)        • data: {...}  │
│  • tool_use                   • unsubscribe(taskId)      • type: output │
│  • file_edit                  • emit(event)              • type: tool   │
│  • command_run                                                           │
│  • output                                                                │
│  • error                                                                 │
│  • task_completed                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Streaming Flow

1. **Client connects** via WebSocket to `/api/ws/stream`
2. **Client subscribes** to task ID: `{ "type": "subscribe", "taskId": "..." }`
3. **VPS streams events** via Server-Sent Events (SSE) to backend
4. **Backend forwards** events to subscribed WebSocket clients
5. **Client receives** real-time updates (tool usage, file edits, output)

### Input Methods

| Method | Endpoint | Use Case |
|--------|----------|----------|
| Voice | `/api/voice/command` | Primary - hands-free coding |
| Text | `/api/input/text` | Fallback - keyboard input |
| Direct | `/api/input/command` | Programmatic - direct action |

---

## 5.2 Known Limitations & Future Work

### Current Limitations

| Limitation | Description | Mitigation |
|------------|-------------|------------|
| **In-memory storage** | Tasks stored in Map, lost on restart | Planned: PostgreSQL |
| **No authentication** | API is open, no user isolation | Planned: GitHub OAuth |
| **Mock VPS mode** | Real VPS execution not tested | VPS bridge has mock mode |
| **No rate limiting** | API can be abused | Planned: Rate limiting |
| **Single process** | No horizontal scaling | Planned: Redis pub/sub |

### Not Yet Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| iOS App | 📋 Planned | See `cadence-ios/PLAN.md` |
| GitHub OAuth | 📋 Planned | For user authentication |
| Database | 📋 Planned | PostgreSQL via Neon |
| VPS Provisioning | 📋 Planned | Hetzner API integration |
| TTS Responses | 📋 Planned | AVSpeechSynthesizer in iOS |

### Test Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| Tasks API | 9 | CRUD + validation |
| Input API | 9 | Text + command handling |
| Voice API | 11 | Transcribe, parse, command endpoints |
| Webhooks | 10 | Signature + PR/comment side effects |
| StreamManager | 18 | Subscriptions + events + message handling |
| VPS Bridge | 4 | Mock streaming |
| Command Parser | 15 | Intent detection |
| Health | 1 | Basic check |
| **Total** | **77** | Core functionality |

---

## 6. Execution Architecture: VPS-per-User Analysis

### Why Consider VPS-per-User?

**The cold start problem with serverless containers:**
- Modal.com: 1-5s cold start
- Fly.io: 2-10s cold start
- User says "start agent" → waits 5-10s → feels slow

**VPS-per-user benefits:**
- **Zero cold start** - VM always running
- **Persistent workspace** - repos stay cloned
- **Faster subsequent agents** - dependencies cached
- **Predictable pricing** - flat monthly cost

### Architecture: VPS-per-User Model

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
│  │  │              Agent Execution Daemon                      │     │   │
│  │  │                                                          │     │   │
│  │  │  • Listens for tasks via API/WebSocket                  │     │   │
│  │  │  • Manages cloned repositories (~5 repos cached)        │     │   │
│  │  │  • Runs Claude Agent SDK                                │     │   │
│  │  │  • Streams logs back to backend                         │     │   │
│  │  └─────────────────────────────────────────────────────────┘     │   │
│  │                                                                   │   │
│  │  /home/cadence/                                                       │   │
│  │  ├── repos/                                                       │   │
│  │  │   ├── wallet-frontend/     (cloned, npm installed)            │   │
│  │  │   ├── api-service/         (cloned, cached)                   │   │
│  │  │   └── ...                                                      │   │
│  │  ├── agent-daemon/            (our execution service)            │   │
│  │  └── .anthropic/              (API key, config)                  │   │
│  │                                                                   │   │
│  │  Security:                                                        │   │
│  │  • Firewall: Only egress to GitHub, npm, Anthropic API          │   │
│  │  • No SSH access for user (managed by us)                        │   │
│  │  • Automatic security updates                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### VPS Providers Comparison

| Provider | Smallest VPS | Specs | Price/mo | API Quality |
|----------|--------------|-------|----------|-------------|
| **Hetzner Cloud** | CX22 | 2 vCPU, 4GB, 40GB | €4.49 (~$4.85) | Excellent |
| **DigitalOcean** | Basic 2GB | 1 vCPU, 2GB, 50GB | $12 | Excellent |
| **Vultr** | VC2-1C-2GB | 1 vCPU, 2GB, 55GB | $10 | Good |
| **Linode** | Nanode 1GB | 1 vCPU, 1GB, 25GB | $5 | Good |
| **AWS Lightsail** | 2GB | 1 vCPU, 2GB, 60GB | $10 | Good |

**Recommendation: Hetzner Cloud** - Best price/performance, excellent API, EU + US regions.

### Hybrid Architecture (Best of Both Worlds)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HYBRID EXECUTION MODEL                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FREE TIER ($0/mo):                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Serverless execution (Modal.com / Fly.io)                       │   │
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
│  │  • Cost to us: ~$4.85/mo → 68% margin                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ENTERPRISE TIER ($75/mo):                                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Larger VPS (Hetzner CX32 or CX42)                               │   │
│  │  • 4-8 vCPU, 8-16GB RAM                                          │   │
│  │  • Parallel agents (run 2-4 simultaneously)                      │   │
│  │  • Priority support                                              │   │
│  │  • Cost to us: ~$15-25/mo → 66-80% margin                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation: Agent Daemon

The agent daemon runs on each user's VPS:

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

    // 3. Process streaming response
    for await (const event of response) {
      this.ws.send(JSON.stringify({
        type: 'event',
        agentId: task.id,
        event
      }));
    }

    // 4. Notify completion
    this.ws.send(JSON.stringify({
      type: 'completed',
      agentId: task.id
    }));
  }

  private async prepareRepo(repoUrl: string, branch: string): Promise<string> {
    const repoName = repoUrl.split('/').pop()?.replace('.git', '');
    const repoPath = `${this.reposDir}/${repoName}`;

    if (await this.repoExists(repoPath)) {
      // Fast path: just fetch and checkout
      await exec(`git -C ${repoPath} fetch origin ${branch}`);
      await exec(`git -C ${repoPath} checkout ${branch}`);
      await exec(`git -C ${repoPath} pull origin ${branch}`);
    } else {
      // Clone fresh
      await exec(`git clone ${repoUrl} ${repoPath}`);
      await exec(`git -C ${repoPath} checkout ${branch}`);
      // Install dependencies
      if (await this.fileExists(`${repoPath}/package.json`)) {
        await exec(`cd ${repoPath} && npm install`);
      }
    }

    return repoPath;
  }
}
```

### VPS Provisioning Flow

```
User subscribes to Pro ($15/mo)
         │
         ▼
┌─────────────────────────────────────────────┐
│  1. Provision VPS via Hetzner API           │
│     POST /servers { type: 'cx22', ... }     │
│     Response: { id: 123, ip: '1.2.3.4' }    │
└────────────────────┬────────────────────────┘
                     │ ~30-60 seconds
                     ▼
┌─────────────────────────────────────────────┐
│  2. Bootstrap script via cloud-init         │
│     - Install Node.js 20, git, docker       │
│     - Create vox user                       │
│     - Clone agent-daemon repo               │
│     - Configure firewall                    │
│     - Start daemon as systemd service       │
└────────────────────┬────────────────────────┘
                     │ ~2-3 minutes
                     ▼
┌─────────────────────────────────────────────┐
│  3. Daemon connects to backend              │
│     WebSocket → /ws/daemon                  │
│     Ready to receive tasks                  │
└────────────────────┬────────────────────────┘
                     │
                     ▼
         User can now create agents
         with ZERO cold start!
```

---

## 7. Cost Comparison

### Per-User Economics

| Model | Infrastructure | Claude API | Total/User/Mo | Margin at $15 |
|-------|---------------|------------|---------------|---------------|
| **Modal.com** | ~$3-5 | ~$5-10 | $8-15 | 0-47% |
| **VPS (Hetzner)** | $4.85 | ~$5-10 | $10-15 | 0-33% |
| **Hybrid Free** | ~$2-3 | ~$2 | $4-5 | N/A (free) |
| **Hybrid Pro** | $4.85 | ~$5-10 | $10-15 | 0-33% |

### At Scale (1000 Pro Users)

| Model | Monthly Cost | Revenue | Gross Margin |
|-------|--------------|---------|--------------|
| **Modal.com** | $8,000-15,000 | $15,000 | 0-47% |
| **VPS (Hetzner)** | $4,850 infra + $5-10K API | $15,000 | 0-40% |
| **Hybrid** | $4,850 + ~$7,000 API | $15,000 | ~20% |

**Note:** Claude API costs dominate. VPS saves ~$3K/mo vs Modal at 1000 users.

---

## 8. Recommended Architecture Decision

### For MVP (Weeks 1-8): Use Fly.io Machines

**Why:**
- Simpler than VPS management
- Pay-per-use reduces risk
- Can be "warm" with min_machines_running
- Easy to migrate later

```typescript
// Fly.io Machine configuration
const machineConfig = {
  image: 'vox-agent:latest',
  guest: {
    cpu_kind: 'shared',
    cpus: 2,
    memory_mb: 4096
  },
  auto_destroy: true,
  restart: { policy: 'no' }
};
```

### For Scale (Post-100 Users): Migrate to VPS

**Why:**
- Proven product-market fit
- Predictable costs
- Better user experience (zero cold start)
- Higher margins

### Implementation Path

```
Week 1-8:   Fly.io Machines (serverless)
            ↓
Week 9-12:  Build VPS provisioning (Hetzner API)
            ↓
Week 13-16: Migrate Pro users to VPS
            ↓
Post-MVP:   Hybrid model (Free=serverless, Pro=VPS)
```

---

## 9. Security Requirements

### VPS Security Checklist

- [ ] Firewall: Only egress to GitHub, npm, PyPI, Anthropic
- [ ] No SSH keys for users (managed by us only)
- [ ] Automatic security updates (unattended-upgrades)
- [ ] Secrets stored in env vars, not files
- [ ] Disk encryption at rest
- [ ] Logs shipped to central system (no local retention)
- [ ] Resource limits (ulimit, cgroups)
- [ ] Agent runs as unprivileged user

### Isolation Model

```
┌─────────────────────────────────────────────┐
│  User A's VPS                               │
│  ┌───────────────────────────────────────┐  │
│  │ Agent Daemon (unprivileged)           │  │
│  │ • Can only access /home/cadence       │  │
│  │ • Cannot install system packages      │  │
│  │ • Cannot access other users' data     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  User B's VPS (completely separate)         │
│  ┌───────────────────────────────────────┐  │
│  │ Agent Daemon (unprivileged)           │  │
│  │ • Same isolation as User A            │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 10. Summary: Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **iOS Framework** | **Swift + SwiftUI** | Native voice APIs, best UX |
| **Backend** | Fastify + TypeScript | Fast, type-safe, familiar |
| **Database** | Neon PostgreSQL | Serverless, auto-scale |
| **STT** | OpenAI Whisper API | 95-98% accuracy, reliable |
| **TTS** | AVSpeechSynthesizer | Free, native, low latency |
| **Real-time** | WebSocket | Direct, no third-party |
| **Execution** | User's VPS + Claude Code | User controls environment |
| **AI Core** | Claude Code CLI | Battle-tested agent execution |

---

## 11. GitHub Integration & Workflow Automation

See **[GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md)** for the complete GitHub integration design.

### Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| **PR Close/Merge** | ✅ Implemented | Updates task to completed/cancelled |
| **@cadence-ai Mentions** | ✅ Implemented | Creates new task from comment |
| **Signature Verification** | ✅ Implemented | HMAC SHA-256 validation |

### Planned Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Issue Integration** | 📋 Planned | Start agents from GitHub Issues |
| **Check Run Status** | 📋 Planned | Update task with CI status |
| **Push Events** | 📋 Planned | Track commits to branches |
| **Linear/Slack** | 📋 Planned | External issue tracker integration |

### Auto-Archive Workflow

```
PR Merged → Webhook fires → Task marked "completed"
PR Closed → Webhook fires → Task marked "cancelled"
@cadence-ai mention → Webhook fires → New task created
```

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview and navigation |
| [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) | GitHub workflow automation |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Task breakdown and code samples |
| [UI_WIREFRAMES.md](./04-design/UI_WIREFRAMES.md) | Mobile UI mockups |
| [RISK_ANALYSIS.md](./01-planning/RISK_ANALYSIS_AND_VIABILITY.md) | Business viability |

---

**Architecture Version:** 3.1
**Updated:** December 28, 2025
**Status:** Backend Complete - iOS Development Pending

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 3.1 | Dec 28, 2025 | Fixed webhook stubs, added voice tests, 77 tests total |
| 3.0 | Dec 28, 2025 | Added streaming architecture, limitations, updated endpoints |
| 2.1 | Dec 27, 2025 | Swift iOS decision, VPS-per-user analysis |
| 2.0 | Dec 27, 2025 | Initial architecture document |
