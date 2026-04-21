import type { Metadata } from 'next';
import { getAllDocuments } from '@/lib/markdown';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DocsContent } from './DocsContent';
import { brand, withBrand } from '@/lib/brand';

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
    title: withBrand('Documentation'),
    description: 'Browse documentation, guides, and research for wallets, cards, ramps, and related crypto access products.',
    url: `${brand.baseUrl}/docs/`,
    type: 'website',
    images: [
      {
        url: `${brand.baseUrl}/og-image.svg?${brand.ogImageVersion}`,
        width: 1200,
        height: 630,
        alt: `${brand.displayName} Documentation`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: withBrand('Documentation'),
    description: 'Browse documentation, guides, and research for crypto access products.',
    creator: brand.twitterHandle,
    site: brand.twitterHandle,
    images: [`${brand.baseUrl}/og-image.svg?${brand.ogImageVersion}`],
  },
  alternates: {
    canonical: `${brand.baseUrl}/docs/`,
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
