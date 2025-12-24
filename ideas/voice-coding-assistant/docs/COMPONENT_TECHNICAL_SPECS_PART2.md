# Component Technical Specifications - Part 2

> API Services, State Management, Real-time Services, and Storage

---

## 3. API Services

### 3.1 Agent API Service

**File:** `src/services/api/AgentApiService.ts`

**Dependencies:**
```json
{
  "axios": "^1.6.0",
  "axios-retry": "^4.0.0"
}
```

**Implementation:**

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

export interface Agent {
  id: string;
  userId: string;

  // Repository info
  repoUrl: string;
  repoName: string;
  baseBranch: string;
  workBranch: string;

  // Task info
  taskDescription: string;
  model: string;

  // Status
  status: 'CREATING' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ERROR' | 'EXPIRED';
  progress: number; // 0-100
  errorMessage?: string;

  // Results
  prNumber?: number;
  prUrl?: string;
  commitsCount: number;
  filesChanged: number;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  updatedAt: string;

  // Metadata
  metadata?: Record<string, any>;
}

export interface CreateAgentRequest {
  repoUrl: string;
  branch?: string;
  taskDescription: string;
  model?: string;
  options?: {
    autoCreatePR?: boolean;
    runTests?: boolean;
    reviewers?: string[];
  };
}

export interface UpdateAgentRequest {
  status?: Agent['status'];
  taskDescription?: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: string;
  level: 'info' | 'action' | 'error' | 'success';
  message: string;
  metadata?: Record<string, any>;
}

export class AgentApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.API_BASE_URL!) {
    this.baseURL = baseURL;

    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (error handling)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          await this.refreshToken();
          // Retry original request
          return this.client.request(error.config);
        }

        throw this.handleError(error);
      }
    );
  }

  /**
   * List all agents for current user
   */
  async listAgents(filter?: {
    status?: Agent['status'];
    repo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ agents: Agent[]; total: number }> {
    const response = await this.client.get('/agents', {
      params: filter,
    });

    return response.data;
  }

  /**
   * Get single agent by ID
   */
  async getAgent(agentId: string): Promise<Agent> {
    const response = await this.client.get(`/agents/${agentId}`);
    return response.data;
  }

  /**
   * Create new agent
   */
  async createAgent(request: CreateAgentRequest): Promise<Agent> {
    const response = await this.client.post('/agents', {
      repoUrl: request.repoUrl,
      branch: request.branch || 'main',
      taskDescription: request.taskDescription,
      model: request.model || 'claude-3.5-sonnet',
      options: request.options || {},
      source: 'MOBILE_APP', // Track that it came from mobile
    });

    return response.data;
  }

  /**
   * Update agent
   */
  async updateAgent(
    agentId: string,
    request: UpdateAgentRequest
  ): Promise<Agent> {
    const response = await this.client.patch(`/agents/${agentId}`, request);
    return response.data;
  }

  /**
   * Pause agent
   */
  async pauseAgent(agentId: string): Promise<void> {
    await this.client.post(`/agents/${agentId}/pause`);
  }

  /**
   * Resume agent
   */
  async resumeAgent(agentId: string): Promise<void> {
    await this.client.post(`/agents/${agentId}/resume`);
  }

  /**
   * Stop agent
   */
  async stopAgent(agentId: string): Promise<void> {
    await this.client.post(`/agents/${agentId}/stop`);
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    await this.client.delete(`/agents/${agentId}`);
  }

  /**
   * Get agent logs
   */
  async getAgentLogs(
    agentId: string,
    options?: {
      level?: AgentLog['level'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: AgentLog[]; total: number }> {
    const response = await this.client.get(`/agents/${agentId}/logs`, {
      params: options,
    });

    return response.data;
  }

  /**
   * Send follow-up instruction to running agent
   */
  async sendFollowUp(
    agentId: string,
    instruction: string
  ): Promise<void> {
    await this.client.post(`/agents/${agentId}/followup`, {
      instruction,
    });
  }

  /**
   * Get agent statistics
   */
  async getStats(): Promise<{
    total: number;
    running: number;
    finished: number;
    failed: number;
  }> {
    const response = await this.client.get('/agents/stats');
    return response.data;
  }

  /**
   * Get auth token from secure storage
   */
  private async getAuthToken(): Promise<string | null> {
    const { secureStorage } = await import('../storage/SecureStorage');
    return await secureStorage.getToken('jwt');
  }

  /**
   * Refresh auth token
   */
  private async refreshToken(): Promise<void> {
    const { secureStorage } = await import('../storage/SecureStorage');
    const refreshToken = await secureStorage.getToken('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.baseURL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    await secureStorage.saveToken('jwt', accessToken);
    await secureStorage.saveToken('refresh_token', newRefreshToken);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.message;
      const statusCode = error.response.status;

      return new APIError(message, statusCode, error.response.data);
    } else if (error.request) {
      // Request made but no response
      return new NetworkError('No response from server');
    } else {
      // Error setting up request
      return new Error(error.message);
    }
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Network Error class
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

---

## 4. State Management (Zustand)

### 4.1 Main Store

**File:** `src/store/index.ts`

**Dependencies:**
```json
{
  "zustand": "^4.5.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

**Implementation:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Agent } from '../services/api/AgentApiService';
import type { VoiceCommand } from '../services/speech/CommandParser';

// Slices
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
      partialize: (state) => ({
        // Only persist specific slices
        user: state.user,
        settings: {
          voiceEnabled: state.voiceEnabled,
          voiceSpeed: state.voiceSpeed,
          voiceType: state.voiceType,
          autoSpeak: state.autoSpeak,
          language: state.language,
          defaultModel: state.defaultModel,
        },
      }),
    }
  )
);
```

### 4.2 Speech Slice

**File:** `src/store/slices/speechSlice.ts`

```typescript
import { StateCreator } from 'zustand';
import type { AppStore } from '..';
import type { VoiceCommand } from '../../services/speech/CommandParser';
import { speechRecognition } from '../../services/speech/SpeechRecognitionService';
import { textToSpeech } from '../../services/speech/TextToSpeechService';

export interface SpeechSlice {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  lastCommand: VoiceCommand | null;
  commandHistory: VoiceCommand[];
  voiceError: string | null;

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<VoiceCommand>;
  cancelListening: () => void;
  setTranscript: (text: string) => void;
  setLastCommand: (command: VoiceCommand) => void;
  speak: (text: string, interrupt?: boolean) => Promise<void>;
  stopSpeaking: () => void;
  clearError: () => void;
  clearHistory: () => void;
}

export const createSpeechSlice: StateCreator<
  AppStore,
  [],
  [],
  SpeechSlice
> = (set, get) => ({
  // Initial state
  isListening: false,
  isSpeaking: false,
  transcript: '',
  lastCommand: null,
  commandHistory: [],
  voiceError: null,

  // Start listening
  startListening: async () => {
    try {
      set({ isListening: true, transcript: '', voiceError: null });

      await speechRecognition.initialize();

      // Set up event listeners
      speechRecognition.on('transcript', (result) => {
        set({ transcript: result.transcript });
      });

      speechRecognition.on('error', (error) => {
        set({
          isListening: false,
          voiceError: error.message,
        });
      });

      await speechRecognition.startListening();
    } catch (error) {
      set({
        isListening: false,
        voiceError: (error as Error).message,
      });
    }
  },

  // Stop listening
  stopListening: async () => {
    try {
      const result = await speechRecognition.stopListening();

      set({
        isListening: false,
        transcript: result.transcript,
      });

      return result;
    } catch (error) {
      set({
        isListening: false,
        voiceError: (error as Error).message,
      });
      throw error;
    }
  },

  // Cancel listening
  cancelListening: () => {
    speechRecognition.cancel();
    set({
      isListening: false,
      transcript: '',
    });
  },

  // Set transcript
  setTranscript: (text) => {
    set({ transcript: text });
  },

  // Set last command
  setLastCommand: (command) => {
    const { commandHistory } = get();

    set({
      lastCommand: command,
      commandHistory: [...commandHistory, command].slice(-50), // Keep last 50
    });
  },

  // Speak text
  speak: async (text, interrupt = false) => {
    try {
      set({ isSpeaking: true, voiceError: null });

      const { voiceSpeed, voiceType } = get();

      await textToSpeech.speak(text, {
        rate: voiceSpeed,
        voice: voiceType,
        onDone: () => {
          set({ isSpeaking: false });
        },
        onError: (error) => {
          set({
            isSpeaking: false,
            voiceError: error.message,
          });
        },
      });
    } catch (error) {
      set({
        isSpeaking: false,
        voiceError: (error as Error).message,
      });
    }
  },

  // Stop speaking
  stopSpeaking: () => {
    textToSpeech.stop();
    set({ isSpeaking: false });
  },

  // Clear error
  clearError: () => {
    set({ voiceError: null });
  },

  // Clear history
  clearHistory: () => {
    set({ commandHistory: [] });
  },
});
```

### 4.3 Agents Slice

**File:** `src/store/slices/agentsSlice.ts`

```typescript
import { StateCreator } from 'zustand';
import type { AppStore } from '..';
import type { Agent } from '../../services/api/AgentApiService';
import { agentApi } from '../../services/api/AgentApiService';

export interface AgentsSlice {
  // State
  agents: Agent[];
  activeAgentId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAgents: (filter?: { status?: Agent['status'] }) => Promise<void>;
  createAgent: (
    repoUrl: string,
    taskDescription: string,
    options?: any
  ) => Promise<Agent>;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  selectAgent: (agentId: string | null) => void;
  pauseAgent: (agentId: string) => Promise<void>;
  resumeAgent: (agentId: string) => Promise<void>;
  stopAgent: (agentId: string) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  clearError: () => void;
}

export const createAgentsSlice: StateCreator<
  AppStore,
  [],
  [],
  AgentsSlice
> = (set, get) => ({
  // Initial state
  agents: [],
  activeAgentId: null,
  isLoading: false,
  error: null,

  // Load agents
  loadAgents: async (filter) => {
    set({ isLoading: true, error: null });

    try {
      const { agents } = await agentApi.listAgents(filter);

      set({
        agents,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: (error as Error).message,
      });
    }
  },

  // Create agent
  createAgent: async (repoUrl, taskDescription, options) => {
    set({ isLoading: true, error: null });

    try {
      const agent = await agentApi.createAgent({
        repoUrl,
        taskDescription,
        model: get().defaultModel || 'claude-3.5-sonnet',
        options,
      });

      // Add to list
      set((state) => ({
        agents: [agent, ...state.agents],
        activeAgentId: agent.id,
        isLoading: false,
      }));

      return agent;
    } catch (error) {
      set({
        isLoading: false,
        error: (error as Error).message,
      });
      throw error;
    }
  },

  // Update agent (optimistic)
  updateAgent: (agentId, updates) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    }));
  },

  // Select agent
  selectAgent: (agentId) => {
    set({ activeAgentId: agentId });
  },

  // Pause agent
  pauseAgent: async (agentId) => {
    try {
      await agentApi.pauseAgent(agentId);

      // Optimistic update
      get().updateAgent(agentId, { status: 'PAUSED' });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Resume agent
  resumeAgent: async (agentId) => {
    try {
      await agentApi.resumeAgent(agentId);

      // Optimistic update
      get().updateAgent(agentId, { status: 'RUNNING' });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Stop agent
  stopAgent: async (agentId) => {
    try {
      await agentApi.stopAgent(agentId);

      // Optimistic update
      get().updateAgent(agentId, { status: 'FINISHED' });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Delete agent
  deleteAgent: async (agentId) => {
    try {
      await agentApi.deleteAgent(agentId);

      // Remove from list
      set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== agentId),
        activeAgentId:
          state.activeAgentId === agentId ? null : state.activeAgentId,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
});
```

---

## 5. Real-time Services

### 5.1 Pusher Service (Recommended)

**File:** `src/services/realtime/PusherService.ts`

**Dependencies:**
```json
{
  "pusher-js": "^8.4.0-rc2"
}
```

**Implementation:**

```typescript
import Pusher, { Channel } from 'pusher-js/react-native';
import { EventEmitter } from 'events';

interface PusherConfig {
  appKey: string;
  cluster: string;
  authEndpoint?: string;
  encrypted?: boolean;
}

interface AgentStatusUpdate {
  agentId: string;
  status: string;
  progress: number;
  message?: string;
  timestamp: string;
}

export class PusherService extends EventEmitter {
  private pusher: Pusher | null = null;
  private channels: Map<string, Channel> = new Map();
  private config: PusherConfig;

  constructor(config: PusherConfig) {
    super();
    this.config = {
      encrypted: true,
      ...config,
    };
  }

  /**
   * Connect to Pusher
   */
  async connect(userId: string): Promise<void> {
    if (this.pusher) {
      return; // Already connected
    }

    this.pusher = new Pusher(this.config.appKey, {
      cluster: this.config.cluster,
      encrypted: this.config.encrypted,
      authEndpoint: this.config.authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${await this.getAuthToken()}`,
        },
      },
    });

    // Connection state events
    this.pusher.connection.bind('connected', () => {
      this.emit('connected');
    });

    this.pusher.connection.bind('disconnected', () => {
      this.emit('disconnected');
    });

    this.pusher.connection.bind('error', (error: any) => {
      this.emit('error', error);
    });

    // Subscribe to user's private channel
    this.subscribeToUserChannel(userId);
  }

  /**
   * Disconnect from Pusher
   */
  disconnect(): void {
    if (!this.pusher) return;

    // Unsubscribe from all channels
    this.channels.forEach((_, channelName) => {
      this.pusher!.unsubscribe(channelName);
    });

    this.channels.clear();
    this.pusher.disconnect();
    this.pusher = null;

    this.emit('disconnected');
  }

  /**
   * Subscribe to user's private channel
   */
  private subscribeToUserChannel(userId: string): void {
    const channelName = `private-user-${userId}`;

    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.pusher!.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`Subscribed to ${channelName}`);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error(`Failed to subscribe to ${channelName}:`, error);
    });

    // Listen for agent events
    channel.bind('agent-created', (data: any) => {
      this.emit('agent-created', data);
    });

    channel.bind('agent-updated', (data: any) => {
      this.emit('agent-updated', data);
    });

    channel.bind('agent-finished', (data: any) => {
      this.emit('agent-finished', data);
    });

    channel.bind('agent-error', (data: any) => {
      this.emit('agent-error', data);
    });

    this.channels.set(channelName, channel);
  }

  /**
   * Subscribe to specific agent updates
   */
  subscribeToAgent(
    agentId: string,
    onUpdate: (data: AgentStatusUpdate) => void
  ): void {
    const channelName = `agent-${agentId}`;

    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.pusher!.subscribe(channelName);

    // Status updates
    channel.bind('status-update', (data: AgentStatusUpdate) => {
      onUpdate(data);
      this.emit('agent-status-update', data);
    });

    // Log updates
    channel.bind('log-update', (data: any) => {
      this.emit('agent-log-update', data);
    });

    // Progress updates
    channel.bind('progress-update', (data: any) => {
      this.emit('agent-progress-update', data);
    });

    this.channels.set(channelName, channel);
  }

  /**
   * Unsubscribe from agent updates
   */
  unsubscribeFromAgent(agentId: string): void {
    const channelName = `agent-${agentId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      this.pusher!.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.pusher?.connection.state || 'disconnected';
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.getConnectionState() === 'connected';
  }

  /**
   * Get auth token
   */
  private async getAuthToken(): Promise<string | null> {
    const { secureStorage } = await import('../storage/SecureStorage');
    return await secureStorage.getToken('jwt');
  }
}

// Singleton instance
export const pusherService = new PusherService({
  appKey: process.env.PUSHER_APP_KEY!,
  cluster: process.env.PUSHER_CLUSTER!,
  authEndpoint: `${process.env.API_BASE_URL}/pusher/auth`,
});
```

**React Hook for Pusher:**

```typescript
// src/hooks/useRealtimeAgent.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pusherService } from '../services/realtime/PusherService';
import { useAppStore } from '../store';

export function useRealtimeAgent(agentId: string) {
  const queryClient = useQueryClient();
  const updateAgent = useAppStore((state) => state.updateAgent);

  useEffect(() => {
    // Subscribe to agent updates
    pusherService.subscribeToAgent(agentId, (data) => {
      // Update React Query cache
      queryClient.setQueryData(['agents', agentId], (old: any) => ({
        ...old,
        status: data.status,
        progress: data.progress,
        updatedAt: data.timestamp,
      }));

      // Update Zustand store
      updateAgent(agentId, {
        status: data.status,
        progress: data.progress,
      });
    });

    return () => {
      // Cleanup: Unsubscribe on unmount
      pusherService.unsubscribeFromAgent(agentId);
    };
  }, [agentId, queryClient, updateAgent]);
}
```

---

## 6. Storage Services

### 6.1 Secure Storage

**File:** `src/services/storage/SecureStorage.ts`

**Dependencies:**
```json
{
  "expo-secure-store": "~13.0.0"
}
```

**Implementation:**

```typescript
import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  /**
   * Save token securely
   */
  async saveToken(key: string, token: string): Promise<void> {
    await SecureStore.setItemAsync(key, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }

  /**
   * Get token
   */
  async getToken(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  /**
   * Delete token
   */
  async deleteToken(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  /**
   * Save API key
   */
  async saveApiKey(provider: string, apiKey: string): Promise<void> {
    await this.saveToken(`api_key_${provider}`, apiKey);
  }

  /**
   * Get API key
   */
  async getApiKey(provider: string): Promise<string | null> {
    return await this.getToken(`api_key_${provider}`);
  }

  /**
   * Delete API key
   */
  async deleteApiKey(provider: string): Promise<void> {
    await this.deleteToken(`api_key_${provider}`);
  }

  /**
   * Save user credentials (use sparingly!)
   */
  async saveCredentials(username: string, password: string): Promise<void> {
    const credentials = JSON.stringify({ username, password });
    await this.saveToken('credentials', credentials);
  }

  /**
   * Get user credentials
   */
  async getCredentials(): Promise<{ username: string; password: string } | null> {
    const credentials = await this.getToken('credentials');
    if (!credentials) return null;

    return JSON.parse(credentials);
  }

  /**
   * Clear all secure data
   */
  async clearAll(): Promise<void> {
    const keys = ['jwt', 'refresh_token', 'api_key_openai', 'api_key_anthropic', 'credentials'];

    await Promise.all(keys.map((key) => this.deleteToken(key)));
  }
}

// Singleton instance
export const secureStorage = new SecureStorageService();
```

---

**Continue in Part 3 with Auth Services, UI Components, and Final Recommendations Review...**

**Document Version:** 1.0 (Part 2 of 3)
**Last Updated:** 2024-12-18
**Status:** Component Specs - API, State, Real-time, Storage Complete ✅
