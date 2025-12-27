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

## Implementation Phases

### Phase 0: Foundation (Week 1)

| # | Task | Est. | Output |
|---|------|------|--------|
| 0.1 | Create Expo project with TypeScript | 2h | Working app shell |
| 0.2 | Create backend project with Fastify | 2h | API shell |
| 0.3 | **Establish Evaluation Pipeline (Golden Dataset)** | **8h** | **20 test cases + runner** |
| 0.4 | Set up Claude Agent SDK integration | 4h | Agent execution working |

### Phase 1: Authentication (Week 2)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 1.1 | Implement GitHub OAuth PKCE flow | 4h | expo-auth-session |
| 1.2 | Create AuthService class | 2h | - |
| 1.3 | Secure token storage | 2h | expo-secure-store |
| 1.4 | Build login/welcome screen | 4h | AuthService |
| 1.5 | Token refresh logic | 2h | AuthService |
| 1.6 | Create authStore (Zustand) | 2h | - |
| 1.7 | Navigation guards (protected routes) | 2h | authStore |

### Phase 2: Voice Interface (Weeks 3-4)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 2.1 | Audio recording with expo-av | 4h | - |
| 2.2 | **iOS audio compression (M4A) - Critical Fix** | **8h** | **Native module** |
| 2.3 | Create WhisperSTTProvider | 6h | Audio recording |
| 2.4 | Create TTSService (expo-speech) | 3h | - |
| 2.5 | Build VoiceButton component | 4h | - |
| 2.6 | Recording waveform animation | 4h | - |
| 2.7 | Voice state indicator (idle/listening/processing/speaking) | 3h | - |
| 2.8 | Transcript display component | 2h | - |
| 2.9 | Create voiceStore (Zustand) | 3h | - |

**WhisperSTTProvider Implementation:**
```typescript
// src/services/speech/WhisperSTTProvider.ts
export class WhisperSTTProvider implements STTProvider {
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });
    return response.json();
  }
}
```

### Phase 3: Agent Management (Weeks 5-6)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 3.1 | Create CommandParser service (Claude Haiku) | 6h | - |
| 3.2 | Define command intents (create, status, pause, etc.) | 2h | - |
| 3.3 | Create AgentApiService | 6h | TanStack Query |
| 3.4 | Agent CRUD operations | 4h | AgentApiService |
| 3.5 | Create agentStore (Zustand) | 3h | - |
| 3.6 | Build AgentListScreen | 4h | agentStore |
| 3.7 | Build AgentDetailScreen | 6h | - |
| 3.8 | Build CreateAgentFlow (3-step wizard) | 8h | All services |
| 3.9 | Agent logs view | 4h | - |

### Phase 4: Backend & Agent Execution (Weeks 5-7)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 4.1 | Set up Fastify API routes | 4h | - |
| 4.2 | Create AgentExecutor with Claude Agent SDK | 8h | SDK setup |
| 4.3 | Implement PreToolUse hooks (security) | 4h | AgentExecutor |
| 4.4 | Implement PostToolUse hooks (progress streaming) | 3h | AgentExecutor |
| 4.5 | **Integration with Fly.io Machines API** | **8h** | **Fly.io account** |
| 4.6 | Repository cloning & management (Ephemeral) | 4h | - |
| 4.7 | Database schema & migrations | 4h | Neon PostgreSQL |
| 4.8 | GitHub webhooks for PR updates | 4h | - |

**AgentExecutor with Claude Agent SDK:**
```typescript
// backend/src/services/agentExecutor.ts
import { query } from '@anthropic-ai/claude-code';

export class AgentExecutor {
  async execute(task: AgentTask): Promise<AsyncGenerator<AgentEvent>> {
    const response = await query({
      prompt: this.buildPrompt(task),
      cwd: task.repoLocalPath,
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.ANTHROPIC_API_KEY,
      hooks: {
        PreToolUse: [{
          matcher: 'Edit|Write|Bash',
          callback: async (input) => {
            await this.logAction(task.id, input);
            return {};
          }
        }],
        PostToolUse: [{
          matcher: '*',
          callback: async (input) => {
            this.emitProgress(task.id, input);
            return {};
          }
        }]
      }
    });

    for await (const event of response) {
      yield this.transformEvent(event);
    }
  }
}
```

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

### Phase 6: Real-time & Notifications (Week 8-9)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 6.1 | Background polling (5s interval) | 4h | AgentApiService |
| 6.2 | Configure expo-notifications | 4h | - |
| 6.3 | Push token registration | 3h | Backend API |
| 6.4 | Agent completion notifications | 2h | - |
| 6.5 | Agent failure notifications | 2h | - |
| 6.6 | In-app notification preferences | 2h | settingsStore |

**PushService Implementation:**
```typescript
// src/services/notifications/PushService.ts
import { Expo } from 'expo-server-sdk';
const expo = new Expo();

export class PushService {
  async notifyAgentComplete(agentId: string) {
    const agent = await db.query.agents.findFirst({ where: eq(agents.id, agentId), with: { user: true } });
    if (!agent?.user.expoPushToken) return;

    await expo.sendPushNotificationsAsync([{
      to: agent.user.expoPushToken,
      title: '✅ Agent Complete',
      body: `${agent.repoName}: ${agent.taskDescription.slice(0, 50)}...`,
      data: { agentId, type: 'agent_complete' },
    }]);
  }
}
```

### Phase 7: Polish & Testing (Weeks 10-11)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 7.1 | Global error boundary | 3h | - |
| 7.2 | API error handling | 4h | - |
| 7.3 | Loading states & skeletons | 4h | - |
| 7.4 | Empty states | 3h | - |
| 7.5 | Unit tests for services | 8h | Jest |
| 7.6 | Integration tests | 8h | RNTL |

### Phase 8: Launch Prep (Week 12)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 8.1 | Implement usage tracking (agents, voice minutes) | 4h | Backend |
| 8.2 | Implement usage limits enforcement | 4h | - |
| 8.3 | Sentry error tracking | 3h | - |
| 8.4 | App icons & splash screen | 4h | - |
| 8.5 | App Store metadata | 4h | - |
| 8.6 | EAS build configuration | 4h | - |

---

## Phase 9: Future Roadmap (Scale Phase)

> **Note:** These tasks are deliberately deferred to ensure MVP delivery. They are the "Scale" phase.

| Task ID | Task | Complexity | Value |
|---------|------|------------|-------|
| `F-01` | **VPS-per-User Infrastructure** (Hetzner) | High | Zero cold start, persistent workspace |
| `F-02` | **Deepgram Nova-2 Integration** (Streaming) | High | <300ms voice latency |
| `F-03` | **Multi-File "Composer" Editing** | Very High | Feature parity with Cursor |
| `F-04` | **Self-Hosted LLM Option** (Ollama) | High | Privacy/Enterprise requirement |
| `F-05` | **Web Search Tool** (@Web) | Medium | Better context for agents |

---

## Task Breakdown for AI Agents (Sprint View)

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

**Document Version:** 2.2 (Restored & Enhanced)
**Created:** December 26, 2025
**Status:** Ready for Implementation
