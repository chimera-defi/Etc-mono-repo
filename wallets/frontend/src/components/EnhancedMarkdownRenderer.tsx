'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { cn } from '@/lib/utils';
import { addReferrerTracking, isExternalLink, getExternalLinkTitle } from '@/lib/link-utils';
import { OutboundLink } from '@/components/OutboundLink';
import { Search, X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { HeaderTooltip } from '@/components/Tooltip';
import {
  softwareWalletTooltips,
  hardwareWalletTooltips,
  cryptoCardTooltips,
  rampTooltips,
  commonTooltips,
} from '@/lib/tooltip-content';
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
  HelpCircle,
  ListChecks,
  type LucideIcon
} from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  showExpandableSections?: boolean;
  skipFirstH1?: boolean;
}

// Header to tooltip mapping for markdown tables
type TableType = 'software' | 'hardware' | 'cards' | 'ramps';
const TABLE_METHODOLOGY_LINK: Record<TableType, string> = {
  software: '/docs/software-wallets-details#-wallet-scores-developer-focused-methodology',
  hardware: '/docs/hardware-wallets-details#-scoring-methodology',
  cards: '/docs/crypto-cards-details#scoring-methodology',
  ramps: '/docs/ramps-details#scoring-methodology',
};
const TABLE_DETAILS_LINK: Record<TableType, string> = {
  software: '/docs/software-wallets-details',
  hardware: '/docs/hardware-wallets-details',
  cards: '/docs/crypto-cards-details',
  ramps: '/docs/ramps-details',
};
const TOOLTIP_LINK_LABEL = 'Read details';

function detectTableType(title: string | undefined): TableType {
  if (!title) return 'software';
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('hardware')) return 'hardware';
  if (lowerTitle.includes('card') || lowerTitle.includes('credit') || lowerTitle.includes('debit')) return 'cards';
  if (lowerTitle.includes('ramp')) return 'ramps';
  return 'software';
}

function normalizeHeaderKey(header: string): string {
  return header.toLowerCase().trim().replace(/[\s/_-]+/g, '');
}

const HEADER_TOOLTIP_MAP: Record<TableType, Record<string, string>> = {
  software: {
    wallet: softwareWalletTooltips.headers.wallet,
    name: softwareWalletTooltips.headers.wallet,
    core: softwareWalletTooltips.headers.core,
    relmo: softwareWalletTooltips.headers.releaseCadence,
    rpc: softwareWalletTooltips.headers.rpc,
    github: softwareWalletTooltips.headers.github,
    active: softwareWalletTooltips.headers.activity,
    platforms: softwareWalletTooltips.headers.platforms,
    plat: softwareWalletTooltips.headers.platforms,
    chains: softwareWalletTooltips.headers.chains,
    devices: softwareWalletTooltips.headers.devices,
    testnets: softwareWalletTooltips.headers.testnets,
    features: softwareWalletTooltips.headers.features,
    feat: softwareWalletTooltips.headers.features,
    license: softwareWalletTooltips.headers.license,
    lic: softwareWalletTooltips.headers.license,
    api: softwareWalletTooltips.headers.api,
    audits: softwareWalletTooltips.headers.audits,
    funding: softwareWalletTooltips.headers.funding,
    txsim: softwareWalletTooltips.headers.txSim,
    scam: softwareWalletTooltips.headers.scam,
    account: softwareWalletTooltips.headers.account,
    ensnaming: softwareWalletTooltips.headers.ensNaming,
    ens: softwareWalletTooltips.headers.ensNaming,
    hw: softwareWalletTooltips.headers.hardwareSupport,
    bestfor: softwareWalletTooltips.headers.bestFor,
    links: softwareWalletTooltips.headers.links,
    status: softwareWalletTooltips.headers.status,
  },
  hardware: {
    wallet: hardwareWalletTooltips.headers.wallet,
    name: hardwareWalletTooltips.headers.wallet,
    github: hardwareWalletTooltips.headers.github,
    airgap: hardwareWalletTooltips.headers.airGap,
    opensource: hardwareWalletTooltips.headers.openSource,
    secureelem: hardwareWalletTooltips.headers.secureElement,
    se: hardwareWalletTooltips.headers.secureElement,
    secureelement: hardwareWalletTooltips.headers.secureElement,
    display: hardwareWalletTooltips.headers.display,
    price: hardwareWalletTooltips.headers.price,
    conn: hardwareWalletTooltips.headers.connectivity,
    connectivity: hardwareWalletTooltips.headers.connectivity,
    activity: hardwareWalletTooltips.headers.activity,
    founded: hardwareWalletTooltips.headers.founded,
    funding: hardwareWalletTooltips.headers.funding,
    links: hardwareWalletTooltips.headers.links,
    status: hardwareWalletTooltips.headers.status,
  },
  cards: {
    card: cryptoCardTooltips.headers.card,
    name: cryptoCardTooltips.headers.card,
    type: cryptoCardTooltips.headers.cardType,
    cardtype: cryptoCardTooltips.headers.cardType,
    custody: cryptoCardTooltips.headers.custody,
    biz: cryptoCardTooltips.headers.business,
    business: cryptoCardTooltips.headers.business,
    region: cryptoCardTooltips.headers.region,
    cashback: cryptoCardTooltips.headers.cashback,
    rewards: cryptoCardTooltips.headers.rewards,
    annualfee: cryptoCardTooltips.headers.annualFee,
    fee: cryptoCardTooltips.headers.annualFee,
    fxfee: cryptoCardTooltips.headers.fxFee,
    status: cryptoCardTooltips.headers.status,
    bestfor: cryptoCardTooltips.headers.bestFor,
  },
  ramps: {
    provider: rampTooltips.headers.provider,
    name: rampTooltips.headers.provider,
    type: rampTooltips.headers.type,
    onramp: rampTooltips.headers.onRamp,
    offramp: rampTooltips.headers.offRamp,
    coverage: rampTooltips.headers.coverage,
    feemodel: rampTooltips.headers.feeModel,
    fees: rampTooltips.headers.feeModel,
    minfee: rampTooltips.headers.minFee,
    devux: rampTooltips.headers.devUx,
    founded: rampTooltips.headers.founded,
    funding: rampTooltips.headers.funding,
    bestfor: rampTooltips.headers.bestFor,
    links: rampTooltips.headers.links,
    status: rampTooltips.headers.status,
  },
};

const HEADER_LINK_MAP: Record<TableType, Record<string, string>> = {
  software: {
    score: TABLE_METHODOLOGY_LINK.software,
    rec: TABLE_METHODOLOGY_LINK.software,
    recommendation: TABLE_METHODOLOGY_LINK.software,
    status: TABLE_METHODOLOGY_LINK.software,
    audits: '/docs/software-wallets-details#-security-audits-from-walletbeat--github',
    chains: '/docs/software-wallets-details#-eip-support-matrix',
    devices: '/docs/software-wallets-details#-mobile-deep-linking--integration',
    platforms: '/docs/software-wallets-details#-mobile-deep-linking--integration',
    plat: '/docs/software-wallets-details#-mobile-deep-linking--integration',
    account: '/docs/software-wallets-details#account-type-support-from-walletbeat',
    ensnaming: '/docs/software-wallets-details#ens--address-resolution-from-walletbeat',
    ens: '/docs/software-wallets-details#ens--address-resolution-from-walletbeat',
  },
  hardware: {
    score: TABLE_METHODOLOGY_LINK.hardware,
    rec: TABLE_METHODOLOGY_LINK.hardware,
    recommendation: TABLE_METHODOLOGY_LINK.hardware,
    status: TABLE_METHODOLOGY_LINK.hardware,
    airgap: '/docs/hardware-wallets-details#-security-deep-dive',
    opensource: '/docs/hardware-wallets-details#-security-deep-dive',
    secureelem: '/docs/hardware-wallets-details#-security-deep-dive',
    secureelement: '/docs/hardware-wallets-details#-security-deep-dive',
    founded: TABLE_METHODOLOGY_LINK.hardware,
    funding: TABLE_METHODOLOGY_LINK.hardware,
  },
  cards: {
    score: TABLE_METHODOLOGY_LINK.cards,
    rec: TABLE_METHODOLOGY_LINK.cards,
    recommendation: TABLE_METHODOLOGY_LINK.cards,
    status: TABLE_METHODOLOGY_LINK.cards,
    type: '/docs/crypto-cards-details#card-categories',
    cardtype: '/docs/crypto-cards-details#card-categories',
    custody: '/docs/crypto-cards-details#card-categories',
    cashback: '/docs/crypto-cards-details#rewards-comparison',
    rewards: '/docs/crypto-cards-details#rewards-comparison',
    annualfee: '/docs/crypto-cards-details#fee-analysis',
    fxfee: '/docs/crypto-cards-details#fee-analysis',
    fee: '/docs/crypto-cards-details#fee-analysis',
    region: '/docs/crypto-cards-details#geographic-availability',
  },
  ramps: {
    score: TABLE_METHODOLOGY_LINK.ramps,
    rec: TABLE_METHODOLOGY_LINK.ramps,
    recommendation: TABLE_METHODOLOGY_LINK.ramps,
    status: TABLE_METHODOLOGY_LINK.ramps,
    provider: '/docs/ramps-details#-top-providers-comparison',
    type: '/docs/ramps-details#-top-providers-comparison',
    onramp: '/docs/ramps-details#-top-providers-comparison',
    offramp: '/docs/ramps-details#-top-providers-comparison',
    coverage: '/docs/ramps-details#-fee-structure-analysis',
    feemodel: '/docs/ramps-details#-fee-structure-analysis',
    minfee: '/docs/ramps-details#-fee-structure-analysis',
    devux: '/docs/ramps-details#-developer-experience-dx',
    founded: TABLE_METHODOLOGY_LINK.ramps,
    funding: TABLE_METHODOLOGY_LINK.ramps,
  },
};

function getHeaderTooltip(header: string, tableType: TableType): string | null {
  const key = normalizeHeaderKey(header);
  if (key.includes('score')) return commonTooltips.score;
  if (key === 'rec' || key === 'recommendation') {
    return HEADER_TOOLTIP_MAP[tableType].status ?? 'Recommendation status based on overall score';
  }
  return HEADER_TOOLTIP_MAP[tableType][key] ?? null;
}

function getHeaderTooltipLink(header: string, tableType: TableType): string {
  const key = normalizeHeaderKey(header);
  return HEADER_LINK_MAP[tableType][key] ?? TABLE_DETAILS_LINK[tableType];
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
  // Pros & Cons (Top Picks) - collapsible for consistency with Legend
  { pattern: /^#{1,3}\s+.*Pros.*Cons.*$/im, icon: ListChecks },
  // Quick Summary should be collapsible
  { pattern: /^#{1,3}\s+.*Quick.*Summary.*$/im, icon: Info },
  // GitHub Metrics
  { pattern: /^#{1,3}\s+.*GitHub.*Metrics.*$/im, icon: Code },
  // Table of Contents
  { pattern: /^#{1,3}\s+.*Table.*of.*Contents.*$/im, icon: FileText },
  // Frequently Asked Questions
  { pattern: /^#{1,3}\s+.*Frequently.*Asked.*Questions.*$/im, icon: HelpCircle },
  { pattern: /^#{1,3}\s+.*FAQ.*$/im, icon: HelpCircle },
];

// Patterns for primary content that should NEVER be collapsed
const PRIMARY_SECTIONS = [
  /^#{1,2}\s+Complete.*Comparison.*$/im,
  /^#{1,2}\s+Complete.*Hardware.*$/im,
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

// Sections that should contain child headings (e.g., FAQ contains question h3 headers)
const CONTAINER_SECTIONS = [
  /^#{1,3}\s+.*Frequently.*Asked.*Questions.*$/im,
  /^#{1,3}\s+.*FAQ.*$/im,
];

/**
 * Parse markdown into segments, keeping collapsible sections inline
 */
function parseInlineCollapsibleSections(content: string): ContentSegment[] {
  const lines = content.split('\n');
  const segments: ContentSegment[] = [];

  let currentSegment: ContentSegment = { type: 'regular', content: '' };
  let isInContainerSection = false;
  let containerLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];

      const collapsibleMatch = COLLAPSIBLE_SECTIONS.find(s => s.pattern.test(line));
      const isPrimary = PRIMARY_SECTIONS.some(p => p.test(line));
      const isContainer = CONTAINER_SECTIONS.some(p => p.test(line));

      // If we're in a container section (like FAQ), include child headings in the content
      if (isInContainerSection && currentSegment.type === 'collapsible') {
        // Check if this heading is a child (deeper level) or sibling/parent (same or shallower level)
        if (level > containerLevel) {
          // This is a child heading (e.g., h3 inside h2 FAQ) - include it in the content
          currentSegment.content += line + '\n';
          continue;
        } else {
          // Same or higher level heading - end the container section
          isInContainerSection = false;
          containerLevel = 0;
        }
      }

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

        // Mark if this is a container section
        if (isContainer) {
          isInContainerSection = true;
          containerLevel = level;
        }
      } else {
        // This is a non-collapsible heading
        // If we were in a collapsible section, end it
        if (currentSegment.type === 'collapsible') {
          if (currentSegment.content.trim() || currentSegment.heading) {
            segments.push(currentSegment);
          }
          currentSegment = { type: 'regular', content: line + '\n' };
          isInContainerSection = false;
          containerLevel = 0;
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
  scoreTone: 'green' | 'yellow' | 'red' | 'neutral' | null;
}

interface ParsedTable {
  headers: string[];
  rows: TableRow[];
  scoreColumnIndex: number | null;
}

function parseRecommendationTone(cell: string): TableRow['scoreTone'] {
  if (cell.includes('🟢')) return 'green';
  if (cell.includes('🟡')) return 'yellow';
  if (cell.includes('🔴')) return 'red';
  if (cell.includes('⚪')) return 'neutral';
  return null;
}

function parseMarkdownTable(tableContent: string): ParsedTable | null {
  const lines = tableContent.trim().split('\n').filter(line => line.trim());
  if (lines.length < 3) return null;

  const headerLine = lines[0];
  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);
  const recColumnIndex = headers.findIndex((header) => {
    const key = normalizeHeaderKey(header);
    return key === 'rec' || key === 'recommendation';
  });
  const scoreColumnIndex = headers.findIndex((header) => normalizeHeaderKey(header).includes('score'));

  const hasMergedRecommendation = recColumnIndex !== -1 && scoreColumnIndex !== -1;
  const mergedHeaders = hasMergedRecommendation
    ? headers.filter((_, index) => index !== recColumnIndex)
    : headers;
  const mergedScoreColumnIndex = hasMergedRecommendation
    ? (scoreColumnIndex > recColumnIndex ? scoreColumnIndex - 1 : scoreColumnIndex)
    : scoreColumnIndex;

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
      const rowTone = hasMergedRecommendation
        ? parseRecommendationTone(String(rawCells[recColumnIndex] || ''))
        : null;
      const mergedRawCells = hasMergedRecommendation
        ? rawCells.filter((_, index) => index !== recColumnIndex).map(c => c.trim())
        : rawCells.map(c => c.trim());
      const mergedCells = hasMergedRecommendation
        ? cells.filter((_, index) => index !== recColumnIndex)
        : cells;

      rows.push({
        cells: mergedCells,
        rawCells: mergedRawCells,
        scoreTone: rowTone,
      });
    }
  }

  const normalizedScoreColumnIndex = mergedScoreColumnIndex >= 0 ? mergedScoreColumnIndex : null;
  return mergedHeaders.length > 0 && rows.length > 0
    ? { headers: mergedHeaders, rows, scoreColumnIndex: normalizedScoreColumnIndex }
    : null;
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
              {parsedTable.headers.map((header, index) => {
                const tableType = detectTableType(title);
                const tooltip = getHeaderTooltip(header, tableType);
                const tooltipLinkHref = getHeaderTooltipLink(header, tableType);
                return (
                  <th
                    key={index}
                    onClick={() => handleSort(index)}
                    className="px-3 py-2 text-left font-semibold border-b border-border whitespace-nowrap cursor-pointer hover:bg-muted/80 transition-colors select-none group"
                    title={tooltip ? undefined : `Click to sort by ${header}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {tooltip ? (
                        <HeaderTooltip
                          label={header}
                          tooltip={tooltip}
                          linkHref={tooltipLinkHref}
                          linkLabel={TOOLTIP_LINK_LABEL}
                        />
                      ) : (
                        <span>{header}</span>
                      )}
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
                );
              })}
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
                  {row.rawCells.map((cell, cellIndex) => {
                    const isScoreCell = parsedTable.scoreColumnIndex === cellIndex;
                    const scoreToneClass = row.scoreTone === 'green'
                      ? 'bg-green-500'
                      : row.scoreTone === 'yellow'
                      ? 'bg-yellow-500'
                      : row.scoreTone === 'red'
                      ? 'bg-red-500'
                      : row.scoreTone === 'neutral'
                      ? 'bg-slate-400'
                      : '';
                    const scoreTextClass = row.scoreTone === 'green'
                      ? 'text-green-600 dark:text-green-400 font-semibold'
                      : row.scoreTone === 'yellow'
                      ? 'text-yellow-600 dark:text-yellow-400 font-semibold'
                      : row.scoreTone === 'red'
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : row.scoreTone === 'neutral'
                      ? 'text-slate-600 dark:text-slate-300 font-semibold'
                      : '';

                    return (
                      <td key={cellIndex} className="px-3 py-2">
                        <div className={cn(isScoreCell && 'flex items-center gap-2', isScoreCell && scoreTextClass)}>
                          {isScoreCell && row.scoreTone && (
                            <span
                              className={cn(
                                'inline-block h-2.5 w-2.5 rounded-full ring-1 ring-border/60 flex-shrink-0',
                                scoreToneClass
                              )}
                              aria-hidden="true"
                            />
                          )}
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
                        </div>
                      </td>
                    );
                  })}
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
    img: ({ src, alt, ...props }: { src?: string; alt?: string }) => {
      // Restrict to same-origin: only / or relative paths (blocks external URLs from markdown)
      const safeSrc =
        src && (src.startsWith('/') || src.startsWith('./') || !/^https?:/i.test(src))
          ? src
          : undefined;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt={alt || 'Image'}
          loading="lazy"
          decoding="async"
          className="max-w-full h-auto rounded-lg"
          {...props}
        />
      );
    },
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
        <OutboundLink
          href={transformedHref || href || '#'}
          trackLabel={typeof children === 'string' ? children : undefined}
          target="_blank"
          rel="noopener noreferrer"
          title={getExternalLinkTitle(href || '')}
          className="text-primary hover:underline"
        >
          {children}
        </OutboundLink>
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
  showExpandableSections = true,
  skipFirstH1 = false
}: EnhancedMarkdownRendererProps) {
  // Strip the first H1 heading if requested (to avoid repetition with page title)
  const processedContent = skipFirstH1
    ? content.replace(/^#\s+[^\n]+\n+/, '')
    : content;

  // Detect if this is a comparison page (enable table search)
  const isComparisonPage = processedContent.includes('Complete') &&
    (processedContent.includes('Comparison') || processedContent.includes('Hardware Wallet'));

  if (!showExpandableSections) {
    return <MarkdownContent content={processedContent} className={className} enableTableSearch={isComparisonPage} />;
  }

  // Parse content into inline collapsible segments
  const segments = parseInlineCollapsibleSections(processedContent);

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
