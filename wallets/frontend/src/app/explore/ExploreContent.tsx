'use client';

import { useState, useMemo, useCallback } from 'react';
import { Shield, Cpu, CreditCard, ArrowLeftRight, LayoutGrid, List, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import {
  WalletFilters,
  initialFilterState,
  type FilterState,
  type SortState,
} from '@/components/WalletFilters';
import { WalletTable } from '@/components/WalletTable';
import { ComparisonTool } from '@/components/ComparisonTool';
import type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData } from '@/types/wallets';
import {
  filterCryptoCards,
  filterHardwareWallets,
  filterRamps,
  filterSoftwareWallets,
  sortWallets,
  type FilterOptions,
  type SortField,
} from '@/lib/wallet-filtering';

interface ExploreContentProps {
  softwareWallets: SoftwareWallet[];
  hardwareWallets: HardwareWallet[];
  cryptoCards: CryptoCard[];
  ramps: Ramp[];
}

type TabType = 'software' | 'hardware' | 'cards' | 'ramps';
type ViewMode = 'grid' | 'table';

function toFilterOptions(filters: FilterState): FilterOptions {
  const opts: FilterOptions = {};

  if (filters.search) opts.search = filters.search;
  if (filters.minScore > 0) opts.minScore = filters.minScore;
  if (filters.maxScore < 100) opts.maxScore = filters.maxScore;

  if (filters.recommendation.length) {
    opts.recommendation = filters.recommendation as FilterOptions['recommendation'];
  }
  if (filters.platforms.length) {
    opts.platforms = filters.platforms as FilterOptions['platforms'];
  }
  if (filters.license.length) {
    opts.license = filters.license as FilterOptions['license'];
  }
  if (filters.features.length) {
    opts.features = filters.features as FilterOptions['features'];
  }
  if (filters.accountTypes.length) {
    opts.accountTypes = filters.accountTypes;
  }
  if (filters.active.length) {
    opts.active = filters.active as FilterOptions['active'];
  }
  if (filters.funding.length) {
    opts.funding = filters.funding as FilterOptions['funding'];
  }

  if (filters.airGap !== null) opts.airGap = filters.airGap;
  if (filters.secureElement !== null) opts.secureElement = filters.secureElement;

  if (filters.openSource.length) {
    // WalletFilters uses open/partial/closed labels; parser uses full/partial/closed.
    // We accept both values by mapping "open" -> "full".
    const mapped = filters.openSource.map(v => (v === 'open' ? 'full' : v));
    opts.openSource = mapped as FilterOptions['openSource'];
  }

  if (filters.priceMin > 0 || filters.priceMax < 500) {
    opts.priceRange = { min: filters.priceMin, max: filters.priceMax };
  }
  if (filters.connectivity.length) opts.connectivity = filters.connectivity;

  if (filters.cardType.length) opts.cardType = filters.cardType as FilterOptions['cardType'];
  if (filters.custody.length) opts.custody = filters.custody as FilterOptions['custody'];
  if (filters.cardStatus.length) opts.cardStatus = filters.cardStatus as FilterOptions['cardStatus'];
  if (filters.region.length) opts.region = filters.region;
  if (filters.businessSupport !== null) opts.businessSupport = filters.businessSupport;
  if (filters.noAnnualFee !== null) opts.noAnnualFee = filters.noAnnualFee;
  if (filters.cashBackMin > 0) opts.cashBackMin = filters.cashBackMin;

  return opts;
}

export function ExploreContent({
  softwareWallets,
  hardwareWallets,
  cryptoCards,
  ramps,
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

  const [rampFilters, setRampFilters] = useState<FilterState>(initialFilterState);
  const [rampSort, setRampSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  // Selected wallets for comparison (by ID)
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedRamps, setSelectedRamps] = useState<string[]>([]);

  // Filtered and sorted wallets
  const filteredSoftware = useMemo(
    () =>
      sortWallets(
        filterSoftwareWallets(softwareWallets, toFilterOptions(softwareFilters)),
        softwareSort.field as SortField,
        softwareSort.direction
      ),
    [softwareWallets, softwareFilters, softwareSort]
  );

  const filteredHardware = useMemo(
    () =>
      sortWallets(
        filterHardwareWallets(hardwareWallets, toFilterOptions(hardwareFilters)),
        hardwareSort.field as SortField,
        hardwareSort.direction
      ),
    [hardwareWallets, hardwareFilters, hardwareSort]
  );

  const filteredCards = useMemo(
    () =>
      sortWallets(
        filterCryptoCards(cryptoCards, toFilterOptions(cardFilters)),
        cardSort.field as SortField,
        cardSort.direction
      ),
    [cryptoCards, cardFilters, cardSort]
  );

  const filteredRamps = useMemo(
    () =>
      sortWallets(
        filterRamps(ramps, toFilterOptions(rampFilters)),
        rampSort.field as SortField,
        rampSort.direction
      ),
    [ramps, rampFilters, rampSort]
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

  const selectedRampWallets = useMemo(
    () => ramps.filter(w => selectedRamps.includes(w.id)),
    [ramps, selectedRamps]
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

  const toggleRampSelect = useCallback((id: string) => {
    setSelectedRamps(prev =>
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
      case 'ramps':
        return {
          wallets: filteredRamps,
          totalCount: ramps.length,
          filters: rampFilters,
          setFilters: setRampFilters,
          sort: rampSort,
          setSort: setRampSort,
          selected: selectedRamps,
          toggleSelect: toggleRampSelect,
          selectedWallets: selectedRampWallets,
          allWallets: ramps,
          clearSelected: () => setSelectedRamps([]),
        };
    }
  };

  const tabData = getCurrentTabData();
  const hasSelectedWallets = tabData.selected.length > 0;

  return (
    <div className="space-y-6">
      <Panel tone="muted" className="p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button
            onClick={() => setActiveTab('software')}
            variant={activeTab === 'software' ? 'primary' : 'secondary'}
            size="sm"
            className="min-h-10 shrink-0 rounded-xl"
          >
            <Shield className="h-4 w-4" />
            Software ({softwareWallets.length})
            {selectedSoftware.length > 0 && (
              <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                {selectedSoftware.length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setActiveTab('hardware')}
            variant={activeTab === 'hardware' ? 'primary' : 'secondary'}
            size="sm"
            className="min-h-10 shrink-0 rounded-xl"
          >
            <Cpu className="h-4 w-4" />
            Hardware ({hardwareWallets.length})
            {selectedHardware.length > 0 && (
              <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                {selectedHardware.length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setActiveTab('cards')}
            variant={activeTab === 'cards' ? 'primary' : 'secondary'}
            size="sm"
            className="min-h-10 shrink-0 rounded-xl"
          >
            <CreditCard className="h-4 w-4" />
            Cards ({cryptoCards.length})
            {selectedCards.length > 0 && (
              <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                {selectedCards.length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setActiveTab('ramps')}
            variant={activeTab === 'ramps' ? 'primary' : 'secondary'}
            size="sm"
            className="min-h-10 shrink-0 rounded-xl"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Ramps ({ramps.length})
            {selectedRamps.length > 0 && (
              <span className="rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                {selectedRamps.length}
              </span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:self-end">
          <div className="flex overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex h-10 w-10 items-center justify-center transition-colors',
                viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={() => setShowComparison(!showComparison)}
            disabled={!hasSelectedWallets}
            variant={showComparison ? 'primary' : 'outline'}
            size="sm"
            className="min-h-10 flex-1 rounded-xl sm:flex-none"
          >
            <GitCompare className="h-4 w-4" />
            Compare {hasSelectedWallets && `(${tabData.selected.length})`}
          </Button>
        </div>
        </div>
      </Panel>

      {showComparison && hasSelectedWallets && (
        <Panel tone="accent" className="p-4">
          <ComparisonTool
            type={activeTab}
            selectedWallets={tabData.selectedWallets as WalletData[]}
            allWallets={tabData.allWallets as WalletData[]}
            onRemove={tabData.toggleSelect}
            onClear={tabData.clearSelected}
            onAdd={tabData.toggleSelect}
          />
        </Panel>
      )}

      <WalletFilters
        type={activeTab}
        filters={tabData.filters}
        sort={tabData.sort}
        onFiltersChange={tabData.setFilters}
        onSortChange={tabData.setSort}
        resultCount={tabData.wallets.length}
        totalCount={tabData.totalCount}
      />

      <WalletTable
        wallets={tabData.wallets as WalletData[]}
        selectedIds={tabData.selected}
        onToggleSelect={tabData.toggleSelect}
        viewMode={viewMode}
        type={activeTab as 'software' | 'hardware' | 'cards' | 'ramps'}
      />
    </div>
  );
}
