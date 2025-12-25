import { MetadataRoute } from 'next';
import { getAllDocuments } from '@/lib/markdown';
import {
  parseSoftwareWallets,
  parseHardwareWallets,
  parseCryptoCards,
} from '@/lib/wallet-data';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

// Category slugs for programmatic SEO pages
const CATEGORY_SLUGS = [
  // Software wallet categories
  'tx-simulation',
  'scam-protection',
  'open-source',
  'hardware-support',
  'mobile-wallets',
  'browser-extension',
  'desktop-wallets',
  'multi-chain',
  'active-development',
  // Hardware wallet categories
  'air-gapped',
  'secure-element',
  'open-source-hardware',
  'budget-hardware',
  // Crypto card categories
  'high-cashback',
  'no-annual-fee',
  'us-crypto-cards',
  'eu-crypto-cards',
  'business-crypto-cards',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const documents = getAllDocuments();
  const softwareWallets = parseSoftwareWallets();
  const hardwareWallets = parseHardwareWallets();
  const cryptoCards = parseCryptoCards();
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

  // Document pages
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
    const isComparisonTable = doc.slug.includes('-table');
    const isComparisonDetails = doc.slug.includes('-details');

    return {
      url: `${baseUrl}/docs/${doc.slug}/`,
      lastModified,
      changeFrequency: doc.category === 'comparison' ? 'weekly' : 'monthly',
      priority: isComparisonTable ? 0.9 : isComparisonDetails ? 0.85 : 0.7,
    };
  });

  // Category pages - programmatic SEO
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/category/${slug}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Individual software wallet pages
  const softwareWalletRoutes: MetadataRoute.Sitemap = softwareWallets.map((wallet) => ({
    url: `${baseUrl}/wallet/software/${wallet.id}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: wallet.recommendation === 'recommended' ? 0.75 : 0.65,
  }));

  // Individual hardware wallet pages
  const hardwareWalletRoutes: MetadataRoute.Sitemap = hardwareWallets.map((wallet) => ({
    url: `${baseUrl}/wallet/hardware/${wallet.id}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: wallet.recommendation === 'recommended' ? 0.75 : 0.65,
  }));

  // Individual crypto card pages
  const cardRoutes: MetadataRoute.Sitemap = cryptoCards.map((card) => ({
    url: `${baseUrl}/wallet/card/${card.id}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: card.recommendation === 'recommended' ? 0.75 : 0.65,
  }));

  return [
    ...staticRoutes,
    ...documentRoutes,
    ...categoryRoutes,
    ...softwareWalletRoutes,
    ...hardwareWalletRoutes,
    ...cardRoutes,
  ];
}
