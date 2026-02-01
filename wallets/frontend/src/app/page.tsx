import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Shield, Cpu, BookOpen, Github, CheckCircle, GitCompare, ArrowLeftRight, FileText, Lock, Eye, UserX, Database, CreditCard, Sparkles, Smartphone, HardDrive, ArrowUpDown } from 'lucide-react';
import { getAllDocuments } from '@/lib/markdown';
import { getAllArticles } from '@/lib/articles';
import { ArticleCard } from '@/components/ArticleCard';
import { FAQ } from '@/components/FAQ';

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
        <div className="text-slate-400">{icon}</div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
          {category}
        </span>
        <span className="text-slate-100 font-semibold">{name}</span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Proof badges */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge} className="px-3 py-1 text-xs border border-slate-600 rounded-full text-slate-300">
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
      <h3 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-sky-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
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
      <div className="text-slate-300 mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-100 mb-1">{name}</h3>
      <p className="text-xs text-slate-400">{description}</p>
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
    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4 text-slate-100">{wallet}</td>
      <td className="py-3 px-4 text-slate-300">{score}</td>
      <td className="py-3 px-4 text-slate-300">{platforms}</td>
      <td className="py-3 px-4 text-slate-300">{license}</td>
      <td className="py-3 px-4 text-slate-300">{activity}</td>
    </tr>
  );
}

export default function HomePage() {
  const documents = getAllDocuments();
  const articles = getAllArticles().slice(0, 3);
  const guideDocs = documents.filter(d => d.category === 'guide' || d.category === 'research').slice(0, 3);

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

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-100 mb-4 leading-tight">
              <span className="text-sky-400">Audit-grade</span> wallet comparisons for developers
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-xl">
              Evidence-led scoring, transparent sources, and side-by-side tooling.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Start Comparison
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/about"
                className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-200 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Read Methodology
              </Link>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm text-slate-500 self-center mr-1">Jump to:</span>
              <Link
                href="/docs/software-wallets"
                className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                Software
              </Link>
              <span className="text-slate-600">•</span>
              <Link
                href="/docs/hardware-wallets"
                className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors"
              >
                <HardDrive className="h-4 w-4" />
                Hardware
              </Link>
              <span className="text-slate-600">•</span>
              <Link
                href="/docs/crypto-cards"
                className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Cards
              </Link>
              <span className="text-slate-600">•</span>
              <Link
                href="/docs/ramps"
                className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                Ramps
              </Link>
            </div>
          </div>

          {/* Hero Right - Comparison Categories Grid */}
          <div className="lg:justify-self-end w-full lg:max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/docs/software-wallets" className="group glass-card-hover p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                  <Smartphone className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">Software Wallets</h3>
                <p className="text-xs text-slate-400">Browser & mobile apps</p>
              </Link>

              <Link href="/docs/hardware-wallets" className="group glass-card-hover p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <HardDrive className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">Hardware Wallets</h3>
                <p className="text-xs text-slate-400">Cold storage devices</p>
              </Link>

              <Link href="/docs/crypto-cards" className="group glass-card-hover p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <CreditCard className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">Crypto Cards</h3>
                <p className="text-xs text-slate-400">Spend crypto anywhere</p>
              </Link>

              <Link href="/docs/ramps" className="group glass-card-hover p-5 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <ArrowUpDown className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1">On/Off Ramps</h3>
                <p className="text-xs text-slate-400">Fiat ↔ crypto bridges</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Proof Band */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              No login
            </span>
            <span className="hidden md:inline text-slate-700">/</span>
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-500" />
              No tracking
            </span>
            <span className="hidden md:inline text-slate-700">/</span>
            <span className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-slate-500" />
              No affiliates
            </span>
            <span className="hidden md:inline text-slate-700">/</span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-slate-500" />
              Verified sources
            </span>
          </div>
        </div>
      </section>

      {/* Top Picks Section */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Top Picks + Evidence</h2>

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

      {/* Browse Categories */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Browse All Comparisons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/docs/software-wallets"
            className="glass-card-hover p-4 text-center group"
          >
            <GitCompare className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">Software Wallets</h3>
            <p className="text-xs text-slate-400 mt-1">Browser & mobile</p>
          </Link>
          <Link
            href="/docs/hardware-wallets"
            className="glass-card-hover p-4 text-center group"
          >
            <Shield className="h-8 w-8 mx-auto mb-2 text-sky-400" />
            <h3 className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">Hardware Wallets</h3>
            <p className="text-xs text-slate-400 mt-1">Cold storage</p>
          </Link>
          <Link
            href="/docs/crypto-cards"
            className="glass-card-hover p-4 text-center group"
          >
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-violet-400" />
            <h3 className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">Crypto Cards</h3>
            <p className="text-xs text-slate-400 mt-1">Spend crypto</p>
          </Link>
          <Link
            href="/docs/ramps"
            className="glass-card-hover p-4 text-center group"
          >
            <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-amber-400" />
            <h3 className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">On/Off Ramps</h3>
            <p className="text-xs text-slate-400 mt-1">Fiat ↔ Crypto</p>
          </Link>
        </div>
      </section>

      {/* Comparison Preview (Mini Table) */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Comparison Preview</h2>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 border border-slate-600 hover:border-sky-500 text-slate-200 hover:text-sky-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Open Explorer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Wallet</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Score</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Platforms</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">License</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">Activity</th>
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
          <h2 className="text-2xl font-bold text-slate-100">Latest Articles</h2>
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

      {/* Resources & Guides */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Resources &amp; Guides</h2>
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

            <h2 className="text-2xl font-bold text-slate-100 mb-3">New to Crypto Wallets?</h2>
            <p className="text-slate-400 mb-6 max-w-2xl">
              A wallet is your gateway to Web3. It stores your keys, lets you sign transactions, and connects you to decentralized apps. Here&apos;s how to get started in 3 steps:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">Choose a Wallet</h3>
                  <p className="text-sm text-slate-400">Pick based on your needs—Rabby for developers, Trust for multi-chain.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">Secure Your Seed</h3>
                  <p className="text-sm text-slate-400">Write down your 12-24 word phrase. Store it offline. Never share it.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-slate-100 mb-1">Connect to dApps</h3>
                  <p className="text-sm text-slate-400">Click &quot;Connect Wallet&quot; on any dApp and approve the connection.</p>
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
              <span className="text-slate-600">•</span>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors"
              >
                Read the FAQ below
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div id="faq">
        <FAQ />
      </div>

      {/* Sources & Transparency */}
      <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-16 md:pb-20">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Sources &amp; Transparency</h2>
        <p className="text-sm text-slate-400 mb-6">
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
