import { commonTooltips } from '@/lib/tooltip-content';
import type { SupportedChains } from '@/types/wallets';

export const CHAIN_ICONS: {
  key: keyof Omit<SupportedChains, 'raw' | 'other'>;
  src: string;
  alt: string;
  tooltip: string;
}[] = [
  { key: 'evm', src: '/chains/eth.svg', alt: 'EVM', tooltip: commonTooltips.chains.evm },
  { key: 'bitcoin', src: '/chains/btc.svg', alt: 'Bitcoin', tooltip: commonTooltips.chains.bitcoin },
  { key: 'solana', src: '/chains/sol.svg', alt: 'Solana', tooltip: commonTooltips.chains.solana },
  { key: 'move', src: '/chains/move.svg', alt: 'Move', tooltip: commonTooltips.chains.move },
  { key: 'cosmos', src: '/chains/cosmos.svg', alt: 'Cosmos', tooltip: commonTooltips.chains.cosmos },
  { key: 'polkadot', src: '/chains/polkadot.svg', alt: 'Polkadot', tooltip: commonTooltips.chains.polkadot },
  { key: 'starknet', src: '/chains/starknet.svg', alt: 'Starknet', tooltip: commonTooltips.chains.starknet },
];
