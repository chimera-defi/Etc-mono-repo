import { MetadataRoute } from 'next';
import { getAllDocuments } from '@/lib/markdown';
import { getAllWalletData } from '@/lib/wallet-data';

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
    {
      url: `${baseUrl}/companies/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
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
    const isComparisonTable = !doc.slug.includes('-details') && ['software-wallets', 'hardware-wallets', 'crypto-cards', 'ramps'].includes(doc.slug);
    const isComparisonDetails = doc.slug.includes('-details');

    return {
      url: `${baseUrl}/docs/${doc.slug}/`,
      lastModified,
      changeFrequency: doc.category === 'comparison' ? 'weekly' : 'monthly',
      priority: isComparisonTable ? 0.9 : isComparisonDetails ? 0.85 : 0.7,
    };
  });

  const { software, hardware, cards, ramps } = getAllWalletData();
  const walletRoutes: MetadataRoute.Sitemap = [
    ...software.map(wallet => ({
      url: `${baseUrl}/wallets/software/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...hardware.map(wallet => ({
      url: `${baseUrl}/wallets/hardware/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...cards.map(wallet => ({
      url: `${baseUrl}/wallets/cards/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
    ...ramps.map(wallet => ({
      url: `${baseUrl}/wallets/ramps/${wallet.id}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ];

  return [
    ...staticRoutes,
    ...documentRoutes,
    ...walletRoutes,
  ];
}
