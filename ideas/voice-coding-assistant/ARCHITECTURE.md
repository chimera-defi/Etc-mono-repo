# Vox Architecture Guide

> **Single-page architecture reference for the Voice AI Coding Assistant**
>
> Last Updated: December 25, 2025 | Status: Ready for Implementation

---

## Quick Reference

| Component | Technology | Cost |
|-----------|-----------|------|
| Mobile App | React Native + Expo SDK 52 | Free |
| Backend API | Fastify 4 + TypeScript | $20-50/mo |
| AI Agents | Claude API + Agent SDK | ~$0.50/agent |
| STT | OpenAI Whisper API | $0.006/min |
| TTS | expo-speech (on-device) | Free |
| Database | PostgreSQL (Neon) | $0-25/mo |
| Real-time | Supabase Realtime | $0-25/mo |
| **Execution** | **See Section 4 - Critical Decision** | **TBD** |

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
│  │  Voice Processing: expo-av → Whisper API → CommandParser (Haiku) │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Fastify)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Auth Routes │  │Agent Routes │  │ Codebase    │  │ Webhooks    │    │
│  │ (GitHub)    │  │ (CRUD)      │  │ Analyzer    │  │ (GitHub)    │    │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └─────────────┘    │
│                          │                                               │
│                          ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Agent Orchestrator (Queue + State + Health)          │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXECUTION ENVIRONMENT (See Section 4)                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Claude Agent SDK Execution                     │   │
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
| `POST` | `/api/codebase/analyze` | Analyze repository |
| `GET` | `/api/repos` | List user repositories |

---

## 4. Execution Environment: The Critical Decision

### The Problem

Claude Agent SDK needs a runtime environment with:
- File system access (clone repos, read/write files)
- Command execution (npm install, tests, git)
- Network access (GitHub API, npm registry)
- Isolation (security sandbox per user)

### Option Comparison

| Option | Cold Start | Cost | Always-On | Security | Maintenance |
|--------|-----------|------|-----------|----------|-------------|
| **Modal.com** | 1-5s | $0.10/hr | No | High | Low |
| **Fly.io Machines** | 2-10s | $0.02/hr | Optional | Medium | Low |
| **VPS per User** | 0s | $5-15/user/mo | **Yes** | Medium | High |
| **GitHub Codespaces** | 30-60s | $0.18/hr | No | High | Low |
| **Self-hosted K8s** | 5-15s | ~$100/mo base | Yes | High | Very High |

### Recommended: Hybrid VPS + Serverless

See **Section 6** for detailed VPS-per-user architecture analysis.

---

## 5. Voice Pipeline

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           VOICE PIPELINE                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. RECORD                    2. TRANSCRIBE              3. PARSE        │
│  ┌─────────────┐             ┌─────────────┐            ┌─────────────┐  │
│  │   expo-av   │────M4A─────>│  Whisper    │───Text───> │Claude Haiku │  │
│  │  Recording  │   (50KB)    │    API      │            │  (Parser)   │  │
│  │             │             │             │            │             │  │
│  │ Target: 30s │             │ ~300ms      │            │ ~200ms      │  │
│  │ max         │             │ 95-98% acc  │            │ Intent+Ents │  │
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
│  ┌─────────────┐                                                          │
│  │ expo-speech │  "Agent started. I'll notify you when complete."        │
│  │   (TTS)     │                                                          │
│  │  <50ms      │                                                          │
│  └─────────────┘                                                          │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

Total latency target: <2 seconds end-to-end
```

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
│  │  /home/vox/                                                       │   │
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
  private reposDir = '/home/vox/repos';

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
│  │ • Can only access /home/vox           │  │
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
| **Mobile Framework** | React Native + Expo | Cross-platform, fast iteration |
| **Backend** | Fastify + TypeScript | Fast, type-safe, familiar |
| **Database** | Neon PostgreSQL | Serverless, auto-scale |
| **STT** | OpenAI Whisper API | 95-98% accuracy, reliable |
| **TTS** | expo-speech | Free, on-device, low latency |
| **Real-time** | Supabase Realtime | WebSocket, free tier |
| **Execution (MVP)** | Fly.io Machines | Simple, pay-per-use |
| **Execution (Scale)** | Hetzner VPS per user | Zero cold start, predictable |
| **AI Core** | Claude API + Agent tools | Best coding capability |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview and navigation |
| [DEVELOPMENT_KICKOFF.md](./03-development/DEVELOPMENT_KICKOFF.md) | Task breakdown and prompts |
| [ARCHITECTURE_REVIEW.md](./02-architecture/ARCHITECTURE_REVIEW.md) | Unknown unknowns and gaps |
| [RISK_ANALYSIS.md](./01-planning/RISK_ANALYSIS_AND_VIABILITY.md) | Business viability |

---

**Architecture Version:** 2.0
**Updated:** December 25, 2025
**Status:** Ready for Implementation
