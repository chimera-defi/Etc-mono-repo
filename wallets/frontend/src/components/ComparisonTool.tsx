'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Check,
  Minus,
  AlertTriangle,
  ExternalLink,
  Github,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  SoftwareWallet,
  HardwareWallet,
  CryptoCard,
  WalletData,
} from './WalletTable';

interface ComparisonToolProps {
  type: 'software' | 'hardware' | 'cards';
  selectedWallets: WalletData[];
  allWallets: WalletData[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAdd: (id: string) => void;
}

// Comparison row component
function ComparisonRow({
  label,
  values,
  highlight = false,
  isBoolean = false,
}: {
  label: string;
  values: (string | number | boolean | null | undefined | React.ReactNode)[];
  highlight?: boolean;
  isBoolean?: boolean;
}) {
  // Find best value for highlighting
  const numericValues = values.map(v =>
    typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : null
  );
  const maxValue = Math.max(...numericValues.filter((v): v is number => v !== null));

  return (
    <tr className={cn('border-b border-border', highlight && 'bg-muted/30')}>
      <td className="py-3 px-4 font-medium text-sm text-muted-foreground whitespace-nowrap">
        {label}
      </td>
      {values.map((value, idx) => {
        const isMax = numericValues[idx] === maxValue && maxValue > 0;

        return (
          <td
            key={idx}
            className={cn(
              'py-3 px-4 text-center',
              isMax && 'bg-green-50 dark:bg-green-900/20'
            )}
          >
            {isBoolean ? (
              value === true ? (
                <Check className="h-5 w-5 text-green-600 mx-auto" />
              ) : value === false ? (
                <X className="h-5 w-5 text-red-500 mx-auto" />
              ) : (
                <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
              )
            ) : typeof value === 'number' ? (
              <span className={cn('font-semibold', isMax && 'text-green-600 dark:text-green-400')}>
                {value}
              </span>
            ) : value === 'full' || value === 'open' || value === 'recommended' || value === 'active' ? (
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                {value}
              </span>
            ) : value === 'partial' || value === 'situational' || value === 'slow' ? (
              <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                {value}
              </span>
            ) : value === 'avoid' || value === 'closed' || value === 'none' || value === 'inactive' ? (
              <span className="inline-flex items-center gap-1 text-red-500">
                <X className="h-4 w-4" />
                {value}
              </span>
            ) : React.isValidElement(value) ? (
              // Render React elements (like links) directly
              value
            ) : value ? (
              <span>{String(value)}</span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

// Section header
function SectionHeader({
  title,
  isOpen,
  onToggle,
  colSpan,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  colSpan: number;
}) {
  return (
    <tr className="bg-muted/50">
      <td colSpan={colSpan} className="py-2 px-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 font-semibold text-sm w-full"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {title}
        </button>
      </td>
    </tr>
  );
}

// Software wallet comparison
function SoftwareWalletComparison({
  wallets,
  onRemove,
}: {
  wallets: SoftwareWallet[];
  onRemove: (id: string) => void;
}) {
  const [sections, setSections] = useState({
    general: true,
    security: true,
    features: true,
    development: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = wallets.length + 1;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="py-4 px-4 text-left w-48">Feature</th>
          {wallets.map(wallet => (
            <th key={wallet.id} className="py-4 px-4 text-center min-w-[180px]">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{wallet.name}</span>
                  <button
                    onClick={() => onRemove(wallet.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Remove from comparison"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                    wallet.score >= 75 && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    wallet.score >= 50 && wallet.score < 75 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    wallet.score < 50 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {wallet.score}
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* General Section */}
        <SectionHeader
          title="General"
          isOpen={sections.general}
          onToggle={() => toggleSection('general')}
          colSpan={colSpan}
        />
        {sections.general && (
          <>
            <ComparisonRow label="Score" values={wallets.map(w => w.score)} highlight />
            <ComparisonRow label="Recommendation" values={wallets.map(w => w.recommendation)} />
            <ComparisonRow label="Best For" values={wallets.map(w => w.bestFor)} />
            <ComparisonRow label="Chain Support" values={wallets.map(w => typeof w.chains === 'number' ? w.chains : w.chains)} />
            <ComparisonRow label="Mobile App" values={wallets.map(w => w.devices.mobile)} isBoolean />
            <ComparisonRow label="Browser Extension" values={wallets.map(w => w.devices.browser)} isBoolean />
            <ComparisonRow label="Desktop App" values={wallets.map(w => w.devices.desktop)} isBoolean />
          </>
        )}

        {/* Security Section */}
        <SectionHeader
          title="Security & Trust"
          isOpen={sections.security}
          onToggle={() => toggleSection('security')}
          colSpan={colSpan}
        />
        {sections.security && (
          <>
            <ComparisonRow label="License" values={wallets.map(w => w.licenseType)} />
            <ComparisonRow label="Open Source" values={wallets.map(w => w.license)} />
            <ComparisonRow label="Security Audits" values={wallets.map(w => w.audits)} />
            <ComparisonRow label="Funding" values={wallets.map(w => `${w.funding} (${w.fundingSource})`)} />
            <ComparisonRow label="Tx Simulation" values={wallets.map(w => w.txSimulation)} isBoolean />
            <ComparisonRow label="Scam Alerts" values={wallets.map(w => w.scamAlerts)} />
          </>
        )}

        {/* Features Section */}
        <SectionHeader
          title="Features"
          isOpen={sections.features}
          onToggle={() => toggleSection('features')}
          colSpan={colSpan}
        />
        {sections.features && (
          <>
            <ComparisonRow label="Custom RPC" values={wallets.map(w => w.rpc)} />
            <ComparisonRow label="Testnet Support" values={wallets.map(w => w.testnets)} isBoolean />
            <ComparisonRow label="Account Types" values={wallets.map(w => w.accountTypes.join(', '))} />
            <ComparisonRow label="ENS/Naming" values={wallets.map(w => w.ensNaming)} />
            <ComparisonRow label="Hardware Wallet Support" values={wallets.map(w => w.hardwareSupport)} isBoolean />
          </>
        )}

        {/* Development Section */}
        <SectionHeader
          title="Development Activity"
          isOpen={sections.development}
          onToggle={() => toggleSection('development')}
          colSpan={colSpan}
        />
        {sections.development && (
          <>
            <ComparisonRow label="Activity Status" values={wallets.map(w => w.active)} />
            <ComparisonRow label="Releases/Month" values={wallets.map(w => w.releasesPerMonth)} />
            <ComparisonRow
              label="GitHub"
              values={wallets.map(w =>
                w.github ? (
                  <a
                    key={w.id}
                    href={w.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Github className="h-4 w-4" />
                    View
                  </a>
                ) : (
                  'Private'
                )
              )}
            />
          </>
        )}
      </tbody>
    </table>
  );
}

// Hardware wallet comparison
function HardwareWalletComparison({
  wallets,
  onRemove,
}: {
  wallets: HardwareWallet[];
  onRemove: (id: string) => void;
}) {
  const [sections, setSections] = useState({
    general: true,
    security: true,
    features: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = wallets.length + 1;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="py-4 px-4 text-left w-48">Feature</th>
          {wallets.map(wallet => (
            <th key={wallet.id} className="py-4 px-4 text-center min-w-[180px]">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{wallet.name}</span>
                  <button
                    onClick={() => onRemove(wallet.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                    wallet.score >= 75 && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    wallet.score >= 50 && wallet.score < 75 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    wallet.score < 50 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {wallet.score}
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* General Section */}
        <SectionHeader
          title="General"
          isOpen={sections.general}
          onToggle={() => toggleSection('general')}
          colSpan={colSpan}
        />
        {sections.general && (
          <>
            <ComparisonRow label="Score" values={wallets.map(w => w.score)} highlight />
            <ComparisonRow label="Recommendation" values={wallets.map(w => w.recommendation)} />
            <ComparisonRow label="Price" values={wallets.map(w => w.priceText)} />
            <ComparisonRow label="Display" values={wallets.map(w => w.display)} />
            <ComparisonRow label="Connectivity" values={wallets.map(w => w.connectivity.join(', '))} />
          </>
        )}

        {/* Security Section */}
        <SectionHeader
          title="Security"
          isOpen={sections.security}
          onToggle={() => toggleSection('security')}
          colSpan={colSpan}
        />
        {sections.security && (
          <>
            <ComparisonRow label="Air-Gapped" values={wallets.map(w => w.airGap)} isBoolean />
            <ComparisonRow label="Secure Element" values={wallets.map(w => w.secureElement)} isBoolean />
            <ComparisonRow label="SE Type" values={wallets.map(w => w.secureElementType || '-')} />
            <ComparisonRow label="Open Source" values={wallets.map(w => w.openSource)} />
          </>
        )}

        {/* Features Section */}
        <SectionHeader
          title="Development"
          isOpen={sections.features}
          onToggle={() => toggleSection('features')}
          colSpan={colSpan}
        />
        {sections.features && (
          <>
            <ComparisonRow label="Activity Status" values={wallets.map(w => w.active)} />
            <ComparisonRow
              label="GitHub"
              values={wallets.map(w =>
                w.github ? (
                  <a
                    key={w.id}
                    href={w.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Github className="h-4 w-4" />
                    View
                  </a>
                ) : (
                  'Private'
                )
              )}
            />
            <ComparisonRow
              label="Website"
              values={wallets.map(w =>
                w.url ? (
                  <a
                    key={w.id}
                    href={w.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit
                  </a>
                ) : (
                  '-'
                )
              )}
            />
          </>
        )}
      </tbody>
    </table>
  );
}

// Crypto card comparison
function CryptoCardComparison({
  cards,
  onRemove,
}: {
  cards: CryptoCard[];
  onRemove: (id: string) => void;
}) {
  const [sections, setSections] = useState({
    general: true,
    rewards: true,
    fees: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = cards.length + 1;

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="py-4 px-4 text-left w-48">Feature</th>
          {cards.map(card => (
            <th key={card.id} className="py-4 px-4 text-center min-w-[180px]">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{card.name}</span>
                  <button
                    onClick={() => onRemove(card.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                    card.score >= 75 && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    card.score >= 50 && card.score < 75 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    card.score < 50 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {card.score}
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* General Section */}
        <SectionHeader
          title="General"
          isOpen={sections.general}
          onToggle={() => toggleSection('general')}
          colSpan={colSpan}
        />
        {sections.general && (
          <>
            <ComparisonRow label="Score" values={cards.map(c => c.score)} highlight />
            <ComparisonRow label="Card Type" values={cards.map(c => c.cardType)} />
            <ComparisonRow label="Provider" values={cards.map(c => c.provider)} />
            <ComparisonRow label="Region" values={cards.map(c => c.region)} />
            <ComparisonRow label="Business Support" values={cards.map(c => c.businessSupport === 'yes')} isBoolean />
            <ComparisonRow label="Status" values={cards.map(c => c.status)} />
          </>
        )}

        {/* Rewards Section */}
        <SectionHeader
          title="Rewards"
          isOpen={sections.rewards}
          onToggle={() => toggleSection('rewards')}
          colSpan={colSpan}
        />
        {sections.rewards && (
          <>
            <ComparisonRow label="Cashback" values={cards.map(c => c.cashBack)} />
            <ComparisonRow label="Max Cashback %" values={cards.map(c => c.cashBackMax)} highlight />
            <ComparisonRow label="Reward Token" values={cards.map(c => c.rewards)} />
            <ComparisonRow label="Best For" values={cards.map(c => c.bestFor)} />
          </>
        )}

        {/* Fees Section */}
        <SectionHeader
          title="Fees"
          isOpen={sections.fees}
          onToggle={() => toggleSection('fees')}
          colSpan={colSpan}
        />
        {sections.fees && (
          <>
            <ComparisonRow label="Annual Fee" values={cards.map(c => c.annualFee)} />
            <ComparisonRow label="FX Fee" values={cards.map(c => c.fxFee)} />
            <ComparisonRow
              label="Apply"
              values={cards.map(c =>
                c.providerUrl ? (
                  <a
                    key={c.id}
                    href={c.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apply
                  </a>
                ) : (
                  '-'
                )
              )}
            />
          </>
        )}
      </tbody>
    </table>
  );
}

// Export/Share functions
function generateComparisonText(wallets: WalletData[], type: string): string {
  const lines = [`Wallet Radar - ${type} Comparison\n`];
  lines.push(`Generated: ${new Date().toLocaleDateString()}\n`);
  lines.push('---\n');

  wallets.forEach(w => {
    lines.push(`${w.name}: Score ${w.score}`);
  });

  return lines.join('\n');
}

export function ComparisonTool({
  type,
  selectedWallets,
  allWallets,
  onRemove,
  onClear,
  onAdd,
}: ComparisonToolProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedIds = selectedWallets.map(w => w.id);
  const availableWallets = allWallets.filter(w => !selectedIds.includes(w.id));

  const handleExport = () => {
    const text = generateComparisonText(selectedWallets, type);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-comparison-${type}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = generateComparisonText(selectedWallets, type);
    if (navigator.share) {
      await navigator.share({
        title: `Wallet Radar - ${type} Comparison`,
        text,
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Comparison copied to clipboard!');
    }
  };

  if (selectedWallets.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg">
        <p className="text-lg text-muted-foreground mb-2">
          No {type === 'cards' ? 'cards' : 'wallets'} selected for comparison
        </p>
        <p className="text-sm text-muted-foreground">
          Click the + button on any {type === 'cards' ? 'card' : 'wallet'} to add it to the comparison
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Comparing {selectedWallets.length} {type === 'cards' ? 'cards' : 'wallets'}
          </span>
          {selectedWallets.length < 4 && availableWallets.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-primary hover:underline"
            >
              + Add more
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        {type === 'software' && (
          <SoftwareWalletComparison
            wallets={selectedWallets as SoftwareWallet[]}
            onRemove={onRemove}
          />
        )}
        {type === 'hardware' && (
          <HardwareWalletComparison
            wallets={selectedWallets as HardwareWallet[]}
            onRemove={onRemove}
          />
        )}
        {type === 'cards' && (
          <CryptoCardComparison
            cards={selectedWallets as CryptoCard[]}
            onRemove={onRemove}
          />
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add to Comparison</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {availableWallets.slice(0, 10).map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    onAdd(wallet.id);
                    if (selectedWallets.length >= 3) {
                      setShowAddModal(false);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        wallet.score >= 75 && 'bg-green-100 text-green-700',
                        wallet.score >= 50 && wallet.score < 75 && 'bg-yellow-100 text-yellow-700',
                        wallet.score < 50 && 'bg-red-100 text-red-700'
                      )}
                    >
                      {wallet.score}
                    </div>
                    <span className="font-medium">{wallet.name}</span>
                  </div>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparisonTool;
