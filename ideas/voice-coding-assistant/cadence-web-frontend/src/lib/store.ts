import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Settings, StreamEvent, GitHubUser, GitHubRepo } from './types';

interface AppState {
  // Tasks
  tasks: Task[];
  selectedTaskId: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  selectTask: (id: string | null) => void;

  // GitHub OAuth
  githubUser: GitHubUser | null;
  githubRepos: GitHubRepo[];
  setGitHubUser: (user: GitHubUser | null) => void;
  setGitHubRepos: (repos: GitHubRepo[]) => void;
  selectedRepoId: number | null;
  selectRepo: (id: number | null) => void;

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;

  // Connection state
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // WebSocket events
  events: StreamEvent[];
  addEvent: (event: StreamEvent) => void;

  // Voice state
  transcript: string;
  setTranscript: (text: string) => void;

  // UI state
  activeTab: 'voice' | 'tasks' | 'repos' | 'settings';
  setActiveTab: (tab: 'voice' | 'tasks' | 'repos' | 'settings') => void;
}

const defaultSettings: Settings = {
  endpoint: 'http://localhost:3001',
  apiKey: '',
  openaiKey: '',
  voiceEnabled: true,
  autoSpeak: false,
  darkMode: true,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Tasks
      tasks: [],
      selectedTaskId: null,
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      selectTask: (id) => set({ selectedTaskId: id }),

      // GitHub OAuth
      githubUser: null,
      githubRepos: [],
      setGitHubUser: (user) => set({ githubUser: user }),
      setGitHubRepos: (repos) => set({ githubRepos: repos }),
      selectedRepoId: null,
      selectRepo: (id) => set({ selectedRepoId: id }),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // Connection state
      isConnected: false,
      setConnected: (connected) => set({ isConnected: connected }),

      // WebSocket events
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event].slice(-100), // Keep last 100 events
        })),

      // Voice state
      transcript: '',
      setTranscript: (text) => set({ transcript: text }),

      // UI state
      activeTab: 'voice',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'cadence-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
