'use client';

import { useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  GitBranch,
  FileCode,
  Terminal,
  ExternalLink,
  Square,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';
import { clsx } from 'clsx';
import type { TaskStatus, StreamEvent } from '@/lib/types';

const statusConfig: Record<
  TaskStatus,
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  running: {
    icon: Loader2,
    label: 'Running',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-error',
    bgColor: 'bg-error/10',
  },
  cancelled: {
    icon: Ban,
    label: 'Cancelled',
    color: 'text-[var(--text-dim)]',
    bgColor: 'bg-border',
  },
};

export function TaskDetail() {
  const { tasks, selectedTaskId, selectTask, events, updateTask } = useStore();
  const { subscribe, unsubscribe } = useWebSocket();

  const task = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const taskEvents = useMemo(
    () => events.filter((e) => e.taskId === selectedTaskId),
    [events, selectedTaskId]
  );

  // Subscribe to task updates
  useEffect(() => {
    if (selectedTaskId && task?.status === 'running') {
      subscribe(selectedTaskId);
      return () => unsubscribe(selectedTaskId);
    }
  }, [selectedTaskId, task?.status, subscribe, unsubscribe]);

  const handleCancel = async () => {
    if (!task) return;
    try {
      await api.cancelTask(task.id);
      updateTask(task.id, { status: 'cancelled' });
    } catch (err) {
      console.error('Failed to cancel task:', err);
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--text-dim)]">Select a task to view details</p>
      </div>
    );
  }

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventIcon = (event: StreamEvent) => {
    switch (event.data.type) {
      case 'file_edit':
        return <FileCode className="w-4 h-4" />;
      case 'command_run':
        return <Terminal className="w-4 h-4" />;
      case 'tool_use':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventMessage = (event: StreamEvent): string => {
    switch (event.data.type) {
      case 'task_started':
        return event.data.message;
      case 'file_edit':
        return `${event.data.action.charAt(0).toUpperCase() + event.data.action.slice(1)}d ${event.data.path}`;
      case 'command_run':
        return `$ ${event.data.command}`;
      case 'tool_use':
        return `Using ${event.data.tool}`;
      case 'output':
        return event.data.text;
      case 'error':
        return event.data.message;
      case 'task_completed':
        return event.data.summary;
      default:
        return 'Unknown event';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={() => selectTask(null)}
        className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </button>

      {/* Task header */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx('p-3 rounded-lg', config.bgColor)}>
              <StatusIcon
                className={clsx(
                  'w-6 h-6',
                  config.color,
                  task.status === 'running' && 'animate-spin'
                )}
              />
            </div>
            <div>
              <span className={clsx('text-sm font-medium', config.color)}>
                {config.label}
              </span>
            </div>
          </div>
          {task.status === 'running' && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
            >
              <Square className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">{task.task}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--text-dim)]">Created:</span>
            <span className="ml-2">{formatTime(task.createdAt)}</span>
          </div>
          {task.completedAt && (
            <div>
              <span className="text-[var(--text-dim)]">Completed:</span>
              <span className="ml-2">{formatTime(task.completedAt)}</span>
            </div>
          )}
          {task.repoUrl && (
            <div className="md:col-span-2">
              <span className="text-[var(--text-dim)]">Repository:</span>
              <a
                href={task.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline inline-flex items-center gap-1"
              >
                {task.repoUrl.replace('https://github.com/', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      {task.output && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Output</h3>
          <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <pre className="output-text text-sm whitespace-pre-wrap">
              {task.output}
            </pre>
          </div>
        </div>
      )}

      {/* Activity / Events */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Activity</h3>
        {taskEvents.length === 0 ? (
          <p className="text-[var(--text-dim)] text-center py-8">
            {task.status === 'pending'
              ? 'Waiting to start...'
              : 'No activity recorded'}
          </p>
        ) : (
          <div className="space-y-3">
            {taskEvents.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-lg',
                  event.data.type === 'error' ? 'bg-error/10' : 'bg-background'
                )}
              >
                <div
                  className={clsx(
                    'p-1.5 rounded',
                    event.data.type === 'error'
                      ? 'bg-error/20 text-error'
                      : 'bg-surface text-[var(--text-dim)]'
                  )}
                >
                  {getEventIcon(event)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      'text-sm',
                      event.data.type === 'error' && 'text-error'
                    )}
                  >
                    {getEventMessage(event)}
                  </p>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
