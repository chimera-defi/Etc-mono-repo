import type { Metadata } from 'next';
import { getAllDocuments } from '@/lib/markdown';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DocsContent } from './DocsContent';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Browse all wallet comparison documentation, guides, and research. Find software wallet comparisons, hardware wallet reviews, and developer guides.',
  keywords: [
    'crypto wallet documentation',
    'wallet comparison guides',
    'hardware wallet reviews',
    'software wallet comparison',
    'developer wallet guide',
  ],
  openGraph: {
    title: 'Documentation | Wallet Radar',
    description: 'Browse all wallet comparison documentation, guides, and research. Find software wallet comparisons, hardware wallet reviews, and developer guides.',
    url: `${baseUrl}/docs/`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Wallet Radar Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | Wallet Radar',
    description: 'Browse all wallet comparison documentation, guides, and research.',
    images: [`${baseUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${baseUrl}/docs/`,
  },
};

export default function DocsPage() {
  const documents = getAllDocuments();

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Docs', href: '/docs' }]} />
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse all wallet comparison documentation, guides, and research materials. 
          Our comprehensive resources help developers make informed decisions about crypto wallets.
        </p>
      </header>

      <DocsContent documents={documents} />
    </div>
  );
}
