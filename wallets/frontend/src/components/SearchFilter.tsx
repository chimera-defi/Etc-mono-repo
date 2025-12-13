'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarkdownDocument } from '@/lib/markdown';

interface SearchFilterProps {
  documents: MarkdownDocument[];
  onFilter: (filtered: MarkdownDocument[]) => void;
  className?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'comparison', label: 'Comparisons' },
  { value: 'guide', label: 'Guides' },
  { value: 'research', label: 'Research' },
];

export function SearchFilter({ documents, onFilter, className }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filterDocuments = useCallback((query: string, category: string) => {
    let filtered = documents;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(doc => doc.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.description.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [documents]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onFilter(filterDocuments(query, selectedCategory));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onFilter(filterDocuments(searchQuery, category));
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    onFilter(documents);
  };

  const hasFilters = searchQuery.trim() || selectedCategory !== 'all';

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-label="Search documentation"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              onFilter(filterDocuments('', selectedCategory));
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="pl-10 pr-8 py-2 border border-border rounded-lg bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[160px]"
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Clear All Button */}
      {hasFilters && (
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

/**
 * Component to display search results count
 */
interface SearchResultsCountProps {
  total: number;
  filtered: number;
  query: string;
}

export function SearchResultsCount({ total, filtered, query }: SearchResultsCountProps) {
  if (!query && filtered === total) {
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      {filtered === 0 ? (
        <>No results found for &quot;{query}&quot;</>
      ) : filtered === total ? (
        <>{total} documents</>
      ) : (
        <>Showing {filtered} of {total} documents</>
      )}
    </p>
  );
}
