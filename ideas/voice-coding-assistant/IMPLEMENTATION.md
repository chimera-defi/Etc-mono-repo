# Cadence - Implementation Guide

> **Project:** Voice-Enabled AI Coding Assistant (React Native Mobile App)
> **Target:** Feature parity with Cursor/Claude Code + Voice interface
> **Timeline:** 12 weeks MVP

---

## Quick Start

```bash
# Create project
npx create-expo-app@latest cadence --template expo-template-blank-typescript
cd cadence

# Install core dependencies
npx expo install expo-speech expo-av expo-secure-store expo-notifications expo-auth-session expo-crypto
npm install zustand @tanstack/react-query axios
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Backend (separate directory)
mkdir -p ../cadence-backend && cd ../cadence-backend
npm init -y
npm install @anthropic-ai/claude-code fastify @fastify/cors @fastify/jwt pg dotenv zod
npm install -D typescript @types/node tsx
```

---

## Tech Stack (Final)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native + Expo SDK 52 | Cross-platform iOS/Android |
| **Navigation** | React Navigation 7 | Tab + stack navigation |
| **State** | Zustand 4 | Lightweight state management |
| **Data** | TanStack Query v5 | API caching, optimistic updates |
| **Backend** | Fastify 4 | Fast, TypeScript-first API |
| **AI Core** | Claude Agent SDK | Agent execution |
| **STT** | OpenAI Whisper API | 95-98% voice accuracy |
| **TTS** | expo-speech | On-device, <50ms latency |
| **Database** | PostgreSQL 16 (Neon) | Serverless, auto-scale |
| **Real-time** | Polling + Push notifications | Status updates |
| **Auth** | GitHub OAuth PKCE | Secure mobile auth |
| **Execution** | Fly.io Machines (MVP) | Container execution |

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
