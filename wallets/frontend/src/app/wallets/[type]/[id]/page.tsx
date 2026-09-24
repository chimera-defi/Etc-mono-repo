import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Star, Wallet, Cpu, CreditCard, ArrowLeftRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SocialShare } from '@/components/SocialShare';
import { ScoreBreakdownBar } from '@/components/ScoreBreakdownBar';
import { getAllWalletData, getWalletById, getWalletsByType, isWalletType, type WalletType } from '@/lib/wallet-data';
import { generateWalletKeywords, optimizeMetaDescription, generateBreadcrumbSchema, generateWalletProductSchema } from '@/lib/seo';
import type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData } from '@/types/wallets';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const ogImageVersion = 'v5';

const typeLabels: Record<WalletType, string> = {
  software: 'Software Wallet',
  hardware: 'Hardware Wallet',
  cards: 'Crypto Card',
  ramps: 'Crypto Ramp',
  'qr-payments': 'QR Payment Provider',
};

const typeDocs: Record<WalletType, { href: string; label: string }> = {
  software: { href: '/docs/software-wallets', label: 'Software Wallet Comparison' },
  hardware: { href: '/docs/hardware-wallets', label: 'Hardware Wallet Comparison' },
  cards: { href: '/docs/crypto-cards', label: 'Crypto Card Comparison' },
  ramps: { href: '/docs/ramps', label: 'Ramp Provider Comparison' },
  'qr-payments': { href: '/docs/qr-payments', label: 'QR Payment Provider Comparison' },
};

const methodologyDocs: Record<WalletType, string> = {
  software: '/docs/software-wallets-details#-wallet-scores-developer-focused-methodology',
  hardware: '/docs/hardware-wallets-details#-scoring-methodology',
  cards: '/docs/crypto-cards-details#scoring-methodology',
  ramps: '/docs/ramps-details#scoring-methodology',
  'qr-payments': '/docs/qr-payments-details#scoring-methodology',
};

const typeIcons: Record<WalletType, JSX.Element> = {
  software: <Wallet className="h-5 w-5" />,
  hardware: <Cpu className="h-5 w-5" />,
  cards: <CreditCard className="h-5 w-5" />,
  ramps: <ArrowLeftRight className="h-5 w-5" />,
  'qr-payments': <ArrowLeftRight className="h-5 w-5" />,
};

export async function generateStaticParams() {
  const { software, hardware, cards, ramps, qrPayments } = getAllWalletData();

  return [
    ...software.map(wallet => ({ type: 'software', id: wallet.id })),
    ...hardware.map(wallet => ({ type: 'hardware', id: wallet.id })),
    ...cards.map(wallet => ({ type: 'cards', id: wallet.id })),
    ...ramps.map(wallet => ({ type: 'ramps', id: wallet.id })),
    ...qrPayments.map(wallet => ({ type: 'qr-payments', id: wallet.id })),
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
    `Founded: ${ramp.foundedYear ?? 'Unknown'}`,
    `Funding: ${ramp.fundingSource}`,
    `Fee model: ${ramp.feeModel}`,
    `Minimum fee: ${ramp.minFee}`,
    `Developer UX: ${ramp.devUx}`,
  ];
}

/**
 * Convert wallet data to schema-friendly format
 * Refactored to reduce repetition and improve clarity
 */
function getStructuredData(type: WalletType, wallet: WalletData, pageUrl: string) {
  // Extract company/brand name once (first word of wallet name)
  const companyName = wallet.name.split(' ')[0];

  // Prepare base wallet data for schema generation (convert null to undefined once)
  const schemaData = {
    name: wallet.name,
    score: wallet.score,
    url: ('url' in wallet ? wallet.url : null) ?? undefined,
    github: ('github' in wallet ? wallet.github : null) ?? undefined,
    description: getWalletDescription(type, wallet),
    company: companyName,
  };

  // Type-specific data extraction
  if (type === 'software') {
    const software = wallet as SoftwareWallet;
    const platforms: string[] = [];
    if (software.devices.mobile) platforms.push('Mobile');
    if (software.devices.browser) platforms.push('Browser Extension');
    if (software.devices.desktop) platforms.push('Desktop');
    if (software.devices.web) platforms.push('Web');

    const features: string[] = [];
    if (software.txSimulation) features.push('Transaction Simulation');
    if (software.scamAlerts && software.scamAlerts !== 'none') features.push('Scam Detection');
    if (software.hardwareSupport) features.push('Hardware Wallet Support');
    if (software.chains && software.chains.raw) features.push(software.chains.raw);

    return generateWalletProductSchema({
      ...schemaData,
      platforms,
      features,
      releaseFrequency: software.releasesPerMonth ?? undefined,
    }, type, pageUrl);
  }

  if (type === 'hardware') {
    const hardware = wallet as HardwareWallet;
    return generateWalletProductSchema({
      ...schemaData,
      price: hardware.price ?? undefined,
      openSource: hardware.openSource,
      secureElement: hardware.secureElement,
      secureElementType: hardware.secureElementType ?? undefined,
      connectivity: hardware.connectivity,
    }, type, pageUrl);
  }

  if (type === 'cards') {
    const card = wallet as CryptoCard;
    const features: string[] = [];
    if (card.cashBack) features.push(`Up to ${card.cashBack} Cashback`);
    if (card.custody) features.push(`Custody: ${card.custody}`);
    if (card.businessSupport === 'yes') features.push('Business Support Available');

    return generateWalletProductSchema({
      ...schemaData,
      features,
    }, type, pageUrl);
  }

  if (type === 'ramps') {
    const ramp = wallet as Ramp;
    const features: string[] = [];
    if (ramp.rampType) features.push(`${ramp.rampType} Support`);
    if (ramp.coverage) features.push(`Coverage: ${ramp.coverage}`);
    if (ramp.devUx) features.push(`Developer UX: ${ramp.devUx}`);

    return generateWalletProductSchema({
      ...schemaData,
      features,
    }, type, pageUrl);
  }

  // QR Payments - fallback for 'qr-payments' type
  return generateWalletProductSchema({ ...schemaData }, type, pageUrl);
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
  const nearestWallets = getWalletsByType(params.type)
    .filter(item => item.id !== wallet.id)
    .map((item) => ({ item, delta: Math.abs(item.score - wallet.score) }))
    .sort((a, b) => a.delta - b.delta || b.item.score - a.item.score);
  const relatedWallets = (
    nearestWallets.some((entry) => entry.delta < 10)
      ? nearestWallets.filter((entry) => entry.delta < 10)
      : nearestWallets
  ).slice(0, 3);
  const totalBreakdownMax = wallet.scoreBreakdown.reduce((sum, entry) => sum + entry.max, 0) || 1;
  const methodologyHref = methodologyDocs[params.type];

  // Generate breadcrumb schema for better LLM navigation understanding
  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/explore' },
    { label: typeLabels[params.type], href: `/explore?tab=${params.type}` },
    { label: wallet.name, href: `/wallets/${params.type}/${params.id}` },
  ], baseUrl);

  return (
    <div className="container mx-auto px-4 py-8">
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
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

        <div className="flex flex-col gap-3 w-full sm:max-w-xs">
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
          <div className="rounded-xl border border-border p-4 sm:p-6 mb-6">
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

          <div className="rounded-xl border border-border p-4 sm:p-6 mb-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">Score Breakdown</h2>
              <Link href={methodologyHref} className="text-sm text-primary hover:underline">
                View methodology
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              This score is generated from weighted category rows. Higher completion in each category yields higher earned points.
            </p>

            <ScoreBreakdownBar
              breakdown={wallet.scoreBreakdown}
              showLegend
              className="mb-5"
              barClassName="h-3"
            />

            <p className="mb-2 text-xs text-muted-foreground sm:hidden">
              Swipe horizontally to view full breakdown columns.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 px-3 font-medium">Weight</th>
                    <th className="py-2 px-3 font-medium">Earned</th>
                    <th className="py-2 pl-3 font-medium">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.scoreBreakdown.map((entry) => {
                    const completionPct = entry.max > 0 ? Math.round((entry.score / entry.max) * 100) : 0;
                    const weightPct = Math.round((entry.max / totalBreakdownMax) * 100);
                    const completionClass =
                      completionPct >= 80
                        ? 'bg-green-500'
                        : completionPct >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500';

                    return (
                      <tr key={`${entry.key}-${entry.label}`} className="border-b border-border/60 align-top">
                        <td className="py-3 pr-3">
                          <div className="font-medium">{entry.label}</div>
                          {entry.note && (
                            <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                          )}
                        </td>
                        <td className="py-3 px-3">{entry.max} pts ({weightPct}%)</td>
                        <td className="py-3 px-3">{entry.score}/{entry.max}</td>
                        <td className="py-3 pl-3 min-w-[150px] sm:min-w-[180px]">
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${completionClass}`}
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">{completionPct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <details className="mt-5 rounded-lg border border-border/70 bg-muted/20 p-4">
              <summary className="cursor-pointer text-sm font-medium">Score explained</summary>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                {wallet.scoreBreakdown.map((entry) => (
                  <p key={`explain-${entry.key}-${entry.label}`}>
                    <span className="font-medium text-foreground">{entry.label}:</span>{' '}
                    {entry.note || 'Category-specific checks are applied from the methodology.'}{' '}
                    <Link href={methodologyHref} className="text-primary hover:underline">
                      Read scoring details
                    </Link>
                  </p>
                ))}
              </div>
            </details>
          </div>

          <div className="rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Source & References</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All scores come from Wallet Radar&apos;s developer-focused scoring methodology. View the scoring tables, audits, and platform requirements in the comparison docs.
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
          <div className="rounded-xl border border-border p-4 sm:p-6">
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

          <div className="rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-1">Similar Score {typeLabels[params.type]}s</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Closest matches by score distance in this category.
            </p>
            <ul className="space-y-3 text-sm">
              {relatedWallets.map(({ item, delta }) => (
                <li key={item.id} className="flex items-start gap-3">
                  <Star className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <Link
                      href={`/wallets/${params.type}/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Score {item.score}/100 (Δ {delta})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {'github' in wallet && wallet.github && (
            <div className="rounded-xl border border-border p-4 sm:p-6">
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
            <div className="rounded-xl border border-border p-4 sm:p-6">
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
            <div className="rounded-xl border border-border p-4 sm:p-6">
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
