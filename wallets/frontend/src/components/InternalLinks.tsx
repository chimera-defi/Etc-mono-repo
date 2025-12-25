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

// Feature links - linking to explore page with filters or to doc sections
// This provides internal linking value without creating thin content pages
const FEATURE_LINKS = {
  software: [
    { label: 'Transaction Simulation', href: '/docs/wallet-comparison-unified-table#transaction-simulation', icon: Eye },
    { label: 'Scam Protection', href: '/docs/wallet-comparison-unified-table#security', icon: AlertTriangle },
    { label: 'Open Source', href: '/docs/wallet-comparison-unified-table#license', icon: Lock },
    { label: 'Hardware Support', href: '/docs/wallet-comparison-unified-details#hardware-wallet-support', icon: Cpu },
    { label: 'Mobile Apps', href: '/docs/wallet-comparison-unified-table#devices', icon: Smartphone },
    { label: 'Browser Extensions', href: '/docs/wallet-comparison-unified-table#devices', icon: Globe },
    { label: 'Desktop Apps', href: '/docs/wallet-comparison-unified-table#devices', icon: Monitor },
    { label: 'Multi-Chain Support', href: '/docs/wallet-comparison-unified-table#chains', icon: Zap },
  ],
  hardware: [
    { label: 'Air-Gapped Devices', href: '/docs/hardware-wallet-comparison-table#air-gap', icon: Wifi },
    { label: 'Secure Element', href: '/docs/hardware-wallet-comparison-table#secure-element', icon: Fingerprint },
    { label: 'Open Source Firmware', href: '/docs/hardware-wallet-comparison-table#open-source', icon: Lock },
    { label: 'Budget Options', href: '/docs/hardware-wallet-comparison-table#price', icon: CreditCard },
  ],
  cards: [
    { label: 'High Cashback', href: '/docs/crypto-credit-card-comparison-table#cashback', icon: CreditCard },
    { label: 'No Annual Fee', href: '/docs/crypto-credit-card-comparison-table#fees', icon: CreditCard },
    { label: 'US Available', href: '/docs/crypto-credit-card-comparison-table#region', icon: CreditCard },
    { label: 'EU Available', href: '/docs/crypto-credit-card-comparison-table#region', icon: CreditCard },
  ],
};

// Full featured links section for homepage
// Links to existing content pages (comparison tables) which have substantial unique content
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
            {FEATURE_LINKS.software.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/docs/wallet-comparison-unified-table"
            className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
          >
            View full comparison
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Hardware Wallet Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Hardware Wallets</h3>
          </div>
          <ul className="space-y-2">
            {FEATURE_LINKS.hardware.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/docs/hardware-wallet-comparison-table"
            className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
          >
            View full comparison
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Crypto Card Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Crypto Cards</h3>
          </div>
          <ul className="space-y-2">
            {FEATURE_LINKS.cards.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/docs/crypto-credit-card-comparison-table"
            className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
          >
            View full comparison
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Explore CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Explore & Compare All Wallets
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
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
