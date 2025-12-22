import { Metadata } from 'next';
import {
  parseSoftwareWallets,
  parseHardwareWallets,
  parseCryptoCards,
} from '@/lib/wallet-data';
import { getChainStats } from '@/lib/defillama';
import { ExploreContent } from './ExploreContent';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const ogImageVersion = 'v3';
const pageTitle = 'Explore & Compare Wallets | Wallet Radar';
const pageDescription = 'Filter, sort, and compare crypto wallets side-by-side. Advanced filtering for software wallets, hardware wallets, and crypto cards with real-time chain TVL data.';
const pageUrl = `${baseUrl}/explore/`;
const ogImageUrl = `${baseUrl}/og-explore.png?${ogImageVersion}`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'crypto wallet comparison',
    'wallet filter',
    'compare wallets',
    'software wallet',
    'hardware wallet',
    'crypto cards',
    'EVM wallet',
    'MetaMask alternative',
    'wallet explorer',
    'DeFi wallet comparison',
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Explore & Compare Crypto Wallets - Wallet Radar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    creator: '@chimeradefi',
    site: '@chimeradefi',
    images: [ogImageUrl],
  },
  alternates: {
    canonical: pageUrl,
  },
  robots: {
    index: true,
    follow: true,
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
