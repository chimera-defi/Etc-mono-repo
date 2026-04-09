import { initialFilterState, type FilterState, type SortState } from '@/components/WalletFilters';
import type { SortField } from '@/lib/wallet-filtering';

export type ExploreTab = 'software' | 'hardware' | 'cards' | 'ramps';

export const DEFAULT_SORTS: Record<ExploreTab, SortState> = {
  software: { field: 'score', direction: 'desc' },
  hardware: { field: 'score', direction: 'desc' },
  cards: { field: 'score', direction: 'desc' },
  ramps: { field: 'score', direction: 'desc' },
};

export const FILTER_PARAM_KEYS: Record<ExploreTab, string> = {
  software: 'sFilters',
  hardware: 'hFilters',
  cards: 'cFilters',
  ramps: 'rFilters',
};

export const SORT_PARAM_KEYS: Record<ExploreTab, string> = {
  software: 'sSort',
  hardware: 'hSort',
  cards: 'cSort',
  ramps: 'rSort',
};

const SORT_FIELDS_BY_TAB: Record<ExploreTab, ReadonlySet<SortField>> = {
  software: new Set<SortField>(['score', 'name', 'chains', 'releasesPerMonth']),
  hardware: new Set<SortField>(['score', 'name', 'price']),
  cards: new Set<SortField>(['score', 'name', 'cashBackMax']),
  ramps: new Set<SortField>(['score', 'name']),
};

const FILTER_ARRAY_ALLOWLIST: Partial<Record<keyof FilterState, ReadonlySet<string>>> = {
  recommendation: new Set(['recommended', 'situational', 'avoid', 'not-for-dev']),
  platforms: new Set(['mobile', 'browser', 'desktop', 'web']),
  license: new Set(['open', 'partial', 'closed']),
  features: new Set(['txSimulation', 'scamAlerts', 'hardwareSupport', 'testnets']),
  accountTypes: new Set(['EOA', 'Safe', 'EIP-4337', 'EIP-7702']),
  active: new Set(['active', 'slow', 'inactive', 'private']),
  funding: new Set(['sustainable', 'vc', 'risky']),
  openSource: new Set(['open', 'partial', 'closed']),
  connectivity: new Set(['USB-C', 'USB', 'Bluetooth', 'QR', 'NFC', 'MicroSD']),
  cardType: new Set(['debit', 'credit', 'prepaid', 'business']),
  custody: new Set(['self', 'exchange', 'cefi']),
  cardStatus: new Set(['active', 'verify', 'launching', 'inactive']),
  region: new Set(['US', 'EU', 'UK', 'CA', 'AU', 'Global']),
};

const CONTROLLED_QUERY_KEYS = [
  'tab',
  'view',
  'compare',
  'search',
  'selected',
  'sw',
  'hw',
  'cd',
  'rp',
  ...Object.values(FILTER_PARAM_KEYS),
  ...Object.values(SORT_PARAM_KEYS),
] as const;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeStringArray(values: string[], allowlist?: ReadonlySet<string>) {
  const unique: string[] = [];
  for (const raw of values) {
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (!value) continue;
    if (allowlist && !allowlist.has(value)) continue;
    if (!unique.includes(value)) unique.push(value);
  }
  return unique;
}

export function normalizeFilterState(filters: FilterState): FilterState {
  const minScore = clampNumber(Math.round(filters.minScore), 0, 100);
  const maxScore = Math.max(minScore, clampNumber(Math.round(filters.maxScore), 0, 100));
  const priceMin = clampNumber(Math.round(filters.priceMin), 0, 500);
  const priceMax = Math.max(priceMin, clampNumber(Math.round(filters.priceMax), 0, 500));

  return {
    ...filters,
    search: filters.search.trim().slice(0, 120),
    minScore,
    maxScore,
    recommendation: normalizeStringArray(filters.recommendation, FILTER_ARRAY_ALLOWLIST.recommendation),
    platforms: normalizeStringArray(filters.platforms, FILTER_ARRAY_ALLOWLIST.platforms),
    license: normalizeStringArray(filters.license, FILTER_ARRAY_ALLOWLIST.license),
    features: normalizeStringArray(filters.features, FILTER_ARRAY_ALLOWLIST.features),
    accountTypes: normalizeStringArray(filters.accountTypes, FILTER_ARRAY_ALLOWLIST.accountTypes),
    active: normalizeStringArray(filters.active, FILTER_ARRAY_ALLOWLIST.active),
    funding: normalizeStringArray(filters.funding, FILTER_ARRAY_ALLOWLIST.funding),
    openSource: normalizeStringArray(filters.openSource, FILTER_ARRAY_ALLOWLIST.openSource),
    connectivity: normalizeStringArray(filters.connectivity, FILTER_ARRAY_ALLOWLIST.connectivity),
    cardType: normalizeStringArray(filters.cardType, FILTER_ARRAY_ALLOWLIST.cardType),
    custody: normalizeStringArray(filters.custody, FILTER_ARRAY_ALLOWLIST.custody),
    cardStatus: normalizeStringArray(filters.cardStatus, FILTER_ARRAY_ALLOWLIST.cardStatus),
    region: normalizeStringArray(filters.region, FILTER_ARRAY_ALLOWLIST.region),
    priceMin,
    priceMax,
    cashBackMin: clampNumber(Math.round(filters.cashBackMin), 0, 10),
  };
}

export function normalizeSortState(sort: SortState, tab: ExploreTab): SortState {
  const fallback = DEFAULT_SORTS[tab];
  if (!SORT_FIELDS_BY_TAB[tab].has(sort.field as SortField)) return fallback;
  if (sort.direction !== 'asc' && sort.direction !== 'desc') return fallback;
  return { field: sort.field, direction: sort.direction };
}

export function serializeFilterState(filters: FilterState) {
  const normalized = normalizeFilterState(filters);
  const nonDefault: Record<string, unknown> = {};
  const keys = Object.keys(initialFilterState) as (keyof FilterState)[];

  keys.forEach((key) => {
    const current = normalized[key];
    const base = initialFilterState[key];

    if (Array.isArray(base)) {
      if (Array.isArray(current) && current.length > 0) {
        nonDefault[key] = current;
      }
      return;
    }

    if (current !== base) {
      nonDefault[key] = current;
    }
  });

  return Object.keys(nonDefault).length > 0 ? JSON.stringify(nonDefault) : null;
}

export function parseFilterState(value: string | null): FilterState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const next: Record<string, unknown> = { ...initialFilterState };
    const keys = Object.keys(parsed) as (keyof FilterState)[];

    keys.forEach((key) => {
      if (!(key in initialFilterState)) return;

      const incoming = parsed[key];
      const base = initialFilterState[key];

      if (Array.isArray(base)) {
        if (Array.isArray(incoming)) {
          next[key] = incoming.filter((item) => typeof item === 'string');
        }
        return;
      }

      if (typeof base === 'number') {
        if (typeof incoming === 'number' && Number.isFinite(incoming)) {
          next[key] = incoming;
        }
        return;
      }

      if (typeof base === 'string') {
        if (typeof incoming === 'string') {
          next[key] = incoming;
        }
        return;
      }

      if (typeof base === 'boolean' || base === null) {
        if (incoming === null || typeof incoming === 'boolean') {
          next[key] = incoming;
        }
      }
    });

    return normalizeFilterState(next as unknown as FilterState);
  } catch {
    return null;
  }
}

export function serializeSortState(sort: SortState, tab: ExploreTab) {
  const normalized = normalizeSortState(sort, tab);
  const fallback = DEFAULT_SORTS[tab];
  if (normalized.field === fallback.field && normalized.direction === fallback.direction) return null;
  return `${normalized.field}:${normalized.direction}`;
}

export function parseSortState(value: string | null, tab: ExploreTab): SortState {
  const fallback = DEFAULT_SORTS[tab];
  if (!value) return fallback;
  const [field, direction] = value.split(':');
  if (!field || (direction !== 'asc' && direction !== 'desc')) return fallback;
  if (!SORT_FIELDS_BY_TAB[tab].has(field as SortField)) return fallback;
  return { field, direction };
}

export function parseSearchParam(value: string | null) {
  if (!value) return '';
  return value.trim().slice(0, 120);
}

export function clearControlledQueryParams(params: URLSearchParams) {
  for (const key of CONTROLLED_QUERY_KEYS) {
    params.delete(key);
  }
}
