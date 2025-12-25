import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Cpu,
  CreditCard,
  CheckCircle,
  Smartphone,
  Globe,
  Monitor,
  Lock,
  Zap,
  Eye,
  AlertTriangle,
  Wifi,
  Fingerprint,
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
  RECOMMENDATION_CONFIG,
  getAbsoluteUrl,
  getOgImageUrl,
  getCanonicalUrl,
} from '@/lib/seo-config';
import { Breadcrumbs } from '@/components/Breadcrumbs';

// Category configuration with SEO data
const CATEGORIES = {
  // Software wallet features
  'tx-simulation': {
    title: 'Wallets with Transaction Simulation',
    shortTitle: 'Transaction Simulation',
    description: 'Compare crypto wallets with built-in transaction simulation. Preview what will happen before signing, protect against mistakes and scams.',
    keywords: ['transaction simulation wallet', 'tx preview', 'safe crypto wallet', 'transaction preview'],
    icon: Eye,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.txSimulation),
  },
  'scam-protection': {
    title: 'Wallets with Scam Protection',
    shortTitle: 'Scam Protection',
    description: 'Find crypto wallets with built-in scam detection and protection. Stay safe from malicious contracts and phishing attacks.',
    keywords: ['scam protection wallet', 'anti-phishing wallet', 'safe crypto wallet', 'scam alerts'],
    icon: AlertTriangle,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.scamAlerts !== 'none'),
  },
  'open-source': {
    title: 'Open Source Crypto Wallets',
    shortTitle: 'Open Source',
    description: 'Compare fully open source crypto wallets with transparent, auditable code. Trust through transparency.',
    keywords: ['open source wallet', 'transparent wallet', 'auditable wallet', 'FOSS wallet'],
    icon: Lock,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.license === 'open'),
  },
  'hardware-support': {
    title: 'Software Wallets with Hardware Support',
    shortTitle: 'Hardware Support',
    description: 'Find software wallets that integrate with hardware wallets like Trezor and Ledger for enhanced security.',
    keywords: ['hardware wallet support', 'Trezor compatible', 'Ledger compatible', 'hardware integration'],
    icon: Cpu,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.hardwareSupport),
  },
  'mobile-wallets': {
    title: 'Mobile Crypto Wallets',
    shortTitle: 'Mobile Wallets',
    description: 'Compare the best mobile crypto wallets for iOS and Android. Manage your crypto on the go.',
    keywords: ['mobile wallet', 'iOS wallet', 'Android wallet', 'mobile crypto app'],
    icon: Smartphone,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.devices.mobile),
  },
  'browser-extension': {
    title: 'Browser Extension Wallets',
    shortTitle: 'Browser Extensions',
    description: 'Find the best browser extension wallets for Chrome, Firefox, and more. Access dApps directly from your browser.',
    keywords: ['browser extension wallet', 'Chrome wallet', 'MetaMask alternative', 'web3 wallet'],
    icon: Globe,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.devices.browser),
  },
  'desktop-wallets': {
    title: 'Desktop Crypto Wallets',
    shortTitle: 'Desktop Wallets',
    description: 'Compare native desktop crypto wallets for Windows, Mac, and Linux. Full-featured applications for serious users.',
    keywords: ['desktop wallet', 'Windows wallet', 'Mac wallet', 'Linux wallet'],
    icon: Monitor,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.devices.desktop),
  },
  'multi-chain': {
    title: 'Multi-Chain Wallets',
    shortTitle: 'Multi-Chain',
    description: 'Find wallets that support 50+ blockchain networks. One wallet for all your crypto across multiple chains.',
    keywords: ['multi-chain wallet', 'cross-chain wallet', 'multi network wallet', 'universal wallet'],
    icon: Zap,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) =>
      wallets.filter((w) => typeof w.chains === 'number' && w.chains >= 50),
  },
  'active-development': {
    title: 'Actively Developed Wallets',
    shortTitle: 'Active Development',
    description: 'Find wallets with active GitHub development. Regular updates, bug fixes, and new features.',
    keywords: ['actively maintained wallet', 'updated wallet', 'well maintained crypto wallet'],
    icon: Zap,
    type: 'software' as const,
    filter: (wallets: SoftwareWallet[]) => wallets.filter((w) => w.active === 'active'),
  },
  // Hardware wallet features
  'air-gapped': {
    title: 'Air-Gapped Hardware Wallets',
    shortTitle: 'Air-Gapped',
    description: 'Compare air-gapped hardware wallets for maximum security. Never connect to the internet, use QR codes for signing.',
    keywords: ['air gapped wallet', 'offline wallet', 'QR code wallet', 'cold storage'],
    icon: Wifi,
    type: 'hardware' as const,
    filter: (wallets: HardwareWallet[]) => wallets.filter((w) => w.airGap),
  },
  'secure-element': {
    title: 'Hardware Wallets with Secure Element',
    shortTitle: 'Secure Element',
    description: 'Find hardware wallets with dedicated secure elements for key protection. Bank-grade security for your crypto.',
    keywords: ['secure element wallet', 'SE chip wallet', 'secure enclave', 'hardware security'],
    icon: Fingerprint,
    type: 'hardware' as const,
    filter: (wallets: HardwareWallet[]) => wallets.filter((w) => w.secureElement),
  },
  'open-source-hardware': {
    title: 'Open Source Hardware Wallets',
    shortTitle: 'Open Source Hardware',
    description: 'Compare hardware wallets with fully open source firmware. Verify the code that protects your crypto.',
    keywords: ['open source hardware wallet', 'open firmware', 'transparent hardware', 'auditable hardware'],
    icon: Lock,
    type: 'hardware' as const,
    filter: (wallets: HardwareWallet[]) => wallets.filter((w) => w.openSource === 'full'),
  },
  'budget-hardware': {
    title: 'Budget Hardware Wallets Under $100',
    shortTitle: 'Budget Hardware',
    description: 'Find affordable hardware wallets under $100. Secure cold storage without breaking the bank.',
    keywords: ['cheap hardware wallet', 'affordable hardware wallet', 'budget crypto wallet', 'under 100 hardware wallet'],
    icon: CreditCard,
    type: 'hardware' as const,
    filter: (wallets: HardwareWallet[]) =>
      wallets.filter((w) => w.price !== null && w.price < 100),
  },
  // Crypto card categories
  'high-cashback': {
    title: 'High Cashback Crypto Cards',
    shortTitle: 'High Cashback',
    description: 'Find crypto cards with the highest cashback rewards. Earn up to 10% back on your purchases.',
    keywords: ['high cashback crypto card', 'best rewards crypto card', 'crypto cashback'],
    icon: CreditCard,
    type: 'card' as const,
    filter: (cards: CryptoCard[]) =>
      cards.filter((c) => c.cashBackMax !== null && c.cashBackMax >= 3),
  },
  'no-annual-fee': {
    title: 'No Annual Fee Crypto Cards',
    shortTitle: 'No Annual Fee',
    description: 'Compare crypto cards with no annual fee. Keep more of your rewards without yearly charges.',
    keywords: ['no fee crypto card', 'free crypto card', 'no annual fee'],
    icon: CreditCard,
    type: 'card' as const,
    filter: (cards: CryptoCard[]) =>
      cards.filter((c) => c.annualFee === '$0' || c.annualFee.toLowerCase().includes('free')),
  },
  'us-crypto-cards': {
    title: 'US Crypto Cards',
    shortTitle: 'US Cards',
    description: 'Find the best crypto cards available in the United States. Spend your crypto with US-friendly providers.',
    keywords: ['US crypto card', 'American crypto card', 'crypto card USA'],
    icon: CreditCard,
    type: 'card' as const,
    filter: (cards: CryptoCard[]) =>
      cards.filter((c) => c.regionCode === 'US' || c.regionCode === 'Global'),
  },
  'eu-crypto-cards': {
    title: 'EU Crypto Cards',
    shortTitle: 'EU Cards',
    description: 'Compare crypto cards available in the European Union. Euro-friendly crypto spending options.',
    keywords: ['EU crypto card', 'European crypto card', 'Euro crypto card'],
    icon: CreditCard,
    type: 'card' as const,
    filter: (cards: CryptoCard[]) =>
      cards.filter((c) => c.regionCode === 'EU' || c.regionCode === 'Global'),
  },
  'business-crypto-cards': {
    title: 'Business Crypto Cards',
    shortTitle: 'Business Cards',
    description: 'Find crypto cards designed for business use. Corporate spending, expense management, and team cards.',
    keywords: ['business crypto card', 'corporate crypto card', 'company crypto card'],
    icon: CreditCard,
    type: 'card' as const,
    filter: (cards: CryptoCard[]) => cards.filter((c) => c.businessSupport === 'yes'),
  },
} as const;

type CategorySlug = keyof typeof CATEGORIES;

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all categories
export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = CATEGORIES[params.slug as CategorySlug];

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title = `${category.title} | ${SITE_CONFIG.name}`;
  const pageUrl = getCanonicalUrl(`/category/${params.slug}`);
  const ogImage = getOgImageUrl('/og-image.png');

  return {
    title,
    description: category.description,
    keywords: [...category.keywords],
    openGraph: {
      title,
      description: category.description,
      url: pageUrl,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: category.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: category.description,
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

export default function CategoryPage({ params }: PageProps) {
  const category = CATEGORIES[params.slug as CategorySlug];

  if (!category) {
    notFound();
  }

  // Get and filter wallets based on category type
  let wallets: (SoftwareWallet | HardwareWallet | CryptoCard)[] = [];
  let otherCategories: { slug: string; title: string }[] = [];

  if (category.type === 'software') {
    const allWallets = parseSoftwareWallets();
    wallets = (category.filter as (w: SoftwareWallet[]) => SoftwareWallet[])(allWallets);
    otherCategories = Object.entries(CATEGORIES)
      .filter(([slug, cat]) => cat.type === 'software' && slug !== params.slug)
      .map(([slug, cat]) => ({ slug, title: cat.shortTitle }));
  } else if (category.type === 'hardware') {
    const allWallets = parseHardwareWallets();
    wallets = (category.filter as (w: HardwareWallet[]) => HardwareWallet[])(allWallets);
    otherCategories = Object.entries(CATEGORIES)
      .filter(([slug, cat]) => cat.type === 'hardware' && slug !== params.slug)
      .map(([slug, cat]) => ({ slug, title: cat.shortTitle }));
  } else {
    const allCards = parseCryptoCards();
    wallets = (category.filter as (c: CryptoCard[]) => CryptoCard[])(allCards);
    otherCategories = Object.entries(CATEGORIES)
      .filter(([slug, cat]) => cat.type === 'card' && slug !== params.slug)
      .map(([slug, cat]) => ({ slug, title: cat.shortTitle }));
  }

  // Sort by score
  wallets.sort((a, b) => b.score - a.score);

  const pageUrl = getAbsoluteUrl(`/category/${params.slug}`);
  const Icon = category.icon;

  // ItemList schema for SEO
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category.title,
    description: category.description,
    numberOfItems: wallets.length,
    itemListElement: wallets.slice(0, 10).map((wallet, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': category.type === 'software' ? 'SoftwareApplication' : 'Product',
        name: wallet.name,
        description: `Score: ${wallet.score}/100`,
        url: getAbsoluteUrl(`/wallet/${category.type}/${wallet.id}`),
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getAbsoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: getAbsoluteUrl('/explore') },
      { '@type': 'ListItem', position: 3, name: category.shortTitle, item: pageUrl },
    ],
  };

  return (
    <>
      <Script
        id="itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Explore', href: '/explore' },
            { label: category.shortTitle, href: `/category/${params.slug}` },
          ]}
        />

        {/* Header */}
        <header className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.title}</h1>
              <p className="text-muted-foreground">
                {wallets.length} {category.type === 'card' ? 'cards' : 'wallets'} found
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">{category.description}</p>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* Wallet List */}
          <section>
            <div className="grid gap-4">
              {wallets.map((wallet) => (
                <WalletListItem
                  key={wallet.id}
                  wallet={wallet}
                  type={category.type}
                />
              ))}
            </div>

            {wallets.length === 0 && (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                No wallets found matching this criteria.
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 p-6 rounded-lg border border-border bg-muted/50 text-center">
              <h2 className="text-xl font-semibold mb-2">Need More Filters?</h2>
              <p className="text-muted-foreground mb-4">
                Use our advanced explorer to filter by multiple criteria and compare side-by-side.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Explore All Wallets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Related Categories */}
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-3">Related Categories</h3>
                <ul className="space-y-2">
                  {otherCategories.slice(0, 6).map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {cat.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/docs/wallet-comparison-unified-table"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Software Wallet Table
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/hardware-wallet-comparison-table"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Hardware Wallet Table
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/crypto-credit-card-comparison-table"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Crypto Cards Table
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/explore"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Advanced Explorer
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// Wallet list item component
function WalletListItem({
  wallet,
  type,
}: {
  wallet: SoftwareWallet | HardwareWallet | CryptoCard;
  type: 'software' | 'hardware' | 'card';
}) {
  const recConfig = RECOMMENDATION_CONFIG[wallet.recommendation as keyof typeof RECOMMENDATION_CONFIG];
  const TypeIcon = type === 'software' ? Shield : type === 'hardware' ? Cpu : CreditCard;

  return (
    <Link
      href={`/wallet/${type}/${wallet.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
    >
      <div className={`p-2 rounded-lg ${recConfig?.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : recConfig?.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' : recConfig?.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-900/30'}`}>
        <TypeIcon className={`h-5 w-5 ${recConfig?.color === 'green' ? 'text-green-600' : recConfig?.color === 'yellow' ? 'text-yellow-600' : recConfig?.color === 'red' ? 'text-red-600' : 'text-gray-600'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{wallet.name}</h3>
          {recConfig && (
            <span className="text-xs">{recConfig.emoji}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {getWalletSummary(wallet, type)}
        </p>
      </div>

      <div className="text-right">
        <div className="font-bold">{wallet.score}</div>
        <div className="text-xs text-muted-foreground">/100</div>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function getWalletSummary(wallet: SoftwareWallet | HardwareWallet | CryptoCard, type: 'software' | 'hardware' | 'card'): string {
  if (type === 'software') {
    const sw = wallet as SoftwareWallet;
    const features = [];
    if (sw.txSimulation) features.push('Tx Simulation');
    if (sw.scamAlerts !== 'none') features.push('Scam Alerts');
    if (sw.devices.mobile && sw.devices.browser) features.push('Mobile + Browser');
    return features.join(' • ') || sw.bestFor || 'Software Wallet';
  }

  if (type === 'hardware') {
    const hw = wallet as HardwareWallet;
    const features = [];
    if (hw.airGap) features.push('Air-Gapped');
    if (hw.secureElement) features.push('Secure Element');
    if (hw.openSource === 'full') features.push('Open Source');
    if (hw.price) features.push(`$${hw.price}`);
    return features.join(' • ') || 'Hardware Wallet';
  }

  const card = wallet as CryptoCard;
  return `${card.cashBack} cashback • ${card.region}`;
}
