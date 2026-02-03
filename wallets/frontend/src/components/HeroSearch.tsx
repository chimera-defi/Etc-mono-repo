'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

type Category = 'software' | 'hardware' | 'cards' | 'ramps';

const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: 'software', label: 'Software Wallets' },
  { value: 'hardware', label: 'Hardware Wallets' },
  { value: 'cards', label: 'Crypto Cards' },
  { value: 'ramps', label: 'On/Off Ramps' },
];

const quickSearches: Array<{ label: string; query: string; category: Category }> = [
  { label: 'Rabby', query: 'Rabby', category: 'software' },
  { label: 'MetaMask', query: 'MetaMask', category: 'software' },
  { label: 'Trezor', query: 'Trezor', category: 'hardware' },
  { label: 'Transak', query: 'Transak', category: 'ramps' },
];

function buildExploreUrl(category: Category, query: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  params.set('type', category);
  return `/explore?${params.toString()}`;
}

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('software');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(buildExploreUrl(category, query));
  };

  const handleQuickSearch = (nextQuery: string, nextCategory: Category) => {
    setQuery(nextQuery);
    setCategory(nextCategory);
    router.push(buildExploreUrl(nextCategory, nextQuery));
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search wallets, brands, or features"
            aria-label="Search wallets"
            className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            aria-label="Select category"
            className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Search
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="text-slate-500">Popular:</span>
        {quickSearches.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleQuickSearch(item.query, item.category)}
            className="px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-sky-500/50 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
