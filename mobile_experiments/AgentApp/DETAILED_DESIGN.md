# Detailed Design: Mobile Agent System

## Table of Contents
1. [Component Breakdown](#component-breakdown)
2. [Component Interactions](#component-interactions)
3. [Data Models](#data-models)
4. [API Contracts](#api-contracts)
5. [User Stories](#user-stories)
6. [Task Breakdown](#task-breakdown)
7. [Risks & Mitigations](#risks--mitigations)
8. [Open Questions](#open-questions)

---

## Component Breakdown

### Component 1: Mobile App (React Native)

**Purpose**: User interface for triggering tasks and viewing results

**Subcomponents**:
| Subcomponent | Responsibility |
|--------------|----------------|
| **AuthScreen** | GitHub OAuth login, API key input |
| **ProjectListScreen** | List connected GitHub repos |
| **ChatScreen** | Send prompts, view streaming responses |
| **TaskHistoryScreen** | View past tasks and results |
| **SettingsScreen** | API key management, preferences |
| **WebSocketManager** | Maintain connection, handle reconnects |
| **OfflineQueue** | Store actions when disconnected |
| **SecureStorage** | Store tokens/keys in device keychain |

**Dependencies**:
- Expo SDK
- expo-secure-store
- expo-auth-session (GitHub OAuth)
- React Navigation
- Zustand (state)

**Inputs**: User actions (tap, type)
**Outputs**: API calls, WebSocket messages

---

### Component 2: Coordinator Server

**Purpose**: Central hub that receives requests, manages state, spawns workers

**Subcomponents**:
| Subcomponent | Responsibility |
|--------------|----------------|
| **HTTP Server** | REST API endpoints |
| **WebSocket Server** | Real-time connections to mobile clients |
| **Auth Middleware** | Validate JWT tokens |
| **Task Queue** | SQLite-backed FIFO queue |
| **Worker Spawner** | Create/destroy Docker containers |
| **Progress Router** | Receive worker updates, broadcast to clients |
| **Database Layer** | SQLite queries and migrations |
| **Crypto Utils** | Encrypt/decrypt API keys |

**Dependencies**:
- Bun runtime
- Hono (web framework)
- better-sqlite3 or Bun's native SQLite
- dockerode (Docker SDK)
- jose (JWT)

**Inputs**: HTTP requests, WebSocket messages, Worker callbacks
**Outputs**: HTTP responses, WebSocket broadcasts, Docker commands

---

### Component 3: Worker Container

**Purpose**: Isolated environment that runs the AI agent and executes code

**Subcomponents**:
| Subcomponent | Responsibility |
|--------------|----------------|
| **Agent Loop** | Orchestrates Claude API calls and tool execution |
| **Claude Client** | Handles API calls, streaming, retries |
| **Tool Executor** | Dispatches tool calls to implementations |
| **File Tools** | read_file, write_file, list_directory |
| **Shell Tools** | run_command (sandboxed) |
| **Git Tools** | clone, commit, push, create_pr |
| **Search Tools** | grep/ripgrep for code search |
| **Progress Reporter** | HTTP callbacks to coordinator |
| **Error Handler** | Graceful failure, cleanup |

**Dependencies**:
- Node.js or Bun
- @anthropic-ai/sdk
- simple-git
- Child process for shell

**Inputs**: Task config (repo URL, prompt, API key)
**Outputs**: Progress updates, final result, git changes

---

### Component 4: Database (SQLite)

**Purpose**: Persistent storage for users, tasks, messages

**Tables**:
| Table | Purpose |
|-------|---------|
| **users** | User accounts, encrypted API keys |
| **projects** | Connected GitHub repositories |
| **tasks** | Task queue and history |
| **messages** | Conversation history per task |
| **tool_calls** | Log of all tool invocations |
| **settings** | User preferences |

---

### Component 5: Docker Runtime

**Purpose**: Container orchestration on the VPS

**Responsibilities**:
- Pull/cache worker images
- Create containers with resource limits
- Mount volumes for workspace
- Network isolation
- Cleanup after task completion

---

## Component Interactions

### Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────┐         ┌─────────────────────────────────────────────────┐    │
│  │ Mobile  │◄──WS───►│              Coordinator                        │    │
│  │  App    │         │                                                 │    │
│  └────┬────┘         │  ┌─────────┐  ┌──────────┐  ┌──────────────┐   │    │
│       │              │  │  HTTP   │  │WebSocket │  │   Worker     │   │    │
│       │              │  │ Server  │  │  Server  │  │   Spawner    │   │    │
│       │              │  └────┬────┘  └────┬─────┘  └──────┬───────┘   │    │
│       │              │       │            │               │           │    │
│       │              │       └─────┬──────┴───────┬───────┘           │    │
│       │              │             │              │                   │    │
│       │              │       ┌─────▼─────┐  ┌─────▼─────┐             │    │
│       │              │       │Task Queue │  │  SQLite   │             │    │
│       │              │       │           │  │           │             │    │
│       │              │       └───────────┘  └───────────┘             │    │
│       │              │                                                 │    │
│       │              └─────────────────────────┬───────────────────────┘    │
│       │                                        │                            │
│       │                              Docker API│                            │
│       │                                        ▼                            │
│       │              ┌─────────────────────────────────────────────────┐    │
│       │              │              Worker Container                   │    │
│       │              │                                                 │    │
│       │              │  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │    │
│       │              │  │  Agent   │  │   Tool    │  │  Progress   │  │    │
│       │              │  │   Loop   │──│  Executor │  │  Reporter   │──┼────┼──► Coordinator
│       │              │  └────┬─────┘  └───────────┘  └─────────────┘  │    │    (HTTP POST)
│       │              │       │                                        │    │
│       │              │       │ HTTPS                                  │    │
│       │              │       ▼                                        │    │
│       │              │  ┌──────────┐                                  │    │
│       │              │  │  Claude  │                                  │    │
│       │              │  │   API    │                                  │    │
│       │              │  └──────────┘                                  │    │
│       │              │                                                 │    │
│       │              │  ┌──────────┐                                  │    │
│       │              │  │  GitHub  │                                  │    │
│       │              │  │   API    │                                  │    │
│       │              │  └──────────┘                                  │    │
│       │              │                                                 │    │
│       │              └─────────────────────────────────────────────────┘    │
│       │                                                                     │
└───────┴─────────────────────────────────────────────────────────────────────┘
```

### Sequence: Create and Run Task

```
Mobile              Coordinator           Database        Docker          Worker           Claude
  │                     │                    │              │               │                │
  │── POST /tasks ─────►│                    │              │               │                │
  │   {repo, prompt}    │                    │              │               │                │
  │                     │── INSERT task ────►│              │               │                │
  │                     │◄── task_id ────────│              │               │                │
  │                     │                    │              │               │                │
  │◄── 201 {task_id} ───│                    │              │               │                │
  │                     │                    │              │               │                │
  │                     │── Create ─────────────────────────►│               │                │
  │                     │   Container                        │               │                │
  │                     │◄── container_id ──────────────────│               │                │
  │                     │                    │              │               │                │
  │                     │── UPDATE task ────►│              │               │                │
  │                     │   status=running   │              │               │                │
  │                     │                    │              │               │                │
  │                     │                    │              │── Start ─────►│                │
  │                     │                    │              │               │                │
  │                     │                    │              │               │── Clone repo ──►
  │                     │                    │              │               │                │
  │                     │                    │              │               │── Messages ───►│
  │                     │                    │              │               │   {prompt}     │
  │                     │                    │              │               │                │
  │                     │                    │              │               │◄── tool_use ───│
  │                     │                    │              │               │   read_file    │
  │                     │                    │              │               │                │
  │                     │◄── POST /progress ────────────────────────────────│                │
  │                     │   {reading file}   │              │               │                │
  │                     │                    │              │               │                │
  │◄── WS: progress ────│                    │              │               │                │
  │                     │                    │              │               │                │
  │                     │                    │              │               │── tool_result─►│
  │                     │                    │              │               │                │
  │                     │                    │              │               │◄── tool_use ───│
  │                     │                    │              │               │   write_file   │
  │                     │                    │              │               │                │
  │                     │◄── POST /progress ────────────────────────────────│                │
  │                     │   {writing file}   │              │               │                │
  │                     │                    │              │               │                │
  │◄── WS: progress ────│                    │              │               │                │
  │                     │                    │              │               │                │
  │                     │                    │              │               │── git push ───►
  │                     │                    │              │               │                │
  │                     │                    │              │               │── create PR ──►
  │                     │                    │              │               │                │
  │                     │◄── POST /complete ────────────────────────────────│                │
  │                     │   {pr_url, diff}   │              │               │                │
  │                     │                    │              │               │                │
  │                     │── UPDATE task ────►│              │               │                │
  │                     │   status=complete  │              │               │                │
  │                     │                    │              │               │                │
  │◄── WS: complete ────│                    │              │               │                │
  │   {pr_url, diff}    │                    │              │               │                │
  │                     │                    │              │               │                │
  │                     │── Kill ──────────────────────────►│               │                │
  │                     │   Container        │              │               │                │
```

---

## Data Models

### User
```typescript
interface User {
  id: string;                    // UUID
  github_id: number;             // GitHub user ID
  github_username: string;       // GitHub username
  github_access_token: string;   // Encrypted, for repo access
  claude_api_key: string;        // Encrypted, user's BYOK
  created_at: Date;
  updated_at: Date;
}
```

### Project
```typescript
interface Project {
  id: string;
  user_id: string;
  github_repo: string;           // "owner/repo"
  default_branch: string;        // "main"
  last_synced_at: Date;
  created_at: Date;
}
```

### Task
```typescript
interface Task {
  id: string;
  user_id: string;
  project_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  prompt: string;
  result?: TaskResult;
  container_id?: string;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
}

interface TaskResult {
  success: boolean;
  summary: string;
  files_changed: string[];
  diff?: string;
  pr_url?: string;
  error?: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  task_id: string;
  role: 'user' | 'assistant' | 'tool_result';
  content: string;
  tool_calls?: ToolCall[];
  created_at: Date;
}

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  result?: string;
  duration_ms?: number;
}
```

---

## API Contracts

### REST Endpoints

#### Authentication
```
POST /auth/github/callback
  Request: { code: string }
  Response: { token: string, user: User }

POST /auth/refresh
  Request: { refresh_token: string }
  Response: { token: string }
```

#### Projects
```
GET /projects
  Response: { projects: Project[] }

POST /projects
  Request: { github_repo: string }
  Response: { project: Project }

DELETE /projects/:id
  Response: { success: true }
```

#### Tasks
```
GET /tasks
  Query: { project_id?, status?, limit?, offset? }
  Response: { tasks: Task[], total: number }

POST /tasks
  Request: { project_id: string, prompt: string }
  Response: { task: Task }

GET /tasks/:id
  Response: { task: Task, messages: Message[] }

POST /tasks/:id/cancel
  Response: { task: Task }
```

#### Settings
```
GET /settings
  Response: { settings: Record<string, any> }

PATCH /settings
  Request: { claude_api_key?: string, ... }
  Response: { settings: Record<string, any> }
```

### WebSocket Protocol

#### Client → Server
```typescript
// Subscribe to task updates
{ type: 'subscribe', task_id: string }

// Unsubscribe
{ type: 'unsubscribe', task_id: string }

// Ping (keepalive)
{ type: 'ping' }
```

#### Server → Client
```typescript
// Task progress
{ 
  type: 'progress', 
  task_id: string,
  status: string,           // 'cloning', 'thinking', 'reading', 'writing', etc.
  message?: string,         // Human-readable status
  tool_call?: ToolCall,     // Current tool being executed
}

// Task complete
{
  type: 'complete',
  task_id: string,
  result: TaskResult,
}

// Task failed
{
  type: 'error',
  task_id: string,
  error: string,
}

// Pong
{ type: 'pong' }
```

### Worker → Coordinator (Internal)

```
POST /internal/progress
  Headers: { X-Worker-Secret: string }
  Request: {
    task_id: string,
    status: string,
    message?: string,
    tool_call?: ToolCall,
  }

POST /internal/complete
  Headers: { X-Worker-Secret: string }
  Request: {
    task_id: string,
    result: TaskResult,
  }

POST /internal/error
  Headers: { X-Worker-Secret: string }
  Request: {
    task_id: string,
    error: string,
  }
```

---

## User Stories

### Epic 1: Authentication

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| A1 | As a user, I can sign in with GitHub | OAuth flow completes, JWT issued |
| A2 | As a user, I can add my Claude API key | Key encrypted and stored |
| A3 | As a user, I can sign out | Tokens cleared, session ended |
| A4 | As a user, my session persists across app restarts | Token stored in secure storage |

### Epic 2: Project Management

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| P1 | As a user, I can connect a GitHub repo | Repo cloned successfully in test task |
| P2 | As a user, I can see my connected repos | List displays with last activity |
| P3 | As a user, I can disconnect a repo | Repo removed, tasks preserved |

### Epic 3: Task Execution

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| T1 | As a user, I can create a task with a prompt | Task queued, ID returned |
| T2 | As a user, I see real-time progress | WebSocket updates every action |
| T3 | As a user, I see the final result | PR URL or error displayed |
| T4 | As a user, I can cancel a running task | Container killed, status updated |
| T5 | As a user, I can view task history | Past tasks with results listed |

### Epic 4: Reliability

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| R1 | As a user, tasks resume after disconnect | Reconnect sees current state |
| R2 | As a user, queued tasks run eventually | Queue processes in order |
| R3 | As a user, failed tasks show errors | Clear error message displayed |
| R4 | As a system, crashed workers are cleaned up | Orphan containers removed |

---

## Task Breakdown

### Phase 1: Project Setup (Day 1)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 1.1 Initialize Bun project with Hono | 1 | None |
| 1.2 Set up TypeScript config | 0.5 | 1.1 |
| 1.3 Create folder structure | 0.5 | 1.1 |
| 1.4 Set up SQLite with migrations | 2 | 1.1 |
| 1.5 Create database schema | 2 | 1.4 |
| 1.6 Set up Docker development environment | 1 | None |
| 1.7 Create basic health endpoint | 0.5 | 1.1 |

### Phase 2: Authentication (Day 2)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 2.1 Implement GitHub OAuth flow | 3 | 1.5 |
| 2.2 Implement JWT generation/validation | 2 | 1.5 |
| 2.3 Create auth middleware | 1 | 2.2 |
| 2.4 Implement API key encryption | 1 | 1.5 |
| 2.5 Create settings endpoints | 1 | 2.3 |

### Phase 3: Task Queue (Day 3)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 3.1 Implement task CRUD endpoints | 2 | 2.3 |
| 3.2 Create SQLite-backed queue | 3 | 1.5 |
| 3.3 Implement queue processor | 2 | 3.2 |
| 3.4 Add task status tracking | 1 | 3.1 |

### Phase 4: Docker Integration (Day 4-5)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 4.1 Create worker Dockerfile | 2 | None |
| 4.2 Implement Docker spawner | 3 | 4.1 |
| 4.3 Implement container lifecycle | 2 | 4.2 |
| 4.4 Add resource limits | 1 | 4.2 |
| 4.5 Implement cleanup routine | 2 | 4.3 |
| 4.6 Test container spawning | 2 | 4.3 |

### Phase 5: Agent Worker (Day 6-8)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 5.1 Set up worker Node.js project | 1 | 4.1 |
| 5.2 Implement Claude API client | 3 | 5.1 |
| 5.3 Implement agent loop | 4 | 5.2 |
| 5.4 Implement read_file tool | 1 | 5.3 |
| 5.5 Implement write_file tool | 1 | 5.3 |
| 5.6 Implement list_directory tool | 1 | 5.3 |
| 5.7 Implement run_command tool | 2 | 5.3 |
| 5.8 Implement git clone | 1 | 5.3 |
| 5.9 Implement git commit/push | 2 | 5.8 |
| 5.10 Implement create PR | 2 | 5.9 |
| 5.11 Implement progress reporting | 2 | 5.3 |
| 5.12 Implement error handling | 2 | 5.3 |

### Phase 6: WebSocket (Day 9)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 6.1 Set up WebSocket server | 2 | 1.1 |
| 6.2 Implement connection management | 2 | 6.1 |
| 6.3 Implement subscription handling | 1 | 6.2 |
| 6.4 Implement progress broadcasting | 2 | 6.2, 5.11 |
| 6.5 Add heartbeat/keepalive | 1 | 6.2 |

### Phase 7: Integration Testing (Day 10)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 7.1 End-to-end task flow test | 4 | All above |
| 7.2 Error handling tests | 2 | 7.1 |
| 7.3 Concurrent task tests | 2 | 7.1 |

### Phase 8: Mobile App (Day 11-14)

| Task | Hours | Dependencies |
|------|-------|--------------|
| 8.1 Initialize Expo project | 1 | None |
| 8.2 Set up navigation | 2 | 8.1 |
| 8.3 Implement auth screens | 4 | 8.2 |
| 8.4 Implement project list | 3 | 8.3 |
| 8.5 Implement chat screen | 6 | 8.4 |
| 8.6 Implement WebSocket client | 3 | 8.5 |
| 8.7 Implement streaming display | 4 | 8.6 |
| 8.8 Implement task history | 3 | 8.5 |
| 8.9 Implement settings screen | 2 | 8.3 |
| 8.10 Implement offline queue | 3 | 8.6 |
| 8.11 Polish and testing | 4 | All above |

---

## Risks & Mitigations

### Risk 1: Docker Container Resource Exhaustion

**Risk**: Worker containers consume too much CPU/memory, affecting coordinator

**Likelihood**: High
**Impact**: High

**Mitigations**:
1. Set strict resource limits per container (1 CPU, 2GB RAM)
2. Limit concurrent containers (max 3 per VPS)
3. Implement timeout (kill after 30 min)
4. Monitor resource usage, alert when high

---

### Risk 2: Long-Running Tasks Block Queue

**Risk**: One slow task blocks others in single-threaded queue

**Likelihood**: Medium
**Impact**: Medium

**Mitigations**:
1. Process queue with concurrent limit (not serial)
2. Implement task timeout
3. Allow task cancellation
4. Priority queue for small tasks

---

### Risk 3: Claude API Rate Limits

**Risk**: User hits Anthropic rate limits, tasks fail

**Likelihood**: Medium
**Impact**: Medium

**Mitigations**:
1. Display rate limit info in app
2. Implement exponential backoff
3. Queue tasks when rate limited
4. Show estimated wait time

---

### Risk 4: GitHub Token Expiration

**Risk**: OAuth token expires, clone/push fails mid-task

**Likelihood**: Medium
**Impact**: High

**Mitigations**:
1. Refresh token before task starts
2. Store refresh token, auto-refresh
3. Clear error message if auth fails
4. Re-auth flow in app

---

### Risk 5: WebSocket Disconnection

**Risk**: Mobile loses connection, misses updates

**Likelihood**: High
**Impact**: Low

**Mitigations**:
1. Automatic reconnection with backoff
2. Fetch missed updates on reconnect
3. Store task state server-side
4. Offline queue for new requests

---

### Risk 6: Worker Crashes Mid-Task

**Risk**: Container dies, task stuck in "running" state

**Likelihood**: Medium
**Impact**: Medium

**Mitigations**:
1. Health check workers periodically
2. Mark stale tasks as failed after timeout
3. Cleanup orphan containers on startup
4. Log container exit codes

---

### Risk 7: Malicious Code Execution

**Risk**: User prompt tricks agent into harmful commands

**Likelihood**: Low
**Impact**: High

**Mitigations**:
1. Docker isolation (no host access)
2. Network restrictions (only GitHub, Claude APIs)
3. No root in container
4. Resource limits prevent fork bombs
5. Workspace is disposable (deleted after task)

---

### Risk 8: API Key Theft

**Risk**: Database breach exposes user API keys

**Likelihood**: Low
**Impact**: Critical

**Mitigations**:
1. Encrypt keys at rest (AES-256)
2. Encryption key in environment variable
3. Never log keys
4. Regular key rotation reminders
5. Option to delete key after task

---

### Risk 9: VPS Single Point of Failure

**Risk**: VPS goes down, service unavailable

**Likelihood**: Low
**Impact**: High

**Mitigations**:
1. Daily SQLite backups to S3/R2
2. Document recovery procedure
3. Consider multi-region later
4. Uptime monitoring with alerts

---

### Risk 10: Mobile App Store Rejection

**Risk**: App rejected for executing code remotely

**Likelihood**: Low
**Impact**: Medium

**Mitigations**:
1. Code runs on server, not device
2. Clear description of functionality
3. User provides their own API key
4. No in-app purchases for API usage

---

## Additional Technical Considerations

### Cold Start Latency
**Issue**: Docker containers take 2-5 seconds to start
**Impact**: User waits before seeing any progress
**Mitigation**: 
- Show "Starting environment..." immediately
- Pre-warm container pool (keep 1-2 ready)
- Use lightweight base image (alpine)

### Git Token Flow to Worker
**Issue**: Worker needs GitHub token to clone/push
**Design Decision**: 
- Coordinator decrypts token, passes to worker via env var
- Worker container is ephemeral, token exists only during execution
- Never write token to disk

### Large File Handling
**Issue**: Agent might try to read files larger than Claude's context
**Mitigation**:
- Limit file reads to 100KB by default
- Truncate with "...file truncated..." message
- Tool can specify offset/limit for partial reads

### Claude Context Window
**Issue**: Conversation + files might exceed 200K tokens
**Mitigation**:
- Track token count approximately
- Summarize earlier messages when approaching limit
- Warn user when context is filling up

### Cost Transparency
**Issue**: Users need to know API costs before they're charged
**Design Decision**:
- Show estimated tokens before task starts
- Display running token count during task
- Show final cost at task completion
- Consider adding "cheap mode" with Haiku

### Network Egress in Worker
**Issue**: Should worker be able to make arbitrary HTTP requests?
**Design Decision**:
- Restrict to allow-list: GitHub API, npm registry, Anthropic API
- Use Docker network policies
- Log all outbound connections

### Workspace Persistence
**Issue**: Should workspace persist between tasks?
**Design Decision**:
- Fresh clone each task (clean state, ~10-30s overhead)
- Alternative: Cache clones, git fetch on reuse (faster, stale risk)
**Recommendation**: Fresh clone for V1, optimize later

### Log Retention
**Issue**: How long to keep task logs and messages?
**Design Decision**:
- Keep last 30 days by default
- Offer export before deletion
- Immediate delete on user request (GDPR)

---

## Open Questions

### Q1: Task Timeout Duration
**Question**: How long should a task be allowed to run?
**Options**: 
- 10 minutes (safe, may be too short)
- 30 minutes (reasonable)
- 1 hour (long tasks, higher cost)
**Recommendation**: Start with 30 minutes, make configurable

---

### Q2: Concurrent Tasks per User
**Question**: How many tasks can a user run simultaneously?
**Options**:
- 1 (simple, prevents abuse)
- 3 (reasonable parallelism)
- Unlimited (trusts user)
**Recommendation**: Start with 1, prevents resource issues

---

### Q3: Repository Size Limit
**Question**: How large a repo can we clone?
**Options**:
- 100MB (small projects only)
- 500MB (most projects)
- 1GB (large monorepos)
**Recommendation**: 500MB with shallow clone (--depth 1)

---

### Q4: Git Branch Strategy
**Question**: How should agent create branches?
**Options**:
- Always create new branch (safe, many branches)
- Commit to default branch (dangerous)
- User chooses per task (flexible, complex UI)
**Recommendation**: Always new branch, auto-named `agent/task-{id}`

---

### Q5: PR Creation
**Question**: Should agent always create PR, or optionally?
**Options**:
- Always create PR (consistent)
- Only on success (reduces noise)
- User chooses (flexible)
**Recommendation**: Always create PR with clear title/description

---

### Q6: Conversation History
**Question**: Should subsequent tasks remember previous conversations?
**Options**:
- Fresh context each task (simpler, cheaper)
- Include last N messages (continuity)
- Full project memory (expensive)
**Recommendation**: Fresh context, but show history in UI for manual reference

---

### Q7: Error Recovery
**Question**: If a task fails mid-way, what happens to changes?
**Options**:
- Discard all changes (clean, loses work)
- Keep partial changes in branch (preserves work)
- Ask user (complex)
**Recommendation**: Keep partial changes, clearly mark as incomplete

---

## Next Steps

1. **Review this document** - Any missing components? Disagreements?
2. **Answer open questions** - Need decisions before implementation
3. **Prioritize risks** - Which need immediate attention?
4. **Begin Phase 1** - Project setup once design is approved

---

**Document Status**: Draft for Review
**Last Updated**: December 2025
