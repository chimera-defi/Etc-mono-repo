import { MetadataRoute } from 'next';
import { getAllDocuments } from '@/lib/markdown';
import { getAllWalletData } from '@/lib/wallet-data';
import { getAllArticles } from '@/lib/articles';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const documents = getAllDocuments();
  const articles = getAllArticles();
  const currentDate = new Date();

  // Static pages with high priority
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/articles/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/glossary/`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/companies/`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/merchant-center.xml`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.2,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.2,
    },
  ];

  // Article pages - high priority for SEO/AEO content
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    let lastModified = currentDate;
    if (article.lastUpdated) {
      try {
        const parsedDate = new Date(article.lastUpdated);
        if (!isNaN(parsedDate.getTime())) {
          lastModified = parsedDate;
        }
      } catch {
        // Keep default date if parsing fails
      }
    }

    // Comparison articles get higher priority
    const priority = article.category === 'comparison' ? 0.9 : 0.85;

    return {
      url: `${baseUrl}/articles/${article.slug}/`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority,
    };
  });

  // Document pages - these have substantial unique content
  const documentRoutes: MetadataRoute.Sitemap = documents.map((doc) => {
    let lastModified = currentDate;
    if (doc.lastUpdated) {
      try {
        const parsedDate = new Date(doc.lastUpdated);
        if (!isNaN(parsedDate.getTime())) {
          lastModified = parsedDate;
        }
      } catch {
        // Keep default date if parsing fails
      }
    }

    // Higher priority for comparison tables, lower for other docs
    // New naming: software-wallets (table), software-wallets-details (details)
    const isComparisonTable = !doc.slug.includes('-details') && ['software-wallets', 'hardware-wallets', 'crypto-cards', 'ramps'].includes(doc.slug);
    const isComparisonDetails = doc.slug.includes('-details');

    const changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] =
      doc.category === 'comparison' ? 'weekly' : 'monthly';

    return {
      url: `${baseUrl}/docs/${doc.slug}/`,
      lastModified,
      changeFrequency,
      priority: isComparisonTable ? 0.9 : isComparisonDetails ? 0.85 : 0.7,
    };
  });

  const { software, hardware, cards, ramps } = getAllWalletData();
  const walletRoutes: MetadataRoute.Sitemap = [
    ...software.map(wallet => ({
      url: `${baseUrl}/wallets/software/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...hardware.map(wallet => ({
      url: `${baseUrl}/wallets/hardware/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...cards.map(wallet => ({
      url: `${baseUrl}/wallets/cards/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...ramps.map(wallet => ({
      url: `${baseUrl}/wallets/ramps/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...documentRoutes,
    ...walletRoutes,
  ];
}
