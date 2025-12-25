import type { CryptoCard, HardwareWallet, SoftwareWallet, WalletData } from '@/types/wallets';

/**
 * Client-safe filtering/sorting utilities for wallet data.
 *
 * Note: This file intentionally has NO node-only imports (fs/path),
 * so it can be used from `use client` components (e.g. `/explore`).
 */

export interface FilterOptions {
  // Software wallet filters
  recommendation?: ('recommended' | 'situational' | 'avoid' | 'not-for-dev')[];
  platforms?: ('mobile' | 'browser' | 'desktop' | 'web')[];
  license?: ('open' | 'partial' | 'closed')[];
  features?: ('txSimulation' | 'scamAlerts' | 'hardwareSupport' | 'testnets')[];
  accountTypes?: string[];
  active?: ('active' | 'slow' | 'inactive' | 'private')[];
  funding?: ('sustainable' | 'vc' | 'risky')[];

  // Hardware wallet filters
  airGap?: boolean;
  secureElement?: boolean;
  openSource?: ('full' | 'partial' | 'closed')[];
  priceRange?: { min: number; max: number };
  connectivity?: string[];

  // Card filters
  cardType?: ('credit' | 'debit' | 'prepaid' | 'business')[];
  region?: string[];
  businessSupport?: boolean;
  cashBackMin?: number;

  // Common
  minScore?: number;
  maxScore?: number;
  search?: string;
}

export type SortField =
  | 'score'
  | 'name'
  | 'chains'
  | 'releasesPerMonth'
  | 'price'
  | 'cashBackMax';
export type SortDirection = 'asc' | 'desc';

export function filterSoftwareWallets(
  wallets: SoftwareWallet[],
  filters: FilterOptions
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
    if (filters.minScore !== undefined && wallet.score < filters.minScore) return false;
    if (filters.maxScore !== undefined && wallet.score > filters.maxScore) return false;

    // Recommendation filter
    if (filters.recommendation?.length && !filters.recommendation.includes(wallet.recommendation)) {
      return false;
    }

    // Platform filter
    if (filters.platforms?.length) {
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
    if (filters.license?.length && !filters.license.includes(wallet.license)) {
      return false;
    }

    // Features filter
    if (filters.features?.length) {
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
    if (filters.accountTypes?.length) {
      const hasAccountType = filters.accountTypes.some(type =>
        wallet.accountTypes.includes(type)
      );
      if (!hasAccountType) return false;
    }

    // Activity filter
    if (filters.active?.length && !filters.active.includes(wallet.active)) {
      return false;
    }

    // Funding filter
    if (filters.funding?.length && !filters.funding.includes(wallet.funding)) {
      return false;
    }

    return true;
  });
}

export function filterHardwareWallets(
  wallets: HardwareWallet[],
  filters: FilterOptions
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
    if (filters.minScore !== undefined && wallet.score < filters.minScore) return false;
    if (filters.maxScore !== undefined && wallet.score > filters.maxScore) return false;

    // Recommendation filter
    if (filters.recommendation?.length) {
      const matchingRecs = filters.recommendation.filter(r => r !== 'not-for-dev');
      if (matchingRecs.length && !matchingRecs.includes(wallet.recommendation)) {
        return false;
      }
    }

    // Air gap filter
    if (filters.airGap !== undefined && wallet.airGap !== filters.airGap) {
      return false;
    }

    // Secure element filter
    if (filters.secureElement !== undefined && wallet.secureElement !== filters.secureElement) {
      return false;
    }

    // Open source filter
    if (filters.openSource?.length && !filters.openSource.includes(wallet.openSource)) {
      return false;
    }

    // Price range filter
    if (filters.priceRange && wallet.price !== null) {
      if (wallet.price < filters.priceRange.min || wallet.price > filters.priceRange.max) {
        return false;
      }
    }

    // Connectivity filter
    if (filters.connectivity?.length) {
      const hasConnectivity = filters.connectivity.some(conn =>
        wallet.connectivity.includes(conn)
      );
      if (!hasConnectivity) return false;
    }

    // Activity filter
    if (filters.active?.length && !filters.active.includes(wallet.active)) {
      return false;
    }

    return true;
  });
}

export function filterCryptoCards(
  cards: CryptoCard[],
  filters: FilterOptions
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
    if (filters.minScore !== undefined && card.score < filters.minScore) return false;
    if (filters.maxScore !== undefined && card.score > filters.maxScore) return false;

    // Card type filter
    if (filters.cardType?.length && !filters.cardType.includes(card.cardType)) {
      return false;
    }

    // Region filter
    if (filters.region?.length && !filters.region.includes(card.regionCode)) {
      return false;
    }

    // Business support filter
    if (filters.businessSupport !== undefined) {
      if (filters.businessSupport && card.businessSupport !== 'yes') return false;
    }

    // Cashback min filter
    if (filters.cashBackMin !== undefined && card.cashBackMax !== null) {
      if (card.cashBackMax < filters.cashBackMin) return false;
    }

    return true;
  });
}

export function sortWallets<T extends WalletData>(
  wallets: T[],
  field: SortField,
  direction: SortDirection
): T[] {
  return [...wallets].sort((a, b) => {
    let aValue: number | string = 0;
    let bValue: number | string = 0;

    switch (field) {
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
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return direction === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });
}

