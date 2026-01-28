'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, FileText, Wallet, CreditCard, ArrowLeftRight, HelpCircle, BookOpen, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

// Search result types
export interface SearchableItem {
  id: string;
  type: 'software' | 'hardware' | 'card' | 'ramp' | 'doc' | 'article' | 'faq';
  title: string;
  description: string;
  url: string;
  category?: string;
  score?: number;
  keywords?: string[];
}

interface SiteSearchProps {
  items: SearchableItem[];
  placeholder?: string;
  className?: string;
}

const typeIcons: Record<SearchableItem['type'], React.ReactNode> = {
  software: <Wallet className="h-4 w-4" />,
  hardware: <Wallet className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  ramp: <ArrowLeftRight className="h-4 w-4" />,
  doc: <FileText className="h-4 w-4" />,
  article: <BookOpen className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
};

const typeLabels: Record<SearchableItem['type'], string> = {
  software: 'Software Wallet',
  hardware: 'Hardware Wallet',
  card: 'Crypto Card',
  ramp: 'On/Off Ramp',
  doc: 'Documentation',
  article: 'Article',
  faq: 'FAQ',
};

const typeColors: Record<SearchableItem['type'], string> = {
  software: 'text-emerald-400',
  hardware: 'text-sky-400',
  card: 'text-violet-400',
  ramp: 'text-amber-400',
  doc: 'text-slate-400',
  article: 'text-pink-400',
  faq: 'text-cyan-400',
};

export function SiteSearch({ items, placeholder = 'Search wallets, docs, articles...', className }: SiteSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter and rank results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    return items
      .map(item => {
        // Calculate relevance score
        let relevance = 0;
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();
        const keywordsLower = (item.keywords || []).join(' ').toLowerCase();

        for (const term of searchTerms) {
          // Title match (highest weight)
          if (titleLower.includes(term)) {
            relevance += titleLower.startsWith(term) ? 100 : 50;
          }
          // Description match
          if (descLower.includes(term)) {
            relevance += 20;
          }
          // Keywords match
          if (keywordsLower.includes(term)) {
            relevance += 30;
          }
          // Category match
          if (item.category?.toLowerCase().includes(term)) {
            relevance += 15;
          }
        }

        // Boost by wallet score if available
        if (item.score) {
          relevance += item.score / 10;
        }

        return { item, relevance };
      })
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10)
      .map(r => r.item);
  }, [items, query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) {
      // Open search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].url);
          setIsOpen(false);
          setQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  }, [isOpen, results, selectedIndex, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedEl = resultsRef.current.children[selectedIndex] as HTMLElement;
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('.site-search')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn('site-search relative', className)}>
      {/* Search trigger button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-slate-900/70 border border-slate-700/60 rounded-lg hover:border-slate-600 transition-colors w-full md:w-64"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{placeholder}</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Search panel */}
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
              {query && results.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400">
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try different keywords or browse categories</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((item, index) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors',
                        index === selectedIndex
                          ? 'bg-sky-500/10 border-l-2 border-sky-500'
                          : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                      )}
                    >
                      <div className={cn('mt-0.5', typeColors[item.type])}>
                        {typeIcons[item.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-100 truncate">{item.title}</span>
                          {item.score !== undefined && (
                            <span className="text-xs px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                              {item.score}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">{item.description}</p>
                        <span className={cn('text-xs', typeColors[item.type])}>
                          {typeLabels[item.type]}
                          {item.category && ` · ${item.category}`}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6">
                  <p className="text-sm text-slate-400 mb-3">Quick links</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/docs/software-wallets"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      Software Wallets
                    </Link>
                    <Link
                      href="/docs/hardware-wallets"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Wallet className="h-4 w-4 text-sky-400" />
                      Hardware Wallets
                    </Link>
                    <Link
                      href="/docs/crypto-cards"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <CreditCard className="h-4 w-4 text-violet-400" />
                      Crypto Cards
                    </Link>
                    <Link
                      href="/docs/ramps"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-amber-400" />
                      On/Off Ramps
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/60 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded">↵</kbd>
                  Select
                </span>
              </div>
              <span>{results.length} results</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate searchable items from different data sources
export function generateSearchableItems(data: {
  softwareWallets?: Array<{ id: string; name: string; score: number; bestFor: string }>;
  hardwareWallets?: Array<{ id: string; name: string; score: number; display: string }>;
  cryptoCards?: Array<{ id: string; name: string; score: number; bestFor: string; provider: string }>;
  ramps?: Array<{ id: string; name: string; score: number; bestFor: string; coverage: string }>;
  docs?: Array<{ slug: string; title: string; description: string; category: string }>;
  articles?: Array<{ slug: string; title: string; description: string; category: string }>;
  faqs?: Array<{ question: string; answer: string; category: string }>;
}): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Software wallets
  data.softwareWallets?.forEach(w => {
    items.push({
      id: `sw-${w.id}`,
      type: 'software',
      title: w.name,
      description: w.bestFor,
      url: `/wallets/software/${w.id}`,
      score: w.score,
      keywords: [w.name, w.bestFor, 'software', 'wallet'],
    });
  });

  // Hardware wallets
  data.hardwareWallets?.forEach(w => {
    items.push({
      id: `hw-${w.id}`,
      type: 'hardware',
      title: w.name,
      description: w.display,
      url: `/wallets/hardware/${w.id}`,
      score: w.score,
      keywords: [w.name, w.display, 'hardware', 'wallet', 'cold storage'],
    });
  });

  // Crypto cards
  data.cryptoCards?.forEach(c => {
    items.push({
      id: `card-${c.id}`,
      type: 'card',
      title: c.name,
      description: c.bestFor,
      url: `/wallets/cards/${c.id}`,
      score: c.score,
      keywords: [c.name, c.provider, c.bestFor, 'card', 'crypto card'],
    });
  });

  // Ramps
  data.ramps?.forEach(r => {
    items.push({
      id: `ramp-${r.id}`,
      type: 'ramp',
      title: r.name,
      description: r.bestFor,
      url: `/wallets/ramps/${r.id}`,
      score: r.score,
      keywords: [r.name, r.bestFor, r.coverage, 'ramp', 'on-ramp', 'off-ramp'],
    });
  });

  // Documentation
  data.docs?.forEach(d => {
    items.push({
      id: `doc-${d.slug}`,
      type: 'doc',
      title: d.title,
      description: d.description,
      url: `/docs/${d.slug}`,
      category: d.category,
      keywords: [d.title, d.category],
    });
  });

  // Articles
  data.articles?.forEach(a => {
    items.push({
      id: `article-${a.slug}`,
      type: 'article',
      title: a.title,
      description: a.description,
      url: `/articles/${a.slug}`,
      category: a.category,
      keywords: [a.title, a.category],
    });
  });

  // FAQs
  data.faqs?.forEach((f, i) => {
    items.push({
      id: `faq-${i}`,
      type: 'faq',
      title: f.question,
      description: f.answer.substring(0, 150) + '...',
      url: '/#faq',
      category: f.category,
      keywords: [f.question, f.category],
    });
  });

  return items;
}
