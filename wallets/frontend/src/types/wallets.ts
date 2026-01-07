/**
 * Supported blockchain network categories
 * Each property indicates whether the wallet supports that chain category
 */
export interface SupportedChains {
  /** Ethereum & EVM-compatible chains (Polygon, Arbitrum, Base, Optimism, etc.) */
  evm: boolean;
  /** Bitcoin network */
  bitcoin: boolean;
  /** Solana network */
  solana: boolean;
  /** Move-based chains (Sui, Aptos) */
  move: boolean;
  /** Cosmos ecosystem (ATOM, Osmosis, Celestia, etc.) */
  cosmos: boolean;
  /** Polkadot/Substrate chains */
  polkadot: boolean;
  /** Starknet L2 */
  starknet: boolean;
  /** Other chains (TON, XRP, Tron, Cardano, etc.) */
  other: boolean;
  /** Raw chain string from markdown for display */
  raw: string;
}

/**
 * API openness level - separate from client code open source
 * Tracks backend service transparency and self-hostability
 */
export type ApiOpenness = 'open' | 'partial' | 'public' | 'closed';

export interface SoftwareWallet {
  id: string;
  name: string;
  score: number;
  core: 'full' | 'partial' | 'none';
  releasesPerMonth: number | null;
  rpc: 'full' | 'partial' | 'none';
  github: string | null;
  active: 'active' | 'slow' | 'inactive' | 'private';
  chains: SupportedChains;
  devices: {
    mobile: boolean;
    browser: boolean;
    desktop: boolean;
    web: boolean;
  };
  testnets: boolean;
  license: 'open' | 'partial' | 'closed';
  licenseType: string;
  audits: 'recent' | 'old' | 'bounty' | 'none';
  funding: 'sustainable' | 'vc' | 'risky';
  fundingSource: string;
  txSimulation: boolean;
  scamAlerts: 'full' | 'partial' | 'none';
  accountTypes: string[];
  ensNaming: 'full' | 'basic' | 'import' | 'none';
  hardwareSupport: boolean;
  /** API/backend openness - separate from client code license */
  apiOpenness: ApiOpenness;
  bestFor: string;
  recommendation: 'recommended' | 'situational' | 'avoid' | 'not-for-dev';
  type: 'software';
}

export interface HardwareWallet {
  id: string;
  name: string;
  score: number;
  github: string | null;
  airGap: boolean;
  openSource: 'full' | 'partial' | 'closed';
  secureElement: boolean;
  secureElementType: string | null;
  display: string;
  price: number | null;
  priceText: string;
  connectivity: string[];
  active: 'active' | 'slow' | 'inactive' | 'private';
  recommendation: 'recommended' | 'situational' | 'avoid';
  url: string | null;
  type: 'hardware';
}

/**
 * Custody type for crypto cards
 * - self: Non-custodial, you control your keys
 * - exchange: Funds held on centralized exchange
 * - cefi: Funds held by centralized finance company
 */
export type CustodyType = 'self' | 'exchange' | 'cefi';

export interface CryptoCard {
  id: string;
  name: string;
  score: number;
  cardType: 'credit' | 'debit' | 'prepaid' | 'business';
  /** Custody model: self (non-custodial), exchange, or cefi */
  custody: CustodyType;
  businessSupport: 'yes' | 'no' | 'verify';
  region: string;
  regionCode: string;
  cashBack: string;
  cashBackMax: number | null;
  annualFee: string;
  fxFee: string;
  rewards: string;
  provider: string;
  providerUrl: string | null;
  status: 'active' | 'verify' | 'launching';
  bestFor: string;
  recommendation: 'recommended' | 'situational' | 'avoid';
  type: 'card';
}

export interface Ramp {
  id: string;
  name: string;
  score: number;
  rampType: 'both' | 'on-ramp' | 'off-ramp';
  onRamp: boolean;
  offRamp: boolean;
  coverage: string;
  feeModel: string;
  minFee: string;
  devUx: string;
  status: 'active' | 'verify' | 'launching';
  bestFor: string;
  recommendation: 'recommended' | 'situational' | 'avoid';
  url: string | null;
  type: 'ramp';
}

export type WalletData = SoftwareWallet | HardwareWallet | CryptoCard | Ramp;

