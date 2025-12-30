'use client';

import { useState, useCallback, useEffect } from 'react';
import { MOCK_DATA, WithdrawalRequest } from '@/mocks/data';

export interface UseStakingReturn {
  // Protocol data
  exchangeRate: number;
  tvl: number;
  apy: number;
  
  // User data
  aztecBalance: bigint;
  stAztecBalance: bigint;
  withdrawalRequests: WithdrawalRequest[];
  
  // Actions
  stake: (amount: bigint) => Promise<{ txHash: string }>;
  requestWithdrawal: (amount: bigint) => Promise<{ requestId: number }>;
  claimWithdrawal: (requestId: number) => Promise<{ txHash: string }>;
  
  // Loading states
  isStaking: boolean;
  isWithdrawing: boolean;
  isClaiming: boolean;
  
  // Refresh
  refetch: () => void;
}

export function useStaking(isConnected: boolean): UseStakingReturn {
  const [exchangeRate, setExchangeRate] = useState(MOCK_DATA.exchangeRate);
  const [tvl, setTvl] = useState(MOCK_DATA.tvl);
  const [apy, setApy] = useState(MOCK_DATA.apy);
  
  const [aztecBalance, setAztecBalance] = useState(0n);
  const [stAztecBalance, setStAztecBalance] = useState(0n);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Load user data when connected
  useEffect(() => {
    if (isConnected) {
      setAztecBalance(MOCK_DATA.userBalance.aztec);
      setStAztecBalance(MOCK_DATA.userBalance.stAztec);
      setWithdrawalRequests(MOCK_DATA.withdrawalRequests);
    } else {
      setAztecBalance(0n);
      setStAztecBalance(0n);
      setWithdrawalRequests([]);
    }
  }, [isConnected]);

  const stake = useCallback(async (amount: bigint): Promise<{ txHash: string }> => {
    setIsStaking(true);
    
    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Calculate stAZTEC to receive
      const stAztecAmount = (amount * 10000n) / BigInt(exchangeRate);
      
      // Update balances
      setAztecBalance((prev) => prev - amount);
      setStAztecBalance((prev) => prev + stAztecAmount);
      
      // Simulate TVL increase
      setTvl((prev) => prev + Number(amount) / 1e18 * 2); // Assume $2 per AZTEC
      
      return { txHash: `0x${Math.random().toString(16).slice(2, 66)}` };
    } finally {
      setIsStaking(false);
    }
  }, [exchangeRate]);

  const requestWithdrawal = useCallback(async (amount: bigint): Promise<{ requestId: number }> => {
    setIsWithdrawing(true);
    
    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Calculate AZTEC to receive
      const aztecAmount = (amount * BigInt(exchangeRate)) / 10000n;
      
      // Update balances
      setStAztecBalance((prev) => prev - amount);
      
      // Add new withdrawal request
      const newRequestId = withdrawalRequests.length + 1;
      const newRequest: WithdrawalRequest = {
        id: newRequestId,
        amount: aztecAmount,
        requestedAt: Date.now(),
        claimableAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      };
      
      setWithdrawalRequests((prev) => [...prev, newRequest]);
      
      return { requestId: newRequestId };
    } finally {
      setIsWithdrawing(false);
    }
  }, [exchangeRate, withdrawalRequests.length]);

  const claimWithdrawal = useCallback(async (requestId: number): Promise<{ txHash: string }> => {
    setIsClaiming(true);
    
    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const request = withdrawalRequests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      // Update balances
      setAztecBalance((prev) => prev + request.amount);
      
      // Remove from queue
      setWithdrawalRequests((prev) => prev.filter((r) => r.id !== requestId));
      
      return { txHash: `0x${Math.random().toString(16).slice(2, 66)}` };
    } finally {
      setIsClaiming(false);
    }
  }, [withdrawalRequests]);

  const refetch = useCallback(() => {
    // In mock mode, this just refreshes from mock data
    setExchangeRate(MOCK_DATA.exchangeRate);
    setTvl(MOCK_DATA.tvl);
    setApy(MOCK_DATA.apy);
  }, []);

  return {
    exchangeRate,
    tvl,
    apy,
    aztecBalance,
    stAztecBalance,
    withdrawalRequests,
    stake,
    requestWithdrawal,
    claimWithdrawal,
    isStaking,
    isWithdrawing,
    isClaiming,
    refetch,
  };
}
