import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
import { getAllArticles } from '@/lib/articles';
import { calculateReadingTime, formatReadingTime } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

export const metadata: Metadata = {
  title: 'Articles | Wallet Radar',
  description: 'Expert guides and comparisons for crypto wallets. Learn about wallet security, compare features, and find the best wallet for your needs.',
  openGraph: {
    title: 'Wallet Comparison Articles | Wallet Radar',
    description: 'Expert guides and comparisons for crypto wallets. Compare wallets, learn about security, and make informed decisions.',
    url: `${baseUrl}/articles/`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'Wallet Radar Articles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wallet Comparison Articles | Wallet Radar',
    description: 'Expert guides and comparisons for crypto wallets.',
    creator: '@chimeradefi',
    site: '@chimeradefi',
    images: [`${baseUrl}/og-image.svg`],
  },
  alternates: {
    canonical: `${baseUrl}/articles/`,
  },
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const comparisonArticles = articles.filter(a => a.category === 'comparison');
  const guideArticles = articles.filter(a => a.category === 'guide');

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Articles', href: '/articles' },
        ]}
      />

      {/* Header */}
      <div className="mt-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Wallet Comparison Articles</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Expert guides, detailed comparisons, and practical advice for choosing the right crypto wallet.
          Compare features, security, and developer experience across hardware and software wallets.
        </p>
      </div>

      {/* Comparison Articles */}
      {comparisonArticles.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded"></span>
            Wallet Comparisons
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comparisonArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Guide Articles */}
      {guideArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded"></span>
            Wallet Guides
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guideArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* No articles fallback */}
      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: ReturnType<typeof getAllArticles>[0] }) {
  const readingTime = calculateReadingTime(article.content);

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all"
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs capitalize">
          {article.category}
        </span>
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatReadingTime(readingTime)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
        {article.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {article.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(article.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {article.wallets && article.wallets.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {article.wallets.length} wallet{article.wallets.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Read More */}
      <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
        Read Article
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
