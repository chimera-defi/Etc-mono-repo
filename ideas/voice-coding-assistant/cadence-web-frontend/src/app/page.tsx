'use client';

import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { VoiceInterface } from '@/components/VoiceInterface';
import { TaskList } from '@/components/TaskList';
import { TaskDetail } from '@/components/TaskDetail';
import { Settings } from '@/components/Settings';
import { Repos } from '@/components/Repos';
import { useStore } from '@/lib/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';

function MainContent() {
  const { activeTab, selectedTaskId, settings } = useStore();

  // Initialize API with stored settings
  useEffect(() => {
    api.setConfig(settings.endpoint, settings.apiKey);
  }, [settings.endpoint, settings.apiKey]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('light', !settings.darkMode);
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // If a task is selected, show detail view
  if (selectedTaskId && activeTab === 'tasks') {
    return <TaskDetail />;
  }

  switch (activeTab) {
    case 'voice':
      return <VoiceInterface />;
    case 'tasks':
      return <TaskList />;
    case 'repos':
      return <Repos />;
    case 'settings':
      return <Settings />;
    default:
      return <VoiceInterface />;
  }
}

export default function Home() {
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Navigation />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <MainContent />
      </main>
    </div>
  );
}
