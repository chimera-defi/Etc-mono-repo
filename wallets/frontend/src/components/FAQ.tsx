'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: 'basics' | 'security' | 'comparison' | 'technical';
}

const faqData: FAQItem[] = [
  // Basics
  {
    question: 'What is a crypto wallet?',
    answer: 'A crypto wallet is software or hardware that stores your private keys and lets you send, receive, and manage cryptocurrencies. It doesn\'t actually store your coins—those live on the blockchain. Instead, it holds the keys that prove you own them. Think of it like a keychain for your digital assets.',
    category: 'basics',
  },
  {
    question: 'How do I connect my wallet to a dApp?',
    answer: 'To connect your wallet to a decentralized application (dApp): 1) Visit the dApp website, 2) Click "Connect Wallet" button, 3) Select your wallet from the list (e.g., MetaMask, Rabby), 4) Approve the connection in your wallet popup, 5) Review and confirm any permissions. Always verify you\'re on the correct website before connecting.',
    category: 'basics',
  },
  {
    question: 'What\'s the difference between a hot wallet and cold wallet?',
    answer: 'Hot wallets are connected to the internet (browser extensions, mobile apps) and are convenient for daily use. Cold wallets (hardware wallets) store keys offline, providing maximum security for long-term storage. For best security, use hot wallets for small amounts and cold wallets for larger holdings.',
    category: 'basics',
  },
  {
    question: 'What is a seed phrase and why is it important?',
    answer: 'A seed phrase (recovery phrase) is a 12-24 word sequence that can restore your wallet if you lose access. It\'s the master key to all your funds. NEVER share it with anyone, store it offline in multiple secure locations, and never enter it on any website. Anyone with your seed phrase can steal all your assets.',
    category: 'security',
  },
  // Security
  {
    question: 'How do I know if a wallet is secure?',
    answer: 'Look for: 1) Open source code that can be audited, 2) Third-party security audits, 3) Active development and bug bounties, 4) Strong track record without major hacks, 5) Good reputation in the developer community. Our comparison tables score these factors for each wallet.',
    category: 'security',
  },
  {
    question: 'What is transaction simulation and why does it matter?',
    answer: 'Transaction simulation shows you exactly what will happen before you sign a transaction—which tokens will leave/enter your wallet, gas costs, and potential risks. Wallets like Rabby offer this feature to help you avoid scams and mistakes. It\'s especially valuable when interacting with unfamiliar contracts.',
    category: 'security',
  },
  {
    question: 'What are the signs of a wallet scam?',
    answer: 'Red flags include: 1) Requests for your seed phrase, 2) Fake wallet apps/extensions, 3) Phishing sites mimicking official wallets, 4) Unsolicited DMs offering help, 5) "Customer support" asking for private keys. Always download wallets from official sources and never share your seed phrase.',
    category: 'security',
  },
  // Comparison
  {
    question: 'What is Wallet Radar?',
    answer: 'Wallet Radar is a developer-focused platform for comparing crypto wallets. We provide evidence-based scoring using GitHub activity, security audits, release frequency, and developer experience metrics. All data is public, verifiable, and affiliate links (if used) are disclosed.',
    category: 'comparison',
  },
  {
    question: 'How are wallet scores calculated?',
    answer: 'Scores are based on: Security (audits, open source, track record), Developer UX (APIs, testnets, custom RPC), Activity (GitHub commits, release frequency), and Coverage (chains, platforms). Higher scores indicate better overall quality for developers. See our methodology page for details.',
    category: 'comparison',
  },
  {
    question: 'What\'s the best wallet for developers?',
    answer: 'For EVM development, Rabby (score: 92) leads with transaction simulation, scam alerts, and multi-platform support. For multi-chain development, Trust Wallet covers the most ecosystems. For maximum security, pair any software wallet with a Trezor or Ledger hardware wallet.',
    category: 'comparison',
  },
  // Technical
  {
    question: 'What is EIP-7702 and why does it matter?',
    answer: 'EIP-7702 allows regular accounts (EOAs) to temporarily act like smart contract wallets, enabling features like gas sponsorship, batched transactions, and social recovery without migrating to a new address. Wallets supporting 7702 offer the best of both worlds.',
    category: 'technical',
  },
  {
    question: 'What\'s the difference between EOA and smart contract wallets?',
    answer: 'EOA (Externally Owned Account) wallets are controlled by a private key—simple but limited. Smart contract wallets (like Safe) are programmable, offering features like multi-sig, spending limits, and social recovery. Account abstraction (ERC-4337) brings smart wallet benefits to more users.',
    category: 'technical',
  },
];

const categoryLabels: Record<FAQItem['category'], string> = {
  basics: 'Getting Started',
  security: 'Security',
  comparison: 'About Wallet Radar',
  technical: 'Technical',
};

const categoryColors: Record<FAQItem['category'], string> = {
  basics: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  security: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  comparison: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  technical: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-700/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <ChevronDown
          className={cn(
            'h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', categoryColors[item.category])}>
              {categoryLabels[item.category]}
            </span>
          </div>
          <span className="text-slate-100 font-medium group-hover:text-sky-400 transition-colors">
            {item.question}
          </span>
        </div>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-slate-400 text-sm leading-relaxed pl-8">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<FAQItem['category'] | 'all'>('all');

  const filteredFAQs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const categories: (FAQItem['category'] | 'all')[] = ['all', 'basics', 'security', 'comparison', 'technical'];

  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-16">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-6 w-6 text-sky-400" />
        <h2 className="text-2xl font-bold text-slate-100">Frequently Asked Questions</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900/70 border border-slate-700/60 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                activeCategory === cat
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:border-slate-600'
              )}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="glass-card">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((item, index) => (
            <FAQAccordion
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))
        ) : (
          <div className="py-8 text-center text-slate-400">
            <p>No questions match your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-2 text-sky-400 hover:text-sky-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <span className="text-slate-500">Still have questions?</span>
        <a
          href="https://github.com/chimera-defi/Etc-mono-repo/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 transition-colors"
        >
          Open an issue on GitHub
        </a>
      </div>
    </section>
  );
}
