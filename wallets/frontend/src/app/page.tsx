import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Shield, Cpu, BookOpen, Github, Zap, CheckCircle, CreditCard, GitCompare, SlidersHorizontal } from 'lucide-react';
import { getAllDocuments, getWalletStats } from '@/lib/markdown';
import { WalletCard } from '@/components/WalletCard';
import { StatsCard } from '@/components/StatsCard';
import { FeaturedCategoryLinks } from '@/components/InternalLinks';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const siteName = 'Wallet Radar';

export default function HomePage() {
  const documents = getAllDocuments();
  const stats = getWalletStats(documents);
  
  const comparisonDocs = documents.filter(d => d.category === 'comparison');
  const guideDocs = documents.filter(d => d.category === 'guide' || d.category === 'research');

  // FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Wallet Radar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Wallet Radar is a developer-focused platform for comparing crypto wallets. We provide comprehensive scoring, security audits, GitHub activity tracking, and developer experience benchmarks for software and hardware wallets.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes Wallet Radar different from other wallet comparison sites?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Wallet Radar focuses specifically on developer needs, tracking GitHub activity, release frequency, security audits, and developer experience metrics. We compare 24+ software wallets and 23+ hardware wallets with detailed scoring methodology.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best MetaMask alternative for developers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rabby Wallet is our top pick for developers with a score of 92. It offers transaction simulation, scam alerts, support for both desktop and mobile platforms, and active development with approximately 6 releases per month.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best hardware wallet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trezor Safe 5 scores 94 and is our top hardware wallet recommendation. It features fully open source firmware, Secure Element (Optiga), active development, and costs approximately $169.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best value hardware wallet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trezor Safe 3 offers the best value at $79 with a score of 91. It includes Secure Element (Optiga), fully open source firmware, and active development.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often is wallet data updated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Wallet data is regularly refreshed via GitHub API, tracking stars, issues, release frequency, and activity status. Comparison pages are updated weekly, while guides are updated monthly.',
        },
      },
      {
        '@type': 'Question',
        name: 'What security features should I look for in a crypto wallet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Key security features include: transaction simulation, scam detection alerts, open source code, security audits, Secure Element (for hardware wallets), and active maintenance with regular updates.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you compare hardware and software wallets together?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We maintain separate comparison tables for software wallets (24+ EVM-compatible wallets) and hardware wallets (23+ cold storage devices) due to their different use cases and evaluation criteria.',
        },
      },
      {
        '@type': 'Question',
        name: 'What data sources does Wallet Radar use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We use GitHub API for stars, issues, and activity status; WalletBeat for license, device, and security information; Rabby API for chain counts; and Trust Registry for network support data.',
        },
      },
      {
        '@type': 'Question',
        name: 'How are wallet scores calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Scores are calculated using a comprehensive methodology that considers security features, GitHub activity, release frequency, developer experience, platform support, and security audits. Full methodology is included in each comparison document.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are all wallets open source?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, not all wallets are open source. We clearly indicate open source status in our comparisons. Hardware wallets like Trezor Safe 5 and Safe 3 feature fully open source firmware, while some software wallets may have proprietary components.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is transaction simulation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Transaction simulation allows you to preview what will happen before signing a transaction, helping prevent mistakes and scams. This is a key security feature found in wallets like Rabby.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I use a hardware or software wallet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Software wallets are better for daily development and frequent transactions. Hardware wallets are essential for long-term storage and large amounts of crypto. Many developers use both: a software wallet for daily use and a hardware wallet for secure storage.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I know if a wallet is actively maintained?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We track GitHub activity, release frequency, and issue resolution times. Active wallets typically have regular releases (monthly or more frequent), responsive issue handling, and recent commits. Our comparisons include activity status indicators.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I contribute to Wallet Radar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Wallet Radar is open source. You can contribute via our GitHub repository at github.com/chimera-defi/Etc-mono-repo/tree/main/wallets. We welcome improvements to data accuracy, new wallet additions, and feature suggestions.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best crypto credit card for personal use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bybit Card scores 88 and offers up to 10% cashback with multi-crypto rewards, no annual fee, and is available in EEA/CH regions. For US users, Coinbase Card (82) and Fold Card (76) are top options.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best crypto credit card for business use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Reap is our top business card recommendation. It offers corporate Visa cards with stablecoin repayment options, advanced spend controls, and is available in 200+ countries globally.',
        },
      },
    ],
  };

  // ItemList schema for Top Picks (editorial selection; no user ratings)
  const topPicksSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Developer Picks - Wallet Radar',
    description: 'Curated selection of the best crypto wallets for developers based on comprehensive scoring',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'SoftwareApplication',
          name: 'Rabby Wallet',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web, Desktop, Mobile',
          url: `${baseUrl}/docs/wallet-comparison-unified-table/`,
          description:
            'Score: 92 — Transaction simulation, both platforms, active development. Best for Development with approximately 6 releases per month.',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Product',
          name: 'Trezor Safe 5',
          category: 'Hardware Wallet',
          brand: {
            '@type': 'Brand',
            name: 'Trezor',
          },
          url: `${baseUrl}/docs/hardware-wallet-comparison-table/`,
          description:
            'Score: 94 — Fully open source, Secure Element, active development. Best Hardware Wallet at approximately $169.',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Product',
          name: 'Trezor Safe 3',
          category: 'Hardware Wallet',
          brand: {
            '@type': 'Brand',
            name: 'Trezor',
          },
          url: `${baseUrl}/docs/hardware-wallet-comparison-table/`,
          description:
            'Score: 91 — $79, Secure Element, fully open source firmware. Best Value hardware wallet with active development.',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Product',
          name: 'Bybit Card',
          category: 'Crypto Credit Card',
          brand: {
            '@type': 'Brand',
            name: 'Bybit',
          },
          url: `${baseUrl}/docs/crypto-credit-card-comparison-table/`,
          description:
            'Score: 88 — Up to 10% cashback, multi-crypto rewards, no annual fee. Best Personal crypto card for EEA/CH users.',
        },
      },
      {
        '@type': 'ListItem',
        position: 5,
        item: {
          '@type': 'Product',
          name: 'Reap',
          category: 'Crypto Credit Card',
          brand: {
            '@type': 'Brand',
            name: 'Reap',
          },
          url: `${baseUrl}/docs/crypto-credit-card-comparison-table/`,
          description:
            'Score: 55 — Corporate Visa cards with stablecoin repayment, available in 200+ countries. Best Business crypto card for corporate use.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="top-picks-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(topPicksSchema) }}
      />
      <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Developer-Focused{' '}
              <span className="text-primary">Crypto Wallet</span>{' '}
              Comparison
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find stable MetaMask alternatives with comprehensive scoring, security audits, 
              GitHub activity tracking, and developer experience benchmarks.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/docs/wallet-comparison-unified-table"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Software Wallets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/hardware-wallet-comparison-table"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Hardware Wallets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/crypto-credit-card-comparison-table"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Crypto Cards
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Explore CTA */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <GitCompare className="h-4 w-4" />
                Compare wallets side-by-side with advanced filters
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Software Wallets"
            value="24+"
            description="EVM-compatible wallets compared"
            icon={<Shield className="h-5 w-5" />}
          />
          <StatsCard
            label="Hardware Wallets"
            value="23+"
            description="Cold storage devices reviewed"
            icon={<Cpu className="h-5 w-5" />}
          />
          <StatsCard
            label="Crypto Cards"
            value="27+"
            description="Credit & debit cards compared"
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatsCard
            label="Last Updated"
            value={stats.lastUpdated.split(',')[0] || 'Dec 2025'}
            description="Regular data refreshes via GitHub API"
            icon={<Github className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Top Picks Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Top Developer Picks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Software Wallet Pick */}
          <div className="p-6 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Best for Development</span>
            </div>
            <h3 className="font-bold text-xl mb-2">Rabby Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Score: 92 — Transaction simulation, both platforms, active development
            </p>
            <div className="text-xs text-muted-foreground">
              ✅ Tx Simulation • ✅ Scam Alerts • ~6 releases/month
            </div>
          </div>

          {/* Hardware Wallet Pick */}
          <div className="p-6 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Best Hardware Wallet</span>
            </div>
            <h3 className="font-bold text-xl mb-2">Trezor Safe 5</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Score: 94 — Fully open source, Secure Element, active development
            </p>
            <div className="text-xs text-muted-foreground">
              ✅ Open Source • ✅ Optiga SE • ~$169
            </div>
          </div>

          {/* Best Value Pick */}
          <div className="p-6 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Best Value</span>
            </div>
            <h3 className="font-bold text-xl mb-2">Trezor Safe 3</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Score: 91 — $79, Secure Element, fully open source firmware
            </p>
            <div className="text-xs text-muted-foreground">
              ✅ Budget-Friendly • ✅ Optiga SE • ✅ Active
            </div>
          </div>

          {/* Best Personal Crypto Card Pick */}
          <div className="p-6 rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Best Personal Card</span>
            </div>
            <h3 className="font-bold text-xl mb-2">Bybit Card</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Score: 88 — Up to 10% cashback, multi-crypto rewards, no annual fee
            </p>
            <div className="text-xs text-muted-foreground">
              ✅ High Cashback • ✅ EEA/CH • ✅ Business Available
            </div>
          </div>

          {/* Best Business Crypto Card Pick */}
          <div className="p-6 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">Best Business Card</span>
            </div>
            <h3 className="font-bold text-xl mb-2">Reap</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Score: 55 — Corporate Visa cards with stablecoin repayment, 200+ countries
            </p>
            <div className="text-xs text-muted-foreground">
              ✅ Business-Focused • ✅ Stablecoins • ✅ Global
            </div>
          </div>
        </div>
      </section>

      {/* Explore & Compare Feature */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Advanced Wallet Explorer</h2>
          <p className="text-muted-foreground mb-8">
            Filter, sort, and compare wallets side-by-side with our interactive comparison tool.
            Find the perfect wallet based on your specific needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg border border-border">
              <SlidersHorizontal className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Advanced Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter by platforms, features, license, funding, and more
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border">
              <GitCompare className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Side-by-Side Compare</h3>
              <p className="text-sm text-muted-foreground">
                Compare up to 4 wallets with detailed feature breakdown
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border">
              <Zap className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Live Chain Data</h3>
              <p className="text-sm text-muted-foreground">
                Real-time TVL data from DeFiLlama for chain coverage
              </p>
            </div>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <GitCompare className="h-5 w-5" />
            Explore & Compare Wallets
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Main Comparisons */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Wallet Comparisons</h2>
          <span className="text-sm text-muted-foreground">Full scoring methodology included</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonDocs.map((doc) => (
            <WalletCard key={doc.slug} document={doc} />
          ))}
        </div>
      </section>

      {/* Research & Guides */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Resources & Guides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideDocs.map((doc) => (
            <WalletCard key={doc.slug} document={doc} />
          ))}
        </div>
      </section>

      {/* Browse by Feature - Internal Links for SEO */}
      <FeaturedCategoryLinks />

      {/* Data Sources */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <Github className="h-6 w-6 mb-2" />
            <h3 className="font-semibold">GitHub API</h3>
            <p className="text-sm text-muted-foreground">Stars, issues, activity status</p>
          </a>
          <a
            href="https://walletbeat.fyi"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <BookOpen className="h-6 w-6 mb-2" />
            <h3 className="font-semibold">WalletBeat</h3>
            <p className="text-sm text-muted-foreground">License, devices, security</p>
          </a>
          <a
            href="https://api.rabby.io/v1/chain/list"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <Shield className="h-6 w-6 mb-2" />
            <h3 className="font-semibold">Rabby API</h3>
            <p className="text-sm text-muted-foreground">Chain counts</p>
          </a>
          <a
            href="https://github.com/trustwallet/wallet-core"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <Cpu className="h-6 w-6 mb-2" />
            <h3 className="font-semibold">Trust Registry</h3>
            <p className="text-sm text-muted-foreground">Network support</p>
          </a>
        </div>
      </section>
      </div>
    </>
  );
}
