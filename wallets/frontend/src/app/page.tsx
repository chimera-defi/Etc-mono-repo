import Link from 'next/link';
import { ArrowRight, Shield, Cpu, BookOpen, Github, Zap, CheckCircle } from 'lucide-react';
import { getAllDocuments, getWalletStats } from '@/lib/markdown';
import { WalletCard } from '@/components/WalletCard';
import { StatsCard } from '@/components/StatsCard';

export default function HomePage() {
  const documents = getAllDocuments();
  const stats = getWalletStats(documents);
  
  const comparisonDocs = documents.filter(d => d.category === 'comparison');
  const guideDocs = documents.filter(d => d.category === 'guide' || d.category === 'research');

  return (
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
                href="/docs/wallet-comparison-unified"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Software Wallets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/hardware-wallet-comparison"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Hardware Wallets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Data Sources */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="https://github.com"
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
  );
}
