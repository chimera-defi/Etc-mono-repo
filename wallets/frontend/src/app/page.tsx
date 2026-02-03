import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Shield, Cpu, BookOpen, Github, CheckCircle, GitCompare, ArrowLeftRight, FileText, Lock, Eye, UserX, Database, CreditCard, Sparkles, Smartphone, HardDrive, ArrowUpDown, Mail, TrendingUp, Calendar } from 'lucide-react';
import { getAllDocuments, getWalletStats } from '@/lib/markdown';
import { getAllArticles } from '@/lib/articles';
import { ArticleCard } from '@/components/ArticleCard';
import { FAQ } from '@/components/FAQ';
import { HeroSearch } from '@/components/HeroSearch';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';


// Top Pick Card Component
interface TopPickCardProps {
  category: 'Software' | 'Hardware' | 'Ramps' | 'Cards';
  name: string;
  score: number;
  badges: string[];
  href: string;
  icon: React.ReactNode;
  categoryColor: string;
}

function TopPickCard({ category, name, score, badges, href, icon, categoryColor }: TopPickCardProps) {
  return (
    <Link href={href} className="group glass-card-hover p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-muted-foreground">{icon}</div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
          {category}
        </span>
        <span className="text-foreground font-semibold">{name}</span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Proof badges */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge} className="px-3 py-1 text-xs border border-border rounded-full text-muted-foreground">
            {badge}
          </span>
        ))}
      </div>
    </Link>
  );
}

// Resource Card Component
interface ResourceCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function ResourceCard({ title, description, href, icon }: ResourceCardProps) {
  return (
    <Link href={href} className="group glass-card-hover p-5">
      <div className="text-sky-400 mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-sky-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
    </Link>
  );
}

// Source Tile Component
interface SourceTileProps {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function SourceTile({ name, description, href, icon }: SourceTileProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card-hover p-4"
    >
      <div className="text-muted-foreground mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </a>
  );
}

// Mini Table Row Component
function MiniTableRow({ wallet, score, platforms, license, activity }: {
  wallet: string;
  score: number;
  platforms: string;
  license: string;
  activity: string;
}) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-foreground">{wallet}</td>
      <td className="py-3 px-4 text-muted-foreground">{score}</td>
      <td className="py-3 px-4 text-muted-foreground">{platforms}</td>
      <td className="py-3 px-4 text-muted-foreground">{license}</td>
      <td className="py-3 px-4 text-muted-foreground">{activity}</td>
    </tr>
  );
}

export default function HomePage() {
  const documents = getAllDocuments();
  const allArticles = getAllArticles();
  const articles = allArticles.slice(0, 3);
  const guideDocs = documents.filter(d => d.category === 'guide' || d.category === 'research').slice(0, 3);
  const walletStats = getWalletStats(documents);
  const totalWallets =
    walletStats.softwareWallets +
    walletStats.hardwareWallets +
    walletStats.cryptoCards +
    walletStats.ramps;
  const totalContent = documents.length + allArticles.length;
  const popularSearches = [
    { label: 'Rabby Wallet', href: '/explore?type=software&q=Rabby' },
    { label: 'MetaMask alternatives', href: '/explore?type=software&q=MetaMask' },
    { label: 'Trezor hardware', href: '/explore?type=hardware&q=Trezor' },
    { label: 'Gnosis Pay cards', href: '/explore?type=cards&q=Gnosis' },
    { label: 'Transak ramps', href: '/explore?type=ramps&q=Transak' },
  ];
  const collections = [
    {
      title: 'Transaction Simulation Wallets',
      description: 'Wallets that preview outcomes before you sign.',
      href: '/explore?type=software&features=txSimulation',
      accent: 'from-sky-500/15 to-transparent',
    },
    {
      title: 'Self-Custody Cards',
      description: 'Cards that keep control of your keys.',
      href: '/explore?type=cards&custody=self',
      accent: 'from-emerald-500/15 to-transparent',
    },
    {
      title: 'Air-Gapped Hardware',
      description: 'Offline-first cold storage devices.',
      href: '/explore?type=hardware&airGap=true',
      accent: 'from-amber-500/15 to-transparent',
    },
    {
      title: 'No Annual Fee Cards',
      description: 'Cards with zero yearly fees.',
      href: '/explore?type=cards&noAnnualFee=true',
      accent: 'from-violet-500/15 to-transparent',
    },
    {
      title: 'Recommended Only',
      description: 'Highest scoring picks across categories.',
      href: '/explore?recommendation=recommended',
      accent: 'from-indigo-500/15 to-transparent',
    },
    {
      title: 'Open Source Hardware',
      description: 'Fully open firmware devices.',
      href: '/explore?type=hardware&openSource=full',
      accent: 'from-teal-500/15 to-transparent',
    },
  ];

  const parseDateValue = (value?: string) => {
    if (!value) return 0;
    const direct = Date.parse(value);
    if (!Number.isNaN(direct)) return direct;
    const fallback = Date.parse(`${value} 1`);
    if (!Number.isNaN(fallback)) return fallback;
    return 0;
  };

  const latestUpdates = [
    ...documents.map((doc) => ({
      type: 'doc' as const,
      title: doc.title,
      description: doc.description,
      href: `/docs/${doc.slug}`,
      updated: doc.lastUpdated,
    })),
    ...allArticles.map((article) => ({
      type: 'article' as const,
      title: article.title,
      description: article.description,
      href: `/articles/${article.slug}`,
      updated: article.lastUpdated,
    })),
  ]
    .sort((a, b) => parseDateValue(b.updated) - parseDateValue(a.updated))
    .slice(0, 6);

  // FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a crypto wallet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A crypto wallet is software or hardware that stores your private keys and lets you send, receive, and manage cryptocurrencies. It doesn\'t actually store your coins—those live on the blockchain. Instead, it holds the keys that prove you own them.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I connect my wallet to a dApp?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To connect your wallet to a decentralized application (dApp): 1) Visit the dApp website, 2) Click "Connect Wallet" button, 3) Select your wallet from the list, 4) Approve the connection in your wallet popup, 5) Review and confirm any permissions. Always verify you\'re on the correct website before connecting.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a seed phrase and why is it important?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A seed phrase (recovery phrase) is a 12-24 word sequence that can restore your wallet if you lose access. It\'s the master key to all your funds. NEVER share it with anyone, store it offline in multiple secure locations, and never enter it on any website.',
        },
      },
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
    ],
  };

  // ItemList schema for Top Picks
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
          description: 'Score: 92 — Transaction simulation, both platforms, active development.',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Product',
          name: 'Trezor Safe 5',
          category: 'Hardware Wallet',
          url: `${baseUrl}/docs/hardware-wallets/`,
          description: 'Score: 92 — Fully open source, Secure Element, active development.',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Product',
          name: 'Transak',
          category: 'Crypto On/Off-Ramp',
          url: `${baseUrl}/docs/ramps/`,
          description: 'Score: 92 — React SDK, 160+ countries, excellent developer experience.',
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

      {/* Disclaimer Banner */}
      <div className="w-full bg-sky-900/30 border-b border-sky-800/50 text-sky-100 px-4 py-3">
        <div className="container mx-auto max-w-7xl flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <svg className="h-5 w-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold">Educational Research &amp; Data Only</p>
            <p className="text-sky-200/80">No login pages, no wallet connections, no tracking. All data is public and verifiable. <a href="/docs/about" className="underline hover:text-white">Why we&apos;re not phishing</a></p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pt-16 md:pt-20 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Hero Left - Text Content */}
          <div>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-sky-400 border border-sky-500/50 rounded-full mb-6">
              Evidence-led UI
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              <span className="text-sky-400">Audit-grade</span> wallet comparisons for developers
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Evidence-led scoring, transparent sources, and side-by-side tooling.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Start Comparison
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <HeroSearch />

            {/* Direct Category Links */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/docs/software-wallets"
                className="inline-flex items-center gap-2 border border-border hover:border-sky-500 hover:text-sky-400 text-foreground font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                Software
              </Link>
              <Link
                href="/docs/hardware-wallets"
                className="inline-flex items-center gap-2 border border-border hover:border-emerald-500 hover:text-emerald-400 text-foreground font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <HardDrive className="h-4 w-4" />
                Hardware
              </Link>
              <Link
                href="/docs/crypto-cards"
                className="inline-flex items-center gap-2 border border-border hover:border-amber-500 hover:text-amber-400 text-foreground font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Cards
              </Link>
              <Link
                href="/docs/ramps"
                className="inline-flex items-center gap-2 border border-border hover:border-purple-500 hover:text-purple-400 text-foreground font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                Ramps
              </Link>
            </div>
          </div>

          {/* Hero Right - Quick Stats Card */}
          <div className="lg:justify-self-end w-full lg:max-w-md">
            <div className="glass-card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 text-center">Why Trust Our Data</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sky-500/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-sky-400">{totalWallets}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Wallets Compared</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-400">4</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-400">{totalContent}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Docs + Articles</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-400">0</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Affiliate Links</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
                <p className="text-xs text-muted-foreground/70">All scores derived from GitHub data and verified sources</p>
                <p className="text-xs text-muted-foreground/70">Last updated: {walletStats.lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Proof Band */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="bg-card/50 border border-border rounded-xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground/70" />
              No login
            </span>
            <span className="hidden md:inline text-border">/</span>
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground/70" />
              No tracking
            </span>
            <span className="hidden md:inline text-border">/</span>
            <span className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-muted-foreground/70" />
              No affiliates
            </span>
            <span className="hidden md:inline text-border">/</span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground/70" />
              Verified sources
            </span>
          </div>
        </div>
      </section>

      {/* Support the Research */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm text-sky-400 mb-2">Supported by the community</p>
              <h2 className="text-2xl font-bold text-foreground mb-2">Keep Wallet Radar independent</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                We don&apos;t use affiliate links. Sponsorships and data licensing help fund research, data refreshes, and open source tooling.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span className="px-2.5 py-1 border border-border rounded-full inline-flex items-center gap-1">
                  <Github className="h-3 w-3" />
                  GitHub API
                </span>
                <span className="px-2.5 py-1 border border-border rounded-full inline-flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  WalletBeat
                </span>
                <span className="px-2.5 py-1 border border-border rounded-full inline-flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  DeFiLlama
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs/sponsorship"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Become a sponsor
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:chimera_deFi@protonmail.com?subject=Wallet%20Radar%20Sponsorship"
                className="inline-flex items-center gap-2 border border-border text-foreground hover:text-sky-400 hover:border-sky-500/50 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Contact us
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Picks + Evidence</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <TopPickCard
            category="Software"
            name="Rabby Wallet"
            score={92}
            badges={['6 releases', 'Tx Sim', 'Open']}
            href="/docs/software-wallets"
            icon={<GitCompare className="h-5 w-5" />}
            categoryColor="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          />
          <TopPickCard
            category="Hardware"
            name="Trezor Safe 5"
            score={92}
            badges={['Secure', 'Open', 'Active']}
            href="/docs/hardware-wallets"
            icon={<Shield className="h-5 w-5" />}
            categoryColor="bg-sky-500/20 text-sky-400 border border-sky-500/30"
          />
          <TopPickCard
            category="Cards"
            name="Gnosis Pay"
            score={88}
            badges={['Self-custody', 'Visa', 'DeFi']}
            href="/docs/crypto-cards"
            icon={<CreditCard className="h-5 w-5" />}
            categoryColor="bg-violet-500/20 text-violet-400 border border-violet-500/30"
          />
          <TopPickCard
            category="Ramps"
            name="Transak"
            score={92}
            badges={['Dev UX', '160+', 'API']}
            href="/docs/ramps"
            icon={<ArrowLeftRight className="h-5 w-5" />}
            categoryColor="bg-amber-500/20 text-amber-400 border border-amber-500/30"
          />
        </div>
      </section>

      {/* Curated Collections */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-sky-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              Curated Collections
            </div>
            <h2 className="text-2xl font-bold text-foreground">Explore by Intent</h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View explorer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group glass-card-hover p-6 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-sky-400 transition-colors">
                  {collection.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {collection.description}
                </p>
                <span className="text-xs text-sky-400 inline-flex items-center gap-1">
                  Open collection
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Searches */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-3">Popular Searches</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Jump straight into the most requested wallet lookups and comparisons.
        </p>
        <div className="flex flex-wrap gap-3">
          {popularSearches.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-sky-500/50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Browse All Comparisons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/docs/software-wallets"
            className="glass-card-hover p-4 text-center group"
          >
            <GitCompare className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
            <h3 className="font-semibold text-foreground group-hover:text-sky-400 transition-colors">Software Wallets</h3>
            <p className="text-xs text-muted-foreground mt-1">Browser & mobile</p>
          </Link>
          <Link
            href="/docs/hardware-wallets"
            className="glass-card-hover p-4 text-center group"
          >
            <Shield className="h-8 w-8 mx-auto mb-2 text-sky-400" />
            <h3 className="font-semibold text-foreground group-hover:text-sky-400 transition-colors">Hardware Wallets</h3>
            <p className="text-xs text-muted-foreground mt-1">Cold storage</p>
          </Link>
          <Link
            href="/docs/crypto-cards"
            className="glass-card-hover p-4 text-center group"
          >
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-violet-400" />
            <h3 className="font-semibold text-foreground group-hover:text-sky-400 transition-colors">Crypto Cards</h3>
            <p className="text-xs text-muted-foreground mt-1">Spend crypto</p>
          </Link>
          <Link
            href="/docs/ramps"
            className="glass-card-hover p-4 text-center group"
          >
            <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-amber-400" />
            <h3 className="font-semibold text-foreground group-hover:text-sky-400 transition-colors">On/Off Ramps</h3>
            <p className="text-xs text-muted-foreground mt-1">Fiat ↔ Crypto</p>
          </Link>
        </div>
      </section>

      {/* Comparison Preview (Mini Table) */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Comparison Preview</h2>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 border border-border hover:border-sky-500 text-foreground hover:text-sky-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Open Explorer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Wallet</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Score</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Platforms</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">License</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Activity</th>
                </tr>
              </thead>
              <tbody>
                <MiniTableRow wallet="Rabby Wallet" score={92} platforms="Desktop, Mobile" license="Open Source" activity="Active" />
                <MiniTableRow wallet="Trezor Safe 5" score={92} platforms="Hardware" license="Open Source" activity="Active" />
                <MiniTableRow wallet="Gnosis Pay" score={88} platforms="Visa Card" license="DeFi" activity="Active" />
                <MiniTableRow wallet="Transak" score={92} platforms="API, SDK" license="Commercial" activity="Active" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              slug={article.slug}
              category={article.category}
              title={article.title}
              description={article.description}
              lastUpdated={article.lastUpdated}
              variant="compact"
            />
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-sky-400 mb-2">
              <Calendar className="h-4 w-4" />
              Recently Updated
            </div>
            <h2 className="text-2xl font-bold text-foreground">Latest Research Drops</h2>
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            Browse docs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestUpdates.map((item) => (
            <Link key={`${item.type}-${item.title}`} href={item.href} className="glass-card-hover p-5 group">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span className="uppercase tracking-wide">
                  {item.type === 'doc' ? 'Doc' : 'Article'}
                </span>
                <span className="text-border">•</span>
                <span>{item.updated || 'Recently'}</span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-sky-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Resources & Guides */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Resources &amp; Guides</h2>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guideDocs.length > 0 ? (
            guideDocs.map((doc) => (
              <ResourceCard
                key={doc.slug}
                title={doc.title}
                description={doc.description}
                href={`/docs/${doc.slug}`}
                icon={<BookOpen className="h-6 w-6" />}
              />
            ))
          ) : (
            <>
              <ResourceCard
                title="About Wallet Radar"
                description="Learn how we evaluate and score wallets based on security, developer experience, and more."
                href="/docs/about"
                icon={<FileText className="h-6 w-6" />}
              />
              <ResourceCard
                title="Data Sources"
                description="Transparency about where our data comes from and how we verify it."
                href="/docs/data-sources"
                icon={<Database className="h-6 w-6" />}
              />
              <ResourceCard
                title="Contributing"
                description="Help improve our wallet comparisons by contributing data or suggestions."
                href="/docs/contributing"
                icon={<Shield className="h-6 w-6" />}
              />
            </>
          )}
        </div>
      </section>

      {/* New to Wallets? Quick Start */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="glass-card p-6 md:p-8 relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <span className="text-sm font-medium text-sky-400">Quick Start</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">New to Crypto Wallets?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              A wallet is your gateway to Web3. It stores your keys, lets you sign transactions, and connects you to decentralized apps. Here&apos;s how to get started in 3 steps:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Choose a Wallet</h3>
                  <p className="text-sm text-muted-foreground">Pick based on your needs—Rabby for developers, Trust for multi-chain.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Secure Your Seed</h3>
                  <p className="text-sm text-muted-foreground">Write down your 12-24 word phrase. Store it offline. Never share it.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Connect to dApps</h3>
                  <p className="text-sm text-muted-foreground">Click &quot;Connect Wallet&quot; on any dApp and approve the connection.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs/software-wallets"
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
              >
                Compare wallets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                Read the FAQ below
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Support */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Community &amp; Support</h2>
          <Link
            href="/docs/contributing"
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            Contribute data
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-hover p-6">
            <Github className="h-6 w-6 text-emerald-400 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-2">Submit a Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a new wallet, fix data, or propose updates through our open source workflow.
            </p>
            <Link
              href="/docs/contributing"
              className="text-sm text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
            >
              Read contributing guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="glass-card-hover p-6">
            <FileText className="h-6 w-6 text-sky-400 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-2">Request a Comparison</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us which wallets or providers you want reviewed next.
            </p>
            <a
              href="mailto:chimera_deFi@protonmail.com?subject=Wallet%20Radar%20Comparison%20Request"
              className="text-sm text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
            >
              Email the team
              <Mail className="h-4 w-4" />
            </a>
          </div>
          <div className="glass-card-hover p-6">
            <CreditCard className="h-6 w-6 text-amber-400 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-2">Sponsorship &amp; Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Support Wallet Radar or license data while keeping research independent.
            </p>
            <Link
              href="/docs/sponsorship"
              className="text-sm text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
            >
              View sponsorship options
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div id="faq">
        <FAQ />
      </div>

      {/* Sources & Transparency */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-16 md:pb-20">
        <h2 className="text-2xl font-bold text-foreground mb-2">Sources &amp; Transparency</h2>
        <p className="text-sm text-muted-foreground mb-6">
          All links are to official, verified sources. No shortened URLs or referral links.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SourceTile
            name="GitHub API"
            description="Stars, issues, activity status"
            href="https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets"
            icon={<Github className="h-5 w-5" />}
          />
          <SourceTile
            name="WalletBeat"
            description="License, devices, security"
            href="https://walletbeat.fyi"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <SourceTile
            name="Rabby API"
            description="Chain counts"
            href="https://api.rabby.io/v1/chain/list"
            icon={<Shield className="h-5 w-5" />}
          />
          <SourceTile
            name="Trust Registry"
            description="Network support"
            href="https://github.com/trustwallet/wallet-core"
            icon={<Cpu className="h-5 w-5" />}
          />
        </div>
      </section>
    </>
  );
}
