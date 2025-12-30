'use client';

import { TrendingUp, Lock, ArrowRightLeft } from 'lucide-react';
import { formatUsd, formatApy, formatRate } from '@/lib/format';

interface StatsBarProps {
  tvl: number;
  apy: number;
  exchangeRate: number;
}

export function StatsBar({ tvl, apy, exchangeRate }: StatsBarProps) {
  const stats = [
    {
      label: 'Total Value Locked',
      value: formatUsd(tvl),
      icon: Lock,
    },
    {
      label: 'APY',
      value: formatApy(apy),
      icon: TrendingUp,
    },
    {
      label: 'Exchange Rate',
      value: formatRate(exchangeRate),
      icon: ArrowRightLeft,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center p-4 bg-aztec-card/50 backdrop-blur rounded-xl border border-aztec-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="w-4 h-4 text-aztec-purple-light" />
            <span className="text-sm text-gray-400">{stat.label}</span>
          </div>
          <span className="text-2xl font-bold text-white">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
