'use client';

import { useState, useMemo } from 'react';
import { ArrowDownUp, Info, AlertTriangle } from 'lucide-react';
import { Card, Tabs, Input, Button, Badge } from './ui';
import { formatAztec, formatRate, formatUsd, parseAztec } from '@/lib/format';
import { MOCK_DATA } from '@/mocks/data';

interface StakeWidgetProps {
  onStake: (amount: bigint) => Promise<void>;
  onUnstake: (amount: bigint) => Promise<void>;
  userBalance: { aztec: bigint; stAztec: bigint };
  exchangeRate: number;
  isConnected: boolean;
  aztecPriceUsd: number;
}

const TABS = [
  { id: 'stake', label: 'Stake' },
  { id: 'unstake', label: 'Unstake' },
];

export function StakeWidget({
  onStake,
  onUnstake,
  userBalance,
  exchangeRate,
  isConnected,
  aztecPriceUsd,
}: StakeWidgetProps) {
  const [activeTab, setActiveTab] = useState('stake');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isStaking = activeTab === 'stake';
  const inputAmount = parseAztec(inputValue);
  
  const maxBalance = isStaking ? userBalance.aztec : userBalance.stAztec;
  const inputToken = isStaking ? 'AZTEC' : 'stAZTEC';
  const outputToken = isStaking ? 'stAZTEC' : 'AZTEC';

  const outputAmount = useMemo(() => {
    if (inputAmount === 0n) return 0n;
    
    if (isStaking) {
      // Stake: AZTEC → stAZTEC (divide by rate)
      return (inputAmount * 10000n) / BigInt(exchangeRate);
    } else {
      // Unstake: stAZTEC → AZTEC (multiply by rate)
      return (inputAmount * BigInt(exchangeRate)) / 10000n;
    }
  }, [inputAmount, exchangeRate, isStaking]);

  const outputUsd = useMemo(() => {
    const aztecAmount = isStaking
      ? inputAmount
      : outputAmount;
    const aztecValue = Number(aztecAmount) / 1e18;
    return aztecValue * aztecPriceUsd;
  }, [inputAmount, outputAmount, isStaking, aztecPriceUsd]);

  const isValidAmount = inputAmount > 0n && inputAmount <= maxBalance;
  const canSubmit = isConnected && isValidAmount && !isLoading;

  const handleMax = () => {
    const maxValue = Number(maxBalance) / 1e18;
    setInputValue(maxValue.toString());
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsLoading(true);
    try {
      if (isStaking) {
        await onStake(inputAmount);
      } else {
        await onUnstake(inputAmount);
      }
      setInputValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (inputAmount === 0n) return `Enter ${inputToken} amount`;
    if (inputAmount > maxBalance) return 'Insufficient balance';
    if (isLoading) return isStaking ? 'Staking...' : 'Unstaking...';
    return isStaking ? 'Stake AZTEC' : 'Request Withdrawal';
  };

  return (
    <Card className="w-full max-w-md">
      <div className="flex justify-center mb-6">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Input Field */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>You {isStaking ? 'Pay' : 'Unstake'}</span>
          <span>Balance: {formatAztec(maxBalance)} {inputToken}</span>
        </div>
        <Input
          type="number"
          placeholder="0.0"
          value={inputValue}
          onChange={setInputValue}
          suffix={inputToken}
          showMax
          onMax={handleMax}
        />
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-2">
        <div className="p-2 bg-aztec-dark rounded-lg border border-aztec-border">
          <ArrowDownUp className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Output Field */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm text-gray-400">
          <span>You Receive</span>
          {outputAmount > 0n && (
            <span>≈ {formatUsd(outputUsd)}</span>
          )}
        </div>
        <div className="w-full h-14 px-4 bg-aztec-dark border border-aztec-border rounded-xl flex items-center justify-between">
          <span className="text-xl text-white">
            {outputAmount > 0n ? formatAztec(outputAmount) : '0.0'}
          </span>
          <span className="text-gray-400 font-medium">{outputToken}</span>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="space-y-3 p-4 bg-aztec-dark rounded-xl mb-6 text-sm">
        <div className="flex justify-between text-gray-400">
          <span className="flex items-center gap-1">
            Exchange Rate
            <Info className="w-3 h-3" />
          </span>
          <span className="text-white">
            1 {inputToken} = {isStaking 
              ? formatRate(10000 * 10000 / exchangeRate) 
              : formatRate(exchangeRate)
            } {outputToken}
          </span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Protocol Fee</span>
          <span className="text-white">{MOCK_DATA.protocolFee}%</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Network Cost</span>
          <span className="text-white">~{formatUsd(MOCK_DATA.estimatedNetworkCost)}</span>
        </div>
      </div>

      {/* Unbonding Warning (Unstake only) */}
      {!isStaking && (
        <div className="flex items-start gap-2 p-3 bg-aztec-warning/10 border border-aztec-warning/30 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-aztec-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-aztec-warning font-medium">Unbonding Period</p>
            <p className="text-gray-400">
              Your AZTEC will be available to claim after {MOCK_DATA.unbondingPeriodDays} days.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={isLoading}
      >
        {getButtonText()}
      </Button>
    </Card>
  );
}
