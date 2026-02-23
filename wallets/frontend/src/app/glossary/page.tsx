import type { Metadata } from 'next';
import Script from 'next/script';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getDocumentBySlug } from '@/lib/markdown';
import { EnhancedMarkdownRenderer } from '@/components/EnhancedMarkdownRenderer';
import { optimizeMetaDescription, generateBreadcrumbSchema } from '@/lib/seo';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

export const metadata: Metadata = {
  title: 'Glossary | Wallet Radar',
  description: 'Definitions of key wallet and crypto terms used across Wallet Radar.',
  alternates: { canonical: `${baseUrl}/glossary/` },
};

export default function GlossaryPage() {
  const doc = getDocumentBySlug('glossary');
  const description = optimizeMetaDescription(doc?.description || 'Definitions of key wallet and crypto terms.');

  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: 'Home', href: '/' },
    { label: 'Glossary', href: '/glossary' },
  ], baseUrl);

  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Wallet Radar Glossary',
    description,
    url: `${baseUrl}/glossary/`,
    hasDefinedTerm: [
      { '@type': 'DefinedTerm', name: 'EOA', description: 'Externally Owned Account controlled by a private key.' },
      { '@type': 'DefinedTerm', name: 'Account Abstraction', description: 'Smart contract wallets enabling batch transactions and gas sponsorship.' },
      { '@type': 'DefinedTerm', name: 'EIP-7702', description: 'Allows EOAs to temporarily act like smart contract accounts for batched actions.' },
      { '@type': 'DefinedTerm', name: 'Multi-sig', description: 'Wallets that require multiple approvals to move funds.' },
      { '@type': 'DefinedTerm', name: 'Transaction Simulation', description: 'Preview of transaction effects before signing.' },
      { '@type': 'DefinedTerm', name: 'Scam/Phishing Detection', description: 'Warnings about suspicious contracts or approvals.' },
      { '@type': 'DefinedTerm', name: 'Hardware Wallet', description: 'Dedicated device that stores keys offline.' },
      { '@type': 'DefinedTerm', name: 'Software Wallet', description: 'Wallet that stores keys in software (mobile/browser).' },
      { '@type': 'DefinedTerm', name: 'On-ramp', description: 'Service converting fiat to crypto.' },
      { '@type': 'DefinedTerm', name: 'Off-ramp', description: 'Service converting crypto to fiat.' },
      { '@type': 'DefinedTerm', name: 'Canonical URL', description: 'Primary URL search engines should index.' },
      { '@type': 'DefinedTerm', name: 'JSON-LD', description: 'Structured data format used for SEO schemas.' },
    ],
  };

  if (!doc) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-100">Glossary</h1>
        <p className="text-slate-300 mt-4">Glossary not found.</p>
      </div>
    );
  }

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="definedterm-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Glossary', href: '/glossary' }]} />
        <article className="prose prose-invert max-w-3xl">
          <EnhancedMarkdownRenderer content={doc.content} />
        </article>
      </div>
    </>
  );
}
