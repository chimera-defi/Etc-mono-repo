import fs from 'fs';
import path from 'path';
import type { CryptoCard, HardwareWallet, SoftwareWallet, WalletData } from '@/types/wallets';

export type { CryptoCard, HardwareWallet, SoftwareWallet, WalletData };

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

function parseClosedPartialFull(cell: string): 'full' | 'partial' | 'closed' {
  const status = parsePartial(cell);
  if (status === 'full') return 'full';
  if (status === 'partial') return 'partial';
  return 'closed';
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
  if (cell.toLowerCase().includes('eth')) return 'eth';
  const match = cell.match(/(\d+)\+?/);
  return match ? parseInt(match[1], 10) : 0;
}

// Parse license type
function parseLicense(cell: string): { status: 'open' | 'partial' | 'closed'; type: string } {
  const status = parsePartial(cell);
  // Extract license type like MIT, GPL-3, Apache-2.0, etc.
  const typeMatch = cell.match(
    /(MIT|GPL-3\.0|GPL-3|GPL|Apache-2\.0|Apache|MPL-2\.0|MPL-2|BSD-3-Clause|BSD|BUSL-1\.1|BUSL|Unlicensed|Prop|Src-Avail)/i
  );
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
  // Examples:
  // - "~$169"
  // - "~$50-150*" (DIY range)
  // - "$0-$17/mo"
  // - "TBD"
  const normalized = cell.replace(/[~*]/g, '').trim();
  const matches = Array.from(normalized.matchAll(/\$(\d+)/g)).map(m => parseInt(m[1], 10));
  const match = matches[0];
  const value = matches.length === 0
    ? null
    : matches.length === 1
      ? match
      : Math.round((Math.min(...matches) + Math.max(...matches)) / 2);
  return {
    value,
    text: normalized,
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

    // Table columns (HARDWARE_WALLET_COMPARISON_TABLE.md):
    // Wallet(0) Score(1) GitHub(2) Air-Gap(3) Open Source(4) Secure Elem(5)
    // Display(6) Price(7) Conn(8) Activity(9) Rec(10)
    const price = parsePrice(cells[7] || '');

    return {
      id: generateSlug(name),
      name,
      score: parseInt(cells[1], 10) || 0,
      github: extractGitHubUrl(cells[2] || ''),
      airGap: parseBoolean(cells[3] || ''),
      openSource: parseClosedPartialFull(cells[4] || ''),
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
 * Programmatic filtering/sorting utilities.
 *
 * Kept as exports from this module for backward compatibility, but implemented
 * in `wallet-filtering.ts` to avoid duplicated logic and to support client-safe reuse.
 */
export type { FilterOptions, SortDirection, SortField } from './wallet-filtering';
export {
  filterCryptoCards,
  filterHardwareWallets,
  filterSoftwareWallets,
  sortWallets,
} from './wallet-filtering';
