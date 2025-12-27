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

### Test Tasks for Validation

```
1. "Add a console.log to the main function in index.ts"
2. "Create a new file called utils.ts with a function that adds two numbers"
3. "Fix the typo in the README"
4. "Add error handling to the fetchData function"
5. "Write a unit test for the calculateTotal function"
```

### Decision Gate

✅ **PROCEED** if all pass:
- Voice accuracy >90%
- Agent completes 4/5 test tasks correctly
- End-to-end latency <30 seconds
- Cost <$0.50 per agent

❌ **STOP** if any fail - investigate root cause before mobile development.

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
npm install drizzle-orm postgres
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

### Environment Variables

```bash
# cadence-backend/.env
DATABASE_URL=postgresql://...@neon.tech/cadence
REDIS_URL=redis://...@upstash.com:6379

# AI Provider Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_KEY=...

# Auth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=your-32-char-secret

# Expo Push
EXPO_ACCESS_TOKEN=...
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
| **STT** | OpenAI Whisper API | 95-98% voice accuracy |
| **TTS** | expo-speech | On-device, <50ms latency |
| **Database** | PostgreSQL 16 (Neon) | Serverless, auto-scale |
| **Cache** | Redis (Upstash) | Session, rate limiting, queues |
| **Real-time** | Server-Sent Events + Push | Live status updates |
| **Auth** | GitHub OAuth + JWT | Secure, stateless auth |
| **Execution** | Fly.io Machines | Isolated container execution |

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
│   │   │   ├── CodebaseAnalyzer.ts # Repo analysis
│   │   │   ├── ContextBuilder.ts   # Prompt context
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

### Multi-Model Provider Abstraction

This is **essential** for future flexibility - today Claude, tomorrow OpenAI/Gemini/local.

```typescript
// src/services/ai/types.ts
export interface AIProvider {
  id: string;
  name: string;
  models: ModelConfig[];

  // Core capabilities
  chat(messages: Message[], options: ChatOptions): AsyncGenerator<ChatEvent>;
  complete(prompt: string, options: CompleteOptions): Promise<string>;

  // Agent capabilities (optional - not all providers support)
  supportsAgentMode: boolean;
  executeAgent?(task: AgentTask): AsyncGenerator<AgentEvent>;
}

export interface ModelConfig {
  id: string;
  name: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  capabilities: ('chat' | 'code' | 'vision' | 'agent')[];
}

export interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: ToolDefinition[];
}

// src/services/ai/providers/claude.ts
import { query, type ConversationTurn } from '@anthropic-ai/claude-code';

export class ClaudeProvider implements AIProvider {
  id = 'claude';
  name = 'Anthropic Claude';
  supportsAgentMode = true;

  models: ModelConfig[] = [
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
      contextWindow: 200000,
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
      capabilities: ['chat', 'code', 'vision', 'agent'],
    },
    {
      id: 'claude-opus-4-20250514',
      name: 'Claude Opus 4',
      contextWindow: 200000,
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
      capabilities: ['chat', 'code', 'vision', 'agent'],
    },
  ];

  async *executeAgent(task: AgentTask): AsyncGenerator<AgentEvent> {
    const response = await query({
      prompt: task.prompt,
      cwd: task.workingDir,
      model: task.model,
      apiKey: process.env.ANTHROPIC_API_KEY,
      options: {
        maxTurns: task.maxTurns ?? 50,
      },
      hooks: {
        PreToolUse: [{
          matcher: '*',
          callback: async ({ tool_name, tool_input }) => {
            yield { type: 'tool_start', tool: tool_name, input: tool_input };
            return {}; // Allow tool execution
          }
        }],
        PostToolUse: [{
          matcher: '*',
          callback: async ({ tool_name, tool_result }) => {
            yield { type: 'tool_complete', tool: tool_name, result: tool_result };
            return {};
          }
        }],
      }
    });

    for await (const turn of response) {
      yield this.transformTurn(turn);
    }
  }
}

// src/services/ai/providers/openai.ts
import OpenAI from 'openai';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  supportsAgentMode = false; // Uses Responses API, different pattern

  private client: OpenAI;

  models: ModelConfig[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      contextWindow: 128000,
      inputCostPer1k: 0.005,
      outputCostPer1k: 0.015,
      capabilities: ['chat', 'code', 'vision'],
    },
    {
      id: 'o1',
      name: 'o1',
      contextWindow: 200000,
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.060,
      capabilities: ['chat', 'code'],
    },
  ];

  async *chat(messages: Message[], options: ChatOptions): AsyncGenerator<ChatEvent> {
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: this.transformMessages(messages),
      stream: true,
    });

    for await (const chunk of stream) {
      yield { type: 'content', text: chunk.choices[0]?.delta?.content ?? '' };
    }
  }
}

// src/services/ai/ModelRouter.ts
export class ModelRouter {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    // Register providers based on available API keys
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('claude', new ClaudeProvider());
    }
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider());
    }
    if (process.env.GOOGLE_AI_KEY) {
      this.providers.set('gemini', new GeminiProvider());
    }
  }

  getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Provider ${providerId} not available`);
    return provider;
  }

  getAvailableModels(): ModelConfig[] {
    return Array.from(this.providers.values())
      .flatMap(p => p.models.map(m => ({ ...m, provider: p.id })));
  }

  async executeAgentTask(task: AgentTask): AsyncGenerator<AgentEvent> {
    const provider = this.getProviderForModel(task.model);

    if (!provider.supportsAgentMode) {
      // Fall back to chat-based agent loop
      yield* this.chatBasedAgentLoop(provider, task);
    } else {
      yield* provider.executeAgent!(task);
    }
  }
}
```

### Database Schema (Drizzle ORM)

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const agentStatusEnum = pgEnum('agent_status', [
  'pending', 'queued', 'running', 'paused', 'completed', 'failed', 'cancelled'
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free', 'pro', 'enterprise'
]);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: text('github_id').unique().notNull(),
  githubUsername: text('github_username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),

  // Subscription
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),

  // Preferences
  preferences: jsonb('preferences').$type<UserPreferences>().default({}),
  defaultModel: text('default_model').default('claude-sonnet-4-20250514'),

  // Usage tracking
  agentsUsedThisMonth: integer('agents_used_this_month').default(0),
  voiceMinutesUsedThisMonth: integer('voice_minutes_this_month').default(0),

  // Push notifications
  expoPushToken: text('expo_push_token'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Agents
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  // Repository info
  repoUrl: text('repo_url').notNull(),
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  branch: text('branch').notNull(),
  baseBranch: text('base_branch').default('main'),

  // Task
  taskDescription: text('task_description').notNull(),
  systemPrompt: text('system_prompt'), // Custom user instructions

  // Execution
  status: agentStatusEnum('status').default('pending'),
  progress: integer('progress').default(0),
  model: text('model').notNull(),

  // Results
  filesChanged: integer('files_changed').default(0),
  linesAdded: integer('lines_added').default(0),
  linesRemoved: integer('lines_removed').default(0),
  prUrl: text('pr_url'),
  prNumber: integer('pr_number'),

  // Cost tracking
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  estimatedCost: integer('estimated_cost_cents').default(0),

  // Error handling
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),

  // Execution environment
  flyMachineId: text('fly_machine_id'),
  workingDir: text('working_dir'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});

// Agent logs (append-only)
export const agentLogs = pgTable('agent_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id).notNull(),

  type: text('type').notNull(), // 'tool_start', 'tool_complete', 'message', 'error'
  toolName: text('tool_name'),
  content: jsonb('content'),

  timestamp: timestamp('timestamp').defaultNow(),
});

// API keys (for user's own keys)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  provider: text('provider').notNull(), // 'anthropic', 'openai', 'google'
  encryptedKey: text('encrypted_key').notNull(),
  keyHint: text('key_hint'), // Last 4 chars for display

  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Context cache (for codebase analysis)
export const contextCache = pgTable('context_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  repoUrl: text('repo_url').notNull(),
  commitSha: text('commit_sha').notNull(),

  context: jsonb('context').$type<CodebaseContext>(),

  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Types
interface UserPreferences {
  voiceSpeed?: number;
  autoSpeak?: boolean;
  darkMode?: boolean;
  notificationsEnabled?: boolean;
}

interface CodebaseContext {
  framework: string;
  language: string;
  relevantFiles: { path: string; reason: string }[];
  dependencies: { name: string; version: string }[];
}
```

### Job Queue (BullMQ)

```typescript
// src/services/agent/AgentQueue.ts
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const agentQueue = new Queue('agents', { connection: redis });

export interface AgentJobData {
  agentId: string;
  userId: string;
  repoUrl: string;
  branch: string;
  taskDescription: string;
  model: string;
  systemPrompt?: string;
  context?: CodebaseContext;
}

// Queue an agent job
export async function queueAgentJob(data: AgentJobData): Promise<string> {
  const job = await agentQueue.add('execute', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  });
  return job.id!;
}

// src/workers/agentWorker.ts
import { Worker, Job } from 'bullmq';

const worker = new Worker('agents', async (job: Job<AgentJobData>) => {
  const { agentId, repoUrl, branch, taskDescription, model, context } = job.data;

  const executor = new AgentExecutor();
  const sandbox = new AgentSandbox();

  try {
    // Update status
    await db.update(agents).set({ status: 'running', startedAt: new Date() })
      .where(eq(agents.id, agentId));

    // Clone repo into sandbox
    const workingDir = await sandbox.prepare(repoUrl, branch);

    // Execute agent
    for await (const event of executor.execute({
      agentId,
      prompt: taskDescription,
      workingDir,
      model,
      context,
    })) {
      // Log event
      await db.insert(agentLogs).values({
        agentId,
        type: event.type,
        toolName: event.tool,
        content: event,
      });

      // Update progress
      if (event.type === 'progress') {
        await db.update(agents).set({ progress: event.percent })
          .where(eq(agents.id, agentId));
      }

      // Emit SSE event
      sseManager.emit(agentId, event);
    }

    // Create PR
    const prUrl = await sandbox.createPullRequest(taskDescription);

    // Mark complete
    await db.update(agents).set({
      status: 'completed',
      completedAt: new Date(),
      prUrl,
    }).where(eq(agents.id, agentId));

    // Send push notification
    await pushService.notifyAgentComplete(agentId);

  } catch (error) {
    await db.update(agents).set({
      status: 'failed',
      errorMessage: error.message,
    }).where(eq(agents.id, agentId));

    await pushService.notifyAgentFailed(agentId, error.message);
    throw error;
  } finally {
    await sandbox.cleanup();
  }
}, { connection: redis, concurrency: 5 });
```

### Real-time Updates (SSE + Push)

```typescript
// src/services/notifications/SSEManager.ts
import { FastifyInstance } from 'fastify';

class SSEManager {
  private connections: Map<string, Set<FastifyReply>> = new Map();

  register(fastify: FastifyInstance) {
    fastify.get('/api/agents/:id/events', {
      preHandler: [authMiddleware],
    }, async (request, reply) => {
      const { id } = request.params as { id: string };

      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Add to connections
      if (!this.connections.has(id)) {
        this.connections.set(id, new Set());
      }
      this.connections.get(id)!.add(reply);

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        reply.raw.write(': heartbeat\n\n');
      }, 30000);

      // Cleanup on disconnect
      request.raw.on('close', () => {
        clearInterval(heartbeat);
        this.connections.get(id)?.delete(reply);
      });
    });
  }

  emit(agentId: string, event: AgentEvent) {
    const connections = this.connections.get(agentId);
    if (!connections) return;

    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const reply of connections) {
      reply.raw.write(data);
    }
  }
}

// src/services/notifications/PushService.ts
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export class PushService {
  async notifyAgentComplete(agentId: string) {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
      with: { user: true },
    });

    if (!agent?.user.expoPushToken) return;

    await expo.sendPushNotificationsAsync([{
      to: agent.user.expoPushToken,
      title: '✅ Agent Complete',
      body: `${agent.repoName}: ${agent.taskDescription.slice(0, 50)}...`,
      data: { agentId, type: 'agent_complete' },
    }]);
  }

  async notifyAgentFailed(agentId: string, error: string) {
    // Similar implementation
  }
}
```

### Complete API Routes

```typescript
// src/routes/agents.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createAgentSchema = z.object({
  repoUrl: z.string().url(),
  branch: z.string().optional().default('main'),
  taskDescription: z.string().min(10).max(5000),
  model: z.string().optional(),
  systemPrompt: z.string().optional(), // Custom instructions
});

export async function agentRoutes(fastify: FastifyInstance) {
  // Create agent
  fastify.post('/api/agents', {
    preHandler: [authMiddleware, usageLimitMiddleware],
    schema: { body: createAgentSchema },
  }, async (request, reply) => {
    const userId = request.user.id;
    const { repoUrl, branch, taskDescription, model, systemPrompt } = request.body;

    // Get user's preferred model or use provided
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const selectedModel = model || user?.defaultModel || 'claude-sonnet-4-20250514';

    // Analyze codebase for context
    const context = await codebaseAnalyzer.analyze(repoUrl, branch, taskDescription);

    // Create agent record
    const [agent] = await db.insert(agents).values({
      userId,
      repoUrl,
      repoOwner: parseRepoOwner(repoUrl),
      repoName: parseRepoName(repoUrl),
      branch,
      taskDescription,
      systemPrompt,
      model: selectedModel,
      status: 'queued',
    }).returning();

    // Queue for execution
    await queueAgentJob({
      agentId: agent.id,
      userId,
      repoUrl,
      branch,
      taskDescription,
      model: selectedModel,
      systemPrompt,
      context,
    });

    // Increment usage
    await db.update(users)
      .set({ agentsUsedThisMonth: sql`agents_used_this_month + 1` })
      .where(eq(users.id, userId));

    return reply.status(201).send(agent);
  });

  // List agents
  fastify.get('/api/agents', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user.id;
    const { status, limit = 20, offset = 0 } = request.query as any;

    const query = db.select().from(agents)
      .where(eq(agents.userId, userId))
      .orderBy(desc(agents.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query.where(eq(agents.status, status));
    }

    return query;
  });

  // Get agent detail
  fastify.get('/api/agents/:id', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;

    const agent = await db.query.agents.findFirst({
      where: and(eq(agents.id, id), eq(agents.userId, userId)),
      with: { logs: { limit: 100, orderBy: [desc(agentLogs.timestamp)] } },
    });

    if (!agent) return reply.status(404).send({ error: 'Agent not found' });
    return agent;
  });

  // Pause agent
  fastify.post('/api/agents/:id/pause', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Pause the BullMQ job
    const job = await agentQueue.getJob(id);
    if (job && (await job.isActive())) {
      // Signal the worker to pause
      await db.update(agents).set({ status: 'paused' }).where(eq(agents.id, id));
    }

    return { success: true };
  });

  // Resume agent
  fastify.post('/api/agents/:id/resume', /* ... */);

  // Cancel agent
  fastify.delete('/api/agents/:id', /* ... */);

  // Get logs (with SSE option)
  fastify.get('/api/agents/:id/logs', /* ... */);
}

// src/routes/models.ts
export async function modelRoutes(fastify: FastifyInstance) {
  // List available models
  fastify.get('/api/models', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const userId = request.user.id;

    // Get system models
    const systemModels = modelRouter.getAvailableModels();

    // Get user's custom API keys
    const userKeys = await db.query.apiKeys.findMany({
      where: and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)),
    });

    // Add models from user's keys
    const userModels = userKeys.flatMap(key => {
      const provider = modelRouter.getProvider(key.provider);
      return provider.models.map(m => ({ ...m, source: 'user_key' }));
    });

    return {
      models: [...systemModels, ...userModels],
      default: request.user.defaultModel,
    };
  });

  // Update default model
  fastify.patch('/api/models/default', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { modelId } = request.body as { modelId: string };

    await db.update(users)
      .set({ defaultModel: modelId })
      .where(eq(users.id, request.user.id));

    return { success: true };
  });

  // Add custom API key
  fastify.post('/api/models/keys', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { provider, apiKey } = request.body as { provider: string; apiKey: string };

    // Validate key works
    const isValid = await modelRouter.validateApiKey(provider, apiKey);
    if (!isValid) {
      return reply.status(400).send({ error: 'Invalid API key' });
    }

    // Encrypt and store
    const encrypted = await encrypt(apiKey);
    await db.insert(apiKeys).values({
      userId: request.user.id,
      provider,
      encryptedKey: encrypted,
      keyHint: apiKey.slice(-4),
    });

    return { success: true };
  });
}

// src/routes/users.ts
export async function userRoutes(fastify: FastifyInstance) {
  // Get current user
  fastify.get('/api/users/me', /* ... */);

  // Update preferences
  fastify.patch('/api/users/me/preferences', /* ... */);

  // Get usage stats
  fastify.get('/api/users/me/usage', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, request.user.id),
    });

    const limits = getUsageLimits(user.subscriptionTier);

    return {
      tier: user.subscriptionTier,
      agents: {
        used: user.agentsUsedThisMonth,
        limit: limits.agentsPerMonth,
      },
      voiceMinutes: {
        used: user.voiceMinutesUsedThisMonth,
        limit: limits.voiceMinutesPerMonth,
      },
      resetsAt: getNextResetDate(),
    };
  });

  // Register push token
  fastify.post('/api/users/me/push-token', /* ... */);
}
```

### Usage Limits

```typescript
// src/services/usage/UsageTracker.ts
const TIER_LIMITS = {
  free: { agentsPerMonth: 5, voiceMinutesPerMonth: 30 },
  pro: { agentsPerMonth: 50, voiceMinutesPerMonth: 300 },
  enterprise: { agentsPerMonth: Infinity, voiceMinutesPerMonth: Infinity },
};

export async function checkUsageLimit(userId: string, resource: 'agents' | 'voice'): Promise<boolean> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const limits = TIER_LIMITS[user.subscriptionTier];

  if (resource === 'agents') {
    return user.agentsUsedThisMonth < limits.agentsPerMonth;
  }
  if (resource === 'voice') {
    return user.voiceMinutesUsedThisMonth < limits.voiceMinutesPerMonth;
  }
  return false;
}

// Middleware
export const usageLimitMiddleware = async (request, reply) => {
  const canProceed = await checkUsageLimit(request.user.id, 'agents');
  if (!canProceed) {
    return reply.status(429).send({
      error: 'Usage limit reached',
      upgrade: '/pricing',
    });
  }
};
```

### STT Proxy Endpoint (Whisper)

For users without their own OpenAI key, the backend proxies Whisper API calls:

```typescript
// src/routes/stt.ts
import OpenAI from 'openai';
import { FastifyInstance } from 'fastify';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function sttRoutes(fastify: FastifyInstance) {
  // Transcribe audio (for users without their own key)
  fastify.post('/api/stt/transcribe', {
    preHandler: [authMiddleware, usageLimitMiddleware],
  }, async (request, reply) => {
    const data = await request.file(); // @fastify/multipart
    if (!data) return reply.status(400).send({ error: 'No audio file' });

    const buffer = await data.toBuffer();
    const file = new File([buffer], 'audio.m4a', { type: 'audio/m4a' });

    const result = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    });

    // Track voice usage (assume ~1 min per request for billing)
    await db.update(users)
      .set({ voiceMinutesUsedThisMonth: sql`voice_minutes_this_month + 1` })
      .where(eq(users.id, request.user.id));

    return { text: result.text };
  });
}
```

### GitHub OAuth Implementation

Complete PKCE flow for mobile authentication:

```typescript
// src/routes/auth.ts
import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  // Exchange code for tokens (mobile callback)
  fastify.post('/api/auth/github', async (request, reply) => {
    const { code, codeVerifier, redirectUri } = request.body as {
      code: string;
      codeVerifier: string;
      redirectUri: string;
    };

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) {
      return reply.status(401).send({ error: tokens.error_description });
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const githubUser = await userResponse.json();

    // Upsert user in database
    const [user] = await db.insert(users)
      .values({
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
      })
      .onConflictDoUpdate({
        target: users.githubId,
        set: {
          githubUsername: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Generate JWT
    const jwt = await fastify.jwt.sign({
      sub: user.id,
      githubId: user.githubId,
      githubUsername: user.githubUsername,
    }, { expiresIn: '7d' });

    return {
      token: jwt,
      user: {
        id: user.id,
        githubUsername: user.githubUsername,
        avatarUrl: user.avatarUrl,
        subscriptionTier: user.subscriptionTier,
      },
    };
  });

  // Refresh token
  fastify.post('/api/auth/refresh', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const jwt = await fastify.jwt.sign({
      sub: request.user.id,
      githubId: request.user.githubId,
      githubUsername: request.user.githubUsername,
    }, { expiresIn: '7d' });

    return { token: jwt };
  });
}
```

### Agent Sandbox (Fly.io Machines)

Isolated execution environment for each agent:

```typescript
// src/services/agent/AgentSandbox.ts
import { execSync } from 'child_process';

interface FlyMachine {
  id: string;
  state: string;
  private_ip: string;
}

export class AgentSandbox {
  private appName = 'cadence-agent-runner';
  private machineId: string | null = null;

  async prepare(repoUrl: string, branch: string): Promise<string> {
    // Create a new Fly machine for this agent
    const machine = await this.createMachine();
    this.machineId = machine.id;

    // Clone repo inside the machine
    const workingDir = `/home/cadence/repos/${Date.now()}`;
    await this.execInMachine(`git clone ${repoUrl} ${workingDir}`);
    await this.execInMachine(`cd ${workingDir} && git checkout ${branch}`);

    // Install dependencies if package.json exists
    await this.execInMachine(`
      if [ -f ${workingDir}/package.json ]; then
        cd ${workingDir} && npm install
      fi
    `);

    return workingDir;
  }

  private async createMachine(): Promise<FlyMachine> {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${this.appName}/machines`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            image: 'cadence-agent:latest',
            guest: { cpu_kind: 'shared', cpus: 2, memory_mb: 4096 },
            auto_destroy: true,
            restart: { policy: 'no' },
            env: {
              ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
            },
          },
        }),
      }
    );

    return response.json();
  }

  private async execInMachine(command: string): Promise<string> {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${this.appName}/machines/${this.machineId}/exec`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmd: ['sh', '-c', command] }),
      }
    );

    const result = await response.json();
    return result.stdout;
  }

  async createPullRequest(description: string): Promise<string> {
    // Create branch, commit, push, and open PR via gh CLI
    const branchName = `cadence/${Date.now()}`;
    await this.execInMachine(`
      git checkout -b ${branchName}
      git add -A
      git commit -m "feat: ${description.slice(0, 50)}"
      git push origin ${branchName}
      gh pr create --title "${description.slice(0, 50)}" --body "Created by Cadence AI Agent"
    `);

    // Get PR URL
    const prUrl = await this.execInMachine(`gh pr view --json url -q .url`);
    return prUrl.trim();
  }

  async cleanup(): Promise<void> {
    if (!this.machineId) return;

    await fetch(
      `https://api.machines.dev/v1/apps/${this.appName}/machines/${this.machineId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${process.env.FLY_API_TOKEN}` },
      }
    );
  }
}
```

### Monthly Usage Reset (Cron)

Reset usage counters on the 1st of each month:

```typescript
// src/workers/usageResetWorker.ts
import { CronJob } from 'cron';
import { db } from '../db';
import { users } from '../db/schema';

// Reset all users' monthly usage on the 1st at midnight UTC
export const usageResetJob = new CronJob('0 0 1 * *', async () => {
  console.log('[Cron] Resetting monthly usage counters...');

  await db.update(users).set({
    agentsUsedThisMonth: 0,
    voiceMinutesUsedThisMonth: 0,
  });

  console.log('[Cron] Monthly usage reset complete');
});

// Start the cron job
usageResetJob.start();
```

### Health Check & Deployment

```typescript
// src/routes/health.ts
export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.get('/ready', async (request, reply) => {
    try {
      // Check database
      await db.execute(sql`SELECT 1`);
      // Check Redis
      await redis.ping();
      return { status: 'ready' };
    } catch (error) {
      return reply.status(503).send({ status: 'not ready', error: error.message });
    }
  });
}
```

```dockerfile
# Dockerfile (cadence-backend)
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/index.js"]
```

```toml
# fly.toml (cadence-backend)
app = "cadence-backend"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### API Key Encryption

Encrypt user API keys before storing:

```typescript
// src/services/auth/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

## Feature Parity Requirements

### Must Match Cursor/Claude Code:
- [ ] Create AI coding agents from natural language
- [ ] Agent execution on repositories (clone, edit, commit, PR)
- [ ] Real-time progress tracking
- [ ] Pause/resume/cancel agents
- [ ] Agent logs and history
- [ ] Multi-model support (Claude Sonnet, Opus)
- [ ] Codebase context understanding

### Our Advantages (Voice + Mobile):
- [ ] Voice input (3.75x faster than typing)
- [ ] Voice output (spoken status updates)
- [ ] Push notifications on agent completion
- [ ] Mobile-native experience (iOS + Android)
- [ ] Work from anywhere (not desktop-only)

---

## Implementation Phases

### Phase 0: Foundation (Week 1)

| # | Task | Est. | Output |
|---|------|------|--------|
| 0.1 | Create Expo project with TypeScript | 2h | Working app shell |
| 0.2 | Configure ESLint + Prettier + Husky | 2h | Code quality setup |
| 0.3 | Set up path aliases (@components, @services, etc.) | 1h | Clean imports |
| 0.4 | Create folder structure (see below) | 1h | Project scaffolding |
| 0.5 | Create backend project with Fastify | 2h | API shell |
| 0.6 | Set up Claude Agent SDK integration | 4h | Agent execution working |

**Project Structure:**
```
cadence/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Voice (Home)
│   │   │   ├── agents.tsx      # Agents list
│   │   │   └── settings.tsx    # Settings
│   │   ├── agent/[id].tsx      # Agent detail
│   │   └── _layout.tsx         # Root layout
│   ├── components/
│   │   ├── voice/              # VoiceButton, Waveform, etc.
│   │   ├── agents/             # AgentCard, AgentList, etc.
│   │   └── common/             # Button, Card, etc.
│   ├── services/
│   │   ├── speech/             # STT/TTS providers
│   │   ├── api/                # API client
│   │   └── auth/               # GitHub OAuth
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript types
│   └── constants/              # App constants
└── app.json
```

---

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

**Success Criteria:**
- [ ] User can sign in with GitHub
- [ ] Tokens stored securely
- [ ] Session persists across restarts

---

### Phase 2: Voice Interface (Weeks 3-4)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 2.1 | Audio recording with expo-av | 4h | - |
| 2.2 | iOS audio compression (M4A) | 8h | Native module |
| 2.3 | Create WhisperSTTProvider | 6h | Audio recording |
| 2.4 | Create TTSService (expo-speech) | 3h | - |
| 2.5 | Build VoiceButton component | 4h | - |
| 2.6 | Recording waveform animation | 4h | - |
| 2.7 | Voice state indicator (idle/listening/processing/speaking) | 3h | - |
| 2.8 | Transcript display component | 2h | - |
| 2.9 | Create voiceStore (Zustand) | 3h | - |
| 2.10 | Error handling & retry logic | 3h | All voice services |

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

**Success Criteria:**
- [ ] Voice recording works on iOS and Android
- [ ] Whisper transcription >95% accuracy
- [ ] End-to-end latency <2 seconds
- [ ] TTS speaks responses clearly

---

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
| 3.10 | Real-time status polling (5s interval) | 4h | AgentApiService |

**Command Intent Types:**
```typescript
type CommandIntent =
  | 'agent_create'      // "Start an agent on wallet-frontend..."
  | 'agent_status'      // "What's the status of my agents?"
  | 'agent_pause'       // "Pause the agent on api-service"
  | 'agent_resume'      // "Resume the agent"
  | 'agent_stop'        // "Stop all running agents"
  | 'repo_list'         // "Show my repositories"
  | 'help'              // "What can you do?"
  | 'unknown';
```

**Success Criteria:**
- [ ] Voice commands create agents
- [ ] Agents list shows all user agents
- [ ] Agent detail shows progress and logs
- [ ] Pause/resume/stop works

---

### Phase 4: Backend & Agent Execution (Weeks 5-7)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 4.1 | Set up Fastify API routes | 4h | - |
| 4.2 | Create AgentExecutor with Claude Agent SDK | 8h | SDK setup |
| 4.3 | Implement PreToolUse hooks (security) | 4h | AgentExecutor |
| 4.4 | Implement PostToolUse hooks (progress streaming) | 3h | AgentExecutor |
| 4.5 | Create CodebaseAnalyzer service | 8h | GitHub API |
| 4.6 | Repository cloning & management | 4h | - |
| 4.7 | Fly.io Machines integration | 6h | Fly.io account |
| 4.8 | Database schema & migrations | 4h | Neon PostgreSQL |
| 4.9 | GitHub webhooks for PR updates | 4h | - |

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

**Success Criteria:**
- [ ] Agents execute on Fly.io containers
- [ ] Claude Agent SDK edits files, runs commands
- [ ] Progress streams back to mobile app
- [ ] PRs created automatically

---

### Phase 5: Codebase Context (Week 7-8)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 5.1 | Fetch repo tree via GitHub API | 4h | GitHub auth |
| 5.2 | Framework detection (React, Next, Express) | 4h | - |
| 5.3 | Dependency analysis | 3h | - |
| 5.4 | Relevant file selection (Claude analysis) | 6h | Claude API |
| 5.5 | Context caching (24h TTL) | 2h | - |
| 5.6 | Integrate context into agent prompts | 3h | AgentExecutor |

**CodebaseAnalyzer:**
```typescript
interface CodebaseContext {
  repoUrl: string;
  framework: 'react' | 'vue' | 'next' | 'express' | 'fastify' | 'unknown';
  language: 'typescript' | 'javascript' | 'python' | 'unknown';
  relevantFiles: { path: string; reason: string; priority: 'high' | 'medium' | 'low' }[];
  dependencies: { name: string; version: string }[];
}
```

**Success Criteria:**
- [ ] Agents understand project structure
- [ ] Relevant files selected for tasks
- [ ] Framework-aware code generation

---

### Phase 6: Real-time & Notifications (Week 8-9)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 6.1 | Background polling (5s interval) | 4h | AgentApiService |
| 6.2 | Configure expo-notifications | 4h | - |
| 6.3 | Push token registration | 3h | Backend API |
| 6.4 | Agent completion notifications | 2h | - |
| 6.5 | Agent failure notifications | 2h | - |
| 6.6 | In-app notification preferences | 2h | settingsStore |

**Success Criteria:**
- [ ] Status updates every 5 seconds
- [ ] Push notification when agent completes
- [ ] Notification when agent fails

---

### Phase 7: Polish & Testing (Weeks 10-11)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 7.1 | Global error boundary | 3h | - |
| 7.2 | API error handling | 4h | - |
| 7.3 | Loading states & skeletons | 4h | - |
| 7.4 | Empty states | 3h | - |
| 7.5 | Unit tests for services | 8h | Jest |
| 7.6 | Integration tests | 8h | RNTL |
| 7.7 | Dark mode support | 6h | - |
| 7.8 | Haptic feedback | 2h | - |

---

### Phase 8: Launch Prep (Week 12)

| # | Task | Est. | Dependencies |
|---|------|------|--------------|
| 8.1 | Usage tracking implementation | 4h | Backend |
| 8.2 | Usage limits enforcement | 4h | - |
| 8.3 | Sentry error tracking | 3h | - |
| 8.4 | App icons & splash screen | 4h | - |
| 8.5 | App Store metadata | 4h | - |
| 8.6 | EAS build configuration | 4h | - |
| 8.7 | TestFlight/Play Store testing | 4h | - |

---

## Data Models

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
  intent: 'agent_create' | 'agent_status' | 'agent_pause' | 'agent_resume' | 'agent_stop' | 'unknown';
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

---

## API Endpoints

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

## Decision Gates

| Gate | When | Criteria | Action if Failed |
|------|------|----------|------------------|
| **Alpha** | Week 4 | 10 users, NPS >50, Voice accuracy >90% | KILL |
| **Beta** | Week 8 | 100 users, WAU >30% | KILL |
| **Paid** | Week 16 | Conversion >10%, $1K MRR | KILL |

---

## Cost Targets

| Service | Target Cost |
|---------|------------|
| Whisper API | <$0.01/voice minute |
| Claude API | <$0.50/agent |
| Infrastructure | <$30/month (MVP) |
| **Total per user** | <$10/month |

---

## Getting Started

1. Read this document fully
2. Set up development environment (Week 1 tasks)
3. Follow phases in order
4. Mark tasks complete as you go
5. Test thoroughly at each phase boundary

**Start with:**
```bash
npx create-expo-app@latest cadence --template expo-template-blank-typescript
```

---

---

## Execution Environment Strategy

### MVP: Fly.io Machines (Simple, Pay-per-use)

For weeks 1-8, use Fly.io for simplicity:

| Factor | Fly.io Advantage |
|--------|------------------|
| **Cold start** | ~0s with `min_machines_running=1` |
| **Node.js** | Native support (unlike Modal.com's Python-first) |
| **Docker** | Full support |
| **Cost** | $0.02/hr (~$15-30/mo base) |

### Scale: VPS-per-User (Zero Cold Start)

When reaching 100+ Pro users, migrate to dedicated VPS:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HYBRID EXECUTION MODEL                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FREE TIER ($0/mo):                                                      │
│  • Serverless execution (Fly.io)                                         │
│  • 5 agents/month limit                                                  │
│  • Cold start: 2-5 seconds                                               │
│  • Cost to us: ~$0.50/agent                                              │
│                                                                          │
│  PRO TIER ($15/mo):                                                      │
│  • Dedicated VPS (Hetzner CX22: 2 vCPU, 4GB RAM)                        │
│  • Unlimited agents, zero cold start                                     │
│  • Repos cached, deps installed                                          │
│  • Cost to us: ~$4.85/mo → 68% margin                                   │
│                                                                          │
│  ENTERPRISE TIER ($75/mo):                                               │
│  • Larger VPS (Hetzner CX32: 4 vCPU, 8GB RAM)                           │
│  • Parallel agents (2-4 simultaneously)                                  │
│  • Priority support                                                      │
│  • Cost to us: ~$15/mo → 80% margin                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation Path

```
Week 1-8:   Fly.io Machines (serverless) - validate idea
            ↓
Week 9-12:  Build VPS provisioning (Hetzner API)
            ↓
Week 13-16: Migrate Pro users to VPS
            ↓
Post-MVP:   Hybrid model (Free=serverless, Pro=VPS)
```

---

## Task Breakdown for AI Agents

> **For future Claude agents to implement this project step-by-step**

### Sprint 0: Validation (3-5 days) - MUST DO FIRST

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `V-01` | Create `cadence-prototype` folder with Node.js + TypeScript | P0 | 1h | None |
| `V-02` | Implement Whisper transcription function | P0 | 2h | V-01 |
| `V-03` | Implement Claude Agent SDK wrapper | P0 | 2h | V-01 |
| `V-04` | Create end-to-end CLI tool (text → agent → changes) | P0 | 2h | V-02, V-03 |
| `V-05` | Record 5 test voice commands and transcribe | P0 | 1h | V-02 |
| `V-06` | Run agents on 5 test tasks, measure success rate | P0 | 2h | V-04 |
| `V-07` | Document results: accuracy, latency, cost | P0 | 1h | V-05, V-06 |

**Output:** Decision to proceed or investigate issues.

---

### Sprint 1: Backend Foundation (Week 1-2)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `B-01` | Initialize `cadence-backend` with Fastify + TypeScript | P0 | 2h | V-07 ✓ |
| `B-02` | Set up Drizzle ORM with PostgreSQL (Neon) schema | P0 | 3h | B-01 |
| `B-03` | Implement health check routes (`/health`, `/ready`) | P0 | 1h | B-01 |
| `B-04` | Implement GitHub OAuth routes (PKCE flow) | P0 | 4h | B-02 |
| `B-05` | Implement JWT auth middleware | P0 | 2h | B-04 |
| `B-06` | Set up Redis connection (Upstash) | P1 | 1h | B-01 |
| `B-07` | Implement BullMQ job queue setup | P1 | 2h | B-06 |
| `B-08` | Create Dockerfile and fly.toml for deployment | P1 | 2h | B-03 |
| `B-09` | Deploy to Fly.io (backend API) | P1 | 2h | B-08 |

**Output:** Running backend at `cadence-backend.fly.dev` with auth.

---

### Sprint 2: Mobile App Shell (Week 2-3)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `M-01` | Create Expo app with TypeScript template | P0 | 1h | None |
| `M-02` | Set up folder structure (screens, components, services) | P0 | 1h | M-01 |
| `M-03` | Configure React Navigation (tabs + stack) | P0 | 2h | M-02 |
| `M-04` | Create Zustand stores (auth, agents, voice) | P0 | 2h | M-02 |
| `M-05` | Implement GitHub OAuth flow (expo-auth-session) | P0 | 4h | M-03, B-04 |
| `M-06` | Create login screen with GitHub button | P0 | 2h | M-05 |
| `M-07` | Implement secure token storage (expo-secure-store) | P0 | 2h | M-05 |
| `M-08` | Create navigation guards (protected routes) | P1 | 2h | M-07 |

**Output:** App with working login, persisted sessions.

---

### Sprint 3: Voice Interface (Week 3-4)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `VO-01` | Implement audio recording (expo-av) | P0 | 4h | M-02 |
| `VO-02` | Implement iOS audio compression (M4A, native module if needed) | P0 | 8h | VO-01 |
| `VO-03` | Create WhisperSTTProvider (direct to OpenAI or via backend) | P0 | 4h | VO-01 |
| `VO-04` | Create VoiceButton component with states | P0 | 4h | VO-01 |
| `VO-05` | Create waveform animation during recording | P1 | 4h | VO-04 |
| `VO-06` | Implement TTS with expo-speech | P1 | 2h | M-02 |
| `VO-07` | Create transcript display component | P1 | 2h | VO-03 |
| `VO-08` | Implement voice state machine (idle→listening→processing→speaking) | P1 | 3h | VO-03, VO-06 |

**Output:** Working voice input that transcribes accurately.

---

### Sprint 4: Agent API & UI (Week 5-6)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `A-01` | Create agent CRUD routes (POST, GET, DELETE) | P0 | 4h | B-02 |
| `A-02` | Implement AgentExecutor with Claude Agent SDK | P0 | 6h | B-07 |
| `A-03` | Implement agentWorker (BullMQ processor) | P0 | 4h | A-02 |
| `A-04` | Create SSEManager for real-time streaming | P0 | 4h | A-03 |
| `A-05` | Create agent list screen (mobile) | P0 | 4h | M-03 |
| `A-06` | Create agent detail screen with logs | P0 | 6h | A-05 |
| `A-07` | Implement TanStack Query for agent data | P1 | 3h | A-05 |
| `A-08` | Add pause/resume/cancel functionality | P1 | 4h | A-01 |

**Output:** Can create agents via API, see status and logs.

---

### Sprint 5: Voice → Agent Integration (Week 6-7)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `I-01` | Create CommandParser (intent extraction via Claude Haiku) | P0 | 6h | VO-03 |
| `I-02` | Implement voice command router | P0 | 3h | I-01 |
| `I-03` | Create "New Agent" flow from voice | P0 | 4h | I-02, A-01 |
| `I-04` | Implement repo selection (list user's repos) | P0 | 4h | M-05 |
| `I-05` | Add spoken confirmation before agent starts | P1 | 2h | VO-06 |
| `I-06` | Implement "What's the status?" voice command | P1 | 3h | I-01, A-05 |

**Output:** Say "Start an agent on my-repo to add tests" → agent runs.

---

### Sprint 6: Notifications & Polish (Week 8-9)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `N-01` | Configure expo-notifications | P0 | 3h | M-02 |
| `N-02` | Implement push token registration | P0 | 2h | N-01, B-02 |
| `N-03` | Send push on agent complete | P0 | 2h | N-02, A-03 |
| `N-04` | Send push on agent failure | P0 | 2h | N-02, A-03 |
| `N-05` | Add notification preferences screen | P1 | 3h | N-01 |
| `N-06` | Implement global error boundary | P1 | 2h | M-02 |
| `N-07` | Add loading skeletons and empty states | P1 | 4h | A-05 |

**Output:** Get notified when agents finish.

---

### Sprint 7: Codebase Context (Week 9-10)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `C-01` | Implement GitHub API repo tree fetching | P0 | 4h | B-04 |
| `C-02` | Create framework detector (React, Next, Express, etc.) | P0 | 4h | C-01 |
| `C-03` | Implement dependency analyzer (package.json) | P1 | 3h | C-01 |
| `C-04` | Create relevant file selector (via Claude analysis) | P1 | 6h | C-02 |
| `C-05` | Implement context caching (24h TTL) | P1 | 2h | C-01, B-06 |
| `C-06` | Integrate context into agent prompts | P0 | 3h | C-04, A-02 |

**Output:** Agents understand project structure before editing.

---

### Sprint 8: Launch Prep (Week 11-12)

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `L-01` | Implement usage tracking (agents, voice minutes) | P0 | 4h | B-02 |
| `L-02` | Implement usage limits enforcement | P0 | 3h | L-01 |
| `L-03` | Add monthly usage reset cron job | P0 | 2h | L-01 |
| `L-04` | Set up Sentry error tracking | P1 | 2h | M-02, B-01 |
| `L-05` | Create app icons and splash screen | P1 | 4h | M-02 |
| `L-06` | Configure EAS Build | P1 | 3h | M-02 |
| `L-07` | TestFlight submission | P1 | 3h | L-06 |
| `L-08` | Play Store internal testing | P1 | 3h | L-06 |

**Output:** App ready for alpha testers.

---

### Sprint 9: GitHub Integration & Auto-Archiving (Week 13-14)

> **Reference:** See [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) for complete design

| Task ID | Task | Priority | Est. | Dependencies |
|---------|------|----------|------|--------------|
| `G-01` | Set up GitHub webhook endpoint with signature verification | P0 | 3h | B-01 |
| `G-02` | Handle `pull_request.merged` event → archive agent | P0 | 3h | G-01, A-01 |
| `G-03` | Handle `pull_request.closed` event → archive agent | P0 | 2h | G-01, A-01 |
| `G-04` | Add `archivedAt`, `archivedReason` fields to agents schema | P0 | 1h | B-02 |
| `G-05` | Create AgentArchiver service | P0 | 3h | G-04 |
| `G-06` | Update mobile UI with Active/Archived sections | P0 | 4h | A-05, G-05 |
| `G-07` | Add SSE events for archive transitions | P0 | 2h | A-04, G-05 |
| `G-08` | Handle `issue_comment` events for @cadence-ai mentions | P1 | 3h | G-01 |
| `G-09` | Implement fix/update/status commands from PR comments | P1 | 4h | G-08, A-02 |
| `G-10` | GitHub Issues integration (assign to cadence-bot) | P2 | 4h | G-01, A-01 |
| `G-11` | Linear integration (future) | P2 | 6h | G-01 |

**Output:** Merged/closed PRs auto-archive, keeping active view clean.

---

### Task Summary

| Sprint | Tasks | Hours | Focus |
|--------|-------|-------|-------|
| **0: Validation** | 7 | 11h | Prove idea works |
| **1: Backend** | 9 | 21h | API foundation |
| **2: Mobile Shell** | 8 | 16h | App structure + auth |
| **3: Voice** | 8 | 31h | Recording + transcription |
| **4: Agent API** | 8 | 35h | Execution + UI |
| **5: Integration** | 6 | 22h | Voice → Agent flow |
| **6: Notifications** | 7 | 18h | Push + polish |
| **7: Context** | 6 | 22h | Codebase understanding |
| **8: Launch** | 8 | 24h | Production ready |
| **9: GitHub Integration** | 11 | 35h | Webhooks + auto-archive |
| **TOTAL** | **78** | **235h** | **14 weeks** |

---

**Document Version:** 2.1
**Created:** December 26, 2025
**Updated:** December 27, 2025
**Status:** Ready for Implementation
