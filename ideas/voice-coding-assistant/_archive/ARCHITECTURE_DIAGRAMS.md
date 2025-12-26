# Mobile Speech Agent App - Architecture Diagrams

> Visual architecture diagrams showing system design, data flows, and component relationships

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Data Flow Diagrams](#2-data-flow-diagrams)
3. [Component Architecture](#3-component-architecture)
4. [Sequence Diagrams](#4-sequence-diagrams)
5. [Database Schema](#5-database-schema)
6. [Deployment Architecture](#6-deployment-architecture)

---

## 1. System Architecture

### High-Level System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              USER DEVICES                                 │
│                                                                           │
│  ┌─────────────────────┐              ┌─────────────────────┐            │
│  │   iOS Device        │              │   Android Device    │            │
│  │                     │              │                     │            │
│  │  ┌──────────────┐   │              │  ┌──────────────┐   │            │
│  │  │  React       │   │              │  │  React       │   │            │
│  │  │  Native      │   │              │  │  Native      │   │            │
│  │  │  App         │   │              │  │  App         │   │            │
│  │  └──────┬───────┘   │              │  └──────┬───────┘   │            │
│  │         │           │              │         │           │            │
│  │  ┌──────▼───────┐   │              │  ┌──────▼───────┐   │            │
│  │  │ SFSpeech     │   │              │  │ Android      │   │            │
│  │  │ Recognition  │   │              │  │ Speech       │   │            │
│  │  └──────────────┘   │              │  └──────────────┘   │            │
│  └─────────────────────┘              └─────────────────────┘            │
│                                                                           │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ HTTPS / WSS
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          BACKEND SERVICES                                 │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      API Gateway / Load Balancer                   │  │
│  └────────────────────────────┬───────────────────────────────────────┘  │
│                               │                                           │
│         ┌─────────────────────┼─────────────────────┐                    │
│         │                     │                     │                    │
│         ▼                     ▼                     ▼                    │
│  ┌──────────────┐      ┌──────────────┐     ┌──────────────┐            │
│  │   Auth       │      │   Agent      │     │  Real-time   │            │
│  │   Service    │      │   Service    │     │  Service     │            │
│  │              │      │              │     │              │            │
│  │  - OAuth     │      │  - CRUD      │     │  - Pusher    │            │
│  │  - JWT       │      │  - Proxy     │     │  - WebSocket │            │
│  │  - Sessions  │      │  - Queue     │     │  - Events    │            │
│  └──────┬───────┘      └──────┬───────┘     └──────┬───────┘            │
│         │                     │                     │                    │
│         └─────────────────────┼─────────────────────┘                    │
│                               │                                           │
│                               ▼                                           │
│                    ┌────────────────────┐                                 │
│                    │   PostgreSQL       │                                 │
│                    │   Database         │                                 │
│                    │                    │                                 │
│                    │  - Users           │                                 │
│                    │  - Agents          │                                 │
│                    │  - API Keys        │                                 │
│                    │  - Sessions        │                                 │
│                    └────────────────────┘                                 │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ API Calls
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                 │
│                                                                           │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐            │
│  │  Anthropic   │      │   GitHub     │      │   Cursor     │            │
│  │  Claude API  │      │   API        │      │   API        │            │
│  │              │      │              │      │  (optional)  │            │
│  │  - Messages  │      │  - Repos     │      │  - Agents    │            │
│  │  - Streaming │      │  - PRs       │      │  - Status    │            │
│  │  - Tools     │      │  - Commits   │      │  - Control   │            │
│  └──────────────┘      └──────────────┘      └──────────────┘            │
│                                                                           │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐            │
│  │   OpenAI     │      │   Pusher     │      │   Expo       │            │
│  │   API        │      │   Real-time  │      │   Push       │            │
│  │  (optional)  │      │              │      │   Notif.     │            │
│  └──────────────┘      └──────────────┘      └──────────────┘            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Map

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Platform:  React Native + Expo SDK 52                      │
│  Language:  TypeScript 5.3+                                 │
│  UI:        React Native Paper / Tamagui                    │
│  Nav:       React Navigation 7                              │
│  State:     Zustand 4                                       │
│  Data:      TanStack Query v5                               │
│  Speech:    expo-speech + expo-speech-recognition           │
│  Storage:   expo-secure-store + async-storage               │
│  Auth:      expo-auth-session (OAuth PKCE)                  │
│  Notif:     expo-notifications                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Runtime:   Node.js 20 LTS                                  │
│  Framework: Fastify 4 (or Express 5)                        │
│  Language:  TypeScript 5.3+                                 │
│  Database:  PostgreSQL 16 (via Neon/Supabase)               │
│  ORM:       Prisma 5 or Drizzle                             │
│  Cache:     Redis 7 (optional)                              │
│  Queue:     BullMQ (optional, for async tasks)              │
│  API:       @anthropic-ai/sdk                               │
│  Auth:      jose (JWT), bcrypt                              │
│  WebSocket: ws or socket.io                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Hosting:   Vercel or Railway                               │
│  Database:  Neon Serverless PostgreSQL                      │
│  Storage:   AWS S3 (logs, artifacts)                        │
│  CDN:       Cloudflare (optional)                           │
│  Monitoring: Sentry + PostHog                               │
│  CI/CD:     GitHub Actions + EAS Build                      │
│  Secrets:   Doppler or Vercel Env Vars                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Diagrams

### Voice Command to Agent Creation Flow

```
┌──────────┐
│  USER    │
└────┬─────┘
     │ (1) Speaks: "Start an agent on wallet-frontend to add dark mode"
     ▼
┌─────────────────────────────────────────────────────────┐
│  Mobile App - Voice Interface Screen                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (2) SpeechRecognitionService.startListening()   │   │
│  │     → Captures audio from microphone            │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (3) Device STT Engine (SFSpeech / Android)      │   │
│  │     → Transcribes to text                       │   │
│  │     → Returns: "start an agent on..."           │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (4) CommandParser.parse(transcript)             │   │
│  │     → Intent: CREATE_AGENT                      │   │
│  │     → Repo: wallet-frontend                     │   │
│  │     → Task: add dark mode                       │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (5) useCreateAgent.mutate()                     │   │
│  │     → TanStack Query mutation                   │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ (6) POST /api/agents/create
                  │     { repoUrl, task, model }
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Backend Service - Agent Service                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (7) Validate auth token                         │   │
│  │     → Check JWT signature                       │   │
│  │     → Verify user permissions                   │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (8) Validate repository access                  │   │
│  │     → Query GitHub API                          │   │
│  │     → Check user has write access               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (9) Create agent record in database             │   │
│  │     → Generate agent ID                         │   │
│  │     → Generate branch name                      │   │
│  │     → Status: CREATING                          │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (10) Call Anthropic API                         │   │
│  │      → Create message with system prompt        │   │
│  │      → Include repo context                     │   │
│  │      → Stream response                          │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (11) Update agent status: RUNNING               │   │
│  │      → Emit WebSocket event                     │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ (12) Response: { agentId, status, branch }
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Mobile App - Voice Interface Screen                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (13) Format response for speech                 │   │
│  │      → "I've started an agent on               │   │
│  │         wallet-frontend to add dark mode..."    │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (14) TextToSpeechService.speak(text)            │   │
│  │      → Queue speech synthesis                   │   │
│  │      → Play audio                               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (15) Update UI state                            │   │
│  │      → Show success message                     │   │
│  │      → Navigate to agent detail                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                  │
                  ▼
              ┌──────┐
              │ USER │
              │hears │
              │reply │
              └──────┘
```

### Real-time Agent Status Updates Flow

```
┌──────────────────────────────────────────────────────────┐
│  Anthropic Claude API (Agent Execution)                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  (1) Agent writes code → (2) Runs tests → (3) Creates PR │
│      Status: RUNNING         Status: RUNNING              │
│      Progress: 25%           Progress: 75%                │
│                                                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Streaming events / polling
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Backend Service - Agent Service                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (4) Receive status update from Claude             │  │
│  │     → Parse status and progress                   │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (5) Update database                               │  │
│  │     UPDATE agents SET                             │  │
│  │       status = 'RUNNING',                         │  │
│  │       progress = 75,                              │  │
│  │       updated_at = NOW()                          │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               ├─────────────────┬─────────────────────┐   │
│               ▼                 ▼                     ▼   │
│  ┌─────────────────┐ ┌──────────────────┐ ┌──────────┐  │
│  │ (6a) Pusher     │ │ (6b) WebSocket   │ │ (6c) DB  │  │
│  │      Publish    │ │      Broadcast   │ │      Trig│  │
│  │                 │ │                  │ │      ger │  │
│  │ Channel:        │ │ Room:            │ │          │  │
│  │ agent-{id}      │ │ agent:{id}       │ │ Notifies │  │
│  │                 │ │                  │ │ listeners│  │
│  │ Event:          │ │ Event:           │ │          │  │
│  │ status-update   │ │ progress         │ │          │  │
│  └────────┬────────┘ └────────┬─────────┘ └────┬─────┘  │
└───────────┼──────────────────┼────────────────┼─────────┘
            │                  │                │
            │                  │                │
            └──────────────────┼────────────────┘
                               │
                               │ WebSocket / Long-polling
                               ▼
┌──────────────────────────────────────────────────────────┐
│  Mobile App - Real-time Service                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (7) Receive WebSocket message                     │  │
│  │     {                                             │  │
│  │       type: 'status-update',                      │  │
│  │       agentId: 'abc123',                          │  │
│  │       status: 'RUNNING',                          │  │
│  │       progress: 75                                │  │
│  │     }                                             │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (8) Update React Query cache                      │  │
│  │     queryClient.setQueryData(                     │  │
│  │       ['agents', agentId],                        │  │
│  │       (old) => ({ ...old, status, progress })     │  │
│  │     )                                             │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (9) Update Zustand state                          │  │
│  │     useAgentStore.getState().updateAgent(...)     │  │
│  └────────────┬───────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────┘
                │
                │ React re-render
                ▼
┌──────────────────────────────────────────────────────────┐
│  Mobile App - UI Components                              │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (10) AgentCard re-renders                         │  │
│  │      → Progress bar updates: 25% → 75%            │  │
│  │      → Status badge updates                       │  │
│  │      → Timestamp updates                          │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (11) Optional: Haptic feedback                    │  │
│  │      → Light tap on progress milestone            │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                           │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (12) Optional: Voice notification                 │  │
│  │      → If agent completes, speak:                 │  │
│  │         "Your agent has finished!"                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Authentication Flow (OAuth PKCE)

```
┌──────────┐
│  USER    │
│ taps     │
│ "Login"  │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  Mobile App - Auth Service                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (1) Generate PKCE challenge                     │   │
│  │     code_verifier = random(128 chars)           │   │
│  │     code_challenge = SHA256(code_verifier)      │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (2) Build authorization URL                     │   │
│  │     https://github.com/login/oauth/authorize?   │   │
│  │       client_id=...                             │   │
│  │       &redirect_uri=myapp://callback            │   │
│  │       &code_challenge=...                       │   │
│  │       &code_challenge_method=S256               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (3) Open browser (expo-web-browser)             │   │
│  │     → User sees GitHub login page               │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ User enters credentials
                  ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub OAuth Server                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (4) Validate credentials                        │   │
│  │     → User approves scopes                      │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (5) Redirect with authorization code            │   │
│  │     myapp://callback?code=ABC123                │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ Deep link
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Mobile App - Auth Service                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (6) Exchange code for token                     │   │
│  │     POST https://github.com/login/oauth/token   │   │
│  │     {                                           │   │
│  │       code: 'ABC123',                           │   │
│  │       code_verifier: '...',                     │   │
│  │       redirect_uri: 'myapp://callback'          │   │
│  │     }                                           │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ POST
                  ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub OAuth Server                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (7) Verify code_verifier matches challenge      │   │
│  │     SHA256(code_verifier) === code_challenge    │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (8) Return access token                         │   │
│  │     { access_token: 'gho_...' }                 │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ Response
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Mobile App - Auth Service                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (9) Store token securely                        │   │
│  │     SecureStore.setItemAsync(                   │   │
│  │       'github_token',                           │   │
│  │       access_token                              │   │
│  │     )                                           │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (10) Exchange for our app JWT                   │   │
│  │      POST /api/auth/exchange                    │   │
│  │      { github_token }                           │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ POST
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Backend Service - Auth Service                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (11) Verify GitHub token                        │   │
│  │      GET https://api.github.com/user            │   │
│  │      Authorization: token gho_...               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (12) Create or update user in DB                │   │
│  │      INSERT INTO users (github_id, email, ...)  │   │
│  │      ON CONFLICT UPDATE ...                     │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (13) Generate JWT                               │   │
│  │      jwt.sign(                                  │   │
│  │        { userId, email },                       │   │
│  │        SECRET,                                  │   │
│  │        { expiresIn: '7d' }                      │   │
│  │      )                                          │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (14) Return JWT + refresh token                 │   │
│  │      {                                          │   │
│  │        accessToken: 'eyJ...',                   │   │
│  │        refreshToken: 'ref_...',                 │   │
│  │        expiresIn: 604800                        │   │
│  │      }                                          │   │
│  └──────────────┬───────────────────────────────────┘   │
└─────────────────┼────────────────────────────────────────┘
                  │
                  │ Response
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Mobile App - Auth Service                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (15) Store tokens securely                      │   │
│  │      SecureStore.setItemAsync('jwt', ...)       │   │
│  │      SecureStore.setItemAsync('refresh', ...)   │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (16) Update app state                           │   │
│  │      useAuthStore.getState().setUser(user)      │   │
│  │      useAuthStore.getState().setAuth(true)      │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ (17) Navigate to main app                       │   │
│  │      navigation.navigate('MainTabs')            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### React Native Component Tree

```
App.tsx
│
├─ QueryClientProvider (TanStack Query)
│  │
│  └─ AppNavigator
│     │
│     ├─ AuthNavigator (if !authenticated)
│     │  │
│     │  ├─ WelcomeScreen
│     │  ├─ LoginScreen
│     │  └─ OnboardingScreen
│     │
│     └─ MainTabNavigator (if authenticated)
│        │
│        ├─ VoiceStack
│        │  │
│        │  └─ VoiceInterfaceScreen
│        │     ├─ VoiceButton
│        │     ├─ TranscriptDisplay
│        │     ├─ WaveformVisualizer
│        │     └─ QuickActions
│        │
│        ├─ AgentsStack
│        │  │
│        │  ├─ AgentsListScreen
│        │  │  ├─ AgentCard (list)
│        │  │  ├─ FilterTabs
│        │  │  └─ SearchBar
│        │  │
│        │  ├─ AgentDetailScreen
│        │  │  ├─ StatusSection
│        │  │  ├─ DetailsCard
│        │  │  ├─ ActivityList
│        │  │  └─ FollowUpInput
│        │  │
│        │  ├─ CreateAgentScreen
│        │  │  ├─ RepoSelector
│        │  │  ├─ TaskInput
│        │  │  └─ ModelSelector
│        │  │
│        │  └─ AgentLogsScreen
│        │     └─ LogViewer
│        │
│        ├─ ReposStack
│        │  │
│        │  └─ ReposListScreen
│        │     ├─ RepoCard (list)
│        │     └─ FilterTabs
│        │
│        └─ SettingsStack
│           │
│           ├─ SettingsScreen
│           │  ├─ AccountSection
│           │  ├─ VoiceSection
│           │  ├─ AgentSection
│           │  └─ NotificationSection
│           │
│           ├─ VoiceSettingsScreen
│           │  ├─ VoiceInputSettings
│           │  ├─ VoiceOutputSettings
│           │  └─ LanguageSelector
│           │
│           └─ AccountScreen
│              ├─ ProfileInfo
│              └─ ConnectedServices
```

### Service Layer Architecture

```
Services/
│
├─ Speech/
│  ├─ SpeechRecognitionService
│  │  ├─ initialize()
│  │  ├─ startListening()
│  │  ├─ stopListening()
│  │  └─ EventEmitter
│  │     ├─ on('transcript')
│  │     ├─ on('finalTranscript')
│  │     └─ on('error')
│  │
│  ├─ TextToSpeechService
│  │  ├─ speak(text, options)
│  │  ├─ queueSpeech()
│  │  ├─ stop()
│  │  ├─ pause()
│  │  └─ resume()
│  │
│  └─ CommandParser
│     ├─ parse(transcript)
│     ├─ detectIntent()
│     ├─ extractParameters()
│     └─ getSuggestions()
│
├─ API/
│  ├─ AgentApiService
│  │  ├─ listAgents(filter?)
│  │  ├─ getAgent(id)
│  │  ├─ createAgent(request)
│  │  ├─ pauseAgent(id)
│  │  ├─ resumeAgent(id)
│  │  ├─ stopAgent(id)
│  │  └─ getAgentLogs(id)
│  │
│  ├─ RepoApiService
│  │  ├─ listRepos()
│  │  ├─ getRepo(id)
│  │  └─ searchRepos(query)
│  │
│  └─ AuthApiService
│     ├─ login(provider)
│     ├─ refresh()
│     ├─ logout()
│     └─ validateToken()
│
├─ Storage/
│  ├─ SecureStorage
│  │  ├─ saveToken()
│  │  ├─ getToken()
│  │  └─ deleteToken()
│  │
│  └─ LocalStorage
│     ├─ savePreferences()
│     ├─ getPreferences()
│     └─ clearAll()
│
└─ Realtime/
   ├─ PusherService
   │  ├─ subscribeToAgent()
   │  ├─ unsubscribeFromAgent()
   │  └─ disconnect()
   │
   └─ WebSocketService (alternative)
      ├─ connect()
      ├─ subscribe()
      └─ disconnect()
```

---

## 4. Sequence Diagrams

### Agent Completion to PR Creation Sequence

```
Agent      Backend     Database    GitHub     Pusher      Mobile
  │           │           │          │          │          │
  │ Complete  │           │          │          │          │
  │──────────>│           │          │          │          │
  │           │ Update    │          │          │          │
  │           │ status    │          │          │          │
  │           │──────────>│          │          │          │
  │           │    OK     │          │          │          │
  │           │<──────────│          │          │          │
  │           │           │          │          │          │
  │           │ Create PR │          │          │          │
  │           │───────────────────>  │          │          │
  │           │           │    PR    │          │          │
  │           │           │   #245   │          │          │
  │           │<───────────────────  │          │          │
  │           │           │          │          │          │
  │           │ Save PR   │          │          │          │
  │           │──────────>│          │          │          │
  │           │    OK     │          │          │          │
  │           │<──────────│          │          │          │
  │           │           │          │          │          │
  │           │ Publish   │          │          │          │
  │           │ event     │          │          │          │
  │           │─────────────────────────────────>│          │
  │           │           │          │          │          │
  │           │           │          │          │ Update   │
  │           │           │          │          │─────────>│
  │           │           │          │          │          │
  │           │           │          │          │  Render  │
  │           │           │          │          │   UI     │
  │           │           │          │          │<─────────│
  │           │           │          │          │          │
  │           │           │          │          │  Speak   │
  │           │           │          │          │  "Done!" │
  │           │           │          │          │<─────────│
  │           │           │          │          │          │
  │           │           │          │          │   Push   │
  │           │           │          │          │   Notif  │
  │           │           │          │          │<─────────│
```

---

## 5. Database Schema

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  github_id VARCHAR(255) UNIQUE,
  github_username VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys (encrypted)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'anthropic', 'openai', 'cursor'
  encrypted_key TEXT NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  UNIQUE(user_id, provider)
);

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Repository info
  repo_url VARCHAR(500) NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  base_branch VARCHAR(255) NOT NULL DEFAULT 'main',
  work_branch VARCHAR(255) NOT NULL,

  -- Task info
  task_description TEXT NOT NULL,
  model VARCHAR(100) NOT NULL DEFAULT 'claude-3.5-sonnet',

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'CREATING',
    -- CREATING, RUNNING, PAUSED, FINISHED, ERROR, EXPIRED
  progress INT DEFAULT 0,
  error_message TEXT,

  -- Results
  pr_number INT,
  pr_url TEXT,
  commits_count INT DEFAULT 0,
  files_changed INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  INDEX idx_user_agents (user_id, created_at DESC),
  INDEX idx_status (status),
  INDEX idx_repo (repo_name)
);

-- Agent logs table
CREATE TABLE agent_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT NOW(),
  level VARCHAR(20) NOT NULL, -- 'info', 'action', 'error', 'success'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  INDEX idx_agent_logs (agent_id, timestamp DESC)
);

-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Voice settings
  voice_enabled BOOLEAN DEFAULT true,
  voice_speed DECIMAL(3,2) DEFAULT 0.9,
  voice_type VARCHAR(100) DEFAULT 'Samantha',
  auto_speak BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'en-US',

  -- Agent preferences
  default_model VARCHAR(100) DEFAULT 'claude-3.5-sonnet',
  auto_create_pr BOOLEAN DEFAULT true,
  run_tests_first BOOLEAN DEFAULT true,

  -- Notification preferences
  push_enabled BOOLEAN DEFAULT true,
  notify_on_complete BOOLEAN DEFAULT true,
  notify_on_error BOOLEAN DEFAULT true,
  notify_on_pr BOOLEAN DEFAULT true,

  updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_tokens (user_id, expires_at)
);

-- Usage tracking table
CREATE TABLE usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  event_type VARCHAR(50) NOT NULL, -- 'agent_create', 'voice_command', etc.
  tokens_used INT,
  cost_usd DECIMAL(10,4),

  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  INDEX idx_user_usage (user_id, timestamp DESC)
);
```

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ • id (PK)       │
│ • email         │
│ • github_id     │
│ • github_username│
│ • avatar_url    │
│ • created_at    │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────┬────────────┬────────────┬──────────────┐
    │         │            │            │              │
    ▼         ▼            ▼            ▼              ▼
┌────────┐ ┌────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│agents  │ │api_keys│ │user_prefs │ │refresh_  │ │usage_    │
│        │ │        │ │           │ │tokens    │ │logs      │
├────────┤ ├────────┤ ├───────────┤ ├──────────┤ ├──────────┤
│• id    │ │• id    │ │• user_id  │ │• id      │ │• id      │
│• user_id│ │• user_id│ │• voice_*  │ │• user_id │ │• user_id │
│• repo_*│ │• provider│ │• default_*│ │• token_  │ │• event_  │
│• task  │ │• enc_key│ │• notify_* │ │  hash    │ │  type    │
│• status│ │• created│ │• updated  │ │• expires │ │• tokens  │
│• pr_*  │ │  _at   │ │  _at      │ │  _at     │ │• cost    │
│• dates │ └────────┘ └───────────┘ └──────────┘ │• timestamp│
└────┬───┘                                        └──────────┘
     │
     │ 1:N
     │
     ▼
┌────────────┐
│agent_logs  │
├────────────┤
│ • id       │
│ • agent_id │
│ • timestamp│
│ • level    │
│ • message  │
│ • metadata │
└────────────┘
```

---

## 6. Deployment Architecture

### Production Deployment Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐              │
│  │           │     │           │     │           │              │
│  │  iPhone   │     │  Android  │     │   iPad    │              │
│  │  (iOS 14+)│     │  (API 23+)│     │           │              │
│  │           │     │           │     │           │              │
│  └─────┬─────┘     └─────┬─────┘     └─────┬─────┘              │
│        │                 │                 │                    │
└────────┼─────────────────┼─────────────────┼────────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           │ HTTPS / WSS
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                         CDN LAYER                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Cloudflare CDN (Optional)                     │  │
│  │  • DDoS protection                                         │  │
│  │  • Rate limiting                                           │  │
│  │  • SSL termination                                         │  │
│  │  • Geo-routing                                             │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  Vercel Edge Network                       │  │
│  │  Region: us-east-1 (primary)                               │  │
│  │  Regions: us-west-2, eu-west-1 (replica)                   │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  Backend API (Node.js/Fastify)                       │ │  │
│  │  │  Instances: Auto-scale (1-10)                        │ │  │
│  │  │  Memory: 1GB per instance                            │ │  │
│  │  │                                                      │ │  │
│  │  │  Routes:                                             │ │  │
│  │  │  • /api/auth/*                                       │ │  │
│  │  │  • /api/agents/*                                     │ │  │
│  │  │  • /api/repos/*                                      │ │  │
│  │  │  • /ws/* (WebSocket)                                 │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Neon Serverless PostgreSQL                         │  │
│  │         Region: us-east-1                                  │  │
│  │                                                            │  │
│  │  ┌──────────────┐           ┌──────────────┐              │  │
│  │  │  Primary     │  Replica  │  Read        │              │  │
│  │  │  Database    │──────────>│  Replica     │              │  │
│  │  │              │           │              │              │  │
│  │  │  • Users     │           │  (Read-only) │              │  │
│  │  │  • Agents    │           │              │              │  │
│  │  │  • Logs      │           │              │              │  │
│  │  └──────────────┘           └──────────────┘              │  │
│  │                                                            │  │
│  │  Auto-scaling: 0.5 - 4 compute units                      │  │
│  │  Storage: Unlimited (pay per GB)                          │  │
│  │  Backups: Daily automatic + PITR                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Redis (Upstash - Optional)                         │  │
│  │         • Session cache                                    │  │
│  │         • Rate limiting                                    │  │
│  │         • API response cache                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         AWS S3 (Optional)                                  │  │
│  │         • Agent logs (archived)                            │  │
│  │         • User uploads                                     │  │
│  │         • Backups                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │  Anthropic    │  │   GitHub      │  │   Pusher           │   │
│  │  Claude API   │  │   API         │  │   (or Supabase RT) │   │
│  └───────────────┘  └───────────────┘  └────────────────────┘   │
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │  Sentry       │  │   PostHog     │  │   Expo Push        │   │
│  │  (Errors)     │  │  (Analytics)  │  │   Notifications    │   │
│  └───────────────┘  └───────────────┘  └────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  DEVELOPMENT WORKFLOW                                        │
└─────────────────────────────────────────────────────────────┘

Developer
    │
    │ git push to feature branch
    ▼
GitHub Repository
    │
    │ Triggers webhook
    ▼
┌──────────────────────────────────────────────────────────────┐
│  GitHub Actions - PR Checks                                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Job 1: Lint & Type Check        Job 2: Unit Tests          │
│  ┌──────────────────────┐         ┌──────────────────────┐   │
│  │ • npm run lint       │         │ • npm test           │   │
│  │ • npm run type-check │         │ • Coverage report    │   │
│  └──────────────────────┘         └──────────────────────┘   │
│                                                               │
│  Job 3: Security Scan             Job 4: Build Check        │
│  ┌──────────────────────┐         ┌──────────────────────┐   │
│  │ • npm audit          │         │ • npm run build      │   │
│  │ • Snyk scan          │         │ • Size analysis      │   │
│  └──────────────────────┘         └──────────────────────┘   │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        │ All checks pass
                        ▼
                  PR Review & Merge
                        │
                        │ Merge to main
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  GitHub Actions - Deploy to Production                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Stage 1: Build Backend                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • Install dependencies                                  │ │
│  │ • Run build (TypeScript → JavaScript)                  │ │
│  │ • Generate Prisma client                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                        │                                      │
│                        ▼                                      │
│  Stage 2: Deploy to Vercel                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • vercel deploy --prod                                  │ │
│  │ • Run migrations (Prisma)                               │ │
│  │ • Warm up instances                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                        │                                      │
│                        ▼                                      │
│  Stage 3: Build Mobile App (EAS)                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • eas build --platform ios --profile production         │ │
│  │ • eas build --platform android --profile production     │ │
│  │ • Upload to App Store / Play Store (manual review)      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                        │                                      │
│                        ▼                                      │
│  Stage 4: Smoke Tests                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • Health check: GET /api/health                         │ │
│  │ • Auth test: POST /api/auth/login (test account)        │ │
│  │ • Database connectivity check                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                        │                                      │
│                        ▼                                      │
│  Stage 5: Notify Team                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • Slack notification: "Deploy successful"               │ │
│  │ • Update status page                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Network Architecture

### API Request Flow

```
Mobile App                Backend               External API
    │                        │                       │
    │ 1. POST /api/agents   │                       │
    │    Authorization:      │                       │
    │    Bearer eyJ...       │                       │
    │───────────────────────>│                       │
    │                        │                       │
    │                        │ 2. Verify JWT         │
    │                        │    Check signature    │
    │                        │    Check expiry       │
    │                        │                       │
    │                        │ 3. Rate limit check   │
    │                        │    Redis GET user:123 │
    │                        │                       │
    │                        │ 4. Validate payload   │
    │                        │    Zod schema check   │
    │                        │                       │
    │                        │ 5. DB query           │
    │                        │    Check user repo    │
    │                        │    access             │
    │                        │                       │
    │                        │ 6. Call Claude API    │
    │                        │───────────────────────>│
    │                        │                       │
    │                        │    7. Stream response │
    │                        │<───────────────────────│
    │                        │                       │
    │                        │ 8. Save to DB         │
    │                        │    INSERT agent...    │
    │                        │                       │
    │    9. Response         │                       │
    │<───────────────────────│                       │
    │    { agentId, ...}     │                       │
    │                        │                       │
    │ 10. WebSocket sub      │                       │
    │     agent-{id}         │                       │
    │───────────────────────>│                       │
    │                        │                       │
    │    11. Status updates  │                       │
    │<───────────────────────│                       │
    │    (real-time)         │                       │
```

---

**Document Version:** 1.0
**Last Updated:** 2024-12-18
**Created For:** Mobile Speech Agent App Planning Phase
