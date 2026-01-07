'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  RefreshCw,
  Search,
  Plus,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { clsx } from 'clsx';
import type { Task, TaskStatus } from '@/lib/types';

const statusConfig: Record<
  TaskStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-warning' },
  running: { icon: Loader2, label: 'Running', color: 'text-primary' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-success' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-error' },
  cancelled: { icon: Ban, label: 'Cancelled', color: 'text-[var(--text-dim)]' },
};

type FilterType = 'all' | TaskStatus;

export function TaskList() {
  const { tasks, setTasks, selectTask, setActiveTab } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await api.getTasks();
        setTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();

    // Refresh every 10 seconds
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [setTasks]);

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (search && !task.task.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleTaskClick = (task: Task) => {
    selectTask(task.id);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
          >
            <RefreshCw
              className={clsx('w-5 h-5', isLoading && 'animate-spin')}
            />
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dim transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'running', 'completed', 'failed', 'pending'] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface hover:bg-surface-hover'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Task list */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-[var(--text-dim)] mb-4">
            Start your first task with a voice command!
          </p>
          <button
            onClick={() => setActiveTab('voice')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dim transition-colors"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const config = statusConfig[task.status];
            const Icon = config.icon;

            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="w-full text-left bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      'p-2 rounded-lg',
                      task.status === 'running' && 'bg-primary/10',
                      task.status === 'completed' && 'bg-success/10',
                      task.status === 'failed' && 'bg-error/10',
                      task.status === 'pending' && 'bg-warning/10',
                      task.status === 'cancelled' && 'bg-border'
                    )}
                  >
                    <Icon
                      className={clsx(
                        'w-5 h-5',
                        config.color,
                        task.status === 'running' && 'animate-spin'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1 truncate">{task.task}</p>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-dim)]">
                      <span className={config.color}>{config.label}</span>
                      {task.repoUrl && (
                        <span className="truncate max-w-[200px]">
                          {task.repoUrl.replace('https://github.com/', '')}
                        </span>
                      )}
                      <span>{formatTime(task.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
