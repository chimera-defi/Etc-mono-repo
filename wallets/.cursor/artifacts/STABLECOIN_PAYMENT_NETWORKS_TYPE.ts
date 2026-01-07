/**
 * Stablecoin Payment Network type definition
 * For services like Peanut, Lemon Cash, Belo that enable QR code payments
 * using stablecoins with bank withdrawal capabilities
 */

export interface StablecoinPaymentNetwork {
  id: string;
  name: string;
  score: number;
  
  // Core Payment Features (Required)
  qrPayments: boolean;
  supportedStablecoins: string[]; // ['USDC', 'USDT', 'DAI', etc.]
  p2pSpeed: 'instant' | 'same-day' | 'next-day';
  
  // Bank Integration (Required)
  bankWithdrawal: boolean; // REQUIRED - must be true
  withdrawalCurrencies: string[]; // ['ARS', 'USD', 'BRL', etc.]
  withdrawalTime: 'instant' | 'same-day' | '1-3-days';
  
  // Fees & Limits
  sendFee?: {
    percentage: number; // e.g., 0.5 for 0.5%
    fixed: number; // e.g., 0.1 for $0.10
  };
  withdrawalFee?: {
    percentage: number;
    fixed: number;
  };
  dailyLimit?: number; // in local currency
  monthlyLimit?: number; // in local currency
  
  // Geographic Coverage
  primaryRegion: string; // 'Argentina', 'Brazil', 'Global', etc.
  supportedCountries: string[]; // ['AR', 'BR', 'US', etc.]
  bankWithdrawalCountries: string[]; // Countries with bank withdrawal support
  
  // Mobile Apps
  mobileApps: {
    ios: boolean;
    android: boolean;
  };
  
  // Additional Features (Optional)
  debitCard?: boolean;
  debitCardType?: 'VISA' | 'Mastercard' | 'other';
  exchangeFeatures?: boolean;
  defiFeatures?: boolean;
  crossBorderRemittances?: boolean;
  billPayments?: boolean;
  
  // Developer Experience
  apiAvailable?: boolean;
  apiDocumentation?: 'good' | 'fair' | 'poor';
  sdks?: string[]; // ['JavaScript', 'Python', etc.]
  
  // Security & Compliance
  regulatoryCompliance?: string[]; // List of licenses/registrations
  securityAudits?: boolean;
  kycRequirements?: 'none' | 'optional' | 'required';
  
  // Status
  active: 'active' | 'slow' | 'inactive' | 'private';
  recommendation: 'recommended' | 'situational' | 'avoid';
  bestFor: string;
  url: string | null;
  
  type: 'stablecoin-payment-network';
}
