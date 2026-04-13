import type { Metadata } from 'next';
import { getAllDocuments } from '@/lib/markdown';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DocsContent } from './DocsContent';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
// Cache-busting version for OG images - increment when images are updated
const ogImageVersion = 'v5';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Browse documentation, guides, and research for wallets, cards, ramps, and related crypto access products.',
  keywords: [
    'crypto product documentation',
    'wallet comparison guides',
    'hardware wallet reviews',
    'crypto card comparison',
    'ramp comparison',
    'developer crypto guide',
  ],
  openGraph: {
    title: 'Documentation | Wallet Radar',
    description: 'Browse documentation, guides, and research for wallets, cards, ramps, and related crypto access products.',
    url: `${baseUrl}/docs/`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.svg?${ogImageVersion}`,
        width: 1200,
        height: 630,
        alt: 'Wallet Radar Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | Wallet Radar',
    description: 'Browse documentation, guides, and research for crypto access products.',
    creator: '@chimeradefi',
    site: '@chimeradefi',
    images: [`${baseUrl}/og-image.svg?${ogImageVersion}`],
  },
  alternates: {
    canonical: `${baseUrl}/docs/`,
  },
};

export default function DocsPage() {
  const documents = getAllDocuments();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={[{ label: 'Docs', href: '/docs' }]} />

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">Documentation</h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Browse documentation, guides, and research materials for wallets, cards, ramps, and related crypto access products.
          Our resources help developers make informed decisions with transparent methodology and source-backed data.
        </p>
      </header>

      <DocsContent documents={documents} />
    </div>
  );
}
