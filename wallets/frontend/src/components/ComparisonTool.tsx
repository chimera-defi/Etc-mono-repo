'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { cn, getScoreColorClasses } from '@/lib/utils';
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

// ─── Generic comparison table scaffold ──────────────────────────────────────
interface BaseItem {
  id: string;
  name: string;
  score: number;
  scoreBreakdown: ScoreBreakdownEntry[];
}

type SectionMap<S extends string> = Record<S | 'breakdown', boolean>;

interface ComparisonTableScaffoldProps<T extends BaseItem, S extends string> {
  items: T[];
  onRemove: (id: string) => void;
  sectionKeys: readonly S[];
  breakdownPrefix: string;
  renderItemName?: (item: T) => React.ReactNode;
  renderSections: (
    sections: SectionMap<S>,
    toggle: (key: S | 'breakdown') => void,
    colSpan: number,
    items: T[],
    breakdownRows: ScoreBreakdownRow[]
  ) => React.ReactNode;
}

function ComparisonTableScaffold<T extends BaseItem, S extends string>({
  items,
  onRemove,
  sectionKeys,
  breakdownPrefix,
  renderItemName,
  renderSections,
}: ComparisonTableScaffoldProps<T, S>) {
  const initial = {} as SectionMap<S>;
  ([...sectionKeys, 'breakdown'] as (S | 'breakdown')[]).forEach((k) => {
    (initial as Record<string, boolean>)[k] = true;
  });

  const [sections, setSections] = useState<SectionMap<S>>(initial);

  const toggle = useCallback((section: S | 'breakdown') => {
    setSections(prev => ({ ...prev, [section]: !prev[section as keyof SectionMap<S>] }));
  }, []);

  const colSpan = items.length + 1;
  const breakdownRows = useMemo(() => buildScoreBreakdownRows(items), [items]);

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border bg-background">
          <th className="sticky left-0 top-0 z-20 bg-background border-r border-border py-4 px-4 text-left w-48">Feature</th>
          {items.map(item => (
            <th
              key={item.id}
              data-compare-column
              tabIndex={0}
              className="sticky top-0 z-10 bg-background py-4 px-4 text-center min-w-[140px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {renderItemName ? renderItemName(item) : <span className="font-bold">{item.name}</span>}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Remove from comparison"
                    aria-label={`Remove ${item.name} from comparison`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                    getScoreColorClasses(item.score)
                  )}
                >
                  {item.score}
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {renderSections(sections, toggle, colSpan, items, breakdownRows)}
        <SectionHeader
          title="Score Breakdown"
          isOpen={sections.breakdown}
          onToggle={() => toggle('breakdown')}
          colSpan={colSpan}
        />
        {sections.breakdown && (
          <ScoreBreakdownLegendRow breakdown={items[0]?.scoreBreakdown ?? []} valueColSpan={items.length} />
        )}
        {sections.breakdown && breakdownRows.map((row) => (
          <ComparisonRow
            key={`${breakdownPrefix}-breakdown-${row.key}`}
            label={getScoreBreakdownShortLabel(row.label)}
            values={row.values.map((entry, idx) => (
              <ScoreBreakdownValue
                key={`${breakdownPrefix}-breakdown-${row.key}-${items[idx]?.id || idx}`}
                entry={entry}
              />
            ))}
          />
        ))}
      </tbody>
    </table>
  );
}

// ─── Software wallet comparison ──────────────────────────────────────────────
function SoftwareWalletComparison({
  wallets,
  onRemove,
}: {
  wallets: SoftwareWallet[];
  onRemove: (id: string) => void;
}) {
  return (
    <ComparisonTableScaffold
      items={wallets}
      onRemove={onRemove}
      sectionKeys={['general', 'security', 'features', 'development'] as const}
      breakdownPrefix="software"
      renderSections={(sections, toggle, colSpan, items) => (
        <>
          <SectionHeader title="General" isOpen={sections.general} onToggle={() => toggle('general')} colSpan={colSpan} />
          {sections.general && (
            <>
              <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(items)} />
              <ComparisonRow label="Score" values={items.map(w => w.score)} highlight />
              <ComparisonRow label="Recommendation" values={items.map(w => w.recommendation)} />
              <ComparisonRow label="Best For" values={items.map(w => w.bestFor)} />
              <ComparisonRow label="Chain Support" values={items.map(w => <ChainSupportDisplay key={w.id} chains={w.chains} />)} />
              <ComparisonRow label="Mobile App" values={items.map(w => w.devices.mobile)} isBoolean />
              <ComparisonRow label="Browser Extension" values={items.map(w => w.devices.browser)} isBoolean />
              <ComparisonRow label="Desktop App" values={items.map(w => w.devices.desktop)} isBoolean />
            </>
          )}
          <SectionHeader title="Security & Trust" isOpen={sections.security} onToggle={() => toggle('security')} colSpan={colSpan} />
          {sections.security && (
            <>
              <ComparisonRow label="License" values={items.map(w => w.licenseType)} />
              <ComparisonRow label="Open Source" values={items.map(w => w.license)} />
              <ComparisonRow label="Security Audits" values={items.map(w => w.audits)} />
              <ComparisonRow label="Funding" values={items.map(w => `${w.funding} (${w.fundingSource})`)} />
              <ComparisonRow label="Tx Simulation" values={items.map(w => w.txSimulation)} isBoolean />
              <ComparisonRow label="Scam Alerts" values={items.map(w => w.scamAlerts)} />
            </>
          )}
          <SectionHeader title="Features" isOpen={sections.features} onToggle={() => toggle('features')} colSpan={colSpan} />
          {sections.features && (
            <>
              <ComparisonRow label="Custom RPC" values={items.map(w => w.rpc)} />
              <ComparisonRow label="Testnet Support" values={items.map(w => w.testnets)} isBoolean />
              <ComparisonRow label="Account Types" values={items.map(w => w.accountTypes.join(', '))} />
              <ComparisonRow label="ENS/Naming" values={items.map(w => w.ensNaming)} />
              <ComparisonRow label="Hardware Wallet Support" values={items.map(w => w.hardwareSupport)} isBoolean />
            </>
          )}
          <SectionHeader title="Development Activity" isOpen={sections.development} onToggle={() => toggle('development')} colSpan={colSpan} />
          {sections.development && (
            <>
              <ComparisonRow label="Activity Status" values={items.map(w => w.active)} />
              <ComparisonRow label="Releases/Month" values={items.map(w => w.releasesPerMonth)} />
              <ComparisonRow
                label="GitHub"
                values={items.map(w =>
                  w.github ? (
                    <a key={w.id} href={w.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <Github className="h-4 w-4" />View
                    </a>
                  ) : 'Private'
                )}
              />
            </>
          )}
        </>
      )}
    />
  );
}

// ─── Hardware wallet comparison ──────────────────────────────────────────────
function HardwareWalletComparison({
  wallets,
  onRemove,
}: {
  wallets: HardwareWallet[];
  onRemove: (id: string) => void;
}) {
  return (
    <ComparisonTableScaffold
      items={wallets}
      onRemove={onRemove}
      sectionKeys={['general', 'security', 'features'] as const}
      breakdownPrefix="hardware"
      renderSections={(sections, toggle, colSpan, items) => (
        <>
          <SectionHeader title="General" isOpen={sections.general} onToggle={() => toggle('general')} colSpan={colSpan} />
          {sections.general && (
            <>
              <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(items)} />
              <ComparisonRow label="Score" values={items.map(w => w.score)} highlight />
              <ComparisonRow label="Recommendation" values={items.map(w => w.recommendation)} />
              <ComparisonRow label="Price" values={items.map(w => w.priceText)} />
              <ComparisonRow label="Display" values={items.map(w => w.display)} />
              <ComparisonRow label="Connectivity" values={items.map(w => w.connectivity.join(', '))} />
            </>
          )}
          <SectionHeader title="Security" isOpen={sections.security} onToggle={() => toggle('security')} colSpan={colSpan} />
          {sections.security && (
            <>
              <ComparisonRow label="Air-Gapped" values={items.map(w => w.airGap)} isBoolean />
              <ComparisonRow label="Secure Element" values={items.map(w => w.secureElement)} isBoolean />
              <ComparisonRow label="SE Type" values={items.map(w => w.secureElementType || '-')} />
              <ComparisonRow label="Open Source" values={items.map(w => w.openSource)} />
            </>
          )}
          <SectionHeader title="Development" isOpen={sections.features} onToggle={() => toggle('features')} colSpan={colSpan} />
          {sections.features && (
            <>
              <ComparisonRow label="Activity Status" values={items.map(w => w.active)} />
              <ComparisonRow
                label="GitHub"
                values={items.map(w =>
                  w.github ? (
                    <a key={w.id} href={w.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <Github className="h-4 w-4" />View
                    </a>
                  ) : 'Private'
                )}
              />
              <ComparisonRow
                label="Website"
                values={items.map(w =>
                  w.url ? (
                    <a key={w.id} href={w.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />Visit
                    </a>
                  ) : '-'
                )}
              />
            </>
          )}
        </>
      )}
    />
  );
}

// ─── Crypto card comparison ───────────────────────────────────────────────────
function CryptoCardComparison({
  cards,
  onRemove,
}: {
  cards: CryptoCard[];
  onRemove: (id: string) => void;
}) {
  return (
    <ComparisonTableScaffold
      items={cards}
      onRemove={onRemove}
      sectionKeys={['general', 'rewards', 'fees'] as const}
      breakdownPrefix="cards"
      renderSections={(sections, toggle, colSpan, items) => (
        <>
          <SectionHeader title="General" isOpen={sections.general} onToggle={() => toggle('general')} colSpan={colSpan} />
          {sections.general && (
            <>
              <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(items)} />
              <ComparisonRow label="Score" values={items.map(c => c.score)} highlight />
              <ComparisonRow label="Card Type" values={items.map(c => c.cardType)} />
              <ComparisonRow label="Provider" values={items.map(c => c.provider)} />
              <ComparisonRow label="Region" values={items.map(c => c.region)} />
              <ComparisonRow label="Business Support" values={items.map(c => c.businessSupport === 'yes')} isBoolean />
              <ComparisonRow label="Status" values={items.map(c => c.status)} />
            </>
          )}
          <SectionHeader title="Rewards" isOpen={sections.rewards} onToggle={() => toggle('rewards')} colSpan={colSpan} />
          {sections.rewards && (
            <>
              <ComparisonRow label="Cashback" values={items.map(c => c.cashBack)} />
              <ComparisonRow label="Max Cashback %" values={items.map(c => c.cashBackMax)} highlight />
              <ComparisonRow label="Reward Token" values={items.map(c => c.rewards)} />
              <ComparisonRow label="Best For" values={items.map(c => c.bestFor)} />
            </>
          )}
          <SectionHeader title="Fees" isOpen={sections.fees} onToggle={() => toggle('fees')} colSpan={colSpan} />
          {sections.fees && (
            <>
              <ComparisonRow label="Annual Fee" values={items.map(c => c.annualFee)} />
              <ComparisonRow label="FX Fee" values={items.map(c => c.fxFee)} />
              <ComparisonRow
                label="Apply"
                values={items.map(c =>
                  c.providerUrl ? (
                    <a key={c.id} href={c.providerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />Apply
                    </a>
                  ) : '-'
                )}
              />
            </>
          )}
        </>
      )}
    />
  );
}

// ─── Ramp comparison ──────────────────────────────────────────────────────────
function RampComparison({
  ramps,
  onRemove,
}: {
  ramps: Ramp[];
  onRemove: (id: string) => void;
}) {
  return (
    <ComparisonTableScaffold
      items={ramps}
      onRemove={onRemove}
      sectionKeys={['general', 'features', 'fees', 'links'] as const}
      breakdownPrefix="ramps"
      renderItemName={(item) =>
        item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary hover:underline">
            {item.name}
          </a>
        ) : (
          <span className="font-bold">{item.name}</span>
        )
      }
      renderSections={(sections, toggle, colSpan, items) => (
        <>
          <SectionHeader title="General" isOpen={sections.general} onToggle={() => toggle('general')} colSpan={colSpan} />
          {sections.general && (
            <>
              <ComparisonRow label="Score Delta (vs next)" values={buildScoreDeltaVsNext(items)} />
              <ComparisonRow label="Score" values={items.map(r => r.score)} highlight />
              <ComparisonRow label="Recommendation" values={items.map(r => r.recommendation)} />
              <ComparisonRow label="Type" values={items.map(r => r.rampType)} />
              <ComparisonRow label="On-Ramp" values={items.map(r => r.onRamp)} isBoolean />
              <ComparisonRow label="Off-Ramp" values={items.map(r => r.offRamp)} isBoolean />
              <ComparisonRow label="Coverage" values={items.map(r => r.coverage)} />
              <ComparisonRow label="Founded" values={items.map(r => r.foundedYear ?? '-')} />
              <ComparisonRow label="Funding" values={items.map(r => `${r.funding} (${r.fundingSource})`)} />
              <ComparisonRow label="Best For" values={items.map(r => r.bestFor)} />
            </>
          )}
          <SectionHeader title="Features" isOpen={sections.features} onToggle={() => toggle('features')} colSpan={colSpan} />
          {sections.features && (
            <>
              <ComparisonRow label="Dev UX" values={items.map(r => r.devUx)} />
              <ComparisonRow label="Status" values={items.map(r => r.status)} />
            </>
          )}
          <SectionHeader title="Fees" isOpen={sections.fees} onToggle={() => toggle('fees')} colSpan={colSpan} />
          {sections.fees && (
            <>
              <ComparisonRow label="Fee Model" values={items.map(r => r.feeModel)} />
              <ComparisonRow label="Min Fee" values={items.map(r => r.minFee)} />
            </>
          )}
          <SectionHeader title="Links" isOpen={sections.links} onToggle={() => toggle('links')} colSpan={colSpan} />
          {sections.links && (
            <>
              <ComparisonRow
                label="Website"
                values={items.map(r =>
                  r.url ? (
                    <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />Visit
                    </a>
                  ) : '-'
                )}
              />
            </>
          )}
        </>
      )}
    />
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            onClick={handleExport}
            className="shrink-0 inline-flex items-center gap-2 px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-lg hover:bg-muted transition-colors sm:px-3"
          >
            <Download className="h-4 w-4" />
            <span className="sm:hidden">Export</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="shrink-0 inline-flex items-center gap-2 px-2.5 py-1.5 text-xs sm:text-sm border border-border rounded-lg hover:bg-muted transition-colors sm:px-3"
          >
            <Share2 className="h-4 w-4" />
            <span className="sm:hidden">Copy link</span>
            <span className="hidden sm:inline">Copy comparison link</span>
          </button>
          {copyStatus === 'success' && (
            <span className="basis-full text-xs sm:text-sm text-green-600 dark:text-green-400 animate-fade-in">
              ✓ Link copied
            </span>
          )}
          {copyStatus === 'error' && (
            <span className="basis-full text-xs sm:text-sm text-red-600 dark:text-red-400 animate-fade-in">
              Copy failed, copy URL manually
            </span>
          )}
          <button
            onClick={onClear}
            className="shrink-0 inline-flex items-center gap-2 px-2.5 py-1.5 text-xs sm:text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors sm:px-3"
          >
            <X className="h-4 w-4" />
            <span className="sm:hidden">Clear</span>
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <p className="text-xs text-muted-foreground sm:hidden">
        Swipe horizontally to compare all columns.
      </p>
      <div className="max-h-[70vh] overflow-x-auto overflow-y-auto overscroll-contain [WebkitOverflowScrolling:touch] border border-border rounded-lg sm:max-h-none sm:overflow-visible">
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
                        getScoreColorClasses(wallet.score)
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
