'use client';

import {
  ExternalLink,
  Github,
  Plus,
  Check,
  Smartphone,
  Globe,
  Monitor,
  Link as LinkIcon,
  Shield,
  Zap,
  AlertTriangle,
  SearchX,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, HeaderTooltip } from '@/components/Tooltip';
import { ScoreBreakdownBar } from '@/components/ScoreBreakdownBar';
import { CHAIN_ICONS } from '@/lib/chain-icons';
import {
  softwareWalletTooltips,
  hardwareWalletTooltips,
  cryptoCardTooltips,
  rampTooltips,
  commonTooltips,
} from '@/lib/tooltip-content';
import type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, SupportedChains, WalletData } from '@/types/wallets';

export type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData };

const SYMBOLS = {
  check: '✓',
  cross: '✕',
} as const;

type SelectableItemProps = {
  isSelected: boolean;
  isAtMax: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
  detailHref: string;
  scoreMedian: number;
};

function EmptyState({
  type,
  onResetFilters,
}: {
  type: 'software' | 'hardware' | 'cards' | 'ramps';
  onResetFilters?: () => void;
}) {
  const config = {
    software: {
      title: 'No software wallets match your filters',
      description: 'Try widening platform, safety, or score filters.',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
    },
    hardware: {
      title: 'No hardware wallets match your filters',
      description: 'Try widening price, connectivity, or transparency filters.',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
    },
    cards: {
      title: 'No crypto cards match your filters',
      description: 'Try widening region, custody, or cashback filters.',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
    },
    ramps: {
      title: 'No ramps match your filters',
      description: 'Try widening coverage, fee, or status filters.',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/40',
    },
  } as const;

  const state = config[type];

  return (
    <div className={cn('rounded-2xl border bg-background/50 p-8 text-center', state.borderColor)}>
      <SearchX className={cn('mx-auto h-10 w-10', state.iconColor)} />
      <h3 className="mt-4 text-lg font-semibold text-foreground">{state.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{state.description}</p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="mt-4 inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}

function SelectionButton({
  isSelected,
  isAtMax,
  onToggleSelect,
  itemName,
  size = 'sm',
}: {
  isSelected: boolean;
  isAtMax: boolean;
  onToggleSelect: () => void;
  itemName: string;
  size?: 'sm' | 'lg';
}) {
  const disabled = !isSelected && isAtMax;
  return (
    <button
      onClick={onToggleSelect}
      disabled={disabled}
      aria-label={isSelected ? `Remove ${itemName} from comparison` : `Add ${itemName} to comparison`}
      title={isSelected ? 'Remove from comparison' : disabled ? 'Max 4 selected' : 'Add to comparison'}
      className={cn(
        'border transition-colors',
        size === 'sm' ? 'p-1 rounded' : 'p-2 rounded-lg',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary'
          : disabled
          ? 'border-border opacity-30 cursor-not-allowed'
          : size === 'lg'
          ? 'border-border hover:border-primary hover:bg-muted'
          : 'border-border hover:border-primary'
      )}
    >
      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
    </button>
  );
}

function getChainTooltip(chains: SupportedChains): string {
  const supported: string[] = [];
  if (chains.evm) supported.push('EVM (Ethereum, Polygon, Arbitrum, etc.)');
  if (chains.bitcoin) supported.push('Bitcoin');
  if (chains.solana) supported.push('Solana');
  if (chains.move) supported.push('Move (Sui, Aptos)');
  if (chains.cosmos) supported.push('Cosmos ecosystem');
  if (chains.polkadot) supported.push('Polkadot');
  if (chains.starknet) supported.push('Starknet');
  if (chains.other) supported.push('Other chains (TON, XRP, etc.)');
  return supported.length > 0 ? `Supported: ${supported.join(', ')}` : 'No chain support data';
}

function getWalletDetailHref(type: 'software' | 'hardware' | 'cards' | 'ramps', id: string) {
  return `/wallets/${type}/${id}`;
}

const TABLE_METHOD_LINKS = {
  software: '/docs/software-wallets-details#-wallet-scores-developer-focused-methodology',
  hardware: '/docs/hardware-wallets-details#-scoring-methodology',
  cards: '/docs/crypto-cards-details#scoring-methodology',
  ramps: '/docs/ramps-details#scoring-methodology',
} as const;

const METHODOLOGY_TOOLTIP_LABEL = 'Read methodology';
const DETAILS_TOOLTIP_LABEL = 'Open details';

// Component to render chain icons
function ChainIcons({
  chains,
  tooltipLinkHref,
}: {
  chains: SupportedChains;
  tooltipLinkHref?: string;
}) {
  return (
    <div className="flex items-center gap-0.5" title={getChainTooltip(chains)}>
      {CHAIN_ICONS.map(({ key, src, alt, tooltip }) =>
        chains[key] && (
          <Tooltip key={key} content={tooltip} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <Image
              src={src}
              alt={alt}
              width={16}
              height={16}
              className="inline-block"
            />
          </Tooltip>
        )
      )}
      {chains.other && (
        <Tooltip content={commonTooltips.chains.other} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
          <span className="text-xs text-muted-foreground ml-0.5">+</span>
        </Tooltip>
      )}
    </div>
  );
}

// Badge component
function Badge({
  children,
  variant = 'default',
  tooltip,
  tooltipLinkHref,
  tooltipLinkLabel = DETAILS_TOOLTIP_LABEL,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  tooltip?: string;
  tooltipLinkHref?: string;
  tooltipLinkLabel?: string;
}) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const badge = (
    <span className={cn('px-2 py-0.5 text-xs rounded-full font-medium', variants[variant])}>
      {children}
    </span>
  );

  if (tooltip) {
    return <Tooltip content={tooltip} linkHref={tooltipLinkHref} linkLabel={tooltipLinkLabel}>{badge}</Tooltip>;
  }

  return badge;
}

function buildScoreTooltip(wallet: WalletData): string {
  const lines = [
    `${wallet.name}: ${wallet.score}/100`,
    `Recommendation: ${wallet.recommendation}`,
    `Methodology: ${wallet.methodologyVersion}`,
  ];

  for (const entry of wallet.scoreBreakdown) {
    lines.push(`${entry.label}: ${entry.score}/${entry.max}`);
  }

  return lines.join('\n');
}

function calculateMedianScore<T extends { score: number }>(items: T[]): number {
  if (items.length === 0) return 0;
  const sortedScores = items.map(item => item.score).sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedScores.length / 2);
  if (sortedScores.length % 2 === 0) {
    return (sortedScores[middleIndex - 1] + sortedScores[middleIndex]) / 2;
  }
  return sortedScores[middleIndex];
}

function formatScoreReference(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function ScoreBreakdownPreview({
  breakdown,
  tooltipLinkHref,
}: {
  breakdown: WalletData['scoreBreakdown'];
  tooltipLinkHref: string;
}) {
  return (
    <Tooltip
      content="Breakdown by scoring category. Hover segments for category-level details."
      linkHref={tooltipLinkHref}
      linkLabel={METHODOLOGY_TOOLTIP_LABEL}
    >
      <div className="cursor-help">
        <ScoreBreakdownBar breakdown={breakdown} barClassName="h-1.5" />
      </div>
    </Tooltip>
  );
}

// Score badge
function ScoreBadge({
  score,
  recommendation,
  scoreMedian,
  tooltip,
  tooltipLinkHref,
  tooltipLinkLabel = METHODOLOGY_TOOLTIP_LABEL,
}: {
  score: number;
  recommendation: string;
  scoreMedian: number;
  tooltip?: string;
  tooltipLinkHref?: string;
  tooltipLinkLabel?: string;
}) {
  const isBelowMedian = score < scoreMedian;
  let variant: 'success' | 'warning' | 'error' = 'warning';
  if (isBelowMedian || recommendation === 'avoid' || recommendation === 'not-for-dev') variant = 'error';
  else if (recommendation === 'recommended') variant = 'success';

  const badge = (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ring-1',
          variant === 'success' && 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800/50 dark:drop-shadow-[0_0_6px_rgba(74,222,128,0.4)]',
          variant === 'warning' && 'bg-yellow-100 text-yellow-700 ring-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-800/50 dark:drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]',
          variant === 'error' && 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800/50 dark:drop-shadow-[0_0_6px_rgba(248,113,113,0.4)]'
        )}
      >
        {score}
      </div>
      <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            variant === 'success' && 'bg-green-500 dark:bg-green-400',
            variant === 'warning' && 'bg-yellow-500 dark:bg-yellow-400',
            variant === 'error' && 'bg-red-500 dark:bg-red-400'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      {isBelowMedian && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          Below median
        </span>
      )}
    </div>
  );

  const defaultTooltip = `Score: ${score}/100\nRecommendation: ${recommendation}\nMedian: ${formatScoreReference(scoreMedian)} (${isBelowMedian ? 'below median' : 'at or above median'})`;

  return <Tooltip content={tooltip || defaultTooltip} linkHref={tooltipLinkHref} linkLabel={tooltipLinkLabel}>{badge}</Tooltip>;
}

// Recommendation badge
function RecommendationBadge({
  recommendation,
  tooltipLinkHref,
  tooltipLinkLabel = DETAILS_TOOLTIP_LABEL,
}: {
  recommendation: string;
  tooltipLinkHref?: string;
  tooltipLinkLabel?: string;
}) {
  const config = {
    recommended: { label: `${SYMBOLS.check} Recommended`, variant: 'success' as const, tooltip: softwareWalletTooltips.recommendation.recommended },
    situational: { label: 'Situational', variant: 'warning' as const, tooltip: softwareWalletTooltips.recommendation.situational },
    avoid: { label: `${SYMBOLS.cross} Avoid`, variant: 'error' as const, tooltip: softwareWalletTooltips.recommendation.avoid },
    'not-for-dev': { label: 'Not for Dev', variant: 'default' as const, tooltip: softwareWalletTooltips.recommendation['not-for-dev'] },
  };

  const { label, variant, tooltip } = config[recommendation as keyof typeof config] || config.situational;
  return <Badge variant={variant} tooltip={tooltip} tooltipLinkHref={tooltipLinkHref} tooltipLinkLabel={tooltipLinkLabel}>{label}</Badge>;
}

// Device icons
function DeviceIcons({
  devices,
  tooltipLinkHref,
}: {
  devices: SoftwareWallet['devices'];
  tooltipLinkHref?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {devices.mobile && (
        <Tooltip content={softwareWalletTooltips.devices.mobile} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
          <span>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
      {devices.browser && (
        <Tooltip content={softwareWalletTooltips.devices.browser} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
          <span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
      {devices.desktop && (
        <Tooltip content={softwareWalletTooltips.devices.desktop} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
          <span>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
      {devices.web && (
        <Tooltip content={softwareWalletTooltips.devices.web} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
          <span>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
    </div>
  );
}

// Feature indicator
function FeatureIndicator({
  value,
  label,
  tooltip,
  tooltipLinkHref,
}: {
  value: boolean | string;
  label: string;
  tooltip?: string;
  tooltipLinkHref?: string;
}) {
  const getTooltipContent = () => {
    if (tooltip) return tooltip;
    if (typeof value === 'boolean') {
      return value ? `${label}: Supported` : `${label}: Not supported`;
    }
    return `${label}: ${value}`;
  };

  if (typeof value === 'boolean') {
    return (
      <Tooltip content={getTooltipContent()} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
        <span
          className={cn(
            'inline-flex items-center justify-center w-5 h-5 rounded-full',
            value ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-muted text-muted-foreground'
          )}
        >
          {value ? <Check className="h-3 w-3" /> : '−'}
        </span>
      </Tooltip>
    );
  }

  const isPartial = value === 'partial' || value === 'basic' || value === 'import';
  const isFull = value === 'full' || value === 'recent' || value === 'open' || value === 'active';

  return (
    <Tooltip content={getTooltipContent()} linkHref={tooltipLinkHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
      <span
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
          isFull && 'bg-green-100 text-green-600 dark:bg-green-900/30',
          isPartial && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
          !isFull && !isPartial && 'bg-muted text-muted-foreground'
        )}
      >
        {isFull ? '✓' : isPartial ? '~' : '−'}
      </span>
    </Tooltip>
  );
}
// Shared card wrapper for grid view
interface WalletItemCardProps {
  item: WalletData;
  isSelected: boolean;
  isAtMax: boolean;
  onToggleSelect: () => void;
  methodLink: string;
  detailHref: string;
  scoreMedian: number;
  nameSlot?: React.ReactNode;   // replaces default <Link> name if provided
  subNameSlot?: React.ReactNode; // shown below name in header (e.g. RecommendationBadge or cardType badge)
  children: React.ReactNode;    // body content between header and score breakdown
}

function WalletItemCard({
  item,
  isSelected,
  isAtMax,
  onToggleSelect,
  methodLink,
  detailHref,
  scoreMedian,
  nameSlot,
  subNameSlot,
  children,
}: WalletItemCardProps) {
  return (
    <div
      className={cn(
        'p-3 sm:p-4 border rounded-lg transition-all animate-slide-up',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge
            score={item.score}
            recommendation={item.recommendation}
            scoreMedian={scoreMedian}
            tooltip={buildScoreTooltip(item)}
            tooltipLinkHref={methodLink}
          />
          <div>
            {nameSlot ?? (
              <Link href={detailHref} className="font-semibold hover:underline">
                {item.name}
              </Link>
            )}
            {subNameSlot}
          </div>
        </div>
        <SelectionButton isSelected={isSelected} isAtMax={isAtMax} onToggleSelect={onToggleSelect} itemName={item.name} size="lg" />
      </div>

      {children}

      <div className="mb-0">
        <ScoreBreakdownPreview breakdown={item.scoreBreakdown} tooltipLinkHref={methodLink} />
      </div>
    </div>
  );
}

// Software wallet row/card
function SoftwareWalletItem({
  wallet,
  isSelected,
  isAtMax,
  onToggleSelect,
  viewMode,
  detailHref,
  scoreMedian,
}: { wallet: SoftwareWallet } & SelectableItemProps) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border odd:bg-muted/10 hover:bg-muted/50 transition-colors animate-slide-up">
        <td className="py-3 px-4">
          <SelectionButton isSelected={isSelected} isAtMax={isAtMax} onToggleSelect={onToggleSelect} itemName={wallet.name} size="sm" />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge
              score={wallet.score}
              recommendation={wallet.recommendation}
              scoreMedian={scoreMedian}
              tooltip={buildScoreTooltip(wallet)}
              tooltipLinkHref={TABLE_METHOD_LINKS.software}
            />
            <div>
              <Link href={detailHref} className="font-semibold hover:underline">
                {wallet.name}
              </Link>
              <div className="text-sm text-muted-foreground">{wallet.bestFor}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <RecommendationBadge recommendation={wallet.recommendation} tooltipLinkHref={detailHref} />
        </td>
        <td className="py-3 px-4">
          <DeviceIcons devices={wallet.devices} tooltipLinkHref={detailHref} />
        </td>
        <td className="py-3 px-4 text-sm">
          <ChainIcons chains={wallet.chains} tooltipLinkHref={detailHref} />
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-1">
            <FeatureIndicator value={wallet.txSimulation} label="Tx Simulation" tooltip={softwareWalletTooltips.features.txSimulation} tooltipLinkHref={detailHref} />
            <FeatureIndicator value={wallet.scamAlerts} label="Scam Alerts" tooltip={softwareWalletTooltips.features.scamAlerts} tooltipLinkHref={detailHref} />
            <FeatureIndicator value={wallet.hardwareSupport} label="HW Support" tooltip={softwareWalletTooltips.features.hardwareSupport} tooltipLinkHref={detailHref} />
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge
            variant={wallet.license === 'open' ? 'success' : wallet.license === 'partial' ? 'warning' : 'default'}
            tooltip={softwareWalletTooltips.license[wallet.license]}
            tooltipLinkHref={detailHref}
          >
            {wallet.licenseType}
          </Badge>
        </td>
        <td className="py-3 px-4">
          {wallet.github && (
            <a
              href={wallet.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
        </td>
      </tr>
    );
  }

  return (
    <WalletItemCard
      item={wallet}
      isSelected={isSelected}
      isAtMax={isAtMax}
      onToggleSelect={onToggleSelect}
      methodLink={TABLE_METHOD_LINKS.software}
      detailHref={detailHref}
      scoreMedian={scoreMedian}
      subNameSlot={<RecommendationBadge recommendation={wallet.recommendation} tooltipLinkHref={detailHref} />}
    >
      <p className="text-sm text-muted-foreground mb-3">{wallet.bestFor}</p>

      <div className="flex items-center gap-4 mb-3">
        <DeviceIcons devices={wallet.devices} tooltipLinkHref={detailHref} />
        <ChainIcons chains={wallet.chains} tooltipLinkHref={detailHref} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {wallet.txSimulation && (
          <Badge variant="info" tooltip={softwareWalletTooltips.features.txSimulation} tooltipLinkHref={detailHref}>
            <Shield className="h-3 w-3 inline mr-1" />
            Tx Sim
          </Badge>
        )}
        {wallet.scamAlerts !== 'none' && (
          <Badge variant="warning" tooltip={softwareWalletTooltips.features.scamAlerts} tooltipLinkHref={detailHref}>
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Scam Alerts
          </Badge>
        )}
        {wallet.hardwareSupport && (
          <Badge variant="default" tooltip={softwareWalletTooltips.features.hardwareSupport} tooltipLinkHref={detailHref}>
            <Zap className="h-3 w-3 inline mr-1" />
            HW
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <Badge
          variant={wallet.license === 'open' ? 'success' : wallet.license === 'partial' ? 'warning' : 'default'}
          tooltip={softwareWalletTooltips.license[wallet.license]}
          tooltipLinkHref={detailHref}
        >
          {wallet.licenseType}
        </Badge>
        {wallet.github && (
          <a
            href={wallet.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        )}
      </div>
    </WalletItemCard>
  );
}

// Hardware wallet row/card
function HardwareWalletItem({
  wallet,
  isSelected,
  isAtMax,
  onToggleSelect,
  viewMode,
  detailHref,
  scoreMedian,
}: { wallet: HardwareWallet } & SelectableItemProps) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border odd:bg-muted/10 hover:bg-muted/50 transition-colors animate-slide-up">
        <td className="py-3 px-4">
          <SelectionButton isSelected={isSelected} isAtMax={isAtMax} onToggleSelect={onToggleSelect} itemName={wallet.name} size="sm" />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge
              score={wallet.score}
              recommendation={wallet.recommendation}
              scoreMedian={scoreMedian}
              tooltip={buildScoreTooltip(wallet)}
              tooltipLinkHref={TABLE_METHOD_LINKS.hardware}
            />
            <div>
              <Link href={detailHref} className="font-semibold hover:underline">
                {wallet.name}
              </Link>
              <div className="text-sm text-muted-foreground">{wallet.priceText}</div>
              {wallet.priceLastChecked && (
                <div className="text-xs text-muted-foreground">
                  Price checked {wallet.priceLastChecked}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <RecommendationBadge recommendation={wallet.recommendation} tooltipLinkHref={detailHref} />
        </td>
        <td className="py-3 px-4">
          <FeatureIndicator
            value={wallet.airGap}
            label="Air-Gapped"
            tooltip={wallet.airGap ? hardwareWalletTooltips.airGap.true : hardwareWalletTooltips.airGap.false}
            tooltipLinkHref={detailHref}
          />
        </td>
        <td className="py-3 px-4">
          <FeatureIndicator
            value={wallet.secureElement}
            label="Secure Element"
            tooltip={wallet.secureElement ? hardwareWalletTooltips.secureElement.true : hardwareWalletTooltips.secureElement.false}
            tooltipLinkHref={detailHref}
          />
        </td>
        <td className="py-3 px-4">
          <Badge
            variant={wallet.openSource === 'full' ? 'success' : wallet.openSource === 'partial' ? 'warning' : 'default'}
            tooltip={hardwareWalletTooltips.openSource[wallet.openSource]}
            tooltipLinkHref={detailHref}
          >
            {wallet.openSource === 'full' ? 'Open' : wallet.openSource === 'partial' ? 'Partial' : 'Closed'}
          </Badge>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Connectivity options: ${wallet.connectivity.join(', ')}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{wallet.connectivity.join(', ')}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {wallet.github && (
              <a
                href={wallet.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {wallet.url && (
              <a
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <WalletItemCard
      item={wallet}
      isSelected={isSelected}
      isAtMax={isAtMax}
      onToggleSelect={onToggleSelect}
      methodLink={TABLE_METHOD_LINKS.hardware}
      detailHref={detailHref}
      scoreMedian={scoreMedian}
      subNameSlot={<RecommendationBadge recommendation={wallet.recommendation} tooltipLinkHref={detailHref} />}
    >
      <p className="text-lg font-semibold text-primary mb-1">{wallet.priceText}</p>
      {wallet.priceLastChecked && (
        <p className="text-xs text-muted-foreground mb-2">Price checked {wallet.priceLastChecked}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {wallet.airGap && (
          <Badge variant="success" tooltip={hardwareWalletTooltips.airGap.true} tooltipLinkHref={detailHref}>Air-Gapped</Badge>
        )}
        {wallet.secureElement && (
          <Badge variant="info" tooltip={hardwareWalletTooltips.secureElement.true} tooltipLinkHref={detailHref}>
            SE: {wallet.secureElementType || 'Yes'}
          </Badge>
        )}
        <Badge
          variant={wallet.openSource === 'full' ? 'success' : wallet.openSource === 'partial' ? 'warning' : 'default'}
          tooltip={hardwareWalletTooltips.openSource[wallet.openSource]}
          tooltipLinkHref={detailHref}
        >
          {wallet.openSource === 'full' ? 'Open Source' : wallet.openSource === 'partial' ? 'Partial OS' : 'Closed'}
        </Badge>
      </div>

      <Tooltip content={`Display: ${wallet.display}, Connectivity: ${wallet.connectivity.join(', ')}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
        <div className="text-sm text-muted-foreground mb-3 cursor-help">
          {wallet.display} • {wallet.connectivity.join(', ')}
        </div>
      </Tooltip>

      <div className="flex items-center gap-2 mb-3">
        {wallet.github && (
          <a
            href={wallet.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
        {wallet.url && (
          <a
            href={wallet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Website
          </a>
        )}
      </div>
    </WalletItemCard>
  );
}

// Crypto card row/card
function CryptoCardItem({
  card,
  isSelected,
  isAtMax,
  onToggleSelect,
  viewMode,
  detailHref,
  scoreMedian,
}: { card: CryptoCard } & SelectableItemProps) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border odd:bg-muted/10 hover:bg-muted/50 transition-colors animate-slide-up">
        <td className="py-3 px-4">
          <SelectionButton isSelected={isSelected} isAtMax={isAtMax} onToggleSelect={onToggleSelect} itemName={card.name} size="sm" />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge
              score={card.score}
              recommendation={card.recommendation}
              scoreMedian={scoreMedian}
              tooltip={buildScoreTooltip(card)}
              tooltipLinkHref={TABLE_METHOD_LINKS.cards}
            />
            <div>
              <div className="flex items-center gap-2">
                <Link href={detailHref} className="font-semibold hover:underline">
                  {card.name}
                </Link>
                {card.providerUrl && (
                  <a
                    href={card.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{card.bestFor}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge variant="info" tooltip={cryptoCardTooltips.cardType[card.cardType]} tooltipLinkHref={detailHref}>{card.cardType}</Badge>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={cryptoCardTooltips.region[card.regionCode as keyof typeof cryptoCardTooltips.region] || `Available in ${card.region}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{card.region}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4">
          <Tooltip content="Maximum cashback rate (may require staking or tier progression)" linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span className="font-semibold text-green-600 dark:text-green-400">{card.cashBack}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Rewards earned: ${card.rewards}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{card.rewards}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={card.annualFee === '$0' ? 'No annual fee' : `Annual fee: ${card.annualFee}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{card.annualFee}</span>
          </Tooltip>
        </td>
      </tr>
    );
  }

  return (
    <WalletItemCard
      item={card}
      isSelected={isSelected}
      isAtMax={isAtMax}
      onToggleSelect={onToggleSelect}
      methodLink={TABLE_METHOD_LINKS.cards}
      detailHref={detailHref}
      scoreMedian={scoreMedian}
      nameSlot={
        <div className="flex items-center gap-2">
          <Link href={detailHref} className="font-semibold hover:underline">
            {card.name}
          </Link>
          {card.providerUrl && (
            <a
              href={card.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      }
      subNameSlot={<Badge variant="info" tooltip={cryptoCardTooltips.cardType[card.cardType]} tooltipLinkHref={detailHref}>{card.cardType}</Badge>}
    >
      <Tooltip content="Maximum cashback rate (may require staking or tier progression)" linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 cursor-help">
          {card.cashBack}
        </div>
      </Tooltip>

      <p className="text-sm text-muted-foreground mb-3">{card.bestFor}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="default" tooltip={cryptoCardTooltips.region[card.regionCode as keyof typeof cryptoCardTooltips.region] || `Available in ${card.region}`} tooltipLinkHref={detailHref}>
          {card.region}
        </Badge>
        <Badge variant="default" tooltip={`Rewards earned: ${card.rewards}`} tooltipLinkHref={detailHref}>{card.rewards}</Badge>
        {card.businessSupport === 'yes' && (
          <Badge variant="info" tooltip={cryptoCardTooltips.businessSupport.yes} tooltipLinkHref={detailHref}>Business</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <Tooltip content={`Annual fee: ${card.annualFee}, Foreign exchange fee: ${card.fxFee}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
          <span className="text-muted-foreground cursor-help">
            Fee: {card.annualFee} | FX: {card.fxFee}
          </span>
        </Tooltip>
        {card.providerUrl && (
          <a
            href={card.providerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Apply
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </WalletItemCard>
  );
}

// Ramp row/card
function RampItem({
  ramp,
  isSelected,
  isAtMax,
  onToggleSelect,
  viewMode,
  detailHref,
  scoreMedian,
}: { ramp: Ramp } & SelectableItemProps) {
  const fundingEmoji = ramp.funding === 'sustainable' ? '🟢' : ramp.funding === 'vc' ? '🟡' : '🔴';

  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border odd:bg-muted/10 hover:bg-muted/50 transition-colors animate-slide-up">
        <td className="py-3 px-4">
          <SelectionButton isSelected={isSelected} isAtMax={isAtMax} onToggleSelect={onToggleSelect} itemName={ramp.name} size="sm" />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge
              score={ramp.score}
              recommendation={ramp.recommendation}
              scoreMedian={scoreMedian}
              tooltip={buildScoreTooltip(ramp)}
              tooltipLinkHref={TABLE_METHOD_LINKS.ramps}
            />
            <div>
              <div className="font-semibold">
                <Link href={detailHref} className="text-foreground hover:text-primary hover:underline">
                  {ramp.name}
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">{ramp.bestFor}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <RecommendationBadge recommendation={ramp.recommendation} tooltipLinkHref={detailHref} />
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {ramp.onRamp && (
              <Badge variant="success" tooltip="On-Ramp: Convert fiat currency to crypto" tooltipLinkHref={detailHref}>On-Ramp</Badge>
            )}
            {ramp.offRamp && (
              <Badge variant="info" tooltip="Off-Ramp: Convert crypto to fiat currency" tooltipLinkHref={detailHref}>Off-Ramp</Badge>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Geographic coverage: ${ramp.coverage}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{ramp.coverage}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={rampTooltips.feeModel[ramp.feeModel as keyof typeof rampTooltips.feeModel] || `Fee model: ${ramp.feeModel}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{ramp.feeModel}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Minimum transaction fee (approximate): ${ramp.minFee}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{ramp.minFee}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={rampTooltips.devUx[ramp.devUx as keyof typeof rampTooltips.devUx] || `Developer experience: ${ramp.devUx}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{ramp.devUx}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Founded year signal: ${ramp.foundedYear ?? 'Unknown'}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{ramp.foundedYear ?? 'Unknown'}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Funding durability signal: ${ramp.fundingSource} (${ramp.funding})`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span>{fundingEmoji} {ramp.fundingSource}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4">
          {ramp.url && (
            <a
              href={ramp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              title={`Visit ${ramp.name} website`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </td>
      </tr>
    );
  }

  return (
    <WalletItemCard
      item={ramp}
      isSelected={isSelected}
      isAtMax={isAtMax}
      onToggleSelect={onToggleSelect}
      methodLink={TABLE_METHOD_LINKS.ramps}
      detailHref={detailHref}
      scoreMedian={scoreMedian}
      subNameSlot={<RecommendationBadge recommendation={ramp.recommendation} tooltipLinkHref={detailHref} />}
    >
      <p className="text-sm text-muted-foreground mb-3">{ramp.bestFor}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {ramp.onRamp && (
          <Badge variant="success" tooltip="On-Ramp: Convert fiat currency to crypto" tooltipLinkHref={detailHref}>On-Ramp</Badge>
        )}
        {ramp.offRamp && (
          <Badge variant="info" tooltip="Off-Ramp: Convert crypto to fiat currency" tooltipLinkHref={detailHref}>Off-Ramp</Badge>
        )}
        <Badge variant="default" tooltip={`Geographic coverage: ${ramp.coverage}`} tooltipLinkHref={detailHref}>{ramp.coverage}</Badge>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fee Model:</span>
          <Tooltip content={rampTooltips.feeModel[ramp.feeModel as keyof typeof rampTooltips.feeModel] || `Fee model: ${ramp.feeModel}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span className="font-medium cursor-help">{ramp.feeModel}</span>
          </Tooltip>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Fee:</span>
          <Tooltip content={`Minimum transaction fee (approximate): ${ramp.minFee}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span className="font-medium cursor-help">{ramp.minFee}</span>
          </Tooltip>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dev UX:</span>
          <Tooltip content={rampTooltips.devUx[ramp.devUx as keyof typeof rampTooltips.devUx] || `Developer experience: ${ramp.devUx}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span className="font-medium cursor-help">{ramp.devUx}</span>
          </Tooltip>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Founded:</span>
          <Tooltip content={`Founded year signal: ${ramp.foundedYear ?? 'Unknown'}`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span className="font-medium cursor-help">{ramp.foundedYear ?? 'Unknown'}</span>
          </Tooltip>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Funding:</span>
          <Tooltip content={`Funding durability signal: ${ramp.fundingSource} (${ramp.funding})`} linkHref={detailHref} linkLabel={DETAILS_TOOLTIP_LABEL}>
            <span className="font-medium cursor-help text-right">{fundingEmoji} {ramp.fundingSource}</span>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        {ramp.url && (
          <a
            href={ramp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Visit Website
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </WalletItemCard>
  );
}


// Main table/grid component
interface WalletTableProps<T extends WalletData> {
  wallets: T[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  viewMode?: 'grid' | 'table';
  type: 'software' | 'hardware' | 'cards' | 'ramps';
  maxSelected?: number;
  onResetFilters?: () => void;
}

export function WalletTable<T extends WalletData>({
  wallets,
  selectedIds,
  onToggleSelect,
  viewMode = 'grid',
  type,
  maxSelected = 4,
  onResetFilters,
}: WalletTableProps<T>) {
  const isAtMax = selectedIds.length >= maxSelected;
  const headerMethodLink = TABLE_METHOD_LINKS[type];
  const mobileHeaderCellClassName =
    'py-3 px-4 text-left text-sm font-medium sticky top-0 z-20 border-b border-border bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 sm:static sm:bg-transparent sm:backdrop-blur-0';

  if (wallets.length === 0) {
    return <EmptyState type={type} onResetFilters={onResetFilters} />;
  }
  const scoreMedian = calculateMedianScore(wallets);

  if (viewMode === 'table') {
    return (
      <>
        <p className="mb-2 text-xs text-muted-foreground sm:hidden">
          Swipe horizontally to view all columns.
        </p>
        <div className="max-h-[70vh] overflow-auto overscroll-contain [WebkitOverflowScrolling:touch] border border-border rounded-lg sm:max-h-none sm:overflow-visible sm:border-0 sm:rounded-none">
          <table className="w-full">
          <thead>
            <tr>
              <th className={mobileHeaderCellClassName}>
                <HeaderTooltip label="Compare" tooltip={softwareWalletTooltips.headers.compare} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
              </th>
              <th className={mobileHeaderCellClassName}>
                <HeaderTooltip label="Wallet" tooltip={softwareWalletTooltips.headers.wallet} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
              </th>
              {(type === 'software' || type === 'hardware' || type === 'ramps') && (
                <th className={mobileHeaderCellClassName}>
                  <HeaderTooltip label="Status" tooltip={softwareWalletTooltips.headers.status} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                </th>
              )}
              {type === 'cards' && (
                <th className={mobileHeaderCellClassName}>
                  <HeaderTooltip label="Type" tooltip={cryptoCardTooltips.headers.cardType} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                </th>
              )}
              {type === 'software' && (
                <>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Platforms" tooltip={softwareWalletTooltips.headers.platforms} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Chains" tooltip={softwareWalletTooltips.headers.chains} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Features" tooltip={softwareWalletTooltips.headers.features} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="License" tooltip={softwareWalletTooltips.headers.license} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                </>
              )}
              {type === 'hardware' && (
                <>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Air-Gap" tooltip={hardwareWalletTooltips.headers.airGap} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="SE" tooltip={hardwareWalletTooltips.headers.secureElement} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Open Source" tooltip={hardwareWalletTooltips.headers.openSource} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Connectivity" tooltip={hardwareWalletTooltips.headers.connectivity} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                </>
              )}
              {type === 'cards' && (
                <>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Region" tooltip={cryptoCardTooltips.headers.region} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Cashback" tooltip={cryptoCardTooltips.headers.cashback} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Rewards" tooltip={cryptoCardTooltips.headers.rewards} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Annual Fee" tooltip={cryptoCardTooltips.headers.annualFee} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                </>
              )}
              {type === 'ramps' && (
                <>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Type" tooltip={rampTooltips.headers.type} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Coverage" tooltip={rampTooltips.headers.coverage} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Fee Model" tooltip={rampTooltips.headers.feeModel} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Min Fee" tooltip={rampTooltips.headers.minFee} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Dev UX" tooltip={rampTooltips.headers.devUx} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Founded" tooltip={rampTooltips.headers.founded} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Funding" tooltip={rampTooltips.headers.funding} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                  <th className={mobileHeaderCellClassName}>
                    <HeaderTooltip label="Links" tooltip={rampTooltips.headers.links} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                  </th>
                </>
              )}
              {(type === 'software' || type === 'hardware') && (
                <th className={mobileHeaderCellClassName}>
                  <HeaderTooltip label="Links" tooltip={softwareWalletTooltips.headers.links} linkHref={headerMethodLink} linkLabel={METHODOLOGY_TOOLTIP_LABEL} />
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {wallets.map(wallet => {
              const isSelected = selectedIds.includes(wallet.id);
              if (type === 'software') {
                return (
                  <SoftwareWalletItem
                    key={wallet.id}
                    wallet={wallet as SoftwareWallet}
                    isSelected={isSelected}
                    isAtMax={isAtMax}
                    onToggleSelect={() => onToggleSelect(wallet.id)}
                    viewMode="table"
                    detailHref={getWalletDetailHref('software', wallet.id)}
                    scoreMedian={scoreMedian}
                  />
                );
              }
              if (type === 'hardware') {
                return (
                  <HardwareWalletItem
                    key={wallet.id}
                    wallet={wallet as HardwareWallet}
                    isSelected={isSelected}
                    isAtMax={isAtMax}
                    onToggleSelect={() => onToggleSelect(wallet.id)}
                    viewMode="table"
                    detailHref={getWalletDetailHref('hardware', wallet.id)}
                    scoreMedian={scoreMedian}
                  />
                );
              }
              if (type === 'cards') {
                return (
                  <CryptoCardItem
                    key={wallet.id}
                    card={wallet as CryptoCard}
                    isSelected={isSelected}
                    isAtMax={isAtMax}
                    onToggleSelect={() => onToggleSelect(wallet.id)}
                    viewMode="table"
                    detailHref={getWalletDetailHref('cards', wallet.id)}
                    scoreMedian={scoreMedian}
                  />
                );
              }
              return (
                <RampItem
                  key={wallet.id}
                  ramp={wallet as Ramp}
                  isSelected={isSelected}
                  isAtMax={isAtMax}
                  onToggleSelect={() => onToggleSelect(wallet.id)}
                  viewMode="table"
                  detailHref={getWalletDetailHref('ramps', wallet.id)}
                  scoreMedian={scoreMedian}
                />
              );
            })}
          </tbody>
          </table>
        </div>
      </>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {wallets.map(wallet => {
        const isSelected = selectedIds.includes(wallet.id);
        if (type === 'software') {
          return (
            <SoftwareWalletItem
              key={wallet.id}
              wallet={wallet as SoftwareWallet}
              isSelected={isSelected}
              isAtMax={isAtMax}
              onToggleSelect={() => onToggleSelect(wallet.id)}
              viewMode="grid"
              detailHref={getWalletDetailHref('software', wallet.id)}
              scoreMedian={scoreMedian}
            />
          );
        }
        if (type === 'hardware') {
          return (
            <HardwareWalletItem
              key={wallet.id}
              wallet={wallet as HardwareWallet}
              isSelected={isSelected}
              isAtMax={isAtMax}
              onToggleSelect={() => onToggleSelect(wallet.id)}
              viewMode="grid"
              detailHref={getWalletDetailHref('hardware', wallet.id)}
              scoreMedian={scoreMedian}
            />
          );
        }
        if (type === 'cards') {
          return (
            <CryptoCardItem
              key={wallet.id}
              card={wallet as CryptoCard}
              isSelected={isSelected}
              isAtMax={isAtMax}
              onToggleSelect={() => onToggleSelect(wallet.id)}
              viewMode="grid"
              detailHref={getWalletDetailHref('cards', wallet.id)}
              scoreMedian={scoreMedian}
            />
          );
        }
        return (
          <RampItem
            key={wallet.id}
            ramp={wallet as Ramp}
            isSelected={isSelected}
            isAtMax={isAtMax}
            onToggleSelect={() => onToggleSelect(wallet.id)}
            viewMode="grid"
            detailHref={getWalletDetailHref('ramps', wallet.id)}
            scoreMedian={scoreMedian}
          />
        );
      })}
    </div>
  );
}
