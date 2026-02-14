import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { ArrowLeft, Clock, BookOpen, ExternalLink, FileText, Table, Rss } from 'lucide-react';
import Link from 'next/link';
import { getAllDocuments, getDocumentBySlug, getDocumentSlugs, extractTableOfContents, getRelatedDocument } from '@/lib/markdown';
import { calculateReadingTime, formatReadingTime, optimizeMetaDescription, generateKeywords, getOgImagePath, markdownToPlainText, extractFAQsFromMarkdown, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { EnhancedMarkdownRenderer } from '@/components/EnhancedMarkdownRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SocialShare } from '@/components/SocialShare';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all documents
export async function generateStaticParams() {
  const slugs = getDocumentSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const document = getDocumentBySlug(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
  
  if (!document) {
    return {
      title: 'Not Found',
    };
  }

  const pageUrl = `${baseUrl}/docs/${params.slug}/`;
  const rawDescription = document.description || 
    `Comprehensive ${document.category} guide for crypto wallet comparison. ${document.title.includes('Comparison') ? 'Compare wallets with detailed scoring, security audits, and developer experience metrics.' : 'Expert insights and analysis for developers.'}`;
  const enhancedDescription = optimizeMetaDescription(rawDescription);

  // Generate dynamic keywords based on content
  const dynamicKeywords = generateKeywords(document.title, document.category, document.content);

  // Get page-specific OG image with cache-busting version parameter
  // Increment ogImageVersion when images are updated to bust Twitter/social media caches
  const ogImagePath = getOgImagePath(params.slug);
  const ogImageVersion = 'v5';
  const ogImageUrl = `${baseUrl}${ogImagePath}?${ogImageVersion}`;

  return {
    title: document.title,
    description: enhancedDescription,
    keywords: dynamicKeywords,
    openGraph: {
      title: document.title,
      description: enhancedDescription,
      url: pageUrl,
      type: 'article',
      publishedTime: document.lastUpdated || undefined,
      authors: ['Chimera DeFi'],
      tags: document.category === 'comparison' ? ['crypto', 'wallet', 'comparison', 'DeFi'] : ['crypto', 'wallet', 'guide'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: document.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: document.title,
      description: enhancedDescription,
      creator: '@chimeradefi',
      site: '@chimeradefi',
      images: [ogImageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function DocumentPage({ params }: PageProps) {
  const document = getDocumentBySlug(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';
  const siteName = 'Wallet Radar';
  
  if (!document) {
    notFound();
  }

  const toc = extractTableOfContents(document.content);
  const filteredToc = toc.filter(item => item.level <= 2);
  
  // Page URL and description
  const pageUrl = `${baseUrl}/docs/${params.slug}/`;
  const rawDescription = document.description || 
    `Comprehensive ${document.category} guide for crypto wallet comparison. ${document.title.includes('Comparison') ? 'Compare wallets with detailed scoring, security audits, and developer experience metrics.' : 'Expert insights and analysis for developers.'}`;
  const enhancedDescription = optimizeMetaDescription(rawDescription);
  const summaryText = document.description || enhancedDescription;

  // Check if this is a table or details page and get the related one
  // New naming: software-wallets (table), software-wallets-details (details)
  const isDetailsPage = document.slug.includes('-details');
  const isTablePage = !isDetailsPage && ['software-wallets', 'hardware-wallets', 'crypto-cards', 'ramps'].includes(document.slug);
  const relatedDoc = isTablePage 
    ? getRelatedDocument(document.slug, 'details')
    : isDetailsPage 
    ? getRelatedDocument(document.slug, 'table')
    : null;

  // Get related comparison docs for internal linking
  const allDocs = getAllDocuments();
  const comparisonDocs = allDocs.filter(doc => doc.category === 'comparison');

  // Parse lastUpdated to ISO format
  const parseDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString();
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch {
      // Fallback to current date if parsing fails
    }
    return new Date().toISOString();
  };

  // Breadcrumb structured data - use helper for consistency
  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: document.title, href: `/docs/${params.slug}` },
  ], baseUrl);

  // Extract FAQs from markdown content and generate FAQ schema
  const faqs = extractFAQsFromMarkdown(document.content);
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: document.title,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.speakable-summary'],
    },
  };

  // Article structured data for comparison pages
  const articleSchema = document.category === 'comparison' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: document.title,
    description: enhancedDescription,
    articleBody: markdownToPlainText(document.content),
    author: {
      '@type': 'Organization',
      name: 'Chimera DeFi',
      url: `${baseUrl}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
    },
    datePublished: parseDate(document.lastUpdated),
    dateModified: parseDate(document.lastUpdated),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  } : null;

  // HowTo schema for guide pages
  const extractHowToSteps = (content: string): Array<{ name: string; text: string }> => {
    const steps: Array<{ name: string; text: string }> = [];
    const headingSteps = content.match(/^#{2,3}\s+(.+)$/gm);
    if (headingSteps && headingSteps.length > 0) {
      headingSteps.slice(0, 5).forEach((heading) => {
        const title = heading.replace(/^#+\s+/, '').trim();
        if (title.toLowerCase().includes('step') || 
            title.toLowerCase().includes('how') ||
            title.toLowerCase().includes('guide') ||
            steps.length < 3) {
          steps.push({
            name: title,
            text: `Follow the instructions in the "${title}" section of this guide.`,
          });
        }
      });
    }
    if (steps.length === 0) {
      steps.push(
        { name: 'Review Wallet Options', text: 'Browse our comprehensive wallet comparisons to understand available options, features, and security considerations.' },
        { name: 'Evaluate Your Needs', text: 'Consider your use case: daily development, long-term storage, specific chain support, or security requirements.' },
        { name: 'Compare Features', text: 'Review scoring methodology, security audits, GitHub activity, and developer experience metrics for each wallet.' },
        { name: 'Make Your Selection', text: 'Choose a wallet that best matches your needs based on our detailed comparison and recommendations.' }
      );
    }
    return steps.slice(0, 6);
  };

  const howToSchema = document.category === 'guide' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: document.title,
    description: enhancedDescription,
    text: markdownToPlainText(document.content),
    step: extractHowToSteps(document.content).map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  } : null;

  // ItemList schema for comparison pages
  const itemListSchema = document.category === 'comparison' ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${document.title} - ${document.slug.includes('ramp') ? 'Ramp Provider' : 'Wallet'} Comparison`,
    description: enhancedDescription,
    numberOfItems: document.content.match(/\|\s+\*\*[^|]+\*\*\s+\|/g)?.length || 0,
    itemListElement: (() => {
      // Match provider names in markdown table format: | [**Name**](url) | or | **Name** |
      const walletMatches = document.content.match(/\|\s+\[?\*\*([^*]+)\*\*\]?[^|]*\s+\|/g) || [];
      return walletMatches.slice(0, 10).map((match, index) => {
        const walletName = match.replace(/\|\s+\[?\*\*|\*\*\]?[^|]*\s+\|/g, '').trim();
        // Determine item type based on document type
        const isRamp = document.slug.includes('ramp');
        const isHardware = walletName.toLowerCase().includes('trezor') || walletName.toLowerCase().includes('ledger');
        const itemType = isRamp ? 'Product' : (isHardware ? 'Product' : 'SoftwareApplication');
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': itemType,
            name: walletName,
            description: `Featured in ${document.title}`,
          },
        };
      });
    })(),
  } : null;

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {articleSchema && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {howToSchema && (
        <Script
          id="howto-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {itemListSchema && (
        <Script
          id="itemlist-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Script
        id="speakable-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Docs', href: '/docs' },
          { label: document.title, href: `/docs/${params.slug}` },
        ]}
      />
      
      {/* Navigation between table and details */}
      {relatedDoc && (
        <div className="mb-6 p-4 rounded-xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTablePage ? (
                <>
                  <Table className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Viewing comparison table</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Viewing full documentation</span>
                </>
              )}
            </div>
            <Link
              href={`/docs/${relatedDoc.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              {isTablePage ? (
                <>
                  <FileText className="h-4 w-4" />
                  View Full Documentation
                </>
              ) : (
                <>
                  <Table className="h-4 w-4" />
                  View Comparison Table
                </>
              )}
            </Link>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
        {/* Main Content */}
        <article className="min-w-0">
          {/* Header */}
          <header className="mb-8 pb-6 border-b border-slate-700/60">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3 flex-wrap">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span className="capitalize">{document.category}</span>
              {document.lastUpdated && (
                <>
                  <span aria-hidden="true">•</span>
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={parseDate(document.lastUpdated)}>{document.lastUpdated}</time>
                </>
              )}
              <span aria-hidden="true">•</span>
              <span>{formatReadingTime(calculateReadingTime(document.content))}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">{document.title}</h1>
            <p className="text-lg text-slate-400 mb-3 speakable-summary">{summaryText}</p>
            <p className="text-sm text-slate-500 mb-4">
              Summary: {enhancedDescription}
            </p>
            {/* Social Sharing - Header */}
            <SocialShare
              url={pageUrl}
              title={document.title}
              description={enhancedDescription}
              size="large"
            />
          </header>

          {/* Content */}
          <EnhancedMarkdownRenderer
            content={document.content}
            showExpandableSections={true}
            skipFirstH1={true}
          />

          {/* Merchant Feed (collapsible, for SEO agents - near footer) */}
          {(isTablePage || (isDetailsPage && ['software-wallets', 'hardware-wallets', 'crypto-cards', 'ramps'].some(s => document.slug.startsWith(s)))) && (
            <details className="mt-8 rounded-lg border border-slate-700/60 bg-slate-900/50 overflow-hidden" id="merchant-feed">
              <summary className="flex items-center gap-3 p-3 cursor-pointer list-none bg-muted/30 hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                <Rss className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden />
                <span className="font-semibold text-slate-200">Merchant Feed (SEO agents)</span>
                <span className="text-xs text-muted-foreground ml-auto">Click to expand</span>
              </summary>
              <div className="p-4 border-t border-slate-700/60 text-sm text-muted-foreground space-y-2">
                {(document.slug === 'hardware-wallets' || document.slug === 'hardware-wallets-details') ? (
                  <>
                    <p>
                      <a href={`${baseUrl}/merchant-center.xml`} className="text-sky-400 hover:text-sky-300 underline">
                        merchant-center.xml
                      </a>
                      {' — Verified USD pricing for hardware wallets. Exclusions: '}
                      <a href="https://github.com/chimera-defi/Etc-mono-repo/blob/main/wallets/MERCHANT_FEED.md" className="text-sky-400 hover:text-sky-300 underline" target="_blank" rel="noopener noreferrer">
                        MERCHANT_FEED.md
                      </a>
                    </p>
                  </>
                ) : (
                  <p>
                    Merchant feed not available for this category. The feed covers hardware wallets only.{' '}
                    <Link href="/docs/hardware-wallets#merchant-feed" className="text-sky-400 hover:text-sky-300 underline">
                      See Hardware Wallets
                    </Link>
                    {' for '}
                    <a href={`${baseUrl}/merchant-center.xml`} className="text-sky-400 hover:text-sky-300 underline">
                      merchant-center.xml
                    </a>
                    .
                  </p>
                )}
              </div>
            </details>
          )}

          {/* Footer Navigation */}
          <footer className="mt-12 pt-8 border-t border-slate-700/60">
            {/* Social Sharing - Footer */}
            <div className="mb-6 pb-6 border-b border-slate-700/60">
              <SocialShare
                url={pageUrl}
                title={document.title}
                description={enhancedDescription}
                size="large"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="https://walletbeat.fyi?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  WalletBeat
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://ethereum.org/en/wallets/find-wallet/?utm_source=walletradar&utm_medium=comparison"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Ethereum.org
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </footer>
        </article>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={filteredToc} />
            
            {/* Related Documents */}
            <div className="mt-8 pt-8 border-t border-slate-700/60">
              <p className="font-semibold text-sm mb-3 text-slate-200">Related</p>
              <RelatedDocuments currentSlug={params.slug} />
            </div>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}

function RelatedDocuments({ currentSlug }: { currentSlug: string }) {
  const documents = getAllDocuments();
  const currentDoc = documents.find(d => d.slug === currentSlug);
  
  // Exclude the related table/details page since we show navigation banner
  // New naming: software-wallets (table), software-wallets-details (details)
  const isDetailsPage = currentSlug.includes('-details');
  const isTablePage = !isDetailsPage && ['software-wallets', 'hardware-wallets', 'crypto-cards', 'ramps'].includes(currentSlug);
  const relatedDoc = isTablePage 
    ? getRelatedDocument(currentSlug, 'details')
    : isDetailsPage 
    ? getRelatedDocument(currentSlug, 'table')
    : null;
  
  // Smart related document selection
  const getRelatedDocs = () => {
    const candidates = documents.filter((doc) => {
      // Exclude current document
      if (doc.slug === currentSlug) return false;
      // Exclude related table/details page (shown in banner)
      if (relatedDoc && doc.slug === relatedDoc.slug) return false;
      return true;
    });

    // Score documents by relevance
    const scored = candidates.map(doc => {
      let score = 0;
      
      // Same category = high relevance
      if (currentDoc && doc.category === currentDoc.category) {
        score += 10;
      }
      
      // Hardware/software matching
      const currentIsHardware = currentSlug.includes('hardware');
      const docIsHardware = doc.slug.includes('hardware');
      if (currentIsHardware === docIsHardware) {
        score += 5;
      }
      
      // Comparison pages should link to guides and vice versa
      if (currentDoc?.category === 'comparison' && doc.category === 'guide') {
        score += 3;
      }
      if (currentDoc?.category === 'guide' && doc.category === 'comparison') {
        score += 3;
      }
      
      // Research pages are always relevant
      if (doc.category === 'research') {
        score += 2;
      }
      
      // Boost by order (lower order = more important)
      score += Math.max(0, 5 - doc.order);
      
      return { doc, score };
    });

    // Sort by score descending, then by order
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.doc.order - b.doc.order;
    });

    return scored.slice(0, 5).map(s => s.doc);
  };

  const related = getRelatedDocs();

  return (
    <ul className="space-y-2">
      {related.map((doc) => (
        <li key={doc.slug}>
          <Link
            href={`/docs/${doc.slug}`}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors block"
          >
            <span className="line-clamp-2">{doc.title}</span>
            <span className="text-xs text-slate-500 capitalize">
              {doc.category}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
