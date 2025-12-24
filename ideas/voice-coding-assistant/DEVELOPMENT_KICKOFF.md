# Claudia - Mobile Speech Agent App Development Kickoff

> **Project Codename:** Claudia (Voice-Enabled AI Coding Assistant)
> **Status:** Ready for Development
> **Start Date:** TBD
> **Target MVP:** 8-12 weeks

---

## Quick Reference

| Document | Purpose | Link |
|----------|---------|------|
| **Executive Summary** | Decision makers overview | [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) |
| **Consolidated Overview** | Technical architecture | [CONSOLIDATED_OVERVIEW.md](./CONSOLIDATED_OVERVIEW.md) |
| **Risk Analysis** | Comprehensive risk assessment | [RISK_ANALYSIS_AND_VIABILITY.md](./RISK_ANALYSIS_AND_VIABILITY.md) |
| **Technical Decisions** | All 12 validated decisions | [docs/TECHNICAL_DECISIONS_REVIEW.md](./docs/TECHNICAL_DECISIONS_REVIEW.md) |
| **UI Wireframes** | 10 screen mockups | [mocks/UI_WIREFRAMES.md](./mocks/UI_WIREFRAMES.md) |

---

## The Ideal Prompt to Kick Off Development

Use this prompt with Claude Code or any AI development assistant to begin building Claudia:

```
# Project: Claudia - Mobile Voice AI Coding Agent

## Context
You are building a React Native + Expo mobile app that allows developers to create and manage AI coding agents using voice commands. The app uses:

- **Frontend:** React Native + Expo SDK 52, TypeScript, Zustand, TanStack Query
- **Backend:** Fastify 4, PostgreSQL 16 (Neon), OAuth 2.0 PKCE
- **Voice:** OpenAI Whisper API (STT), expo-speech (TTS)
- **AI:** Anthropic Claude API for agent execution
- **Real-time:** Polling + Push Notifications

## Documentation Location
All planning docs are in: `ideas/voice-coding-assistant/`
- Read `CONSOLIDATED_OVERVIEW.md` for current architecture
- Read `docs/TECHNICAL_DECISIONS_REVIEW.md` for validated tech decisions
- Read `mocks/UI_WIREFRAMES.md` for UI specifications

## Current Task
[SPECIFY YOUR CURRENT TASK HERE - e.g., "Set up project foundation with Expo"]

## Key Requirements
1. Voice-first interface with 95%+ accuracy (Whisper API)
2. Real-time agent status updates
3. Push notifications for agent completion
4. GitHub OAuth for authentication
5. Cost monitoring and usage limits

## Constraints
- Target cost: <$10/user/month
- Latency target: <2 seconds end-to-end for voice
- Support both iOS and Android
- Offline viewing mode for agent status

Please proceed with the task while adhering to the documented architecture.
```

---

## Development Task Breakdown

### Phase 0: Project Setup (Week 0-1)

#### P0.1 - Repository & Tooling Setup
- [ ] Create new Expo project: `npx create-expo-app@latest claudia --template expo-template-blank-typescript`
- [ ] Configure ESLint + Prettier with project standards
- [ ] Set up Husky for pre-commit hooks
- [ ] Configure TypeScript strict mode
- [ ] Set up path aliases (@components, @services, @stores, etc.)
- [ ] Add EditorConfig for consistent formatting

#### P0.2 - Core Dependencies
```bash
# Install core dependencies
npx expo install expo-speech expo-av expo-secure-store expo-notifications expo-auth-session expo-crypto

# State & Data
npm install zustand @tanstack/react-query axios

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# UI
npm install react-native-gesture-handler react-native-reanimated
```

#### P0.3 - Project Structure
```
claudia/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Voice (Home)
│   │   │   ├── agents.tsx      # Agents list
│   │   │   ├── repos.tsx       # Repositories
│   │   │   └── settings.tsx    # Settings
│   │   ├── agent/[id].tsx      # Agent detail
│   │   ├── create.tsx          # Create agent flow
│   │   └── _layout.tsx         # Root layout
│   ├── components/
│   │   ├── voice/              # Voice interface components
│   │   ├── agents/             # Agent-related components
│   │   └── common/             # Shared components
│   ├── services/
│   │   ├── speech/             # STT/TTS services
│   │   ├── api/                # API client
│   │   └── auth/               # Authentication
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom hooks
│   ├── utils/                  # Utilities
│   ├── types/                  # TypeScript types
│   └── constants/              # App constants
├── assets/                     # Static assets
└── app.json                    # Expo config
```

---

### Phase 1: Foundation (Weeks 1-2)

#### P1.1 - Authentication System
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Implement GitHub OAuth PKCE flow | P0 | 4h | expo-auth-session |
| Create AuthService class | P0 | 2h | - |
| Secure token storage (expo-secure-store) | P0 | 2h | AuthService |
| Build login/welcome screen | P0 | 4h | AuthService |
| Token refresh logic | P0 | 2h | AuthService |
| Logout flow | P1 | 1h | AuthService |

**Success Criteria:**
- [ ] User can authenticate with GitHub
- [ ] Tokens stored securely
- [ ] Session persists across app restarts

#### P1.2 - State Management Setup
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create authStore (Zustand) | P0 | 2h | - |
| Create agentStore | P0 | 3h | - |
| Create voiceStore | P0 | 3h | - |
| Create settingsStore | P1 | 2h | - |
| AsyncStorage persistence | P0 | 2h | All stores |
| TanStack Query configuration | P0 | 2h | - |

#### P1.3 - Navigation & Layout
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Configure Expo Router | P0 | 2h | - |
| Build tab navigation shell | P0 | 3h | - |
| Create common header component | P1 | 2h | - |
| Implement navigation guards | P0 | 2h | authStore |

---

### Phase 2: Voice Interface (Weeks 3-4)

#### P2.1 - Speech-to-Text (STT)
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create WhisperSTTProvider | P0 | 6h | - |
| Audio recording with expo-av | P0 | 4h | - |
| iOS audio compression (AAC/M4A) | P0 | 8h | expo-av |
| Implement STT provider interface | P0 | 2h | - |
| Error handling & retry logic | P0 | 3h | WhisperSTTProvider |
| Add recording quality settings | P1 | 2h | - |

**Key Implementation:**
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
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    return response.json();
  }
}
```

#### P2.2 - Text-to-Speech (TTS)
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create TTSService with expo-speech | P0 | 3h | - |
| Voice selection implementation | P1 | 2h | TTSService |
| Speech rate/pitch controls | P1 | 2h | TTSService |
| Queue management for responses | P0 | 3h | TTSService |

#### P2.3 - Voice Interface UI
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Build VoiceButton component | P0 | 4h | - |
| Recording waveform animation | P1 | 4h | - |
| Voice state indicator (idle/listening/processing/speaking) | P0 | 3h | - |
| Transcript display component | P0 | 2h | - |
| Recent commands list | P1 | 2h | - |

---

### Phase 3: Agent Management (Weeks 5-6)

#### P3.1 - Command Parser
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create CommandParser service | P0 | 6h | - |
| Integrate Claude Haiku for parsing | P0 | 4h | Anthropic API |
| Define command intent types | P0 | 2h | - |
| Entity extraction (repo, branch, task) | P0 | 4h | CommandParser |
| Confidence scoring | P1 | 2h | CommandParser |

**Command Intents:**
```typescript
type CommandIntent =
  | 'agent_create'      // "Start an agent on wallet-frontend..."
  | 'agent_status'      // "What's the status of my agents?"
  | 'agent_pause'       // "Pause the agent on api-service"
  | 'agent_resume'      // "Resume the agent"
  | 'agent_stop'        // "Stop all running agents"
  | 'repo_list'         // "Show my repositories"
  | 'help'              // "What can you do?"
  | 'unknown';          // Unrecognized
```

#### P3.2 - Agent API Service
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create AgentApiService | P0 | 6h | TanStack Query |
| Agent CRUD operations | P0 | 4h | AgentApiService |
| Agent log fetching | P0 | 2h | AgentApiService |
| Real-time status polling | P0 | 4h | AgentApiService |
| Optimistic updates | P1 | 3h | TanStack Query |

#### P3.3 - CodebaseAnalyzer (P0 Gap)
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create CodebaseAnalyzer service | P0 | 8h | GitHub API |
| Repository tree fetching | P0 | 4h | GitHub API |
| Framework detection (React, Next, etc.) | P0 | 4h | - |
| Relevant file selection with Claude | P0 | 6h | Anthropic API |
| Caching layer (24h TTL) | P1 | 3h | AsyncStorage |

#### P3.4 - Agent UI
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Agents list screen | P0 | 4h | agentStore |
| Agent detail screen | P0 | 6h | - |
| Agent logs view | P0 | 4h | - |
| Create agent flow (3 steps) | P0 | 8h | - |
| Filter tabs (All/Running/Finished/Failed) | P1 | 2h | - |

---

### Phase 4: Real-time & Notifications (Week 7-8)

#### P4.1 - Real-time Updates
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Implement polling mechanism (5s interval) | P0 | 4h | AgentApiService |
| Background fetch for iOS | P0 | 4h | expo-background-fetch |
| Status change detection | P0 | 2h | agentStore |
| Reconnection logic | P0 | 3h | - |

#### P4.2 - Push Notifications
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Configure expo-notifications | P0 | 4h | - |
| Backend push token registration | P0 | 3h | Backend API |
| Agent completion notification | P0 | 2h | - |
| Agent failure notification | P0 | 2h | - |
| Notification preferences | P1 | 2h | settingsStore |

---

### Phase 5: Polish & Testing (Weeks 9-10)

#### P5.1 - Error Handling
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Global error boundary | P0 | 3h | - |
| API error handling | P0 | 4h | - |
| Network error states | P0 | 3h | - |
| Voice recognition fallbacks | P0 | 3h | - |
| User-friendly error messages | P0 | 2h | - |

#### P5.2 - Testing
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Unit tests for services | P0 | 8h | Jest |
| Integration tests for flows | P1 | 8h | RNTL |
| Voice interface E2E tests | P1 | 6h | Detox |
| Performance profiling | P1 | 4h | - |

#### P5.3 - UI Polish
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Loading states & skeletons | P0 | 4h | - |
| Empty states | P0 | 3h | - |
| Dark mode support | P1 | 6h | - |
| Haptic feedback | P1 | 2h | - |
| Animations refinement | P2 | 4h | Reanimated |

---

### Phase 6: Launch Prep (Weeks 11-12)

#### P6.1 - Cost & Usage Controls
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Implement usage tracking | P0 | 4h | Backend |
| Usage limit enforcement | P0 | 4h | - |
| Cost monitoring dashboard | P1 | 6h | - |
| Free tier restrictions | P0 | 3h | - |

#### P6.2 - Analytics & Monitoring
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Sentry error tracking setup | P0 | 3h | - |
| PostHog analytics integration | P1 | 3h | - |
| Voice accuracy metrics | P1 | 3h | - |
| User flow tracking | P1 | 2h | - |

#### P6.3 - App Store Prep
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| App icons & splash screen | P0 | 4h | - |
| App Store metadata | P0 | 4h | - |
| Privacy policy & terms | P0 | 4h | - |
| EAS build configuration | P0 | 4h | - |
| TestFlight/Play Store internal testing | P0 | 4h | - |

---

## Session Management Prompts

### Starting a New Development Session
```
I'm continuing development on Claudia, the mobile voice AI coding agent app.

Current phase: [Phase 1/2/3/etc.]
Last completed: [Task description]
Next priority: [Task from list above]

Project docs are in: ideas/voice-coding-assistant/
Mobile app code should be in: apps/claudia/ (or wherever you set up)

Please review the DEVELOPMENT_KICKOFF.md and continue from where we left off.
```

### Task-Specific Prompts

#### Voice Interface Development
```
Implement the WhisperSTTProvider for Claudia's voice-to-text functionality.

Requirements:
- Use OpenAI Whisper API with 95%+ accuracy
- Handle iOS audio format (M4A) and Android (WebM)
- Include retry logic with exponential backoff
- Target latency: <2 seconds total

Reference: ideas/voice-coding-assistant/docs/STT_WISPR_FLOW_QUALITY.md
```

#### Agent Management Development
```
Build the agent creation flow for Claudia.

The flow should:
1. Step 1: Select repository (from GitHub)
2. Step 2: Choose branch + enter task description (support voice input)
3. Step 3: Configure model + advanced options

Reference wireframes: ideas/voice-coding-assistant/mocks/UI_WIREFRAMES.md
Data models: ideas/voice-coding-assistant/CONSOLIDATED_OVERVIEW.md (Agent interface)
```

#### Backend Integration
```
Create the AgentApiService for Claudia.

Endpoints needed:
- POST /api/agents (create)
- GET /api/agents (list with filters)
- GET /api/agents/:id (detail)
- POST /api/agents/:id/pause
- POST /api/agents/:id/resume
- DELETE /api/agents/:id (cancel)
- GET /api/agents/:id/logs

Use TanStack Query for caching and optimistic updates.
Reference: ideas/voice-coding-assistant/CONSOLIDATED_OVERVIEW.md (API section)
```

---

## Decision Gates & Kill Criteria

| Gate | When | Success Metric | Action if Failed |
|------|------|----------------|------------------|
| **Week 4 Alpha** | After voice interface complete | NPS > 50, Voice accuracy > 90%, Cost < $5/user | KILL - Voice UX not viable |
| **Week 8 Beta** | After 100 users onboarded | WAU > 30%, Retention > 40% | KILL - No product-market fit |
| **Week 16 Paid** | After paid tier launch | Conversion > 10%, $1K MRR | KILL - No willingness to pay |

---

## Resource Links

### API Documentation
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Anthropic Claude API](https://docs.anthropic.com/claude/docs)
- [GitHub REST API](https://docs.github.com/en/rest)

### React Native & Expo
- [Expo Documentation](https://docs.expo.dev/)
- [Expo AV (Audio)](https://docs.expo.dev/versions/latest/sdk/av/)
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)

### State Management
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)

---

## Team & Contact

**Solo Founder Mode:**
- Target: 30-40 hrs/week
- Budget: $20K for 4 months
- Expected outcome: Alpha in 4 weeks, Beta in 8 weeks

**Questions to Answer Before Starting:**
1. ☐ Where should the mobile app code live? (`apps/claudia/`?)
2. ☐ Backend: Build custom or use existing service?
3. ☐ Domain/branding: Claudia? VoiceAgent? Other?
4. ☐ Beta user recruitment: How will we find 10 alpha users?

---

**Document Version:** 1.0
**Created:** December 24, 2025
**Status:** Ready for Development Kickoff
