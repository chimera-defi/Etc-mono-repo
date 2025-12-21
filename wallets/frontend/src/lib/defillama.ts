/**
 * DeFiLlama API Integration
 * Fetches chain TVL data for wallet chain support context
 */

export interface ChainTVL {
  name: string;
  tvl: number;
  chainId: string | null;
  gecko_id: string | null;
  tokenSymbol: string | null;
  cmcId: string | null;
}

export interface ChainData {
  name: string;
  tvl: number;
  tvlFormatted: string;
  chainId: number | null;
  isEVM: boolean;
  rank: number;
}

// Cache for chain data
let cachedChainData: ChainData[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Format TVL as human-readable string
 */
function formatTVL(tvl: number): string {
  if (tvl >= 1e12) {
    return `$${(tvl / 1e12).toFixed(2)}T`;
  }
  if (tvl >= 1e9) {
    return `$${(tvl / 1e9).toFixed(2)}B`;
  }
  if (tvl >= 1e6) {
    return `$${(tvl / 1e6).toFixed(2)}M`;
  }
  if (tvl >= 1e3) {
    return `$${(tvl / 1e3).toFixed(2)}K`;
  }
  return `$${tvl.toFixed(2)}`;
}

/**
 * Known EVM chain IDs from DeFiLlama
 */
const EVM_CHAINS = new Set([
  'ethereum',
  'bsc',
  'polygon',
  'arbitrum',
  'optimism',
  'avalanche',
  'fantom',
  'cronos',
  'gnosis',
  'base',
  'linea',
  'scroll',
  'zksync era',
  'polygon zkevm',
  'manta',
  'mantle',
  'blast',
  'mode',
  'metis',
  'kava',
  'celo',
  'moonbeam',
  'moonriver',
  'aurora',
  'harmony',
  'klaytn',
  'evmos',
  'canto',
  'dogechain',
  'fuse',
  'boba',
  'oasis',
  'milkomeda',
  'thundercore',
  'iotex',
  'wanchain',
  'sx',
  'velas',
  'smartbch',
  'palm',
  'nahmii',
]);

/**
 * Fetch all chains with TVL from DeFiLlama
 */
export async function fetchChainsTVL(): Promise<ChainData[]> {
  // Return cached data if fresh
  if (cachedChainData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedChainData;
  }

  try {
    const response = await fetch('https://api.llama.fi/v2/chains', {
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    });

    if (!response.ok) {
      throw new Error(`DeFiLlama API error: ${response.status}`);
    }

    const data: ChainTVL[] = await response.json();

    // Sort by TVL and add rank
    const sortedChains = data
      .filter(chain => chain.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .map((chain, index) => ({
        name: chain.name,
        tvl: chain.tvl,
        tvlFormatted: formatTVL(chain.tvl),
        chainId: chain.chainId ? parseInt(chain.chainId, 10) : null,
        isEVM: EVM_CHAINS.has(chain.name.toLowerCase()),
        rank: index + 1,
      }));

    // Update cache
    cachedChainData = sortedChains;
    cacheTimestamp = Date.now();

    return sortedChains;
  } catch (error) {
    console.error('Failed to fetch DeFiLlama chains:', error);
    // Return cached data even if stale
    if (cachedChainData) {
      return cachedChainData;
    }
    return [];
  }
}

/**
 * Get top N EVM chains by TVL
 * @future Available for wallet chain coverage analysis
 */
export async function getTopEVMChains(limit: number = 20): Promise<ChainData[]> {
  const chains = await fetchChainsTVL();
  return chains.filter(chain => chain.isEVM).slice(0, limit);
}

/**
 * Get total EVM TVL
 * @future Available for dashboard statistics
 */
export async function getEVMTotalTVL(): Promise<{ total: number; formatted: string }> {
  const chains = await fetchChainsTVL();
  const evmChains = chains.filter(chain => chain.isEVM);
  const total = evmChains.reduce((sum, chain) => sum + chain.tvl, 0);
  return {
    total,
    formatted: formatTVL(total),
  };
}

/**
 * Get chain data by name
 * @future Available for chain-specific wallet analysis
 */
export async function getChainByName(name: string): Promise<ChainData | null> {
  const chains = await fetchChainsTVL();
  return chains.find(chain => chain.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Calculate wallet chain coverage
 * Returns what percentage of total EVM TVL a wallet's supported chains cover
 * @future Available for wallet comparison metrics
 */
export async function calculateChainCoverage(
  supportedChainCount: number | string
): Promise<{
  coverage: number;
  coverageFormatted: string;
  supportedTVL: string;
}> {
  if (typeof supportedChainCount === 'string') {
    // 'any' or 'evm' means full coverage
    return {
      coverage: 100,
      coverageFormatted: '100%',
      supportedTVL: 'All EVM chains',
    };
  }

  const chains = await fetchChainsTVL();
  const evmChains = chains.filter(chain => chain.isEVM);
  const totalEVMTVL = evmChains.reduce((sum, chain) => sum + chain.tvl, 0);

  // Assume wallets support the top chains by TVL
  const supportedChains = evmChains.slice(0, Math.min(supportedChainCount, evmChains.length));
  const supportedTVL = supportedChains.reduce((sum, chain) => sum + chain.tvl, 0);

  const coverage = totalEVMTVL > 0 ? (supportedTVL / totalEVMTVL) * 100 : 0;

  return {
    coverage: Math.round(coverage * 100) / 100,
    coverageFormatted: `${coverage.toFixed(1)}%`,
    supportedTVL: formatTVL(supportedTVL),
  };
}

/**
 * Pre-computed chain stats for static generation
 * This can be called at build time
 */
export async function getChainStats(): Promise<{
  totalChains: number;
  evmChains: number;
  totalTVL: string;
  evmTVL: string;
  topChains: { name: string; tvl: string }[];
}> {
  const chains = await fetchChainsTVL();
  const evmChains = chains.filter(chain => chain.isEVM);

  const totalTVL = chains.reduce((sum, chain) => sum + chain.tvl, 0);
  const evmTVL = evmChains.reduce((sum, chain) => sum + chain.tvl, 0);

  return {
    totalChains: chains.length,
    evmChains: evmChains.length,
    totalTVL: formatTVL(totalTVL),
    evmTVL: formatTVL(evmTVL),
    topChains: evmChains.slice(0, 10).map(chain => ({
      name: chain.name,
      tvl: chain.tvlFormatted,
    })),
  };
}
