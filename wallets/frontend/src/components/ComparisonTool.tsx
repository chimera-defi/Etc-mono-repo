'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
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
import { copyTextToClipboard } from '@/lib/clipboard';
import { ScoreBreakdownBar, getScoreBreakdownShortLabel } from '@/components/ScoreBreakdownBar';
import type { CryptoCard, HardwareWallet, Ramp, ScoreBreakdownEntry, SoftwareWallet, SupportedChains, WalletData } from '@/types/wallets';

// Chain icon configuration
const chainIcons: { key: keyof Omit<SupportedChains, 'raw' | 'other'>; src: string; alt: string }[] = [
  { key: 'evm', src: '/chains/eth.svg', alt: 'EVM' },
  { key: 'bitcoin', src: '/chains/btc.svg', alt: 'BTC' },
  { key: 'solana', src: '/chains/sol.svg', alt: 'SOL' },
  { key: 'move', src: '/chains/move.svg', alt: 'Move' },
  { key: 'cosmos', src: '/chains/cosmos.svg', alt: 'Cosmos' },
  { key: 'polkadot', src: '/chains/polkadot.svg', alt: 'DOT' },
  { key: 'starknet', src: '/chains/starknet.svg', alt: 'Stark' },
];

// Helper function to display chain support as icons
function ChainSupportDisplay({ chains }: { chains: SupportedChains }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {chainIcons.map(({ key, src, alt }) => 
        chains[key] && (
          <Image
            key={key}
            src={src}
            alt={alt}
            width={14}
            height={14}
            className="inline-block"
            title={alt}
          />
        )
      )}
      {chains.other && <span className="text-xs text-muted-foreground">+</span>}
    </div>
  );
}

interface ComparisonToolProps {
  type: 'software' | 'hardware' | 'cards' | 'ramps';
  selectedWallets: WalletData[];
  allWallets: WalletData[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAdd: (id: string) => void;
  onClose?: () => void;
}

type ScoreBreakdownRow = {
  key: string;
  label: string;
  values: (ScoreBreakdownEntry | null)[];
};

function buildScoreBreakdownRows(wallets: { scoreBreakdown: ScoreBreakdownEntry[] }[]): ScoreBreakdownRow[] {
  const order: string[] = [];
  const labels = new Map<string, string>();

  wallets.forEach((wallet) => {
    wallet.scoreBreakdown.forEach((entry) => {
      if (!labels.has(entry.key)) {
        labels.set(entry.key, entry.label);
        order.push(entry.key);
      }
    });
  });

  return order.map((key) => ({
    key,
    label: labels.get(key) || key,
    values: wallets.map((wallet) => wallet.scoreBreakdown.find((entry) => entry.key === key) || null),
  }));
}

function ScoreBreakdownValue({ entry }: { entry: ScoreBreakdownEntry | null }) {
  if (!entry || entry.max <= 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const pct = Math.max(0, Math.min(100, Math.round((entry.score / entry.max) * 100)));
  const fillClass = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="mx-auto w-full max-w-[120px] space-y-1" title={`${entry.label}: ${entry.score}/${entry.max}${entry.note ? `\n${entry.note}` : ''}`}>
      <div className="text-xs font-medium">
        {entry.score}/{entry.max}
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreBreakdownLegendRow({
  breakdown,
  valueColSpan,
}: {
  breakdown: ScoreBreakdownEntry[];
  valueColSpan: number;
}) {
  if (breakdown.length === 0) return null;
  const legendBreakdown = breakdown.map((entry) => ({
    ...entry,
    score: entry.max,
    note: '',
  }));

  return (
    <tr className="border-b border-border/60 bg-muted/20">
      <td className="sticky left-0 z-10 border-r border-border bg-muted/20 py-2 px-4 text-xs font-medium text-muted-foreground">
        Category Weights
      </td>
      <td className="py-2 px-4" colSpan={valueColSpan}>
        <ScoreBreakdownBar
          breakdown={legendBreakdown}
          showLegend
          className="max-w-3xl"
          barClassName="h-1.5"
        />
      </td>
    </tr>
  );
}

function buildScoreDeltaVsNext(values: { score: number; name: string }[]) {
  return values.map((wallet, index) => {
    const next = values[index + 1];
    if (!next) {
      return <span key={`delta-${wallet.name}`} className="text-muted-foreground">—</span>;
    }

    const delta = wallet.score - next.score;
    const tone = delta > 0 ? 'text-green-600 dark:text-green-400' : delta < 0 ? 'text-red-500' : 'text-muted-foreground';
    const prefix = delta > 0 ? '+' : '';

    return (
      <span key={`delta-${wallet.name}`} className={cn('font-semibold', tone)}>
        {prefix}{delta}
      </span>
    );
  });
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
  const rankedValues = numericValues.filter((v): v is number => v !== null);
  const maxValue = rankedValues.length ? Math.max(...rankedValues) : null;
  const minValue = rankedValues.length ? Math.min(...rankedValues) : null;

  return (
    <tr className={cn('border-b border-border', highlight && 'bg-muted/30')}>
      <td
        className={cn(
          'sticky left-0 z-10 border-r border-border py-3 px-4 font-medium text-sm text-muted-foreground whitespace-nowrap',
          highlight ? 'bg-muted/30' : 'bg-background'
        )}
      >
        {label}
      </td>
      {values.map((value, idx) => {
        const isMax = maxValue !== null && numericValues[idx] === maxValue && maxValue > 0;
        const isMin = minValue !== null && numericValues[idx] === minValue && !isMax && minValue < (maxValue ?? minValue);

        return (
          <td
            key={idx}
            className={cn(
              'py-3 px-4 text-center',
              isMax && 'bg-green-100 dark:bg-green-900/40 font-medium',
              isMin && 'bg-red-100 dark:bg-red-900/30'
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
              <div>
                <span className={cn('font-semibold', isMax && 'text-green-600 dark:text-green-400', isMin && 'text-red-500')}>
                  {value}
                </span>
                {isMax && <span className="block text-[10px] uppercase tracking-wide text-green-700 dark:text-green-400">★ Best</span>}
                {isMin && <span className="block text-[10px] uppercase tracking-wide text-red-600">Worst</span>}
              </div>
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
    breakdown: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = wallets.length + 1;
  const breakdownRows = buildScoreBreakdownRows(wallets);

  return (
    <table className="w-full">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-border bg-background">
          <th className="sticky left-0 z-20 bg-background border-r border-border py-4 px-4 text-left w-48">Feature</th>
          {wallets.map(wallet => (
            <th key={wallet.id} data-compare-column tabIndex={0} className="py-4 px-4 text-center min-w-[140px] outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{wallet.name}</span>
                  <button
                    onClick={() => onRemove(wallet.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Remove from comparison"
                    aria-label={`Remove ${wallet.name} from comparison`}
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
            <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(wallets)} />
            <ComparisonRow label="Score" values={wallets.map(w => w.score)} highlight />
            <ComparisonRow label="Recommendation" values={wallets.map(w => w.recommendation)} />
            <ComparisonRow label="Best For" values={wallets.map(w => w.bestFor)} />
            <ComparisonRow label="Chain Support" values={wallets.map(w => <ChainSupportDisplay key={w.id} chains={w.chains} />)} />
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

        <SectionHeader
          title="Score Breakdown"
          isOpen={sections.breakdown}
          onToggle={() => toggleSection('breakdown')}
          colSpan={colSpan}
        />
        {sections.breakdown && (
          <ScoreBreakdownLegendRow breakdown={wallets[0]?.scoreBreakdown ?? []} valueColSpan={wallets.length} />
        )}
        {sections.breakdown && breakdownRows.map((row) => (
          <ComparisonRow
            key={`software-breakdown-${row.key}`}
            label={getScoreBreakdownShortLabel(row.label)}
            values={row.values.map((entry, idx) => (
              <ScoreBreakdownValue
                key={`software-breakdown-${row.key}-${wallets[idx]?.id || idx}`}
                entry={entry}
              />
            ))}
          />
        ))}
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
    breakdown: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = wallets.length + 1;
  const breakdownRows = buildScoreBreakdownRows(wallets);

  return (
    <table className="w-full">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-border bg-background">
          <th className="sticky left-0 z-20 bg-background border-r border-border py-4 px-4 text-left w-48">Feature</th>
          {wallets.map(wallet => (
            <th key={wallet.id} data-compare-column tabIndex={0} className="py-4 px-4 text-center min-w-[140px] outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{wallet.name}</span>
                  <button
                    onClick={() => onRemove(wallet.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Remove from comparison"
                    aria-label={`Remove ${wallet.name} from comparison`}
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
            <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(wallets)} />
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

        <SectionHeader
          title="Score Breakdown"
          isOpen={sections.breakdown}
          onToggle={() => toggleSection('breakdown')}
          colSpan={colSpan}
        />
        {sections.breakdown && (
          <ScoreBreakdownLegendRow breakdown={wallets[0]?.scoreBreakdown ?? []} valueColSpan={wallets.length} />
        )}
        {sections.breakdown && breakdownRows.map((row) => (
          <ComparisonRow
            key={`hardware-breakdown-${row.key}`}
            label={getScoreBreakdownShortLabel(row.label)}
            values={row.values.map((entry, idx) => (
              <ScoreBreakdownValue
                key={`hardware-breakdown-${row.key}-${wallets[idx]?.id || idx}`}
                entry={entry}
              />
            ))}
          />
        ))}
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
    breakdown: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = cards.length + 1;
  const breakdownRows = buildScoreBreakdownRows(cards);

  return (
    <table className="w-full">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-border bg-background">
          <th className="sticky left-0 z-20 bg-background border-r border-border py-4 px-4 text-left w-48">Feature</th>
          {cards.map(card => (
            <th key={card.id} data-compare-column tabIndex={0} className="py-4 px-4 text-center min-w-[140px] outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{card.name}</span>
                  <button
                    onClick={() => onRemove(card.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Remove from comparison"
                    aria-label={`Remove ${card.name} from comparison`}
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
            <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(cards)} />
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

        <SectionHeader
          title="Score Breakdown"
          isOpen={sections.breakdown}
          onToggle={() => toggleSection('breakdown')}
          colSpan={colSpan}
        />
        {sections.breakdown && (
          <ScoreBreakdownLegendRow breakdown={cards[0]?.scoreBreakdown ?? []} valueColSpan={cards.length} />
        )}
        {sections.breakdown && breakdownRows.map((row) => (
          <ComparisonRow
            key={`cards-breakdown-${row.key}`}
            label={getScoreBreakdownShortLabel(row.label)}
            values={row.values.map((entry, idx) => (
              <ScoreBreakdownValue
                key={`cards-breakdown-${row.key}-${cards[idx]?.id || idx}`}
                entry={entry}
              />
            ))}
          />
        ))}
      </tbody>
    </table>
  );
}

// Ramp comparison
function RampComparison({
  ramps,
  onRemove,
}: {
  ramps: Ramp[];
  onRemove: (id: string) => void;
}) {
  const [sections, setSections] = useState({
    general: true,
    features: true,
    fees: true,
    links: true,
    breakdown: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colSpan = ramps.length + 1;
  const breakdownRows = buildScoreBreakdownRows(ramps);

  return (
    <table className="w-full">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-border bg-background">
          <th className="sticky left-0 z-20 bg-background border-r border-border py-4 px-4 text-left w-48">Feature</th>
          {ramps.map(ramp => (
            <th key={ramp.id} data-compare-column tabIndex={0} className="py-4 px-4 text-center min-w-[140px] outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {ramp.url ? (
                    <a
                      href={ramp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-foreground hover:text-primary hover:underline"
                    >
                      {ramp.name}
                    </a>
                  ) : (
                    <span className="font-bold">{ramp.name}</span>
                  )}
                  <button
                    onClick={() => onRemove(ramp.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Remove from comparison"
                    aria-label={`Remove ${ramp.name} from comparison`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                    ramp.score >= 75 && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    ramp.score >= 50 && ramp.score < 75 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    ramp.score < 50 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {ramp.score}
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
            <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(ramps)} />
            <ComparisonRow label="Score" values={ramps.map(r => r.score)} highlight />
            <ComparisonRow label="Recommendation" values={ramps.map(r => r.recommendation)} />
            <ComparisonRow label="Type" values={ramps.map(r => r.rampType)} />
            <ComparisonRow label="On-Ramp" values={ramps.map(r => r.onRamp)} isBoolean />
            <ComparisonRow label="Off-Ramp" values={ramps.map(r => r.offRamp)} isBoolean />
            <ComparisonRow label="Coverage" values={ramps.map(r => r.coverage)} />
            <ComparisonRow label="Founded" values={ramps.map(r => r.foundedYear ?? '-')} />
            <ComparisonRow label="Funding" values={ramps.map(r => `${r.funding} (${r.fundingSource})`)} />
            <ComparisonRow label="Best For" values={ramps.map(r => r.bestFor)} />
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
            <ComparisonRow label="Dev UX" values={ramps.map(r => r.devUx)} />
            <ComparisonRow label="Status" values={ramps.map(r => r.status)} />
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
            <ComparisonRow label="Fee Model" values={ramps.map(r => r.feeModel)} />
            <ComparisonRow label="Min Fee" values={ramps.map(r => r.minFee)} />
          </>
        )}

        {/* Links Section */}
        <SectionHeader
          title="Links"
          isOpen={sections.links}
          onToggle={() => toggleSection('links')}
          colSpan={colSpan}
        />
        {sections.links && (
          <>
            <ComparisonRow
              label="Website"
              values={ramps.map(r =>
                r.url ? (
                  <a
                    key={r.id}
                    href={r.url}
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

        <SectionHeader
          title="Score Breakdown"
          isOpen={sections.breakdown}
          onToggle={() => toggleSection('breakdown')}
          colSpan={colSpan}
        />
        {sections.breakdown && (
          <ScoreBreakdownLegendRow breakdown={ramps[0]?.scoreBreakdown ?? []} valueColSpan={ramps.length} />
        )}
        {sections.breakdown && breakdownRows.map((row) => (
          <ComparisonRow
            key={`ramps-breakdown-${row.key}`}
            label={getScoreBreakdownShortLabel(row.label)}
            values={row.values.map((entry, idx) => (
              <ScoreBreakdownValue
                key={`ramps-breakdown-${row.key}-${ramps[idx]?.id || idx}`}
                entry={entry}
              />
            ))}
          />
        ))}
      </tbody>
    </table>
  );
}

function toCsvCell(value: unknown): string {
  const str = String(value ?? '');
  if (!/[",\n]/.test(str)) return str;
  return `"${str.replaceAll('"', '""')}"`;
}

function generateComparisonCsv(wallets: WalletData[], type: ComparisonToolProps['type']): string {
  let rows: string[][] = [];

  if (type === 'software') {
    const typed = wallets as SoftwareWallet[];
    rows = [
      ['Name', 'Score', 'Recommendation', 'Best For', 'Mobile', 'Browser', 'Desktop', 'License', 'Audits', 'Funding', 'Activity'],
      ...typed.map((wallet) => [
        wallet.name,
        wallet.score,
        wallet.recommendation,
        wallet.bestFor,
        wallet.devices.mobile ? 'yes' : 'no',
        wallet.devices.browser ? 'yes' : 'no',
        wallet.devices.desktop ? 'yes' : 'no',
        wallet.licenseType,
        wallet.audits,
        `${wallet.funding} (${wallet.fundingSource})`,
        wallet.active,
      ].map(String)),
    ];
  }

  if (type === 'hardware') {
    const typed = wallets as HardwareWallet[];
    rows = [
      ['Name', 'Score', 'Recommendation', 'Price', 'Display', 'Connectivity', 'AirGap', 'SecureElement', 'OpenSource', 'Activity'],
      ...typed.map((wallet) => [
        wallet.name,
        wallet.score,
        wallet.recommendation,
        wallet.priceText,
        wallet.display,
        wallet.connectivity.join(' / '),
        wallet.airGap ? 'yes' : 'no',
        wallet.secureElement ? 'yes' : 'no',
        wallet.openSource,
        wallet.active,
      ].map(String)),
    ];
  }

  if (type === 'cards') {
    const typed = wallets as CryptoCard[];
    rows = [
      ['Name', 'Score', 'CardType', 'Provider', 'Region', 'Cashback', 'AnnualFee', 'FXFee', 'Status', 'BusinessSupport'],
      ...typed.map((card) => [
        card.name,
        card.score,
        card.cardType,
        card.provider,
        card.region,
        card.cashBack,
        card.annualFee,
        card.fxFee,
        card.status,
        card.businessSupport,
      ].map(String)),
    ];
  }

  if (type === 'ramps') {
    const typed = wallets as Ramp[];
    rows = [
      ['Name', 'Score', 'Recommendation', 'Type', 'OnRamp', 'OffRamp', 'Coverage', 'FeeModel', 'MinFee', 'DevUX', 'Status'],
      ...typed.map((ramp) => [
        ramp.name,
        ramp.score,
        ramp.recommendation,
        ramp.rampType,
        ramp.onRamp ? 'yes' : 'no',
        ramp.offRamp ? 'yes' : 'no',
        ramp.coverage,
        ramp.feeModel,
        ramp.minFee,
        ramp.devUx,
        ramp.status,
      ].map(String)),
    ];
  }

  return rows.map((row) => row.map(toCsvCell).join(',')).join('\n');
}

export function ComparisonTool({
  type,
  selectedWallets,
  allWallets,
  onRemove,
  onClear,
  onAdd,
  onClose,
}: ComparisonToolProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const comparisonContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedIds = selectedWallets.map(w => w.id);
  const availableWallets = allWallets.filter(w => !selectedIds.includes(w.id));

  // Auto-hide copied notification
  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timer = setTimeout(() => setCopyStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  const handleExport = () => {
    const csv = generateComparisonCsv(selectedWallets, type);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-comparison-${type}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    const link = window.location.href;
    try {
      const copied = await copyTextToClipboard(link);
      if (!copied) throw new Error('Copy command failed');
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (showAddModal) {
        setShowAddModal(false);
      } else {
        onClose?.();
      }
      return;
    }

    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    const columns = comparisonContainerRef.current?.querySelectorAll<HTMLElement>('[data-compare-column]');
    if (!columns || columns.length === 0) return;

    const ordered = Array.from(columns);
    const focused = document.activeElement as HTMLElement | null;
    const currentIndex = ordered.findIndex((col) => col === focused);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = currentIndex === -1
      ? (direction === 1 ? 0 : ordered.length - 1)
      : (currentIndex + direction + ordered.length) % ordered.length;

    ordered[nextIndex]?.focus();
    event.preventDefault();
  }, [onClose, showAddModal]);

  if (selectedWallets.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg">
        <p className="text-lg text-muted-foreground mb-2">
          No {type === 'cards' ? 'cards' : type === 'ramps' ? 'ramps' : 'wallets'} selected for comparison
        </p>
        <p className="text-sm text-muted-foreground">
          Click the + button on any {type === 'cards' ? 'card' : type === 'ramps' ? 'ramp' : 'wallet'} to add it to the comparison
        </p>
      </div>
    );
  }

  return (
    <div ref={comparisonContainerRef} tabIndex={0} onKeyDown={handleKeyDown} className="space-y-4 outline-none">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Comparing {selectedWallets.length} {type === 'cards' ? 'cards' : type === 'ramps' ? 'ramps' : 'wallets'}
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
            Export CSV
          </button>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Copy comparison link
          </button>
          {copyStatus === 'success' && (
            <span className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
              ✓ Link copied
            </span>
          )}
          {copyStatus === 'error' && (
            <span className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
              Copy failed, copy URL manually
            </span>
          )}
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
      <div className="overflow-x-auto [WebkitOverflowScrolling:touch] border border-border rounded-lg">
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
        {type === 'ramps' && (
          <RampComparison
            ramps={selectedWallets as Ramp[]}
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
              {availableWallets.map(wallet => (
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
