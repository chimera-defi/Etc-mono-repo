'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { cn } from '@/lib/utils';
import { addReferrerTracking, isExternalLink, getExternalLinkTitle } from '@/lib/link-utils';
import { Search, X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import {
  Trophy,
  Calculator,
  Shield,
  AlertTriangle,
  Layers,
  Key,
  Smartphone,
  Code,
  DollarSign,
  Lock,
  FileText,
  ExternalLink,
  Info,
  Zap,
  BookOpen,
  Target,
  type LucideIcon
} from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  showExpandableSections?: boolean;
}

// Section definitions - which sections should be collapsible with clickable headings
// Using #{1,3} to match h1, h2, and h3 headers
const COLLAPSIBLE_SECTIONS: { pattern: RegExp; icon: LucideIcon }[] = [
  { pattern: /^#{1,3}\s+.*Recommendations.*$/im, icon: Trophy },
  { pattern: /^#{1,3}\s+.*Scoring.*Methodology.*$/im, icon: Calculator },
  { pattern: /^#{1,3}\s+.*Security.*Deep.*Dive.*$/im, icon: Shield },
  { pattern: /^#{1,3}\s+.*Security.*Audits.*$/im, icon: Shield },
  { pattern: /^#{1,3}\s+.*Security.*Features.*$/im, icon: Lock },
  { pattern: /^#{1,3}\s+.*Known.*Quirks.*$/im, icon: AlertTriangle },
  { pattern: /^#{1,3}\s+.*EIP.*Support.*$/im, icon: Layers },
  { pattern: /^#{1,3}\s+.*EIP-7702.*$/im, icon: Zap },
  { pattern: /^#{1,3}\s+.*Account.*Type.*$/im, icon: Key },
  { pattern: /^#{1,3}\s+.*Hardware.*Wallet.*Support.*$/im, icon: Key },
  { pattern: /^#{1,3}\s+.*ENS.*Address.*$/im, icon: Target },
  { pattern: /^#{1,3}\s+.*Browser.*Integration.*$/im, icon: Code },
  { pattern: /^#{1,3}\s+.*Mobile.*Deep.*$/im, icon: Smartphone },
  { pattern: /^#{1,3}\s+.*Developer.*Experience.*$/im, icon: Code },
  { pattern: /^#{1,3}\s+.*Monetization.*Business.*$/im, icon: DollarSign },
  { pattern: /^#{1,3}\s+.*Gas.*Estimation.*$/im, icon: Zap },
  { pattern: /^#{1,3}\s+.*Privacy.*Data.*$/im, icon: Lock },
  { pattern: /^#{1,3}\s+.*License.*Information.*$/im, icon: FileText },
  { pattern: /^#{1,3}\s+.*Other.*Wallet.*Comparison.*$/im, icon: ExternalLink },
  { pattern: /^#{1,3}\s+.*Integration.*Advice.*$/im, icon: BookOpen },
  { pattern: /^#{1,3}\s+.*Data.*Sources.*Verification.*$/im, icon: FileText },
  { pattern: /^#{1,3}\s+.*Activity.*Status.*Details.*$/im, icon: Info },
  { pattern: /^#{1,3}\s+.*Changelog.*$/im, icon: FileText },
  { pattern: /^#{1,3}\s+.*Contributing.*$/im, icon: BookOpen },
  { pattern: /^#{1,3}\s+.*Wallets.*to.*Avoid.*$/im, icon: AlertTriangle },
  { pattern: /^#{1,3}\s+.*Why.*Look.*Beyond.*$/im, icon: AlertTriangle },
  { pattern: /^#{1,3}\s+.*Ledger.*Migration.*$/im, icon: Target },
  { pattern: /^#{1,3}\s+.*Resources.*$/im, icon: ExternalLink },
  // Table-specific sections (often h3 headers)
  { pattern: /^#{1,3}\s+.*Additional.*Chains.*$/im, icon: Layers },
  { pattern: /^#{1,3}\s+.*Legend.*$/im, icon: BookOpen },
  // Quick Summary should be collapsible
  { pattern: /^#{1,3}\s+.*Quick.*Summary.*$/im, icon: Info },
  // GitHub Metrics
  { pattern: /^#{1,3}\s+.*GitHub.*Metrics.*$/im, icon: Code },
  // Table of Contents
  { pattern: /^#{1,3}\s+.*Table.*of.*Contents.*$/im, icon: FileText },
];

// Patterns for primary content that should NEVER be collapsed
const PRIMARY_SECTIONS = [
  /^#{1,2}\s+Complete.*Comparison.*$/im,
  /^#{1,2}\s+Complete.*Hardware.*$/im,
  /^#{1,2}\s+.*Top.*Picks.*$/im,
  /^#{1,2}\s+.*Which.*Wallet.*Should.*$/im,
];

interface ContentSegment {
  type: 'regular' | 'collapsible';
  content: string;
  heading?: string;
  headingLevel?: number;
  icon?: LucideIcon;
  id?: string;
}

/**
 * Parse markdown into segments, keeping collapsible sections inline
 */
function parseInlineCollapsibleSections(content: string): ContentSegment[] {
  const lines = content.split('\n');
  const segments: ContentSegment[] = [];

  let currentSegment: ContentSegment = { type: 'regular', content: '' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];

      // Check if this heading should be collapsible
      const collapsibleMatch = COLLAPSIBLE_SECTIONS.find(s => s.pattern.test(line));
      const isPrimary = PRIMARY_SECTIONS.some(p => p.test(line));

      if (collapsibleMatch && !isPrimary) {
        // Save previous segment if it has content
        if (currentSegment.content.trim()) {
          segments.push(currentSegment);
        }

        // Start a new collapsible segment
        currentSegment = {
          type: 'collapsible',
          content: '',
          heading: headingText,
          headingLevel: level,
          icon: collapsibleMatch.icon,
          id: headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        };
      } else {
        // This is a non-collapsible heading
        // If we were in a collapsible section, end it
        if (currentSegment.type === 'collapsible') {
          if (currentSegment.content.trim() || currentSegment.heading) {
            segments.push(currentSegment);
          }
          currentSegment = { type: 'regular', content: line + '\n' };
        } else {
          currentSegment.content += line + '\n';
        }
      }
    } else {
      // Regular content line
      currentSegment.content += line + '\n';
    }
  }

  // Don't forget the last segment
  if (currentSegment.content.trim() || (currentSegment.type === 'collapsible' && currentSegment.heading)) {
    segments.push(currentSegment);
  }

  return segments;
}

// Inline Collapsible Section Component
function InlineCollapsibleSection({
  heading,
  headingLevel = 2,
  icon: Icon,
  children,
  id,
  defaultOpen = false,
}: {
  heading: string;
  headingLevel?: number;
  icon?: LucideIcon;
  children: React.ReactNode;
  id?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Determine heading tag styling based on level
  const headingSizeClasses = {
    1: 'text-2xl',
    2: 'text-xl',
    3: 'text-lg',
  }[headingLevel] || 'text-lg';

  return (
    <div className="my-6" id={id}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 p-3 rounded-lg',
          'bg-muted/50 hover:bg-muted border border-border',
          'text-left font-semibold transition-colors',
          headingSizeClasses
        )}
        aria-expanded={isOpen}
      >
        <span className={cn(
          'flex-shrink-0 transition-transform duration-200',
          isOpen && 'rotate-90'
        )}>
          <ChevronRight className="h-5 w-5" />
        </span>
        {Icon && <Icon className="h-5 w-5 text-primary flex-shrink-0" />}
        <span className="flex-1">{heading}</span>
        <span className="text-xs text-muted-foreground font-normal">
          {isOpen ? 'Click to collapse' : 'Click to expand'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 pl-4 border-l-2 border-primary/20">
          {children}
        </div>
      )}
    </div>
  );
}

// Searchable Table Component for comparison tables
interface TableRow {
  cells: string[];
  rawCells: string[];
}

interface ParsedTable {
  headers: string[];
  rows: TableRow[];
}

function parseMarkdownTable(tableContent: string): ParsedTable | null {
  const lines = tableContent.trim().split('\n').filter(line => line.trim());
  if (lines.length < 3) return null;

  const headerLine = lines[0];
  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);

  const rows: TableRow[] = [];
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('|')) continue;

    const rawCells = line.split('|').slice(1, -1);
    const cells = rawCells.map(cell => {
      return cell
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim();
    });

    if (cells.length > 0) {
      rows.push({ cells, rawCells: rawCells.map(c => c.trim()) });
    }
  }

  return headers.length > 0 && rows.length > 0 ? { headers, rows } : null;
}

function SearchableTable({ tableContent, title }: { tableContent: string; title?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const parsedTable = useMemo(() => parseMarkdownTable(tableContent), [tableContent]);

  const filteredRows = useMemo(() => {
    if (!parsedTable) return [];
    if (!searchQuery.trim()) return parsedTable.rows;

    const query = searchQuery.toLowerCase();
    return parsedTable.rows.filter(row =>
      row.cells.some(cell => cell.toLowerCase().includes(query))
    );
  }, [parsedTable, searchQuery]);

  const sortedRows = useMemo(() => {
    if (sortColumn === null) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a.cells[sortColumn] || '';
      const bVal = b.cells[sortColumn] || '';

      const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
      const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('desc');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSortColumn(null);
  };

  if (!parsedTable) {
    return (
      <div className="prose-wallet">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {tableContent}
        </ReactMarkdown>
      </div>
    );
  }

  const hasFilters = searchQuery.trim() || sortColumn !== null;
  const totalCount = parsedTable.rows.length;
  const filteredCount = sortedRows.length;

  return (
    <div className="searchable-table mb-8">
      <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={`Search ${title || 'wallets'}... (name, score, features)`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Search table"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-3">
          Showing {filteredCount} of {totalCount} {title || 'items'}
          {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
          {sortColumn !== null && <> • Sorted by {parsedTable.headers[sortColumn]} ({sortDirection})</>}
        </p>
      )}

      <div className="table-wrapper overflow-x-auto -mx-4 px-4">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted">
            <tr>
              {parsedTable.headers.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  className="px-3 py-2 text-left font-semibold border-b border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors select-none group"
                  title={`Click to sort by ${header}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{header}</span>
                    {sortColumn === index ? (
                      <span className="text-primary flex-shrink-0">
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 group-hover:text-muted-foreground/70 flex-shrink-0 transition-colors">
                        <div className="flex flex-col -space-y-1">
                          <ChevronUp className="h-2 w-2" />
                          <ChevronDown className="h-2 w-2" />
                        </div>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={parsedTable.headers.length}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No results match &quot;{searchQuery}&quot;. Try a different search term.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border hover:bg-muted/50">
                  {row.rawCells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ children }) => <>{children}</>,
                          a: ({ href, children }) => {
                            const external = isExternalLink(href);
                            let transformedHref = href;
                            if (external && transformedHref) {
                              transformedHref = addReferrerTracking(transformedHref);
                            }
                            return (
                              <a
                                href={transformedHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {cell}
                      </ReactMarkdown>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarkdownContent({ content, className, enableTableSearch = false }: { content: string; className?: string; enableTableSearch?: boolean }) {
  const { contentWithoutMainTable, mainTable, tableTitle } = useMemo(() => {
    if (!enableTableSearch) {
      return { contentWithoutMainTable: content, mainTable: null, tableTitle: null };
    }

    const tablePatterns = [
      /^(#{1,3}\s+Complete[^\n]*Comparison[^\n]*Table[^\n]*)\n+((?:\|[^\n]+\n)+)/im,
      /^(#{1,3}\s+Complete[^\n]*Hardware[^\n]*Wallet[^\n]*)\n+((?:\|[^\n]+\n)+)/im,
      /^(#{1,3}\s+[^\n]*Comparison[^\n]*)\n+((?:\|[^\n]+\n)+)/im,
    ];

    for (const pattern of tablePatterns) {
      const match = content.match(pattern);
      if (match) {
        const heading = match[1];
        const table = match[2];
        const rowCount = (table.match(/^\|/gm) || []).length;
        if (rowCount > 5) {
          const title = heading.replace(/^#{1,3}\s+/, '').trim();
          const contentWithoutTable = content.replace(match[2], '<!-- TABLE_PLACEHOLDER -->');
          return {
            contentWithoutMainTable: contentWithoutTable,
            mainTable: table.trim(),
            tableTitle: title.includes('Hardware') ? 'hardware wallets' : 'wallets'
          };
        }
      }
    }

    return { contentWithoutMainTable: content, mainTable: null, tableTitle: null };
  }, [content, enableTableSearch]);

  if (mainTable) {
    const parts = contentWithoutMainTable.split('<!-- TABLE_PLACEHOLDER -->');

    return (
      <div className={cn('prose-wallet', className)}>
        {parts.map((part, index) => (
          <div key={index}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSlug]}
              components={markdownComponents}
            >
              {part}
            </ReactMarkdown>
            {index === 0 && mainTable && (
              <SearchableTable tableContent={mainTable} title={tableTitle || undefined} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('prose-wallet', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Shared markdown components
function getMarkdownComponents() {
  return {
    img: ({ src, alt, ...props }: { src?: string; alt?: string }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || 'Image'}
        loading="lazy"
        decoding="async"
        className="max-w-full h-auto rounded-lg"
        {...props}
      />
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="table-wrapper">
        <table>{children}</table>
      </div>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      const external = isExternalLink(href);

      let transformedHref = href;
      if (href && !external && href.includes('.md')) {
        const [pathPart, hashPart] = href.split('#');
        const filename = pathPart.replace(/^\.\//, '').replace(/^.*\//, '');

        if (filename && filename.endsWith('.md')) {
          const slug = filename.replace('.md', '').toLowerCase().replace(/_/g, '-');
          transformedHref = `/docs/${slug}${hashPart ? `#${hashPart}` : ''}`;
        }
      }

      // Add referrer tracking for external links
      if (external && transformedHref) {
        transformedHref = addReferrerTracking(transformedHref);
      }

      if (transformedHref && !external && transformedHref.startsWith('/')) {
        return (
          <Link href={transformedHref}>
            {children}
          </Link>
        );
      }

      return (
        <a
          href={transformedHref}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          title={external ? getExternalLinkTitle(href || '') : undefined}
          className={cn(external && 'text-primary hover:underline')}
        >
          {children}
        </a>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="relative group">
        {children}
      </pre>
    ),
    del: ({ children }: { children?: React.ReactNode }) => (
      <del className="text-muted-foreground">{children}</del>
    ),
  };
}

const markdownComponents = getMarkdownComponents();

export function EnhancedMarkdownRenderer({
  content,
  className,
  showExpandableSections = true
}: EnhancedMarkdownRendererProps) {
  // Detect if this is a comparison page (enable table search)
  const isComparisonPage = content.includes('Complete') &&
    (content.includes('Comparison') || content.includes('Hardware Wallet'));

  if (!showExpandableSections) {
    return <MarkdownContent content={content} className={className} enableTableSearch={isComparisonPage} />;
  }

  // Parse content into inline collapsible segments
  const segments = parseInlineCollapsibleSections(content);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'collapsible') {
          return (
            <InlineCollapsibleSection
              key={`${segment.id}-${index}`}
              heading={segment.heading || ''}
              headingLevel={segment.headingLevel}
              icon={segment.icon}
              id={segment.id}
              defaultOpen={false}
            >
              <MarkdownContent
                content={segment.content}
                enableTableSearch={isComparisonPage}
              />
            </InlineCollapsibleSection>
          );
        }

        return (
          <MarkdownContent
            key={index}
            content={segment.content}
            enableTableSearch={isComparisonPage}
          />
        );
      })}
    </div>
  );
}
