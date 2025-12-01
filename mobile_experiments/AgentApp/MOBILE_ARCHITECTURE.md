# Mobile Architecture for AI Coding Agent App

## Overview

This document outlines the proposed architecture for a native mobile AI coding agent app with feature parity to Cursor Agents.

---

## Feature Requirements

### Must Have (P0)

| Feature | Description |
|---------|-------------|
| Agent Chat | Send tasks to AI, receive streaming responses |
| Code Viewer | View and navigate code files with syntax highlighting |
| File Browser | Browse project file structure |
| Tool Execution | AI can read/write files, run commands |
| Task History | View past agent sessions |
| Real-time Updates | See agent progress in real-time |

### Should Have (P1)

| Feature | Description |
|---------|-------------|
| Code Editor | Make manual edits to files |
| Git Integration | View diffs, commits, create PRs |
| Multi-Project | Support multiple workspaces |
| Offline Viewing | View code without network |
| Push Notifications | Alert when background tasks complete |

### Nice to Have (P2)

| Feature | Description |
|---------|-------------|
| Voice Input | Speak commands to agent |
| AR Code View | Visualize code structure in AR |
| Collaborative | Multiple users on same project |
| Local Models | Run smaller models on-device |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Chat UI   │  │ Code Viewer │  │   File Browser      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Git View   │  │ Task History│  │   Settings          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   STATE MANAGEMENT LAYER                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Agent State │ Project State │ Auth State │ UI State   │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Agent Service│  │ File Service │  │  Git Service    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Claude Client│  │ WebSocket    │  │  Storage        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    NETWORK LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │   HTTPS / WebSocket to Backend & Claude API             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Agent Worker │  │ File Sync    │  │  Git Operations │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Task Queue   │  │ Project DB   │  │  Auth (OAuth)   │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Claude API  │  │  GitHub API  │  │  GitLab API     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Mobile App Components

#### Chat UI
- Streaming message display
- Markdown rendering with code blocks
- Tool call visualization
- Typing indicators

#### Code Viewer
- Syntax highlighting (all major languages)
- Line numbers
- Search within file
- Jump to definition (future)

#### File Browser
- Tree view of project
- File icons by type
- Quick search/filter
- Pull-to-refresh

#### Git View
- Commit history
- Diff viewer
- Branch switcher
- PR creation

### 2. Agent Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT SERVICE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                 ORCHESTRATOR                      │   │
│  │  - Manages conversation state                     │   │
│  │  - Handles tool execution loop                    │   │
│  │  - Coordinates with Claude API                    │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│           ┌──────────────┼──────────────┐               │
│           ▼              ▼              ▼               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   TOOLS    │  │   TOOLS    │  │   TOOLS    │        │
│  │            │  │            │  │            │        │
│  │ read_file  │  │ write_file │  │ run_shell  │        │
│  │ list_files │  │ edit_file  │  │ git_ops    │        │
│  │ search     │  │ create_file│  │ grep       │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Tools Implementation

| Tool | Description | Execution Location |
|------|-------------|-------------------|
| `read_file` | Read file contents | Backend |
| `write_file` | Write/create files | Backend |
| `list_files` | List directory contents | Backend |
| `search_files` | Grep/ripgrep search | Backend |
| `run_command` | Execute shell commands | Backend (sandboxed) |
| `git_status` | Get git status | Backend |
| `git_commit` | Create commit | Backend |
| `git_diff` | Show changes | Backend |
| `create_pr` | Create pull request | Backend → GitHub API |

### 4. Data Flow

```
User Input
    │
    ▼
┌─────────────────┐
│   Mobile App    │
│   (Chat UI)     │
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│    Backend      │
│  (Orchestrator) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Claude API    │
│  (Anthropic)    │
└────────┬────────┘
         │
         ▼
    Tool Calls
         │
         ▼
┌─────────────────┐
│    Backend      │──────► File System
│  (Tool Runner)  │──────► Git
└────────┬────────┘──────► Shell
         │
         ▼
    Tool Results
         │
         ▼
┌─────────────────┐
│   Claude API    │
│  (Continue)     │
└────────┬────────┘
         │
         ▼
    Response Stream
         │
         ▼
┌─────────────────┐
│   Mobile App    │
│   (Display)     │
└─────────────────┘
```

---

## Backend Architecture Options

### Option A: Full Backend (Recommended for V1)

```
┌─────────────────────────────────────────┐
│           BACKEND SERVER                 │
│                                          │
│  ┌────────────┐    ┌─────────────────┐  │
│  │   API      │    │  Agent Workers  │  │
│  │  Gateway   │───▶│  (Sandboxed)    │  │
│  └────────────┘    └─────────────────┘  │
│        │                    │            │
│        ▼                    ▼            │
│  ┌────────────┐    ┌─────────────────┐  │
│  │  Database  │    │   File Storage  │  │
│  │ (Postgres) │    │    (S3/GCS)     │  │
│  └────────────┘    └─────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

**Pros:**
- Full control over agent execution
- Secure sandboxing of shell commands
- Persistent project storage
- Can run long tasks in background

**Cons:**
- Infrastructure costs
- More complex to deploy
- Latency from network round-trips

### Option B: Hybrid (Backend + Local Agent)

```
┌─────────────────┐         ┌─────────────────┐
│   Mobile App    │◀───────▶│  Local Agent    │
│                 │         │  (Computer)     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ Light Backend   │         │  Claude API     │
│ (Auth, Sync)    │         │  (Direct)       │
└─────────────────┘         └─────────────────┘
```

**Pros:**
- Local agent has full filesystem access
- Lower latency for file operations
- Reduced backend costs

**Cons:**
- Requires companion desktop app
- More complex setup for users
- Can't work on files without computer nearby

### Option C: Serverless Functions

```
┌─────────────────┐
│   Mobile App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │
│ (AWS/GCP/Azure) │
└────────┬────────┘
         │
    ┌────┴────┬─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│Lambda │ │Lambda │ │Lambda │
│Claude │ │Files  │ │Git    │
└───────┘ └───────┘ └───────┘
```

**Pros:**
- Pay per use
- Auto-scaling
- Simpler deployment

**Cons:**
- Cold start latency
- Stateless (harder for long tasks)
- Limited execution time (15 min max)

---

## Security Considerations

### 1. Authentication
- OAuth2 with GitHub/GitLab
- JWT tokens for API access
- Refresh token rotation

### 2. Authorization
- Per-project permissions
- Read-only vs write access
- Admin roles for team features

### 3. Agent Sandboxing
- Docker containers for shell execution
- Resource limits (CPU, memory, time)
- Network isolation
- No access to other projects

### 4. Data Protection
- TLS for all connections
- Encrypted storage at rest
- No permanent storage of API keys on backend

---

## Technology Stack Recommendation

### Mobile App

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| Framework | Flutter | Native perf, single codebase |
| State | Riverpod | Reactive, testable |
| HTTP | Dio | Powerful, interceptors |
| WebSocket | web_socket_channel | Built-in Flutter support |
| Storage | Hive | Fast local DB |
| Auth | flutter_appauth | OAuth2 |

### Backend

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| Runtime | Node.js / Python | Good Claude SDK support |
| Framework | FastAPI (Python) | Fast, async, auto-docs |
| Database | PostgreSQL | Reliable, feature-rich |
| Queue | Redis + Bull | Background jobs |
| Storage | S3/GCS | Scalable file storage |
| Container | Docker | Sandboxing |

### Infrastructure

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| Hosting | Railway / Fly.io | Easy, affordable |
| CDN | Cloudflare | Fast, free tier |
| Monitoring | Sentry | Error tracking |
| Logs | Axiom | Log aggregation |

---

## MVP Scope

### Phase 1: Basic Agent Chat (2-3 weeks)
- [ ] Claude API integration
- [ ] Basic chat UI with streaming
- [ ] Read-only file viewing
- [ ] Project structure browsing

### Phase 2: Tool Execution (2-3 weeks)
- [ ] File read/write tools
- [ ] Shell command execution
- [ ] Git status/diff viewing
- [ ] Task history

### Phase 3: Full Git Integration (2 weeks)
- [ ] Create commits
- [ ] Create branches
- [ ] Create PRs
- [ ] Push notifications

### Phase 4: Polish & Release (2 weeks)
- [ ] Offline support
- [ ] Performance optimization
- [ ] App store submission
- [ ] Documentation

---

## Cost Estimates

### Monthly Operating Costs (1000 active users)

| Service | Estimated Cost |
|---------|---------------|
| Claude API | $500-2000 (usage dependent) |
| Backend hosting | $50-200 |
| Database | $50-100 |
| File storage | $20-50 |
| **Total** | **$620-2350/month** |

### Monetization Options

1. **Freemium**: Free tier with limited messages, paid for more
2. **BYOK**: Users bring their own Claude API key
3. **Subscription**: $10-20/month for full access
4. **Team Plans**: Per-seat pricing for organizations

---

## Next Steps

1. Review and finalize architecture decisions
2. Set up project structure
3. Build MVP backend with Claude integration
4. Build mobile app with basic chat
5. Iterate based on testing

---

**Document Status**: Draft  
**Next Review**: After framework selection
