# Mobile Speech Agent App - Technical Architecture

## System Overview

This document provides detailed technical architecture for the voice-enabled AI agent mobile application.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App (React Native)                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Presentation Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │ │
│  │  │  Voice   │  │  Agents  │  │  Repos   │  │  Settings  │ │ │
│  │  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen    │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Business Logic                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   Speech     │  │    Agent     │  │   Command       │  │ │
│  │  │   Manager    │  │   Service    │  │   Parser        │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                       Data Layer                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   State      │  │   API        │  │   Local         │  │ │
│  │  │   (Zustand)  │  │   Client     │  │   Storage       │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Proxy (Optional)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               Fastify/Express Server                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   Auth       │  │    Agent     │  │   WebSocket     │  │ │
│  │  │   Manager    │  │   Proxy      │  │   Handler       │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               PostgreSQL Database                           │ │
│  │  - User profiles          - API keys (encrypted)            │ │
│  │  - Agent history          - Usage metrics                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Anthropic   │  │    GitHub    │  │   Pusher (RT)       │   │
│  │  Claude API  │  │    API       │  │   or Supabase RT    │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Voice Command Flow

```
┌──────────┐
│  User    │
│  speaks  │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Speech Capture (expo-speech-recognition)                 │
│    - Microphone permission check                            │
│    - Start audio capture                                    │
│    - Stream to device STT engine                            │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Transcription (On-Device or Cloud)                       │
│    Device: SFSpeech (iOS) / Android SpeechRecognizer        │
│    Cloud:  OpenAI Whisper / Google STT (optional)           │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼ transcript: string
┌─────────────────────────────────────────────────────────────┐
│ 3. Command Parsing                                          │
│    - Identify intent (status/create/control/query)          │
│    - Extract entities (repo, branch, task)                  │
│    - Validate command                                       │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼ command: VoiceCommand
┌─────────────────────────────────────────────────────────────┐
│ 4. API Request                                              │
│    - Build request payload                                  │
│    - Add auth headers                                       │
│    - Send to backend/API                                    │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼ response: AgentData
┌─────────────────────────────────────────────────────────────┐
│ 5. Response Formatting                                      │
│    - Convert JSON to natural language                       │
│    - Format for speech output                               │
│    - Update UI state                                        │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼ speechText: string
┌─────────────────────────────────────────────────────────────┐
│ 6. Text-to-Speech (expo-speech)                             │
│    - Queue speech synthesis                                 │
│    - Play audio to user                                     │
│    - Show visual feedback                                   │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│   User   │
│  hears   │
│ response │
└──────────┘
```

### Agent Creation Flow

```
User: "Start an agent on wallet-frontend to add dark mode"
  │
  ├─ Speech capture → "start an agent on wallet frontend to add dark mode"
  │
  ├─ Parse command
  │    Intent: CREATE_AGENT
  │    Repo: wallet-frontend
  │    Task: add dark mode
  │    Branch: (infer from defaults or ask)
  │
  ├─ Validate inputs
  │    ✓ Repo exists
  │    ✓ User has access
  │    ? Branch specified? → Default to "main"
  │
  ├─ Build API request
  │    POST /api/agents/create
  │    {
  │      repoUrl: "github.com/user/wallet-frontend",
  │      branch: "main",
  │      task: "Add dark mode theme support",
  │      model: "claude-3.5-sonnet"
  │    }
  │
  ├─ API response
  │    {
  │      agentId: "agent_abc123",
  │      status: "CREATING",
  │      branch: "claude/dark-mode-xyz789",
  │      estimatedTime: "5-10 minutes"
  │    }
  │
  ├─ Format response
  │    "I've started an agent on wallet-frontend to add dark mode.
  │     It's working on branch claude/dark-mode-xyz789.
  │     I'll notify you when it's done."
  │
  └─ Speak response
       TTS → User hears confirmation
```

---

## Component Architecture

### React Native App Structure

```
voice-agent-app/
├── app.json                 # Expo config
├── package.json
├── tsconfig.json
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── voice/
│   │   │   ├── VoiceButton.tsx
│   │   │   ├── WaveformVisualizer.tsx
│   │   │   ├── TranscriptDisplay.tsx
│   │   │   └── SpeakingIndicator.tsx
│   │   │
│   │   ├── agents/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentStatusBadge.tsx
│   │   │   ├── AgentLogViewer.tsx
│   │   │   └── CreateAgentForm.tsx
│   │   │
│   │   └── layout/
│   │       ├── Screen.tsx
│   │       ├── Header.tsx
│   │       └── TabBar.tsx
│   │
│   ├── screens/             # Screen components
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   │
│   │   ├── voice/
│   │   │   └── VoiceInterfaceScreen.tsx
│   │   │
│   │   ├── agents/
│   │   │   ├── AgentsListScreen.tsx
│   │   │   ├── AgentDetailScreen.tsx
│   │   │   └── CreateAgentScreen.tsx
│   │   │
│   │   ├── repositories/
│   │   │   ├── ReposListScreen.tsx
│   │   │   └── RepoDetailScreen.tsx
│   │   │
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── VoiceSettingsScreen.tsx
│   │       └── AccountScreen.tsx
│   │
│   ├── navigation/          # Navigation config
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   │
│   ├── services/            # Business logic
│   │   ├── speech/
│   │   │   ├── SpeechRecognitionService.ts
│   │   │   ├── TextToSpeechService.ts
│   │   │   └── CommandParser.ts
│   │   │
│   │   ├── api/
│   │   │   ├── AgentApiService.ts
│   │   │   ├── RepoApiService.ts
│   │   │   └── AuthApiService.ts
│   │   │
│   │   └── storage/
│   │       ├── SecureStorage.ts
│   │       └── LocalStorage.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useSpeechRecognition.ts
│   │   ├── useTextToSpeech.ts
│   │   ├── useAgents.ts
│   │   ├── useAuth.ts
│   │   └── useVoiceCommands.ts
│   │
│   ├── store/               # State management (Zustand)
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── agentsSlice.ts
│   │   │   ├── speechSlice.ts
│   │   │   └── settingsSlice.ts
│   │   └── middleware/
│   │       └── persistence.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── agent.types.ts
│   │   ├── speech.types.ts
│   │   ├── api.types.ts
│   │   └── navigation.types.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── config/              # App configuration
│   │   ├── api.config.ts
│   │   ├── speech.config.ts
│   │   └── navigation.config.ts
│   │
│   └── App.tsx              # Root component
│
└── assets/                  # Static assets
    ├── images/
    ├── icons/
    └── sounds/
        └── ping.mp3         # Voice activation sound
```

---

## Core Services Implementation

### 1. Speech Recognition Service

```typescript
// src/services/speech/SpeechRecognitionService.ts

import * as Speech from 'expo-speech-recognition';
import { EventEmitter } from 'events';

export interface TranscriptResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export class SpeechRecognitionService extends EventEmitter {
  private isInitialized = false;
  private isListening = false;

  async initialize() {
    // Request permissions
    const { status } = await Speech.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission denied');
    }

    // Check availability
    const available = await Speech.getAvailableVoicesAsync();
    if (!available) {
      throw new Error('Speech recognition not available');
    }

    this.isInitialized = true;
  }

  async startListening(options?: {
    language?: string;
    continuous?: boolean;
  }) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    const { language = 'en-US', continuous = false } = options || {};

    Speech.start({
      lang: language,
      interimResults: true,
      maxAlternatives: 1,
      continuous,
    });

    Speech.addSpeechRecognitionListener((event) => {
      if (event.results) {
        const result = event.results[0];
        this.emit('transcript', {
          transcript: result.transcript,
          isFinal: result.isFinal,
          confidence: result.confidence,
        } as TranscriptResult);

        if (result.isFinal) {
          this.emit('finalTranscript', result.transcript);
        }
      }

      if (event.error) {
        this.emit('error', new Error(event.error));
      }
    });

    this.isListening = true;
    this.emit('start');
  }

  stopListening() {
    if (!this.isListening) return;

    Speech.stop();
    this.isListening = false;
    this.emit('stop');
  }

  abort() {
    Speech.abort();
    this.isListening = false;
    this.emit('abort');
  }

  getIsListening() {
    return this.isListening;
  }
}

// Singleton instance
export const speechRecognition = new SpeechRecognitionService();
```

### 2. Text-to-Speech Service

```typescript
// src/services/speech/TextToSpeechService.ts

import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export class TextToSpeechService {
  private isSpeaking = false;
  private queue: Array<{ text: string; options?: SpeechOptions }> = [];

  async speak(text: string, options?: SpeechOptions) {
    const {
      language = 'en-US',
      pitch = 1.0,
      rate = 0.9,
      voice,
      onStart,
      onDone,
      onError,
    } = options || {};

    // Stop current speech if any
    if (this.isSpeaking) {
      await this.stop();
    }

    this.isSpeaking = true;

    try {
      await Speech.speak(text, {
        language,
        pitch,
        rate,
        voice,
        onStart: () => {
          onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          onDone?.();
          this.processQueue();
        },
        onError: (error) => {
          this.isSpeaking = false;
          onError?.(new Error(error.error));
        },
      });
    } catch (error) {
      this.isSpeaking = false;
      throw error;
    }
  }

  queueSpeech(text: string, options?: SpeechOptions) {
    this.queue.push({ text, options });
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.queue.length === 0 || this.isSpeaking) return;

    const next = this.queue.shift();
    if (next) {
      await this.speak(next.text, next.options);
    }
  }

  async stop() {
    await Speech.stop();
    this.isSpeaking = false;
    this.queue = [];
  }

  async pause() {
    await Speech.pause();
  }

  async resume() {
    await Speech.resume();
  }

  getIsSpeaking() {
    return this.isSpeaking;
  }

  async getAvailableVoices() {
    return await Speech.getAvailableVoicesAsync();
  }
}

// Singleton instance
export const textToSpeech = new TextToSpeechService();
```

### 3. Command Parser Service

```typescript
// src/services/speech/CommandParser.ts

export type CommandIntent =
  | 'status_query'
  | 'agent_create'
  | 'agent_control'
  | 'repo_query'
  | 'help'
  | 'unknown';

export type CommandAction =
  | 'list'
  | 'start'
  | 'pause'
  | 'stop'
  | 'resume'
  | 'show';

export interface VoiceCommand {
  intent: CommandIntent;
  action?: CommandAction;
  parameters: {
    repo?: string;
    branch?: string;
    task?: string;
    agentId?: string;
    filter?: string;
  };
  confidence: number;
  originalText: string;
}

export class CommandParser {
  // Keywords for intent detection
  private readonly intentKeywords = {
    status_query: ['status', 'running', 'active', 'list agents'],
    agent_create: ['start', 'create', 'new agent', 'begin'],
    agent_control: ['pause', 'stop', 'resume', 'cancel', 'kill'],
    repo_query: ['repositories', 'repos', 'show repos'],
    help: ['help', 'what can you do', 'commands'],
  };

  // Action keywords
  private readonly actionKeywords = {
    list: ['list', 'show me', 'what are'],
    start: ['start', 'create', 'begin', 'initiate'],
    pause: ['pause', 'hold', 'suspend'],
    stop: ['stop', 'cancel', 'kill', 'terminate'],
    resume: ['resume', 'continue', 'restart'],
    show: ['show', 'display', 'tell me'],
  };

  parse(transcript: string): VoiceCommand {
    const normalized = transcript.toLowerCase().trim();

    // Detect intent
    const intent = this.detectIntent(normalized);

    // Detect action
    const action = this.detectAction(normalized);

    // Extract parameters based on intent
    const parameters = this.extractParameters(normalized, intent);

    // Calculate confidence (simple keyword-based for now)
    const confidence = this.calculateConfidence(normalized, intent);

    return {
      intent,
      action,
      parameters,
      confidence,
      originalText: transcript,
    };
  }

  private detectIntent(text: string): CommandIntent {
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return intent as CommandIntent;
      }
    }
    return 'unknown';
  }

  private detectAction(text: string): CommandAction | undefined {
    for (const [action, keywords] of Object.entries(this.actionKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return action as CommandAction;
      }
    }
    return undefined;
  }

  private extractParameters(
    text: string,
    intent: CommandIntent
  ): VoiceCommand['parameters'] {
    const params: VoiceCommand['parameters'] = {};

    switch (intent) {
      case 'agent_create':
        // Extract repo name
        const repoMatch = text.match(
          /(?:on|for|in)\s+([a-z0-9\-]+(?:\/[a-z0-9\-]+)?)/i
        );
        if (repoMatch) {
          params.repo = repoMatch[1];
        }

        // Extract branch
        const branchMatch = text.match(/(?:branch|on branch)\s+([a-z0-9\-\/]+)/i);
        if (branchMatch) {
          params.branch = branchMatch[1];
        }

        // Extract task (everything after "to")
        const taskMatch = text.match(/to\s+(.+)$/i);
        if (taskMatch) {
          params.task = taskMatch[1];
        }
        break;

      case 'agent_control':
        // Extract agent reference
        const agentMatch = text.match(
          /(?:agent|the)\s+([a-z0-9\-]+)\s+agent/i
        );
        if (agentMatch) {
          params.agentId = agentMatch[1];
        }
        break;

      case 'status_query':
        // Extract filter
        if (text.includes('running')) params.filter = 'running';
        if (text.includes('finished')) params.filter = 'finished';
        if (text.includes('failed')) params.filter = 'failed';
        break;
    }

    return params;
  }

  private calculateConfidence(text: string, intent: CommandIntent): number {
    // Simple confidence based on keyword matches
    const keywords = this.intentKeywords[intent] || [];
    const matches = keywords.filter((k) => text.includes(k)).length;

    if (matches === 0) return 0.3; // Low confidence for unknown
    if (matches === 1) return 0.7; // Medium confidence
    return 0.95; // High confidence for multiple matches
  }

  // Helper to generate suggestions for low confidence commands
  getSuggestions(command: VoiceCommand): string[] {
    if (command.confidence >= 0.7) return [];

    return [
      "Try: 'List my agents'",
      "Try: 'Start an agent on wallet-frontend to add dark mode'",
      "Try: 'What's the status of my agents?'",
      "Try: 'Pause the wallet agent'",
    ];
  }
}

// Singleton instance
export const commandParser = new CommandParser();
```

### 4. Agent API Service

```typescript
// src/services/api/AgentApiService.ts

import { API_BASE_URL } from '@/config/api.config';

export interface Agent {
  id: string;
  repoUrl: string;
  branch: string;
  baseBranch: string;
  task: string;
  status: 'CREATING' | 'RUNNING' | 'FINISHED' | 'ERROR' | 'EXPIRED';
  model: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  error?: string;
  prUrl?: string;
}

export interface CreateAgentRequest {
  repoUrl: string;
  branch?: string;
  task: string;
  model?: string;
}

export class AgentApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async listAgents(filter?: string): Promise<Agent[]> {
    const query = filter ? `?status=${filter}` : '';
    return this.request<Agent[]>(`/api/agents${query}`);
  }

  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>(`/api/agents/${agentId}`);
  }

  async createAgent(request: CreateAgentRequest): Promise<Agent> {
    return this.request<Agent>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async pauseAgent(agentId: string): Promise<void> {
    await this.request(`/api/agents/${agentId}/pause`, { method: 'POST' });
  }

  async resumeAgent(agentId: string): Promise<void> {
    await this.request(`/api/agents/${agentId}/resume`, { method: 'POST' });
  }

  async stopAgent(agentId: string): Promise<void> {
    await this.request(`/api/agents/${agentId}/stop`, { method: 'POST' });
  }

  async getAgentLogs(agentId: string): Promise<string[]> {
    return this.request<string[]>(`/api/agents/${agentId}/logs`);
  }
}

// Singleton instance
export const agentApi = new AgentApiService();
```

---

## State Management Architecture (Zustand)

```typescript
// src/store/index.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { AgentsSlice, createAgentsSlice } from './slices/agentsSlice';
import { SpeechSlice, createSpeechSlice } from './slices/speechSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';

export type AppStore = AuthSlice & AgentsSlice & SpeechSlice & SettingsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createAgentsSlice(...args),
      ...createSpeechSlice(...args),
      ...createSettingsSlice(...args),
    }),
    {
      name: 'voice-agent-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain slices
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);
```

```typescript
// src/store/slices/speechSlice.ts

import { StateCreator } from 'zustand';
import { AppStore } from '..';

export interface SpeechSlice {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastCommand: VoiceCommand | null;

  // Actions
  startListening: () => void;
  stopListening: () => void;
  setTranscript: (text: string) => void;
  setLastCommand: (command: VoiceCommand) => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
}

export const createSpeechSlice: StateCreator<
  AppStore,
  [],
  [],
  SpeechSlice
> = (set, get) => ({
  isListening: false,
  isSpeaking: false,
  transcript: '',
  lastCommand: null,

  startListening: () => {
    speechRecognition.startListening();
    set({ isListening: true });
  },

  stopListening: () => {
    speechRecognition.stopListening();
    set({ isListening: false });
  },

  setTranscript: (text) => {
    set({ transcript: text });
  },

  setLastCommand: (command) => {
    set({ lastCommand: command });
  },

  speak: async (text) => {
    set({ isSpeaking: true });
    try {
      await textToSpeech.speak(text, {
        onDone: () => set({ isSpeaking: false }),
        onError: () => set({ isSpeaking: false }),
      });
    } catch (error) {
      set({ isSpeaking: false });
      throw error;
    }
  },

  stopSpeaking: () => {
    textToSpeech.stop();
    set({ isSpeaking: false });
  },
});
```

---

## API Integration Patterns

### TanStack Query Setup

```typescript
// src/hooks/useAgents.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/services/api/AgentApiService';

// List agents
export function useAgents(filter?: string) {
  return useQuery({
    queryKey: ['agents', filter],
    queryFn: () => agentApi.listAgents(filter),
    refetchInterval: 5000, // Refresh every 5s
  });
}

// Get single agent
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agents', agentId],
    queryFn: () => agentApi.getAgent(agentId),
    refetchInterval: 3000, // Refresh every 3s
  });
}

// Create agent
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentApi.createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

// Pause agent
export function usePauseAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => agentApi.pauseAgent(agentId),
    onSuccess: (_, agentId) => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
```

---

## Real-time Updates Architecture

### Option 1: Pusher (Cursor-style)

```typescript
// src/services/realtime/PusherService.ts

import Pusher from 'pusher-js/react-native';

export class PusherService {
  private pusher: Pusher;
  private channels: Map<string, any> = new Map();

  constructor(appKey: string, cluster: string) {
    this.pusher = new Pusher(appKey, {
      cluster,
      encrypted: true,
    });
  }

  subscribeToAgent(agentId: string, onUpdate: (data: any) => void) {
    const channelName = `agent-${agentId}`;

    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.pusher.subscribe(channelName);

    channel.bind('status-update', onUpdate);
    channel.bind('log-update', onUpdate);

    this.channels.set(channelName, channel);
  }

  unsubscribeFromAgent(agentId: string) {
    const channelName = `agent-${agentId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  disconnect() {
    this.pusher.disconnect();
    this.channels.clear();
  }
}
```

### Option 2: Supabase Realtime (Alternative)

```typescript
// src/services/realtime/SupabaseRealtimeService.ts

import { createClient } from '@supabase/supabase-js';

export class SupabaseRealtimeService {
  private supabase;
  private subscriptions = new Map();

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
  }

  subscribeToAgent(agentId: string, onUpdate: (data: any) => void) {
    const channel = this.supabase
      .channel(`agent-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agents',
          filter: `id=eq.${agentId}`,
        },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();

    this.subscriptions.set(agentId, channel);
  }

  unsubscribeFromAgent(agentId: string) {
    const channel = this.subscriptions.get(agentId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.subscriptions.delete(agentId);
    }
  }
}
```

---

## Security Implementation

### Secure Token Storage

```typescript
// src/services/storage/SecureStorage.ts

import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  async saveToken(key: string, token: string) {
    await SecureStore.setItemAsync(key, token);
  }

  async getToken(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async deleteToken(key: string) {
    await SecureStore.deleteItemAsync(key);
  }

  async saveApiKey(apiKey: string) {
    return this.saveToken('api_key', apiKey);
  }

  async getApiKey(): Promise<string | null> {
    return this.getToken('api_key');
  }

  async deleteApiKey() {
    return this.deleteToken('api_key');
  }
}

export const secureStorage = new SecureStorageService();
```

### OAuth PKCE Flow

```typescript
// src/services/auth/OAuthService.ts

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export class OAuthService {
  private discovery = {
    authorizationEndpoint: 'https://cursor.com/oauth/authorize',
    tokenEndpoint: 'https://cursor.com/oauth/token',
  };

  async login() {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'voiceagent',
    });

    const request = new AuthSession.AuthRequest({
      clientId: 'YOUR_CLIENT_ID',
      scopes: ['agents:read', 'agents:write'],
      redirectUri,
      usePKCE: true, // Important for mobile security
    });

    const result = await request.promptAsync(this.discovery);

    if (result.type === 'success') {
      const { code } = result.params;

      // Exchange code for token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: 'YOUR_CLIENT_ID',
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier!,
          },
        },
        this.discovery
      );

      return tokenResponse.accessToken;
    }

    throw new Error('OAuth failed');
  }
}
```

---

## Performance Optimizations

### 1. Lazy Loading Screens

```typescript
// src/navigation/AppNavigator.tsx

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const AgentsListScreen = lazy(() => import('@/screens/agents/AgentsListScreen'));
const AgentDetailScreen = lazy(() => import('@/screens/agents/AgentDetailScreen'));

function LazyScreen({ component: Component, ...props }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );
}
```

### 2. Image Optimization

```typescript
// Use expo-image for better performance
import { Image } from 'expo-image';

<Image
  source={{ uri: avatarUrl }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### 3. List Virtualization

```typescript
// Use FlashList instead of FlatList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={agents}
  renderItem={({ item }) => <AgentCard agent={item} />}
  estimatedItemSize={100}
/>
```

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// src/services/speech/__tests__/CommandParser.test.ts

import { commandParser } from '../CommandParser';

describe('CommandParser', () => {
  it('should parse agent creation command', () => {
    const result = commandParser.parse(
      'Start an agent on wallet-frontend to add dark mode'
    );

    expect(result.intent).toBe('agent_create');
    expect(result.parameters.repo).toBe('wallet-frontend');
    expect(result.parameters.task).toBe('add dark mode');
  });

  it('should parse status query', () => {
    const result = commandParser.parse('What are my running agents?');

    expect(result.intent).toBe('status_query');
    expect(result.parameters.filter).toBe('running');
  });
});
```

### Integration Tests (React Native Testing Library)

```typescript
// src/screens/voice/__tests__/VoiceInterfaceScreen.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VoiceInterfaceScreen } from '../VoiceInterfaceScreen';

describe('VoiceInterfaceScreen', () => {
  it('should start listening when voice button pressed', async () => {
    const { getByTestId } = render(<VoiceInterfaceScreen />);

    const voiceButton = getByTestId('voice-button');
    fireEvent.press(voiceButton);

    await waitFor(() => {
      expect(getByTestId('listening-indicator')).toBeTruthy();
    });
  });
});
```

### E2E Tests (Detox)

```typescript
// e2e/voiceInterface.test.ts

describe('Voice Interface', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should create agent via voice command', async () => {
    await element(by.id('voice-tab')).tap();
    await element(by.id('voice-button')).tap();

    // Simulate voice input (manual testing required)
    await waitFor(element(by.id('agent-created-message')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
```

---

## Deployment Strategy

### Expo EAS Build

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "[email protected]",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: npm install

      - run: npm run lint
      - run: npm run type-check
      - run: npm test

      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - run: eas build --platform all --non-interactive --no-wait
```

---

## Monitoring & Analytics

### Error Tracking (Sentry)

```typescript
// src/config/sentry.config.ts

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: __DEV__,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});
```

### Analytics (PostHog or Mixpanel)

```typescript
// src/services/analytics/AnalyticsService.ts

import PostHog from 'posthog-react-native';

export class AnalyticsService {
  private posthog: PostHog;

  async initialize() {
    this.posthog = await PostHog.initAsync('YOUR_API_KEY', {
      host: 'https://app.posthog.com',
    });
  }

  trackEvent(event: string, properties?: Record<string, any>) {
    this.posthog.capture(event, properties);
  }

  trackScreen(screenName: string) {
    this.posthog.screen(screenName);
  }

  identifyUser(userId: string, traits?: Record<string, any>) {
    this.posthog.identify(userId, traits);
  }
}
```

---

## Summary

This architecture provides:

- ✅ **Modular design** - Easy to extend and maintain
- ✅ **Type safety** - TypeScript throughout
- ✅ **Testable** - Services are mockable
- ✅ **Performant** - Optimized for mobile
- ✅ **Secure** - Following best practices
- ✅ **Scalable** - Can grow with user base

**Next Steps:** Proceed to implementation phase following the roadmap in `MOBILE_SPEECH_AGENT_APP_PLAN.md`

---

**Document Version:** 1.0
**Last Updated:** 2024-12-18
**Status:** Architecture Complete ✅
