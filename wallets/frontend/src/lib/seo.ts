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

/**
 * Generate BreadcrumbList schema for improved navigation understanding by search engines and LLMs.
 * Helps with entity recognition and site structure comprehension.
 *
 * @param breadcrumbs - Array of breadcrumb items with label and href
 * @param baseUrl - Base URL of the site (e.g., 'https://walletradar.org')
 * @returns BreadcrumbList schema object
 *
 * @example
 * ```ts
 * const schema = generateBreadcrumbSchema([
 *   { label: 'Home', href: '/' },
 *   { label: 'Software Wallets', href: '/docs/software-wallets' },
 *   { label: 'Rabby Wallet', href: '/wallets/software/rabby-wallet' }
 * ], 'https://walletradar.org');
 * ```
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ label: string; href: string }>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${baseUrl}${crumb.href}`,
    })),
  };
}

/**
 * Generate FAQ schema for a list of questions and answers.
 * Critical for AEO (Answer Engine Optimization) - helps LLMs extract Q&A pairs.
 *
 * @param faqs - Array of FAQ items with question and answer
 * @returns FAQPage schema object
 *
 * @example
 * ```ts
 * const schema = generateFAQSchema([
 *   {
 *     question: 'Is Rabby Wallet better than MetaMask?',
 *     answer: 'Rabby Wallet scores 92/100 vs MetaMask 84/100. Rabby offers transaction simulation and scam detection...'
 *   }
 * ]);
 * ```
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Extract HowTo steps from markdown content.
 * Looks for headings like "### Step 1: Title" or "### Step 1".
 */
export function extractHowToSteps(content: string): Array<{ name: string; text: string }> {
  const lines = content.split('\n');
  const steps: Array<{ name: string; text: string }> = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    const match = line.match(/^###\s+Step\s+\d+\s*:?(\s+.*)?$/i);
    if (match) {
      const name = match[1]?.trim() || line.replace(/^###\s+/, '');
      let text = '';
      for (let j = i + 1; j < lines.length; j += 1) {
        const next = lines[j].trim();
        if (next.startsWith('### ')) break;
        if (next.length > 0) {
          text = next;
          break;
        }
      }
      steps.push({ name, text });
    }
  }

  return steps;
}

/**
 * Generate HowTo schema for step-based guides.
 */
export function generateHowToSchema(
  title: string,
  description: string,
  steps: Array<{ name: string; text: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text || step.name,
    })),
  };
}

/**
 * Extract FAQ questions and answers from markdown content.
 * Parses "## Frequently Asked Questions" sections with H3 questions and paragraph answers.
 * Critical for converting markdown FAQs into FAQPage schema for AEO.
 *
 * @param content - Markdown content containing FAQ section
 * @returns Array of FAQ items with question and answer
 *
 * @example
 * ```ts
 * const content = `
 * ## Frequently Asked Questions
 *
 * ### What is the best wallet?
 *
 * Rabby Wallet (92/100) is the best choice...
 * `;
 * const faqs = extractFAQsFromMarkdown(content);
 * // Returns: [{ question: 'What is the best wallet?', answer: 'Rabby Wallet (92/100)...' }]
 * ```
 */
export function extractFAQsFromMarkdown(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  // Find the FAQ section
  const faqSectionMatch = content.split(/## Frequently Asked Questions/i);
  if (faqSectionMatch.length < 2) return [];

  const faqSection = faqSectionMatch[1];

  // Match ### Question followed by answer paragraph(s)
  // Stops at next ### or ## heading
  const questionRegex = /###\s+(.+?)\n\n([\s\S]+?)(?=\n###|\n##|$)/g;
  const matches = Array.from(faqSection.matchAll(questionRegex));

  for (const match of matches) {
    const question = match[1].trim();
    let answer = match[2].trim();

    // Clean up answer text for schema
    // Remove markdown bold/italic
    answer = answer.replace(/\*\*([^*]+)\*\*/g, '$1');
    answer = answer.replace(/\*([^*]+)\*/g, '$1');
    // Remove markdown links but keep text
    answer = answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Normalize whitespace
    answer = answer.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    // Limit length to 1000 chars for schema (LLMs prefer concise answers)
    if (answer.length > 1000) {
      answer = answer.substring(0, 997) + '...';
    }

    faqs.push({ question, answer });
  }

  return faqs;
}

/**
 * Interface for wallet data used in Product schema generation
 */
interface WalletSchemaData {
  name: string;
  score: number;
  url?: string;
  github?: string;
  description?: string;
  company?: string;
  price?: number;
  platforms?: string[];
  features?: string[];
  releaseFrequency?: number;
  openSource?: string | boolean;
  secureElement?: boolean;
  secureElementType?: string;
  connectivity?: string[];
}

/**
 * Generate enhanced Product/SoftwareApplication schema for wallet profiles.
 * Includes rich metadata for better LLM comprehension and citation accuracy.
 *
 * @param wallet - Wallet data object
 * @param type - Type of wallet (software, hardware, cards, ramps)
 * @param pageUrl - Full URL of the wallet profile page
 * @returns Product or SoftwareApplication schema object
 *
 * @example
 * ```ts
 * const schema = generateWalletProductSchema({
 *   name: 'Rabby Wallet',
 *   score: 92,
 *   url: 'https://rabby.io',
 *   platforms: ['Web', 'Desktop', 'Mobile'],
 *   features: ['Transaction Simulation', 'Scam Detection', 'Multi-chain Support']
 * }, 'software', 'https://walletradar.org/wallets/software/rabby-wallet');
 * ```
 */
export function generateWalletProductSchema(
  wallet: WalletSchemaData,
  type: 'software' | 'hardware' | 'cards' | 'ramps',
  pageUrl: string
) {
  const baseSchema = {
    '@context': 'https://schema.org',
    name: wallet.name,
    url: pageUrl,
    description: wallet.description || `${wallet.name} - Developer-focused crypto wallet with score ${wallet.score}/100`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: wallet.score.toString(),
      bestRating: '100',
      worstRating: '0',
      ratingCount: '1',
      reviewCount: '1',
    },
  };

  if (type === 'software') {
    return {
      ...baseSchema,
      '@type': 'SoftwareApplication',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Cryptocurrency Wallet',
      operatingSystem: wallet.platforms?.join(', ') || 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      featureList: wallet.features || [],
      downloadUrl: wallet.url,
      softwareVersion: 'Latest',
      releaseNotes: wallet.releaseFrequency
        ? `Approximately ${wallet.releaseFrequency} releases per month`
        : undefined,
      author: wallet.company ? {
        '@type': 'Organization',
        name: wallet.company,
      } : undefined,
      codeRepository: wallet.github,
      keywords: `crypto wallet, blockchain wallet, ${wallet.name}, web3 wallet`,
    };
  }

  if (type === 'hardware') {
    return {
      ...baseSchema,
      '@type': 'Product',
      category: 'Hardware Wallet',
      brand: wallet.company ? {
        '@type': 'Brand',
        name: wallet.company,
      } : {
        '@type': 'Brand',
        name: wallet.name.split(' ')[0],
      },
      offers: {
        '@type': 'Offer',
        price: wallet.price?.toString() || undefined,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      additionalProperty: [
        ...(wallet.secureElement ? [{
          '@type': 'PropertyValue',
          name: 'Secure Element',
          value: wallet.secureElementType || 'Yes',
        }] : []),
        ...(wallet.openSource ? [{
          '@type': 'PropertyValue',
          name: 'Open Source',
          value: typeof wallet.openSource === 'string' ? wallet.openSource : 'Yes',
        }] : []),
        ...(wallet.connectivity && wallet.connectivity.length > 0 ? [{
          '@type': 'PropertyValue',
          name: 'Connectivity',
          value: wallet.connectivity.join(', '),
        }] : []),
      ].filter(Boolean),
      material: 'Electronics',
      audience: {
        '@type': 'PeopleAudience',
        audienceType: 'Cryptocurrency Developers and Investors',
      },
    };
  }

  if (type === 'cards') {
    return {
      ...baseSchema,
      '@type': 'FinancialProduct',
      category: 'Crypto Credit Card',
      provider: wallet.company ? {
        '@type': 'Organization',
        name: wallet.company,
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: wallet.features || [],
    };
  }

  // Ramps
  return {
    ...baseSchema,
    '@type': 'Service',
    serviceType: 'Crypto On/Off Ramp',
    provider: wallet.company ? {
      '@type': 'Organization',
      name: wallet.company,
    } : undefined,
    areaServed: 'Global',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: wallet.url,
    },
  };
}
