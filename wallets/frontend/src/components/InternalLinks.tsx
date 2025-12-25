'use client';

import Link from 'next/link';
import {
  Shield,
  Cpu,
  CreditCard,
  Eye,
  AlertTriangle,
  Lock,
  Smartphone,
  Globe,
  Monitor,
  Zap,
  Wifi,
  Fingerprint,
  ArrowRight,
} from 'lucide-react';

// Category links for internal linking structure
const CATEGORY_LINKS = {
  software: [
    { slug: 'tx-simulation', label: 'Transaction Simulation', icon: Eye },
    { slug: 'scam-protection', label: 'Scam Protection', icon: AlertTriangle },
    { slug: 'open-source', label: 'Open Source', icon: Lock },
    { slug: 'hardware-support', label: 'Hardware Support', icon: Cpu },
    { slug: 'mobile-wallets', label: 'Mobile', icon: Smartphone },
    { slug: 'browser-extension', label: 'Browser Extension', icon: Globe },
    { slug: 'desktop-wallets', label: 'Desktop', icon: Monitor },
    { slug: 'multi-chain', label: 'Multi-Chain (50+)', icon: Zap },
    { slug: 'active-development', label: 'Active Development', icon: Zap },
  ],
  hardware: [
    { slug: 'air-gapped', label: 'Air-Gapped', icon: Wifi },
    { slug: 'secure-element', label: 'Secure Element', icon: Fingerprint },
    { slug: 'open-source-hardware', label: 'Open Source Firmware', icon: Lock },
    { slug: 'budget-hardware', label: 'Under $100', icon: CreditCard },
  ],
  cards: [
    { slug: 'high-cashback', label: 'High Cashback (3%+)', icon: CreditCard },
    { slug: 'no-annual-fee', label: 'No Annual Fee', icon: CreditCard },
    { slug: 'us-crypto-cards', label: 'US Available', icon: CreditCard },
    { slug: 'eu-crypto-cards', label: 'EU Available', icon: CreditCard },
    { slug: 'business-crypto-cards', label: 'Business Cards', icon: CreditCard },
  ],
};

interface CategoryLinksProps {
  type: 'software' | 'hardware' | 'cards';
  title?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export function CategoryLinks({ type, title, showTitle = true, compact = false }: CategoryLinksProps) {
  const links = CATEGORY_LINKS[type];
  const defaultTitle = type === 'software'
    ? 'Software Wallet Features'
    : type === 'hardware'
    ? 'Hardware Wallet Features'
    : 'Crypto Card Categories';

  return (
    <div className={compact ? '' : 'mb-6'}>
      {showTitle && (
        <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
          {title || defaultTitle}
        </h3>
      )}
      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'gap-3'}`}>
        {links.map(({ slug, label, icon: Icon }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm hover:bg-muted hover:border-primary/50 transition-colors ${compact ? 'text-xs px-2 py-1' : ''}`}
          >
            <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Full featured links section for homepage
export function FeaturedCategoryLinks() {
  return (
    <section className="container mx-auto px-4 py-16 border-t border-border">
      <h2 className="text-2xl font-bold mb-2">Browse by Feature</h2>
      <p className="text-muted-foreground mb-8">
        Find the perfect wallet based on specific features and requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Software Wallet Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Software Wallets</h3>
          </div>
          <ul className="space-y-2">
            {CATEGORY_LINKS.software.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`/category/${slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {label}
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hardware Wallet Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Hardware Wallets</h3>
          </div>
          <ul className="space-y-2">
            {CATEGORY_LINKS.hardware.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`/category/${slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/docs/hardware-wallet-comparison-table"
            className="text-sm text-primary hover:underline mt-3 inline-block"
          >
            View all hardware wallets
          </Link>
        </div>

        {/* Crypto Card Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Crypto Cards</h3>
          </div>
          <ul className="space-y-2">
            {CATEGORY_LINKS.cards.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`/category/${slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/docs/crypto-credit-card-comparison-table"
            className="text-sm text-primary hover:underline mt-3 inline-block"
          >
            View all crypto cards
          </Link>
        </div>
      </div>
    </section>
  );
}

// Top wallets quick links
interface TopWalletLinksProps {
  wallets: Array<{ id: string; name: string; score: number; type: 'software' | 'hardware' | 'card' }>;
  title?: string;
}

export function TopWalletLinks({ wallets, title = 'Top Rated Wallets' }: TopWalletLinksProps) {
  return (
    <div className="p-4 rounded-lg border border-border">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {wallets.map((wallet) => (
          <li key={wallet.id}>
            <Link
              href={`/wallet/${wallet.type}/${wallet.id}`}
              className="flex items-center justify-between text-sm hover:text-primary transition-colors"
            >
              <span>{wallet.name}</span>
              <span className="text-muted-foreground font-mono">{wallet.score}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Breadcrumb-style internal links
interface QuickNavLinksProps {
  currentPage: string;
  parentPage?: { href: string; label: string };
}

export function QuickNavLinks({ currentPage, parentPage }: QuickNavLinksProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {parentPage && (
        <>
          <span>/</span>
          <Link href={parentPage.href} className="hover:text-foreground transition-colors">
            {parentPage.label}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-foreground">{currentPage}</span>
    </nav>
  );
}

// Related content links for footer of pages
interface RelatedLinksProps {
  links: Array<{ href: string; label: string; description?: string }>;
  title?: string;
}

export function RelatedLinks({ links, title = 'Related Content' }: RelatedLinksProps) {
  return (
    <div className="border-t border-border pt-6 mt-8">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium block">{link.label}</span>
            {link.description && (
              <span className="text-sm text-muted-foreground">{link.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
