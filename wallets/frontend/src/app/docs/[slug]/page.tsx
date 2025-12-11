import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getAllDocuments, getDocumentBySlug, getDocumentSlugs, extractTableOfContents } from '@/lib/markdown';
import { EnhancedMarkdownRenderer } from '@/components/EnhancedMarkdownRenderer';
import { TableOfContents } from '@/components/TableOfContents';

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
export async function generateMetadata({ params }: PageProps) {
  const document = getDocumentBySlug(params.slug);
  
  if (!document) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${document.title} - Wallet Comparison`,
    description: document.description,
  };
}

export default function DocumentPage({ params }: PageProps) {
  const document = getDocumentBySlug(params.slug);
  
  if (!document) {
    notFound();
  }

  const toc = extractTableOfContents(document.content);
  const filteredToc = toc.filter(item => item.level <= 2);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
        {/* Main Content */}
        <article className="min-w-0">
          {/* Header */}
          <header className="mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <BookOpen className="h-4 w-4" />
              <span className="capitalize">{document.category}</span>
              {document.lastUpdated && (
                <>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{document.lastUpdated}</span>
                </>
              )}
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
  );
}

function RelatedDocuments({ currentSlug }: { currentSlug: string }) {
  const documents = getAllDocuments();
  const related = documents
    .filter((doc) => doc.slug !== currentSlug)
    .slice(0, 3);

  return (
    <ul className="space-y-2">
      {related.map((doc) => (
        <li key={doc.slug}>
          <Link
            href={`/docs/${doc.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {doc.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
