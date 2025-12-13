'use client';

import { useState, useMemo } from 'react';
import { WalletCard } from '@/components/WalletCard';
import { SearchFilter, SearchResultsCount } from '@/components/SearchFilter';
import type { MarkdownDocument } from '@/lib/markdown';

interface DocsContentProps {
  documents: MarkdownDocument[];
}

export function DocsContent({ documents }: DocsContentProps) {
  const [filteredDocs, setFilteredDocs] = useState<MarkdownDocument[]>(documents);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilter = (filtered: MarkdownDocument[]) => {
    setFilteredDocs(filtered);
  };

  // Group filtered documents by category
  const groupedDocs = useMemo(() => {
    const comparisons = filteredDocs.filter(d => d.category === 'comparison');
    const guides = filteredDocs.filter(d => d.category === 'guide');
    const research = filteredDocs.filter(d => d.category === 'research');
    const other = filteredDocs.filter(d => d.category === 'other');
    
    return { comparisons, guides, research, other };
  }, [filteredDocs]);

  const hasResults = filteredDocs.length > 0;
  const isFiltered = filteredDocs.length !== documents.length;

  return (
    <>
      {/* Search and Filter */}
      <div className="mb-8">
        <SearchFilter 
          documents={documents} 
          onFilter={handleFilter}
        />
        {isFiltered && (
          <div className="mt-4">
            <SearchResultsCount 
              total={documents.length} 
              filtered={filteredDocs.length} 
              query={searchQuery}
            />
          </div>
        )}
      </div>

      {!hasResults ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No documents match your search criteria.
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison Documents */}
          {groupedDocs.comparisons.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                Wallet Comparisons
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({groupedDocs.comparisons.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedDocs.comparisons.map((doc) => (
                  <WalletCard key={doc.slug} document={doc} />
                ))}
              </div>
            </section>
          )}

          {/* Guide Documents */}
          {groupedDocs.guides.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                Guides
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({groupedDocs.guides.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedDocs.guides.map((doc) => (
                  <WalletCard key={doc.slug} document={doc} />
                ))}
              </div>
            </section>
          )}

          {/* Research Documents */}
          {groupedDocs.research.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                Research
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({groupedDocs.research.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedDocs.research.map((doc) => (
                  <WalletCard key={doc.slug} document={doc} />
                ))}
              </div>
            </section>
          )}

          {/* Other Documents */}
          {groupedDocs.other.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                Other
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({groupedDocs.other.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedDocs.other.map((doc) => (
                  <WalletCard key={doc.slug} document={doc} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
