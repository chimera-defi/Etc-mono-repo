# Building on PR #35: From Analysis to Implementation

> How we're leveraging PR #35's Cursor Agents research to build a voice-enabled mobile AI agent app

---

## TL;DR

**PR #35** reverse-engineered Cursor's agent platform to understand how cloud-based AI coding agents work.
**This project** takes that knowledge and builds a mobile app with voice commands to control similar agents.

---

## What PR #35 Discovered

### 1. Cursor Agents Technology Stack

From `CURSOR_AGENTS_ANALYSIS.md` (PR #35), we learned Cursor uses:

| Component | Technology | Our Adaptation |
|-----------|-----------|----------------|
| **Frontend** | Next.js 14 + React 18 | **React Native + Expo** (mobile-first) |
| **Styling** | Tailwind CSS | **React Native Paper/Tamagui** (native components) |
| **Real-time** | Pusher WebSockets | **Pusher** or **Supabase Realtime** (reuse pattern) |
| **Hosting** | Vercel | **Vercel** or **Railway** (same deployment model) |
| **Auth** | WorkOS + Authenticator | **OAuth PKCE** (mobile-optimized) |
| **Backend API** | Edge functions | **Fastify/Express** (Node.js backend) |
| **Storage** | AWS S3 | **AWS S3** (same for logs/artifacts) |

### 2. API Endpoints Discovered

PR #35 reverse-engineered these endpoints:

```
POST /api/auth/startBackgroundComposerFromSnapshot
POST /api/background-composer/get-detailed-composer
POST /api/background-composer/pause
POST /api/dashboard/get-user-privacy-mode
```

**How we're using this:**
- Mapped to our own API design
- Similar naming patterns: `/api/agents/create`, `/api/agents/pause`
- Added mobile-specific endpoints: `/api/auth/exchange`, `/api/push/register`

### 3. Agent Status States

PR #35 found these agent states:
```
UNSPECIFIED → CREATING → RUNNING → FINISHED
                           ↓
                         ERROR
                           ↓
                        EXPIRED
```

**How we're using this:**
- Adopted the same state machine
- Added UI for each state (see `mocks/UI_WIREFRAMES.md`)
- Voice responses tailored to each state:
  - "Your agent is running" (RUNNING)
  - "Your agent has finished!" (FINISHED)
  - "There was an error with your agent" (ERROR)

### 4. Real-time Update Pattern

PR #35 discovered Cursor uses **Pusher** for WebSocket updates.

**How we're reusing this:**
```typescript
// From PR #35 analysis
CSP: "connect-src *.pusher.com wss://*.pusher.com"

// Our implementation (same pattern)
import Pusher from 'pusher-js/react-native';

pusher.subscribe(`agent-${agentId}`);
channel.bind('status-update', (data) => {
  updateAgentState(data);
});
```

---

## What We're Adding

### 1. Voice Interface (New)

PR #35 analyzed a **web dashboard**. We're adding:

```
Web Interface (PR #35)          Mobile Voice (Our App)
├─ Keyboard & mouse input  →    ├─ Voice commands
├─ Click buttons           →    ├─ Speech-to-text
├─ Read text on screen     →    └─ Text-to-speech
```

**New components:**
- `SpeechRecognitionService` (STT)
- `TextToSpeechService` (TTS)
- `CommandParser` (NLU)
- `VoiceInterfaceScreen` (UI)

### 2. Mobile-Optimized Architecture (New)

```
Cursor Web App (PR #35)         Our Mobile App
┌────────────────────┐          ┌─────────────────────┐
│  Next.js SSR       │          │  React Native       │
│  Browser-based     │          │  Native mobile      │
│  Desktop-first     │          │  Touch + voice      │
│  No offline mode   │          │  Offline-capable    │
└────────────────────┘          └─────────────────────┘
```

### 3. Speech-First UX (New)

**Traditional flow (PR #35):**
```
User → Types in form → Clicks "Create" → Waits → Sees result
```

**Our voice flow:**
```
User → Speaks command → Hears confirmation → Gets push notification → Speaks to view
```

Example:
```
🗣️ "Start an agent on wallet-frontend to add dark mode"
   ↓
🤖 "I've started an agent. I'll let you know when it's done."
   ↓ (5 minutes later)
📱 Push: "Your agent has finished!"
   ↓
🗣️ "Tell me about it"
   ↓
🤖 "Your agent added dark mode and created PR #245."
```

---

## Direct Reuse from PR #35

### 1. Agent Creation Flow

**From PR #35's `MOBILE_APP_REVERSE_ENGINEERING.md`:**

```typescript
// Discovered pattern
POST /api/auth/startBackgroundComposerFromSnapshot
{
  bcId: uuid,
  repoUrl: "github.com/owner/repo",
  prompt: "Fix the bug in...",
  modelDetails: { modelName: "claude-3.5-sonnet" },
  baseBranch: "main",
  source: "IOS_APP"  // ← This was discovered but unused!
}
```

**Our implementation (same structure):**

```typescript
// apps/mobile-speech-agent/src/services/api/AgentApiService.ts
async createAgent(request: CreateAgentRequest) {
  return this.request('/api/agents/create', {
    method: 'POST',
    body: JSON.stringify({
      id: generateUUID(),
      repoUrl: request.repoUrl,
      task: request.task,  // "prompt" renamed for clarity
      model: request.model || 'claude-3.5-sonnet',
      branch: request.branch || 'main',
      source: 'MOBILE_APP',  // Using the pattern PR #35 found!
    }),
  });
}
```

### 2. Privacy Mode API

**From PR #35:**
```
POST /api/dashboard/get-user-privacy-mode
POST /api/dashboard/set-user-privacy-mode
```

**Our adaptation:**
```typescript
// Direct reuse
async getPrivacyMode() {
  return this.request('/api/privacy/get');
}

async setPrivacyMode(mode: PrivacyMode) {
  return this.request('/api/privacy/set', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}
```

Integrated into Settings screen (see `mocks/UI_WIREFRAMES.md` → Settings Screen).

### 3. Agent States & Progress

**From PR #35 analysis:**

```typescript
// Protobuf enum discovered in Cursor's code
enum Status {
  UNSPECIFIED = 0,
  CREATING = 1,
  RUNNING = 2,
  FINISHED = 3,
  ERROR = 4,
  EXPIRED = 5,
}
```

**Our direct reuse:**

```typescript
// apps/mobile-speech-agent/src/types/agent.types.ts
export type AgentStatus =
  | 'CREATING'
  | 'RUNNING'
  | 'FINISHED'
  | 'ERROR'
  | 'EXPIRED';

export interface Agent {
  id: string;
  status: AgentStatus;  // ← Same states
  progress?: number;    // ← Same concept
  // ... other fields
}
```

### 4. Real-time Architecture

**From PR #35's infrastructure analysis:**

```
Cursor Architecture:
┌──────────────┐
│ Next.js App  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Pusher     │────>│  Agent VMs   │
│  WebSocket   │     │  *.cvm.dev   │
└──────────────┘     └──────────────┘
```

**Our architecture (same pattern):**

```
Our Architecture:
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Pusher     │────>│  Backend     │
│  WebSocket   │     │  + Claude    │
└──────────────┘     └──────────────┘
```

Code example:
```typescript
// Using Pusher (same as PR #35)
import Pusher from 'pusher-js/react-native';

export class PusherService {
  private pusher: Pusher;

  constructor(appKey: string, cluster: string) {
    this.pusher = new Pusher(appKey, {
      cluster,  // Same config as Cursor
      encrypted: true,
    });
  }

  subscribeToAgent(agentId: string, onUpdate: (data: any) => void) {
    const channel = this.pusher.subscribe(`agent-${agentId}`);
    channel.bind('status-update', onUpdate);  // Same event name pattern
  }
}
```

---

## Comparison Table

| Aspect | PR #35 (Cursor Analysis) | Our Mobile App | Change Type |
|--------|--------------------------|----------------|-------------|
| **Platform** | Web (Next.js) | Mobile (React Native) | **Adapted** |
| **Input** | Keyboard/Mouse | Voice + Touch | **New** |
| **Output** | Visual only | Visual + Speech | **New** |
| **API Endpoints** | Reverse-engineered | Custom (inspired by) | **Adapted** |
| **Agent States** | CREATING/RUNNING/etc. | Same states | **Reused** |
| **Real-time** | Pusher WebSockets | Pusher WebSockets | **Reused** |
| **Auth** | WorkOS + Cloudflare | OAuth PKCE | **Adapted** |
| **Backend** | Vercel Edge | Vercel/Railway Node | **Adapted** |
| **Database** | Unknown (inferred) | PostgreSQL | **New** |
| **Agent Source** | WEBSITE, IOS_APP enum | MOBILE_APP | **Reused Pattern** |
| **Hosting** | Vercel | Vercel + EAS | **Adapted** |

---

## Key Insights from PR #35 That Shaped Our Design

### 1. The `IOS_APP` Source Enum

**PR #35 found this in Cursor's code:**

```typescript
enum Source {
  WEBSITE = 0,
  IOS_APP = 1,  // ← This exists but no public iOS app!
}
```

**Our takeaway:**
- Cursor planned for mobile but hasn't released it
- This validates our idea
- We're building what they hinted at!

### 2. Cloud VM Architecture

**From PR #35:**
> "Agents run in remote VMs (`*.cvm.dev`), not locally"

**Our decision:**
- Don't try to run agents on-device
- Use backend proxy to orchestrate
- Mobile app is a **controller**, not executor
- Keeps battery life good, processing in cloud

### 3. Subscription-Based Model

**From PR #35:**
> "Free tier has limited agent usage, Trial users have restrictions"

**Our design:**
```typescript
// User preferences (from PR #35 analysis)
interface UserPreferences {
  tier: 'free' | 'pro' | 'business';
  agentLimit: number;
  modelsAvailable: string[];
}

// Free tier: 5 agents/month
// Pro tier: Unlimited with usage billing
// Business tier: Team management + priority
```

### 4. GitHub-Centric Workflow

**From PR #35:**
> "Agents work on GitHub repos exclusively"

**Our adaptation:**
- Repository selector as core UI
- GitHub OAuth for auth
- PR creation as primary outcome
- But also: local repo support (future)

---

## Evolution Beyond PR #35

### What PR #35 Analyzed
```
cursor.com/agents
    │
    ├─ Web dashboard
    ├─ Mouse & keyboard
    ├─ Desktop browser
    └─ Visual feedback only
```

### What We're Building
```
Mobile Voice Agent App
    │
    ├─ Native mobile app (iOS + Android)
    ├─ Voice commands (STT)
    ├─ Spoken responses (TTS)
    ├─ Touch interface (fallback)
    ├─ Push notifications
    ├─ Offline mode (view cached data)
    └─ Hands-free operation
```

---

## File Mapping: PR #35 → Our Project

| PR #35 File | Our File | Relationship |
|-------------|----------|--------------|
| `CURSOR_AGENTS_ANALYSIS.md` | `docs/BUILDING_ON_PR35.md` | **References** |
| `MOBILE_APP_REVERSE_ENGINEERING.md` | `docs/MOBILE_SPEECH_AGENT_APP_PLAN.md` | **Implements ideas from** |
| `cursor_agents_screenshot.png` | `mocks/UI_WIREFRAMES.md` | **Inspired UI design** |
| (No mobile app existed) | `architecture/ARCHITECTURE_DIAGRAMS.md` | **New (fills gap)** |
| (API patterns discovered) | `src/services/api/AgentApiService.ts` | **Implements similar API** |
| (Real-time via Pusher) | `src/services/realtime/PusherService.ts` | **Direct reuse** |

---

## Code Reuse Examples

### Example 1: Agent Status Badge

**Inspired by PR #35's discovered states:**

```typescript
// apps/mobile-speech-agent/src/components/agents/AgentStatusBadge.tsx

import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  status: AgentStatus;  // From PR #35 research
}

export function AgentStatusBadge({ status }: Props) {
  const config = {
    CREATING: { color: '#FFA000', icon: '⏳', label: 'Creating' },
    RUNNING: { color: '#0066FF', icon: '●', label: 'Running' },
    FINISHED: { color: '#00C853', icon: '✓', label: 'Finished' },
    ERROR: { color: '#FF3B30', icon: '⚠️', label: 'Error' },
    EXPIRED: { color: '#999999', icon: '⏱️', label: 'Expired' },
  }[status];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 16 }}>{config.icon}</Text>
      <Text style={{ color: config.color, marginLeft: 4 }}>
        {config.label}
      </Text>
    </View>
  );
}
```

### Example 2: Pusher Integration

**Direct pattern reuse from PR #35:**

```typescript
// apps/mobile-speech-agent/src/hooks/useRealtimeAgent.ts

import { useEffect } from 'react';
import { pusherService } from '@/services/realtime/PusherService';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeAgent(agentId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to agent updates (Pusher pattern from PR #35)
    pusherService.subscribeToAgent(agentId, (data) => {
      // Update React Query cache (our addition for React Native)
      queryClient.setQueryData(['agents', agentId], (old) => ({
        ...old,
        ...data,
      }));
    });

    return () => {
      pusherService.unsubscribeFromAgent(agentId);
    };
  }, [agentId, queryClient]);
}
```

---

## Lessons Learned from PR #35

### 1. Don't Reinvent the Wheel

**PR #35 showed:** Cursor uses proven tech (Next.js, Pusher, Vercel)

**Our approach:** Use similar proven mobile tech (React Native, Expo, Pusher)

### 2. Real-time is Critical

**PR #35 emphasized:** WebSocket updates for agent progress

**Our implementation:** Same Pusher pattern + push notifications for background

### 3. Simple State Machine

**PR #35 revealed:** Only 5 states (CREATING → RUNNING → FINISHED/ERROR/EXPIRED)

**Our decision:** Keep it simple, don't over-engineer states

### 4. GitHub Integration is Key

**PR #35 showed:** Cursor is GitHub-centric

**Our choice:** Make GitHub OAuth primary auth, repos as first-class objects

---

## What's Different (And Why)

| Decision | PR #35 (Cursor) | Our App | Reason for Difference |
|----------|-----------------|---------|----------------------|
| **Platform** | Web | Mobile | Target use case: away from desk |
| **Input** | Text forms | Voice | Hands-free operation |
| **Output** | Visual | Visual + Speech | Accessibility + multitasking |
| **Offline** | None | View cached | Mobile connectivity varies |
| **Auth** | WorkOS (enterprise) | OAuth PKCE | Consumer mobile app |
| **Backend** | Proprietary | Open source | We don't have Cursor's infra |
| **Agent API** | Cursor's API | Anthropic/OpenAI | No official Cursor mobile API |

---

## Timeline: PR #35 to Our App

```
December 2024
    │
    ├─ PR #35: "Investigate Cursor Agents Website"
    │   │
    │   ├─ Reverse-engineer cursor.com/agents
    │   ├─ Analyze tech stack
    │   ├─ Document API endpoints
    │   └─ Discover mobile hints (IOS_APP enum)
    │
    ▼
December 2024 (Now)
    │
    └─ Our Project: "Mobile Speech Agent App"
        │
        ├─ Comprehensive planning (DONE)
        ├─ UI mockups (DONE)
        ├─ Architecture diagrams (DONE)
        ├─ Reuse PR #35 patterns (DONE)
        └─ Implementation (NEXT)
            │
            ├─ Week 1-2: Foundation
            ├─ Week 3: Speech integration
            ├─ Week 4: API integration
            ├─ Week 5: Core features
            └─ Week 6: Launch
```

---

## Summary: How We're Maximizing Reuse

### Direct Reuse (80% confidence)
1. ✅ Agent status states (CREATING, RUNNING, etc.)
2. ✅ Pusher real-time pattern
3. ✅ API endpoint naming conventions
4. ✅ Privacy mode concept
5. ✅ GitHub-centric workflow

### Adapted Reuse (adaptations needed)
6. ✅ Web → Mobile platform shift
7. ✅ OAuth WorkOS → OAuth PKCE
8. ✅ Vercel Edge → Vercel/Railway Node.js
9. ✅ Browser UI → Native mobile UI

### New Additions (inspired by PR #35 gaps)
10. ✅ Voice interface (STT + TTS)
11. ✅ Push notifications
12. ✅ Offline mode
13. ✅ Mobile-optimized UX

---

## Next Steps

1. **Reference PR #35** in all API design decisions
2. **Test against Cursor's patterns** for compatibility
3. **Document deviations** when we differ from PR #35's findings
4. **Keep analyzing** Cursor updates (they may release mobile!)

---

**Conclusion:**

PR #35 gave us the blueprint. We're building the mobile evolution.

**Think of it as:**
- **PR #35** = Research & Analysis
- **This project** = Design & Implementation

---

**Document Version:** 1.0
**Last Updated:** 2024-12-18
**Related:** PR #35, CURSOR_AGENTS_ANALYSIS.md, MOBILE_APP_REVERSE_ENGINEERING.md
