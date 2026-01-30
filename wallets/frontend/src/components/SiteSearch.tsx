'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Wallet,
  FileText,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Command,
  Laptop,
  CreditCard,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchItem, SearchResultType, searchItems } from '@/lib/search-data';

interface SiteSearchProps {
  searchData: SearchItem[];
}

const typeIcons: Record<SearchResultType, React.ReactNode> = {
  wallet: <Wallet className="h-4 w-4" />,
  doc: <FileText className="h-4 w-4" />,
  article: <BookOpen className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
};

const typeLabels: Record<SearchResultType, string> = {
  wallet: 'Wallet',
  doc: 'Documentation',
  article: 'Article',
  faq: 'FAQ',
};

const categoryColors: Record<string, string> = {
  software: 'text-emerald-400',
  hardware: 'text-sky-400',
  cards: 'text-violet-400',
  ramps: 'text-amber-400',
  comparison: 'text-sky-400',
  guide: 'text-emerald-400',
  research: 'text-violet-400',
  basics: 'text-emerald-400',
  security: 'text-amber-400',
  technical: 'text-violet-400',
};

const categoryIcons: Record<string, React.ReactNode> = {
  software: <Wallet className="h-3 w-3" />,
  hardware: <Laptop className="h-3 w-3" />,
  cards: <CreditCard className="h-3 w-3" />,
  ramps: <ArrowUpDown className="h-3 w-3" />,
};

export function SiteSearch({ searchData }: SiteSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter search data by type if filter is active
  const filteredData = useMemo(() => {
    if (activeFilter === 'all') return searchData;
    return searchData.filter((item) => item.type === activeFilter);
  }, [searchData, activeFilter]);

  // Search results
  const results = useMemo(() => {
    return searchItems(filteredData, query);
  }, [filteredData, query]);

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('walletradar-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setRecentSearches((prev) => {
      const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('walletradar-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveFilter('all');
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, results.length]);

  const navigateToResult = useCallback(
    (item: SearchItem) => {
      saveRecentSearch(query);
      setIsOpen(false);
      router.push(item.url);
    },
    [query, router, saveRecentSearch]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        navigateToResult(results[selectedIndex]);
      }
    },
    [results, selectedIndex, navigateToResult]
  );

  // Quick filters
  const filters: { key: SearchResultType | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'wallet', label: 'Wallets' },
    { key: 'doc', label: 'Docs' },
    { key: 'article', label: 'Articles' },
    { key: 'faq', label: 'FAQ' },
  ];

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/50 border border-slate-700/60 rounded-lg hover:border-slate-600 hover:text-slate-300 transition-colors"
        aria-label="Search site"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-slate-700/50 rounded border border-slate-600/50">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60">
              <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search wallets, docs, articles..."
                className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-base"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/60 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
                    activeFilter === filter.key
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/60 hover:border-slate-600'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                // Show recent searches when no query
                <div className="p-4">
                  {recentSearches.length > 0 ? (
                    <>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Recent Searches
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(search)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                          >
                            <Search className="h-4 w-4 text-slate-500" />
                            {search}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">
                        Search for wallets, documentation, articles, and FAQ
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        Try &quot;Rabby&quot;, &quot;hardware wallet&quot;, or &quot;seed phrase&quot;
                      </p>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="mt-4 pt-4 border-t border-slate-700/60">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Quick Links
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Software Wallets', url: '/docs/software-wallets', icon: <Wallet className="h-4 w-4" /> },
                        { label: 'Hardware Wallets', url: '/docs/hardware-wallets', icon: <Laptop className="h-4 w-4" /> },
                        { label: 'Crypto Cards', url: '/docs/crypto-cards', icon: <CreditCard className="h-4 w-4" /> },
                        { label: 'All Docs', url: '/docs', icon: <FileText className="h-4 w-4" /> },
                      ].map((link) => (
                        <button
                          key={link.url}
                          onClick={() => {
                            setIsOpen(false);
                            router.push(link.url);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
                        >
                          {link.icon}
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                // Show search results
                <div className="p-2">
                  {results.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => navigateToResult(item)}
                      className={cn(
                        'w-full flex items-start gap-3 px-3 py-3 text-left rounded-lg transition-colors',
                        selectedIndex === index ? 'bg-sky-500/10 border border-sky-500/30' : 'hover:bg-slate-800/50 border border-transparent'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg flex-shrink-0',
                          item.type === 'wallet' && 'bg-emerald-500/10 text-emerald-400',
                          item.type === 'doc' && 'bg-sky-500/10 text-sky-400',
                          item.type === 'article' && 'bg-violet-500/10 text-violet-400',
                          item.type === 'faq' && 'bg-amber-500/10 text-amber-400'
                        )}
                      >
                        {typeIcons[item.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-100 truncate">{item.title}</span>
                          {item.score && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                              {item.score}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{typeLabels[item.type]}</span>
                          {item.category && (
                            <>
                              <span className="text-slate-600">&middot;</span>
                              <span className={cn('text-xs flex items-center gap-1', categoryColors[item.category] || 'text-slate-500')}>
                                {categoryIcons[item.category]}
                                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        className={cn(
                          'h-4 w-4 flex-shrink-0 mt-1 transition-opacity',
                          selectedIndex === index ? 'opacity-100 text-sky-400' : 'opacity-0'
                        )}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                // No results
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    No results found for &quot;{query}&quot;
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Try different keywords or browse categories
                  </p>
                </div>
              )}
            </div>

            {/* Footer with keyboard hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/60 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
                    &uarr;
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
                    &darr;
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
                    Enter
                  </kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
