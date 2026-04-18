import type { Metadata } from 'next';
import { getAllDocuments, getWalletStats, type MarkdownDocument } from '@/lib/markdown';
import { VariantB, type VariantBData } from '@/components/design-lab/VariantB';

export const metadata: Metadata = {
  title: 'Design Lab Variant B',
  description:
    'Variant B redesign prototype for WalletRadar with stronger hierarchy, reusable surfaces, and design-system oriented component structure.',
  robots: {
    index: false,
    follow: false,
  },
};

function countTableRows(
  documents: MarkdownDocument[],
  slugs: string[],
  fallback: number
): number {
  const targetDocument = documents.find((document) => slugs.includes(document.slug));
  if (!targetDocument) {
    return fallback;
  }

  const boldRows = targetDocument.content.match(/\|\s+\[?\*\*[^|]+\*\*\]?\s+\|/g)?.length;
  if (boldRows && boldRows > 0) {
    return boldRows;
  }

  const genericRows = targetDocument.content.match(/\|\s+[^|\n]+\s+\|/g)?.length;
  if (!genericRows || genericRows <= 0) {
    return fallback;
  }

  return Math.max(genericRows - 2, fallback);
}

export default function VariantBPage() {
  const documents = getAllDocuments();
  const stats = getWalletStats(documents);

  const rampsCount = countTableRows(documents, ['ramps', 'ramps-details'], 18);
  const comparisonDocs = documents.filter((document) => document.category === 'comparison');
  const referenceDocs = documents.filter(
    (document) => document.category === 'guide' || document.category === 'research'
  );
  const trackedAssets =
    stats.softwareWallets + stats.hardwareWallets + stats.cryptoCards + rampsCount;

  const data: VariantBData = {
    headline: 'WalletRadar, reframed as a decision desk for developer custody choices.',
    subline:
      'This prototype keeps the same independent research voice while upgrading the visual system: clearer information hierarchy, stronger component rhythm, and production-ready interaction states.',
    lastUpdated: stats.lastUpdated,
    keyStats: [
      {
        label: 'tracked assets',
        value: trackedAssets.toLocaleString('en-US'),
        context: 'wallets, cards, and ramps currently indexed from WalletRadar research docs',
      },
      {
        label: 'comparison tracks',
        value: comparisonDocs.length.toLocaleString('en-US'),
        context: 'active benchmark tracks with both summary tables and implementation details',
      },
      {
        label: 'reference docs',
        value: referenceDocs.length.toLocaleString('en-US'),
        context: 'methodology, contribution notes, and source transparency material',
      },
    ],
    tracks: [
      {
        name: 'Software wallets',
        href: '/docs/software-wallets',
        count: stats.softwareWallets,
        summary:
          'Daily-driver wallets benchmarked for transaction safety, chain breadth, release cadence, and developer ergonomics.',
        focus: 'simulation guardrails, DX quality, and activity signals',
      },
      {
        name: 'Hardware wallets',
        href: '/docs/hardware-wallets',
        count: stats.hardwareWallets,
        summary:
          'Cold custody devices compared on firmware openness, secure element posture, and long-term maintenance consistency.',
        focus: 'supply-chain trust, backup model, and firmware transparency',
      },
      {
        name: 'Crypto cards',
        href: '/docs/crypto-cards',
        count: stats.cryptoCards,
        summary:
          'Card products evaluated for cashback quality, fee profile, regional availability, and real spend practicality.',
        focus: 'reward sustainability, compliance context, and card controls',
      },
      {
        name: 'On/off-ramps',
        href: '/docs/ramps',
        count: rampsCount,
        summary:
          'Fiat-to-crypto rails scored for coverage, integration quality, KYC friction, and settlement reliability.',
        focus: 'SDK maturity, country coverage, and failure handling',
      },
    ],
    picks: [
      {
        name: 'Rabby Wallet',
        href: '/docs/software-wallets',
        score: 92,
        reason:
          'Transaction simulation and practical safety defaults make it a reliable default for high-frequency development workflows.',
        fit: 'Best for active EVM builders',
      },
      {
        name: 'Trezor Safe 5',
        href: '/docs/hardware-wallets',
        score: 94,
        reason:
          'Strong open-source posture and mature operational model keep it near the top for long-horizon custody.',
        fit: 'Best for secure long-term storage',
      },
      {
        name: 'EtherFi Cash',
        href: '/docs/crypto-cards',
        score: 85,
        reason:
          'Balanced reward profile with non-custodial framing and broad practical usability for teams or individuals.',
        fit: 'Best for daily crypto-native spend',
      },
    ],
    systemNotes: [
      'Shared spacing and type scale lets the same component shells render every coverage lane.',
      'One accent family keeps attention on the data rather than decorative color shifts.',
      'Cards, links, and buttons all include hover, active, and keyboard focus states by default.',
      'Asymmetric grid removes template repetition while preserving scan-friendly alignment.',
    ],
  };

  return <VariantB data={data} />;
}
