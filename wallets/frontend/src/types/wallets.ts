export interface SoftwareWallet {
  id: string;
  name: string;
  score: number;
  core: 'full' | 'partial' | 'none';
  releasesPerMonth: number | null;
  rpc: 'full' | 'partial' | 'none';
  github: string | null;
  active: 'active' | 'slow' | 'inactive' | 'private';
  chains: number | string;
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

export interface CryptoCard {
  id: string;
  name: string;
  score: number;
  cardType: 'credit' | 'debit' | 'prepaid' | 'business';
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

export type WalletData = SoftwareWallet | HardwareWallet | CryptoCard;

