# Cadence Backend

> **The API server powering the Cadence voice coding assistant**

Built with Fastify + TypeScript, integrating Claude Agent SDK for AI-powered code execution.

## Prerequisites

- Node.js 20+
- PostgreSQL (Neon recommended)
- Redis (Upstash recommended)
- Anthropic API key
- GitHub OAuth app

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your configuration to .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Environment Variables

```bash
# .env
NODE_ENV=development
PORT=8080

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/cadence

# Cache (Upstash Redis)
REDIS_URL=redis://user:pass@host:6379

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# JWT
JWT_SECRET=your-32-char-secret

# Encryption (for API keys)
ENCRYPTION_KEY=your-64-char-hex-key
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |
| POST | `/api/auth/github` | GitHub OAuth callback |
| POST | `/api/auth/refresh` | Refresh JWT |
| GET | `/api/agents` | List user's agents |
| POST | `/api/agents` | Create new agent |
| GET | `/api/agents/:id` | Get agent detail |
| POST | `/api/agents/:id/pause` | Pause agent |
| POST | `/api/agents/:id/resume` | Resume agent |
| DELETE | `/api/agents/:id` | Cancel agent |
| GET | `/api/agents/:id/events` | SSE stream |
| GET | `/api/repos` | List user repos |

## Project Structure

```
cadence-backend/
├── src/
│   ├── index.ts              # Fastify app entry
│   ├── config/
│   │   ├── env.ts            # Environment validation
│   │   └── database.ts       # DB connection
│   ├── routes/
│   │   ├── auth.ts           # OAuth endpoints
│   │   ├── agents.ts         # Agent CRUD
│   │   ├── repos.ts          # Repository listing
│   │   └── health.ts         # Health checks
│   ├── services/
│   │   ├── AgentExecutor.ts  # Claude Agent SDK
│   │   ├── AgentQueue.ts     # BullMQ queue
│   │   ├── SSEManager.ts     # Real-time events
│   │   └── GitHubAuth.ts     # OAuth flow
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   └── migrations/
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   └── rateLimit.ts
│   ├── workers/
│   │   └── agentWorker.ts    # BullMQ processor
│   └── types/
│       └── index.ts
├── drizzle.config.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm test             # Run tests
npm run db:generate  # Generate migration
npm run db:migrate   # Run migrations
```

## Tech Stack

- **Framework:** Fastify 4
- **Language:** TypeScript
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon)
- **Queue:** BullMQ + Redis
- **AI:** Claude Agent SDK
- **Auth:** GitHub OAuth + JWT

---

**Status:** Not Started
**Sprint:** 1 (Week 1-2)
**Owner:** Backend Agent
