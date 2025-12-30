'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionType = 'stake' | 'unstake' | 'claim';

export interface Transaction {
  hash: string;
  status: TransactionStatus;
  type: TransactionType;
  amount: bigint;
  timestamp: number;
}

export interface UseTransactionReturn {
  transactions: Transaction[];
  trackTransaction: (
    hash: string,
    type: TransactionType,
    amount: bigint
  ) => void;
  clearTransactions: () => void;
}

export function useTransaction(): UseTransactionReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { addToast, updateToast } = useToast();

  const trackTransaction = useCallback(
    (hash: string, type: TransactionType, amount: bigint) => {
      const newTx: Transaction = {
        hash,
        status: 'pending',
        type,
        amount,
        timestamp: Date.now(),
      };

      setTransactions((prev) => [newTx, ...prev]);

      // Show pending toast
      const typeLabels: Record<TransactionType, string> = {
        stake: 'Stake',
        unstake: 'Withdrawal Request',
        claim: 'Claim',
      };
      
      const toastId = addToast(
        'pending',
        `${typeLabels[type]} Pending`,
        `Transaction submitted: ${hash.slice(0, 10)}...`
      );

      // Simulate confirmation after 2 seconds
      setTimeout(() => {
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.hash === hash ? { ...tx, status: 'confirmed' } : tx
          )
        );
        
        updateToast(
          toastId,
          'success',
          `${typeLabels[type]} Confirmed`,
          `Transaction confirmed: ${hash.slice(0, 10)}...`
        );
      }, 2000);
    },
    [addToast, updateToast]
  );

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  return {
    transactions,
    trackTransaction,
    clearTransactions,
  };
}
