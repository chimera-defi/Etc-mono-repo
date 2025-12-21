import { Metadata } from 'next';
import {
  parseSoftwareWallets,
  parseHardwareWallets,
  parseCryptoCards,
} from '@/lib/wallet-data';
import { getChainStats } from '@/lib/defillama';
import { ExploreContent } from './ExploreContent';

export const metadata: Metadata = {
  title: 'Explore & Compare Wallets | Wallet Radar',
  description:
    'Filter, sort, and compare crypto wallets side-by-side. Advanced filtering for software wallets, hardware wallets, and crypto cards with real-time chain TVL data.',
  openGraph: {
    title: 'Explore & Compare Wallets | Wallet Radar',
    description:
      'Filter, sort, and compare crypto wallets side-by-side. Advanced filtering for software wallets, hardware wallets, and crypto cards.',
    type: 'website',
  },
};

export default async function ExplorePage() {
  // Fetch wallet data at build time
  const softwareWallets = parseSoftwareWallets();
  const hardwareWallets = parseHardwareWallets();
  const cryptoCards = parseCryptoCards();

  // Fetch chain stats from DeFiLlama
  let chainStats = null;
  try {
    chainStats = await getChainStats();
  } catch (error) {
    console.error('Failed to fetch chain stats:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore & Compare</h1>
        <p className="text-muted-foreground">
          Filter, sort, and compare wallets side-by-side. Select wallets to see a detailed comparison.
        </p>
        {chainStats && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="px-3 py-1.5 bg-muted rounded-lg">
              <span className="text-muted-foreground">Total EVM Chains:</span>{' '}
              <span className="font-semibold">{chainStats.evmChains}</span>
            </div>
            <div className="px-3 py-1.5 bg-muted rounded-lg">
              <span className="text-muted-foreground">EVM TVL:</span>{' '}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {chainStats.evmTVL}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-muted rounded-lg">
              <span className="text-muted-foreground">Top Chain:</span>{' '}
              <span className="font-semibold">
                {chainStats.topChains[0]?.name} ({chainStats.topChains[0]?.tvl})
              </span>
            </div>
          </div>
        )}
      </div>

      <ExploreContent
        softwareWallets={softwareWallets}
        hardwareWallets={hardwareWallets}
        cryptoCards={cryptoCards}
      />
    </div>
  );
}
