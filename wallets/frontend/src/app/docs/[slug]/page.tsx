import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { ArrowLeft, Clock, BookOpen, ExternalLink, FileText, Table } from 'lucide-react';
import Link from 'next/link';
import { getAllDocuments, getDocumentBySlug, getDocumentSlugs, extractTableOfContents, getRelatedDocument } from '@/lib/markdown';
import { calculateReadingTime, formatReadingTime, optimizeMetaDescription, generateKeywords } from '@/lib/seo';
import { EnhancedMarkdownRenderer } from '@/components/EnhancedMarkdownRenderer';
import { TableOfContents } from '@/components/TableOfContents';
import { Breadcrumbs } from '@/components/Breadcrumbs';

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
          url: `${baseUrl}/og-image.png`,
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
      images: [`${baseUrl}/og-image.png`],
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

  // Check if this is a table or details page and get the related one
  const isTablePage = document.slug.includes('-table');
  const isDetailsPage = document.slug.includes('-details');
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

  // Breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: document.title,
        item: pageUrl,
      },
    ],
  };

  // Article structured data for comparison pages
  const articleSchema = document.category === 'comparison' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: document.title,
    description: enhancedDescription,
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
        url: `${baseUrl}/logo.png`,
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
    name: `${document.title} - Wallet Comparison`,
    description: enhancedDescription,
    numberOfItems: document.content.match(/\|\s+\*\*[^|]+\*\*\s+\|/g)?.length || 0,
    itemListElement: (() => {
      const walletMatches = document.content.match(/\|\s+\*\*([^*]+)\*\*\s+\|/g) || [];
      return walletMatches.slice(0, 10).map((match, index) => {
        const walletName = match.replace(/\|\s+\*\*|\*\*\s+\|/g, '').trim();
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': walletName.toLowerCase().includes('trezor') || walletName.toLowerCase().includes('ledger') 
              ? 'Product' 
              : 'SoftwareApplication',
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
        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTablePage ? (
                <>
                  <Table className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Viewing comparison table</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Viewing full documentation</span>
                </>
              )}
            </div>
            <Link
              href={`/docs/${relatedDoc.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
          <header className="mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{document.title}</h1>
            <p className="text-lg text-muted-foreground">{document.description}</p>
          </header>

          {/* Content */}
          <EnhancedMarkdownRenderer 
            content={document.content} 
            showExpandableSections={document.category === 'comparison'}
          />

          {/* Footer Navigation */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <a
                  href="https://walletbeat.fyi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  WalletBeat
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://ethereum.org/en/wallets/find-wallet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
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
            <div className="mt-8 pt-8 border-t border-border">
              <p className="font-semibold text-sm mb-3">Related</p>
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
  const isTablePage = currentSlug.includes('-table');
  const isDetailsPage = currentSlug.includes('-details');
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
            className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
          >
            <span className="line-clamp-2">{doc.title}</span>
            <span className="text-xs text-muted-foreground/70 capitalize">
              {doc.category}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
