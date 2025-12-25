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

// Category-specific SEO configurations for comparison pages
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

// Wallet type display names
export const WALLET_TYPE_CONFIG = {
  software: {
    singular: 'Software Wallet',
    plural: 'Software Wallets',
    description: 'Hot wallets for daily use and development',
  },
  hardware: {
    singular: 'Hardware Wallet',
    plural: 'Hardware Wallets',
    description: 'Cold storage devices for secure long-term storage',
  },
  card: {
    singular: 'Crypto Card',
    plural: 'Crypto Cards',
    description: 'Credit and debit cards for spending crypto',
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

// Generate canonical URL with trailing slash
export function getCanonicalUrl(path: string): string {
  const url = getAbsoluteUrl(path);
  return url.endsWith('/') ? url : `${url}/`;
}

// Truncate description for meta tags (160 chars for search results)
export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

// Score to rating conversion (for structured data on comparison pages)
export function scoreToRating(score: number): { value: string; scale: number } {
  const rating = (score / 100) * 5;
  return {
    value: rating.toFixed(1),
    scale: 5,
  };
}
