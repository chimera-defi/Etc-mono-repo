'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from './CollapsibleSection';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  Target
} from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  showExpandableSections?: boolean;
}

// Section definitions - which sections should be collapsible
const COLLAPSIBLE_SECTIONS = [
  { pattern: /^#{1,2}\s+.*Recommendations.*$/im, title: 'Recommendations by Use Case', icon: Trophy },
  { pattern: /^#{1,2}\s+.*Scoring.*Methodology.*$/im, title: 'Scoring Methodology', icon: Calculator },
  { pattern: /^#{1,2}\s+.*Security.*Deep.*Dive.*$/im, title: 'Security Deep Dive', icon: Shield },
  { pattern: /^#{1,2}\s+.*Security.*Audits.*$/im, title: 'Security Audits', icon: Shield },
  { pattern: /^#{1,2}\s+.*Security.*Features.*$/im, title: 'Security Features', icon: Lock },
  { pattern: /^#{1,2}\s+.*Known.*Quirks.*$/im, title: 'Known Quirks & Gotchas', icon: AlertTriangle },
  { pattern: /^#{1,2}\s+.*EIP.*Support.*$/im, title: 'EIP Support Matrix', icon: Layers },
  { pattern: /^#{1,2}\s+.*EIP-7702.*$/im, title: 'EIP-7702 Wallet Support', icon: Zap },
  { pattern: /^#{1,2}\s+.*Account.*Type.*$/im, title: 'Account Type Support', icon: Key },
  { pattern: /^#{1,2}\s+.*Hardware.*Wallet.*Support.*$/im, title: 'Hardware Wallet Support', icon: Key },
  { pattern: /^#{1,2}\s+.*ENS.*Address.*$/im, title: 'ENS & Address Resolution', icon: Target },
  { pattern: /^#{1,2}\s+.*Browser.*Integration.*$/im, title: 'Browser Integration', icon: Code },
  { pattern: /^#{1,2}\s+.*Mobile.*Deep.*$/im, title: 'Mobile Deep-linking', icon: Smartphone },
  { pattern: /^#{1,2}\s+.*Developer.*Experience.*$/im, title: 'Developer Experience', icon: Code },
  { pattern: /^#{1,2}\s+.*Monetization.*Business.*$/im, title: 'Monetization & Business Model', icon: DollarSign },
  { pattern: /^#{1,2}\s+.*Gas.*Estimation.*$/im, title: 'Gas Estimation & Transaction Preview', icon: Zap },
  { pattern: /^#{1,2}\s+.*Privacy.*Data.*$/im, title: 'Privacy & Data Collection', icon: Lock },
  { pattern: /^#{1,2}\s+.*License.*Information.*$/im, title: 'License Information', icon: FileText },
  { pattern: /^#{1,2}\s+.*Other.*Wallet.*Comparison.*$/im, title: 'Other Resources', icon: ExternalLink },
  { pattern: /^#{1,2}\s+.*Integration.*Advice.*$/im, title: 'Integration Advice', icon: BookOpen },
  { pattern: /^#{1,2}\s+.*Data.*Sources.*Verification.*$/im, title: 'Data Sources & Verification', icon: FileText },
  { pattern: /^#{1,2}\s+.*Activity.*Status.*Details.*$/im, title: 'Activity Status Details', icon: Info },
  { pattern: /^#{1,2}\s+.*Changelog.*$/im, title: 'Changelog', icon: FileText },
  { pattern: /^#{1,2}\s+.*Contributing.*Add.*$/im, title: 'Contributing', icon: BookOpen },
  { pattern: /^#{1,2}\s+.*Quick.*Recommendations.*$/im, title: 'Quick Recommendations', icon: Trophy },
  { pattern: /^#{1,2}\s+.*Wallets.*to.*Avoid.*$/im, title: 'Wallets to Avoid', icon: AlertTriangle },
  { pattern: /^#{1,2}\s+.*Why.*Look.*Beyond.*$/im, title: 'Why Look Beyond Ledger?', icon: AlertTriangle },
  { pattern: /^#{1,2}\s+.*Ledger.*Migration.*$/im, title: 'Ledger Migration', icon: Target },
  { pattern: /^#{1,2}\s+.*Resources.*$/im, title: 'Resources', icon: ExternalLink },
];

// Patterns for primary content that should always be visible
const PRIMARY_SECTIONS = [
  /^#{1,2}\s+Complete.*Comparison.*$/im,
  /^#{1,2}\s+Complete.*Hardware.*$/im,
  /^#{1,2}\s+.*GitHub.*Metrics.*$/im,
  /^#{1,2}\s+Summary.*$/im,
  /^#{1,2}\s+.*Top.*Picks.*$/im,
  /^#{1,2}\s+.*Which.*Wallet.*Should.*$/im,
];

function parseMarkdownSections(content: string): { primary: string; sections: { id: string; title: string; content: string; icon: typeof Trophy }[] } {
  const lines = content.split('\n');
  const sections: { id: string; title: string; content: string; icon: typeof Trophy }[] = [];
  
  let currentSectionStart = -1;
  let currentSection: { title: string; icon: typeof Trophy } | null = null;
  let primaryContent = '';
  let inPrimarySection = true;
  let sectionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeading = /^#{1,2}\s+/.test(line);
    
    if (isHeading) {
      // Check if this is a collapsible section
      const collapsibleMatch = COLLAPSIBLE_SECTIONS.find(s => s.pattern.test(line));
      const isPrimary = PRIMARY_SECTIONS.some(p => p.test(line));
      
      // Save previous section if it was collapsible
      if (currentSection && sectionLines.length > 0) {
        sections.push({
          id: currentSection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: currentSection.title,
          content: sectionLines.join('\n'),
          icon: currentSection.icon,
        });
        sectionLines = [];
      }
      
      if (collapsibleMatch && !isPrimary) {
        // Start a new collapsible section
        currentSection = { title: collapsibleMatch.title, icon: collapsibleMatch.icon };
        inPrimarySection = false;
        sectionLines = [line];
      } else {
        // This is primary content
        currentSection = null;
        inPrimarySection = true;
        primaryContent += line + '\n';
      }
    } else {
      if (currentSection) {
        sectionLines.push(line);
      } else {
        primaryContent += line + '\n';
      }
    }
  }
  
  // Save last section
  if (currentSection && sectionLines.length > 0) {
    sections.push({
      id: currentSection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: currentSection.title,
      content: sectionLines.join('\n'),
      icon: currentSection.icon,
    });
  }
  
  return { primary: primaryContent.trim(), sections };
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
  if (lines.length < 3) return null; // Need header, separator, and at least one row

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);

  // Skip separator line (index 1)
  // Parse rows
  const rows: TableRow[] = [];
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('|')) continue;
    
    const rawCells = line.split('|').slice(1, -1); // Remove first and last empty splits
    const cells = rawCells.map(cell => {
      // Strip markdown formatting for search but keep raw for display
      return cell
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
        .replace(/~~([^~]+)~~/g, '$1') // Strikethrough
        .replace(/`([^`]+)`/g, '$1') // Code
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
      
      // Try numeric sort first (for scores, etc.)
      const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
      const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Fall back to string sort
      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('desc'); // Default to descending for scores
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSortColumn(null);
  };

  if (!parsedTable) {
    // Fallback to regular markdown rendering
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
      {/* Search Controls */}
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

      {/* Results Count */}
      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-3">
          Showing {filteredCount} of {totalCount} {title || 'items'}
          {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
          {sortColumn !== null && <> • Sorted by {parsedTable.headers[sortColumn]} ({sortDirection})</>}
        </p>
      )}

      {/* Table */}
      <div className="table-wrapper overflow-x-auto -mx-4 px-4">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted">
            <tr>
              {parsedTable.headers.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  className="px-3 py-2 text-left font-semibold border-b border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  title={`Sort by ${header}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{header}</span>
                    {sortColumn === index ? (
                      <span className="text-primary">
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 opacity-0 group-hover:opacity-100">
                        <ChevronDown className="h-3 w-3" />
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
                          a: ({ href, children }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {children}
                            </a>
                          ),
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
  // If table search is enabled, extract and render tables separately
  const { contentWithoutMainTable, mainTable, tableTitle } = useMemo(() => {
    if (!enableTableSearch) {
      return { contentWithoutMainTable: content, mainTable: null, tableTitle: null };
    }

    // Look for the main comparison table (usually after "Complete ... Comparison" heading)
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
        // Check if this is a substantial table (more than 5 rows)
        const rowCount = (table.match(/^\|/gm) || []).length;
        if (rowCount > 5) {
          const title = heading.replace(/^#{1,3}\s+/, '').trim();
          // Keep heading but remove table from content
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

  // Render with table placeholder replacement
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

// Shared markdown components factory
// Using 'any' types to match react-markdown's flexible component typing
function getMarkdownComponents() {
  return {
    // Lazy load images with proper attributes
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
      const isExternal = href?.startsWith('http');
      
      // Transform relative .md links to Next.js routes
      let transformedHref = href;
      if (href && !isExternal && href.includes('.md')) {
        const [pathPart, hashPart] = href.split('#');
        const filename = pathPart.replace(/^\.\//, '').replace(/^.*\//, '');
        
        if (filename && filename.endsWith('.md')) {
          const slug = filename.replace('.md', '').toLowerCase().replace(/_/g, '-');
          transformedHref = `/docs/${slug}${hashPart ? `#${hashPart}` : ''}`;
        }
      }
      
      if (transformedHref && !isExternal && transformedHref.startsWith('/')) {
        return (
          <Link href={transformedHref}>
            {children}
          </Link>
        );
      }
      
      return (
        <a
          href={transformedHref}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
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
  const [showAll, setShowAll] = useState(false);

  // Detect if this is a comparison page (enable table search)
  const isComparisonPage = content.includes('Complete') && 
    (content.includes('Comparison') || content.includes('Hardware Wallet'));
  
  if (!showExpandableSections) {
    return <MarkdownContent content={content} className={className} enableTableSearch={isComparisonPage} />;
  }

  const { primary, sections } = parseMarkdownSections(content);
  
  return (
    <div className={className}>
      {/* Primary Content (tables, summary, etc.) - with searchable tables */}
      <MarkdownContent content={primary} enableTableSearch={isComparisonPage} />
      
      {/* Expandable Sections */}
      {sections.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Additional Information</h2>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary hover:underline"
            >
              {showAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <CollapsibleSection
                  key={section.id}
                  title={section.title}
                  icon={<Icon className="h-5 w-5" />}
                  defaultOpen={showAll}
                >
                  <MarkdownContent content={section.content} />
                </CollapsibleSection>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
