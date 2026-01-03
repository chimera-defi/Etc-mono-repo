import { MetadataRoute } from 'next';
import { getAllDocuments } from '@/lib/markdown';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const documents = getAllDocuments();
  const currentDate = new Date();

  // Static pages with high priority
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/docs/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

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
    const isComparisonTable = !doc.slug.includes('-details') && ['software-wallets', 'hardware-wallets', 'crypto-cards'].includes(doc.slug);
    const isComparisonDetails = doc.slug.includes('-details');

    return {
      url: `${baseUrl}/docs/${doc.slug}/`,
      lastModified,
      changeFrequency: doc.category === 'comparison' ? 'weekly' : 'monthly',
      priority: isComparisonTable ? 0.9 : isComparisonDetails ? 0.85 : 0.7,
    };
  });

  return [
    ...staticRoutes,
    ...documentRoutes,
  ];
}
