# Implementation Tasks

Comprehensive breakdown of all work needed to build the Agent App MVP.

## Summary

| Epic | Stories | Tasks | Est. Hours | Est. Days |
|------|---------|-------|------------|-----------|
| E1: Server Setup | 3 | 12 | 16 | 2 |
| E2: Authentication | 4 | 14 | 20 | 2.5 |
| E3: Task Management | 4 | 16 | 24 | 3 |
| E4: Docker/Workers | 4 | 18 | 32 | 4 |
| E5: Agent Core | 5 | 22 | 40 | 5 |
| E6: Real-time | 3 | 10 | 16 | 2 |
| E7: Mobile App | 6 | 28 | 48 | 6 |
| E8: Testing | 3 | 12 | 20 | 2.5 |
| **Total** | **32** | **132** | **216** | **~27 days** |

> Note: Some tasks can run in parallel (e.g., mobile while backend stabilizes). Realistic MVP: **14-18 days** with focused effort.

---

## Epic 1: Server Setup

### Story 1.1: Project Initialization
**As a developer, I need a properly configured Bun/Hono project so I can start building the server.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 1.1.1 | Initialize Bun project with TypeScript | 0.5 | `bun init` runs, tsconfig configured |
| 1.1.2 | Add Hono framework and configure | 1 | Basic server starts on port 3000 |
| 1.1.3 | Create folder structure (src/, routes/, db/, etc.) | 0.5 | Structure matches FINAL_ARCHITECTURE.md |
| 1.1.4 | Configure ESLint and Prettier | 1 | Linting works, CI-ready |
| 1.1.5 | Create .env.example and config loader | 1 | Config loads from environment |

### Story 1.2: Database Setup
**As a developer, I need SQLite configured with migrations so I can persist data.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 1.2.1 | Add better-sqlite3 or Bun SQLite | 0.5 | DB connection works |
| 1.2.2 | Create migration system (simple, file-based) | 2 | Can run migrations up/down |
| 1.2.3 | Create initial schema (users, projects, tasks, messages) | 2 | Tables created, types match models |
| 1.2.4 | Create seed data script for development | 1 | Test user/project created |

### Story 1.3: Health & Logging
**As an operator, I need health endpoints and logging so I can monitor the server.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 1.3.1 | Create GET /health endpoint | 0.5 | Returns 200 with status |
| 1.3.2 | Create GET /health/db endpoint | 0.5 | Checks DB connection |
| 1.3.3 | Set up structured logging (pino or similar) | 1 | Request logging works |
| 1.3.4 | Add request ID middleware | 0.5 | Each request has unique ID |

**Story 1.x Dependencies:**
```
1.1.1 → 1.1.2 → 1.1.3
              ↘
               1.2.1 → 1.2.2 → 1.2.3
```

---

## Epic 2: Authentication

### Story 2.1: GitHub OAuth
**As a user, I can sign in with my GitHub account so I don't need to create a new password.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 2.1.1 | Register GitHub OAuth App (dev) | 0.5 | Client ID and secret obtained |
| 2.1.2 | Create GET /auth/github endpoint (redirect) | 1 | Redirects to GitHub with correct params |
| 2.1.3 | Create GET /auth/github/callback | 2 | Exchanges code for token, fetches user |
| 2.1.4 | Create or update user in database | 1 | User record persisted |
| 2.1.5 | Store GitHub access token (encrypted) | 1 | Token encrypted in DB |

### Story 2.2: JWT Tokens
**As a user, I receive a JWT token so subsequent requests are authenticated.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 2.2.1 | Choose JWT library (jose) and configure | 0.5 | Library installed, types work |
| 2.2.2 | Create JWT signing function | 1 | Token generated with user ID |
| 2.2.3 | Create JWT verification function | 1 | Token validated, user extracted |
| 2.2.4 | Create auth middleware | 1 | Protected routes require valid JWT |
| 2.2.5 | Implement token refresh flow | 2 | Refresh token works |

### Story 2.3: API Key Management
**As a user, I can securely store my Claude API key so the agent can use it.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 2.3.1 | Create encryption utility (AES-256-GCM) | 2 | Encrypt/decrypt works |
| 2.3.2 | Create PATCH /settings endpoint | 1 | Can update API key |
| 2.3.3 | Create GET /settings endpoint (masked) | 1 | Returns key masked (last 4 chars) |
| 2.3.4 | Create DELETE /settings/api-key endpoint | 0.5 | Key removed from DB |

### Story 2.4: Session Management
**As a user, I can sign out and my session is invalidated.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 2.4.1 | Create POST /auth/logout endpoint | 0.5 | Session invalidated |
| 2.4.2 | Implement token blacklist (optional) | 1.5 | Revoked tokens rejected |
| 2.4.3 | Add token expiry check | 0.5 | Expired tokens rejected |

---

## Epic 3: Task Management

### Story 3.1: Project CRUD
**As a user, I can connect GitHub repositories so the agent knows where to work.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 3.1.1 | Create POST /projects endpoint | 1.5 | Project created in DB |
| 3.1.2 | Validate repo exists via GitHub API | 1 | Invalid repos rejected |
| 3.1.3 | Create GET /projects endpoint (list) | 1 | Returns user's projects |
| 3.1.4 | Create GET /projects/:id endpoint | 0.5 | Returns single project |
| 3.1.5 | Create DELETE /projects/:id endpoint | 0.5 | Project removed |

### Story 3.2: Task CRUD
**As a user, I can create tasks (prompts) for the agent to execute.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 3.2.1 | Create POST /tasks endpoint | 2 | Task created, queued |
| 3.2.2 | Create GET /tasks endpoint (list with filters) | 1.5 | Filter by project, status |
| 3.2.3 | Create GET /tasks/:id endpoint | 1 | Returns task with messages |
| 3.2.4 | Create POST /tasks/:id/cancel endpoint | 1.5 | Task cancelled, worker stopped |

### Story 3.3: Task Queue
**As a system, tasks are processed in order from a reliable queue.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 3.3.1 | Create SQLite-backed queue table | 1 | Queue table created |
| 3.3.2 | Implement enqueue function | 1 | Task added to queue |
| 3.3.3 | Implement dequeue function (with locking) | 2 | Task removed atomically |
| 3.3.4 | Create queue processor loop | 2 | Processes tasks in order |
| 3.3.5 | Add concurrent task limit | 1 | Max N tasks running |

### Story 3.4: Task Status
**As a user, I can see the current status of my tasks.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 3.4.1 | Define status enum (queued, running, complete, failed, cancelled) | 0.5 | Types defined |
| 3.4.2 | Create status update function | 1 | Status persisted with timestamp |
| 3.4.3 | Add status history table | 1 | History tracked |
| 3.4.4 | Create internal progress endpoint | 1.5 | Workers can report progress |

---

## Epic 4: Docker & Workers

### Story 4.1: Worker Image
**As a developer, I have a Docker image that can run the agent.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 4.1.1 | Create worker Dockerfile | 2 | Image builds successfully |
| 4.1.2 | Install Node.js, git, ripgrep in image | 1 | Tools available in container |
| 4.1.3 | Copy agent code into image | 1 | Agent script runs |
| 4.1.4 | Configure non-root user | 0.5 | Container runs as non-root |
| 4.1.5 | Test image locally | 1 | Container starts, exits cleanly |

### Story 4.2: Docker Spawner
**As a system, I can spawn Docker containers for each task.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 4.2.1 | Install and configure dockerode | 1 | Can connect to Docker daemon |
| 4.2.2 | Create container spawn function | 3 | Container created with config |
| 4.2.3 | Pass environment variables securely | 1 | API key, task ID passed |
| 4.2.4 | Mount workspace volume | 1 | Volume mounted correctly |
| 4.2.5 | Set resource limits (CPU, memory) | 1 | Limits enforced |
| 4.2.6 | Configure network restrictions | 2 | Only allowed hosts reachable |

### Story 4.3: Container Lifecycle
**As a system, containers are properly managed through their lifecycle.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 4.3.1 | Implement container start | 1 | Container starts running |
| 4.3.2 | Implement container stop | 1 | Container stops gracefully |
| 4.3.3 | Implement container kill (force) | 0.5 | Container killed immediately |
| 4.3.4 | Implement container remove | 0.5 | Container and volumes removed |
| 4.3.5 | Track container ID in task record | 0.5 | Container ID persisted |

### Story 4.4: Cleanup & Recovery
**As a system, orphan containers are cleaned up and resources recovered.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 4.4.1 | Create cleanup routine (runs on startup) | 2 | Orphan containers removed |
| 4.4.2 | Create periodic cleanup job | 1 | Runs every N minutes |
| 4.4.3 | Implement task timeout | 2 | Tasks killed after 30 min |
| 4.4.4 | Mark stale tasks as failed | 1 | Stuck tasks cleaned up |
| 4.4.5 | Log cleanup actions | 0.5 | Cleanup auditable |

---

## Epic 5: Agent Core

### Story 5.1: Claude API Client
**As an agent, I can communicate with Claude API to get responses.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 5.1.1 | Install @anthropic-ai/sdk | 0.5 | Package installed |
| 5.1.2 | Create Claude client wrapper | 2 | Client configured, types work |
| 5.1.3 | Implement messages.create call | 2 | API call works |
| 5.1.4 | Implement streaming response | 3 | Stream events received |
| 5.1.5 | Implement retry with backoff | 2 | Retries on rate limit |
| 5.1.6 | Handle API errors gracefully | 1.5 | Errors logged, reported |

### Story 5.2: Tool Definitions
**As an agent, I have tools defined that Claude can call.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 5.2.1 | Define tool schema for read_file | 1 | Schema matches Claude format |
| 5.2.2 | Define tool schema for write_file | 1 | Schema correct |
| 5.2.3 | Define tool schema for list_directory | 0.5 | Schema correct |
| 5.2.4 | Define tool schema for run_command | 1 | Schema correct |
| 5.2.5 | Define tool schema for search_files | 1 | Schema correct |
| 5.2.6 | Create tool registry | 1 | All tools registered |

### Story 5.3: Tool Implementations
**As an agent, I can execute the tools Claude requests.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 5.3.1 | Implement read_file | 1.5 | Reads file, handles large files |
| 5.3.2 | Implement write_file | 1.5 | Writes file, creates dirs |
| 5.3.3 | Implement list_directory | 1 | Lists with ignore patterns |
| 5.3.4 | Implement run_command | 2 | Runs safely, captures output |
| 5.3.5 | Implement search_files (ripgrep) | 1.5 | Searches with regex |
| 5.3.6 | Create tool dispatcher | 1 | Routes tool calls |

### Story 5.4: Git Operations
**As an agent, I can clone repos, create branches, commit, and push.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 5.4.1 | Install simple-git library | 0.5 | Library works |
| 5.4.2 | Implement git clone (with auth) | 2 | Clones private repos |
| 5.4.3 | Implement git checkout -b | 1 | Creates branch |
| 5.4.4 | Implement git add and commit | 1.5 | Commits changes |
| 5.4.5 | Implement git push | 1.5 | Pushes to remote |
| 5.4.6 | Implement create PR via GitHub API | 2 | PR created with title/body |

### Story 5.5: Agent Loop
**As an agent, I orchestrate the conversation with Claude and execute tools.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 5.5.1 | Create agent entry point | 1 | Starts from task config |
| 5.5.2 | Implement conversation loop | 3 | Continues until done |
| 5.5.3 | Handle tool_use responses | 2 | Executes and returns results |
| 5.5.4 | Handle end_turn responses | 1 | Recognizes completion |
| 5.5.5 | Implement progress reporting | 2 | Reports to coordinator |
| 5.5.6 | Implement final result reporting | 1.5 | Reports success/failure |
| 5.5.7 | Handle errors and cleanup | 2 | Graceful failure |

---

## Epic 6: Real-time Updates

### Story 6.1: WebSocket Server
**As a server, I can maintain WebSocket connections with mobile clients.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 6.1.1 | Set up WebSocket server (Bun native or ws) | 2 | Server accepts connections |
| 6.1.2 | Implement connection authentication | 1.5 | JWT required to connect |
| 6.1.3 | Track active connections by user | 1 | Can find user's connections |
| 6.1.4 | Implement heartbeat/ping-pong | 1 | Dead connections detected |

### Story 6.2: Subscriptions
**As a client, I can subscribe to task updates.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 6.2.1 | Implement subscribe message handler | 1 | Client subscribed to task |
| 6.2.2 | Implement unsubscribe message handler | 0.5 | Client unsubscribed |
| 6.2.3 | Track subscriptions per connection | 1 | Can find subscribers for task |
| 6.2.4 | Clean up subscriptions on disconnect | 0.5 | No memory leaks |

### Story 6.3: Broadcasting
**As a system, I broadcast task updates to subscribed clients.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 6.3.1 | Create broadcast function | 1.5 | Sends to all subscribers |
| 6.3.2 | Wire progress endpoint to broadcast | 1 | Progress reaches clients |
| 6.3.3 | Wire complete endpoint to broadcast | 1 | Completion reaches clients |
| 6.3.4 | Handle broadcast errors | 0.5 | Failed sends don't crash |

---

## Epic 7: Mobile App

### Story 7.1: App Setup
**As a developer, I have a configured Expo project.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 7.1.1 | Create Expo project | 0.5 | Project created |
| 7.1.2 | Configure TypeScript | 0.5 | TS works |
| 7.1.3 | Install React Navigation | 1 | Navigation configured |
| 7.1.4 | Create navigation structure | 1.5 | All screens navigable |
| 7.1.5 | Set up Zustand stores | 1.5 | Stores created |
| 7.1.6 | Configure theme (colors, fonts) | 1 | Theme consistent |

### Story 7.2: Authentication Screens
**As a user, I can sign in and manage my API key.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 7.2.1 | Create Login screen UI | 2 | Screen matches design |
| 7.2.2 | Implement GitHub OAuth flow | 3 | OAuth completes |
| 7.2.3 | Store token in secure storage | 1 | Token persisted securely |
| 7.2.4 | Create Settings screen UI | 2 | Screen matches design |
| 7.2.5 | Implement API key input/update | 1.5 | Key saved, masked |
| 7.2.6 | Implement sign out | 1 | Session cleared |

### Story 7.3: Projects Screen
**As a user, I can view and manage my connected repos.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 7.3.1 | Create Projects screen UI | 2 | Screen matches design |
| 7.3.2 | Fetch and display projects | 1.5 | Projects listed |
| 7.3.3 | Implement pull-to-refresh | 0.5 | Refresh works |
| 7.3.4 | Create Add Project modal | 2 | Can search and add repo |
| 7.3.5 | Implement swipe-to-delete | 1 | Delete with confirmation |

### Story 7.4: Chat Screen
**As a user, I can send prompts and see agent progress.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 7.4.1 | Create Chat screen UI (idle state) | 2 | Screen matches design |
| 7.4.2 | Create message input component | 1.5 | Input works, send button |
| 7.4.3 | Implement send task | 2 | Task created via API |
| 7.4.4 | Create progress display component | 3 | Shows tool calls, status |
| 7.4.5 | Create result display component | 2 | Shows PR link, diff summary |
| 7.4.6 | Implement cancel task | 1 | Cancel with confirmation |
| 7.4.7 | Add loading and error states | 1.5 | States handled gracefully |

### Story 7.5: WebSocket Integration
**As a user, I see real-time updates as the agent works.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 7.5.1 | Create WebSocket client | 2 | Connects to server |
| 7.5.2 | Implement auto-reconnect | 1.5 | Reconnects on disconnect |
| 7.5.3 | Implement subscribe/unsubscribe | 1 | Subscribes to active task |
| 7.5.4 | Handle progress events | 1.5 | UI updates in real-time |
| 7.5.5 | Handle complete/error events | 1 | Final state shown |
| 7.5.6 | Show connection status indicator | 1 | User knows if connected |

### Story 7.6: History & Polish
**As a user, I can view past tasks and the app feels polished.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 7.6.1 | Create History screen UI | 2 | Screen matches design |
| 7.6.2 | Fetch and display task history | 1.5 | History listed |
| 7.6.3 | Implement task detail view | 2 | Can view past task |
| 7.6.4 | Add animations (progress, transitions) | 3 | Smooth 60fps animations |
| 7.6.5 | Add haptic feedback | 1 | Feedback on key actions |
| 7.6.6 | Implement offline queue | 3 | Tasks queued when offline |
| 7.6.7 | Test on iOS and Android | 4 | Works on both platforms |

---

## Epic 8: Testing

### Story 8.1: Unit Tests
**As a developer, I have unit tests for critical functions.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 8.1.1 | Set up test framework (bun test or vitest) | 1 | Tests run |
| 8.1.2 | Test encryption/decryption | 1 | Crypto tested |
| 8.1.3 | Test JWT generation/validation | 1 | Auth tested |
| 8.1.4 | Test queue functions | 1.5 | Queue tested |
| 8.1.5 | Test tool implementations | 2 | Tools tested |

### Story 8.2: Integration Tests
**As a developer, I have integration tests for API endpoints.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 8.2.1 | Set up test database | 1 | Isolated test DB |
| 8.2.2 | Test auth endpoints | 2 | Auth flow tested |
| 8.2.3 | Test project endpoints | 1.5 | CRUD tested |
| 8.2.4 | Test task endpoints | 2 | Task flow tested |
| 8.2.5 | Test WebSocket | 2 | Real-time tested |

### Story 8.3: End-to-End Tests
**As a developer, I can verify the full flow works.**

| ID | Task | Hours | Acceptance Criteria |
|----|------|-------|---------------------|
| 8.3.1 | Create E2E test environment | 2 | Docker compose for tests |
| 8.3.2 | Test: Create task → Agent runs → PR created | 3 | Full flow works |
| 8.3.3 | Test: Error handling (API fails) | 1.5 | Failures handled |
| 8.3.4 | Test: Concurrent tasks | 1.5 | Concurrency works |

---

## Critical Path

The minimum path to a working MVP:

```
Week 1:
  Day 1-2: E1 (Server Setup) + E2 (Auth) in parallel with E4.1 (Worker Image)
  Day 3-4: E3 (Task Management) + E4.2-4.3 (Docker Spawner)
  Day 5:   E5.1-5.2 (Claude Client + Tool Definitions)

Week 2:
  Day 6-7: E5.3-5.4 (Tool Implementations + Git)
  Day 8:   E5.5 (Agent Loop)
  Day 9:   E6 (WebSocket)
  Day 10:  Integration testing

Week 3:
  Day 11-14: E7 (Mobile App)
  Day 15:    E2E Testing + Bug fixes
```

---

## Parallel Tracks

These can be done simultaneously by different people (or in spare time):

| Track A (Backend) | Track B (Mobile) | Track C (DevOps) |
|-------------------|------------------|------------------|
| E1, E2, E3 | E7.1, E7.2 | E4.1 (Dockerfile) |
| E4.2-4.4 | E7.3 | CI/CD setup |
| E5 | E7.4, E7.5 | Deployment scripts |
| E6 | E7.6 | Monitoring setup |
| E8 | Mobile testing | Backup scripts |

---

## Definition of Done

A task is complete when:
- [ ] Code is written and compiles
- [ ] Unit tests pass (if applicable)
- [ ] Code is reviewed (self-review for solo)
- [ ] Acceptance criteria met
- [ ] No new linting errors
- [ ] Documentation updated (if API changed)

---

## Risk Register (Task-Level)

| Task | Risk | Mitigation |
|------|------|------------|
| 2.1.3 | GitHub OAuth is tricky | Use existing library, test thoroughly |
| 4.2.6 | Network restrictions complex | Start permissive, tighten later |
| 5.1.4 | Streaming can be buggy | Test with long responses |
| 5.4.6 | GitHub API rate limits | Cache where possible |
| 7.2.2 | OAuth in mobile is different | Use expo-auth-session |
| 7.5.2 | Reconnection edge cases | Test network transitions |

---

**Document Status**: Ready for Review  
**Last Updated**: December 2025
