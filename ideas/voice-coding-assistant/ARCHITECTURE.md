# Cadence Architecture Guide

> **Architecture reference for the Voice AI Coding Assistant**
>
> Last Updated: January 9, 2026 | Status: Backend Complete - GitHub OAuth + PR Lifecycle
>
> ⚠️ **Note:** This architecture has been updated to use **Swift/SwiftUI** for iOS instead of React Native.
>
> **Execution Strategy:** MVP uses user's own VPS (BYOV). Managed sandboxes (E2B, Fly.io, Modal) planned for future phases.
>
> **Implementation Status:** Backend API is fully scaffolded with streaming, text input, and webhook support. See Section 3 for actual endpoints.

---

## Quick Reference

| Component | Technology | Cost |
|-----------|-----------|------|
| **Web Frontend** | **Next.js 14 + TypeScript** | Free |
| **iOS App** | **Swift + SwiftUI** | Free |
| Backend API | Fastify 4 + TypeScript | $20-50/mo |
| AI Agents | Claude Code CLI | ~$0.50/agent |
| STT | OpenAI Whisper API | $0.006/min |
| TTS | AVSpeechSynthesizer (native) | Free |
| Database | PostgreSQL (Neon) | $0-25/mo |
| Real-time | WebSocket | $0 |
| **Execution** | **User's VPS + Claude Code** | **User provides** |

---

## Web Frontend (cadence-web-frontend/)

A full-featured Next.js web application that mirrors the mobile app functionality, allowing development and testing of the Cadence system via browser.

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand + localStorage |
| Icons | Lucide React |

### Features

| Feature | Description |
|---------|-------------|
| **Voice Interface** | MediaRecorder API + OpenAI Whisper transcription |
| **Task Dashboard** | List/filter tasks with real-time WebSocket updates |
| **Task Detail** | Live streaming output, cancel running tasks |
| **GitHub Integration** | Repository list, webhook setup info |
| **Settings** | API endpoint, keys, voice preferences, dark/light mode |

### Project Structure

```
cadence-web-frontend/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # UI components (Navigation, VoiceInterface, TaskList, etc.)
│   ├── hooks/            # Custom hooks (useVoiceRecorder, useWebSocket)
│   └── lib/              # Services (api.ts, store.ts, websocket.ts, types.ts)
├── package.json
└── tailwind.config.ts
```

### Running Locally

```bash
cd cadence-web-frontend
npm install
npm run dev
# Open http://localhost:3000
```

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

### GitHub OAuth & Repository Endpoints

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `GET` | `/api/auth/github` | Initiate GitHub OAuth flow | ✅ Implementing |
| `GET` | `/api/auth/github/callback` | OAuth callback handler | ✅ Implementing |
| `GET` | `/api/auth/me` | Get current user info | ✅ Implementing |
| `POST` | `/api/auth/logout` | Clear session | ✅ Implementing |
| `GET` | `/api/repos` | List user's GitHub repositories | ✅ Implementing |

### Planned Endpoints (Not Yet Implemented)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
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

### MVP Decision: **User's Own VPS (BYOV)**

**Why VPS-first:**
- **Zero infrastructure cost** - user provides VPS ($5-10/mo any provider)
- **Full control** - users manage their own environment
- **Zero cold start** - always-on VM, instant response
- **Simple architecture** - no managed sandbox integration needed
- **Educational** - users learn deployment, understand how it works

**User Setup (5 minutes):**
1. User has any Linux VPS (Hetzner, DigitalOcean, Linode, etc.)
2. Run bootstrap script: `curl -fsSL https://setup.cadence.dev | sh`
3. Enter Anthropic API key when prompted
4. Connect mobile app to VPS IP + API key
5. Done - start coding with voice

### VPS Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 2GB | 4GB |
| **Storage** | 20GB | 40GB |
| **OS** | Ubuntu 22.04+ | Ubuntu 24.04 LTS |
| **Network** | Egress to GitHub, npm, Anthropic API | Firewall configured |
| **Cost** | ~$5/mo (Linode, Hetzner) | ~$10-12/mo (DigitalOcean) |

### Bootstrap Script

The `cadence-setup/bootstrap.sh` script handles setup automatically:
- Installs Node.js 20, git, Claude Code CLI
- Creates unprivileged `cadence` user
- Configures firewall (egress only)
- Starts agent daemon as systemd service
- Generates API key for mobile app connection

See **Section 6** for detailed VPS architecture and daemon implementation.

---

### Future: Managed Sandbox Options

For users who don't want to manage VPS, we'll add managed sandbox options in future phases:

| Provider | Cold Start | Cost/Hour | Best For |
|----------|------------|-----------|----------|
| **E2B** | 150ms | $0.05 | AI agents, fastest startup |
| **Fly.io** | 2-10s | $0.02 | General compute, cheapest |
| **Modal** | 1-5s | $0.10 | ML workloads, GPU support |

**Roadmap:**
- **Phase 1 (Current):** VPS-only (BYOV)
- **Phase 2 (After mobile app):** Add E2B as managed option
- **Phase 3 (Scale):** Full hybrid (Free=E2B limited, Pro=VPS or managed)

See **[E2B_SANDBOX_ANALYSIS.md](./E2B_SANDBOX_ANALYSIS.md)** for detailed comparison and future integration plans.

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

### Phase 1: VPS-Only MVP (Weeks 1-16)

**Execution:** User's own VPS (BYOV - Bring Your Own VPS)

**Why VPS-first:**
- **Zero infrastructure cost** - users provide their own VPS
- **Faster to market** - no managed sandbox integration
- **User control** - technical users prefer owning infrastructure
- **Zero cold start** - always-on VM
- **Simpler architecture** - direct SSH/HTTP to user's VPS

**What to build:**
- Bootstrap script (`cadence-setup/bootstrap.sh`)
- Agent daemon for VPS (`cadence-daemon/`)
- Mobile app with VPS connection settings
- Backend API for voice transcription + WebSocket

**Target users:** Technical developers comfortable with VPS

---

### Phase 2: Mobile App Development (Weeks 17-20)

**Focus:** Polish mobile experience

**What to build:**
- iOS app (Swift/SwiftUI) per `cadence-ios/PLAN.md`
- Voice recording + transcription UI
- Task list, detail views, streaming updates
- VPS connection management

**Still using:** VPS-only execution

---

### Phase 3: Add Managed Sandboxes (Weeks 21+)

**New option:** E2B managed sandboxes alongside VPS

**Why add E2B:**
- **Lower barrier** - non-technical users want zero-ops
- **Faster setup** - 5 minutes → 30 seconds
- **No VPS management** - we handle infrastructure

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│               EXECUTION OPTIONS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  DIY (Free):                 Managed (Pro $15/mo):      │
│  ┌──────────────────┐       ┌──────────────────┐       │
│  │ User's VPS       │       │ E2B Sandbox      │       │
│  │ • Bring your own │       │ • Zero-ops       │       │
│  │ • Full control   │       │ • 150ms startup  │       │
│  │ • $5-10/mo       │       │ • $0.05/hr       │       │
│  └──────────────────┘       └──────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**What to build:**
- E2B integration (`cadence-api/src/services/e2b-runner.ts`)
- Execution provider selection in settings
- Billing for managed tier

See **[E2B_SANDBOX_ANALYSIS.md](./E2B_SANDBOX_ANALYSIS.md)** for E2B integration details.

---

### Sequential Roadmap

```
Phase 1 (Weeks 1-16):    VPS-only MVP
  └─ Backend API ✅ Done
  └─ Bootstrap script ✅ Done
  └─ Testing UI (cadence-web) ✅ Done
  └─ Mobile app → In Progress

Phase 2 (Weeks 17-20):   Mobile App Polish
  └─ iOS Swift app
  └─ Voice UI
  └─ VPS connection

Phase 3 (Weeks 21+):     Managed Sandboxes
  └─ E2B integration
  └─ Billing/tiers
  └─ Optional: Fly.io, Modal
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

## 12. GitHub OAuth + PR Lifecycle (NEW)

### Core Concept: 1 Task = 1 Pull Request

Every task in Cadence creates exactly one PR. The frontend tracks tasks through their PR lifecycle:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TASK → PR LIFECYCLE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER CREATES TASK                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • User selects repo from connected GitHub repos                     │   │
│  │  • User describes task via voice or text                             │   │
│  │  • Task status: "pending" → "running"                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  2. AGENT EXECUTES + CREATES PR                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • Agent clones repo, creates branch                                 │   │
│  │  • Agent implements task, creates PR                                 │   │
│  │  • Task.prUrl = PR URL, Task.prNumber = PR #                         │   │
│  │  • Task status: "running" → "pr_open"                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                                        ▼                                     │
│  3. PR AWAITS REVIEW/MERGE                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  • Frontend shows task in "Open PRs" section                         │   │
│  │  • User reviews PR on GitHub                                         │   │
│  │  • WebSocket updates stream CI status, review comments               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                        │                                     │
│                          ┌─────────────┴─────────────┐                      │
│                          ▼                           ▼                      │
│  4a. PR MERGED                          4b. PR CLOSED (without merge)       │
│  ┌────────────────────────┐             ┌────────────────────────┐          │
│  │  Webhook fires         │             │  Webhook fires         │          │
│  │  Task → "completed"    │             │  Task → "cancelled"    │          │
│  │  Moves to "Merged"     │             │  User can restart      │          │
│  └────────────────────────┘             └────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### GitHub OAuth Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GITHUB OAUTH FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Frontend (Settings)                Backend API                  GitHub     │
│  ┌─────────────┐                 ┌─────────────┐              ┌──────────┐  │
│  │ "Connect    │──── GET ───────>│ /auth/      │──redirect──>│ OAuth    │  │
│  │  GitHub"    │    /auth/github │ github      │             │ authorize│  │
│  └─────────────┘                 └─────────────┘              └────┬─────┘  │
│                                                                     │        │
│                                                                     │        │
│  ┌─────────────┐                 ┌─────────────┐              ┌────▼─────┐  │
│  │ Repos list  │<── redirect ────│ /auth/      │<── code ────│ Callback │  │
│  │ populated   │    + token      │ callback    │             │          │  │
│  └─────────────┘                 └─────────────┘              └──────────┘  │
│                                                                              │
│  Token Storage: httpOnly cookie (secure, same-site)                         │
│  Scopes: repo, read:user                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Updated Task Data Model

```typescript
interface Task {
  id: string;
  task: string;                    // Task description
  repoUrl?: string;                // GitHub repo URL
  repoPath?: string;               // Optional subfolder
  status: TaskStatus;              // Extended with PR states

  // PR Lifecycle Fields (NEW)
  prUrl?: string;                  // PR URL once created
  prNumber?: number;               // PR number (#123)
  prState?: 'open' | 'merged' | 'closed';  // PR state from webhook
  prBranch?: string;               // Feature branch name

  output?: string;
  createdAt: string;
  completedAt?: string;
}

// Extended status to include PR states
type TaskStatus =
  | 'pending'      // Task created, not started
  | 'running'      // Agent executing, no PR yet
  | 'pr_open'      // PR created, awaiting review/merge
  | 'completed'    // PR merged successfully
  | 'failed'       // Agent error
  | 'cancelled';   // PR closed without merge, or user cancelled
```

### Frontend UI Sections

```
┌────────────────────────────────────────────────────────────────┐
│                          TASKS VIEW                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│  IN PROGRESS (2)                              [+ New Task]      │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ● chimera-defi/wallet-frontend                           │  │
│  │   "Add dark mode theme support"                          │  │
│  │   Status: RUNNING • 67%                                  │  │
│  │   Started: 5 min ago                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│  OPEN PRs (3)                                                   │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ◐ chimera-defi/api-service         PR #189              │  │
│  │   "Implement caching layer"                              │  │
│  │   Branch: claude/caching-x7f2a                           │  │
│  │   CI: ✓ passing • Reviews: 0/1 required                  │  │
│  │   [View PR →]                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│  MERGED (12)                                    [View All →]    │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✓ chimera-defi/mobile-app          PR #156               │  │
│  │   "Add push notification support"                        │  │
│  │   Merged: Dec 28, 2025                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Webhook → Task Status Mapping

| Webhook Event | Action | Task Status Change |
|---------------|--------|-------------------|
| `pull_request.opened` | PR created by agent | `running` → `pr_open` |
| `pull_request.closed` + merged=true | PR merged | `pr_open` → `completed` |
| `pull_request.closed` + merged=false | PR closed | `pr_open` → `cancelled` |
| `pull_request.synchronize` | New commits pushed | No change (notify user) |
| `pull_request_review.submitted` | Review added | No change (notify user) |
| `check_run.completed` | CI finished | No change (update CI status) |

### Repository Selection

When creating a task, users select from their connected GitHub repositories:

```typescript
// GET /api/repos response
interface ReposResponse {
  repos: GitHubRepo[];
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;           // "owner/repo"
  html_url: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  updated_at: string;
}
```

### Environment Variables

```bash
# GitHub OAuth App
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=abc123...
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Existing webhook secret
GITHUB_WEBHOOK_SECRET=whsec_...
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

**Architecture Version:** 4.1
**Updated:** January 9, 2026
**Status:** Backend Complete - GitHub OAuth + PR Lifecycle Implementation

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 4.1 | Jan 9, 2026 | Added GitHub OAuth, PR lifecycle tracking (1 task = 1 PR), updated UI sections |
| 4.0 | Jan 9, 2026 | VPS-first architecture, E2B/sandboxes moved to future phases, sequential roadmap |
| 3.1 | Dec 28, 2025 | Fixed webhook stubs, added voice tests, 77 tests total |
| 3.0 | Dec 28, 2025 | Added streaming architecture, limitations, updated endpoints |
| 2.1 | Dec 27, 2025 | Swift iOS decision, VPS-per-user analysis |
| 2.0 | Dec 27, 2025 | Initial architecture document |
