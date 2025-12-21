import fs from 'fs';
import path from 'path';

// Types for parsed wallet data
export interface SoftwareWallet {
  id: string;
  name: string;
  score: number;
  core: 'full' | 'partial' | 'none';
  releasesPerMonth: number | null;
  rpc: 'full' | 'partial' | 'none';
  github: string | null;
  active: 'active' | 'slow' | 'inactive' | 'private';
  chains: number | string;
  devices: {
    mobile: boolean;
    browser: boolean;
    desktop: boolean;
    web: boolean;
  };
  testnets: boolean;
  license: 'open' | 'partial' | 'closed';
  licenseType: string;
  audits: 'recent' | 'old' | 'bounty' | 'none';
  funding: 'sustainable' | 'vc' | 'risky';
  fundingSource: string;
  txSimulation: boolean;
  scamAlerts: 'full' | 'partial' | 'none';
  accountTypes: string[];
  ensNaming: 'full' | 'basic' | 'import' | 'none';
  hardwareSupport: boolean;
  bestFor: string;
  recommendation: 'recommended' | 'situational' | 'avoid' | 'not-for-dev';
  type: 'software';
}

export interface HardwareWallet {
  id: string;
  name: string;
  score: number;
  github: string | null;
  airGap: boolean;
  openSource: 'full' | 'partial' | 'closed';
  secureElement: boolean;
  secureElementType: string | null;
  display: string;
  price: number | null;
  priceText: string;
  connectivity: string[];
  active: 'active' | 'slow' | 'inactive' | 'private';
  recommendation: 'recommended' | 'situational' | 'avoid';
  url: string | null;
  type: 'hardware';
}

export interface CryptoCard {
  id: string;
  name: string;
  score: number;
  cardType: 'credit' | 'debit' | 'prepaid' | 'business';
  businessSupport: 'yes' | 'no' | 'verify';
  region: string;
  regionCode: string;
  cashBack: string;
  cashBackMax: number | null;
  annualFee: string;
  fxFee: string;
  rewards: string;
  provider: string;
  providerUrl: string | null;
  status: 'active' | 'verify' | 'launching';
  bestFor: string;
  recommendation: 'recommended' | 'situational' | 'avoid';
  type: 'card';
}

export type WalletData = SoftwareWallet | HardwareWallet | CryptoCard;

// Path to markdown files (one level up from frontend)
const CONTENT_DIR = path.join(process.cwd(), '..');

// Parse status symbols
function parseStatus(cell: string): 'active' | 'slow' | 'inactive' | 'private' {
  if (cell.includes('🔒') || cell.toLowerCase().includes('private')) return 'private';
  if (cell.includes('✅') || cell.toLowerCase().includes('active')) return 'active';
  if (cell.includes('⚠️') || cell.toLowerCase().includes('slow')) return 'slow';
  if (cell.includes('❌') || cell.toLowerCase().includes('inactive')) return 'inactive';
  return 'private';
}

// Parse boolean-like symbols
function parseBoolean(cell: string): boolean {
  return cell.includes('✅');
}

// Parse partial status
function parsePartial(cell: string): 'full' | 'partial' | 'none' {
  if (cell.includes('✅')) return 'full';
  if (cell.includes('⚠️')) return 'partial';
  return 'none';
}

// Parse recommendation symbol
function parseRecommendation(cell: string): 'recommended' | 'situational' | 'avoid' | 'not-for-dev' {
  if (cell.includes('🟢')) return 'recommended';
  if (cell.includes('🟡')) return 'situational';
  if (cell.includes('🔴')) return 'avoid';
  if (cell.includes('⚪')) return 'not-for-dev';
  return 'situational';
}

// Parse hardware recommendation (no not-for-dev)
function parseHardwareRecommendation(cell: string): 'recommended' | 'situational' | 'avoid' {
  if (cell.includes('🟢')) return 'recommended';
  if (cell.includes('🟡')) return 'situational';
  return 'avoid';
}

// Parse devices from device string
function parseDevices(cell: string): { mobile: boolean; browser: boolean; desktop: boolean; web: boolean } {
  return {
    mobile: cell.includes('📱'),
    browser: cell.includes('🌐'),
    desktop: cell.includes('💻'),
    web: cell.includes('🔗'),
  };
}

// Extract GitHub URL from markdown link
function extractGitHubUrl(cell: string): string | null {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match && match[2].includes('github.com')) {
    return match[2];
  }
  if (cell.toLowerCase().includes('private')) return null;
  return null;
}

// Parse releases per month
function parseReleasesPerMonth(cell: string): number | null {
  const match = cell.match(/~?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Parse chains count
function parseChainsCount(cell: string): number | string {
  if (cell.toLowerCase().includes('any')) return 'any';
  if (cell.toLowerCase().includes('evm')) return 'evm';
  const match = cell.match(/(\d+)\+?/);
  return match ? parseInt(match[1], 10) : 0;
}

// Parse license type
function parseLicense(cell: string): { status: 'open' | 'partial' | 'closed'; type: string } {
  const status = parsePartial(cell);
  // Extract license type like MIT, GPL-3, Apache, etc.
  const typeMatch = cell.match(/(MIT|GPL-3|GPL|Apache|MPL-2|Prop|Src-Avail)/i);
  return {
    status: status === 'full' ? 'open' : status === 'partial' ? 'partial' : 'closed',
    type: typeMatch ? typeMatch[1] : 'Unknown',
  };
}

// Parse audits
function parseAudits(cell: string): 'recent' | 'old' | 'bounty' | 'none' {
  if (cell.includes('✅') && (cell.includes('2023') || cell.includes('2024') || cell.includes('2025'))) return 'recent';
  if (cell.includes('🐛') || cell.toLowerCase().includes('h1')) return 'bounty';
  if (cell.includes('⚠️')) return 'old';
  if (cell.includes('❓') || cell.includes('❌')) return 'none';
  return 'none';
}

// Parse funding
function parseFunding(cell: string): { status: 'sustainable' | 'vc' | 'risky'; source: string } {
  let status: 'sustainable' | 'vc' | 'risky' = 'risky';
  if (cell.includes('🟢')) status = 'sustainable';
  else if (cell.includes('🟡')) status = 'vc';
  else if (cell.includes('🔴')) status = 'risky';

  // Extract source name
  const sourceMatch = cell.match(/(?:🟢|🟡|🔴)\s*([^|]+)/);
  return {
    status,
    source: sourceMatch ? sourceMatch[1].trim() : 'Unknown',
  };
}

// Parse account types
function parseAccountTypes(cell: string): string[] {
  const types: string[] = [];
  if (cell.includes('EOA')) types.push('EOA');
  if (cell.includes('Safe')) types.push('Safe');
  if (cell.includes('4337')) types.push('EIP-4337');
  if (cell.includes('7702')) types.push('EIP-7702');
  return types.length > 0 ? types : ['EOA'];
}

// Parse ENS naming support
function parseEnsNaming(cell: string): 'full' | 'basic' | 'import' | 'none' {
  if (cell.includes('Full')) return 'full';
  if (cell.includes('Basic')) return 'basic';
  if (cell.includes('Import')) return 'import';
  if (cell.includes('❌') || cell.includes('None')) return 'none';
  return 'none';
}

// Parse price from string
function parsePrice(cell: string): { value: number | null; text: string } {
  const match = cell.match(/\$(\d+)/);
  return {
    value: match ? parseInt(match[1], 10) : null,
    text: cell.replace(/[~*]/g, '').trim(),
  };
}

// Parse connectivity options
function parseConnectivity(cell: string): string[] {
  const options: string[] = [];
  if (cell.includes('USB-C')) options.push('USB-C');
  else if (cell.includes('USB')) options.push('USB');
  if (cell.includes('BT') || cell.includes('Bluetooth')) options.push('Bluetooth');
  if (cell.includes('QR')) options.push('QR');
  if (cell.includes('NFC')) options.push('NFC');
  if (cell.includes('MicroSD')) options.push('MicroSD');
  if (cell.includes('WiFi')) options.push('WiFi');
  return options;
}

// Parse card type
function parseCardType(cell: string): 'credit' | 'debit' | 'prepaid' | 'business' {
  const lower = cell.toLowerCase();
  if (lower.includes('credit')) return 'credit';
  if (lower.includes('prepaid')) return 'prepaid';
  if (lower.includes('business')) return 'business';
  return 'debit';
}

// Parse business support
function parseBusinessSupport(cell: string): 'yes' | 'no' | 'verify' {
  if (cell.includes('✅')) return 'yes';
  if (cell.includes('⚠️')) return 'verify';
  return 'no';
}

// Parse region
function parseRegion(cell: string): { region: string; code: string } {
  // Map of flags to region codes
  const regionMap: Record<string, string> = {
    '🇺🇸': 'US',
    '🇪🇺': 'EU',
    '🇬🇧': 'UK',
    '🇨🇦': 'CA',
    '🇦🇺': 'AU',
    '🌍': 'Global',
  };

  let code = 'Unknown';
  for (const [flag, regionCode] of Object.entries(regionMap)) {
    if (cell.includes(flag)) {
      code = regionCode;
      break;
    }
  }

  return {
    region: cell.replace(/[🇺🇸🇪🇺🇬🇧🇨🇦🇦🇺🌍*]/g, '').trim(),
    code,
  };
}

// Parse cashback max percentage
function parseCashBackMax(cell: string): number | null {
  const match = cell.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : null;
}

// Parse card status
function parseCardStatus(cell: string): 'active' | 'verify' | 'launching' {
  if (cell.includes('✅')) return 'active';
  if (cell.includes('🔄')) return 'launching';
  return 'verify';
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Parse markdown table into rows
function parseMarkdownTable(content: string): string[][] {
  const lines = content.split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    // Skip non-table lines and separator lines
    if (!line.startsWith('|') || line.match(/^\|[\s-:|]+\|$/)) continue;

    // Parse cells
    const cells = line
      .split('|')
      .slice(1, -1) // Remove first and last empty elements
      .map(cell => cell.trim());

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

// Parse software wallets from markdown
export function parseSoftwareWallets(): SoftwareWallet[] {
  const filePath = path.join(CONTENT_DIR, 'WALLET_COMPARISON_UNIFIED_TABLE.md');

  if (!fs.existsSync(filePath)) {
    console.error('Software wallet file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  return dataRows.map(cells => {
    // Extract wallet name from bold text
    const nameMatch = cells[0]?.match(/\*\*([^*]+)\*\*/);
    const name = nameMatch ? nameMatch[1] : cells[0] || 'Unknown';

    const license = parseLicense(cells[10] || '');
    const funding = parseFunding(cells[12] || '');

    return {
      id: generateSlug(name),
      name,
      score: parseInt(cells[1], 10) || 0,
      core: parsePartial(cells[2] || '') as 'full' | 'partial' | 'none',
      releasesPerMonth: parseReleasesPerMonth(cells[3] || ''),
      rpc: parsePartial(cells[4] || '') as 'full' | 'partial' | 'none',
      github: extractGitHubUrl(cells[5] || ''),
      active: parseStatus(cells[6] || ''),
      chains: parseChainsCount(cells[7] || ''),
      devices: parseDevices(cells[8] || ''),
      testnets: parseBoolean(cells[9] || ''),
      license: license.status,
      licenseType: license.type,
      audits: parseAudits(cells[11] || ''),
      funding: funding.status,
      fundingSource: funding.source,
      txSimulation: parseBoolean(cells[13] || ''),
      scamAlerts: parsePartial(cells[14] || '') as 'full' | 'partial' | 'none',
      accountTypes: parseAccountTypes(cells[15] || ''),
      ensNaming: parseEnsNaming(cells[16] || ''),
      hardwareSupport: parseBoolean(cells[17] || ''),
      bestFor: cells[18]?.replace(/[~*]/g, '').trim() || '',
      recommendation: parseRecommendation(cells[19] || ''),
      type: 'software' as const,
    };
  }).filter(wallet => wallet.name !== 'Unknown' && wallet.score > 0);
}

// Parse hardware wallets from markdown
export function parseHardwareWallets(): HardwareWallet[] {
  const filePath = path.join(CONTENT_DIR, 'HARDWARE_WALLET_COMPARISON_TABLE.md');

  if (!fs.existsSync(filePath)) {
    console.error('Hardware wallet file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  return dataRows.map(cells => {
    // Extract wallet name and URL from markdown link
    const linkMatch = cells[0]?.match(/\[?\*\*([^*\]]+)\*\*\]?\(?([^)]*)\)?/);
    const urlMatch = cells[0]?.match(/\]\(([^)]+)\)/);
    const name = linkMatch ? linkMatch[1].replace(/~~|^\[|\]$/g, '') : cells[0]?.replace(/[*~[\]]/g, '') || 'Unknown';
    const url = urlMatch ? urlMatch[1] : null;

    const price = parsePrice(cells[6] || '');

    return {
      id: generateSlug(name),
      name,
      score: parseInt(cells[1], 10) || 0,
      github: extractGitHubUrl(cells[2] || ''),
      airGap: parseBoolean(cells[3] || ''),
      openSource: parsePartial(cells[4] || '') as 'full' | 'partial' | 'closed',
      secureElement: parseBoolean(cells[5] || ''),
      secureElementType: cells[5]?.includes('✅') ? cells[5].replace(/✅\s*/, '').trim() || null : null,
      display: cells[6]?.trim() || 'Unknown',
      price: price.value,
      priceText: price.text,
      connectivity: parseConnectivity(cells[8] || ''),
      active: parseStatus(cells[9] || ''),
      recommendation: parseHardwareRecommendation(cells[10] || ''),
      url,
      type: 'hardware' as const,
    };
  }).filter(wallet => wallet.name !== 'Unknown' && wallet.score > 0);
}

// Parse crypto cards from markdown
export function parseCryptoCards(): CryptoCard[] {
  const filePath = path.join(CONTENT_DIR, 'CRYPTO_CREDIT_CARD_COMPARISON_TABLE.md');

  if (!fs.existsSync(filePath)) {
    console.error('Crypto card file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  return dataRows.map(cells => {
    // Extract card name from bold text
    const nameMatch = cells[0]?.match(/\*\*([^*]+)\*\*/);
    const name = nameMatch ? nameMatch[1] : cells[0] || 'Unknown';

    // Parse score (may have emoji)
    const scoreMatch = cells[1]?.match(/(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    const region = parseRegion(cells[4] || '');

    // Extract provider URL
    const providerMatch = cells[9]?.match(/\[([^\]]+)\]\(([^)]+)\)/);

    return {
      id: generateSlug(name),
      name,
      score,
      cardType: parseCardType(cells[2] || ''),
      businessSupport: parseBusinessSupport(cells[3] || ''),
      region: region.region,
      regionCode: region.code,
      cashBack: cells[5]?.trim() || '0%',
      cashBackMax: parseCashBackMax(cells[5] || ''),
      annualFee: cells[6]?.trim() || '$0',
      fxFee: cells[7]?.trim() || '0%',
      rewards: cells[8]?.trim() || 'None',
      provider: providerMatch ? providerMatch[1] : cells[9]?.replace(/[[\]()]/g, '') || 'Unknown',
      providerUrl: providerMatch ? providerMatch[2] : null,
      status: parseCardStatus(cells[10] || ''),
      bestFor: cells[11]?.trim() || '',
      recommendation: parseHardwareRecommendation(cells[1] || ''), // Uses score emoji
      type: 'card' as const,
    };
  }).filter(card => card.name !== 'Unknown' && card.score > 0);
}

/**
 * Get all wallet data in a single call
 * @future Available for API endpoint implementation
 */
export function getAllWalletData(): {
  software: SoftwareWallet[];
  hardware: HardwareWallet[];
  cards: CryptoCard[];
} {
  return {
    software: parseSoftwareWallets(),
    hardware: parseHardwareWallets(),
    cards: parseCryptoCards(),
  };
}

/**
 * Filter options for programmatic filtering
 * @future Available for API endpoint implementation
 * Note: ExploreContent.tsx uses its own FilterState for UI state management
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

/**
 * Sort field options
 * @future Available for API endpoint implementation
 */
export type SortField =
  | 'score'
  | 'name'
  | 'chains'
  | 'releasesPerMonth'
  | 'price'
  | 'cashBackMax';
export type SortDirection = 'asc' | 'desc';

/**
 * Filter and sort functions for programmatic use
 * @future Available for API endpoint implementation
 * Note: ExploreContent.tsx has its own implementations for client-side filtering
 */

// Filter software wallets
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

// Filter hardware wallets
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

// Filter crypto cards
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

// Sort wallets
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
          aValue = typeof a.chains === 'number' ? a.chains : 999;
          bValue = typeof b.chains === 'number' ? b.chains : 999;
        }
        break;
      case 'releasesPerMonth':
        if (a.type === 'software' && b.type === 'software') {
          aValue = a.releasesPerMonth ?? 0;
          bValue = b.releasesPerMonth ?? 0;
        }
        break;
      case 'price':
        if (a.type === 'hardware' && b.type === 'hardware') {
          aValue = a.price ?? 999;
          bValue = b.price ?? 999;
        }
        break;
      case 'cashBackMax':
        if (a.type === 'card' && b.type === 'card') {
          aValue = a.cashBackMax ?? 0;
          bValue = b.cashBackMax ?? 0;
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
