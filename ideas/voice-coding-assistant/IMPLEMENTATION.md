# Cadence - Implementation Guide

> **Project:** Voice-Enabled AI Coding Assistant (React Native Mobile App)
> **Target:** Feature parity with Cursor/Claude Code + Voice interface
> **Timeline:** 12 weeks MVP

---

## Milestone 0: Validate the Idea (3-5 days)

> **Goal:** Prove voice → agent → code changes works BEFORE building mobile app

### Why Start Here?

The riskiest assumptions are:
1. Voice transcription is accurate enough for coding tasks
2. Claude Agent SDK can reliably modify codebases
3. The end-to-end flow is fast enough (<30 seconds)

**Build the smallest prototype to validate these before investing in React Native.**

### Validation Prototype (Node.js CLI)

```bash
# Create validation prototype
mkdir cadence-prototype && cd cadence-prototype
npm init -y
npm install @anthropic-ai/claude-code openai dotenv readline
```

```typescript
// prototype.ts - Minimal end-to-end validation
import { query } from '@anthropic-ai/claude-code';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as readline from 'readline';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioPath: string): Promise<string> {
  const file = fs.createReadStream(audioPath);
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
  });
  return response.text;
}

async function runAgent(task: string, repoPath: string): Promise<void> {
  console.log(`\n🤖 Starting agent: "${task}"\n`);

  const response = await query({
    prompt: task,
    cwd: repoPath,
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY!,
    options: { maxTurns: 20 },
  });

  for await (const event of response) {
    if (event.type === 'text') {
      process.stdout.write(event.text);
    } else if (event.type === 'tool_use') {
      console.log(`\n🔧 ${event.name}: ${JSON.stringify(event.input).slice(0, 100)}...`);
    }
  }
}

// Run validation
async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--audio') {
    // Voice mode: transcribe audio file then run agent
    const transcript = await transcribeAudio(args[1]);
    console.log(`📝 Transcript: "${transcript}"`);
    await runAgent(transcript, args[2] || process.cwd());
  } else {
    // Text mode: direct input
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter task: ', async (task) => {
      await runAgent(task, args[0] || process.cwd());
      rl.close();
    });
  }
}

main().catch(console.error);
```

### Validation Checklist

| Test | Command | Success Criteria |
|------|---------|------------------|
| **Voice accuracy** | Record 10 coding tasks, transcribe | >90% word accuracy |
| **Agent execution** | `npx tsx prototype.ts ./test-repo` | Agent edits files correctly |
| **End-to-end** | `npx tsx prototype.ts --audio recording.m4a ./test-repo` | Voice → working code change |
| **Latency** | Time full flow | <30 seconds total |
| **Cost check** | Track API costs | <$0.50 per agent run |

### Golden Dataset (Continuous Eval)

**CRITICAL:** Before moving to Phase 1, create a dataset of 20 "Golden Inputs" to prevent regressions.

1.  **Inputs:** 20 audio files covering:
    *   "Create a component..." (Creation)
    *   "Fix the bug in..." (Debugging)
    *   "Add an endpoint..." (Backend)
    *   "Refactor this..." (Modification)
2.  **Expected:** The correct file changes or valid PR descriptions.
3.  **Pipeline:** A script that runs all 20 against the current agent version and reports Pass/Fail.

---

## Quick Start

```bash
# ==========================================
# MOBILE APP (React Native + Expo)
# ==========================================
npx create-expo-app@latest cadence --template expo-template-blank-typescript
cd cadence

# Core Expo dependencies
npx expo install expo-speech expo-av expo-secure-store expo-notifications expo-auth-session expo-crypto

# State & data
npm install zustand @tanstack/react-query axios

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# ==========================================
# BACKEND SERVER (Fastify + TypeScript)
# ==========================================
mkdir -p ../cadence-backend && cd ../cadence-backend
npm init -y

# Core framework
npm install fastify @fastify/cors @fastify/jwt @fastify/cookie @fastify/rate-limit

# Database & ORM
npm install drizzle-orm postgres pgvector
npm install -D drizzle-kit

# Job queue & cache
npm install bullmq ioredis

# AI providers
npm install @anthropic-ai/claude-code openai @google/generative-ai

# Auth & security
npm install jose bcryptjs
npm install -D @types/bcryptjs

# Push notifications
npm install expo-server-sdk

# Utilities
npm install zod dotenv nanoid
npm install -D typescript @types/node tsx

# Initialize TypeScript
npx tsc --init
```

---

## Tech Stack (Final)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native + Expo SDK 52 | Cross-platform iOS/Android |
| **Navigation** | React Navigation 7 | Tab + stack navigation |
| **State** | Zustand 4 | Lightweight state management |
| **Data** | TanStack Query v5 | API caching, optimistic updates |
| **Backend** | Fastify 4 + TypeScript | Fast, schema-validated API |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Queue** | BullMQ + Redis | Background job processing |
| **AI Core** | Multi-provider abstraction | Claude, OpenAI, Gemini, local |
| **STT** | OpenAI Whisper API (MVP) | 95-98% voice accuracy |
| **TTS** | expo-speech | On-device, <50ms latency |
| **Database** | PostgreSQL 16 (Neon) | Serverless, auto-scale |
| **Vector DB** | **pgvector** | **RAG / Codebase Context** |
| **Cache** | Redis (Upstash) | Session, rate limiting, queues |
| **Real-time** | Polling + Push | Reliable updates |
| **Auth** | GitHub OAuth + JWT | Secure, stateless auth |
| **Execution** | **Fly.io Machines** | **Ephemeral Firecracker VMs** |

---

## Backend Architecture

The backend is **critical** - it handles auth, multi-model AI, job orchestration, and real-time updates.

### Backend Project Structure

```
cadence-backend/
├── src/
│   ├── index.ts                    # Fastify app entry
│   ├── config/
│   │   ├── env.ts                  # Environment variables
│   │   └── database.ts             # DB connection
│   ├── routes/
│   │   ├── auth.ts                 # OAuth endpoints
│   │   ├── agents.ts               # Agent CRUD
│   │   ├── repos.ts                # Repository listing
│   │   ├── models.ts               # Model configuration
│   │   ├── users.ts                # User preferences
│   │   └── webhooks.ts             # GitHub webhooks
│   ├── services/
│   │   ├── ai/                     # Multi-model abstraction
│   │   │   ├── providers/
│   │   │   │   ├── claude.ts       # Claude/Agent SDK
│   │   │   │   ├── openai.ts       # OpenAI GPT-4/o1
│   │   │   │   ├── gemini.ts       # Google Gemini
│   │   │   │   └── local.ts        # Ollama/local models
│   │   │   ├── ModelRouter.ts      # Provider selection
│   │   │   └── types.ts            # Shared interfaces
│   │   ├── agent/
│   │   │   ├── AgentExecutor.ts    # Core execution logic
│   │   │   ├── AgentQueue.ts       # Job queue management
│   │   │   └── AgentSandbox.ts     # Fly.io isolation
│   │   ├── codebase/
│   │   │   ├── CodebaseIndexer.ts  # Vector embeddings
│   │   │   ├── ContextBuilder.ts   # RAG retrieval
│   │   │   └── FileSelector.ts     # Relevant file picking
│   │   ├── auth/
│   │   │   ├── GitHubAuth.ts       # OAuth flow
│   │   │   ├── JwtService.ts       # Token management
│   │   │   └── SessionStore.ts     # Redis sessions
│   │   ├── notifications/
│   │   │   ├── PushService.ts      # Expo push notifications
│   │   │   └── SSEManager.ts       # Server-sent events
│   │   └── usage/
│   │       ├── UsageTracker.ts     # Per-user tracking
│   │       ├── RateLimiter.ts      # Request limits
│   │       └── CostCalculator.ts   # API cost estimation
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema
│   │   └── migrations/             # Database migrations
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification
│   │   ├── rateLimit.ts            # Rate limiting
│   │   └── errorHandler.ts         # Global error handling
│   ├── workers/
│   │   ├── agentWorker.ts          # BullMQ agent processor
│   │   └── cleanupWorker.ts        # Old data cleanup
│   └── types/
│       └── index.ts                # Shared types
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## Implementation Phases

### Phase 0: Foundation (Week 1)

| # | Task | Est. | Output |
|---|------|------|--------|
| 0.1 | Create Expo project with TypeScript | 2h | Working app shell |
| 0.2 | Create backend project with Fastify | 2h | API shell |
| 0.3 | **Establish Evaluation Pipeline (Golden Dataset)** | **8h** | **20 test cases + runner** |
| 0.4 | Set up Claude Agent SDK integration | 4h | Agent execution working |

---

### Phase 5: Codebase Context (Week 7-8)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 5.1 | Fetch repo tree via GitHub API | 4h | GitHub auth |
| 5.2 | **Implement Codebase Indexer (pgvector)** | **8h** | **B-02** |
| 5.3 | **Implement Semantic Search (RAG)** | **6h** | **5.2** |
| 5.4 | Relevant file selection (RAG + Claude analysis) | 6h | Claude API |
| 5.5 | Context caching (24h TTL) | 2h | - |
| 5.6 | Integrate context into agent prompts | 3h | AgentExecutor |

**CodebaseIndexer (Pseudo-code):**
```typescript
async function indexRepo(repoId: string, repoUrl: string) {
  // 1. Fetch file list (recursive)
  const files = await github.getTree(repoUrl);

  // 2. Filter for code files (.ts, .js, .py, etc.)
  const codeFiles = files.filter(f => isCode(f.path));

  // 3. For each file (batched):
  for (const file of codeFiles) {
    const content = await github.getBlob(file.sha);
    // 4. Chunk content
    const chunks = splitIntoChunks(content);
    // 5. Generate embeddings
    const embeddings = await openai.embeddings.create({ input: chunks, model: 'text-embedding-3-small' });
    // 6. Store in pgvector
    await db.insert(embeddingsTable).values(embeddings.map(e => ({
      repoId,
      filePath: file.path,
      vector: e.embedding,
      content: e.text
    })));
  }
}
```

---

## Phase 9: Future Roadmap (Post-MVP)

> **Note:** These tasks are deliberately deferred to ensure MVP delivery. They are the "Scale" phase.

| Task ID | Task | Complexity | Value |
|---------|------|------------|-------|
| `F-01` | **VPS-per-User Infrastructure** (Hetzner) | High | Zero cold start, persistent workspace |
| `F-02` | **Deepgram Nova-2 Integration** (Streaming) | High | <300ms voice latency |
| `F-03` | **Multi-File "Composer" Editing** | Very High | Feature parity with Cursor |
| `F-04` | **Self-Hosted LLM Option** (Ollama) | High | Privacy/Enterprise requirement |
| `F-05` | **Web Search Tool** (@Web) | Medium | Better context for agents |

---

## Task Breakdown for AI Agents

### Sprint 0: Validation (3-5 days) - MUST DO FIRST

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `V-01` | Create `cadence-prototype` folder with Node.js + TypeScript | P0 | 1h | None |
| `V-02` | Implement Whisper transcription function | P0 | 2h | V-01 |
| `V-03` | Implement Claude Agent SDK wrapper | P0 | 2h | V-01 |
| `V-04` | Create end-to-end CLI tool (text → agent → changes) | P0 | 2h | V-02, V-03 |
| `V-05` | Record 5 test voice commands and transcribe | P0 | 1h | V-02 |
| `V-06` | Run agents on 5 test tasks, measure success rate | P0 | 2h | V-04 |
| `V-07` | **Create Golden Dataset (20 examples) & Test Runner** | **P0** | **4h** | **V-06** |
| `V-08` | Document results: accuracy, latency, cost | P0 | 1h | V-07 |

**Output:** Decision to proceed or investigate issues.

---

### Sprint 7: Codebase Context (Week 9-10)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `C-01` | Implement GitHub API repo tree fetching | P0 | 4h | B-04 |
| `C-02` | **Setup pgvector in Neon DB** | **P0** | **1h** | **B-02** |
| `C-03` | **Implement CodebaseIndexer service** | **P0** | **8h** | **C-01, C-02** |
| `C-04` | **Implement Semantic Search (RAG) service** | **P0** | **6h** | **C-03** |
| `C-05` | Create relevant file selector (RAG + LLM) | P1 | 6h | C-04 |
| `C-06` | Integrate context into agent prompts | P0 | 3h | C-05, A-02 |

---

**Document Version:** 2.2
**Created:** December 26, 2025
**Status:** Ready for Implementation
