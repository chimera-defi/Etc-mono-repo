export interface WithdrawalRequest {
  id: number;
  amount: bigint;
  requestedAt: number;
  claimableAt: number;
}

export const MOCK_DATA = {
  // Protocol stats
  exchangeRate: 10250, // 1.025 - stAZTEC worth more than AZTEC
  tvl: 10_500_000, // $10.5M
  apy: 8.5, // 8.5%
  protocolFee: 10, // 10%
  unbondingPeriodDays: 7,
  
  // Token price (for USD calculations)
  aztecPriceUsd: 2.0,
  
  // User balances
  userBalance: {
    aztec: 50000_000000000000000000n, // 50,000 AZTEC (18 decimals)
    stAztec: 45000_000000000000000000n, // 45,000 stAZTEC
  },
  
  // Withdrawal queue
  withdrawalRequests: [
    {
      id: 1,
      amount: 1000_000000000000000000n, // 1,000 AZTEC
      requestedAt: Date.now() - 86400000 * 3, // 3 days ago
      claimableAt: Date.now() + 86400000 * 4, // 4 days from now
    },
    {
      id: 2,
      amount: 500_000000000000000000n, // 500 AZTEC
      requestedAt: Date.now() - 86400000 * 8, // 8 days ago
      claimableAt: Date.now() - 86400000 * 1, // 1 day ago (ready!)
    },
  ] as WithdrawalRequest[],
  
  // Transaction costs
  estimatedNetworkCost: 0.20, // USD
  
  // Batch info
  batchThreshold: 200000_000000000000000000n, // 200,000 AZTEC
  currentPendingPool: 150000_000000000000000000n, // 150,000 AZTEC
};

// Mock connected wallet
export const MOCK_WALLET = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab32',
  isConnected: false,
};
