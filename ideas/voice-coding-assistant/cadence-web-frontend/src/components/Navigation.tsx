'use client';

import { Mic, ListTodo, GitBranch, Settings } from 'lucide-react';
import { useStore } from '@/lib/store';
import { clsx } from 'clsx';

const tabs = [
  { id: 'voice' as const, label: 'Voice', icon: Mic },
  { id: 'tasks' as const, label: 'Tasks', icon: ListTodo },
  { id: 'repos' as const, label: 'Repos', icon: GitBranch },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function Navigation() {
  const { activeTab, setActiveTab, isConnected, tasks } = useStore();

  const runningTaskCount = tasks.filter((t) => t.status === 'running').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border md:relative md:border-t-0 md:border-r md:w-64 md:min-h-screen">
      {/* Desktop header */}
      <div className="hidden md:block p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Cadence</h1>
            <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
              <span
                className={clsx(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-success' : 'bg-error'
                )}
              />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex md:flex-col">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === 'tasks' && runningTaskCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-4 md:px-6 transition-colors relative',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-surface-hover'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {runningTaskCount}
                  </span>
                )}
              </div>
              <span className="text-xs md:text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
