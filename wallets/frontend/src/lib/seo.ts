/**
 * SEO utility functions
 */

/**
 * Get page-specific OG image based on slug.
 * Falls back to the default og-image.svg if no specific image exists.
 */
export function getOgImagePath(slug: string): string {
  const imageMap: Record<string, string> = {
    'software-wallets': '/og-image.svg',
    'software-wallets-details': '/og-image.svg',
    'hardware-wallets': '/og-image.svg',
    'hardware-wallets-details': '/og-image.svg',
    'crypto-cards': '/og-image.svg',
    'crypto-cards-details': '/og-image.svg',
    'ramps': '/og-image.svg',
    'ramps-details': '/og-image.svg',
  };
  return imageMap[slug] || '/og-image.svg';
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
  
  // Ramp detection
  if (titleLower.includes('ramp') || contentLower.includes('on-ramp') || contentLower.includes('off-ramp')) {
    contentKeywords.push('crypto ramp', 'on-ramp', 'off-ramp', 'fiat on-ramp', 'fiat off-ramp', 'crypto payment gateway');
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
 * Generate keywords for wallet profile pages.
 */
export function generateWalletKeywords(
  name: string,
  type: 'software' | 'hardware' | 'cards' | 'ramps'
): string[] {
  const baseKeywords = [
    name,
    'wallet comparison',
    'crypto wallet',
    'developer wallet',
    'wallet score',
  ];

  const typeKeywords: Record<typeof type, string[]> = {
    software: ['software wallet', 'browser extension wallet', 'mobile wallet'],
    hardware: ['hardware wallet', 'cold storage', 'secure element'],
    cards: ['crypto card', 'cashback card', 'crypto credit card', 'crypto debit card'],
    ramps: ['crypto ramp', 'on-ramp', 'off-ramp', 'fiat on-ramp', 'fiat off-ramp'],
  };

  return Array.from(new Set([...baseKeywords, ...typeKeywords[type]])).slice(0, 15);
}

/**
 * Convert markdown content to plain text for schema.org articleBody
 * Preserves readability while removing markdown syntax
 */
export function markdownToPlainText(content: string): string {
  return content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Convert markdown links to text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Remove headers but keep text
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove table formatting
    .replace(/\|/g, ' ')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}
