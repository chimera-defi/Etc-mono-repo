'use client';

import { useEffect, useState } from 'react';
import {
  GitBranch,
  Star,
  ExternalLink,
  Rocket,
  Search,
  Clock,
  Lock,
  Loader2,
  Github,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { clsx } from 'clsx';
import type { GitHubRepo } from '@/lib/types';

type FilterType = 'all' | 'active' | 'recent';

export function Repos() {
  const {
    setActiveTab,
    setTranscript,
    githubUser,
    githubRepos,
    setGitHubUser,
    setGitHubRepos,
    tasks,
    selectRepo,
  } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth and fetch repos on mount
  useEffect(() => {
    const checkAuthAndFetchRepos = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await api.getMe();
        setGitHubUser(authResponse.user);

        // Fetch repos
        const repos = await api.getRepos();
        setGitHubRepos(repos);
        setError(null);
      } catch (err) {
        // User not authenticated or error fetching
        setGitHubUser(null);
        setGitHubRepos([]);
        if (err instanceof Error && !err.message.includes('Not authenticated')) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchRepos();
  }, [setGitHubUser, setGitHubRepos]);

  // Count active tasks per repo
  const getActiveTaskCount = (repoUrl: string): number => {
    return tasks.filter(
      (t) =>
        t.repoUrl === repoUrl &&
        (t.status === 'pending' || t.status === 'running' || t.status === 'pr_open')
    ).length;
  };

  // Check if repo has recent activity (pushed in last 7 days)
  const isRecentlyActive = (repo: GitHubRepo): boolean => {
    const pushedAt = new Date(repo.pushed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return pushedAt > weekAgo;
  };

  const filteredRepos = githubRepos.filter((repo) => {
    const repoUrl = repo.html_url;
    const activeCount = getActiveTaskCount(repoUrl);

    if (filter === 'active' && activeCount === 0) return false;
    if (filter === 'recent' && !isRecentlyActive(repo)) return false;
    if (
      search &&
      !repo.name.toLowerCase().includes(search.toLowerCase()) &&
      !(repo.description || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleNewTask = (repo: GitHubRepo) => {
    selectRepo(repo.id);
    setTranscript(`Create a task for ${repo.full_name}: `);
    setActiveTab('voice');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const repos = await api.getRepos();
      setGitHubRepos(repos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGitHub = () => {
    window.location.href = api.getGitHubAuthUrl();
  };

  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-500';
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-500',
      Java: 'bg-red-500',
      Ruby: 'bg-red-600',
      PHP: 'bg-purple-500',
      Swift: 'bg-orange-400',
      Kotlin: 'bg-purple-400',
    };
    return colors[language] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  // Not authenticated - show connect prompt
  if (!isLoading && !githubUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Repositories</h2>

        <div className="text-center py-16">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Github className="w-10 h-10 text-[var(--text-dim)]" />
          </div>
          <h3 className="text-xl font-medium mb-3">Connect GitHub</h3>
          <p className="text-[var(--text-dim)] mb-6 max-w-md mx-auto">
            Connect your GitHub account to see your repositories and create tasks
            directly from this dashboard.
          </p>
          <button
            onClick={handleConnectGitHub}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#24292e] text-white rounded-lg hover:bg-[#2f363d] transition-colors"
          >
            <Github className="w-5 h-5" />
            Connect with GitHub
          </button>
        </div>

        {/* Webhook info for unauthenticated users */}
        <div className="mt-8 bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Alternative: GitHub Webhooks</h3>
          <p className="text-sm text-[var(--text-dim)] mb-4">
            You can also create tasks by mentioning @cadence-ai in GitHub issue
            comments. Add this webhook URL to your repository:
          </p>
          <div className="bg-background rounded-lg p-3 font-mono text-sm overflow-x-auto">
            <code>https://your-api.cadence.app/api/webhooks/github</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Repositories</h2>
          {githubUser && (
            <p className="text-sm text-[var(--text-dim)] mt-1">
              Connected as <strong>@{githubUser.login}</strong>
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
        >
          <RefreshCw className={clsx('w-5 h-5', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'recent'] as FilterType[]).map((f) => (
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
              {f === 'active' ? 'With Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
          <h3 className="text-lg font-medium mb-2">No repositories found</h3>
          <p className="text-[var(--text-dim)]">
            {search
              ? 'Try a different search term'
              : filter === 'active'
              ? 'No repositories with active tasks'
              : 'No repositories match the current filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRepos.map((repo) => {
            const activeCount = getActiveTaskCount(repo.html_url);

            return (
              <div
                key={repo.id}
                className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {repo.private && (
                        <Lock className="w-4 h-4 text-warning" />
                      )}
                      {repo.stargazers_count > 10 && (
                        <Star className="w-4 h-4 text-warning fill-warning" />
                      )}
                      <h3 className="font-semibold text-lg">{repo.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--text-dim)] mb-2">
                      {repo.full_name}
                    </p>
                    {repo.description && (
                      <p className="text-sm text-[var(--text-dim)] mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {activeCount > 0 && (
                        <span className="text-primary font-medium">
                          {activeCount} task{activeCount > 1 ? 's' : ''} active
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                        <Clock className="w-4 h-4" />
                        {formatDate(repo.pushed_at)}
                      </span>
                      {repo.language && (
                        <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                          <span
                            className={clsx(
                              'w-3 h-3 rounded-full',
                              getLanguageColor(repo.language)
                            )}
                          />
                          {repo.language}
                        </span>
                      )}
                      {repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                          <Star className="w-4 h-4" />
                          {repo.stargazers_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => handleNewTask(repo)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dim transition-colors"
                  >
                    <Rocket className="w-4 h-4" />
                    New Task
                  </button>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-surface-hover rounded-lg hover:bg-border transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Webhook info */}
      <div className="mt-8 bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">GitHub Webhook Setup</h3>
        <p className="text-sm text-[var(--text-dim)] mb-4">
          Enable automatic PR tracking by adding this webhook to your repositories:
        </p>
        <div className="bg-background rounded-lg p-3 font-mono text-sm overflow-x-auto mb-4">
          <code>https://your-api.cadence.app/api/webhooks/github</code>
        </div>
        <div className="text-sm text-[var(--text-dim)]">
          <p className="font-medium mb-2">Supported events:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Pull Request</strong> - Track PR lifecycle (open → merged)
            </li>
            <li>
              <strong>Issue Comment</strong> - Create tasks with @cadence-ai
              mentions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
