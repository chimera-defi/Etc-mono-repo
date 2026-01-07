'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types matching wallet-data.ts (client-side version)
export interface FilterState {
  search: string;
  minScore: number;
  maxScore: number;
  recommendation: string[];
  platforms: string[];
  license: string[];
  features: string[];
  accountTypes: string[];
  active: string[];
  funding: string[];
  // Hardware
  airGap: boolean | null;
  secureElement: boolean | null;
  openSource: string[];
  priceMin: number;
  priceMax: number;
  connectivity: string[];
  // Cards
  cardType: string[];
  custody: string[];
  region: string[];
  businessSupport: boolean | null;
  cashBackMin: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface WalletFiltersProps {
  type: 'software' | 'hardware' | 'cards' | 'ramps';
  filters: FilterState;
  sort: SortState;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortState) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
}

// Filter option definitions
const RECOMMENDATION_OPTIONS = [
  { value: 'recommended', label: 'Recommended', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'situational', label: 'Situational', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'avoid', label: 'Avoid', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

const PLATFORM_OPTIONS = [
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'browser', label: 'Browser Extension', icon: '🌐' },
  { value: 'desktop', label: 'Desktop', icon: '💻' },
  { value: 'web', label: 'Web App', icon: '🔗' },
];

const LICENSE_OPTIONS = [
  { value: 'open', label: 'Open Source' },
  { value: 'partial', label: 'Partial' },
  { value: 'closed', label: 'Closed' },
];

const FEATURE_OPTIONS = [
  { value: 'txSimulation', label: 'Transaction Simulation' },
  { value: 'scamAlerts', label: 'Scam Alerts' },
  { value: 'hardwareSupport', label: 'Hardware Wallet Support' },
  { value: 'testnets', label: 'Testnet Support' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'EOA', label: 'EOA (Standard)' },
  { value: 'Safe', label: 'Safe Multi-sig' },
  { value: 'EIP-4337', label: 'EIP-4337 (Smart Wallet)' },
  { value: 'EIP-7702', label: 'EIP-7702 (Upgraded EOA)' },
];

const ACTIVITY_OPTIONS = [
  { value: 'active', label: 'Active (< 30 days)' },
  { value: 'slow', label: 'Slow (1-4 months)' },
  { value: 'inactive', label: 'Inactive (4+ months)' },
  { value: 'private', label: 'Private Repo' },
];

const FUNDING_OPTIONS = [
  { value: 'sustainable', label: 'Sustainable' },
  { value: 'vc', label: 'VC-Dependent' },
  { value: 'risky', label: 'Risky/Unknown' },
];

const CONNECTIVITY_OPTIONS = [
  { value: 'USB-C', label: 'USB-C' },
  { value: 'USB', label: 'USB' },
  { value: 'Bluetooth', label: 'Bluetooth' },
  { value: 'QR', label: 'QR Code' },
  { value: 'NFC', label: 'NFC' },
  { value: 'MicroSD', label: 'MicroSD' },
];

const CARD_TYPE_OPTIONS = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'business', label: 'Business' },
];

const REGION_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'Europe' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'Global', label: 'Global' },
];

const CUSTODY_OPTIONS = [
  { value: 'self', label: '🔐 Self-Custody', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'exchange', label: '🏦 Exchange', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'cefi', label: '📋 CeFi', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
];

const SORT_OPTIONS = {
  software: [
    { value: 'score', label: 'Score' },
    { value: 'name', label: 'Name' },
    { value: 'chains', label: 'Chain Count' },
    { value: 'releasesPerMonth', label: 'Release Frequency' },
  ],
  hardware: [
    { value: 'score', label: 'Score' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
  ],
  cards: [
    { value: 'score', label: 'Score' },
    { value: 'name', label: 'Name' },
    { value: 'cashBackMax', label: 'Cashback Rate' },
  ],
  ramps: [
    { value: 'score', label: 'Score' },
    { value: 'name', label: 'Name' },
  ],
};

// Initial filter state
export const initialFilterState: FilterState = {
  search: '',
  minScore: 0,
  maxScore: 100,
  recommendation: [],
  platforms: [],
  license: [],
  features: [],
  accountTypes: [],
  active: [],
  funding: [],
  airGap: null,
  secureElement: null,
  openSource: [],
  priceMin: 0,
  priceMax: 500,
  connectivity: [],
  cardType: [],
  custody: [],
  region: [],
  businessSupport: null,
  cashBackMin: 0,
};

// Multi-select dropdown component
function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; icon?: string; color?: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg',
          'bg-background text-foreground border-border',
          'hover:border-primary/50 transition-colors',
          selected.length > 0 && 'border-primary'
        )}
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {label}
          {selected.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
              {selected.length}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm',
                'hover:bg-muted transition-colors',
                selected.includes(option.value) && 'bg-primary/10'
              )}
            >
              <span className="flex items-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span className={option.color || ''}>{option.label}</span>
              </span>
              {selected.includes(option.value) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Toggle button component
function ToggleButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => onChange(value === true ? null : true)}
          className={cn(
            'px-3 py-1 text-xs transition-colors',
            value === true
              ? 'bg-green-600 text-white'
              : 'bg-background hover:bg-muted'
          )}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(value === false ? null : false)}
          className={cn(
            'px-3 py-1 text-xs transition-colors',
            value === false
              ? 'bg-red-600 text-white'
              : 'bg-background hover:bg-muted'
          )}
        >
          No
        </button>
      </div>
    </div>
  );
}

// Range slider component
function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
  suffix = '',
}: {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value[0]}{suffix} - {value[1]}{suffix}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={e => onChange([parseInt(e.target.value), value[1]])}
          className="flex-1"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={e => onChange([value[0], parseInt(e.target.value)])}
          className="flex-1"
        />
      </div>
    </div>
  );
}

export function WalletFilters({
  type,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  resultCount,
  totalCount,
  className,
}: WalletFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange(initialFilterState);
  }, [onFiltersChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.minScore > 0) count++;
    if (filters.maxScore < 100) count++;
    if (filters.recommendation.length) count++;
    if (filters.platforms.length) count++;
    if (filters.license.length) count++;
    if (filters.features.length) count++;
    if (filters.accountTypes.length) count++;
    if (filters.active.length) count++;
    if (filters.funding.length) count++;
    if (filters.airGap !== null) count++;
    if (filters.secureElement !== null) count++;
    if (filters.openSource.length) count++;
    if (filters.connectivity.length) count++;
    if (filters.cardType.length) count++;
    if (filters.custody.length) count++;
    if (filters.region.length) count++;
    if (filters.businessSupport !== null) count++;
    if (filters.cashBackMin > 0) count++;
    return count;
  }, [filters]);

  const sortOptions = SORT_OPTIONS[type];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top row: Search, Sort, Advanced toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search wallets..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={sort.field}
            onChange={e => onSortChange({ ...sort, field: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              onSortChange({
                ...sort,
                direction: sort.direction === 'asc' ? 'desc' : 'asc',
              })
            }
            className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
            title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
            showAdvanced || activeFilterCount > 0
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-muted'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {resultCount} of {totalCount}{' '}
        {type === 'cards' ? 'cards' : type === 'ramps' ? 'ramps' : 'wallets'}
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-6">
          {/* Common filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Score range */}
            <RangeSlider
              label="Score Range"
              min={0}
              max={100}
              value={[filters.minScore, filters.maxScore]}
              onChange={([min, max]) => {
                updateFilter('minScore', min);
                updateFilter('maxScore', max);
              }}
            />

            {/* Recommendation */}
            <MultiSelect
              label="Recommendation"
              options={RECOMMENDATION_OPTIONS}
              selected={filters.recommendation}
              onChange={values => updateFilter('recommendation', values)}
            />

            {/* Activity */}
            <MultiSelect
              label="Activity Status"
              options={ACTIVITY_OPTIONS}
              selected={filters.active}
              onChange={values => updateFilter('active', values)}
            />
          </div>

          {/* Software-specific filters */}
          {type === 'software' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
              <MultiSelect
                label="Platforms"
                options={PLATFORM_OPTIONS}
                selected={filters.platforms}
                onChange={values => updateFilter('platforms', values)}
              />
              <MultiSelect
                label="License"
                options={LICENSE_OPTIONS}
                selected={filters.license}
                onChange={values => updateFilter('license', values)}
              />
              <MultiSelect
                label="Features"
                options={FEATURE_OPTIONS}
                selected={filters.features}
                onChange={values => updateFilter('features', values)}
              />
              <MultiSelect
                label="Account Types"
                options={ACCOUNT_TYPE_OPTIONS}
                selected={filters.accountTypes}
                onChange={values => updateFilter('accountTypes', values)}
              />
              <MultiSelect
                label="Funding"
                options={FUNDING_OPTIONS}
                selected={filters.funding}
                onChange={values => updateFilter('funding', values)}
              />
            </div>
          )}

          {/* Hardware-specific filters */}
          {type === 'hardware' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
              <ToggleButton
                label="Air-Gapped"
                value={filters.airGap}
                onChange={value => updateFilter('airGap', value)}
              />
              <ToggleButton
                label="Secure Element"
                value={filters.secureElement}
                onChange={value => updateFilter('secureElement', value)}
              />
              <MultiSelect
                label="Open Source"
                options={LICENSE_OPTIONS.map(l => ({
                  ...l,
                  label: l.value === 'open' ? 'Fully Open' : l.value === 'partial' ? 'Partial' : 'Closed',
                }))}
                selected={filters.openSource}
                onChange={values => updateFilter('openSource', values)}
              />
              <MultiSelect
                label="Connectivity"
                options={CONNECTIVITY_OPTIONS}
                selected={filters.connectivity}
                onChange={values => updateFilter('connectivity', values)}
              />
              <RangeSlider
                label="Price Range"
                min={0}
                max={500}
                value={[filters.priceMin, filters.priceMax]}
                onChange={([min, max]) => {
                  updateFilter('priceMin', min);
                  updateFilter('priceMax', max);
                }}
                suffix="$"
              />
            </div>
          )}

          {/* Card-specific filters */}
          {type === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
              <MultiSelect
                label="Card Type"
                options={CARD_TYPE_OPTIONS}
                selected={filters.cardType}
                onChange={values => updateFilter('cardType', values)}
              />
              <MultiSelect
                label="Custody"
                options={CUSTODY_OPTIONS}
                selected={filters.custody}
                onChange={values => updateFilter('custody', values)}
              />
              <MultiSelect
                label="Region"
                options={REGION_OPTIONS}
                selected={filters.region}
                onChange={values => updateFilter('region', values)}
              />
              <ToggleButton
                label="Business Support"
                value={filters.businessSupport}
                onChange={value => updateFilter('businessSupport', value)}
              />
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Min Cashback: {filters.cashBackMin}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={filters.cashBackMin}
                  onChange={e => updateFilter('cashBackMin', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Ramp-specific filters - for now just use common filters */}
          {type === 'ramps' && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Ramp filters use score range and recommendation filters above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WalletFilters;
