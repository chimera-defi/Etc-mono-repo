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
  'WALLET_COMPARISON_UNIFIED_TABLE.md': {
    title: 'Software Wallet Comparison',
    description: 'Developer-focused comparison of 24 EVM wallets with scoring, security audits, and recommendations',
    category: 'comparison',
    order: 1,
  },
  'WALLET_COMPARISON_UNIFIED_DETAILS.md': {
    title: 'Software Wallet Comparison - Details',
    description: 'Full documentation with recommendations, methodology, security audits, and more',
    category: 'comparison',
    order: 1,
  },
  'HARDWARE_WALLET_COMPARISON_TABLE.md': {
    title: 'Hardware Wallet Comparison',
    description: 'Cold storage comparison of 23 hardware wallets with security features and GitHub metrics',
    category: 'comparison',
    order: 2,
  },
  'HARDWARE_WALLET_COMPARISON_DETAILS.md': {
    title: 'Hardware Wallet Comparison - Details',
    description: 'Full documentation with recommendations, methodology, security deep dive, and more',
    category: 'comparison',
    order: 2,
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
  'walletconnect-wallet-research.md': {
    title: 'WalletConnect Research',
    description: 'Original detailed research on WalletConnect-compatible wallets',
    category: 'research',
    order: 3,
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
    order: 6,
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
      const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : undefined;
      
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
    'wallet-comparison-unified-table': { table: 'wallet-comparison-unified-table', details: 'wallet-comparison-unified-details' },
    'wallet-comparison-unified-details': { table: 'wallet-comparison-unified-table', details: 'wallet-comparison-unified-details' },
    'hardware-wallet-comparison-table': { table: 'hardware-wallet-comparison-table', details: 'hardware-wallet-comparison-details' },
    'hardware-wallet-comparison-details': { table: 'hardware-wallet-comparison-table', details: 'hardware-wallet-comparison-details' },
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
  lastUpdated: string;
} {
  const softwareDoc = documents.find(d => d.slug === 'wallet-comparison-unified-table' || d.slug === 'wallet-comparison-unified-details');
  const hardwareDoc = documents.find(d => d.slug === 'hardware-wallet-comparison-table' || d.slug === 'hardware-wallet-comparison-details');
  
  // Count wallets from tables (rough estimate from content)
  const softwareCount = softwareDoc?.content.match(/\|\s+\*\*[^|]+\*\*\s+\|/g)?.length || 24;
  const hardwareCount = hardwareDoc?.content.match(/\|\s+\[?\*\*[^|]+\*\*\]?\s+\|/g)?.length || 23;
  
  const latestUpdate = documents
    .filter(d => d.lastUpdated)
    .map(d => d.lastUpdated!)
    .sort()
    .pop() || 'December 2025';
  
  return {
    softwareWallets: softwareCount,
    hardwareWallets: hardwareCount,
    lastUpdated: latestUpdate,
  };
}
