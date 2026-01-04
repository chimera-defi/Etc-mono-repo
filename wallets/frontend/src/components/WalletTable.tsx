'use client';

import Link from 'next/link';
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
import { cn } from '@/lib/utils';
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
const chainIcons: { key: keyof Omit<SupportedChains, 'raw' | 'other'>; src: string; alt: string }[] = [
  { key: 'evm', src: '/chains/eth.svg', alt: 'EVM' },
  { key: 'bitcoin', src: '/chains/btc.svg', alt: 'Bitcoin' },
  { key: 'solana', src: '/chains/sol.svg', alt: 'Solana' },
  { key: 'move', src: '/chains/move.svg', alt: 'Move' },
  { key: 'cosmos', src: '/chains/cosmos.svg', alt: 'Cosmos' },
  { key: 'polkadot', src: '/chains/polkadot.svg', alt: 'Polkadot' },
  { key: 'starknet', src: '/chains/starknet.svg', alt: 'Starknet' },
];

// Component to render chain icons
function ChainIcons({ chains }: { chains: SupportedChains }) {
  return (
    <div className="flex items-center gap-0.5" title={getChainTooltip(chains)}>
      {chainIcons.map(({ key, src, alt }) => 
        chains[key] && (
          <img 
            key={key}
            src={src} 
            alt={alt} 
            width={16} 
            height={16} 
            className="inline-block"
            title={alt}
          />
        )
      )}
      {chains.other && <span className="text-xs text-muted-foreground ml-0.5">+</span>}
    </div>
  );
}

// Badge component
function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span className={cn('px-2 py-0.5 text-xs rounded-full font-medium', variants[variant])}>
      {children}
    </span>
  );
}

// Score badge
function ScoreBadge({ score }: { score: number }) {
  let variant: 'success' | 'warning' | 'error' = 'warning';
  if (score >= 75) variant = 'success';
  else if (score < 50) variant = 'error';

  return (
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
}

// Recommendation badge
function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const config = {
    recommended: { label: 'Recommended', variant: 'success' as const },
    situational: { label: 'Situational', variant: 'warning' as const },
    avoid: { label: 'Avoid', variant: 'error' as const },
    'not-for-dev': { label: 'Not for Dev', variant: 'default' as const },
  };

  const { label, variant } = config[recommendation as keyof typeof config] || config.situational;
  return <Badge variant={variant}>{label}</Badge>;
}

// Device icons
function DeviceIcons({ devices }: { devices: SoftwareWallet['devices'] }) {
  return (
    <div className="flex items-center gap-1">
      {devices.mobile && (
        <span title="Mobile">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
      {devices.browser && (
        <span title="Browser Extension">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
      {devices.desktop && (
        <span title="Desktop">
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
      {devices.web && (
        <span title="Web App">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
    </div>
  );
}

// Feature indicator
function FeatureIndicator({ value, label }: { value: boolean | string; label: string }) {
  if (typeof value === 'boolean') {
    return (
      <span
        title={label}
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 rounded-full',
          value ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-muted text-muted-foreground'
        )}
      >
        {value ? <Check className="h-3 w-3" /> : '−'}
      </span>
    );
  }

  const isPartial = value === 'partial' || value === 'basic' || value === 'import';
  const isFull = value === 'full' || value === 'recent' || value === 'open' || value === 'active';

  return (
    <span
      title={label}
      className={cn(
        'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
        isFull && 'bg-green-100 text-green-600 dark:bg-green-900/30',
        isPartial && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
        !isFull && !isPartial && 'bg-muted text-muted-foreground'
      )}
    >
      {isFull ? '✓' : isPartial ? '~' : '−'}
    </span>
  );
}

// Software wallet row/card
function SoftwareWalletItem({
  wallet,
  isSelected,
  onToggleSelect,
  viewMode,
}: {
  wallet: SoftwareWallet;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
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
              <div className="font-semibold">{wallet.name}</div>
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
            <FeatureIndicator value={wallet.txSimulation} label="Tx Simulation" />
            <FeatureIndicator value={wallet.scamAlerts} label="Scam Alerts" />
            <FeatureIndicator value={wallet.hardwareSupport} label="HW Support" />
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge variant={wallet.license === 'open' ? 'success' : wallet.license === 'partial' ? 'warning' : 'default'}>
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
            <h3 className="font-semibold">{wallet.name}</h3>
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
          <Badge variant="info">
            <Shield className="h-3 w-3 inline mr-1" />
            Tx Sim
          </Badge>
        )}
        {wallet.scamAlerts !== 'none' && (
          <Badge variant="warning">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Scam Alerts
          </Badge>
        )}
        {wallet.hardwareSupport && (
          <Badge variant="default">
            <Zap className="h-3 w-3 inline mr-1" />
            HW
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Badge variant={wallet.license === 'open' ? 'success' : wallet.license === 'partial' ? 'warning' : 'default'}>
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
}: {
  wallet: HardwareWallet;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
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
              <div className="font-semibold">{wallet.name}</div>
              <div className="text-sm text-muted-foreground">{wallet.priceText}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <RecommendationBadge recommendation={wallet.recommendation} />
        </td>
        <td className="py-3 px-4">
          <FeatureIndicator value={wallet.airGap} label="Air-Gapped" />
        </td>
        <td className="py-3 px-4">
          <FeatureIndicator value={wallet.secureElement} label="Secure Element" />
        </td>
        <td className="py-3 px-4">
          <Badge variant={wallet.openSource === 'full' ? 'success' : wallet.openSource === 'partial' ? 'warning' : 'default'}>
            {wallet.openSource === 'full' ? 'Open' : wallet.openSource === 'partial' ? 'Partial' : 'Closed'}
          </Badge>
        </td>
        <td className="py-3 px-4 text-sm">
          {wallet.connectivity.join(', ')}
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
            <h3 className="font-semibold">{wallet.name}</h3>
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

      <p className="text-lg font-semibold text-primary mb-2">{wallet.priceText}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {wallet.airGap && <Badge variant="success">Air-Gapped</Badge>}
        {wallet.secureElement && (
          <Badge variant="info">
            SE: {wallet.secureElementType || 'Yes'}
          </Badge>
        )}
        <Badge variant={wallet.openSource === 'full' ? 'success' : wallet.openSource === 'partial' ? 'warning' : 'default'}>
          {wallet.openSource === 'full' ? 'Open Source' : wallet.openSource === 'partial' ? 'Partial OS' : 'Closed'}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground mb-3">
        {wallet.display} • {wallet.connectivity.join(', ')}
      </div>

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
}: {
  card: CryptoCard;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
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
              <div className="font-semibold">{card.name}</div>
              <div className="text-sm text-muted-foreground">{card.provider}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge variant="info">{card.cardType}</Badge>
        </td>
        <td className="py-3 px-4 text-sm">{card.region}</td>
        <td className="py-3 px-4">
          <span className="font-semibold text-green-600 dark:text-green-400">{card.cashBack}</span>
        </td>
        <td className="py-3 px-4 text-sm">{card.rewards}</td>
        <td className="py-3 px-4 text-sm">{card.annualFee}</td>
        <td className="py-3 px-4">
          {card.providerUrl && (
            <a
              href={card.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
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
          <ScoreBadge score={card.score} />
          <div>
            <h3 className="font-semibold">{card.name}</h3>
            <Badge variant="info">{card.cardType}</Badge>
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

      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
        {card.cashBack}
      </div>

      <p className="text-sm text-muted-foreground mb-3">{card.bestFor}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="default">{card.region}</Badge>
        <Badge variant="default">{card.rewards}</Badge>
        {card.businessSupport === 'yes' && <Badge variant="info">Business</Badge>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Fee: {card.annualFee} | FX: {card.fxFee}
        </span>
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
}: {
  ramp: Ramp;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'table';
}) {
  if (viewMode === 'table') {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4">
          <button
            onClick={onToggleSelect}
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
                {ramp.url ? (
                  <a
                    href={ramp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {ramp.name}
                  </a>
                ) : (
                  ramp.name
                )}
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
            {ramp.onRamp && <Badge variant="success">On-Ramp</Badge>}
            {ramp.offRamp && <Badge variant="info">Off-Ramp</Badge>}
          </div>
        </td>
        <td className="py-3 px-4 text-sm">{ramp.coverage}</td>
        <td className="py-3 px-4 text-sm">{ramp.feeModel}</td>
        <td className="py-3 px-4 text-sm">{ramp.minFee}</td>
        <td className="py-3 px-4 text-sm">{ramp.devUx}</td>
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
            <h3 className="font-semibold">{ramp.name}</h3>
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
        {ramp.onRamp && <Badge variant="success">On-Ramp</Badge>}
        {ramp.offRamp && <Badge variant="info">Off-Ramp</Badge>}
        <Badge variant="default">{ramp.coverage}</Badge>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fee Model:</span>
          <span className="font-medium">{ramp.feeModel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Fee:</span>
          <span className="font-medium">{ramp.minFee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dev UX:</span>
          <span className="font-medium">{ramp.devUx}</span>
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
              <th className="py-3 px-4 text-left text-sm font-medium">Compare</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Wallet</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
              {type === 'software' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">Platforms</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Chains</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Features</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">License</th>
                </>
              )}
              {type === 'hardware' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">Air-Gap</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">SE</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Open Source</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Connectivity</th>
                </>
              )}
              {type === 'cards' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">Region</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Cashback</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Rewards</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Annual Fee</th>
                </>
              )}
              {type === 'ramps' && (
                <>
                  <th className="py-3 px-4 text-left text-sm font-medium">Type</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Coverage</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Fee Model</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Min Fee</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Dev UX</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Links</th>
                </>
              )}
              {type !== 'ramps' && <th className="py-3 px-4 text-left text-sm font-medium">Links</th>}
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
          />
        );
      })}
    </div>
  );
}

export default WalletTable;
