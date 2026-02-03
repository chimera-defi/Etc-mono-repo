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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tooltip, HeaderTooltip } from '@/components/Tooltip';
import {
  softwareWalletTooltips,
  hardwareWalletTooltips,
  cryptoCardTooltips,
  rampTooltips,
  commonTooltips,
} from '@/lib/tooltip-content';
import type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, SupportedChains, WalletData } from '@/types/wallets';

export type { CryptoCard, HardwareWallet, Ramp, SoftwareWallet, WalletData };

// Helper function to generate tooltip text for chain support
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

// Chain icon configuration
const chainIcons: { key: keyof Omit<SupportedChains, 'raw' | 'other'>; src: string; alt: string; tooltip: string }[] = [
  { key: 'evm', src: '/chains/eth.svg', alt: 'EVM', tooltip: commonTooltips.chains.evm },
  { key: 'bitcoin', src: '/chains/btc.svg', alt: 'Bitcoin', tooltip: commonTooltips.chains.bitcoin },
  { key: 'solana', src: '/chains/sol.svg', alt: 'Solana', tooltip: commonTooltips.chains.solana },
  { key: 'move', src: '/chains/move.svg', alt: 'Move', tooltip: commonTooltips.chains.move },
  { key: 'cosmos', src: '/chains/cosmos.svg', alt: 'Cosmos', tooltip: commonTooltips.chains.cosmos },
  { key: 'polkadot', src: '/chains/polkadot.svg', alt: 'Polkadot', tooltip: commonTooltips.chains.polkadot },
  { key: 'starknet', src: '/chains/starknet.svg', alt: 'Starknet', tooltip: commonTooltips.chains.starknet },
];

function getWalletDetailHref(type: 'software' | 'hardware' | 'cards' | 'ramps', id: string) {
  return `/wallets/${type}/${id}`;
}

// Component to render chain icons
function ChainIcons({ chains }: { chains: SupportedChains }) {
  return (
    <div className="flex items-center gap-0.5" title={getChainTooltip(chains)}>
      {chainIcons.map(({ key, src, alt, tooltip }) =>
        chains[key] && (
          <Tooltip key={key} content={tooltip}>
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
        <Tooltip content={commonTooltips.chains.other}>
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
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  tooltip?: string;
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
    return <Tooltip content={tooltip}>{badge}</Tooltip>;
  }

  return badge;
}

// Score badge
function ScoreBadge({ score, tooltip }: { score: number; tooltip?: string }) {
  let variant: 'success' | 'warning' | 'error' = 'warning';
  if (score >= 75) variant = 'success';
  else if (score < 50) variant = 'error';

  const badge = (
    <div
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
        variant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        variant === 'warning' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        variant === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      )}
    >
      {score}
    </div>
  );

  const defaultTooltip = `Score: ${score}/100 - ${variant === 'success' ? 'Recommended' : variant === 'warning' ? 'Situational' : 'Avoid'}`;

  return <Tooltip content={tooltip || defaultTooltip}>{badge}</Tooltip>;
}

// Recommendation badge
function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const config = {
    recommended: { label: 'Recommended', variant: 'success' as const, tooltip: softwareWalletTooltips.recommendation.recommended },
    situational: { label: 'Situational', variant: 'warning' as const, tooltip: softwareWalletTooltips.recommendation.situational },
    avoid: { label: 'Avoid', variant: 'error' as const, tooltip: softwareWalletTooltips.recommendation.avoid },
    'not-for-dev': { label: 'Not for Dev', variant: 'default' as const, tooltip: softwareWalletTooltips.recommendation['not-for-dev'] },
  };

  const { label, variant, tooltip } = config[recommendation as keyof typeof config] || config.situational;
  return <Badge variant={variant} tooltip={tooltip}>{label}</Badge>;
}

// Device icons
function DeviceIcons({ devices }: { devices: SoftwareWallet['devices'] }) {
  return (
    <div className="flex items-center gap-1">
      {devices.mobile && (
        <Tooltip content={softwareWalletTooltips.devices.mobile}>
          <span>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
      {devices.browser && (
        <Tooltip content={softwareWalletTooltips.devices.browser}>
          <span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
      {devices.desktop && (
        <Tooltip content={softwareWalletTooltips.devices.desktop}>
          <span>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
      {devices.web && (
        <Tooltip content={softwareWalletTooltips.devices.web}>
          <span>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </span>
        </Tooltip>
      )}
    </div>
  );
}

// Feature indicator
function FeatureIndicator({ value, label, tooltip }: { value: boolean | string; label: string; tooltip?: string }) {
  const getTooltipContent = () => {
    if (tooltip) return tooltip;
    if (typeof value === 'boolean') {
      return value ? `${label}: Supported` : `${label}: Not supported`;
    }
    return `${label}: ${value}`;
  };

  if (typeof value === 'boolean') {
    return (
      <Tooltip content={getTooltipContent()}>
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
    <Tooltip content={getTooltipContent()}>
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

// Software wallet row/card
function SoftwareWalletItem({
  wallet,
  isSelected,
  onToggleSelect,
  viewMode,
  detailHref,
}: {
  wallet: SoftwareWallet;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
  detailHref: string;
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
            aria-label={isSelected ? `Remove ${wallet.name} from comparison` : `Add ${wallet.name} to comparison`}
            className={cn(
              'p-1 rounded border transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary'
            )}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={wallet.score} />
            <div>
              <Link href={detailHref} className="font-semibold hover:underline">
                {wallet.name}
              </Link>
              <div className="text-sm text-muted-foreground">{wallet.bestFor}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <RecommendationBadge recommendation={wallet.recommendation} />
        </td>
        <td className="py-3 px-4">
          <DeviceIcons devices={wallet.devices} />
        </td>
        <td className="py-3 px-4 text-sm">
          <ChainIcons chains={wallet.chains} />
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-1">
            <FeatureIndicator value={wallet.txSimulation} label="Tx Simulation" tooltip={softwareWalletTooltips.features.txSimulation} />
            <FeatureIndicator value={wallet.scamAlerts} label="Scam Alerts" tooltip={softwareWalletTooltips.features.scamAlerts} />
            <FeatureIndicator value={wallet.hardwareSupport} label="HW Support" tooltip={softwareWalletTooltips.features.hardwareSupport} />
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge
            variant={wallet.license === 'open' ? 'success' : wallet.license === 'partial' ? 'warning' : 'default'}
            tooltip={softwareWalletTooltips.license[wallet.license]}
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

  // Grid/card view
  return (
    <div
      className={cn(
        'p-4 border rounded-lg transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={wallet.score} />
          <div>
            <Link href={detailHref} className="font-semibold hover:underline">
              {wallet.name}
            </Link>
            <RecommendationBadge recommendation={wallet.recommendation} />
          </div>
        </div>
        <button
          onClick={onToggleSelect}
          aria-label={isSelected ? `Remove ${wallet.name} from comparison` : `Add ${wallet.name} to comparison`}
          className={cn(
            'p-2 rounded-lg border transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary hover:bg-muted'
          )}
          title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{wallet.bestFor}</p>

      <div className="flex items-center gap-4 mb-3">
        <DeviceIcons devices={wallet.devices} />
        <ChainIcons chains={wallet.chains} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {wallet.txSimulation && (
          <Badge variant="info" tooltip={softwareWalletTooltips.features.txSimulation}>
            <Shield className="h-3 w-3 inline mr-1" />
            Tx Sim
          </Badge>
        )}
        {wallet.scamAlerts !== 'none' && (
          <Badge variant="warning" tooltip={softwareWalletTooltips.features.scamAlerts}>
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Scam Alerts
          </Badge>
        )}
        {wallet.hardwareSupport && (
          <Badge variant="default" tooltip={softwareWalletTooltips.features.hardwareSupport}>
            <Zap className="h-3 w-3 inline mr-1" />
            HW
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Badge
          variant={wallet.license === 'open' ? 'success' : wallet.license === 'partial' ? 'warning' : 'default'}
          tooltip={softwareWalletTooltips.license[wallet.license]}
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
    </div>
  );
}

// Hardware wallet row/card
function HardwareWalletItem({
  wallet,
  isSelected,
  onToggleSelect,
  viewMode,
  detailHref,
}: {
  wallet: HardwareWallet;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
  detailHref: string;
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
            aria-label={isSelected ? `Remove ${wallet.name} from comparison` : `Add ${wallet.name} to comparison`}
            className={cn(
              'p-1 rounded border transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary'
            )}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={wallet.score} />
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
          <RecommendationBadge recommendation={wallet.recommendation} />
        </td>
        <td className="py-3 px-4">
          <FeatureIndicator
            value={wallet.airGap}
            label="Air-Gapped"
            tooltip={wallet.airGap ? hardwareWalletTooltips.airGap.true : hardwareWalletTooltips.airGap.false}
          />
        </td>
        <td className="py-3 px-4">
          <FeatureIndicator
            value={wallet.secureElement}
            label="Secure Element"
            tooltip={wallet.secureElement ? hardwareWalletTooltips.secureElement.true : hardwareWalletTooltips.secureElement.false}
          />
        </td>
        <td className="py-3 px-4">
          <Badge
            variant={wallet.openSource === 'full' ? 'success' : wallet.openSource === 'partial' ? 'warning' : 'default'}
            tooltip={hardwareWalletTooltips.openSource[wallet.openSource]}
          >
            {wallet.openSource === 'full' ? 'Open' : wallet.openSource === 'partial' ? 'Partial' : 'Closed'}
          </Badge>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Connectivity options: ${wallet.connectivity.join(', ')}`}>
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

  // Grid/card view
  return (
    <div
      className={cn(
        'p-4 border rounded-lg transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={wallet.score} />
          <div>
            <Link href={detailHref} className="font-semibold hover:underline">
              {wallet.name}
            </Link>
            <RecommendationBadge recommendation={wallet.recommendation} />
          </div>
        </div>
        <button
          onClick={onToggleSelect}
          className={cn(
            'p-2 rounded-lg border transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary hover:bg-muted'
          )}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <p className="text-lg font-semibold text-primary mb-1">{wallet.priceText}</p>
      {wallet.priceLastChecked && (
        <p className="text-xs text-muted-foreground mb-2">Price checked {wallet.priceLastChecked}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {wallet.airGap && (
          <Badge variant="success" tooltip={hardwareWalletTooltips.airGap.true}>Air-Gapped</Badge>
        )}
        {wallet.secureElement && (
          <Badge variant="info" tooltip={hardwareWalletTooltips.secureElement.true}>
            SE: {wallet.secureElementType || 'Yes'}
          </Badge>
        )}
        <Badge
          variant={wallet.openSource === 'full' ? 'success' : wallet.openSource === 'partial' ? 'warning' : 'default'}
          tooltip={hardwareWalletTooltips.openSource[wallet.openSource]}
        >
          {wallet.openSource === 'full' ? 'Open Source' : wallet.openSource === 'partial' ? 'Partial OS' : 'Closed'}
        </Badge>
      </div>

      <Tooltip content={`Display: ${wallet.display}, Connectivity: ${wallet.connectivity.join(', ')}`}>
        <div className="text-sm text-muted-foreground mb-3 cursor-help">
          {wallet.display} • {wallet.connectivity.join(', ')}
        </div>
      </Tooltip>

      <div className="flex items-center gap-2">
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
    </div>
  );
}

// Crypto card row/card
function CryptoCardItem({
  card,
  isSelected,
  onToggleSelect,
  viewMode,
  detailHref,
}: {
  card: CryptoCard;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
  detailHref: string;
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
            aria-label={isSelected ? `Remove ${card.name} from comparison` : `Add ${card.name} to comparison`}
            className={cn(
              'p-1 rounded border transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary'
            )}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={card.score} />
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
          <Badge variant="info" tooltip={cryptoCardTooltips.cardType[card.cardType]}>{card.cardType}</Badge>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={cryptoCardTooltips.region[card.regionCode as keyof typeof cryptoCardTooltips.region] || `Available in ${card.region}`}>
            <span>{card.region}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4">
          <Tooltip content="Maximum cashback rate (may require staking or tier progression)">
            <span className="font-semibold text-green-600 dark:text-green-400">{card.cashBack}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Rewards earned: ${card.rewards}`}>
            <span>{card.rewards}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={card.annualFee === '$0' ? 'No annual fee' : `Annual fee: ${card.annualFee}`}>
            <span>{card.annualFee}</span>
          </Tooltip>
        </td>
      </tr>
    );
  }

  // Grid/card view
  return (
    <div
      className={cn(
        'p-4 border rounded-lg transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={card.score} />
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
            <Badge variant="info" tooltip={cryptoCardTooltips.cardType[card.cardType]}>{card.cardType}</Badge>
          </div>
        </div>
        <button
          onClick={onToggleSelect}
          className={cn(
            'p-2 rounded-lg border transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary hover:bg-muted'
          )}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <Tooltip content="Maximum cashback rate (may require staking or tier progression)">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 cursor-help">
          {card.cashBack}
        </div>
      </Tooltip>

      <p className="text-sm text-muted-foreground mb-3">{card.bestFor}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="default" tooltip={cryptoCardTooltips.region[card.regionCode as keyof typeof cryptoCardTooltips.region] || `Available in ${card.region}`}>
          {card.region}
        </Badge>
        <Badge variant="default" tooltip={`Rewards earned: ${card.rewards}`}>{card.rewards}</Badge>
        {card.businessSupport === 'yes' && (
          <Badge variant="info" tooltip={cryptoCardTooltips.businessSupport.yes}>Business</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Tooltip content={`Annual fee: ${card.annualFee}, Foreign exchange fee: ${card.fxFee}`}>
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
    </div>
  );
}

// Ramp row/card
function RampItem({
  ramp,
  isSelected,
  onToggleSelect,
  viewMode,
  detailHref,
}: {
  ramp: Ramp;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
  detailHref: string;
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
            aria-label={isSelected ? `Remove ${ramp.name} from comparison` : `Add ${ramp.name} to comparison`}
            className={cn(
              'p-1 rounded border transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary'
            )}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <ScoreBadge score={ramp.score} />
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
          <RecommendationBadge recommendation={ramp.recommendation} />
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {ramp.onRamp && (
              <Badge variant="success" tooltip="On-Ramp: Convert fiat currency to crypto">On-Ramp</Badge>
            )}
            {ramp.offRamp && (
              <Badge variant="info" tooltip="Off-Ramp: Convert crypto to fiat currency">Off-Ramp</Badge>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Geographic coverage: ${ramp.coverage}`}>
            <span>{ramp.coverage}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={rampTooltips.feeModel[ramp.feeModel as keyof typeof rampTooltips.feeModel] || `Fee model: ${ramp.feeModel}`}>
            <span>{ramp.feeModel}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={`Minimum transaction fee (approximate): ${ramp.minFee}`}>
            <span>{ramp.minFee}</span>
          </Tooltip>
        </td>
        <td className="py-3 px-4 text-sm">
          <Tooltip content={rampTooltips.devUx[ramp.devUx as keyof typeof rampTooltips.devUx] || `Developer experience: ${ramp.devUx}`}>
            <span>{ramp.devUx}</span>
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

  // Grid/card view
  return (
    <div
      className={cn(
        'p-4 border rounded-lg transition-all',
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={ramp.score} />
          <div>
            <Link href={detailHref} className="font-semibold hover:underline">
              {ramp.name}
            </Link>
            <RecommendationBadge recommendation={ramp.recommendation} />
          </div>
        </div>
        <button
          onClick={onToggleSelect}
          className={cn(
            'p-2 rounded-lg border transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary hover:bg-muted'
          )}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{ramp.bestFor}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {ramp.onRamp && (
          <Badge variant="success" tooltip="On-Ramp: Convert fiat currency to crypto">On-Ramp</Badge>
        )}
        {ramp.offRamp && (
          <Badge variant="info" tooltip="Off-Ramp: Convert crypto to fiat currency">Off-Ramp</Badge>
        )}
        <Badge variant="default" tooltip={`Geographic coverage: ${ramp.coverage}`}>{ramp.coverage}</Badge>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fee Model:</span>
          <Tooltip content={rampTooltips.feeModel[ramp.feeModel as keyof typeof rampTooltips.feeModel] || `Fee model: ${ramp.feeModel}`}>
            <span className="font-medium cursor-help">{ramp.feeModel}</span>
          </Tooltip>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Fee:</span>
          <Tooltip content={`Minimum transaction fee (approximate): ${ramp.minFee}`}>
            <span className="font-medium cursor-help">{ramp.minFee}</span>
          </Tooltip>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dev UX:</span>
          <Tooltip content={rampTooltips.devUx[ramp.devUx as keyof typeof rampTooltips.devUx] || `Developer experience: ${ramp.devUx}`}>
            <span className="font-medium cursor-help">{ramp.devUx}</span>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
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
    </div>
  );
}

// Main table/grid component
interface WalletTableProps<T extends WalletData> {
  wallets: T[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  viewMode?: 'grid' | 'table';
  type: 'software' | 'hardware' | 'cards' | 'ramps';
}

export function WalletTable<T extends WalletData>({
  wallets,
  selectedIds,
  onToggleSelect,
  viewMode = 'grid',
  type,
}: WalletTableProps<T>) {
  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-2">No wallets match your filters</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filter criteria</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="py-3 px-4 text-left text-sm font-medium">
                <HeaderTooltip label="Compare" tooltip={softwareWalletTooltips.headers.compare} />
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium">
                <HeaderTooltip label="Wallet" tooltip={softwareWalletTooltips.headers.wallet} />
              </th>
              {(type === 'software' || type === 'hardware' || type === 'ramps') && (
                <th className="py-3 px-4 text-left text-sm font-medium">
                  <HeaderTooltip label="Status" tooltip={softwareWalletTooltips.headers.status} />
                </th>
              )}
              {type === 'cards' && (
                <th className="py-3 px-4 text-left text-sm font-medium">
                  <HeaderTooltip label="Type" tooltip={cryptoCardTooltips.headers.cardType} />
                </th>
              )}
              {type === 'software' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Platforms" tooltip={softwareWalletTooltips.headers.platforms} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Chains" tooltip={softwareWalletTooltips.headers.chains} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Features" tooltip={softwareWalletTooltips.headers.features} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="License" tooltip={softwareWalletTooltips.headers.license} />
                  </th>
                </>
              )}
              {type === 'hardware' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Air-Gap" tooltip={hardwareWalletTooltips.headers.airGap} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="SE" tooltip={hardwareWalletTooltips.headers.secureElement} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Open Source" tooltip={hardwareWalletTooltips.headers.openSource} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Connectivity" tooltip={hardwareWalletTooltips.headers.connectivity} />
                  </th>
                </>
              )}
              {type === 'cards' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Region" tooltip={cryptoCardTooltips.headers.region} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Cashback" tooltip={cryptoCardTooltips.headers.cashback} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Rewards" tooltip={cryptoCardTooltips.headers.rewards} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Annual Fee" tooltip={cryptoCardTooltips.headers.annualFee} />
                  </th>
                </>
              )}
              {type === 'ramps' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Type" tooltip={rampTooltips.headers.type} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Coverage" tooltip={rampTooltips.headers.coverage} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Fee Model" tooltip={rampTooltips.headers.feeModel} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Min Fee" tooltip={rampTooltips.headers.minFee} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Dev UX" tooltip={rampTooltips.headers.devUx} />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium">
                    <HeaderTooltip label="Links" tooltip={rampTooltips.headers.links} />
                  </th>
                </>
              )}
              {(type === 'software' || type === 'hardware') && (
                <th className="py-3 px-4 text-left text-sm font-medium">
                  <HeaderTooltip label="Links" tooltip={softwareWalletTooltips.headers.links} />
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
                    onToggleSelect={() => onToggleSelect(wallet.id)}
                    viewMode="table"
                    detailHref={getWalletDetailHref('software', wallet.id)}
                  />
                );
              }
              if (type === 'hardware') {
                return (
                  <HardwareWalletItem
                    key={wallet.id}
                    wallet={wallet as HardwareWallet}
                    isSelected={isSelected}
                    onToggleSelect={() => onToggleSelect(wallet.id)}
                    viewMode="table"
                    detailHref={getWalletDetailHref('hardware', wallet.id)}
                  />
                );
              }
              if (type === 'cards') {
                return (
                  <CryptoCardItem
                    key={wallet.id}
                    card={wallet as CryptoCard}
                    isSelected={isSelected}
                    onToggleSelect={() => onToggleSelect(wallet.id)}
                    viewMode="table"
                    detailHref={getWalletDetailHref('cards', wallet.id)}
                  />
                );
              }
              return (
                <RampItem
                  key={wallet.id}
                  ramp={wallet as Ramp}
                  isSelected={isSelected}
                  onToggleSelect={() => onToggleSelect(wallet.id)}
                  viewMode="table"
                  detailHref={getWalletDetailHref('ramps', wallet.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
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
              onToggleSelect={() => onToggleSelect(wallet.id)}
              viewMode="grid"
              detailHref={getWalletDetailHref('software', wallet.id)}
            />
          );
        }
        if (type === 'hardware') {
          return (
            <HardwareWalletItem
              key={wallet.id}
              wallet={wallet as HardwareWallet}
              isSelected={isSelected}
              onToggleSelect={() => onToggleSelect(wallet.id)}
              viewMode="grid"
              detailHref={getWalletDetailHref('hardware', wallet.id)}
            />
          );
        }
        if (type === 'cards') {
          return (
            <CryptoCardItem
              key={wallet.id}
              card={wallet as CryptoCard}
              isSelected={isSelected}
              onToggleSelect={() => onToggleSelect(wallet.id)}
              viewMode="grid"
              detailHref={getWalletDetailHref('cards', wallet.id)}
            />
          );
        }
        return (
          <RampItem
            key={wallet.id}
            ramp={wallet as Ramp}
            isSelected={isSelected}
            onToggleSelect={() => onToggleSelect(wallet.id)}
            viewMode="grid"
            detailHref={getWalletDetailHref('ramps', wallet.id)}
          />
        );
      })}
    </div>
  );
}
