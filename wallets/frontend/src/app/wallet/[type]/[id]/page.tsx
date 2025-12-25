import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Shield,
  Cpu,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Github,
  Smartphone,
  Globe,
  Monitor,
  Link2,
} from 'lucide-react';
import {
  parseSoftwareWallets,
  parseHardwareWallets,
  parseCryptoCards,
  type SoftwareWallet,
  type HardwareWallet,
  type CryptoCard,
} from '@/lib/wallet-data';
import {
  SITE_CONFIG,
  WALLET_TYPE_CONFIG,
  RECOMMENDATION_CONFIG,
  getAbsoluteUrl,
  getOgImageUrl,
  getCanonicalUrl,
  generateWalletKeywords,
  generateWalletSchema,
  scoreToRating,
} from '@/lib/seo-config';
import { Breadcrumbs } from '@/components/Breadcrumbs';

type WalletType = 'software' | 'hardware' | 'card';

interface PageProps {
  params: {
    type: WalletType;
    id: string;
  };
}

// Get wallet by type and ID
function getWallet(type: WalletType, id: string) {
  switch (type) {
    case 'software':
      return parseSoftwareWallets().find((w) => w.id === id);
    case 'hardware':
      return parseHardwareWallets().find((w) => w.id === id);
    case 'card':
      return parseCryptoCards().find((w) => w.id === id);
    default:
      return null;
  }
}

// Generate static params for all wallets
export async function generateStaticParams() {
  const params: { type: WalletType; id: string }[] = [];

  // Software wallets
  parseSoftwareWallets().forEach((wallet) => {
    params.push({ type: 'software', id: wallet.id });
  });

  // Hardware wallets
  parseHardwareWallets().forEach((wallet) => {
    params.push({ type: 'hardware', id: wallet.id });
  });

  // Crypto cards
  parseCryptoCards().forEach((wallet) => {
    params.push({ type: 'card', id: wallet.id });
  });

  return params;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const wallet = getWallet(params.type, params.id);

  if (!wallet) {
    return { title: 'Wallet Not Found' };
  }

  const typeConfig = WALLET_TYPE_CONFIG[params.type];
  const title = `${wallet.name} Review - ${typeConfig.singular} | ${SITE_CONFIG.name}`;
  const description = getWalletDescription(wallet, params.type);
  const pageUrl = getCanonicalUrl(`/wallet/${params.type}/${params.id}`);
  const ogImage = getOgImageUrl(getOgImageForType(params.type));
  const keywords = generateWalletKeywords(wallet.name, params.type, getWalletFeatures(wallet, params.type));

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${wallet.name} Review` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: SITE_CONFIG.twitter,
      site: SITE_CONFIG.twitter,
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function getOgImageForType(type: WalletType): string {
  switch (type) {
    case 'software':
      return '/og-software-wallets-details.png';
    case 'hardware':
      return '/og-hardware-wallets-details.png';
    case 'card':
      return '/og-crypto-cards-details.png';
    default:
      return '/og-image.png';
  }
}

function getWalletDescription(wallet: SoftwareWallet | HardwareWallet | CryptoCard, type: WalletType): string {
  const recConfig = RECOMMENDATION_CONFIG[wallet.recommendation as keyof typeof RECOMMENDATION_CONFIG];

  if (type === 'software') {
    const sw = wallet as SoftwareWallet;
    return `${sw.name} scores ${sw.score}/100. ${recConfig?.label || 'Situational'} ${WALLET_TYPE_CONFIG[type].singular.toLowerCase()} with ${sw.chains} chains support. ${sw.bestFor || 'General crypto wallet'}. Compare features, security, and developer metrics.`;
  }

  if (type === 'hardware') {
    const hw = wallet as HardwareWallet;
    return `${hw.name} scores ${hw.score}/100. ${recConfig?.label || 'Situational'} ${WALLET_TYPE_CONFIG[type].singular.toLowerCase()} ${hw.price ? `at $${hw.price}` : ''}. ${hw.openSource === 'full' ? 'Fully open source' : hw.openSource === 'partial' ? 'Partially open source' : 'Closed source'}. ${hw.secureElement ? 'Secure element included.' : ''}`;
  }

  const card = wallet as CryptoCard;
  return `${card.name} scores ${card.score}/100. ${card.cardType} crypto card with ${card.cashBack} cashback. Available in ${card.region}. ${card.bestFor || 'Crypto spending'}. Compare fees, rewards, and regional availability.`;
}

function getWalletFeatures(wallet: SoftwareWallet | HardwareWallet | CryptoCard, type: WalletType): string[] {
  const features: string[] = [];

  if (type === 'software') {
    const sw = wallet as SoftwareWallet;
    if (sw.txSimulation) features.push('transaction simulation');
    if (sw.scamAlerts !== 'none') features.push('scam alerts');
    if (sw.hardwareSupport) features.push('hardware wallet support');
    if (sw.devices.mobile) features.push('mobile wallet');
    if (sw.devices.browser) features.push('browser extension');
    if (sw.license === 'open') features.push('open source');
  } else if (type === 'hardware') {
    const hw = wallet as HardwareWallet;
    if (hw.airGap) features.push('air-gapped');
    if (hw.secureElement) features.push('secure element');
    if (hw.openSource === 'full') features.push('open source firmware');
  } else {
    const card = wallet as CryptoCard;
    if (card.cashBackMax && card.cashBackMax > 0) features.push('cashback rewards');
    if (card.businessSupport === 'yes') features.push('business cards');
  }

  return features;
}

function getRelatedWallets(currentId: string, type: WalletType): (SoftwareWallet | HardwareWallet | CryptoCard)[] {
  let wallets: (SoftwareWallet | HardwareWallet | CryptoCard)[] = [];

  switch (type) {
    case 'software':
      wallets = parseSoftwareWallets();
      break;
    case 'hardware':
      wallets = parseHardwareWallets();
      break;
    case 'card':
      wallets = parseCryptoCards();
      break;
  }

  return wallets
    .filter((w) => w.id !== currentId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export default function WalletPage({ params }: PageProps) {
  const wallet = getWallet(params.type, params.id);

  if (!wallet) {
    notFound();
  }

  const typeConfig = WALLET_TYPE_CONFIG[params.type];
  const recConfig = RECOMMENDATION_CONFIG[wallet.recommendation as keyof typeof RECOMMENDATION_CONFIG];
  const relatedWallets = getRelatedWallets(params.id, params.type);
  const pageUrl = getAbsoluteUrl(`/wallet/${params.type}/${params.id}`);

  // Generate structured data
  const walletSchema = generateWalletSchema({
    name: wallet.name,
    type: params.type,
    score: wallet.score,
    description: getWalletDescription(wallet, params.type),
    url: pageUrl,
    features: getWalletFeatures(wallet, params.type),
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getAbsoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: typeConfig.plural, item: getAbsoluteUrl(`/explore?type=${params.type}`) },
      { '@type': 'ListItem', position: 3, name: wallet.name, item: pageUrl },
    ],
  };

  const TypeIcon = params.type === 'software' ? Shield : params.type === 'hardware' ? Cpu : CreditCard;

  return (
    <>
      <Script
        id="wallet-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(walletSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: typeConfig.plural, href: `/explore?type=${params.type}` },
            { label: wallet.name, href: `/wallet/${params.type}/${params.id}` },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 mt-6">
          {/* Main Content */}
          <article>
            {/* Header */}
            <header className="mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${recConfig?.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : recConfig?.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' : recConfig?.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-900/30'}`}>
                  <TypeIcon className={`h-6 w-6 ${recConfig?.color === 'green' ? 'text-green-600' : recConfig?.color === 'yellow' ? 'text-yellow-600' : recConfig?.color === 'red' ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{wallet.name}</h1>
                  <p className="text-muted-foreground">{typeConfig.singular}</p>
                </div>
              </div>

              {/* Score and Recommendation */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold">{wallet.score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${recConfig?.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : recConfig?.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : recConfig?.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'}`}>
                  {recConfig?.emoji} {recConfig?.label || 'Situational'}
                </span>
              </div>
            </header>

            {/* Features */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Features & Details</h2>
              {params.type === 'software' && <SoftwareWalletDetails wallet={wallet as SoftwareWallet} />}
              {params.type === 'hardware' && <HardwareWalletDetails wallet={wallet as HardwareWallet} />}
              {params.type === 'card' && <CryptoCardDetails wallet={wallet as CryptoCard} />}
            </section>

            {/* Best For */}
            {'bestFor' in wallet && wallet.bestFor && (
              <section className="mb-8 p-4 rounded-lg bg-muted/50 border border-border">
                <h2 className="text-lg font-semibold mb-2">Best For</h2>
                <p className="text-muted-foreground">{wallet.bestFor}</p>
              </section>
            )}

            {/* External Links */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">External Resources</h2>
              <div className="flex flex-wrap gap-3">
                {'github' in wallet && wallet.github && (
                  <a
                    href={wallet.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub Repository
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {'url' in wallet && wallet.url && (
                  <a
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Official Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {'providerUrl' in wallet && wallet.providerUrl && (
                  <a
                    href={wallet.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Card Provider
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </section>

            {/* Internal Links */}
            <section className="mb-8 p-4 rounded-lg border border-border">
              <h2 className="text-lg font-semibold mb-3">Compare & Learn More</h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/explore"
                  className="text-sm text-primary hover:underline"
                >
                  Explore All Wallets
                </Link>
                <span className="text-muted-foreground">|</span>
                <Link
                  href={`/docs/${params.type === 'software' ? 'wallet-comparison-unified-table' : params.type === 'hardware' ? 'hardware-wallet-comparison-table' : 'crypto-credit-card-comparison-table'}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Full Comparison Table
                </Link>
                <span className="text-muted-foreground">|</span>
                <Link
                  href={`/docs/${params.type === 'software' ? 'wallet-comparison-unified-details' : params.type === 'hardware' ? 'hardware-wallet-comparison-details' : 'crypto-credit-card-comparison-details'}`}
                  className="text-sm text-primary hover:underline"
                >
                  Read Detailed Documentation
                </Link>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-6 border-t border-border">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Explore
              </Link>
            </footer>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Quick Stats */}
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-3">Quick Stats</h3>
                <QuickStats wallet={wallet} type={params.type} />
              </div>

              {/* Related Wallets */}
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-3">Similar {typeConfig.plural}</h3>
                <ul className="space-y-2">
                  {relatedWallets.map((w) => (
                    <li key={w.id}>
                      <Link
                        href={`/wallet/${params.type}/${w.id}`}
                        className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                      >
                        <span>{w.name}</span>
                        <span className="text-muted-foreground">{w.score}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// Feature indicator component
function FeatureIndicator({ value, label }: { value: boolean | string; label: string }) {
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        {value ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  const isPartial = value === 'partial';
  const isFull = value === 'full' || value === 'active' || value === 'yes';

  return (
    <div className="flex items-center gap-2">
      {isFull ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : isPartial ? (
        <AlertCircle className="h-4 w-4 text-yellow-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">{label}: {value}</span>
    </div>
  );
}

// Software wallet details
function SoftwareWalletDetails({ wallet }: { wallet: SoftwareWallet }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Security & Trust</h3>
        <FeatureIndicator value={wallet.txSimulation} label="Transaction Simulation" />
        <FeatureIndicator value={wallet.scamAlerts} label="Scam Alerts" />
        <FeatureIndicator value={wallet.audits} label="Security Audits" />
        <FeatureIndicator value={wallet.license} label="License" />
        <FeatureIndicator value={wallet.funding} label="Funding" />
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Platform Support</h3>
        <div className="flex flex-wrap gap-2">
          {wallet.devices.mobile && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">
              <Smartphone className="h-3 w-3" /> Mobile
            </span>
          )}
          {wallet.devices.browser && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">
              <Globe className="h-3 w-3" /> Browser
            </span>
          )}
          {wallet.devices.desktop && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">
              <Monitor className="h-3 w-3" /> Desktop
            </span>
          )}
          {wallet.devices.web && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">
              <Link2 className="h-3 w-3" /> Web
            </span>
          )}
        </div>
        <div className="mt-3">
          <span className="text-sm text-muted-foreground">Chains Supported: </span>
          <span className="text-sm font-medium">{wallet.chains}</span>
        </div>
        <FeatureIndicator value={wallet.testnets} label="Testnet Support" />
        <FeatureIndicator value={wallet.hardwareSupport} label="Hardware Wallet Support" />
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Development Activity</h3>
        <FeatureIndicator value={wallet.active} label="GitHub Activity" />
        <div className="text-sm">
          <span className="text-muted-foreground">Releases/Month: </span>
          <span className="font-medium">{wallet.releasesPerMonth ?? 'N/A'}</span>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Account Features</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Account Types: </span>
          <span className="font-medium">{wallet.accountTypes.join(', ')}</span>
        </div>
        <FeatureIndicator value={wallet.ensNaming} label="ENS Support" />
        <FeatureIndicator value={wallet.rpc} label="Custom RPC" />
        <FeatureIndicator value={wallet.core} label="Core Features" />
      </div>
    </div>
  );
}

// Hardware wallet details
function HardwareWalletDetails({ wallet }: { wallet: HardwareWallet }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Security Features</h3>
        <FeatureIndicator value={wallet.airGap} label="Air-Gapped" />
        <FeatureIndicator value={wallet.secureElement} label="Secure Element" />
        {wallet.secureElementType && (
          <div className="text-sm pl-6">
            <span className="text-muted-foreground">Type: </span>
            <span className="font-medium">{wallet.secureElementType}</span>
          </div>
        )}
        <FeatureIndicator value={wallet.openSource} label="Open Source" />
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Hardware Specs</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Display: </span>
          <span className="font-medium">{wallet.display}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Price: </span>
          <span className="font-medium">{wallet.priceText || 'N/A'}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Connectivity: </span>
          <span className="font-medium">{wallet.connectivity.join(', ') || 'N/A'}</span>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Development</h3>
        <FeatureIndicator value={wallet.active} label="GitHub Activity" />
      </div>
    </div>
  );
}

// Crypto card details
function CryptoCardDetails({ wallet }: { wallet: CryptoCard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Card Details</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Card Type: </span>
          <span className="font-medium capitalize">{wallet.cardType}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Provider: </span>
          <span className="font-medium">{wallet.provider}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Region: </span>
          <span className="font-medium">{wallet.region}</span>
        </div>
        <FeatureIndicator value={wallet.businessSupport} label="Business Support" />
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Fees & Rewards</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Cashback: </span>
          <span className="font-medium">{wallet.cashBack}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Annual Fee: </span>
          <span className="font-medium">{wallet.annualFee}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">FX Fee: </span>
          <span className="font-medium">{wallet.fxFee}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Rewards: </span>
          <span className="font-medium">{wallet.rewards}</span>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-medium text-muted-foreground">Status</h3>
        <FeatureIndicator value={wallet.status} label="Availability" />
      </div>
    </div>
  );
}

// Quick stats sidebar
function QuickStats({ wallet, type }: { wallet: SoftwareWallet | HardwareWallet | CryptoCard; type: WalletType }) {
  const rating = scoreToRating(wallet.score);

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Score</dt>
        <dd className="font-medium">{wallet.score}/100</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Rating</dt>
        <dd className="font-medium">{rating.value}/5</dd>
      </div>
      {type === 'software' && (
        <>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Chains</dt>
            <dd className="font-medium">{(wallet as SoftwareWallet).chains}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Releases/mo</dt>
            <dd className="font-medium">{(wallet as SoftwareWallet).releasesPerMonth ?? 'N/A'}</dd>
          </div>
        </>
      )}
      {type === 'hardware' && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Price</dt>
          <dd className="font-medium">{(wallet as HardwareWallet).priceText || 'N/A'}</dd>
        </div>
      )}
      {type === 'card' && (
        <>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Cashback</dt>
            <dd className="font-medium">{(wallet as CryptoCard).cashBack}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Region</dt>
            <dd className="font-medium">{(wallet as CryptoCard).regionCode}</dd>
          </div>
        </>
      )}
    </dl>
  );
}
