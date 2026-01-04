# Agent Prompts Quick Reference

**Copy-paste prompts for parallel agent execution**
*Created: December 28, 2025*
*Project: Cadence - Voice-Enabled AI Coding Assistant*

---

## Overview

This file contains **6 self-contained prompts** for parallel agent execution. Each prompt follows:
- **Local-first development** - Test locally before any deployment
- **Multi-step review** - Verify from 5 perspectives before completion
- **Validation requirements** - All deliverables must be tested

**Parallelization Map:**

```
SPRINT 0 - VALIDATION (Days 1-5):
└── Agent 1: Validation Prototype (V-01 to V-07) - CRITICAL FIRST
    └── Must pass before any other work proceeds

WEEK 1 (Parallel After Validation):
├── Agent 2: Backend Foundation (B-01 to B-09)
└── Agent 3: Mobile Shell (M-01 to M-08)

WEEKS 2-3 (Sequential - Needs Mobile Shell):
└── Agent 4: Voice Interface (VO-01 to VO-08)

WEEKS 4-5 (Sequential - Needs Backend + Voice):
└── Agent 5: Agent API & UI (A-01 to A-08, I-01 to I-06)

WEEKS 6-8 (Can Parallelize Polish Tasks):
└── Agent 6: Polish & Launch (N-01 to N-07, L-01 to L-08)
```

---

## Mandatory Review Protocol (All Agents)

**Every agent must follow this review protocol before marking any deliverable complete:**

### Multi-Step Review Checklist

```
1. DEVELOPER PERSPECTIVE: Can another developer use this?
   - [ ] Code compiles/runs without errors
   - [ ] Dependencies documented in package.json
   - [ ] Setup instructions work from scratch
   - [ ] Environment variables documented

2. REVIEWER PERSPECTIVE: Is this correct?
   - [ ] Logic matches specification in IMPLEMENTATION.md
   - [ ] Edge cases handled
   - [ ] No dead code or unused imports
   - [ ] TypeScript types are strict (no 'any')

3. USER PERSPECTIVE: Does it actually work?
   - [ ] Happy path tested manually
   - [ ] Error states handled gracefully
   - [ ] Clear error messages displayed
   - [ ] Loading states present

4. MAINTAINER PERSPECTIVE: Can this be maintained?
   - [ ] Code is readable (clear variable names)
   - [ ] Complex logic has comments
   - [ ] Tests exist for core functionality
   - [ ] No hardcoded values (use config/env)

5. PM PERSPECTIVE: What could go wrong?
   - [ ] Risks documented
   - [ ] Blockers flagged immediately
   - [ ] Assumptions stated explicitly
   - [ ] Security considerations noted
```

### Verification Commands

Before marking ANY deliverable complete, run ALL applicable:

```bash
# For React Native / Expo (Mobile)
cd cadence-app
npm run lint                    # ESLint
npm run type-check              # TypeScript
npm test                        # Jest tests
npx expo start                  # Verify app launches

# For Backend (Fastify)
cd cadence-backend
npm run lint                    # ESLint
npm run type-check              # TypeScript
npm test                        # Jest tests
npm run dev                     # Verify server starts

# For Validation Prototype
cd cadence-prototype
npx tsx prototype.ts            # Verify CLI works
```

---

## Testing Hierarchy

**All testing follows this order - NO EXCEPTIONS:**

```
1. UNIT TESTS (Jest)
   └── Run: npm test
   └── Coverage target: 80%+
   └── Why: Fast feedback, catch regressions

2. COMPONENT TESTS (React Native Testing Library)
   └── Run: npm test -- --testPathPattern=components
   └── Why: Verify UI components work

3. SIMULATOR TESTING (iOS Simulator / Android Emulator)
   └── Run: npx expo start
   └── Why: Test on simulated devices
   └── MANUAL verification required

4. DEVICE TESTING (Real iOS/Android hardware)
   └── Run: npx expo start --dev-client
   └── Why: Test actual voice recording, TTS
   └── CRITICAL for voice features

5. TESTFLIGHT / INTERNAL TESTING
   └── Run: eas build --profile preview
   └── Why: Pre-production validation
   └── ONLY after all prior stages pass
```

---

## PROMPT 1: Validation Prototype Agent

**Dependencies:** None
**Run Immediately:** YES - MUST BE FIRST
**Testing Environment:** Local Node.js CLI
**Estimated Time:** 8-12 hours
**Sprint:** 0 (Days 1-5)

```text
You are a developer building a validation prototype for Cadence, a voice-enabled AI coding assistant.

## CONTEXT
- Cadence is a mobile app that lets developers code via voice
- Before building the mobile app, we MUST validate the core hypothesis
- The hypothesis: voice → transcription → Claude Agent → code changes works reliably

## CRITICAL: THIS IS A VALIDATION GATE
- If this prototype fails, we STOP the project
- Success criteria are binary - either it works or it doesn't
- Do NOT proceed to mobile development until validation passes

## YOUR TASKS

### Task V-01: Create prototype project
```bash
mkdir -p ideas/voice-coding-assistant/cadence-prototype
cd ideas/voice-coding-assistant/cadence-prototype
npm init -y
npm install @anthropic-ai/claude-code openai dotenv readline
npm install -D typescript @types/node tsx
npx tsc --init
```

Create these files:
- `src/prototype.ts` - Main CLI tool
- `src/transcribe.ts` - Whisper integration
- `src/agent.ts` - Claude Agent SDK wrapper
- `.env.example` - Required environment variables
- `README.md` - Setup and usage instructions

### Task V-02: Implement Whisper transcription
```typescript
// src/transcribe.ts
import OpenAI from 'openai';
import * as fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioPath: string): Promise<string> {
  const file = fs.createReadStream(audioPath);
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
  });
  return response.text;
}
```

### Task V-03: Implement Claude Agent SDK wrapper
```typescript
// src/agent.ts
import { query } from '@anthropic-ai/claude-code';

export async function runAgent(task: string, repoPath: string): Promise<void> {
  console.log(`\n Starting agent: "${task}"\n`);

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
      console.log(`\n Tool: ${event.name}`);
    }
  }
}
```

### Task V-04: Create end-to-end CLI
Build a CLI that:
1. Accepts text input OR audio file path
2. If audio: transcribes via Whisper
3. Runs Claude Agent on a test repository
4. Reports success/failure

### Task V-05: Record 5 test voice commands
Record audio files for these tasks:
1. "Add a console.log to the main function"
2. "Create a new file called utils.ts with an add function"
3. "Fix the typo in the README"
4. "Add error handling to the fetchData function"
5. "Write a unit test for calculateTotal"

Save as: `test-recordings/task-1.m4a` through `task-5.m4a`

### Task V-06: Run validation tests
For each test task:
1. Run with text input first
2. Run with audio input
3. Measure latency, accuracy, success

### Task V-07: Document results
Create `VALIDATION_RESULTS.md`:
```markdown
# Validation Results

## Summary
- Voice accuracy: X%
- Agent success rate: X/5 tasks
- Average latency: Xs
- Average cost: $X per agent

## Decision
[ ] PROCEED - All criteria met
[ ] STOP - Investigate issues
```

## SUCCESS CRITERIA (All must pass)
| Metric | Threshold | Actual |
|--------|-----------|--------|
| Voice transcription accuracy | >90% | ____% |
| Agent task completion | 4/5 tasks | ____/5 |
| End-to-end latency | <30 seconds | ____s |
| Cost per agent | <$0.50 | $____ |

## VERIFICATION CHECKLIST
- [ ] `npx tsx src/prototype.ts` runs without errors
- [ ] Text mode: agent successfully edits files
- [ ] Audio mode: transcription is accurate
- [ ] All 5 test recordings transcribed correctly
- [ ] Agent completes at least 4/5 test tasks
- [ ] VALIDATION_RESULTS.md created with actual metrics
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Setup status (success/failure)
2. Transcription accuracy for each recording
3. Agent success for each task
4. Latency measurements
5. Cost calculations
6. GO/NO-GO recommendation
```

---

## PROMPT 2: Backend Foundation Agent

**Dependencies:** Validation Prototype (Sprint 0) must pass
**Run Immediately:** After Sprint 0 passes
**Testing Environment:** Local Node.js server
**Estimated Time:** 16-24 hours
**Sprint:** 1 (Week 1-2)

```text
You are a backend engineer building the Cadence API server.

## CONTEXT
- Cadence is a voice-enabled AI coding assistant
- The backend uses Fastify + TypeScript
- Must integrate with Claude Agent SDK for agent execution
- Database: PostgreSQL via Drizzle ORM
- Queue: BullMQ + Redis

## REFERENCE DOCUMENTS
Read these before starting:
- ideas/voice-coding-assistant/IMPLEMENTATION.md (lines 200-1100)
- ideas/voice-coding-assistant/ARCHITECTURE.md (sections 2-4)

## YOUR TASKS

### Task B-01: Initialize backend project
```bash
mkdir -p ideas/voice-coding-assistant/cadence-backend
cd ideas/voice-coding-assistant/cadence-backend
npm init -y

# Core framework
npm install fastify @fastify/cors @fastify/jwt @fastify/cookie @fastify/rate-limit

# Database & ORM
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Job queue & cache
npm install bullmq ioredis

# AI providers
npm install @anthropic-ai/claude-code openai

# Auth & security
npm install jose bcryptjs
npm install -D @types/bcryptjs

# Utilities
npm install zod dotenv nanoid
npm install -D typescript @types/node tsx

npx tsc --init
```

### Task B-02: Create project structure
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
│   │   └── GitHubAuth.ts     # OAuth flow
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   └── migrations/
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   └── rateLimit.ts
│   └── types/
│       └── index.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Task B-03: Implement health check routes
```typescript
// src/routes/health.ts
fastify.get('/health', async () => ({ status: 'ok' }));
fastify.get('/ready', async () => {
  // Check DB and Redis connections
  return { status: 'ready' };
});
```

### Task B-04: Implement database schema
Use Drizzle ORM with the schema from IMPLEMENTATION.md lines 467-609:
- users table
- agents table
- agent_logs table
- api_keys table
- context_cache table

### Task B-05: Implement GitHub OAuth routes
Follow PKCE flow from IMPLEMENTATION.md lines 1099-1189:
- POST /api/auth/github - Exchange code for token
- POST /api/auth/refresh - Refresh JWT

### Task B-06: Implement JWT auth middleware
- Verify JWT on protected routes
- Extract user from token
- Handle expired tokens gracefully

### Task B-07: Set up Redis connection
- Create redis client wrapper
- Handle connection errors
- Add reconnection logic

### Task B-08: Set up BullMQ agent queue
Follow IMPLEMENTATION.md lines 611-711:
- Create agent queue
- Define job data interface
- Add queue monitoring

### Task B-09: Create Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

## TECH STACK
- Fastify 4 + TypeScript
- Drizzle ORM + PostgreSQL
- BullMQ + Redis
- GitHub OAuth + JWT

## VERIFICATION CHECKLIST
- [ ] `npm run lint` - No errors
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npm test` - All tests pass
- [ ] `npm run dev` - Server starts on port 8080
- [ ] Health endpoints respond correctly
- [ ] Database migrations run successfully
- [ ] README with setup instructions
- [ ] .env.example with all required variables
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Routes implemented (list each)
2. Database tables created
3. Test coverage percentage
4. Any missing dependencies discovered
5. Blockers encountered
```

---

## PROMPT 3: Mobile Shell Agent

**Dependencies:** None (can run parallel with Backend)
**Run Immediately:** After Sprint 0 passes
**Testing Environment:** iOS Simulator / Android Emulator
**Estimated Time:** 12-16 hours
**Sprint:** 2 (Week 2-3)

```text
You are a React Native developer building the Cadence mobile app shell.

## CONTEXT
- Cadence is a voice-enabled AI coding assistant
- Mobile app built with React Native + Expo SDK 52
- This sprint: app structure, navigation, auth flow
- Voice features come in Sprint 3

## REFERENCE DOCUMENTS
Read these before starting:
- ideas/voice-coding-assistant/IMPLEMENTATION.md (lines 1443-1499)
- ideas/voice-coding-assistant/04-design/UI_WIREFRAMES.md

## YOUR TASKS

### Task M-01: Create Expo project
```bash
cd ideas/voice-coding-assistant
npx create-expo-app@latest cadence-app --template expo-template-blank-typescript
cd cadence-app

# Core dependencies
npx expo install expo-secure-store expo-auth-session expo-crypto expo-web-browser

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# State & data
npm install zustand @tanstack/react-query axios
```

### Task M-02: Create folder structure
```
cadence-app/
├── src/
│   ├── app/                  # Expo Router (if using) or screens
│   │   ├── (tabs)/
│   │   │   ├── index.tsx     # Voice (Home) - placeholder
│   │   │   ├── agents.tsx    # Agent list - placeholder
│   │   │   └── settings.tsx  # Settings - placeholder
│   │   ├── agent/[id].tsx    # Agent detail
│   │   ├── login.tsx         # Login screen
│   │   └── _layout.tsx       # Root layout
│   ├── components/
│   │   ├── common/           # Button, Card, etc.
│   │   └── agents/           # AgentCard, AgentList
│   ├── services/
│   │   ├── api.ts            # API client (axios)
│   │   └── auth.ts           # Auth service
│   ├── stores/
│   │   ├── authStore.ts      # Zustand auth state
│   │   └── agentStore.ts     # Zustand agent state
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── config.ts         # API URLs, etc.
├── app.json
└── README.md
```

### Task M-03: Configure navigation
Set up React Navigation with:
- Tab navigator (Voice, Agents, Settings)
- Stack navigator for agent detail
- Navigation types for TypeScript

### Task M-04: Create Zustand stores
```typescript
// src/stores/authStore.ts
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// src/stores/agentStore.ts
interface AgentState {
  agents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  fetchAgents: () => Promise<void>;
  createAgent: (data: CreateAgentInput) => Promise<void>;
}
```

### Task M-05: Implement GitHub OAuth flow
Use expo-auth-session with PKCE:
```typescript
// src/services/auth.ts
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

export async function loginWithGitHub() {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  // ... PKCE flow
}
```

### Task M-06: Create login screen
- GitHub login button
- Loading state during OAuth
- Error handling for failed auth
- Redirect to main app on success

### Task M-07: Implement secure token storage
```typescript
// src/services/auth.ts
import * as SecureStore from 'expo-secure-store';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}
```

### Task M-08: Create navigation guards
- Check auth state on app launch
- Redirect to login if not authenticated
- Redirect to main app if authenticated
- Handle token refresh

## TECH STACK
- React Native + Expo SDK 52
- React Navigation 7
- Zustand 4 for state
- Axios for API calls
- expo-secure-store for tokens

## VERIFICATION CHECKLIST
- [ ] `npm run lint` - No errors
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npx expo start` - App launches in simulator
- [ ] Tab navigation works
- [ ] Login screen displays
- [ ] OAuth flow initiates (can test with real GitHub)
- [ ] Token stored securely
- [ ] Navigation guards redirect correctly
- [ ] README with setup instructions
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Screens created (list each)
2. Navigation structure
3. Stores implemented
4. OAuth flow status
5. Any Expo issues encountered
```

---

## PROMPT 4: Voice Interface Agent

**Dependencies:** Mobile Shell (Sprint 2) must be complete
**Run Immediately:** After Sprint 2
**Testing Environment:** REAL DEVICE required for voice
**Estimated Time:** 24-32 hours
**Sprint:** 3 (Weeks 3-4)

```text
You are a mobile developer implementing voice features for Cadence.

## CONTEXT
- Cadence uses voice for coding commands
- STT: OpenAI Whisper API
- TTS: expo-speech (on-device)
- Target: Wispr Flow parity (95-98% accuracy)

## CRITICAL: DEVICE TESTING REQUIRED
- Voice recording MUST be tested on real iOS/Android devices
- Simulator audio is unreliable
- Test with background noise, different accents

## REFERENCE DOCUMENTS
Read these before starting:
- ideas/voice-coding-assistant/IMPLEMENTATION.md (lines 1501-1560)
- ideas/voice-coding-assistant/ARCHITECTURE.md (section 5 - Voice Pipeline)
- ideas/voice-coding-assistant/WISPR_FLOW_RESEARCH_SUMMARY.md

## YOUR TASKS

### Task VO-01: Install voice dependencies
```bash
cd ideas/voice-coding-assistant/cadence-app
npx expo install expo-av expo-speech
```

### Task VO-02: Implement audio recording
```typescript
// src/services/voice/AudioRecorder.ts
import { Audio } from 'expo-av';

export class AudioRecorder {
  private recording: Audio.Recording | null = null;

  async startRecording(): Promise<void> {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    this.recording = recording;
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) throw new Error('No recording in progress');
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;
    return uri!;
  }
}
```

### Task VO-03: Implement Whisper STT with context injection
```typescript
// src/services/voice/WhisperSTT.ts
export class WhisperSTT {
  async transcribe(audioUri: string, context?: string[]): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // WISPR FLOW PARITY: Inject coding context
    if (context && context.length > 0) {
      const prompt = `Context: ${context.join(', ')}.`;
      formData.append('prompt', prompt);
    }

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: formData,
      }
    );

    const result = await response.json();
    return result.text;
  }
}
```

### Task VO-04: Implement TTS with expo-speech
```typescript
// src/services/voice/TTS.ts
import * as Speech from 'expo-speech';

export class TTS {
  speak(text: string, options?: { rate?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: 'en-US',
        rate: options?.rate ?? 1.0,
        onDone: resolve,
        onError: reject,
      });
    });
  }

  stop(): void {
    Speech.stop();
  }
}
```

### Task VO-05: Create VoiceButton component
```typescript
// src/components/voice/VoiceButton.tsx
// States: idle, listening, processing, speaking
// Visual: microphone icon, animated ring when listening
// Haptic feedback on state changes
```

### Task VO-06: Create waveform animation
- Show audio levels while recording
- Smooth animation transitions
- Visual feedback that recording is active

### Task VO-07: Implement voice state machine
```typescript
// src/stores/voiceStore.ts
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceStore {
  state: VoiceState;
  transcript: string | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  speak: (text: string) => Promise<void>;
}
```

### Task VO-08: Create transcript display
- Show transcribed text
- Allow editing before sending
- Confirm/cancel buttons

## TESTING REQUIREMENTS
1. Record 10 coding commands on real device
2. Measure transcription accuracy (target: >95%)
3. Test with:
   - Quiet environment
   - Background noise
   - Different speaking speeds

## VERIFICATION CHECKLIST
- [ ] Audio recording works on iOS
- [ ] Audio recording works on Android
- [ ] Whisper transcription returns text
- [ ] Context injection improves accuracy
- [ ] TTS speaks clearly
- [ ] VoiceButton shows correct states
- [ ] Waveform animates during recording
- [ ] State machine transitions correctly
- [ ] Tested on REAL DEVICE (not just simulator)
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Components created
2. Transcription accuracy (tested with 10 phrases)
3. Device testing results (iOS/Android)
4. Any audio issues discovered
5. Performance measurements (latency)
```

---

## PROMPT 5: Agent API & Integration Agent

**Dependencies:** Backend (Sprint 1) + Voice (Sprint 3)
**Run Immediately:** After Sprint 3
**Testing Environment:** Local backend + mobile simulator
**Estimated Time:** 32-40 hours
**Sprint:** 4-5 (Weeks 5-7)

```text
You are a full-stack developer connecting the Cadence mobile app to the backend.

## CONTEXT
- Backend API is running (from Sprint 1)
- Voice input is working (from Sprint 3)
- Now: connect voice → parse intent → create agent → show results

## REFERENCE DOCUMENTS
Read these before starting:
- ideas/voice-coding-assistant/IMPLEMENTATION.md (lines 1557-1995)
- ideas/voice-coding-assistant/ARCHITECTURE.md (sections 2-4)

## YOUR TASKS

### Backend Tasks

#### Task A-01: Implement agent CRUD routes
```typescript
// POST /api/agents - Create agent
// GET /api/agents - List agents
// GET /api/agents/:id - Get agent detail
// POST /api/agents/:id/pause - Pause agent
// POST /api/agents/:id/resume - Resume agent
// DELETE /api/agents/:id - Cancel agent
```

#### Task A-02: Implement AgentExecutor
```typescript
// src/services/AgentExecutor.ts
import { query } from '@anthropic-ai/claude-code';

export class AgentExecutor {
  async execute(task: AgentTask): AsyncGenerator<AgentEvent> {
    const response = await query({
      prompt: task.taskDescription,
      cwd: task.workingDir,
      model: task.model,
      apiKey: process.env.ANTHROPIC_API_KEY,
      options: { maxTurns: 50 },
      hooks: {
        PostToolUse: [{
          matcher: '*',
          callback: async (input) => {
            // Emit progress events
            yield { type: 'tool', name: input.tool_name };
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

#### Task A-03: Implement BullMQ agent worker
Process queued agent jobs asynchronously.

#### Task A-04: Implement SSE for real-time updates
```typescript
// GET /api/agents/:id/events
// Server-Sent Events stream for agent progress
```

### Mobile Tasks

#### Task A-05: Create AgentListScreen
- Fetch agents from API
- Show status, progress, repo name
- Pull-to-refresh
- Tap to view detail

#### Task A-06: Create AgentDetailScreen
- Show agent status and progress
- Stream logs in real-time
- Pause/resume/cancel buttons
- Link to PR when complete

#### Task A-07: Implement TanStack Query
```typescript
// src/hooks/useAgents.ts
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.getAgents(),
    refetchInterval: 5000, // Poll every 5s
  });
}
```

#### Task A-08: Add agent control actions
- Pause button
- Resume button
- Cancel button
- Confirm dialogs

### Integration Tasks

#### Task I-01: Create CommandParser (Claude Haiku)
```typescript
// src/services/CommandParser.ts
// Parse voice transcript into structured intent
// Input: "Start an agent on wallet-frontend to add dark mode"
// Output: { intent: 'agent_create', repo: 'wallet-frontend', task: 'add dark mode' }
```

#### Task I-02: Implement voice command router
Route parsed intents to appropriate handlers.

#### Task I-03: Create agent flow from voice
1. User says command
2. Parse intent
3. Confirm with user (TTS)
4. Create agent
5. Navigate to agent detail

#### Task I-04: Implement repo selection
- Fetch user's GitHub repos
- Let user select target repo
- Remember recent repos

#### Task I-05: Add spoken confirmation
Before creating agent:
- TTS: "Creating agent on wallet-frontend to add dark mode. Confirm?"
- Wait for user confirmation

#### Task I-06: Implement status queries
- "What's the status of my agents?"
- "How's the dark mode agent doing?"

## VERIFICATION CHECKLIST
- [ ] Backend: All routes return correct responses
- [ ] Backend: Agent execution works with Claude SDK
- [ ] Backend: SSE streams events correctly
- [ ] Mobile: Agent list shows all agents
- [ ] Mobile: Agent detail updates in real-time
- [ ] Mobile: Control buttons work
- [ ] Integration: Voice → Intent parsing works
- [ ] Integration: Full flow tested end-to-end
- [ ] `npm run lint` passes (both projects)
- [ ] `npm test` passes (both projects)
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Backend routes implemented
2. Mobile screens completed
3. Integration points connected
4. End-to-end test results
5. Any issues discovered
```

---

## PROMPT 6: Polish & Launch Agent

**Dependencies:** All previous sprints
**Run Immediately:** After Sprint 5
**Testing Environment:** Device testing + TestFlight
**Estimated Time:** 24-32 hours
**Sprint:** 6-8 (Weeks 8-12)

```text
You are a senior developer preparing Cadence for launch.

## CONTEXT
- Core features are implemented
- Now: polish, notifications, error handling, launch prep

## REFERENCE DOCUMENTS
- ideas/voice-coding-assistant/IMPLEMENTATION.md (lines 1990-2083)

## YOUR TASKS

### Notifications (Sprint 6)

#### Task N-01: Configure expo-notifications
```bash
npx expo install expo-notifications expo-device
```

#### Task N-02: Implement push token registration
- Get Expo push token on login
- Send to backend
- Store in user record

#### Task N-03: Send push on agent complete
Backend sends push via Expo SDK when agent finishes.

#### Task N-04: Send push on agent failure
Include error message in notification.

#### Task N-05: Add notification preferences
- Toggle notifications on/off
- Sound settings

### Polish (Sprint 7)

#### Task N-06: Global error boundary
- Catch unhandled errors
- Show friendly error screen
- Report to Sentry

#### Task N-07: Loading states and skeletons
- Skeleton screens for lists
- Loading spinners for actions
- Smooth transitions

### Launch Prep (Sprint 8)

#### Task L-01: Implement usage tracking
Track agents used, voice minutes per month.

#### Task L-02: Implement usage limits
- Free: 5 agents/month
- Pro: 50 agents/month
- Show upgrade prompts

#### Task L-03: Monthly usage reset
Cron job to reset counters on 1st of month.

#### Task L-04: Set up Sentry
```bash
npx expo install sentry-expo
```

#### Task L-05: Create app icons and splash
- 1024x1024 icon
- Splash screen
- Adaptive icons for Android

#### Task L-06: Configure EAS Build
```bash
npx eas build:configure
```

#### Task L-07: TestFlight submission
Build for iOS internal testing.

#### Task L-08: Play Store internal testing
Build for Android internal testing.

## VERIFICATION CHECKLIST
- [ ] Push notifications work on device
- [ ] Error boundary catches crashes
- [ ] Skeletons show during loading
- [ ] Usage tracking accurate
- [ ] Limits enforced correctly
- [ ] Sentry receives error reports
- [ ] App icon displays correctly
- [ ] Splash screen shows on launch
- [ ] TestFlight build succeeds
- [ ] Play Store build succeeds
- [ ] Multi-step review completed

## OUTPUT FORMAT
Report back with:
1. Notifications status
2. Polish improvements made
3. Build configurations
4. TestFlight/Play Store status
5. Known issues for post-launch
```

---

## Coordination Protocol

### Handoff Between Agents

When completing work, update these files:
1. **IMPLEMENTATION.md** - Check off completed tasks
2. **AGENT_HANDOFF.md** - Update current status
3. **Git commits** - Clear commit messages

### Conflict Resolution

If two agents modify the same file:
1. First agent commits and pushes
2. Second agent pulls, merges, resolves conflicts
3. Both update task tracking

### Definition of Done

A sprint is complete when:
1. All tasks in the sprint pass verification checklist
2. Multi-step review completed (5 perspectives)
3. Tests pass with 80%+ coverage
4. Documentation updated
5. Code committed and pushed

---

## Quick Reference: Agent Dependencies

```
Sprint 0: Validation ──────────────────────────┐
                                               │
                                    ┌──────────┴──────────┐
                                    ▼                     ▼
Sprint 1: Backend Foundation    Sprint 2: Mobile Shell
                │                          │
                │                          │
                └──────────┬───────────────┘
                           │
                           ▼
                    Sprint 3: Voice
                           │
                           │
                           ▼
                Sprint 4-5: Integration
                           │
                           │
                           ▼
                  Sprint 6-8: Launch
```

---

**Last Updated:** December 28, 2025
**Version:** 1.0
