# Cadence - Implementation Guide

> **Project:** Voice-Enabled AI Coding Assistant (React Native Mobile App)
> **Target:** Feature parity with Cursor/Claude Code + Voice interface
> **Timeline:** 12 weeks MVP

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

**Document Version:** 1.0
**Created:** December 26, 2025
**Status:** Ready for Implementation
