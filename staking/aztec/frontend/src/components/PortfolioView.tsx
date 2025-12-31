'use client';

import { TrendingUp, Coins, DollarSign, Percent } from 'lucide-react';
import { Card } from './ui';
import { formatAztec, formatUsd, formatApy } from '@/lib/format';

interface PortfolioViewProps {
  stAztecBalance: bigint;
  exchangeRate: number;
  aztecPrice: number;
  apy: number;
}

export function PortfolioView({
  stAztecBalance,
  exchangeRate,
  aztecPrice,
  apy,
}: PortfolioViewProps) {
  // Calculate AZTEC value of stAZTEC holdings
  const aztecValue = (stAztecBalance * BigInt(exchangeRate)) / 10000n;
  
  // Calculate USD value
  const usdValue = (Number(aztecValue) / 1e18) * aztecPrice;
  
  // Calculate rewards (difference between AZTEC value and original stAZTEC amount at 1:1)
  const rewardsAztec = aztecValue - stAztecBalance;

  const stats = [
    {
      label: 'stAZTEC Balance',
      value: formatAztec(stAztecBalance),
      suffix: 'stAZTEC',
      icon: Coins,
      color: 'text-aztec-purple-light',
    },
    {
      label: 'AZTEC Value',
      value: formatAztec(aztecValue),
      suffix: 'AZTEC',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      label: 'USD Value',
      value: formatUsd(usdValue),
      suffix: '',
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      label: 'Total Rewards',
      value: rewardsAztec > 0n ? `+${formatAztec(rewardsAztec)}` : '0',
      suffix: 'AZTEC',
      icon: TrendingUp,
      color: rewardsAztec > 0n ? 'text-aztec-success' : 'text-gray-400',
    },
  ];

  return (
    <Card title="Your Portfolio">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-aztec-dark rounded-xl border border-aztec-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-white">{stat.value}</span>
              {stat.suffix && (
                <span className="text-sm text-gray-400">{stat.suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gradient-primary/10 rounded-xl border border-aztec-purple/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-aztec-purple-light" />
            <span className="text-gray-300">Current APY</span>
          </div>
          <span className="text-2xl font-bold text-white">{formatApy(apy)}</span>
        </div>
      </div>
    </Card>
  );
}
