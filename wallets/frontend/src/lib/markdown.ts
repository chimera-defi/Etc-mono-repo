import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Path to markdown files (one level up from frontend)
const CONTENT_DIR = path.join(process.cwd(), '..');

export interface MarkdownDocument {
  slug: string;
  title: string;
  description: string;
  content: string;
  lastUpdated?: string;
  category: 'comparison' | 'research' | 'guide' | 'other';
  order: number;
}

// Define the markdown files we want to process and their metadata
const DOCUMENT_CONFIG: Record<string, Omit<MarkdownDocument, 'slug' | 'content'>> = {
  'SOFTWARE_WALLETS.md': {
    title: 'Software Wallet Comparison',
    description: 'Developer-focused comparison of software wallets with scoring, security audits, and recommendations',
    category: 'comparison',
    order: 1,
  },
  'SOFTWARE_WALLETS_DETAILS.md': {
    title: 'Software Wallet Comparison - Details',
    description: 'Full documentation with recommendations, methodology, security audits, and more',
    category: 'comparison',
    order: 1,
  },
  'HARDWARE_WALLETS.md': {
    title: 'Hardware Wallet Comparison',
    description: 'Cold storage comparison of hardware wallets with security features and GitHub metrics',
    category: 'comparison',
    order: 2,
  },
  'HARDWARE_WALLETS_DETAILS.md': {
    title: 'Hardware Wallet Comparison - Details',
    description: 'Full documentation with recommendations, methodology, security deep dive, and more',
    category: 'comparison',
    order: 2,
  },
  'CRYPTO_CARDS.md': {
    title: 'Crypto Credit Card Comparison',
    description: 'Comparison of crypto credit cards.',
    category: 'comparison',
    order: 3,
  },
  'CRYPTO_CARDS_DETAILS.md': {
    title: 'Crypto Credit Card Comparison - Details',
    description: 'Full documentation with card reviews, scoring methodology, business support, and recommendations',
    category: 'comparison',
    order: 3,
  },
  'RAMPS.md': {
    title: 'Crypto On/Off-Ramp Comparison',
    description: 'Comparison of crypto on-ramp and off-ramp providers with fees, coverage, and developer experience.',
    category: 'comparison',
    order: 4,
  },
  'RAMPS_DETAILS.md': {
    title: 'Crypto On/Off-Ramp Comparison - Details',
    description: 'Full documentation with provider reviews, integration guides, fee analysis, and recommendations',
    category: 'comparison',
    order: 4,
  },
  'README.md': {
    title: 'Overview',
    description: 'Wallet research documentation hub - quick recommendations and data sources',
    category: 'guide',
    order: 0,
  },
  'CONTRIBUTING.md': {
    title: 'Contributing Guide',
    description: 'How to add new wallets and contribute to the comparison',
    category: 'guide',
    order: 5,
  },
  'ABOUT.md': {
    title: 'About Wallet Radar',
    description: 'Educational research platform for wallet comparison. Independent, non-affiliated, and open source.',
    category: 'guide',
    order: 6,
  },
  'DATA_SOURCES.md': {
    title: 'Data Sources & External Links',
    description: 'Transparency about external links, data verification, and link tracking. Why we link to wallet sites and how to verify information.',
    category: 'guide',
    order: 6.5,
  },
  'walletconnect-wallet-research.md': {
    title: 'WalletConnect Research',
    description: 'Original detailed research on WalletConnect-compatible wallets',
    category: 'research',
    order: 4,
  },
  'HARDWARE_WALLET_RESEARCH_TASKS.md': {
    title: 'Hardware Wallet Research Tasks',
    description: 'Ongoing research tasks for hardware wallet analysis',
    category: 'research',
    order: 4,
  },
  'CHANGELOG.md': {
    title: 'Changelog',
    description: 'Track significant changes to wallet statuses, recommendations, and documentation structure',
    category: 'guide',
    order: 7,
  },
};

export function getMarkdownFiles(): string[] {
  return Object.keys(DOCUMENT_CONFIG);
}

export function getAllDocuments(): MarkdownDocument[] {
  const files = getMarkdownFiles();
  
  const documents = files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { content } = matter(fileContent);
      
      const config = DOCUMENT_CONFIG[filename];
      const slug = filename.replace('.md', '').toLowerCase().replace(/_/g, '-');
      
      // Extract last updated from content if present
      const lastUpdatedMatch = content.match(/Last [Uu]pdated:?\s*([^\n\|]+)/);
      const lastUpdatedRaw = lastUpdatedMatch 
        ? lastUpdatedMatch[1].replace(/^\*+\s*/, '').replace(/\*+$/, '').trim() // Strip markdown bold/italic
        : undefined;
      
      // Extract just the date portion (e.g., "December 16, 2025" or "December 2025")
      // This handles formats like "December 16, 2025. Full validation..." or just "December 2025"
      const dateOnlyMatch = lastUpdatedRaw?.match(/^((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2},?\s+)?\d{4})/i);
      const lastUpdated = dateOnlyMatch ? dateOnlyMatch[1] : lastUpdatedRaw;
      
      return {
        slug,
        content,
        lastUpdated,
        ...config,
      } as MarkdownDocument;
    })
    .filter((doc): doc is MarkdownDocument => doc !== null)
    .sort((a, b) => a.order - b.order);
  
  return documents;
}

export function getDocumentBySlug(slug: string): MarkdownDocument | null {
  const documents = getAllDocuments();
  return documents.find((doc) => doc.slug === slug) || null;
}

// Helper to get related document (table/details)
export function getRelatedDocument(slug: string, type: 'table' | 'details'): MarkdownDocument | null {
  const documents = getAllDocuments();
  
  // Map slugs to their related documents
  const relatedMap: Record<string, { table: string; details: string }> = {
    'software-wallets': { table: 'software-wallets', details: 'software-wallets-details' },
    'software-wallets-details': { table: 'software-wallets', details: 'software-wallets-details' },
    'hardware-wallets': { table: 'hardware-wallets', details: 'hardware-wallets-details' },
    'hardware-wallets-details': { table: 'hardware-wallets', details: 'hardware-wallets-details' },
    'crypto-cards': { table: 'crypto-cards', details: 'crypto-cards-details' },
    'crypto-cards-details': { table: 'crypto-cards', details: 'crypto-cards-details' },
    'ramps': { table: 'ramps', details: 'ramps-details' },
    'ramps-details': { table: 'ramps', details: 'ramps-details' },
  };
  
  const related = relatedMap[slug];
  if (!related) return null;
  
  const targetSlug = type === 'table' ? related.table : related.details;
  return documents.find((doc) => doc.slug === targetSlug) || null;
}

export function getDocumentSlugs(): string[] {
  return getAllDocuments().map((doc) => doc.slug);
}

// Extract table of contents from markdown
export function extractTableOfContents(content: string): { id: string; title: string; level: number }[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: { id: string; title: string; level: number }[] = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    toc.push({ id, title, level });
  }
  
  return toc;
}

// Get statistics from the markdown content
export function getWalletStats(documents: MarkdownDocument[]): {
  softwareWallets: number;
  hardwareWallets: number;
  cryptoCards: number;
  ramps: number;
  lastUpdated: string;
} {
  const softwareDoc = documents.find(d => d.slug === 'software-wallets' || d.slug === 'software-wallets-details');
  const hardwareDoc = documents.find(d => d.slug === 'hardware-wallets' || d.slug === 'hardware-wallets-details');
  const cryptoCardDoc = documents.find(d => d.slug === 'crypto-cards' || d.slug === 'crypto-cards-details');
  const rampsDoc = documents.find(d => d.slug === 'ramps' || d.slug === 'ramps-details');

  // Count wallets from tables by matching data rows with name + numeric score
  // Pattern: | **Name** | Score | or | [**Name**](url) | Score 🟢 | (handles links, emojis, strikethrough)
  // Software: | **Rabby** | 92 | ✅ |
  const softwareCount = softwareDoc?.content.match(/^\|\s*\*\*[A-Z][^*|]+\*\*\s*\|\s*\d+\s*\|/gm)?.length || 0;
  // Hardware: | **Trezor Safe 5** | 94 | or | ~~**Device**~~ | 50 |
  const hardwareCount = hardwareDoc?.content.match(/^\|\s*(?:~~)?\[?\*\*[A-Z][^*|]+\*\*\]?(?:\([^)]*\))?(?:~~)?\s*\|\s*\d+\s*\|/gm)?.length || 0;
  // Crypto cards: | [**1inch Card**](url) | 70 🟡 | (score followed by emoji)
  const cryptoCardCount = cryptoCardDoc?.content.match(/^\|\s*(?:~~)?\[?\*\*[A-Z0-9][^*|]+\*\*\]?(?:\([^)]*\))?(?:~~)?\s*\|\s*\d+\s*[🟢🟡🔴]?\s*\|/gm)?.length || 0;
  // Ramps: | [**Transak**](url) | 92 🟢 | (score followed by emoji)
  const rampsCount = rampsDoc?.content.match(/^\|\s*(?:~~)?\[?\*\*[A-Z][^*|]+\*\*\]?(?:\([^)]*\))?(?:~~)?\s*\|\s*\d+\s*[🟢🟡🔴]?\s*\|/gm)?.length || 0;

  const latestUpdate = documents
    .filter(d => d.lastUpdated)
    .map(d => d.lastUpdated!)
    .sort()
    .pop() || 'December 2025';

  return {
    softwareWallets: softwareCount,
    hardwareWallets: hardwareCount,
    cryptoCards: cryptoCardCount,
    ramps: rampsCount,
    lastUpdated: latestUpdate,
  };
}
