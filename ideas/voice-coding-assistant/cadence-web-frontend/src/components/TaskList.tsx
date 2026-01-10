'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  XCircle,
  Loader2,
  Ban,
  RefreshCw,
  Plus,
  GitPullRequest,
  GitMerge,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  pr_open: { icon: GitPullRequest, label: 'PR Open', color: 'text-blue-400' },
  completed: { icon: GitMerge, label: 'Merged', color: 'text-success' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-error' },
  cancelled: { icon: Ban, label: 'Cancelled', color: 'text-[var(--text-dim)]' },
};

export function TaskList() {
  const { tasks, setTasks, selectTask, setActiveTab } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllMerged, setShowAllMerged] = useState(false);

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

  // Categorize tasks
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'running'
  );
  const openPRTasks = tasks.filter((t) => t.status === 'pr_open');
  const mergedTasks = tasks.filter((t) => t.status === 'completed');
  const otherTasks = tasks.filter(
    (t) => t.status === 'failed' || t.status === 'cancelled'
  );

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

  const renderTaskCard = (task: Task) => {
    const config = statusConfig[task.status];
    const Icon = config.icon;
    const repoName = task.repoUrl?.replace('https://github.com/', '') || '';

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
              task.status === 'pr_open' && 'bg-blue-400/10',
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
            <div className="flex items-center gap-3 text-sm text-[var(--text-dim)] flex-wrap">
              <span className={config.color}>{config.label}</span>
              {repoName && (
                <span className="truncate max-w-[200px]">{repoName}</span>
              )}
              {task.prNumber && (
                <span className="flex items-center gap-1">
                  PR #{task.prNumber}
                </span>
              )}
              <span>{formatTime(task.createdAt)}</span>
            </div>
            {task.prUrl && (
              <a
                href={task.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
              >
                View PR <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderSection = (
    title: string,
    taskList: Task[],
    icon: React.ElementType,
    emptyMessage: string,
    showViewAll?: boolean
  ) => {
    const SectionIcon = icon;
    const displayTasks =
      showViewAll && !showAllMerged ? taskList.slice(0, 3) : taskList;
    const hasMore = taskList.length > 3;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SectionIcon className="w-5 h-5 text-[var(--text-dim)]" />
            <h3 className="text-lg font-semibold">
              {title} ({taskList.length})
            </h3>
          </div>
          {showViewAll && hasMore && (
            <button
              onClick={() => setShowAllMerged(!showAllMerged)}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {showAllMerged ? (
                <>
                  Show less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View all <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {taskList.length === 0 ? (
          <p className="text-[var(--text-dim)] text-sm py-4 pl-7">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => renderTaskCard(task))}
          </div>
        )}
      </div>
    );
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

      {/* Error state */}
      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        // Empty state
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-[var(--text-dim)] mb-4">
            Create your first task to start coding with Cadence!
          </p>
          <button
            onClick={() => setActiveTab('voice')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dim transition-colors"
          >
            Create Task
          </button>
        </div>
      ) : (
        // Task sections
        <>
          {renderSection(
            'In Progress',
            inProgressTasks,
            Loader2,
            'No tasks currently running'
          )}

          {renderSection(
            'Open PRs',
            openPRTasks,
            GitPullRequest,
            'No pull requests awaiting review'
          )}

          {renderSection(
            'Merged',
            mergedTasks,
            GitMerge,
            'No merged pull requests yet',
            true
          )}

          {otherTasks.length > 0 && (
            <div className="border-t border-border pt-6">
              {renderSection(
                'Failed / Cancelled',
                otherTasks,
                XCircle,
                ''
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
