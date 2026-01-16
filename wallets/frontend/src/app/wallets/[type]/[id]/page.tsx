import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Star, Wallet, Cpu, CreditCard, ArrowLeftRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SocialShare } from '@/components/SocialShare';
import { getAllWalletData, getWalletById, getWalletsByType, isWalletType, type WalletType } from '@/lib/wallet-data';
import { generateWalletKeywords, optimizeMetaDescription } from '@/lib/seo';
import type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData } from '@/types/wallets';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const ogImageVersion = 'v5';

const typeLabels: Record<WalletType, string> = {
  software: 'Software Wallet',
  hardware: 'Hardware Wallet',
  cards: 'Crypto Card',
  ramps: 'Crypto Ramp',
};

const typeDocs: Record<WalletType, { href: string; label: string }> = {
  software: { href: '/docs/software-wallets', label: 'Software Wallet Comparison' },
  hardware: { href: '/docs/hardware-wallets', label: 'Hardware Wallet Comparison' },
  cards: { href: '/docs/crypto-cards', label: 'Crypto Card Comparison' },
  ramps: { href: '/docs/ramps', label: 'Ramp Provider Comparison' },
};

const typeIcons: Record<WalletType, JSX.Element> = {
  software: <Wallet className="h-5 w-5" />,
  hardware: <Cpu className="h-5 w-5" />,
  cards: <CreditCard className="h-5 w-5" />,
  ramps: <ArrowLeftRight className="h-5 w-5" />,
};

export async function generateStaticParams() {
  const { software, hardware, cards, ramps } = getAllWalletData();

  return [
    ...software.map(wallet => ({ type: 'software', id: wallet.id })),
    ...hardware.map(wallet => ({ type: 'hardware', id: wallet.id })),
    ...cards.map(wallet => ({ type: 'cards', id: wallet.id })),
    ...ramps.map(wallet => ({ type: 'ramps', id: wallet.id })),
  ];
}

function getWalletDescription(type: WalletType, wallet: WalletData): string {
  if (type === 'software') {
    const software = wallet as SoftwareWallet;
    return `${software.name} scores ${software.score}/100 for developer-focused crypto wallet usability. ${software.bestFor || 'Compare features, platform coverage, and security.'}`;
  }
  if (type === 'hardware') {
    const hardware = wallet as HardwareWallet;
    return `${hardware.name} scores ${hardware.score}/100 with ${hardware.openSource} firmware transparency and ${hardware.secureElement ? 'secure element support' : 'no secure element'}. Price: ${hardware.priceText}.`;
  }
  if (type === 'cards') {
    const card = wallet as CryptoCard;
    return `${card.name} scores ${card.score}/100 with up to ${card.cashBack} cashback. ${card.bestFor || 'See coverage, custody model, and business support.'}`;
  }
  const ramp = wallet as Ramp;
  return `${ramp.name} scores ${ramp.score}/100 for ${ramp.rampType} coverage. ${ramp.bestFor || 'Review fees, coverage, and developer UX.'}`;
}

function getWalletMetaTitle(type: WalletType, wallet: WalletData): string {
  return `${wallet.name} | ${typeLabels[type]} | Wallet Radar`;
}

function getWalletHighlights(type: WalletType, wallet: WalletData): string[] {
  if (type === 'software') {
    const software = wallet as SoftwareWallet;
    return [
      `Score: ${software.score}/100`,
      software.bestFor ? `Best for: ${software.bestFor}` : 'Best for: Developer-focused wallet workflows',
      software.txSimulation ? 'Transaction simulation support' : 'No transaction simulation',
      software.scamAlerts !== 'none' ? 'Scam alert coverage' : 'No scam alerts',
      software.hardwareSupport ? 'Hardware wallet integration' : 'No hardware wallet support',
    ];
  }
  if (type === 'hardware') {
    const hardware = wallet as HardwareWallet;
    return [
      `Score: ${hardware.score}/100`,
      `Price: ${hardware.priceText}`,
      hardware.secureElement ? `Secure element: ${hardware.secureElementType || 'Yes'}` : 'Secure element: No',
      `Open source: ${hardware.openSource === 'full' ? 'Full' : hardware.openSource === 'partial' ? 'Partial' : 'Closed'}`,
      hardware.connectivity.length ? `Connectivity: ${hardware.connectivity.join(', ')}` : 'Connectivity details available in comparison table',
    ];
  }
  if (type === 'cards') {
    const card = wallet as CryptoCard;
    return [
      `Score: ${card.score}/100`,
      `Cashback: ${card.cashBack}`,
      `Card type: ${card.cardType}`,
      `Custody: ${card.custody}`,
      `Region: ${card.region}`,
      card.businessSupport === 'yes' ? 'Business support available' : 'Business support varies',
    ];
  }
  const ramp = wallet as Ramp;
  return [
    `Score: ${ramp.score}/100`,
    `Ramp type: ${ramp.rampType}`,
    `Coverage: ${ramp.coverage}`,
    `Fee model: ${ramp.feeModel}`,
    `Minimum fee: ${ramp.minFee}`,
    `Developer UX: ${ramp.devUx}`,
  ];
}

function getStructuredData(type: WalletType, wallet: WalletData, pageUrl: string) {
  const base = {
    '@context': 'https://schema.org',
    name: wallet.name,
    url: pageUrl,
  };

  if (type === 'software') {
    const software = wallet as SoftwareWallet;
    return {
      ...base,
      '@type': 'SoftwareApplication',
      applicationCategory: 'FinanceApplication',
      operatingSystem: [
        software.devices.mobile ? 'Mobile' : null,
        software.devices.browser ? 'Browser Extension' : null,
        software.devices.desktop ? 'Desktop' : null,
        software.devices.web ? 'Web' : null,
      ].filter(Boolean),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: software.score,
        bestRating: 100,
        worstRating: 0,
        ratingCount: 1,
      },
      description: getWalletDescription(type, software),
    };
  }

  if (type === 'hardware') {
    const hardware = wallet as HardwareWallet;
    return {
      ...base,
      '@type': 'Product',
      brand: {
        '@type': 'Brand',
        name: hardware.name.split(' ')[0],
      },
      offers: {
        '@type': 'Offer',
        price: hardware.price ?? undefined,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: hardware.score,
        bestRating: 100,
        worstRating: 0,
        ratingCount: 1,
      },
      description: getWalletDescription(type, hardware),
    };
  }

  if (type === 'cards') {
    const card = wallet as CryptoCard;
    return {
      ...base,
      '@type': 'Product',
      category: 'Crypto Card',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: card.score,
        bestRating: 100,
        worstRating: 0,
        ratingCount: 1,
      },
      description: getWalletDescription(type, card),
    };
  }

  const ramp = wallet as Ramp;
  return {
    ...base,
    '@type': 'Service',
    serviceType: 'Crypto On/Off Ramp',
    areaServed: ramp.coverage,
    description: getWalletDescription(type, ramp),
  };
}

export async function generateMetadata({ params }: { params: { type: WalletType; id: string } }): Promise<Metadata> {
  if (!isWalletType(params.type)) {
    return {
      title: 'Wallet Not Found | Wallet Radar',
      description: 'The wallet profile you requested could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const wallet = getWalletById(params.type, params.id);
  if (!wallet) {
    return {
      title: 'Wallet Not Found | Wallet Radar',
      description: 'The wallet profile you requested could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = `${baseUrl}/wallets/${params.type}/${params.id}/`;
  const description = optimizeMetaDescription(getWalletDescription(params.type, wallet));
  const title = getWalletMetaTitle(params.type, wallet);
  const ogImageUrl = `${baseUrl}/og-image.svg?${ogImageVersion}`;

  return {
    title,
    description,
    keywords: generateWalletKeywords(wallet.name, params.type),
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${wallet.name} overview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
}

export default function WalletDetailPage({ params }: { params: { type: WalletType; id: string } }) {
  if (!isWalletType(params.type)) {
    notFound();
  }

  const wallet = getWalletById(params.type, params.id);

  if (!wallet) {
    notFound();
  }

  const pageUrl = `${baseUrl}/wallets/${params.type}/${params.id}/`;
  const description = optimizeMetaDescription(getWalletDescription(params.type, wallet));
  const highlights = getWalletHighlights(params.type, wallet);
  const relatedWallets = getWalletsByType(params.type)
    .filter(item => item.id !== wallet.id)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-8">
      <Script
        id="wallet-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData(params.type, wallet, pageUrl)),
        }}
      />

      <Breadcrumbs
        items={[
          { label: 'Explore', href: '/explore' },
          { label: typeLabels[params.type], href: `/explore?tab=${params.type}` },
          { label: wallet.name, href: `/wallets/${params.type}/${params.id}` },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mt-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-2">
              {typeIcons[params.type]}
              {typeLabels[params.type]}
            </span>
            <span aria-hidden="true">•</span>
            <span>Score {wallet.score}/100</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{wallet.name}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <SocialShare url={pageUrl} title={wallet.name} description={description} size="large" />
          <Link
            href={`/explore?tab=${params.type}&search=${encodeURIComponent(wallet.name)}`}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explorer
          </Link>
          <Link
            href={typeDocs[params.type].href}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Comparison Table
          </Link>
        </div>
      </div>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <div className="rounded-xl border border-border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Highlights</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {highlights.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Source & References</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All scores come from Wallet Radar&apos;s developer-focused scoring methodology. View the full scoring breakdown, audits, and platform requirements in the comparison tables.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={typeDocs[params.type].href}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                {typeDocs[params.type].label}
              </Link>
              <Link href="/docs/data-sources" className="inline-flex items-center gap-2 text-primary hover:underline">
                Data Sources & Verification
              </Link>
              <Link href="/docs/about" className="inline-flex items-center gap-2 text-primary hover:underline">
                About Wallet Radar
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-foreground">
                  Explore all wallets
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation hub
                </Link>
              </li>
              {params.type === 'hardware' && (
                <li>
                  <Link href="/companies" className="text-muted-foreground hover:text-foreground">
                    Hardware wallet companies
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-3">Related {typeLabels[params.type]}s</h2>
            <ul className="space-y-3 text-sm">
              {relatedWallets.map(item => (
                <li key={item.id} className="flex items-start gap-3">
                  <Star className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <Link
                      href={`/wallets/${params.type}/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Score {item.score}/100</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {'github' in wallet && wallet.github && (
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">Developer Links</h2>
              <a
                href={wallet.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                GitHub Repository
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {'url' in wallet && wallet.url && (
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">Official Website</h2>
              <a
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Visit {wallet.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {'providerUrl' in wallet && wallet.providerUrl && (
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-3">Apply or Learn More</h2>
              <a
                href={wallet.providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Visit {wallet.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
