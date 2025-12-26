# Architecture Review: Unknown Unknowns & Missing Pieces

> A critical analysis of what we don't know, what's missing, and what needs to be built

---

## 1. Project Naming Analysis

### Current Name: "Claudia"

**Pros:**
- Clever play on "Claude" + feminine suffix
- Easy to remember and pronounce
- Available as a brand name

**Cons:**
- Too on-the-nose (obviously derivative)
- Doesn't convey voice/mobile focus
- Could be confused with a person's name

### Recommended Alternatives

| Name | Meaning | Domain | Pros | Cons |
|------|---------|--------|------|------|
| **Vox** | Latin for "voice" | vox.dev, getvox.app | Short, memorable, unique, voice-focused | Common word, may have trademark issues |
| **Sonnet** | Claude model + poetry/voice | sonnet.dev | Connection to Claude, musical, elegant | Already a Claude model name |
| **Cadence** | Rhythm of speech/code | cadence.dev | Voice + code rhythm, professional | Generic, may be taken |
| **Aria** | Musical term, voice | aria.dev | Voice-related, elegant, AI-adjacent | Common for voice assistants |
| **Murmur** | Soft voice, developer whisper | murmur.dev | Unique, voice metaphor | Could imply quiet/uncertain |
| **Verse** | Poetry + code versioning | verse.dev | Voice + git metaphor | Abstract |
| **Hum** | Sound of development | hum.dev | Simple, memorable, dev-focused | Very short, abstract |

### **Decision: Cadence** ✅

**Chosen name:** Cadence - Professional, implies rhythm of voice and development

Other candidates considered:
- Vox - Clean, voice-focused (but common word, trademark concerns)
- Claudia - Connection to Claude (but too derivative)

---

## 2. Unknown Unknowns (Critical Gaps We Haven't Addressed)

### 2.1 Code Execution Environment (THE BIGGEST GAP)

**The Problem:**
The Claude Agent SDK needs a runtime environment with:
- File system access
- Ability to clone repositories
- Ability to run commands (npm install, tests, builds)
- Git operations (commit, push, branch)

**What's Missing:**
```
Question: WHERE does the agent actually run code?

Current Architecture:       Required Architecture:
┌─────────────────┐        ┌─────────────────┐
│   Backend API   │        │   Backend API   │
│   (Fastify)     │        │   (Fastify)     │
└────────┬────────┘        └────────┬────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐        ┌─────────────────────────┐
│  Claude Agent   │        │  Execution Orchestrator │
│  SDK (query())  │        └────────────┬────────────┘
└────────┬────────┘                     │
         │                    ┌─────────┴─────────┐
         ▼                    ▼                   ▼
      ??? ←──────────   ┌──────────┐       ┌──────────┐
      Where does         │ Worker 1 │       │ Worker 2 │
      code run?          │ (Docker) │       │ (Docker) │
                         └──────────┘       └──────────┘
```

**Options We Haven't Evaluated:**

| Option | Setup Time | Cost | Security | Scalability |
|--------|------------|------|----------|-------------|
| **GitHub Codespaces API** | Low | $0.18/hr | High | High |
| **Gitpod Workspaces** | Low | $0.36/hr | High | High |
| **AWS CodeBuild** | Medium | Pay per build | High | High |
| **Self-hosted Docker** | High | ~$50/mo base | Medium | Medium |
| **Fly.io Machines** | Low | ~$0.01/hr | Medium | High |
| **Modal.com** | Low | ~$0.10/hr | High | High |
| **Railway** | Low | ~$5/mo base | Medium | Medium |

**Recommendation:** Investigate **Modal.com** or **Fly.io Machines** for on-demand container execution. Both support:
- Instant spin-up (< 1s)
- Pay-per-second billing
- Container isolation
- Persistent volumes (for cloned repos)

**Action Items:**
- [ ] Prototype with Modal.com
- [ ] Prototype with Fly.io Machines
- [ ] Evaluate GitHub Codespaces API (if available)
- [ ] Define security requirements
- [ ] Design cleanup/teardown strategy

---

### 2.2 Repository State Management

**The Problem:**
Where do repositories get cloned? How do we manage state?

**Unanswered Questions:**
1. Do we clone the full repo or shallow clone?
2. How long do we keep cloned repos?
3. What about large repos (> 1GB)?
4. How do we handle submodules?
5. What about private dependencies (npm private packages)?

**Missing Design:**
```typescript
interface RepoStateManager {
  // Clone or fetch latest
  prepareRepo(repoUrl: string, branch: string): Promise<RepoState>;

  // Cleanup after agent completes
  cleanup(repoState: RepoState): Promise<void>;

  // Cache management
  getCacheStats(): CacheStats;
  evictLRU(): Promise<void>;
}

interface RepoState {
  localPath: string;
  commitHash: string;
  clonedAt: Date;
  lastAccessedAt: Date;
  sizeBytes: number;
}
```

**Estimated Complexity:** HIGH - This affects cost, performance, and reliability

---

### 2.3 Agent Orchestration & Lifecycle

**The Problem:**
How do we manage agent lifecycle across restarts, failures, and scaling?

**Missing Components:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Agent Queue  │  │ State Manager│  │ Health Check │      │
│  │              │  │              │  │              │      │
│  │ - Pending    │  │ - Redis/DB   │  │ - Heartbeat  │      │
│  │ - Running    │  │ - Recovery   │  │ - Timeouts   │      │
│  │ - Stalled    │  │ - Checkpoints│  │ - Alerts     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Worker Pool                         │    │
│  │                                                      │    │
│  │  Worker 1     Worker 2     Worker 3     Worker N    │    │
│  │  [Agent A]    [Agent B]    [idle]       [Agent D]   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Unanswered Questions:**
1. What happens if the backend restarts while an agent is running?
2. How do we handle agent timeouts (max 30 min? 1 hour?)
3. Can users pause and resume after days?
4. What's the checkpointing strategy?
5. How do we handle stuck agents?

---

### 2.4 Claude Agent SDK Limitations (Unknown)

**Questions We Don't Have Answers To:**

| Question | Impact | How to Find Out |
|----------|--------|-----------------|
| What are the rate limits? | Scaling | Test / Anthropic docs |
| Max tokens per session? | Long tasks | Test / Anthropic docs |
| Max file size readable? | Large files | Test |
| Streaming behavior? | UX | Test |
| Tool timeout limits? | Complex tasks | Test |
| Concurrent sessions per API key? | Multi-user | Test |
| Cost per agent session? | Pricing | Calculate |

**Action Items:**
- [ ] Build a test harness for Claude Agent SDK
- [ ] Measure token usage for typical tasks
- [ ] Test with large repos (> 1000 files)
- [ ] Test long-running tasks (> 30 min)
- [ ] Document all limitations found

---

### 2.5 Security Sandboxing

**The Problem:**
Claude Agent SDK executes code with file system access. How do we prevent:
- Malicious code execution
- Data exfiltration
- Resource abuse (crypto mining)
- Lateral movement

**Missing Security Design:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Sandbox                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Network Isolation:                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ - Egress only to: GitHub API, npm, PyPI             │    │
│  │ - No access to internal services                    │    │
│  │ - Rate-limited outbound connections                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Resource Limits:                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ - CPU: 2 cores max                                  │    │
│  │ - Memory: 4GB max                                   │    │
│  │ - Disk: 10GB max                                    │    │
│  │ - Time: 60 minutes max                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  File System:                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ - Read/write only in /workspace                     │    │
│  │ - No access to host system                          │    │
│  │ - No privileged operations                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Action Items:**
- [ ] Define security threat model
- [ ] Design container security policy
- [ ] Implement resource limits
- [ ] Set up network isolation
- [ ] Create audit logging for all agent actions

---

### 2.6 Mobile Platform Gaps

**iOS Unknowns:**

| Area | Unknown | Risk | Mitigation |
|------|---------|------|------------|
| Background audio | Can we record audio in background? | HIGH | Test on device |
| Speech recognition | SFSpeech accuracy vs Whisper? | MEDIUM | Benchmark both |
| Battery impact | Voice features drain battery? | MEDIUM | Implement power modes |
| App Store review | Will voice features pass review? | MEDIUM | Review guidelines |
| Push notifications | Rich notifications with actions? | LOW | Use expo-notifications |

**Android Unknowns:**

| Area | Unknown | Risk | Mitigation |
|------|---------|------|------------|
| Speech recognition | Android Speech vs Whisper? | MEDIUM | Benchmark both |
| Background recording | Requires foreground service? | MEDIUM | Test on device |
| Fragmentation | Works on all Android versions? | MEDIUM | Test matrix |
| Permission flow | User experience for mic permission? | LOW | Design carefully |

---

## 3. Missing Architecture Components

### 3.1 Critical (Must Build Before MVP)

#### A. Execution Service

```typescript
// backend/src/services/executionService.ts

interface ExecutionService {
  // Provision a new execution environment
  provision(config: ExecutionConfig): Promise<ExecutionEnvironment>;

  // Execute Claude Agent SDK in the environment
  executeAgent(env: ExecutionEnvironment, task: AgentTask): AsyncGenerator<AgentEvent>;

  // Cleanup environment
  teardown(env: ExecutionEnvironment): Promise<void>;
}

interface ExecutionConfig {
  repoUrl: string;
  branch: string;
  resourceLimits: {
    cpuCores: number;
    memoryMB: number;
    diskGB: number;
    timeoutMinutes: number;
  };
  networkPolicy: 'restricted' | 'open';
}

interface ExecutionEnvironment {
  id: string;
  status: 'provisioning' | 'ready' | 'running' | 'terminated';
  localRepoPath: string;
  createdAt: Date;
  resourceUsage: ResourceUsage;
}
```

**Estimated Effort:** 2-3 weeks
**Dependencies:** Container platform decision

---

#### B. Agent Orchestrator

```typescript
// backend/src/services/agentOrchestrator.ts

interface AgentOrchestrator {
  // Queue a new agent task
  enqueue(task: AgentTask): Promise<string>;

  // Get agent status
  getStatus(agentId: string): Promise<AgentStatus>;

  // Control agent
  pause(agentId: string): Promise<void>;
  resume(agentId: string): Promise<void>;
  cancel(agentId: string): Promise<void>;

  // Recovery
  recoverStalled(): Promise<number>;
}

interface AgentStatus {
  id: string;
  state: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  currentStep?: string;
  logs: AgentLog[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}
```

**Estimated Effort:** 1-2 weeks
**Dependencies:** Execution Service, Queue system (BullMQ)

---

#### C. Codebase Analyzer

```typescript
// backend/src/services/codebaseAnalyzer.ts

interface CodebaseAnalyzer {
  // Analyze repository for context
  analyze(repoUrl: string, branch: string): Promise<CodebaseContext>;

  // Select relevant files for a task
  selectRelevantFiles(context: CodebaseContext, task: string): Promise<FileSelection[]>;

  // Get file contents
  getFileContents(repoUrl: string, paths: string[]): Promise<FileContent[]>;
}

interface CodebaseContext {
  repoUrl: string;
  branch: string;

  // Structure
  fileTree: FileNode[];
  totalFiles: number;
  totalLines: number;

  // Detection
  framework: 'react' | 'vue' | 'angular' | 'next' | 'express' | 'fastify' | 'unknown';
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'unknown';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'unknown';

  // Dependencies
  dependencies: Dependency[];
  devDependencies: Dependency[];

  // Cached
  analyzedAt: Date;
  cacheExpiry: Date;
}
```

**Estimated Effort:** 1 week
**Dependencies:** GitHub API integration

---

### 3.2 Important (Should Build for MVP)

#### D. Cost Tracker

```typescript
// backend/src/services/costTracker.ts

interface CostTracker {
  // Track usage
  recordUsage(userId: string, usage: UsageRecord): Promise<void>;

  // Get usage stats
  getUsage(userId: string, period: 'day' | 'week' | 'month'): Promise<UsageSummary>;

  // Check limits
  checkLimit(userId: string): Promise<LimitStatus>;

  // Billing
  calculateBill(userId: string, period: DateRange): Promise<Bill>;
}

interface UsageRecord {
  agentId: string;
  inputTokens: number;
  outputTokens: number;
  executionMinutes: number;
  storageGB: number;
  timestamp: Date;
}

interface UsageSummary {
  totalAgents: number;
  totalTokens: number;
  totalMinutes: number;
  estimatedCost: number;
  limit: number;
  remaining: number;
}
```

**Estimated Effort:** 1 week
**Dependencies:** Database, Usage events

---

#### E. Webhook Receiver

```typescript
// backend/src/services/webhookReceiver.ts

interface WebhookReceiver {
  // Handle GitHub webhooks
  handleGitHubWebhook(event: GitHubWebhookEvent): Promise<void>;

  // Webhook types we care about
  // - pull_request (opened, merged, closed)
  // - check_run (completed - CI results)
  // - push (new commits on agent branch)
}

interface GitHubWebhookEvent {
  type: 'pull_request' | 'check_run' | 'push';
  repository: string;
  payload: any;
}
```

**Estimated Effort:** 3 days
**Dependencies:** Backend routes, Database

---

### 3.3 Nice to Have (Post-MVP)

| Component | Purpose | Effort |
|-----------|---------|--------|
| Feature Flags | Gradual rollout, kill switches | 2 days |
| A/B Testing | Test different prompts/UX | 1 week |
| Analytics Pipeline | User behavior tracking | 1 week |
| Audit Logger | Security compliance | 3 days |
| Rate Limiter | Abuse prevention | 2 days |

---

## 4. Integration Gaps (How Pieces Fit Together)

### 4.1 Voice → Backend Flow (Gaps Identified)

```
Current Design:                   Missing Pieces:

┌─────────────┐                   ┌─────────────────────────────┐
│ Voice Input │                   │ What happens with partial   │
│ (Whisper)   │                   │ transcripts? Progressive    │
└──────┬──────┘                   │ feedback to user?           │
       │                          └─────────────────────────────┘
       ▼
┌─────────────┐                   ┌─────────────────────────────┐
│ Command     │                   │ What if parsing fails?      │
│ Parser      │                   │ Fallback? Re-record?        │
└──────┬──────┘                   │ Confidence threshold?       │
       │                          └─────────────────────────────┘
       ▼
┌─────────────┐                   ┌─────────────────────────────┐
│ API Call to │                   │ Retry logic? Timeout?       │
│ Backend     │                   │ Offline queue?              │
└──────┬──────┘                   └─────────────────────────────┘
       │
       ▼
┌─────────────┐                   ┌─────────────────────────────┐
│ Agent       │                   │ How is execution environment│
│ Orchestrator│                   │ provisioned? Where?         │
└──────┬──────┘                   └─────────────────────────────┘
       │
       ▼
┌─────────────┐                   ┌─────────────────────────────┐
│ Claude Agent│                   │ What container platform?    │
│ SDK         │                   │ How do logs stream back?    │
└─────────────┘                   └─────────────────────────────┘
```

### 4.2 Real-time Updates (Gaps Identified)

**Current Design:** WebSocket or Polling
**Missing:**
1. How do we handle mobile background state?
2. What if WebSocket disconnects?
3. How do we batch updates to save battery?
4. Push notification vs in-app update decision tree?

```typescript
// Missing: Update Strategy Service
interface UpdateStrategy {
  // Determine how to notify user
  getNotificationMethod(
    appState: 'foreground' | 'background' | 'killed',
    eventPriority: 'high' | 'medium' | 'low'
  ): 'websocket' | 'push' | 'poll' | 'none';

  // Batch updates for efficiency
  batchUpdates(events: AgentEvent[]): BatchedUpdate;
}
```

---

## 5. What Needs to Get Accomplished

### Phase 0: Foundation (Before Any Coding)

| Task | Priority | Owner | Status |
|------|----------|-------|--------|
| Decide on project name | P0 | Team | PENDING |
| Choose execution platform (Modal/Fly.io/etc) | P0 | Backend | PENDING |
| Prototype Claude Agent SDK integration | P0 | Backend | PENDING |
| Security threat model | P0 | Security | PENDING |
| Test STT accuracy on iOS/Android | P0 | Mobile | PENDING |
| Cost model validation | P0 | Product | PENDING |

### Phase 1: Core Infrastructure (Weeks 1-3)

| Task | Priority | Dependencies | Effort |
|------|----------|--------------|--------|
| Execution Service (container provisioning) | P0 | Platform decision | 2 weeks |
| Agent Orchestrator (queue, lifecycle) | P0 | Execution Service | 1 week |
| Codebase Analyzer | P0 | GitHub API | 1 week |
| Claude Agent SDK wrapper | P0 | Anthropic docs | 3 days |
| Security sandbox implementation | P0 | Container platform | 1 week |

### Phase 2: Mobile Core (Weeks 2-4)

| Task | Priority | Dependencies | Effort |
|------|----------|--------------|--------|
| Expo project setup | P0 | - | 2 days |
| Voice recording (expo-av) | P0 | - | 3 days |
| Whisper API integration | P0 | Voice recording | 3 days |
| Command parser (Claude Haiku) | P0 | - | 3 days |
| Authentication (GitHub OAuth) | P0 | Backend auth | 1 week |
| Agent list UI | P0 | API | 3 days |
| Agent detail UI | P0 | API | 3 days |

### Phase 3: Integration (Weeks 4-6)

| Task | Priority | Dependencies | Effort |
|------|----------|--------------|--------|
| Voice → Agent creation flow | P0 | All above | 1 week |
| Real-time status updates | P0 | WebSocket/Push | 1 week |
| Push notifications | P0 | expo-notifications | 3 days |
| Error handling & recovery | P0 | All flows | 1 week |
| Cost tracking | P1 | Usage events | 3 days |

### Phase 4: Polish & Testing (Weeks 7-8)

| Task | Priority | Dependencies | Effort |
|------|----------|--------------|--------|
| End-to-end testing | P0 | All features | 1 week |
| Performance optimization | P1 | Testing | 3 days |
| Security audit | P0 | All code | 3 days |
| Beta user testing | P0 | Working app | 1 week |

---

## 6. Risk Assessment

### High Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Claude Agent SDK doesn't meet our needs | MEDIUM | CRITICAL | Prototype early, have fallback |
| Container execution costs too high | MEDIUM | HIGH | Cost modeling, usage limits |
| Voice accuracy not good enough | LOW | HIGH | Whisper API is proven |
| App Store rejection | LOW | HIGH | Review guidelines early |
| Security breach | LOW | CRITICAL | Security-first design |

### Medium Risk Items

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scaling issues at launch | MEDIUM | MEDIUM | Load testing, graceful degradation |
| GitHub rate limits | MEDIUM | MEDIUM | Caching, request batching |
| User adoption slower than expected | MEDIUM | MEDIUM | Strong marketing, unique value prop |

---

## 7. Open Questions Requiring Decisions

### Technical Decisions Needed

1. **Container Platform:** Modal vs Fly.io vs self-hosted?
2. **Queue System:** BullMQ vs SQS vs Temporal?
3. **Real-time:** WebSocket vs Pusher vs Supabase Realtime?
4. **Database:** Neon vs Supabase vs PlanetScale?
5. **Logging:** Self-hosted vs Datadog vs Axiom?

### Product Decisions Needed

1. **Pricing:** Flat rate vs usage-based vs hybrid?
2. **Free Tier:** How many agents? Time limit?
3. **Model Selection:** Let users choose or curate?
4. **Branding:** Claudia or new name?
5. **Launch Strategy:** Waitlist vs open beta?

---

## 8. Next Steps

### Immediate (This Week)

1. [ ] **Prototype Claude Agent SDK** - Validate it works for our use case
2. [ ] **Evaluate container platforms** - Modal, Fly.io, Gitpod
3. [ ] **Security threat model** - Document attack vectors
4. [ ] **Cost model** - Calculate per-agent costs
5. [ ] **Name decision** - Pick final name

### Short-term (Next 2 Weeks)

1. [ ] Start Execution Service implementation
2. [ ] Start Expo mobile app scaffold
3. [ ] Design security sandbox
4. [ ] Set up CI/CD pipeline
5. [ ] Create development environments

### Medium-term (Month 1)

1. [ ] Complete core infrastructure
2. [ ] Complete voice interface
3. [ ] Integration testing
4. [ ] Security audit
5. [ ] Beta user recruitment

---

**Document Version:** 1.0
**Created:** December 25, 2024
**Status:** Architecture Review Complete
**Next Action:** Team review and decision-making on open questions
