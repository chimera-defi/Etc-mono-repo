import { Metadata } from 'next';
import {
  parseSoftwareWallets,
  parseHardwareWallets,
  parseCryptoCards,
  parseRamps,
} from '@/lib/wallet-data';
import { getAllDocuments, getWalletStats } from '@/lib/markdown';
import { getChainStats } from '@/lib/defillama';
import { ExploreContent } from './ExploreContent';
import { SocialShare } from '@/components/SocialShare';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const ogImageVersion = 'v5';
const pageTitle = 'Explore & Compare Wallets | Wallet Radar';
const pageDescription = 'Filter, sort, and compare crypto wallets side-by-side. Advanced filtering for software wallets, hardware wallets, and crypto cards with real-time chain TVL data.';
const pageUrl = `${baseUrl}/explore/`;
const ogImageUrl = `${baseUrl}/og-image.svg?${ogImageVersion}`;

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
  const ramps = parseRamps();

  const docs = getAllDocuments();
  const walletStats = getWalletStats(docs);

  // Fetch chain stats from DeFiLlama
  let chainStats = null;
  try {
    chainStats = await getChainStats();
  } catch (error) {
    console.error('Failed to fetch chain stats:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-slate-100">Explore &amp; Compare</h1>
            <p className="text-slate-400">
              Filter, sort, and compare wallets side-by-side. Select wallets to see a detailed comparison.
            </p>
          </div>
          <SocialShare
            url={pageUrl}
            title={pageTitle}
            description={pageDescription}
            size="large"
          />
        </div>
        <div className="mt-4">
          {chainStats ? (
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="px-3 py-1.5 bg-slate-900/70 border border-slate-700/60 rounded-lg">
                <span className="text-slate-400">Data Updated:</span>{' '}
                <span className="font-semibold text-slate-200">{walletStats.lastUpdated}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-900/70 border border-slate-700/60 rounded-lg">
                <span className="text-slate-400">Total EVM Chains:</span>{' '}
                <span className="font-semibold text-slate-200">{chainStats.evmChains}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-900/70 border border-slate-700/60 rounded-lg">
                <span className="text-slate-400">EVM TVL:</span>{' '}
                <span className="font-semibold text-emerald-400">
                  {chainStats.evmTVL}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-slate-900/70 border border-slate-700/60 rounded-lg">
                <span className="text-slate-400">Top Chain:</span>{' '}
                <span className="font-semibold text-slate-200">
                  {chainStats.topChains[0]?.name} ({chainStats.topChains[0]?.tvl})
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Live chain stats are temporarily unavailable. Data last updated: {walletStats.lastUpdated}.
            </p>
          )}
        </div>
      </div>

      <ExploreContent
        softwareWallets={softwareWallets}
        hardwareWallets={hardwareWallets}
        cryptoCards={cryptoCards}
        ramps={ramps}
      />
    </div>
  );
}
