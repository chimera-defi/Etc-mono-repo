'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Cpu, CreditCard, ArrowLeftRight, LayoutGrid, List, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';
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

const allowedValues = {
  platforms: new Set(['mobile', 'browser', 'desktop', 'web']),
  features: new Set(['txSimulation', 'scamAlerts', 'hardwareSupport', 'testnets']),
  license: new Set(['open', 'partial', 'closed']),
  recommendation: new Set(['recommended', 'situational', 'avoid', 'not-for-dev']),
  openSource: new Set(['full', 'partial', 'closed']),
  cardType: new Set(['credit', 'debit', 'prepaid', 'business']),
  custody: new Set(['self', 'exchange', 'cefi']),
  cardStatus: new Set(['active', 'verify', 'launching']),
  region: new Set(['US', 'EU', 'UK', 'CA', 'AU', 'Global']),
  active: new Set(['active', 'slow', 'inactive', 'private']),
  funding: new Set(['sustainable', 'vc', 'risky']),
  connectivity: new Set(['USB-C', 'USB', 'Bluetooth', 'QR', 'NFC', 'MicroSD', 'WiFi']),
  accountTypes: new Set(['EOA', 'Safe', 'EIP-4337', 'EIP-7702']),
};

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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('software');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showComparison, setShowComparison] = useState(false);
  const lastParamsRef = useRef<string | null>(null);

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

  useEffect(() => {
    const paramsKey = searchParams.toString();
    if (paramsKey === lastParamsRef.current) return;
    lastParamsRef.current = paramsKey;

    const queryParam = (searchParams.get('q') || '').trim();
    const typeParam = searchParams.get('type');
    const validTabs: TabType[] = ['software', 'hardware', 'cards', 'ramps'];

    if (typeParam && validTabs.includes(typeParam as TabType)) {
      setActiveTab(typeParam as TabType);
    }

    const parseListParam = (key: string, allowed?: Set<string>, toLower: boolean = true) => {
      const raw = searchParams.get(key);
      if (!raw) return [];
      const items = raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => (toLower ? item.toLowerCase() : item));
      if (!allowed) return items;
      return items.filter((item) => allowed.has(item));
    };

    const parseNumberParam = (key: string) => {
      const raw = searchParams.get(key);
      if (!raw) return null;
      const value = Number(raw);
      return Number.isFinite(value) ? value : null;
    };

    const parseBooleanParam = (key: string) => {
      const raw = searchParams.get(key);
      if (!raw) return null;
      const normalized = raw.toLowerCase();
      if (['true', '1', 'yes'].includes(normalized)) return true;
      if (['false', '0', 'no'].includes(normalized)) return false;
      return null;
    };

    const nextFilters: FilterState = {
      ...initialFilterState,
      search: queryParam,
    };

    const minScore = parseNumberParam('minScore');
    const maxScore = parseNumberParam('maxScore');
    if (minScore !== null) nextFilters.minScore = Math.min(100, Math.max(0, minScore));
    if (maxScore !== null) nextFilters.maxScore = Math.min(100, Math.max(0, maxScore));

    nextFilters.recommendation = parseListParam('recommendation', allowedValues.recommendation);
    nextFilters.platforms = parseListParam('platforms', allowedValues.platforms);
    nextFilters.features = parseListParam('features', allowedValues.features);
    nextFilters.license = parseListParam('license', allowedValues.license);
    nextFilters.accountTypes = parseListParam('accountTypes', allowedValues.accountTypes, false);
    nextFilters.active = parseListParam('active', allowedValues.active);
    nextFilters.funding = parseListParam('funding', allowedValues.funding);
    nextFilters.openSource = parseListParam('openSource', allowedValues.openSource);
    nextFilters.connectivity = parseListParam('connectivity', allowedValues.connectivity, false);
    nextFilters.cardType = parseListParam('cardType', allowedValues.cardType);
    nextFilters.custody = parseListParam('custody', allowedValues.custody);
    nextFilters.cardStatus = parseListParam('cardStatus', allowedValues.cardStatus);
    nextFilters.region = parseListParam('region', allowedValues.region, false);

    const airGap = parseBooleanParam('airGap');
    const secureElement = parseBooleanParam('secureElement');
    const businessSupport = parseBooleanParam('businessSupport');
    const noAnnualFee = parseBooleanParam('noAnnualFee');

    if (airGap !== null) nextFilters.airGap = airGap;
    if (secureElement !== null) nextFilters.secureElement = secureElement;
    if (businessSupport !== null) nextFilters.businessSupport = businessSupport;
    if (noAnnualFee !== null) nextFilters.noAnnualFee = noAnnualFee;

    const cashBackMin = parseNumberParam('cashBackMin');
    if (cashBackMin !== null) nextFilters.cashBackMin = Math.min(10, Math.max(0, cashBackMin));

    const priceMin = parseNumberParam('priceMin');
    const priceMax = parseNumberParam('priceMax');
    if (priceMin !== null) nextFilters.priceMin = Math.min(500, Math.max(0, priceMin));
    if (priceMax !== null) nextFilters.priceMax = Math.min(500, Math.max(0, priceMax));

    setSoftwareFilters(nextFilters);
    setHardwareFilters(nextFilters);
    setCardFilters(nextFilters);
    setRampFilters(nextFilters);

    setSelectedSoftware([]);
    setSelectedHardware([]);
    setSelectedCards([]);
    setSelectedRamps([]);
    setShowComparison(false);
  }, [searchParams]);

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
          <button
            onClick={() => setActiveTab('ramps')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'ramps'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Ramps ({ramps.length})
            {selectedRamps.length > 0 && (
              <span className="bg-primary-foreground/20 text-xs px-1.5 py-0.5 rounded">
                {selectedRamps.length}
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
        type={activeTab as 'software' | 'hardware' | 'cards' | 'ramps'}
      />
    </div>
  );
}
