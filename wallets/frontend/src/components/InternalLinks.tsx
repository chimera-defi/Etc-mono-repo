'use client';

import Link from 'next/link';
import { Shield, Cpu, CreditCard, ArrowLeftRight, ArrowRight } from 'lucide-react';

/**
 * Featured links section for homepage
 * Links to existing comparison pages with substantial content
 */
export function FeaturedCategoryLinks() {
  return (
    <section className="container mx-auto px-4 py-16 border-t border-slate-700/60">
      <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
      <p className="text-muted-foreground mb-8">
        Comprehensive comparison tables with detailed analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Software Wallets */}
        <Link
          href="/docs/software-wallets"
          className="group glass-panel glass-panel-hover p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-6 w-6 text-sky-300" />
            <h3 className="font-semibold text-lg">Software Wallets</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Compare EVM wallets. Transaction simulation, scam alerts, multi-chain support, and developer features.
          </p>
          <span className="text-sm text-sky-300 inline-flex items-center gap-1 group-hover:underline">
            View comparison
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        {/* Hardware Wallets */}
        <Link
          href="/docs/hardware-wallets"
          className="group glass-panel glass-panel-hover p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="h-6 w-6 text-sky-300" />
            <h3 className="font-semibold text-lg">Hardware Wallets</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Compare cold storage devices. Air-gap security, secure elements, open source firmware, and pricing.
          </p>
          <span className="text-sm text-sky-300 inline-flex items-center gap-1 group-hover:underline">
            View comparison
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        {/* Crypto Cards */}
        <Link
          href="/docs/crypto-cards"
          className="group glass-panel glass-panel-hover p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-6 w-6 text-sky-300" />
            <h3 className="font-semibold text-lg">Crypto Cards</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Compare crypto credit cards. Cashback rates, annual fees, regional availability, and rewards programs.
          </p>
          <span className="text-sm text-sky-300 inline-flex items-center gap-1 group-hover:underline">
            View comparison
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        {/* Ramps */}
        <Link
          href="/docs/ramps"
          className="group glass-panel glass-panel-hover p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowLeftRight className="h-6 w-6 text-sky-300" />
            <h3 className="font-semibold text-lg">Ramps</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Compare on/off-ramp providers. Coverage, fees, developer experience, and integration options.
          </p>
          <span className="text-sm text-sky-300 inline-flex items-center gap-1 group-hover:underline">
            View comparison
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {/* Explore CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:brightness-110"
        >
          Explore & Compare All Wallets
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
