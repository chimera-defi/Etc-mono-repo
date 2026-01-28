'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { SearchableItem } from './SiteSearch';

interface SearchContextValue {
  items: SearchableItem[];
}

const SearchContext = createContext<SearchContextValue>({ items: [] });

export function useSearch() {
  return useContext(SearchContext);
}

interface SearchProviderProps {
  items: SearchableItem[];
  children: ReactNode;
}

export function SearchProvider({ items, children }: SearchProviderProps) {
  return (
    <SearchContext.Provider value={{ items }}>
      {children}
    </SearchContext.Provider>
  );
}
