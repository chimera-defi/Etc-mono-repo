import { getAllWalletData } from './wallet-data';
import { getAllDocuments } from './markdown';
import { getAllArticles } from './articles';

export type SearchResultType = 'wallet' | 'doc' | 'article' | 'faq';
export type WalletCategory = 'software' | 'hardware' | 'cards' | 'ramps';

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  content: string; // Full searchable text
  type: SearchResultType;
  category?: string;
  url: string;
  score?: number; // Wallet score if applicable
  tags?: string[];
}

// FAQ data for search (duplicated from FAQ component to avoid client/server issues)
const faqItems = [
  {
    question: 'What is a crypto wallet?',
    answer: 'A crypto wallet is software or hardware that stores your private keys and lets you send, receive, and manage cryptocurrencies.',
    category: 'basics',
  },
  {
    question: 'How do I connect my wallet to a dApp?',
    answer: 'To connect your wallet to a decentralized application (dApp): Visit the dApp website, Click "Connect Wallet" button, Select your wallet from the list, Approve the connection.',
    category: 'basics',
  },
  {
    question: "What's the difference between a hot wallet and cold wallet?",
    answer: 'Hot wallets are connected to the internet (browser extensions, mobile apps). Cold wallets (hardware wallets) store keys offline, providing maximum security.',
    category: 'basics',
  },
  {
    question: 'What is a seed phrase and why is it important?',
    answer: 'A seed phrase (recovery phrase) is a 12-24 word sequence that can restore your wallet if you lose access. NEVER share it with anyone.',
    category: 'security',
  },
  {
    question: 'How do I know if a wallet is secure?',
    answer: 'Look for: Open source code, Third-party security audits, Active development, Strong track record, Good community reputation.',
    category: 'security',
  },
  {
    question: 'What is transaction simulation and why does it matter?',
    answer: 'Transaction simulation shows you exactly what will happen before you sign a transaction—which tokens will leave/enter your wallet.',
    category: 'security',
  },
  {
    question: 'What are the signs of a wallet scam?',
    answer: 'Red flags include: Requests for your seed phrase, Fake wallet apps, Phishing sites, Unsolicited DMs, "Customer support" asking for private keys.',
    category: 'security',
  },
  {
    question: 'What is Wallet Radar?',
    answer: 'Wallet Radar is a developer-focused platform for comparing crypto wallets with evidence-based scoring using GitHub activity, security audits, and developer experience metrics.',
    category: 'comparison',
  },
  {
    question: 'How are wallet scores calculated?',
    answer: 'Scores are based on: Security (audits, open source), Developer UX (APIs, testnets), Activity (GitHub commits, releases), and Coverage (chains, platforms).',
    category: 'comparison',
  },
  {
    question: "What's the best wallet for developers?",
    answer: 'For EVM development, Rabby leads with transaction simulation and scam alerts. For multi-chain, Trust Wallet covers the most ecosystems.',
    category: 'comparison',
  },
  {
    question: 'What is EIP-7702 and why does it matter?',
    answer: 'EIP-7702 allows regular accounts to temporarily act like smart contract wallets, enabling gas sponsorship, batched transactions, and social recovery.',
    category: 'technical',
  },
  {
    question: "What's the difference between EOA and smart contract wallets?",
    answer: 'EOA wallets are controlled by a private key. Smart contract wallets are programmable, offering multi-sig, spending limits, and social recovery.',
    category: 'technical',
  },
];

/**
 * Generate search data from all content sources
 * This runs at build time via the component's data loading
 */
export function generateSearchData(): SearchItem[] {
  const items: SearchItem[] = [];

  // Add wallet data
  const { software, hardware, cards, ramps } = getAllWalletData();

  software.forEach((wallet) => {
    items.push({
      id: `software-${wallet.id}`,
      title: wallet.name,
      description: wallet.bestFor || 'Software wallet',
      content: `${wallet.name} ${wallet.bestFor || ''} software wallet ${wallet.chains.raw || ''} ${wallet.accountTypes?.join(' ') || ''}`.toLowerCase(),
      type: 'wallet',
      category: 'software',
      url: `/wallets/software/${wallet.id}`,
      score: wallet.score,
      tags: ['software', 'wallet', ...(wallet.accountTypes || [])],
    });
  });

  hardware.forEach((wallet) => {
    items.push({
      id: `hardware-${wallet.id}`,
      title: wallet.name,
      description: `Hardware wallet - ${wallet.priceText || 'Price varies'}`,
      content: `${wallet.name} hardware wallet cold storage ${wallet.connectivity?.join(' ') || ''} ${wallet.display || ''}`.toLowerCase(),
      type: 'wallet',
      category: 'hardware',
      url: `/wallets/hardware/${wallet.id}`,
      score: wallet.score,
      tags: ['hardware', 'wallet', 'cold storage'],
    });
  });

  cards.forEach((card) => {
    items.push({
      id: `card-${card.id}`,
      title: card.name,
      description: card.bestFor || `${card.cardType} crypto card`,
      content: `${card.name} ${card.cardType} crypto card ${card.rewards || ''} ${card.region || ''} ${card.bestFor || ''}`.toLowerCase(),
      type: 'wallet',
      category: 'cards',
      url: `/wallets/cards/${card.id}`,
      score: card.score,
      tags: ['card', 'crypto card', card.cardType],
    });
  });

  ramps.forEach((ramp) => {
    items.push({
      id: `ramp-${ramp.id}`,
      title: ramp.name,
      description: ramp.bestFor || `${ramp.rampType} service`,
      content: `${ramp.name} ${ramp.rampType} on-ramp off-ramp ${ramp.coverage || ''} ${ramp.bestFor || ''}`.toLowerCase(),
      type: 'wallet',
      category: 'ramps',
      url: `/wallets/ramps/${ramp.id}`,
      score: ramp.score,
      tags: ['ramp', ramp.rampType],
    });
  });

  // Add documentation
  const documents = getAllDocuments();
  documents.forEach((doc) => {
    items.push({
      id: `doc-${doc.slug}`,
      title: doc.title,
      description: doc.description,
      content: `${doc.title} ${doc.description} ${doc.content.slice(0, 500)}`.toLowerCase(),
      type: 'doc',
      category: doc.category,
      url: `/docs/${doc.slug}`,
      tags: [doc.category, 'documentation'],
    });
  });

  // Add articles
  const articles = getAllArticles();
  articles.forEach((article) => {
    items.push({
      id: `article-${article.slug}`,
      title: article.title,
      description: article.description,
      content: `${article.title} ${article.description} ${article.content.slice(0, 500)}`.toLowerCase(),
      type: 'article',
      category: article.category,
      url: `/articles/${article.slug}`,
      tags: article.tags || [article.category],
    });
  });

  // Add FAQ items
  faqItems.forEach((faq, index) => {
    items.push({
      id: `faq-${index}`,
      title: faq.question,
      description: faq.answer.slice(0, 150) + '...',
      content: `${faq.question} ${faq.answer}`.toLowerCase(),
      type: 'faq',
      category: faq.category,
      url: `/#faq`,
      tags: ['faq', faq.category],
    });
  });

  return items;
}

/**
 * Search function with relevance ranking
 */
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  // Score each item
  const scored = items.map((item) => {
    let relevance = 0;

    // Exact title match (highest priority)
    if (item.title.toLowerCase() === normalizedQuery) {
      relevance += 100;
    }
    // Title starts with query
    else if (item.title.toLowerCase().startsWith(normalizedQuery)) {
      relevance += 50;
    }
    // Title contains query
    else if (item.title.toLowerCase().includes(normalizedQuery)) {
      relevance += 30;
    }

    // Word-by-word matching
    queryWords.forEach((word) => {
      if (word.length < 2) return;

      // Title word match
      if (item.title.toLowerCase().includes(word)) {
        relevance += 20;
      }
      // Description match
      if (item.description.toLowerCase().includes(word)) {
        relevance += 10;
      }
      // Content match
      if (item.content.includes(word)) {
        relevance += 5;
      }
      // Tag match
      if (item.tags?.some((tag) => tag.toLowerCase().includes(word))) {
        relevance += 8;
      }
    });

    // Boost based on item type priority
    if (item.type === 'wallet') relevance += 5;
    if (item.type === 'doc') relevance += 3;

    // Boost based on wallet score
    if (item.score && item.score > 80) relevance += 3;

    return { item, relevance };
  });

  // Filter and sort by relevance
  return scored
    .filter((s) => s.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 20)
    .map((s) => s.item);
}

/**
 * Get search data - cached for reuse
 */
let cachedSearchData: SearchItem[] | null = null;

export function getSearchData(): SearchItem[] {
  if (!cachedSearchData) {
    cachedSearchData = generateSearchData();
  }
  return cachedSearchData;
}
