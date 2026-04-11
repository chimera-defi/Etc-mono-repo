'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Shield, Cpu, CreditCard, ArrowLeftRight, LayoutGrid, List, GitCompare, Share2, ArrowUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  WalletFilters,
  initialFilterState,
  type FilterState,
  type SortState,
} from '@/components/WalletFilters';
import { WalletTable } from '@/components/WalletTable';
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
import {
  DEFAULT_SORTS,
  FILTER_PARAM_KEYS,
  SORT_PARAM_KEYS,
  clearControlledQueryParams,
  normalizeFilterState,
  normalizeSortState,
  parseFilterState,
  parseSearchParam,
  parseSortState,
  serializeFilterState,
  serializeSortState,
  type ExploreTab,
} from '@/lib/explore-url-state';

const ComparisonTool = dynamic(
  () => import('@/components/ComparisonTool').then((module) => module.ComparisonTool),
  { ssr: false }
);

interface ExploreContentProps {
  softwareWallets: SoftwareWallet[];
  hardwareWallets: HardwareWallet[];
  cryptoCards: CryptoCard[];
  ramps: Ramp[];
}

type TabType = ExploreTab;
type ViewMode = 'grid' | 'table';
type PresetConfig = {
  id: string;
  label: string;
  description: string;
  icon: string;
  filters: Partial<FilterState>;
  sort?: SortState;
  viewMode?: ViewMode;
};

const MAX_COMPARE_ITEMS = 4;

function isTabType(value: string | null): value is TabType {
  return value === 'software' || value === 'hardware' || value === 'cards' || value === 'ramps';
}

function isViewMode(value: string | null): value is ViewMode {
  return value === 'grid' || value === 'table';
}

function parseSelectedIds(value: string | null, validIds: Set<string>): string[] {
  if (!value) return [];
  const ids = value
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0 && validIds.has(id));

  const uniqueIds: string[] = [];
  for (const id of ids) {
    if (!uniqueIds.includes(id)) uniqueIds.push(id);
  }

  return uniqueIds.slice(0, MAX_COMPARE_ITEMS);
}

function equalFilterStates(a: FilterState, b: FilterState) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function equalSortStates(a: SortState, b: SortState) {
  return a.field === b.field && a.direction === b.direction;
}

const QUICK_PRESETS: Record<TabType, PresetConfig[]> = {
  software: [
    {
      id: 'core-wallets',
      label: 'Core Wallets',
      icon: '📱',
      description: 'Mobile + browser-extension coverage first.',
      filters: { platforms: ['mobile', 'browser'], minScore: 55 },
    },
    {
      id: 'open-source',
      label: 'Open Source',
      icon: '🔓',
      description: 'Public codebases with current or recent activity.',
      filters: { license: ['open'], active: ['active', 'slow'] },
    },
    {
      id: 'aa-wallets',
      label: 'AA / Smart Accounts',
      icon: '⚡',
      description: 'Safe, 4337, and 7702-ready options.',
      filters: { accountTypes: ['Safe', 'EIP-4337', 'EIP-7702'] },
    },
    {
      id: 'simulation',
      label: 'Simulation',
      icon: '🔍',
      description: 'Pre-signing safety features.',
      filters: { features: ['txSimulation'], minScore: 50 },
    },
  ],
  hardware: [
    {
      id: 'air-gapped',
      label: 'Air-Gapped',
      icon: '📡',
      description: 'QR or MicroSD-first signing flows.',
      filters: { airGap: true, minScore: 60 },
    },
    {
      id: 'budget',
      label: 'Under $100',
      icon: '💰',
      description: 'Budget-oriented devices and DIY kits.',
      filters: { priceMin: 0, priceMax: 100 },
      sort: { field: 'price', direction: 'asc' },
    },
    {
      id: 'open-active',
      label: 'Open + Active',
      icon: '✅',
      description: 'Public firmware with active maintenance.',
      filters: { openSource: ['open'], active: ['active'] },
    },
    {
      id: 'phone-friendly',
      label: 'Phone-Friendly',
      icon: '🔗',
      description: 'QR, NFC, BT, or direct mobile-friendly links.',
      filters: { connectivity: ['QR', 'NFC', 'Bluetooth', 'USB-C'], minScore: 50 },
    },
  ],
  cards: [
    {
      id: 'self-custody',
      label: 'Self-Custody',
      icon: '🔐',
      description: 'Keep spending control outside exchanges.',
      filters: { custody: ['self'], minScore: 70 },
    },
    {
      id: 'no-fee',
      label: 'No Annual Fee',
      icon: '💳',
      description: 'Eliminate fixed card-cost drag.',
      filters: { noAnnualFee: true, minScore: 70 },
    },
    {
      id: 'us-cards',
      label: 'US Available',
      icon: '🌎',
      description: 'Quick shortlist for the US market.',
      filters: { region: ['US'], minScore: 70 },
    },
    {
      id: 'business',
      label: 'Business',
      icon: '🏢',
      description: 'Cards with business or corporate support.',
      filters: { businessSupport: true },
    },
  ],
  ramps: [
    {
      id: 'top-tier',
      label: 'Top Tier',
      icon: '🏆',
      description: 'Only the higher-scoring active ramps.',
      filters: { recommendation: ['recommended'], active: ['active'], minScore: 80 },
    },
    {
      id: 'low-fee',
      label: 'Low-Fee',
      icon: '⚡',
      description: 'Fee-model language biased toward lower friction.',
      filters: { search: 'low', minScore: 70 },
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      icon: '🏗️',
      description: 'Providers marketed for enterprise or custom flows.',
      filters: { search: 'enterprise', minScore: 70 },
    },
    {
      id: 'us-focus',
      label: 'US Focus',
      icon: '🌎',
      description: 'Coverage or best-fit language biased toward the US.',
      filters: { search: 'US', minScore: 70 },
    },
  ],
};

const TAB_RESULT_LABELS: Record<TabType, string> = {
  software: 'software wallets',
  hardware: 'hardware wallets',
  cards: 'crypto cards',
  ramps: 'ramp providers',
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topAnchorRef = useRef<HTMLDivElement | null>(null);
  const hydratedFromUrlRef = useRef(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const updateUrlParams = useCallback((mutate: (params: URLSearchParams) => void, mode: 'push' | 'replace' = 'push') => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery === currentQuery) return;
    const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    if (mode === 'replace') router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }, [pathname, router, searchParams]);

  // Filter and sort states for each tab
  const [softwareFilters, setSoftwareFilters] = useState<FilterState>(initialFilterState);
  const [softwareSort, setSoftwareSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  const [hardwareFilters, setHardwareFilters] = useState<FilterState>(initialFilterState);
  const [hardwareSort, setHardwareSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  const [cardFilters, setCardFilters] = useState<FilterState>(initialFilterState);
  const [cardSort, setCardSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  const [rampFilters, setRampFilters] = useState<FilterState>(initialFilterState);
  const [rampSort, setRampSort] = useState<SortState>({ field: 'score', direction: 'desc' });

  const softwareIdSet = useMemo(() => new Set(softwareWallets.map((wallet) => wallet.id)), [softwareWallets]);
  const hardwareIdSet = useMemo(() => new Set(hardwareWallets.map((wallet) => wallet.id)), [hardwareWallets]);
  const cardIdSet = useMemo(() => new Set(cryptoCards.map((card) => card.id)), [cryptoCards]);
  const rampIdSet = useMemo(() => new Set(ramps.map((ramp) => ramp.id)), [ramps]);

  const activeTab = useMemo<TabType>(() => {
    const tabParam = searchParams.get('tab');
    return isTabType(tabParam) ? tabParam : 'software';
  }, [searchParams]);

  const viewMode = useMemo<ViewMode>(() => {
    const viewParam = searchParams.get('view');
    return isViewMode(viewParam) ? viewParam : 'grid';
  }, [searchParams]);

  const showComparison = useMemo(() => {
    const compareParam = searchParams.get('compare');
    return compareParam === '1' || compareParam === 'true';
  }, [searchParams]);

  const hasTypedSelections = useMemo(
    () => searchParams.has('sw') || searchParams.has('hw') || searchParams.has('cd') || searchParams.has('rp'),
    [searchParams]
  );
  const legacySelected = searchParams.get('selected');

  const selectedSoftware = useMemo(() => {
    if (hasTypedSelections) return parseSelectedIds(searchParams.get('sw'), softwareIdSet);
    return activeTab === 'software' ? parseSelectedIds(legacySelected, softwareIdSet) : [];
  }, [activeTab, hasTypedSelections, legacySelected, searchParams, softwareIdSet]);

  const selectedHardware = useMemo(() => {
    if (hasTypedSelections) return parseSelectedIds(searchParams.get('hw'), hardwareIdSet);
    return activeTab === 'hardware' ? parseSelectedIds(legacySelected, hardwareIdSet) : [];
  }, [activeTab, hasTypedSelections, legacySelected, searchParams, hardwareIdSet]);

  const selectedCards = useMemo(() => {
    if (hasTypedSelections) return parseSelectedIds(searchParams.get('cd'), cardIdSet);
    return activeTab === 'cards' ? parseSelectedIds(legacySelected, cardIdSet) : [];
  }, [activeTab, hasTypedSelections, legacySelected, searchParams, cardIdSet]);

  const selectedRamps = useMemo(() => {
    if (hasTypedSelections) return parseSelectedIds(searchParams.get('rp'), rampIdSet);
    return activeTab === 'ramps' ? parseSelectedIds(legacySelected, rampIdSet) : [];
  }, [activeTab, hasTypedSelections, legacySelected, searchParams, rampIdSet]);

  const setActiveTab = useCallback((nextTab: TabType) => {
    updateUrlParams((params) => {
      params.set('tab', nextTab);
    });
  }, [updateUrlParams]);

  const setViewMode = useCallback((nextViewMode: ViewMode) => {
    updateUrlParams((params) => {
      if (nextViewMode === 'grid') params.delete('view');
      else params.set('view', nextViewMode);
    });
  }, [updateUrlParams]);

  const setShowComparison = useCallback((nextShow: boolean) => {
    updateUrlParams((params) => {
      if (nextShow) params.set('compare', '1');
      else params.delete('compare');
    });
  }, [updateUrlParams]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight * 2.5);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const searchParam = parseSearchParam(searchParams.get('search'));

    const parsedSoftwareFilters = parseFilterState(searchParams.get(FILTER_PARAM_KEYS.software));
    const parsedHardwareFilters = parseFilterState(searchParams.get(FILTER_PARAM_KEYS.hardware));
    const parsedCardFilters = parseFilterState(searchParams.get(FILTER_PARAM_KEYS.cards));
    const parsedRampFilters = parseFilterState(searchParams.get(FILTER_PARAM_KEYS.ramps));

    if (parsedSoftwareFilters) {
      setSoftwareFilters((prev) => (equalFilterStates(prev, parsedSoftwareFilters) ? prev : parsedSoftwareFilters));
    }
    if (parsedHardwareFilters) {
      setHardwareFilters((prev) => (equalFilterStates(prev, parsedHardwareFilters) ? prev : parsedHardwareFilters));
    }
    if (parsedCardFilters) {
      setCardFilters((prev) => (equalFilterStates(prev, parsedCardFilters) ? prev : parsedCardFilters));
    }
    if (parsedRampFilters) {
      setRampFilters((prev) => (equalFilterStates(prev, parsedRampFilters) ? prev : parsedRampFilters));
    }

    const parsedSoftwareSort = parseSortState(searchParams.get(SORT_PARAM_KEYS.software), 'software');
    const parsedHardwareSort = parseSortState(searchParams.get(SORT_PARAM_KEYS.hardware), 'hardware');
    const parsedCardSort = parseSortState(searchParams.get(SORT_PARAM_KEYS.cards), 'cards');
    const parsedRampSort = parseSortState(searchParams.get(SORT_PARAM_KEYS.ramps), 'ramps');

    setSoftwareSort((prev) => (equalSortStates(prev, parsedSoftwareSort) ? prev : parsedSoftwareSort));
    setHardwareSort((prev) => (equalSortStates(prev, parsedHardwareSort) ? prev : parsedHardwareSort));
    setCardSort((prev) => (equalSortStates(prev, parsedCardSort) ? prev : parsedCardSort));
    setRampSort((prev) => (equalSortStates(prev, parsedRampSort) ? prev : parsedRampSort));

    const hasSerializedFilterState =
      !!parsedSoftwareFilters || !!parsedHardwareFilters || !!parsedCardFilters || !!parsedRampFilters;

    if (!hasSerializedFilterState) {
      if (activeTab === 'software') {
        setSoftwareFilters((prev) => (prev.search === searchParam ? prev : { ...prev, search: searchParam }));
      }
      if (activeTab === 'hardware') {
        setHardwareFilters((prev) => (prev.search === searchParam ? prev : { ...prev, search: searchParam }));
      }
      if (activeTab === 'cards') {
        setCardFilters((prev) => (prev.search === searchParam ? prev : { ...prev, search: searchParam }));
      }
      if (activeTab === 'ramps') {
        setRampFilters((prev) => (prev.search === searchParam ? prev : { ...prev, search: searchParam }));
      }
    }

    hydratedFromUrlRef.current = true;
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (!hydratedFromUrlRef.current) return;

    const canonicalSoftwareFilters = normalizeFilterState(softwareFilters);
    const canonicalHardwareFilters = normalizeFilterState(hardwareFilters);
    const canonicalCardFilters = normalizeFilterState(cardFilters);
    const canonicalRampFilters = normalizeFilterState(rampFilters);

    const canonicalSoftwareSort = normalizeSortState(softwareSort, 'software');
    const canonicalHardwareSort = normalizeSortState(hardwareSort, 'hardware');
    const canonicalCardSort = normalizeSortState(cardSort, 'cards');
    const canonicalRampSort = normalizeSortState(rampSort, 'ramps');

    const params = new URLSearchParams(searchParams.toString());
    clearControlledQueryParams(params);
    params.set('tab', activeTab);
    if (viewMode !== 'grid') params.set('view', viewMode);

    if (selectedSoftware.length) params.set('sw', selectedSoftware.join(','));
    if (selectedHardware.length) params.set('hw', selectedHardware.join(','));
    if (selectedCards.length) params.set('cd', selectedCards.join(','));
    if (selectedRamps.length) params.set('rp', selectedRamps.join(','));

    const serializedSoftwareFilters = serializeFilterState(canonicalSoftwareFilters);
    const serializedHardwareFilters = serializeFilterState(canonicalHardwareFilters);
    const serializedCardFilters = serializeFilterState(canonicalCardFilters);
    const serializedRampFilters = serializeFilterState(canonicalRampFilters);

    if (serializedSoftwareFilters) params.set(FILTER_PARAM_KEYS.software, serializedSoftwareFilters);
    if (serializedHardwareFilters) params.set(FILTER_PARAM_KEYS.hardware, serializedHardwareFilters);
    if (serializedCardFilters) params.set(FILTER_PARAM_KEYS.cards, serializedCardFilters);
    if (serializedRampFilters) params.set(FILTER_PARAM_KEYS.ramps, serializedRampFilters);

    const serializedSoftwareSort = serializeSortState(canonicalSoftwareSort, 'software');
    const serializedHardwareSort = serializeSortState(canonicalHardwareSort, 'hardware');
    const serializedCardSort = serializeSortState(canonicalCardSort, 'cards');
    const serializedRampSort = serializeSortState(canonicalRampSort, 'ramps');

    if (serializedSoftwareSort) params.set(SORT_PARAM_KEYS.software, serializedSoftwareSort);
    if (serializedHardwareSort) params.set(SORT_PARAM_KEYS.hardware, serializedHardwareSort);
    if (serializedCardSort) params.set(SORT_PARAM_KEYS.cards, serializedCardSort);
    if (serializedRampSort) params.set(SORT_PARAM_KEYS.ramps, serializedRampSort);

    const hasAnySelections =
      selectedSoftware.length > 0 ||
      selectedHardware.length > 0 ||
      selectedCards.length > 0 ||
      selectedRamps.length > 0;
    if (showComparison && hasAnySelections) params.set('compare', '1');

    const activeSearch = (
      activeTab === 'software'
        ? canonicalSoftwareFilters.search
        : activeTab === 'hardware'
        ? canonicalHardwareFilters.search
        : activeTab === 'cards'
        ? canonicalCardFilters.search
        : canonicalRampFilters.search
    );
    if (activeSearch) params.set('search', activeSearch);

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [
    activeTab,
    viewMode,
    showComparison,
    selectedSoftware,
    selectedHardware,
    selectedCards,
    selectedRamps,
    softwareFilters,
    hardwareFilters,
    cardFilters,
    rampFilters,
    softwareSort,
    hardwareSort,
    cardSort,
    rampSort,
    pathname,
    router,
    searchParams,
  ]);

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

  const totalSelectedCount =
    selectedSoftware.length +
    selectedHardware.length +
    selectedCards.length +
    selectedRamps.length;

  useEffect(() => {
    if (!showComparison || totalSelectedCount > 0) return;
    updateUrlParams((params) => {
      params.delete('compare');
    }, 'replace');
  }, [showComparison, totalSelectedCount, updateUrlParams]);

  // Toggle selection handlers
  const toggleSelectionParam = useCallback((
    param: 'sw' | 'hw' | 'cd' | 'rp',
    currentIds: string[],
    id: string
  ) => {
    const nextIds = currentIds.includes(id)
      ? currentIds.filter((value) => value !== id)
      : currentIds.length < MAX_COMPARE_ITEMS
      ? [...currentIds, id]
      : currentIds;

    updateUrlParams((params) => {
      if (nextIds.length > 0) params.set(param, nextIds.join(','));
      else params.delete(param);
    });
  }, [updateUrlParams]);

  const clearSelectionParam = useCallback((param: 'sw' | 'hw' | 'cd' | 'rp') => {
    updateUrlParams((params) => {
      params.delete(param);
    });
  }, [updateUrlParams]);

  const toggleSoftwareSelect = useCallback((id: string) => {
    toggleSelectionParam('sw', selectedSoftware, id);
  }, [selectedSoftware, toggleSelectionParam]);

  const toggleHardwareSelect = useCallback((id: string) => {
    toggleSelectionParam('hw', selectedHardware, id);
  }, [selectedHardware, toggleSelectionParam]);

  const toggleCardSelect = useCallback((id: string) => {
    toggleSelectionParam('cd', selectedCards, id);
  }, [selectedCards, toggleSelectionParam]);

  const toggleRampSelect = useCallback((id: string) => {
    toggleSelectionParam('rp', selectedRamps, id);
  }, [selectedRamps, toggleSelectionParam]);

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
          clearSelected: () => clearSelectionParam('sw'),
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
          clearSelected: () => clearSelectionParam('hw'),
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
          clearSelected: () => clearSelectionParam('cd'),
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
          clearSelected: () => clearSelectionParam('rp'),
        };
    }
  };

  const tabData = getCurrentTabData();
  const hasSelectedWallets = tabData.selected.length > 0;
  const activePresets = QUICK_PRESETS[activeTab];
  const resultAnnouncement = `${tabData.wallets.length} of ${tabData.totalCount} ${TAB_RESULT_LABELS[activeTab]} match current filters`;

  const formatTabCount = useCallback((filteredCount: number, totalCount: number) => {
    return filteredCount < totalCount ? `${filteredCount}/${totalCount}` : `${totalCount}`;
  }, []);

  const softwareTabCount = formatTabCount(filteredSoftware.length, softwareWallets.length);
  const hardwareTabCount = formatTabCount(filteredHardware.length, hardwareWallets.length);
  const cardsTabCount = formatTabCount(filteredCards.length, cryptoCards.length);
  const rampsTabCount = formatTabCount(filteredRamps.length, ramps.length);

  const pushTabState = useCallback(
    (tab: TabType, filters: FilterState, sort: SortState, nextViewMode?: ViewMode) => {
      const canonicalFilters = normalizeFilterState(filters);
      const canonicalSort = normalizeSortState(sort, tab);

      updateUrlParams((params) => {
        params.set('tab', tab);

        const resolvedViewMode = nextViewMode || viewMode;
        if (resolvedViewMode !== 'grid') params.set('view', resolvedViewMode);
        else params.delete('view');

        const serializedFilters = serializeFilterState(canonicalFilters);
        if (serializedFilters) params.set(FILTER_PARAM_KEYS[tab], serializedFilters);
        else params.delete(FILTER_PARAM_KEYS[tab]);

        const serializedSort = serializeSortState(canonicalSort, tab);
        if (serializedSort) params.set(SORT_PARAM_KEYS[tab], serializedSort);
        else params.delete(SORT_PARAM_KEYS[tab]);

        const activeSearch = canonicalFilters.search;
        if (activeSearch) params.set('search', activeSearch);
        else params.delete('search');
      });
    },
    [updateUrlParams, viewMode]
  );

  const applyPreset = useCallback((preset: PresetConfig) => {
    const nextFilters = normalizeFilterState({ ...initialFilterState, ...preset.filters });
    const nextViewMode = preset.viewMode || viewMode;

    switch (activeTab) {
      case 'software': {
        const nextSort = normalizeSortState(preset.sort || DEFAULT_SORTS.software, 'software');
        setSoftwareFilters(nextFilters);
        setSoftwareSort(nextSort);
        pushTabState('software', nextFilters, nextSort, nextViewMode);
        break;
      }
      case 'hardware': {
        const nextSort = normalizeSortState(preset.sort || DEFAULT_SORTS.hardware, 'hardware');
        setHardwareFilters(nextFilters);
        setHardwareSort(nextSort);
        pushTabState('hardware', nextFilters, nextSort, nextViewMode);
        break;
      }
      case 'cards': {
        const nextSort = normalizeSortState(preset.sort || DEFAULT_SORTS.cards, 'cards');
        setCardFilters(nextFilters);
        setCardSort(nextSort);
        pushTabState('cards', nextFilters, nextSort, nextViewMode);
        break;
      }
      case 'ramps': {
        const nextSort = normalizeSortState(preset.sort || DEFAULT_SORTS.ramps, 'ramps');
        setRampFilters(nextFilters);
        setRampSort(nextSort);
        pushTabState('ramps', nextFilters, nextSort, nextViewMode);
        break;
      }
    }

    if (preset.viewMode) {
      setViewMode(preset.viewMode);
    }
  }, [activeTab, pushTabState, setViewMode, viewMode]);

  const resetActiveTab = useCallback(() => {
    switch (activeTab) {
      case 'software':
        setSoftwareFilters(initialFilterState);
        setSoftwareSort(DEFAULT_SORTS.software);
        pushTabState('software', initialFilterState, DEFAULT_SORTS.software);
        break;
      case 'hardware':
        setHardwareFilters(initialFilterState);
        setHardwareSort(DEFAULT_SORTS.hardware);
        pushTabState('hardware', initialFilterState, DEFAULT_SORTS.hardware);
        break;
      case 'cards':
        setCardFilters(initialFilterState);
        setCardSort(DEFAULT_SORTS.cards);
        pushTabState('cards', initialFilterState, DEFAULT_SORTS.cards);
        break;
      case 'ramps':
        setRampFilters(initialFilterState);
        setRampSort(DEFAULT_SORTS.ramps);
        pushTabState('ramps', initialFilterState, DEFAULT_SORTS.ramps);
        break;
    }
  }, [activeTab, pushTabState]);

  const scrollToTopAnchor = useCallback(() => {
    topAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div ref={topAnchorRef} className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div role="tablist" aria-label="Wallet categories" className="flex gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'software'}
            aria-controls="tabpanel-wallets"
            onClick={() => setActiveTab('software')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === 'software'
                ? 'bg-indigo-500/25 text-indigo-100 border border-indigo-400/60 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                : 'bg-indigo-900/20 text-indigo-300 border border-transparent hover:bg-indigo-500/15 hover:border-indigo-500/30'
            )}
          >
            <Shield className="h-4 w-4" />
            <span className="sr-only sm:hidden">Software ({softwareTabCount})</span>
            <span className="hidden sm:inline">Software ({softwareTabCount})</span>
            {selectedSoftware.length > 0 && (
              <span className="hidden sm:inline-flex animate-fade-in bg-indigo-400/20 text-xs px-1.5 py-0.5 rounded">
                {selectedSoftware.length}
              </span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'hardware'}
            aria-controls="tabpanel-wallets"
            onClick={() => setActiveTab('hardware')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === 'hardware'
                ? 'bg-amber-500/25 text-amber-100 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-amber-900/20 text-amber-300 border border-transparent hover:bg-amber-500/15 hover:border-amber-500/30'
            )}
          >
            <Cpu className="h-4 w-4" />
            <span className="sr-only sm:hidden">Hardware ({hardwareTabCount})</span>
            <span className="hidden sm:inline">Hardware ({hardwareTabCount})</span>
            {selectedHardware.length > 0 && (
              <span className="hidden sm:inline-flex animate-fade-in bg-amber-400/20 text-xs px-1.5 py-0.5 rounded">
                {selectedHardware.length}
              </span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'cards'}
            aria-controls="tabpanel-wallets"
            onClick={() => setActiveTab('cards')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === 'cards'
                ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-900/20 text-emerald-300 border border-transparent hover:bg-emerald-500/15 hover:border-emerald-500/30'
            )}
          >
            <CreditCard className="h-4 w-4" />
            <span className="sr-only sm:hidden">Cards ({cardsTabCount})</span>
            <span className="hidden sm:inline">Cards ({cardsTabCount})</span>
            {selectedCards.length > 0 && (
              <span className="hidden sm:inline-flex animate-fade-in bg-emerald-400/20 text-xs px-1.5 py-0.5 rounded">
                {selectedCards.length}
              </span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'ramps'}
            aria-controls="tabpanel-wallets"
            onClick={() => setActiveTab('ramps')}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === 'ramps'
                ? 'bg-violet-500/25 text-violet-100 border border-violet-400/60 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                : 'bg-violet-900/20 text-violet-300 border border-transparent hover:bg-violet-500/15 hover:border-violet-500/30'
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="sr-only sm:hidden">Ramps ({rampsTabCount})</span>
            <span className="hidden sm:inline">Ramps ({rampsTabCount})</span>
            {selectedRamps.length > 0 && (
              <span className="hidden sm:inline-flex animate-fade-in bg-violet-400/20 text-xs px-1.5 py-0.5 rounded">
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

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement}
      </p>

      {showComparison && hasSelectedWallets && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <Share2 className="h-4 w-4 shrink-0" />
          <span>This comparison state is shareable. Use &quot;Copy comparison link&quot; in the toolbar.</span>
        </div>
      )}

      {/* Tab panel */}
      <div
        key={activeTab}
        id="tabpanel-wallets"
        role="tabpanel"
        aria-label={`${activeTab} wallets`}
        className="space-y-6 animate-fade-in"
      >

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
            onClose={() => setShowComparison(false)}
          />
        </div>
      )}

      <div className="glass-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Quick presets</p>
            <p className="text-sm text-muted-foreground">
              Jump straight to a decision path instead of rebuilding the same filter stack.
            </p>
          </div>
          <button
            onClick={resetActiveTab}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset this tab
          </button>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible">
          {activePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="snap-start min-w-[220px] sm:min-w-0 rounded-2xl border border-border bg-background/60 px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{preset.icon}</span>
                <span className="text-sm font-semibold text-foreground">{preset.label}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

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
        onResetFilters={resetActiveTab}
      />

      </div>{/* end tabpanel */}

      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTopAnchor}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-sm font-medium shadow-lg transition-colors hover:bg-muted"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
          Back to top
        </button>
      )}
    </div>
  );
}
