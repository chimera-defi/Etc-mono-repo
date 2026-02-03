import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { ArrowLeft, Clock, User, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { getArticleBySlug, getArticleSlugs, getRelatedArticles } from '@/lib/articles';
import { calculateReadingTime, formatReadingTime, optimizeMetaDescription, extractFAQsFromMarkdown, extractHowToSteps, generateFAQSchema, generateHowToSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { EnhancedMarkdownRenderer } from '@/components/EnhancedMarkdownRenderer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SocialShare } from '@/components/SocialShare';

interface PageProps {
  params: {
    slug: string;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

// Generate static params for all articles
export async function generateStaticParams() {
  const slugs = getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found | Wallet Radar',
      description: 'The article you requested could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = `${baseUrl}/articles/${params.slug}/`;
  const enhancedDescription = optimizeMetaDescription(article.description);

  return {
    title: `${article.title} | Wallet Radar`,
    description: enhancedDescription,
    keywords: [...(article.wallets || []), ...(article.tags || []), 'crypto wallet', 'ethereum', 'web3'].join(', '),
    openGraph: {
      title: article.title,
      description: enhancedDescription,
      url: pageUrl,
      type: 'article',
      publishedTime: article.lastUpdated,
      authors: [article.author],
      tags: article.tags,
      images: [
        {
          url: `${baseUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: enhancedDescription,
      creator: '@chimeradefi',
      site: '@chimeradefi',
      images: [`${baseUrl}/og-image.svg`],
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

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const pageUrl = `${baseUrl}/articles/${params.slug}/`;
  const enhancedDescription = optimizeMetaDescription(article.description);
  const relatedArticles = getRelatedArticles(params.slug, 3);

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { label: 'Home', href: '/' },
    { label: 'Articles', href: '/articles' },
    { label: article.title, href: `/articles/${params.slug}` },
  ], baseUrl);

  // Extract and generate FAQ schema
  const faqs = extractFAQsFromMarkdown(article.content);
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  const howToSteps = article.category === 'guide' ? extractHowToSteps(article.content) : [];
  const howToSchema = howToSteps.length > 0
    ? generateHowToSchema(article.title, enhancedDescription, howToSteps)
    : null;

  // Article structured data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: enhancedDescription,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wallet Radar',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
    },
    datePublished: article.lastUpdated,
    dateModified: article.lastUpdated,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    keywords: [...(article.wallets || []), ...(article.tags || [])].join(', '),
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <Script
          id="howto-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Articles', href: '/articles' },
            { label: article.title, href: `/articles/${params.slug}` },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-8 mt-6">
          {/* Main Content */}
          <article className="min-w-0">
            {/* Header */}
            <header className="mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={article.lastUpdated}>{new Date(article.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{formatReadingTime(calculateReadingTime(article.content))}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{article.description}</p>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Sharing */}
              <SocialShare
                url={pageUrl}
                title={article.title}
                description={enhancedDescription}
                size="large"
              />
            </header>

            {/* Content */}
            <EnhancedMarkdownRenderer
              content={article.content}
              showExpandableSections={false}
            />

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-border">
              <div className="mb-6">
                <SocialShare
                  url={pageUrl}
                  title={article.title}
                  description={enhancedDescription}
                  size="large"
                />
              </div>

              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </Link>
            </footer>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Author Card */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-sm mb-2">About the Author</h3>
                <p className="text-sm text-muted-foreground">
                  {article.author} - Expert analysis of crypto wallets for developers
                </p>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold text-sm mb-3">Related Articles</h3>
                  <ul className="space-y-3">
                    {relatedArticles.map((related) => (
                      <li key={related.slug}>
                        <Link
                          href={`/articles/${related.slug}`}
                          className="text-sm hover:text-primary transition-colors block"
                        >
                          <span className="line-clamp-2">{related.title}</span>
                          <span className="text-xs text-muted-foreground capitalize mt-1 block">
                            {related.category}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Featured Wallets */}
              {article.wallets && article.wallets.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold text-sm mb-3">Featured Wallets</h3>
                  <ul className="space-y-2">
                    {article.wallets.map((wallet) => (
                      <li key={wallet} className="text-sm text-muted-foreground">
                        {wallet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
