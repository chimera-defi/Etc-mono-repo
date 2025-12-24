# Mobile Speech-Enabled AI Agent App - Architecture & Planning

## Vision

Build a cross-platform mobile application that allows developers to interact with AI coding agents (Cursor Agents or Anthropic Claude Code) using voice commands and receive spoken responses. This creates a hands-free coding assistant experience.

## Use Cases

### Primary Use Cases
1. **Voice-Driven Code Review** - Ask questions about code while commuting
2. **Hands-Free Bug Triage** - Report and discuss bugs while away from keyboard
3. **Mobile Code Monitoring** - Check on running agents via voice commands
4. **Quick Repository Queries** - "What's the status of my PR?" or "Are tests passing?"
5. **Voice-Initiated Tasks** - "Start an agent to fix the authentication bug on main branch"

### User Flows
```
User: [Speaks] "What's the status of my agents?"
App:  [Transcribes to text] → [Sends to API] → [Receives response] → [Speaks] "You have 2 running agents..."

User: [Speaks] "Start an agent on my wallet-frontend repo to add dark mode"
App:  [Transcribes] → [Creates agent] → [Speaks] "Agent started on branch claude/dark-mode-xyz"
```

---

## Architecture Decision: Platform Choice

### Option 1: React Native + Expo (RECOMMENDED)
**Effort:** 3-4 weeks MVP
**Pros:**
- Single codebase for iOS + Android
- Excellent speech libraries (expo-speech, expo-av)
- Can reuse React patterns from existing codebase
- Fast iteration with Expo Go for testing
- Built-in push notifications
- OTA updates via Expo

**Cons:**
- Slightly larger app size than native
- Some native features require custom modules

**Tech Stack:**
```
Framework: React Native + Expo SDK 52+
Navigation: React Navigation 7
State: Zustand or Jotai (lightweight)
API Client: TanStack Query v5
Speech-to-Text: Expo Speech Recognition
Text-to-Speech: Expo Speech
Real-time: Pusher JS (React Native compatible)
Auth: Expo AuthSession (OAuth/PKCE flow)
```

### Option 2: Flutter
**Effort:** 3-5 weeks MVP
**Pros:**
- Excellent performance
- Beautiful native UI out-of-box
- Good speech packages (speech_to_text, flutter_tts)

**Cons:**
- Different language (Dart) - can't reuse JS code
- Less familiar to web developers

### Option 3: Native Swift (iOS) / Kotlin (Android)
**Effort:** 6-10 weeks MVP (both platforms)
**Pros:**
- Best performance
- Native speech APIs (SFSpeech, Android Speech)

**Cons:**
- Two separate codebases
- Much longer development time

**DECISION: Go with React Native + Expo for MVP**

---

## Core Features & Architecture

### Feature Set

#### MVP (Version 1.0)
- [ ] OAuth authentication (GitHub/Cursor account)
- [ ] Voice input with real-time transcription
- [ ] Text-to-speech responses
- [ ] List active agents
- [ ] View agent status and logs
- [ ] Start new agent with voice command
- [ ] Pause/stop agents
- [ ] Push notifications for agent completion

#### Enhanced (Version 1.1)
- [ ] Conversation history
- [ ] Voice wake word ("Hey Claude")
- [ ] Multi-language support
- [ ] Agent templates ("Fix tests", "Add feature")
- [ ] Repository favorites
- [ ] Voice settings (speed, voice type)

#### Advanced (Version 2.0)
- [ ] Offline mode (view cached data)
- [ ] Agent collaboration (multi-agent workflows)
- [ ] Voice code snippets playback
- [ ] Integration with CI/CD status
- [ ] Team agent management

---

## Speech Integration Architecture

### Speech-to-Text (STT) Options

#### Option A: Device-Native STT (RECOMMENDED for MVP)
**Libraries:**
- iOS: `expo-speech-recognition` or native `SFSpeechRecognizer`
- Android: `expo-speech-recognition` or native `SpeechRecognizer`

**Pros:**
- ✅ Free (no API costs)
- ✅ Works offline
- ✅ Low latency (<100ms)
- ✅ Privacy (no data sent to cloud)

**Cons:**
- ❌ Accuracy depends on device
- ❌ Limited language support vs cloud

**Implementation:**
```tsx
import * as Speech from 'expo-speech-recognition';

const { transcript, isListening } = useSpeechRecognition({
  continuous: true,
  language: 'en-US',
  onResult: (text) => handleVoiceCommand(text)
});
```

#### Option B: Cloud STT (OpenAI Whisper, Google Speech)
**Services:**
- OpenAI Whisper API (~$0.006/minute)
- Google Cloud Speech-to-Text (~$0.016/minute)
- AssemblyAI (~$0.00025/second)

**Pros:**
- ✅ Better accuracy (95%+ vs 85%)
- ✅ More languages
- ✅ Better with accents/noise

**Cons:**
- ❌ Costs scale with usage
- ❌ Requires internet
- ❌ Higher latency (200-500ms)

**When to upgrade:**
- User feedback shows accuracy issues
- Need multilingual support
- Usage justifies cost (<$100/month for 100 active users)

### Text-to-Speech (TTS)

#### Option A: Device-Native TTS (RECOMMENDED)
**Library:** `expo-speech`

**Pros:**
- ✅ Free
- ✅ Works offline
- ✅ Very low latency
- ✅ Multiple voices available

**Cons:**
- ❌ Voice quality varies by device
- ❌ Robotic compared to AI voices

**Implementation:**
```tsx
import * as Speech from 'expo-speech';

Speech.speak(response, {
  language: 'en-US',
  pitch: 1.0,
  rate: 0.9,
  voice: 'com.apple.voice.compact.en-US.Samantha'
});
```

#### Option B: AI Voice (ElevenLabs, OpenAI TTS)
**Services:**
- ElevenLabs (~$0.30/1000 chars)
- OpenAI TTS (~$0.015/1000 chars)
- Google Cloud TTS (~$4/1M chars)

**Pros:**
- ✅ Natural, human-like voices
- ✅ Emotional tone control
- ✅ Consistent across devices

**Cons:**
- ❌ Costs add up quickly
- ❌ Requires internet
- ❌ Higher latency (500ms-2s)

**When to upgrade:**
- Premium tier feature
- User explicitly requests better voice
- Marketing differentiator

---

## API Integration Strategy

### Target APIs

#### Option 1: Cursor Agents API (cursor.com/agents)
**Status:** Reverse-engineered, undocumented

**Key Endpoints:**
```typescript
POST /api/auth/login
POST /api/auth/startBackgroundComposerFromSnapshot
POST /api/background-composer/get-detailed-composer
POST /api/background-composer/pause
POST /api/dashboard/get-user-privacy-mode
```

**Authentication:**
- WorkOS OAuth or Cursor authenticator
- JWT with RS256 signing
- Cloudflare Turnstile (bot protection) - **BLOCKER for mobile**

**Challenges:**
- ❌ No official mobile API
- ❌ Cloudflare CAPTCHA on auth
- ❌ API may change without notice
- ❌ Violates ToS without permission

**Recommendation:**
- Contact Cursor for official API access
- Use only if they provide mobile SDK
- Otherwise, use as reference but build for Claude Code

#### Option 2: Anthropic Claude Code API (RECOMMENDED)
**Status:** Official, documented

**Benefits:**
- ✅ Official API with docs
- ✅ Stable versioning
- ✅ No ToS concerns
- ✅ Better long-term support

**API Strategy:**
Since Claude Code is a CLI tool, we'd need:
1. **Backend Proxy Service** (required)
   - Deploy Express/Fastify server
   - Store user API keys securely
   - Forward requests to Anthropic API
   - Handle authentication

2. **Direct Integration** (if Anthropic adds mobile SDK)
   - Wait for official mobile SDK
   - Use when available

**Architecture:**
```
[Mobile App] → [Backend Proxy] → [Anthropic API]
                    ↓
                [Database]
             (user prefs, history)
```

#### Option 3: Generic LLM Agent Interface
**Build platform-agnostic** - support multiple backends:
- Anthropic Claude
- OpenAI Assistants API
- Cursor Agents (if they provide access)
- Local agents (via SSH to user's dev machine)

**Implementation:**
```typescript
interface AgentProvider {
  authenticate(): Promise<Session>;
  listAgents(): Promise<Agent[]>;
  createAgent(config: AgentConfig): Promise<Agent>;
  getStatus(agentId: string): Promise<AgentStatus>;
  pause(agentId: string): Promise<void>;
}

class CursorProvider implements AgentProvider { ... }
class ClaudeProvider implements AgentProvider { ... }
class OpenAIProvider implements AgentProvider { ... }
```

**RECOMMENDATION:** Start with Option 3 (generic interface) but implement Claude/OpenAI first, add Cursor if they grant access.

---

## Data Architecture

### State Management

```typescript
// Global State (Zustand)
interface AppState {
  // Auth
  user: User | null;
  session: Session | null;

  // Agents
  agents: Agent[];
  activeAgent: Agent | null;

  // Speech
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;

  // Settings
  voiceEnabled: boolean;
  voiceSpeed: number;
  autoSpeak: boolean;
  language: string;

  // Actions
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  createAgent: (config) => Promise<Agent>;
}
```

### Local Storage
- User preferences (voice settings, favorites)
- Cached agent list (for offline view)
- Conversation history (last 50 messages)

### Backend Storage (if using proxy)
- User API keys (encrypted)
- Agent metadata
- Usage analytics

---

## Screen Architecture

### Navigation Structure
```
Main Stack
├── Auth Flow
│   ├── Welcome Screen
│   ├── Login Screen (OAuth)
│   └── Onboarding
│
├── Main Tabs
│   ├── Agents Tab
│   │   ├── Agents List Screen
│   │   └── Agent Detail Screen
│   │
│   ├── Voice Tab (Primary)
│   │   └── Voice Interface Screen
│   │       ├── Waveform Animation
│   │       ├── Transcript Display
│   │       └── Quick Actions
│   │
│   ├── Repositories Tab
│   │   ├── Repos List
│   │   └── Repo Detail
│   │
│   └── Settings Tab
│       ├── Voice Settings
│       ├── Account Settings
│       └── About
│
└── Modals
    ├── Create Agent Modal
    └── Agent Logs Modal
```

### Key Screens

#### Voice Interface Screen (Main)
```
┌──────────────────────────┐
│    🔊 Voice Assistant    │
├──────────────────────────┤
│                          │
│   ╭─────────────────╮    │
│   │  ●  Recording   │    │
│   │ [Waveform]      │    │
│   ╰─────────────────╯    │
│                          │
│  "Start an agent to..."  │
│                          │
├──────────────────────────┤
│  Quick Actions:          │
│  • List agents           │
│  • Check status          │
│  • Pause all             │
└──────────────────────────┘
```

#### Agents List Screen
```
┌──────────────────────────┐
│     My Agents      [+]   │
├──────────────────────────┤
│ ● wallet-frontend        │
│   Fix dark mode bug      │
│   Status: RUNNING        │
│   Branch: claude/fix-123 │
├──────────────────────────┤
│ ✓ api-service           │
│   Add caching            │
│   Status: FINISHED       │
│   PR: #456              │
└──────────────────────────┘
```

---

## Voice Command Design

### Natural Language Processing

**Command Categories:**

1. **Status Queries**
   - "What's the status of my agents?"
   - "Are any agents running?"
   - "Show me completed agents"

2. **Agent Creation**
   - "Start an agent on wallet-frontend to add dark mode"
   - "Create an agent to fix the login bug on main branch"
   - "Debug the test failures in api-service"

3. **Agent Control**
   - "Pause the wallet agent"
   - "Stop all agents"
   - "Resume the last agent"

4. **Repository Queries**
   - "What repos do I have access to?"
   - "Show me pull requests for wallet-frontend"

### Command Parser Architecture

```typescript
interface VoiceCommand {
  intent: 'status' | 'create' | 'control' | 'query';
  entity?: 'agent' | 'repository' | 'pr';
  action?: 'start' | 'pause' | 'stop' | 'list';
  parameters?: {
    repo?: string;
    branch?: string;
    task?: string;
    agentId?: string;
  };
}

function parseVoiceCommand(transcript: string): VoiceCommand {
  // Simple keyword matching for MVP
  // Later: Use OpenAI function calling or local NLU

  if (transcript.includes('status') || transcript.includes('running')) {
    return { intent: 'status', entity: 'agent' };
  }

  if (transcript.includes('start') || transcript.includes('create')) {
    return {
      intent: 'create',
      entity: 'agent',
      parameters: extractAgentParams(transcript)
    };
  }

  // ... more patterns
}
```

**For MVP:** Simple keyword matching
**Future:** Integrate OpenAI function calling for better intent recognition

---

## Security & Privacy

### Authentication
- OAuth 2.0 with PKCE flow (secure for mobile)
- Secure token storage (Expo SecureStore)
- Refresh tokens with auto-renewal
- Biometric unlock option

### API Keys
- Never store in app code
- Store in backend if using proxy
- Or use Expo SecureStore if direct API
- Encrypt at rest

### Speech Privacy
- Use on-device STT by default (no cloud upload)
- Clear user consent for cloud STT
- Don't log/store voice audio
- Allow voice data deletion

### Permissions
```xml
<!-- iOS -->
<key>NSMicrophoneUsageDescription</key>
<string>Voice commands to control your AI agents</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>Convert your voice to text for agent commands</string>

<!-- Android -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up React Native + Expo project
- [ ] Configure navigation (React Navigation)
- [ ] Implement authentication screen (mock OAuth)
- [ ] Design UI components library
- [ ] Set up state management (Zustand)

### Phase 2: Speech Integration (Week 2-3)
- [ ] Integrate expo-speech-recognition
- [ ] Build voice interface screen
- [ ] Implement transcript display
- [ ] Add expo-speech for TTS
- [ ] Create voice command parser (basic)

### Phase 3: API Integration (Week 3-4)
**Option A: If using backend proxy**
- [ ] Build Express backend with Anthropic SDK
- [ ] Deploy to Vercel/Railway
- [ ] Implement API client in app
- [ ] Add agent CRUD operations

**Option B: If using direct Cursor API (requires permission)**
- [ ] Implement OAuth with Cursor
- [ ] Build API client
- [ ] Handle Cloudflare challenges

### Phase 4: Core Features (Week 4-5)
- [ ] Agents list screen
- [ ] Create agent flow (voice + manual)
- [ ] Agent detail screen with logs
- [ ] Pause/stop/resume controls
- [ ] Push notifications setup

### Phase 5: Polish & Testing (Week 5-6)
- [ ] Voice feedback improvements
- [ ] Error handling & retry logic
- [ ] Loading states & animations
- [ ] Beta testing (TestFlight/Play Console)
- [ ] Bug fixes & UX refinement

### Phase 6: Launch (Week 6+)
- [ ] App Store submission (iOS)
- [ ] Play Store submission (Android)
- [ ] Documentation & onboarding
- [ ] Marketing materials
- [ ] Launch! 🚀

---

## Technology Stack Summary

### Frontend (Mobile App)
```json
{
  "platform": "React Native + Expo SDK 52",
  "language": "TypeScript",
  "ui": "React Native Paper or Tamagui",
  "navigation": "React Navigation 7",
  "state": "Zustand",
  "api": "TanStack Query v5",
  "speech-to-text": "expo-speech-recognition",
  "text-to-speech": "expo-speech",
  "auth": "expo-auth-session",
  "storage": "expo-secure-store",
  "notifications": "expo-notifications"
}
```

### Backend (Optional Proxy)
```json
{
  "runtime": "Node.js 20",
  "framework": "Fastify or Express",
  "api-client": "@anthropic-ai/sdk",
  "database": "PostgreSQL (Neon/Supabase)",
  "auth": "JWT with refresh tokens",
  "deployment": "Vercel or Railway"
}
```

### Development Tools
```json
{
  "version-control": "Git + GitHub",
  "ci-cd": "Expo EAS Build + GitHub Actions",
  "testing": "Jest + React Native Testing Library",
  "linting": "ESLint + Prettier",
  "type-checking": "TypeScript strict mode"
}
```

---

## Cost Estimation

### Development Costs (Time)
- Developer time: ~6 weeks full-time
- Design time: ~1 week (UI/UX)
- Testing/QA: ~1 week
- **Total:** ~8 weeks

### Infrastructure Costs (Monthly)
**Scenario A: Using backend proxy**
- Vercel/Railway hosting: $0-20 (hobby tier)
- Database (Supabase): $0-25 (free tier → pro)
- Anthropic API: $0.50-50 (usage-based, ~$0.015/1K tokens)
- **Total:** $0-100/month for <100 users

**Scenario B: Direct API (no proxy)**
- Expo hosting: Free
- User pays for their own API keys
- **Total:** $0/month

### Optional Enhanced Features
- OpenAI Whisper STT: ~$6/month (100 users × 10min/month)
- ElevenLabs TTS: ~$30/month (100 users × 1000 chars/month)
- Premium voice: ~$36/month additional

**Recommendation:** Start with on-device speech (free), upgrade based on user demand.

---

## Risks & Mitigations

### Risk 1: Cursor API Access Denied
**Probability:** High
**Impact:** High
**Mitigation:**
- Design for generic agent interface
- Pivot to Anthropic Claude API (official)
- Build for local agent connection (SSH)

### Risk 2: Speech Recognition Accuracy
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Show live transcript for correction
- Allow text input as fallback
- Upgrade to cloud STT if needed

### Risk 3: User Adoption
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Beta test with small group first
- Collect feedback early
- Iterate on voice UX
- Provide manual controls too

### Risk 4: API Costs Scale Unexpectedly
**Probability:** Low
**Impact:** High
**Mitigation:**
- Set usage limits per user
- Cache responses aggressively
- Offer free tier (5 agents/month)
- Premium tier for heavy users

---

## Success Metrics

### MVP Success Criteria
- [ ] 50+ beta testers signed up
- [ ] 80%+ successful voice command recognition
- [ ] <2s latency for voice → action
- [ ] 4+ star rating on TestFlight
- [ ] 70%+ weekly active usage (of installed users)

### Growth Metrics
- Monthly active users (MAU)
- Voice commands per user per week
- Agent creation rate
- User retention (Day 1, 7, 30)
- App Store rating

---

## Next Steps (Immediate)

1. **Decision Point: API Choice**
   - [ ] Contact Cursor for official mobile API access
   - [ ] Evaluate Anthropic Claude Code API capabilities
   - [ ] Decide: Cursor vs Claude vs Generic Interface

2. **Technical Validation**
   - [ ] Build speech POC (STT → command parser → mock response → TTS)
   - [ ] Test on iOS and Android devices
   - [ ] Measure latency and accuracy

3. **Design Phase**
   - [ ] Create high-fidelity mockups (Figma)
   - [ ] Define voice interaction flows
   - [ ] Design error states & edge cases

4. **Project Setup**
   - [ ] Create Expo project: `npx create-expo-app voice-agent-app`
   - [ ] Set up GitHub repository
   - [ ] Configure CI/CD (Expo EAS)
   - [ ] Create project board (GitHub Projects)

---

## Appendix: Alternative Approaches

### Alternative 1: Web App with Web Speech API
Skip mobile app, build PWA instead.

**Pros:**
- Faster to build (2 weeks vs 6)
- Works on desktop too
- No app store approval

**Cons:**
- Speech API less reliable on mobile browsers
- No push notifications on iOS PWA
- No offline capability
- Worse UX than native

### Alternative 2: Desktop Electron App
Build for desktop instead of mobile.

**Pros:**
- Better for developers (primary use case)
- Easier to integrate with local dev tools
- No mobile speech challenges

**Cons:**
- Less portable
- Defeats "away from desk" use case

### Alternative 3: CLI with Voice Plugin
Add voice commands to existing CLI tools.

**Pros:**
- Integrates with existing workflow
- No new app to learn
- Can use system speech APIs

**Cons:**
- Requires terminal open
- Not mobile

**DECISION:** Stick with mobile app - best for "away from desk" use case.

---

## References & Resources

### Cursor Agents Analysis
- See: `CURSOR_AGENTS_ANALYSIS.md`
- See: `MOBILE_APP_REVERSE_ENGINEERING.md`
- PR: #35

### Technical Documentation
- Expo Speech: https://docs.expo.dev/versions/latest/sdk/speech/
- React Navigation: https://reactnavigation.org/
- Anthropic API: https://docs.anthropic.com/
- TanStack Query: https://tanstack.com/query/latest

### Design Inspiration
- Cursor mobile concepts
- GitHub Mobile app
- Voice assistant UX patterns

---

**Document Version:** 1.0
**Last Updated:** 2024-12-18
**Author:** Claude (Anthropic)
**Status:** Planning Phase ✅
