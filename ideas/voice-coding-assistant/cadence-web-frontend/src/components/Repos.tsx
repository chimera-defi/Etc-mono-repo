'use client';

import { useState } from 'react';
import {
  GitBranch,
  Star,
  ExternalLink,
  Rocket,
  Search,
  Clock,
  Code2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { clsx } from 'clsx';

// Mock data for demonstration - in production this would come from GitHub API
const mockRepos = [
  {
    id: '1',
    name: 'wallet-frontend',
    fullName: 'chimera-defi/wallet-frontend',
    description: 'Wallet comparison and information frontend',
    language: 'TypeScript',
    lastPush: '2 hours ago',
    activeAgents: 2,
    isFavorite: true,
  },
  {
    id: '2',
    name: 'api-service',
    fullName: 'chimera-defi/api-service',
    description: 'Backend API service for the platform',
    language: 'Node.js',
    lastPush: '1 day ago',
    activeAgents: 1,
    isFavorite: false,
  },
  {
    id: '3',
    name: 'auth-service',
    fullName: 'chimera-defi/auth-service',
    description: 'Authentication and authorization service',
    language: 'Python',
    lastPush: '3 days ago',
    activeAgents: 0,
    isFavorite: false,
  },
  {
    id: '4',
    name: 'mobile-app',
    fullName: 'chimera-defi/mobile-app',
    description: 'React Native mobile application',
    language: 'TypeScript',
    lastPush: '1 week ago',
    activeAgents: 0,
    isFavorite: false,
  },
];

type FilterType = 'all' | 'active' | 'favorites';

export function Repos() {
  const { setActiveTab, setTranscript } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredRepos = mockRepos.filter((repo) => {
    if (filter === 'active' && repo.activeAgents === 0) return false;
    if (filter === 'favorites' && !repo.isFavorite) return false;
    if (
      search &&
      !repo.name.toLowerCase().includes(search.toLowerCase()) &&
      !repo.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleNewAgent = (repoFullName: string) => {
    setTranscript(`Create a new task for ${repoFullName}`);
    setActiveTab('voice');
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-500',
      'Node.js': 'bg-green-600',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Repositories</h2>
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
          {(['all', 'active', 'favorites'] as FilterType[]).map((f) => (
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
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <GitBranch className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm">
              <strong>GitHub Integration:</strong> Connect your GitHub account
              to see your repositories here. You can also use @cadence-ai
              mentions in issue comments to trigger tasks.
            </p>
            <a
              href="#"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Learn more about GitHub integration
            </a>
          </div>
        </div>
      </div>

      {/* Repository list */}
      {filteredRepos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-[var(--text-dim)]" />
          </div>
          <h3 className="text-lg font-medium mb-2">No repositories found</h3>
          <p className="text-[var(--text-dim)]">
            {search
              ? 'Try a different search term'
              : 'Connect your GitHub account to see your repositories'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {repo.isFavorite && (
                      <Star className="w-4 h-4 text-warning fill-warning" />
                    )}
                    <h3 className="font-semibold text-lg">{repo.name}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-dim)] mb-3">
                    {repo.fullName}
                  </p>
                  {repo.description && (
                    <p className="text-sm text-[var(--text-dim)] mb-3">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {repo.activeAgents > 0 && (
                      <span className="text-primary font-medium">
                        {repo.activeAgents} agent
                        {repo.activeAgents > 1 ? 's' : ''} running
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                      <Clock className="w-4 h-4" />
                      Last push: {repo.lastPush}
                    </span>
                    <span className="flex items-center gap-1.5 text-[var(--text-dim)]">
                      <span
                        className={clsx(
                          'w-3 h-3 rounded-full',
                          getLanguageColor(repo.language)
                        )}
                      />
                      {repo.language}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => handleNewAgent(repo.fullName)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dim transition-colors"
                >
                  <Rocket className="w-4 h-4" />
                  New Agent
                </button>
                <a
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-surface-hover rounded-lg hover:bg-border transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  View Code
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GitHub webhook info */}
      <div className="mt-8 bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">GitHub Webhook Setup</h3>
        <p className="text-sm text-[var(--text-dim)] mb-4">
          To enable automatic task creation from GitHub, add this webhook URL to
          your repository settings:
        </p>
        <div className="bg-background rounded-lg p-3 font-mono text-sm overflow-x-auto">
          <code>https://your-api.cadence.app/api/webhooks/github</code>
        </div>
        <div className="mt-4 text-sm text-[var(--text-dim)]">
          <p className="font-medium mb-2">Supported events:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Pull Request</strong> - Auto-archive tasks when PR is
              merged/closed
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
