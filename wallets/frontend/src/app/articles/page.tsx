import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/articles';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleCard } from '@/components/ArticleCard';

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Articles', href: '/articles' },
        ]}
      />

      {/* Header */}
      <div className="mt-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">Wallet Comparison Articles</h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Expert guides, detailed comparisons, and practical advice for choosing the right crypto wallet.
          Compare features, security, and developer experience across hardware and software wallets.
        </p>
      </div>

      {/* Comparison Articles */}
      {comparisonArticles.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-100">
            <span className="inline-block w-1 h-6 bg-sky-400 rounded"></span>
            Wallet Comparisons
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comparisonArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                slug={article.slug}
                category={article.category}
                title={article.title}
                description={article.description}
                lastUpdated={article.lastUpdated}
                content={article.content}
                wallets={article.wallets}
                variant="full"
              />
            ))}
          </div>
        </section>
      )}

      {/* Guide Articles */}
      {guideArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-100">
            <span className="inline-block w-1 h-6 bg-sky-400 rounded"></span>
            Wallet Guides
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guideArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                slug={article.slug}
                category={article.category}
                title={article.title}
                description={article.description}
                lastUpdated={article.lastUpdated}
                content={article.content}
                wallets={article.wallets}
                variant="full"
              />
            ))}
          </div>
        </section>
      )}

      {/* No articles fallback */}
      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No articles available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
