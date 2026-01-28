import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Shield, Cpu, BookOpen, Github, GitCompare, ArrowLeftRight, FileText, CreditCard } from 'lucide-react';
import { getAllDocuments, getWalletStats } from '@/lib/markdown';
import { getAllArticles } from '@/lib/articles';
import { WalletCard } from '@/components/WalletCard';
import { StatsCard } from '@/components/StatsCard';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
const siteName = 'Wallet Radar';

export default function HomePage() {
  const documents = getAllDocuments();
  const stats = getWalletStats(documents);
  const articles = getAllArticles().slice(0, 3); // Get first 3 articles for featured section

  const guideDocs = documents.filter(d => d.category === 'guide' || d.category === 'research');
  const resourceDocs = guideDocs.slice(0, 3);

  const glassCard = 'glass-panel';
  const glassCardHover = 'glass-panel glass-panel-hover';

  const topPicks = [
    {
      title: 'Rabby Wallet',
      category: 'Software',
      href: '/wallets/software/rabby-wallet',
      bullets: ['Tx simulation', 'Open source', '~6 releases/month'],
      icon: GitCompare,
      pillClass: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
    },
    {
      title: 'Trezor Safe 5',
      category: 'Hardware',
      href: '/wallets/hardware/trezor-safe-5',
      bullets: ['Secure element', 'Fully open source', 'Active releases'],
      icon: Shield,
      pillClass: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    },
    {
      title: 'Transak',
      category: 'Ramps',
      href: '/wallets/ramps/transak',
      bullets: ['React SDK', '160+ countries', 'On + off ramp'],
      icon: ArrowLeftRight,
      pillClass: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    },
  ];

  const previewRows = [
    { name: 'Rabby Wallet', score: '92', platforms: 'Desktop, Mobile, Extension' },
    { name: 'Trezor Safe 5', score: '92', platforms: 'Desktop, Mobile' },
    { name: 'Transak', score: '92', platforms: 'Web SDK, API' },
  ];

  const sourceTiles = [
    {
      title: 'GitHub API',
      description: 'Stars, issues, activity status',
      href: 'https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets?utm_source=walletradar&utm_medium=comparison',
      icon: Github,
    },
    {
      title: 'WalletBeat',
      description: 'License, devices, security',
      href: 'https://walletbeat.fyi?utm_source=walletradar&utm_medium=comparison',
      icon: BookOpen,
    },
    {
      title: 'Rabby API',
      description: 'Chain counts',
      href: 'https://api.rabby.io/v1/chain/list',
      icon: Shield,
    },
    {
      title: 'Trust Registry',
      description: 'Network support',
      href: 'https://github.com/trustwallet/wallet-core?utm_source=walletradar&utm_medium=comparison',
      icon: Cpu,
    },
  ];

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
          text: 'Wallet Radar focuses specifically on developer needs, tracking GitHub activity, release frequency, security audits, and developer experience metrics. We compare software and hardware wallets with a detailed scoring methodology.',
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
          text: 'Trezor Safe 5 scores 92 and is our top hardware wallet recommendation. It features fully open source firmware, Secure Element (Optiga), active development, and costs approximately $169.',
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
          text: 'We maintain separate comparison tables for software wallets and hardware wallets due to their different use cases and evaluation criteria.',
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
          text: 'EtherFi Cash scores 85 and offers 2-3% cashback with non-custodial self-custody, no annual fee, and is available globally. For US users, Gemini Card (76), Coinbase Card (75), and Fold Card (77) are top options.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best crypto credit card for business use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EtherFi Cash is our top business card recommendation with a score of 85. It offers non-custodial corporate cards with 2-3% cashback and is available globally. Revolut Crypto (76) is also excellent for fiat+crypto business needs.',
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
          url: `${baseUrl}/docs/software-wallets/`,
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
          url: `${baseUrl}/docs/hardware-wallets/`,
          description:
            'Score: 92 — Fully open source, Secure Element, active development. Best Hardware Wallet at approximately $169.',
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
          url: `${baseUrl}/docs/hardware-wallets/`,
          description:
            'Score: 91 — $79, Secure Element, fully open source firmware. Best Value hardware wallet with active development.',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Product',
          name: 'EtherFi Cash',
          category: 'Crypto Credit Card',
          brand: {
            '@type': 'Brand',
            name: 'EtherFi',
          },
          url: `${baseUrl}/docs/crypto-cards/`,
          description:
            'Score: 85 — 2-3% cashback, non-custodial self-custody, no annual fee. Best Personal crypto card with DeFi-native features.',
        },
      },
      {
        '@type': 'ListItem',
        position: 5,
        item: {
          '@type': 'Product',
          name: 'EtherFi Cash',
          category: 'Crypto Credit Card',
          brand: {
            '@type': 'Brand',
            name: 'EtherFi',
          },
          url: `${baseUrl}/docs/crypto-cards/`,
          description:
            'Score: 85 — Corporate cards available, non-custodial, 2-3% cashback. Best Business crypto card for DeFi-native companies.',
        },
      },
      {
        '@type': 'ListItem',
        position: 6,
        item: {
          '@type': 'Product',
          name: 'Transak',
          category: 'Crypto On/Off-Ramp',
          brand: {
            '@type': 'Brand',
            name: 'Transak',
          },
          url: `${baseUrl}/docs/ramps/`,
          description:
            'Score: 92 — React SDK, 160+ countries, excellent developer experience. Best Ramp for Developers with both on-ramp and off-ramp support.',
        },
      },
      {
        '@type': 'ListItem',
        position: 7,
        item: {
          '@type': 'Product',
          name: 'onesafe',
          category: 'Crypto On/Off-Ramp',
          brand: {
            '@type': 'Brand',
            name: 'onesafe',
          },
          url: `${baseUrl}/docs/ramps/`,
          description:
            'Score: 70 — Enterprise-focused API, custom pricing, select global coverage. Best Business Ramp for enterprise use cases.',
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
      <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#111827] text-slate-50">
        {/* Disclaimer Banner */}
        <div className="w-full bg-blue-50 border-b border-blue-200 text-blue-900 px-4 py-3">
          <div className="container mx-auto flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold">📚 Educational Research &amp; Data Only</p>
              <p>
                Wallet Radar does NOT provide financial advice, recommend wallets, have login pages, or collect personal information. All data is sourced publicly and linked for independent verification. Completely independent of all wallet providers.{' '}
                <a href="/docs/about" className="underline hover:text-blue-700">Why we&apos;re not phishing</a>
              </p>
            </div>
          </div>
        </div>

        <main>
          {/* Hero + Evidence Card */}
          <section className="pt-16 pb-12 lg:pt-20 lg:pb-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                    Evidence-led UI
                  </span>
                  <h1 className="mt-5 text-[28px] leading-[34px] font-semibold tracking-tight text-slate-50 sm:text-[32px] sm:leading-[40px] lg:text-[40px] lg:leading-[48px]">
                    Audit-grade <span className="text-sky-400">wallet comparisons</span> for developers
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                    Evidence-led scoring, transparent sources, and side-by-side tooling for fast, confident wallet choices.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/docs/software-wallets"
                      className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:brightness-110"
                    >
                      Start Comparison
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/docs/software-wallets-details"
                      className="inline-flex items-center gap-2 rounded-[12px] border border-slate-600/70 bg-slate-900/40 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500/80 hover:bg-slate-900/70"
                    >
                      Methodology
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className={`${glassCard} p-6`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-sky-300">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">Score Breakdown</p>
                        <p className="text-xs text-slate-400">Security / Dev UX / Activity / Coverage</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Security</span>
                          <span>92</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-800">
                          <div className="h-2 w-[88%] rounded-full bg-sky-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Dev UX</span>
                          <span>90</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-800">
                          <div className="h-2 w-[82%] rounded-full bg-emerald-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Activity</span>
                          <span>87</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-800">
                          <div className="h-2 w-[76%] rounded-full bg-amber-400" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {['GitHub', 'WalletBeat', 'Chain Data'].map((source) => (
                        <span
                          key={source}
                          className="rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-200"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                  label="Software Wallets"
                  value={`${stats.softwareWallets}+`}
                  description="EVM-compatible wallets compared"
                  icon={<Shield className="h-5 w-5" />}
                  className="!p-5"
                />
                <StatsCard
                  label="Hardware Wallets"
                  value={`${stats.hardwareWallets}+`}
                  description="Cold storage devices reviewed"
                  icon={<Cpu className="h-5 w-5" />}
                  className="!p-5"
                />
                <StatsCard
                  label="Crypto Cards"
                  value={`${stats.cryptoCards}+`}
                  description="Credit & debit cards compared"
                  icon={<CreditCard className="h-5 w-5" />}
                  className="!p-5"
                />
                <StatsCard
                  label="Ramps"
                  value={`${stats.ramps}+`}
                  description="On/off-ramp providers compared"
                  icon={<ArrowLeftRight className="h-5 w-5" />}
                  className="!p-5"
                />
                <StatsCard
                  label="Last Updated"
                  value={stats.lastUpdated.split(',')[0] || 'Dec 2025'}
                  description="Regular data refreshes via GitHub API"
                  icon={<Github className="h-5 w-5" />}
                  className="!p-5"
                />
              </div>
            </div>
          </section>

          {/* Trust / Proof Band */}
          <section className="pb-6">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={`${glassCard} px-4 py-3`}>
                <p className="text-center text-sm text-slate-300 md:whitespace-nowrap">
                  No login &middot; No tracking &middot; No affiliates &middot; Verified sources &middot;{' '}
                  <Link href="/docs/about" className="text-sky-300 hover:text-sky-200">
                    Why we&apos;re not phishing
                  </Link>{' '}
                  &middot;{' '}
                  <Link href="/docs/data-sources" className="text-sky-300 hover:text-sky-200">
                    Data verification
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Top Picks */}
          <section className="py-12 lg:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-50 lg:text-3xl">Top Picks + Evidence</h2>
                  <p className="mt-2 text-sm text-slate-400">Evidence-led picks across software, hardware, and ramps.</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topPicks.map((pick) => {
                  const Icon = pick.icon;
                  return (
                    <div key={pick.title} className={`${glassCardHover} flex h-full flex-col p-6`}>
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-sky-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${pick.pillClass}`}>
                            {pick.category}
                          </span>
                          <h3 className="mt-3 text-lg font-semibold text-slate-100">{pick.title}</h3>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        {pick.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={pick.href}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
                      >
                        Compare this
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Explore Preview */}
          <section className="py-12 lg:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-50 lg:text-3xl">Explore Preview</h2>
                  <p className="mt-2 text-sm text-slate-400">Mini table preview of the explorer with live scoring.</p>
                </div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-400/20"
                >
                  Open Explorer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className={`mt-6 overflow-hidden ${glassCard}`}>
                <div className="hidden md:block">
                  <div className="grid grid-cols-12 gap-4 bg-slate-950/60 px-6 py-3 text-xs uppercase text-slate-400">
                    <div className="col-span-5">Wallet</div>
                    <div className="col-span-2">Score</div>
                    <div className="col-span-5">Platforms</div>
                  </div>
                  {previewRows.map((row) => (
                    <div key={row.name} className="grid grid-cols-12 gap-4 border-t border-slate-800/70 px-6 py-4 text-sm text-slate-200">
                      <div className="col-span-5 font-medium">{row.name}</div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-400/10 px-2 py-1 text-xs font-semibold text-sky-300">
                          {row.score}
                        </span>
                      </div>
                      <div className="col-span-5 text-slate-400">{row.platforms}</div>
                    </div>
                  ))}
                </div>
                <div className="md:hidden">
                  {previewRows.map((row, index) => (
                    <div
                      key={row.name}
                      className={`px-4 py-3 ${index === 0 ? '' : 'border-t border-slate-800/70'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-100">{row.name}</span>
                        <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-400/10 px-2 py-1 text-xs font-semibold text-sky-300">
                          {row.score}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{row.platforms}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Latest Articles */}
          <section className="py-12 lg:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-50 lg:text-3xl">Latest Articles</h2>
                  <p className="mt-2 text-sm text-slate-400">Updates, comparisons, and reviews.</p>
                </div>
                <Link href="/articles" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
                  View all
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className={`${glassCardHover} group flex h-full flex-col p-6`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase text-sky-300">
                        <FileText className="h-3 w-3" />
                        {article.category}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-100 group-hover:text-sky-300">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-300 line-clamp-3">{article.description}</p>
                    <div className="mt-4 text-xs text-slate-400">
                      Updated {article.lastUpdated}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Resources & Guides */}
          <section className="py-12 lg:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-50 lg:text-3xl">Resources &amp; Guides</h2>
                  <p className="mt-2 text-sm text-slate-400">Methodology, data sources, and audits.</p>
                </div>
                <Link href="/docs" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
                  View all
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resourceDocs.map((doc) => (
                  <WalletCard key={doc.slug} document={doc} className={`${glassCardHover} h-full`} />
                ))}
              </div>
            </div>
          </section>

          {/* Sources & Transparency */}
          <section className="py-12 lg:py-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-50 lg:text-3xl">Sources &amp; Transparency</h2>
                <p className="mt-2 text-sm text-slate-400">Direct links to verified datasets.</p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {sourceTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <a
                      key={tile.title}
                      href={tile.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${glassCardHover} flex h-full flex-col p-5`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-sky-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-100">{tile.title}</h3>
                      <p className="mt-2 text-xs text-slate-400">{tile.description}</p>
                    </a>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                <Link href="/docs/data-sources" className="text-sky-300 hover:text-sky-200">
                  View our data verification process
                </Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
