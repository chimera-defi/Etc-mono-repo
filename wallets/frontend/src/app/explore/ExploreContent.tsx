'use client';

import { useState, useMemo, useCallback } from 'react';
import { Shield, Cpu, CreditCard, LayoutGrid, List, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WalletFilters,
  initialFilterState,
  type FilterState,
  type SortState,
} from '@/components/WalletFilters';
import { WalletTable, type SoftwareWallet, type HardwareWallet, type CryptoCard, type WalletData } from '@/components/WalletTable';
import { ComparisonTool } from '@/components/ComparisonTool';

interface ExploreContentProps {
  softwareWallets: SoftwareWallet[];
  hardwareWallets: HardwareWallet[];
  cryptoCards: CryptoCard[];
}

type TabType = 'software' | 'hardware' | 'cards';
type ViewMode = 'grid' | 'table';

// Filter functions
function filterSoftwareWallets(
  wallets: SoftwareWallet[],
  filters: FilterState
): SoftwareWallet[] {
  return wallets.filter(wallet => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        wallet.name.toLowerCase().includes(searchLower) ||
        wallet.bestFor.toLowerCase().includes(searchLower) ||
        wallet.fundingSource.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Score filter
    if (wallet.score < filters.minScore) return false;
    if (wallet.score > filters.maxScore) return false;

    // Recommendation filter
    if (filters.recommendation.length && !filters.recommendation.includes(wallet.recommendation)) {
      return false;
    }

    // Platform filter
    if (filters.platforms.length) {
      const hasPlatform = filters.platforms.some(platform => {
        switch (platform) {
          case 'mobile': return wallet.devices.mobile;
          case 'browser': return wallet.devices.browser;
          case 'desktop': return wallet.devices.desktop;
          case 'web': return wallet.devices.web;
          default: return false;
        }
      });
      if (!hasPlatform) return false;
    }

    // License filter
    if (filters.license.length && !filters.license.includes(wallet.license)) {
      return false;
    }

    // Features filter
    if (filters.features.length) {
      const hasFeature = filters.features.every(feature => {
        switch (feature) {
          case 'txSimulation': return wallet.txSimulation;
          case 'scamAlerts': return wallet.scamAlerts !== 'none';
          case 'hardwareSupport': return wallet.hardwareSupport;
          case 'testnets': return wallet.testnets;
          default: return true;
        }
      });
      if (!hasFeature) return false;
    }

    // Account types filter
    if (filters.accountTypes.length) {
      const hasAccountType = filters.accountTypes.some(type =>
        wallet.accountTypes.includes(type)
      );
      if (!hasAccountType) return false;
    }

    // Activity filter
    if (filters.active.length && !filters.active.includes(wallet.active)) {
      return false;
    }

    // Funding filter
    if (filters.funding.length && !filters.funding.includes(wallet.funding)) {
      return false;
    }

    return true;
  });
}

function filterHardwareWallets(
  wallets: HardwareWallet[],
  filters: FilterState
): HardwareWallet[] {
  return wallets.filter(wallet => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        wallet.name.toLowerCase().includes(searchLower) ||
        wallet.display.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Score filter
    if (wallet.score < filters.minScore) return false;
    if (wallet.score > filters.maxScore) return false;

    // Recommendation filter
    if (filters.recommendation.length) {
      const matchingRecs = filters.recommendation.filter(r => r !== 'not-for-dev');
      if (matchingRecs.length && !matchingRecs.includes(wallet.recommendation)) {
        return false;
      }
    }

    // Air gap filter
    if (filters.airGap !== null && wallet.airGap !== filters.airGap) {
      return false;
    }

    // Secure element filter
    if (filters.secureElement !== null && wallet.secureElement !== filters.secureElement) {
      return false;
    }

    // Open source filter
    if (filters.openSource.length && !filters.openSource.includes(wallet.openSource)) {
      return false;
    }

    // Price range filter
    if (wallet.price !== null) {
      if (wallet.price < filters.priceMin || wallet.price > filters.priceMax) {
        return false;
      }
    }

    // Connectivity filter
    if (filters.connectivity.length) {
      const hasConnectivity = filters.connectivity.some(conn =>
        wallet.connectivity.includes(conn)
      );
      if (!hasConnectivity) return false;
    }

    // Activity filter
    if (filters.active.length && !filters.active.includes(wallet.active)) {
      return false;
    }

    return true;
  });
}

function filterCryptoCards(
  cards: CryptoCard[],
  filters: FilterState
): CryptoCard[] {
  return cards.filter(card => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        card.name.toLowerCase().includes(searchLower) ||
        card.provider.toLowerCase().includes(searchLower) ||
        card.bestFor.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Score filter
    if (card.score < filters.minScore) return false;
    if (card.score > filters.maxScore) return false;

    // Card type filter
    if (filters.cardType.length && !filters.cardType.includes(card.cardType)) {
      return false;
    }

    // Region filter
    if (filters.region.length && !filters.region.includes(card.regionCode)) {
      return false;
    }

    // Business support filter
    if (filters.businessSupport !== null) {
      if (filters.businessSupport && card.businessSupport !== 'yes') return false;
    }

    // Cashback min filter
    if (filters.cashBackMin > 0 && card.cashBackMax !== null) {
      if (card.cashBackMax < filters.cashBackMin) return false;
    }

    return true;
  });
}

// Sort function
function sortWallets<T extends WalletData>(
  wallets: T[],
  sort: SortState
): T[] {
  return [...wallets].sort((a, b) => {
    let aValue: number | string = 0;
    let bValue: number | string = 0;

    switch (sort.field) {
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'chains':
        if (a.type === 'software' && b.type === 'software') {
          aValue = typeof (a as SoftwareWallet).chains === 'number' ? (a as SoftwareWallet).chains as number : 999;
          bValue = typeof (b as SoftwareWallet).chains === 'number' ? (b as SoftwareWallet).chains as number : 999;
        }
        break;
      case 'releasesPerMonth':
        if (a.type === 'software' && b.type === 'software') {
          aValue = (a as SoftwareWallet).releasesPerMonth ?? 0;
          bValue = (b as SoftwareWallet).releasesPerMonth ?? 0;
        }
        break;
      case 'price':
        if (a.type === 'hardware' && b.type === 'hardware') {
          aValue = (a as HardwareWallet).price ?? 999;
          bValue = (b as HardwareWallet).price ?? 999;
        }
        break;
      case 'cashBackMax':
        if (a.type === 'card' && b.type === 'card') {
          aValue = (a as CryptoCard).cashBackMax ?? 0;
          bValue = (b as CryptoCard).cashBackMax ?? 0;
        }
        break;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sort.direction === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });
}

export function ExploreContent({
  softwareWallets,
  hardwareWallets,
  cryptoCards,
}: ExploreContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('software');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showComparison, setShowComparison] = useState(false);

  // Filter and sort states for each tab
  const [softwareFilters, setSoftwareFilters] = useState<FilterState>(initialFilterState);
  const [softwareSort, setSoftwareSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  const [hardwareFilters, setHardwareFilters] = useState<FilterState>(initialFilterState);
  const [hardwareSort, setHardwareSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  const [cardFilters, setCardFilters] = useState<FilterState>(initialFilterState);
  const [cardSort, setCardSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  // Selected wallets for comparison (by ID)
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // Filtered and sorted wallets
  const filteredSoftware = useMemo(
    () => sortWallets(filterSoftwareWallets(softwareWallets, softwareFilters), softwareSort),
    [softwareWallets, softwareFilters, softwareSort]
  );

  const filteredHardware = useMemo(
    () => sortWallets(filterHardwareWallets(hardwareWallets, hardwareFilters), hardwareSort),
    [hardwareWallets, hardwareFilters, hardwareSort]
  );

  const filteredCards = useMemo(
    () => sortWallets(filterCryptoCards(cryptoCards, cardFilters), cardSort),
    [cryptoCards, cardFilters, cardSort]
  );

  // Get selected wallet objects
  const selectedSoftwareWallets = useMemo(
    () => softwareWallets.filter(w => selectedSoftware.includes(w.id)),
    [softwareWallets, selectedSoftware]
  );

  const selectedHardwareWallets = useMemo(
    () => hardwareWallets.filter(w => selectedHardware.includes(w.id)),
    [hardwareWallets, selectedHardware]
  );

  const selectedCardWallets = useMemo(
    () => cryptoCards.filter(w => selectedCards.includes(w.id)),
    [cryptoCards, selectedCards]
  );

  // Toggle selection handlers
  const toggleSoftwareSelect = useCallback((id: string) => {
    setSelectedSoftware(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  }, []);

  const toggleHardwareSelect = useCallback((id: string) => {
    setSelectedHardware(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  }, []);

  const toggleCardSelect = useCallback((id: string) => {
    setSelectedCards(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  }, []);

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'software':
        return {
          wallets: filteredSoftware,
          totalCount: softwareWallets.length,
          filters: softwareFilters,
          setFilters: setSoftwareFilters,
          sort: softwareSort,
          setSort: setSoftwareSort,
          selected: selectedSoftware,
          toggleSelect: toggleSoftwareSelect,
          selectedWallets: selectedSoftwareWallets,
          allWallets: softwareWallets,
          clearSelected: () => setSelectedSoftware([]),
        };
      case 'hardware':
        return {
          wallets: filteredHardware,
          totalCount: hardwareWallets.length,
          filters: hardwareFilters,
          setFilters: setHardwareFilters,
          sort: hardwareSort,
          setSort: setHardwareSort,
          selected: selectedHardware,
          toggleSelect: toggleHardwareSelect,
          selectedWallets: selectedHardwareWallets,
          allWallets: hardwareWallets,
          clearSelected: () => setSelectedHardware([]),
        };
      case 'cards':
        return {
          wallets: filteredCards,
          totalCount: cryptoCards.length,
          filters: cardFilters,
          setFilters: setCardFilters,
          sort: cardSort,
          setSort: setCardSort,
          selected: selectedCards,
          toggleSelect: toggleCardSelect,
          selectedWallets: selectedCardWallets,
          allWallets: cryptoCards,
          clearSelected: () => setSelectedCards([]),
        };
    }
  };

  const tabData = getCurrentTabData();
  const hasSelectedWallets = tabData.selected.length > 0;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('software')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'software'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Shield className="h-4 w-4" />
            Software ({softwareWallets.length})
            {selectedSoftware.length > 0 && (
              <span className="bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded">
                {selectedSoftware.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'hardware'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Cpu className="h-4 w-4" />
            Hardware ({hardwareWallets.length})
            {selectedHardware.length > 0 && (
              <span className="bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded">
                {selectedHardware.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'cards'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <CreditCard className="h-4 w-4" />
            Cards ({cryptoCards.length})
            {selectedCards.length > 0 && (
              <span className="bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded">
                {selectedCards.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Compare button */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            disabled={!hasSelectedWallets}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              hasSelectedWallets
                ? showComparison
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-primary text-primary hover:bg-primary/10'
                : 'border border-border text-muted-foreground cursor-not-allowed'
            )}
          >
            <GitCompare className="h-4 w-4" />
            Compare {hasSelectedWallets && `(${tabData.selected.length})`}
          </button>
        </div>
      </div>

      {/* Comparison panel */}
      {showComparison && hasSelectedWallets && (
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
          <ComparisonTool
            type={activeTab}
            selectedWallets={tabData.selectedWallets as WalletData[]}
            allWallets={tabData.allWallets as WalletData[]}
            onRemove={tabData.toggleSelect}
            onClear={tabData.clearSelected}
            onAdd={tabData.toggleSelect}
          />
        </div>
      )}

      {/* Filters */}
      <WalletFilters
        type={activeTab}
        filters={tabData.filters}
        sort={tabData.sort}
        onFiltersChange={tabData.setFilters}
        onSortChange={tabData.setSort}
        resultCount={tabData.wallets.length}
        totalCount={tabData.totalCount}
      />

      {/* Wallet table/grid */}
      <WalletTable
        wallets={tabData.wallets as WalletData[]}
        selectedIds={tabData.selected}
        onToggleSelect={tabData.toggleSelect}
        viewMode={viewMode}
        type={activeTab}
      />
    </div>
  );
}
