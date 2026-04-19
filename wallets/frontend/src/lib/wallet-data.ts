import fs from 'fs';
import path from 'path';
import type { ApiOpenness, CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData } from '@/types/wallets';
import scoring from '@/lib/scoring';

export type { ApiOpenness, CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData };

const {
  computeSoftwareScore,
  computeHardwareScore,
  computeCardScore,
  computeRampScore,
  assignRecommendationBands,
} = scoring;

// Path to markdown files (one level up from frontend)
const CONTENT_DIR = path.join(process.cwd(), '..');
const MERCHANT_PRICING_PATH = path.join(CONTENT_DIR, 'data', 'merchant_pricing.json');

function loadMerchantPricing(): Record<string, { last_checked?: string }> {
  try {
    if (!fs.existsSync(MERCHANT_PRICING_PATH)) return {};
    const raw = fs.readFileSync(MERCHANT_PRICING_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, { last_checked?: string }>;
  } catch {
    return {};
  }
}

// Parse status symbols
function parseStatus(cell: string): 'active' | 'slow' | 'inactive' | 'private' {
  const lower = cell.toLowerCase();
  // Check "inactive" first so it is not misclassified by "active" substring matching.
  if (cell.includes('❌') || /\binactive\b/.test(lower)) return 'inactive';
  if (cell.includes('🔒') || /\bprivate\b/.test(lower)) return 'private';
  if (cell.includes('⚠️') || /\bslow\b/.test(lower)) return 'slow';
  if (cell.includes('✅') || /\bactive\b/.test(lower)) return 'active';
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

// Parse supported chains from HTML img tags or Unicode symbols
// Images: eth.svg (EVM), btc.svg (Bitcoin), sol.svg (Solana), move.svg (Move), cosmos.svg (Cosmos), polkadot.svg (Polkadot), starknet.svg (Starknet)
// Footnotes: ¹ ² ³ ⁴ indicate additional chains listed in legend
function parseSupportedChains(cell: string): import('@/types/wallets').SupportedChains {
  const raw = cell.trim();
  
  // Check for image tags (new format) or Unicode symbols (legacy format)
  const hasImg = (name: string) => raw.includes(`/${name}.`) || raw.includes(`${name}.svg`) || raw.includes(`${name}.png`);
  
  return {
    evm: hasImg('eth') || raw.includes('⟠'),
    bitcoin: hasImg('btc') || raw.includes('₿'),
    solana: hasImg('sol') || raw.includes('◎'),
    move: hasImg('move') || hasImg('sui') || hasImg('aptos') || raw.includes('△'),
    cosmos: hasImg('cosmos') || raw.includes('⚛'),
    polkadot: hasImg('polkadot') || raw.includes('●'),
    starknet: hasImg('starknet') || raw.includes('⧫'),
    // Check for footnote markers (¹²³⁴) or explicit "other" chains
    other: /[¹²³⁴⁵⁶⁷⁸⁹]/.test(raw) || raw.includes('+') || hasImg('ton') || hasImg('xrp') || hasImg('tron'),
    raw,
  };
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

// Parse API openness
function parseApiOpenness(cell: string): import('@/types/wallets').ApiOpenness {
  if (cell.includes('✅') || cell.toLowerCase().includes('open') || cell.toLowerCase().includes('none')) return 'open';
  if (cell.includes('🌐') || cell.toLowerCase().includes('public')) return 'public';
  if (cell.includes('⚠️') || cell.toLowerCase().includes('partial') || cell.toLowerCase().includes('limited') || 
      cell.toLowerCase().includes('infura') || cell.toLowerCase().includes('alchemy') || cell.toLowerCase().includes('browser') ||
      cell.toLowerCase().includes('waku') || cell.toLowerCase().includes('dex')) return 'partial';
  return 'closed';
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

// Parse custody type
// 🔐 Self = self-custody/non-custodial
// 🏦 Exch = exchange custody
// 📋 CeFi = centralized finance custody
function parseCustodyType(cell: string): import('@/types/wallets').CustodyType {
  if (cell.includes('🔐') || cell.toLowerCase().includes('self')) return 'self';
  if (cell.includes('🏦') || cell.toLowerCase().includes('exch')) return 'exchange';
  return 'cefi';
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
function parseCardStatus(cell: string): 'active' | 'verify' | 'launching' | 'inactive' {
  if (cell.includes('❌') || cell.toLowerCase().includes('inactive') || cell.toLowerCase().includes('discontinued')) return 'inactive';
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

// Parse only the primary comparison table from markdown into rows (header + data rows).
function parseMarkdownTable(content: string): string[][] {
  const lines = content.split('\n');
  const headerIndex = lines.findIndex((line, index) => (
    line.startsWith('|') &&
    index + 1 < lines.length &&
    /^\|[\s-:|]+\|$/.test(lines[index + 1].trim())
  ));

  if (headerIndex === -1) return [];

  const rows: string[][] = [];
  rows.push(
    lines[headerIndex]
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
  );

  for (let i = headerIndex + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith('|')) break;
    if (/^\|[\s-:|]+\|$/.test(line.trim())) continue;
    rows.push(
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
    );
  }

  return rows;
}

// Parse software wallets from markdown
export function parseSoftwareWallets(): SoftwareWallet[] {
  const filePath = path.join(CONTENT_DIR, 'SOFTWARE_WALLETS.md');

  if (!fs.existsSync(filePath)) {
    console.error('Software wallet file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  const parsed = dataRows.map(cells => {
    // Extract wallet name from bold text
    const nameMatch = cells[0]?.match(/\*\*([^*]+)\*\*/);
    const name = nameMatch ? nameMatch[1] : cells[0] || 'Unknown';

    const license = parseLicense(cells[10] || '');
    const funding = parseFunding(cells[13] || '');
    const scoreInfo = computeSoftwareScore(cells);

    // Table columns after adding API column (index 11):
    // 0=Wallet, 1=Score, 2=Core, 3=Rel/Mo, 4=RPC, 5=GitHub, 6=Active,
    // 7=Chains, 8=Devices, 9=Testnets, 10=License, 11=API, 12=Audits,
    // 13=Funding, 14=TxSim, 15=Scam, 16=Account, 17=ENS, 18=HW, 19=BestFor, 20=Rec
    const wallet: SoftwareWallet = {
      id: generateSlug(name),
      name,
      score: scoreInfo.score,
      methodologyVersion: scoreInfo.methodologyVersion,
      scoreBreakdown: scoreInfo.breakdown,
      core: parsePartial(cells[2] || '') as 'full' | 'partial' | 'none',
      releasesPerMonth: parseReleasesPerMonth(cells[3] || ''),
      rpc: parsePartial(cells[4] || '') as 'full' | 'partial' | 'none',
      github: extractGitHubUrl(cells[5] || ''),
      active: parseStatus(cells[6] || ''),
      chains: parseSupportedChains(cells[7] || ''),
      devices: parseDevices(cells[8] || ''),
      testnets: parseBoolean(cells[9] || ''),
      license: license.status,
      licenseType: license.type,
      apiOpenness: parseApiOpenness(cells[11] || ''),
      audits: parseAudits(cells[12] || ''),
      funding: funding.status,
      fundingSource: funding.source,
      txSimulation: parseBoolean(cells[14] || ''),
      scamAlerts: parsePartial(cells[15] || '') as 'full' | 'partial' | 'none',
      accountTypes: parseAccountTypes(cells[16] || ''),
      ensNaming: parseEnsNaming(cells[17] || ''),
      hardwareSupport: parseBoolean(cells[18] || ''),
      bestFor: cells[19]?.replace(/[~*]/g, '').trim() || '',
      recommendation: scoreInfo.recommendation,
      type: 'software' as const,
    };
    return { wallet, scoreInfo };
  });

  const filtered = parsed.filter(({ wallet }) => wallet.name !== 'Unknown' && wallet.score > 0 && wallet.id !== '');
  const { recommendations } = assignRecommendationBands(
    'software',
    filtered.map((entry) => entry.scoreInfo)
  );

  return filtered.map((entry, index) => ({
    ...entry.wallet,
    recommendation: (recommendations[index] || entry.wallet.recommendation) as SoftwareWallet['recommendation'],
  }));
}

// Parse hardware wallets from markdown
export function parseHardwareWallets(): HardwareWallet[] {
  const filePath = path.join(CONTENT_DIR, 'HARDWARE_WALLETS.md');
  const pricing = loadMerchantPricing();

  if (!fs.existsSync(filePath)) {
    console.error('Hardware wallet file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  const parsed = dataRows.map(cells => {
    // Extract wallet name and URL from markdown link
    const linkMatch = cells[0]?.match(/\[?\*\*([^*\]]+)\*\*\]?\(?([^)]*)\)?/);
    const urlMatch = cells[0]?.match(/\]\(([^)]+)\)/);
    const name = linkMatch ? linkMatch[1].replace(/~~|^\[|\]$/g, '') : cells[0]?.replace(/[*~[\]]/g, '') || 'Unknown';
    const url = urlMatch ? urlMatch[1] : null;

    // Table columns (HARDWARE_WALLETS.md):
    // Wallet(0) Score(1) GitHub(2) Air-Gap(3) Open Source(4) Secure Elem(5)
    // Display(6) Price(7) Conn(8) Activity(9) Founded(10) Funding(11) Rec(12)
    const price = parsePrice(cells[7] || '');
    const priceLastChecked = pricing[name]?.last_checked ?? null;
    const foundedYear = parseInt(cells[10] || '', 10);
    const funding = parseFunding(cells[11] || '');
    const scoreInfo = computeHardwareScore(cells);

    const wallet: HardwareWallet = {
      id: generateSlug(name),
      name,
      score: scoreInfo.score,
      methodologyVersion: scoreInfo.methodologyVersion,
      scoreBreakdown: scoreInfo.breakdown,
      github: extractGitHubUrl(cells[2] || ''),
      airGap: parseBoolean(cells[3] || ''),
      openSource: parseClosedPartialFull(cells[4] || ''),
      secureElement: parseBoolean(cells[5] || ''),
      secureElementType: cells[5]?.includes('✅') ? cells[5].replace(/✅\s*/, '').trim() || null : null,
      display: cells[6]?.trim() || 'Unknown',
      price: price.value,
      priceText: price.text,
      priceLastChecked,
      connectivity: parseConnectivity(cells[8] || ''),
      active: parseStatus(cells[9] || ''),
      foundedYear: Number.isFinite(foundedYear) ? foundedYear : null,
      funding: funding.status,
      fundingSource: funding.source,
      recommendation: scoreInfo.recommendation as 'recommended' | 'situational' | 'avoid',
      url,
      type: 'hardware' as const,
    };
    return { wallet, scoreInfo };
  });

  const filtered = parsed.filter(({ wallet }) => wallet.name !== 'Unknown' && wallet.score > 0 && wallet.id !== '');
  const { recommendations } = assignRecommendationBands(
    'hardware',
    filtered.map((entry) => entry.scoreInfo)
  );

  return filtered.map((entry, index) => ({
    ...entry.wallet,
    recommendation: (recommendations[index] || entry.wallet.recommendation) as HardwareWallet['recommendation'],
  }));
}

// Parse crypto cards from markdown
export function parseCryptoCards(): CryptoCard[] {
  const filePath = path.join(CONTENT_DIR, 'CRYPTO_CARDS.md');

  if (!fs.existsSync(filePath)) {
    console.error('Crypto card file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  // Table columns (CRYPTO_CARDS.md) after merging Provider into Card column (Jan 2026):
  // Card(0) Score(1) Type(2) Custody(3) Biz(4) Region(5) CashBack(6)
  // AnnualFee(7) FxFee(8) Rewards(9) Status(10) BestFor(11) Rec(12)
  // Card column now has format: [**Card Name**](url)
  const parsed = dataRows.map(cells => {
    // Extract card name and URL from markdown link format: [**Card Name**](url)
    const linkMatch = cells[0]?.match(/\[(?:\*\*)?([^*\]]+)(?:\*\*)?\]\(([^)]+)\)/);
    const nameMatch = cells[0]?.match(/\*\*([^*]+)\*\*/);
    
    let name = 'Unknown';
    let cardUrl: string | null = null;
    
    if (linkMatch) {
      name = linkMatch[1].trim();
      cardUrl = linkMatch[2].trim();
    } else if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      name = cells[0]?.replace(/[*[\]()]/g, '').trim() || 'Unknown';
    }

    // Parse score (may have emoji)
    const scoreInfo = computeCardScore(cells);

    const region = parseRegion(cells[5] || '');

    const card: CryptoCard = {
      id: generateSlug(name),
      name,
      score: scoreInfo.score,
      methodologyVersion: scoreInfo.methodologyVersion,
      scoreBreakdown: scoreInfo.breakdown,
      cardType: parseCardType(cells[2] || ''),
      custody: parseCustodyType(cells[3] || ''),
      businessSupport: parseBusinessSupport(cells[4] || ''),
      region: region.region,
      regionCode: region.code,
      cashBack: cells[6]?.trim() || '0%',
      cashBackMax: parseCashBackMax(cells[6] || ''),
      annualFee: cells[7]?.trim() || '$0',
      fxFee: cells[8]?.trim() || '0%',
      rewards: cells[9]?.trim() || 'None',
      provider: name, // Provider is now the card name itself
      providerUrl: cardUrl, // URL now comes from Card column
      status: parseCardStatus(cells[10] || ''),
      bestFor: cells[11]?.trim() || '',
      recommendation: scoreInfo.recommendation as 'recommended' | 'situational' | 'avoid',
      type: 'card' as const,
    };
    return { card, scoreInfo };
  });

  const filtered = parsed.filter(({ card }) => card.name !== 'Unknown' && card.score > 0 && card.id !== '');
  const { recommendations } = assignRecommendationBands(
    'cards',
    filtered.map((entry) => entry.scoreInfo)
  );

  return filtered.map((entry, index) => ({
    ...entry.card,
    recommendation: (recommendations[index] || entry.card.recommendation) as CryptoCard['recommendation'],
  }));
}

// Parse ramp type
function parseRampType(cell: string): 'both' | 'on-ramp' | 'off-ramp' {
  const lower = cell.toLowerCase();
  if (lower.includes('both')) return 'both';
  if (lower.includes('off')) return 'off-ramp';
  return 'on-ramp';
}

// Parse ramps from markdown
export function parseRamps(): Ramp[] {
  const filePath = path.join(CONTENT_DIR, 'RAMPS.md');

  if (!fs.existsSync(filePath)) {
    console.error('Ramp file not found:', filePath);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseMarkdownTable(content);

  // Skip header row
  const dataRows = rows.slice(1);

  // Table columns (RAMPS.md):
  // Provider(0) Score(1) Type(2) On-Ramp(3) Off-Ramp(4) Coverage(5) Fee Model(6)
  // Min Fee(7) Dev UX(8) Status(9) Founded(10) Funding(11) Best For(12) Rec(13)
  const parsed = dataRows.map(cells => {
    // Extract provider name and URL from markdown link format: [**Name**](url)
    const linkMatch = cells[0]?.match(/\[(?:\*\*)?([^*]+)(?:\*\*)?\]\(([^)]+)\)/);
    const nameMatch = cells[0]?.match(/\*\*([^*]+)\*\*/);
    
    let name = 'Unknown';
    let url: string | null = null;
    
    if (linkMatch) {
      name = linkMatch[1].trim();
      url = linkMatch[2].trim();
    } else if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      name = cells[0]?.trim() || 'Unknown';
    }

    // Parse score (may have emoji)
    const scoreInfo = computeRampScore(cells);
    const foundedYear = parseInt(cells[10] || '', 10);
    const funding = parseFunding(cells[11] || '');

    const ramp: Ramp = {
      id: generateSlug(name),
      name,
      score: scoreInfo.score,
      methodologyVersion: scoreInfo.methodologyVersion,
      scoreBreakdown: scoreInfo.breakdown,
      rampType: parseRampType(cells[2] || ''),
      onRamp: parseBoolean(cells[3] || ''),
      offRamp: parseBoolean(cells[4] || ''),
      coverage: cells[5]?.trim() || 'Unknown',
      feeModel: cells[6]?.trim() || 'Unknown',
      minFee: cells[7]?.trim() || 'Custom',
      devUx: cells[8]?.trim() || 'Good',
      status: parseCardStatus(cells[9] || ''),
      foundedYear: Number.isFinite(foundedYear) ? foundedYear : null,
      funding: funding.status,
      fundingSource: funding.source,
      bestFor: cells[12]?.trim() || '',
      recommendation: scoreInfo.recommendation as 'recommended' | 'situational' | 'avoid',
      url,
      type: 'ramp' as const,
    };
    return { ramp, scoreInfo };
  });

  const filtered = parsed.filter(({ ramp }) => ramp.name !== 'Unknown' && ramp.score > 0 && ramp.id !== '');
  const { recommendations } = assignRecommendationBands(
    'ramps',
    filtered.map((entry) => entry.scoreInfo)
  );

  return filtered.map((entry, index) => ({
    ...entry.ramp,
    recommendation: (recommendations[index] || entry.ramp.recommendation) as Ramp['recommendation'],
  }));
}

/**
 * Get all wallet data in a single call
 * @future Available for API endpoint implementation
 */
type AllWalletData = {
  software: SoftwareWallet[];
  hardware: HardwareWallet[];
  cards: CryptoCard[];
  ramps: Ramp[];
};

type WalletTableSummary = {
  softwareColumns: number;
  hardwareColumns: number;
  cardColumns: number;
  rampColumns: number;
  totalVisibleColumns: number;
};

let cachedAllWalletData: AllWalletData | null = null;
let cachedWalletTableSummary: WalletTableSummary | null = null;

function countFirstTableColumns(fileName: string): number {
  const filePath = path.join(CONTENT_DIR, fileName);
  if (!fs.existsSync(filePath)) return 0;

  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('|') || line.match(/^\|[\s-:|]+\|$/)) continue;
    return line
      .split('|')
      .slice(1, -1)
      .map(cell => cell.trim())
      .filter(Boolean)
      .length;
  }

  return 0;
}

export function getAllWalletData(): AllWalletData {
  if (!cachedAllWalletData) {
    cachedAllWalletData = {
      software: parseSoftwareWallets(),
      hardware: parseHardwareWallets(),
      cards: parseCryptoCards(),
      ramps: parseRamps(),
    };
  }

  return cachedAllWalletData;
}

export function getWalletTableSummary(): WalletTableSummary {
  if (!cachedWalletTableSummary) {
    const softwareColumns = countFirstTableColumns('SOFTWARE_WALLETS.md');
    const hardwareColumns = countFirstTableColumns('HARDWARE_WALLETS.md');
    const cardColumns = countFirstTableColumns('CRYPTO_CARDS.md');
    const rampColumns = countFirstTableColumns('RAMPS.md');

    cachedWalletTableSummary = {
      softwareColumns,
      hardwareColumns,
      cardColumns,
      rampColumns,
      totalVisibleColumns: softwareColumns + hardwareColumns + cardColumns + rampColumns,
    };
  }

  return cachedWalletTableSummary;
}

const WALLET_TYPES = ['software', 'hardware', 'cards', 'ramps'] as const;

export type WalletType = typeof WALLET_TYPES[number];

export function isWalletType(value: string): value is WalletType {
  return (WALLET_TYPES as readonly string[]).includes(value);
}

export function getWalletsByType(type: WalletType): WalletData[] {
  const allWallets = getAllWalletData();
  switch (type) {
    case 'software':
      return allWallets.software;
    case 'hardware':
      return allWallets.hardware;
    case 'cards':
      return allWallets.cards;
    case 'ramps':
      return allWallets.ramps;
  }
}

export function getWalletById(type: WalletType, id: string): WalletData | null {
  const wallets = getWalletsByType(type);
  return wallets.find(wallet => wallet.id === id) ?? null;
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
  filterRamps,
  filterSoftwareWallets,
  sortWallets,
} from './wallet-filtering';

export interface WalletCompany {
  name: string;
  aggregatedScore: number;
  walletCount: number;
  wallets: HardwareWallet[];
}

export function getHardwareWalletCompanies(): WalletCompany[] {
  const wallets = parseHardwareWallets();
  const companies: Record<string, HardwareWallet[]> = {};

  wallets.forEach(wallet => {
    // Determine company name based on wallet name
    let companyName = wallet.name.split(' ')[0];
    
    // Handle special cases
    if (wallet.name.startsWith('BC Vault')) companyName = 'BC Vault';
    if (wallet.name.toLowerCase().includes('coldcard')) companyName = 'Coldcard';
    if (wallet.name.toLowerCase().includes('trezor')) companyName = 'Trezor';
    if (wallet.name.includes('BitBox')) companyName = 'BitBox';

    if (!companies[companyName]) {
      companies[companyName] = [];
    }
    companies[companyName].push(wallet);
  });

  return Object.entries(companies).map(([name, companyWallets]) => {
    const totalScore = companyWallets.reduce((sum, w) => sum + w.score, 0);
    const aggregatedScore = totalScore / companyWallets.length;
    
    return {
      name,
      aggregatedScore,
      walletCount: companyWallets.length,
      wallets: companyWallets
    };
  }).sort((a, b) => b.aggregatedScore - a.aggregatedScore);
}
