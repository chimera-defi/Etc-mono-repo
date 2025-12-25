/**
 * Centralized SEO Configuration
 * All SEO-related constants and utilities in one place
 */

// Site configuration
export const SITE_CONFIG = {
  name: 'Wallet Radar',
  tagline: 'Developer-Focused Crypto Wallet Research',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org',
  author: 'Chimera DeFi',
  email: 'chimera_deFi@protonmail.com',
  twitter: '@chimeradefi',
  github: 'https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets',
  ogImageVersion: 'v3',
} as const;

// Default metadata values
export const DEFAULT_METADATA = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
  description: 'Comprehensive comparison of software and hardware crypto wallets for developers. Find stable MetaMask alternatives with scoring, security audits, GitHub activity tracking, and developer experience benchmarks. Compare 24+ EVM wallets and 23+ hardware wallets.',
  keywords: [
    'crypto wallet',
    'MetaMask alternative',
    'hardware wallet',
    'Rabby wallet',
    'Trezor',
    'Ledger',
    'wallet comparison',
    'EVM wallet',
    'Ethereum wallet',
    'Web3 wallet',
    'crypto wallet security',
    'developer wallet',
    'wallet audit',
    'blockchain wallet',
    'DeFi wallet',
  ],
} as const;

// Category-specific SEO configurations
export const CATEGORY_SEO = {
  software: {
    title: 'Software Wallets',
    description: 'Compare 24+ EVM-compatible software wallets. Find the best MetaMask alternatives with transaction simulation, scam alerts, and active development.',
    keywords: ['software wallet', 'hot wallet', 'browser wallet', 'MetaMask alternative', 'EVM wallet'],
    ogImage: '/og-software-wallets-table.png',
  },
  hardware: {
    title: 'Hardware Wallets',
    description: 'Compare 23+ hardware wallets for secure crypto storage. Find the best cold storage devices with open-source firmware, secure elements, and air-gap support.',
    keywords: ['hardware wallet', 'cold storage', 'Trezor', 'Ledger', 'crypto hardware'],
    ogImage: '/og-hardware-wallets-table.png',
  },
  cards: {
    title: 'Crypto Cards',
    description: 'Compare 27+ crypto credit and debit cards. Find the best cashback rewards, lowest fees, and regional availability.',
    keywords: ['crypto card', 'crypto credit card', 'crypto debit card', 'cashback crypto'],
    ogImage: '/og-crypto-cards-table.png',
  },
} as const;

// Wallet type display names and descriptions
export const WALLET_TYPE_CONFIG = {
  software: {
    singular: 'Software Wallet',
    plural: 'Software Wallets',
    description: 'Hot wallets for daily use and development',
    icon: 'shield',
  },
  hardware: {
    singular: 'Hardware Wallet',
    plural: 'Hardware Wallets',
    description: 'Cold storage devices for secure long-term storage',
    icon: 'cpu',
  },
  card: {
    singular: 'Crypto Card',
    plural: 'Crypto Cards',
    description: 'Credit and debit cards for spending crypto',
    icon: 'credit-card',
  },
} as const;

// Recommendation labels and colors
export const RECOMMENDATION_CONFIG = {
  recommended: {
    label: 'Recommended',
    color: 'green',
    description: 'Excellent choice for most users',
    emoji: '🟢',
  },
  situational: {
    label: 'Situational',
    color: 'yellow',
    description: 'Good for specific use cases',
    emoji: '🟡',
  },
  avoid: {
    label: 'Avoid',
    color: 'red',
    description: 'Not recommended due to issues',
    emoji: '🔴',
  },
  'not-for-dev': {
    label: 'Not for Developers',
    color: 'gray',
    description: 'May work but lacks developer features',
    emoji: '⚪',
  },
} as const;

// Feature labels for internal linking
export const FEATURE_PAGES = {
  'tx-simulation': {
    title: 'Transaction Simulation',
    description: 'Wallets with transaction preview and simulation capabilities',
    filter: { txSimulation: true },
  },
  'scam-alerts': {
    title: 'Scam Protection',
    description: 'Wallets with built-in scam detection and alerts',
    filter: { scamAlerts: ['full', 'partial'] },
  },
  'open-source': {
    title: 'Open Source Wallets',
    description: 'Fully open source wallets with transparent code',
    filter: { license: ['open'] },
  },
  'hardware-support': {
    title: 'Hardware Wallet Support',
    description: 'Software wallets that support hardware wallet integration',
    filter: { hardwareSupport: true },
  },
  'mobile-wallets': {
    title: 'Mobile Wallets',
    description: 'Wallets with mobile app support',
    filter: { platforms: ['mobile'] },
  },
  'browser-extension': {
    title: 'Browser Extension Wallets',
    description: 'Wallets available as browser extensions',
    filter: { platforms: ['browser'] },
  },
  'desktop-wallets': {
    title: 'Desktop Wallets',
    description: 'Wallets with native desktop applications',
    filter: { platforms: ['desktop'] },
  },
  'air-gap': {
    title: 'Air-Gapped Hardware Wallets',
    description: 'Hardware wallets with air-gap security for maximum protection',
    filter: { airGap: true },
  },
  'secure-element': {
    title: 'Secure Element Hardware Wallets',
    description: 'Hardware wallets with dedicated secure elements',
    filter: { secureElement: true },
  },
} as const;

// Region labels for crypto cards
export const REGION_CONFIG = {
  US: { name: 'United States', emoji: '🇺🇸' },
  EU: { name: 'European Union', emoji: '🇪🇺' },
  UK: { name: 'United Kingdom', emoji: '🇬🇧' },
  CA: { name: 'Canada', emoji: '🇨🇦' },
  AU: { name: 'Australia', emoji: '🇦🇺' },
  Global: { name: 'Global', emoji: '🌍' },
} as const;

// Generate absolute URL
export function getAbsoluteUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

// Generate OG image URL with cache busting
export function getOgImageUrl(imagePath: string): string {
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SITE_CONFIG.url}${cleanPath}?${SITE_CONFIG.ogImageVersion}`;
}

// Generate canonical URL
export function getCanonicalUrl(path: string): string {
  const url = getAbsoluteUrl(path);
  // Ensure trailing slash for consistency
  return url.endsWith('/') ? url : `${url}/`;
}

// Generate wallet page URL
export function getWalletUrl(type: 'software' | 'hardware' | 'card', id: string): string {
  return `/wallet/${type}/${id}`;
}

// Generate category page URL
export function getCategoryUrl(category: string): string {
  return `/category/${category}`;
}

// Generate feature page URL
export function getFeatureUrl(feature: string): string {
  return `/feature/${feature}`;
}

// Score to rating conversion (for structured data)
export function scoreToRating(score: number): { value: string; scale: number } {
  const rating = (score / 100) * 5;
  return {
    value: rating.toFixed(1),
    scale: 5,
  };
}

// Generate keywords for a wallet
export function generateWalletKeywords(
  name: string,
  type: 'software' | 'hardware' | 'card',
  features: string[] = []
): string[] {
  const baseKeywords = [
    name,
    `${name} review`,
    `${name} wallet`,
    'crypto wallet',
  ];

  const typeKeywords = {
    software: ['software wallet', 'hot wallet', 'browser wallet', 'MetaMask alternative'],
    hardware: ['hardware wallet', 'cold storage', 'crypto hardware'],
    card: ['crypto card', 'crypto credit card', 'crypto debit card'],
  };

  return [...baseKeywords, ...typeKeywords[type], ...features].slice(0, 15);
}

// Truncate description for meta tags
export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

// Generate structured data for a wallet product
export function generateWalletSchema(wallet: {
  name: string;
  type: 'software' | 'hardware' | 'card';
  score: number;
  description: string;
  url: string;
  features?: string[];
}) {
  const rating = scoreToRating(wallet.score);
  const isProduct = wallet.type === 'hardware' || wallet.type === 'card';

  if (isProduct) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: wallet.name,
      description: wallet.description,
      category: WALLET_TYPE_CONFIG[wallet.type].singular,
      brand: {
        '@type': 'Brand',
        name: wallet.name.split(' ')[0], // First word as brand
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        ratingCount: '1',
        bestRating: '5',
        worstRating: '1',
      },
      review: {
        '@type': 'Review',
        author: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
        },
        datePublished: new Date().toISOString().split('T')[0],
        reviewBody: wallet.description,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating.value,
          bestRating: '5',
        },
      },
    };
  }

  // Software wallet as SoftwareApplication
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: wallet.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, Desktop, Mobile',
    description: wallet.description,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.value,
      ratingCount: '1',
      bestRating: '5',
      worstRating: '1',
    },
    review: {
      '@type': 'Review',
      author: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
      datePublished: new Date().toISOString().split('T')[0],
      reviewBody: wallet.description,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rating.value,
        bestRating: '5',
      },
    },
  };
}
