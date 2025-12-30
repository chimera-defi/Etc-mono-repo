'use client';

import { useState, useCallback } from 'react';
import { MOCK_WALLET } from '@/mocks/data';

export interface UseWalletReturn {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In mock mode, use the mock wallet address
    setAddress(MOCK_WALLET.address);
    setIsConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  return {
    address,
    isConnected: !!address,
    isConnecting,
    connect,
    disconnect,
  };
}
