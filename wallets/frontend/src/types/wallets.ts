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
  
  // Dune Analytics data (optional - added when Dune integration is active)
  duneData?: {
    // Chain support
    supportedChains: string[]; // ['ethereum', 'polygon', 'arbitrum', ...]
    chainCount: number;
    
    // Usage metrics
    totalTransactions: number | null;
    totalVolumeUsd: number | null;
    activeUsers: number | null;
    lastUpdated: string; // ISO date
    
    // Chain-specific data
    chainMetrics: {
      chain: string;
      transactions: number;
      volume: number;
      users: number;
    }[];
    
    // Time series (if available)
    volumeHistory?: {
      date: string;
      volume: number;
    }[];
  };
  
  // Dune source metadata
  duneSource?: {
    queryId: number | null;
    dashboardUrl: string;
    lastFetched: string;
  };
}

export type WalletData = SoftwareWallet | HardwareWallet | CryptoCard;

