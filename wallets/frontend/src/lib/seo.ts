/**
 * SEO utility functions
 */

/**
 * Get page-specific OG image based on slug
 * Falls back to default og-image.png if no specific image exists
 */
export function getOgImagePath(slug: string): string {
  const imageMap: Record<string, string> = {
    // Software wallet pages
    'wallet-comparison-unified-table': '/og-software-wallets.png',
    'wallet-comparison-unified': '/og-software-wallets.png',
    'wallet-comparison-unified-details': '/og-software-wallets.png',
    // Hardware wallet pages
    'hardware-wallet-comparison-table': '/og-hardware-wallets.png',
    'hardware-wallet-comparison': '/og-hardware-wallets.png',
    'hardware-wallet-comparison-details': '/og-hardware-wallets.png',
    // Crypto card pages
    'crypto-credit-card-comparison-table': '/og-crypto-cards.png',
    'crypto-credit-card-comparison': '/og-crypto-cards.png',
    'crypto-credit-card-comparison-details': '/og-crypto-cards.png',
  };
  return imageMap[slug] || '/og-image.png';
}

/**
 * Generate UTM-tagged URL for social sharing and campaign tracking
 */
export function generateUtmUrl(
  baseUrl: string,
  path: string,
  params: {
    source: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'other';
    medium?: 'social' | 'email' | 'cpc' | 'organic';
    campaign?: string;
    content?: string;
  }
): string {
  const url = new URL(path, baseUrl);
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium || 'social');
  if (params.campaign) {
    url.searchParams.set('utm_campaign', params.campaign);
  }
  if (params.content) {
    url.searchParams.set('utm_content', params.content);
  }
  return url.toString();
}

/**
 * Generate social sharing URLs for different platforms
 */
export function getSocialShareUrls(
  pageUrl: string,
  title: string,
  description?: string
): {
  twitter: string;
  facebook: string;
  linkedin: string;
  email: string;
} {
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
  };
}

/**
 * Calculate reading time in minutes based on word count
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(content: string): number {
  // Remove markdown syntax, HTML tags, and extra whitespace
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/[#*\-_=~>|]/g, '') // Remove markdown formatting
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute average
  
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}

/**
 * Truncate text to optimal length for meta descriptions (150-160 chars)
 */
export function optimizeMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Try to cut at sentence boundary
  const truncated = text.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Generate dynamic keywords based on document content and title
 */
export function generateKeywords(
  title: string, 
  category: string, 
  content: string
): string[] {
  // Base keywords that apply to all pages
  const baseKeywords = [
    'crypto wallet',
    'blockchain wallet',
    'Web3 wallet',
  ];
  
  // Category-specific keywords
  const categoryKeywords: Record<string, string[]> = {
    comparison: [
      'wallet comparison',
      'wallet review',
      'best crypto wallet',
      'wallet ranking',
    ],
    guide: [
      'wallet guide',
      'crypto tutorial',
      'wallet setup',
    ],
    research: [
      'wallet research',
      'wallet analysis',
      'crypto security',
    ],
    other: [],
  };
  
  // Content-based keywords detection
  const contentKeywords: string[] = [];
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Hardware vs Software detection
  if (titleLower.includes('hardware') || contentLower.includes('hardware wallet')) {
    contentKeywords.push('hardware wallet', 'cold storage', 'crypto hardware');
  }
  if (titleLower.includes('software') || (!titleLower.includes('hardware') && contentLower.includes('browser extension'))) {
    contentKeywords.push('software wallet', 'hot wallet', 'browser wallet');
  }
  
  // Platform detection
  if (contentLower.includes('evm') || contentLower.includes('ethereum')) {
    contentKeywords.push('EVM wallet', 'Ethereum wallet');
  }
  
  // Feature detection
  if (contentLower.includes('metamask')) {
    contentKeywords.push('MetaMask alternative');
  }
  if (contentLower.includes('transaction simulation') || contentLower.includes('tx simulation')) {
    contentKeywords.push('transaction simulation wallet');
  }
  if (contentLower.includes('developer') || titleLower.includes('developer')) {
    contentKeywords.push('developer wallet', 'dApp testing wallet');
  }
  if (contentLower.includes('security audit')) {
    contentKeywords.push('audited wallet', 'secure crypto wallet');
  }
  if (contentLower.includes('trezor')) {
    contentKeywords.push('Trezor', 'Trezor alternative');
  }
  if (contentLower.includes('ledger')) {
    contentKeywords.push('Ledger', 'Ledger alternative');
  }
  if (contentLower.includes('rabby')) {
    contentKeywords.push('Rabby wallet');
  }
  
  // Combine and dedupe
  const allKeywords = [
    ...baseKeywords,
    ...(categoryKeywords[category] || []),
    ...contentKeywords,
  ];
  
  // Remove duplicates and limit to 15 keywords
  return Array.from(new Set(allKeywords)).slice(0, 15);
}

/**
 * Extract wallet names from markdown content for structured data
 */
export function extractWalletNames(content: string): string[] {
  const walletMatches = content.match(/\|\s+\*\*([^*]+)\*\*\s+\|/g) || [];
  return walletMatches
    .map(match => match.replace(/\|\s+\*\*|\*\*\s+\|/g, '').trim())
    .filter(name => name.length > 0 && name.length < 50);
}

/**
 * Generate OG image URL for a document
 * 
 * This function generates a URL for Open Graph images. For static exports,
 * it returns the default OG image. For server deployments, it can be 
 * extended to use dynamic OG image generation via @vercel/og or similar.
 * 
 * @param title - The page title
 * @param category - The document category
 * @param baseUrl - The base URL of the site
 * @returns The OG image URL
 */
export function getOgImageUrl(
  title: string,
  category: string,
  baseUrl: string
): string {
  // For static export, return the default OG image
  // In a server environment, this could be extended to use dynamic generation:
  // return `${baseUrl}/api/og?title=${encodeURIComponent(title)}&category=${category}`;
  
  return `${baseUrl}/og-image.png`;
}

/**
 * Generate structured data for a wallet comparison page
 */
export function generateComparisonSchema(
  title: string,
  description: string,
  url: string,
  walletNames: string[],
  lastUpdated?: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    url: url,
    numberOfItems: walletNames.length,
    dateModified: lastUpdated ? new Date(lastUpdated).toISOString() : new Date().toISOString(),
    itemListElement: walletNames.slice(0, 20).map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': name.toLowerCase().includes('trezor') || 
                 name.toLowerCase().includes('ledger') ||
                 name.toLowerCase().includes('keystone')
          ? 'Product'
          : 'SoftwareApplication',
        name: name,
        description: `Featured in ${title}`,
      },
    })),
  };
}
