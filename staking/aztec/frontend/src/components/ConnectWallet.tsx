'use client';

import { useState } from 'react';
import { Wallet, LogOut, ChevronDown, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from './ui';
import { truncateAddress } from '@/lib/format';
import { cn } from '@/lib/cn';

interface ConnectWalletProps {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export function ConnectWallet({
  address,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Button
        onClick={onConnect}
        loading={isConnecting}
        variant="primary"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl',
          'bg-aztec-card border border-aztec-border',
          'hover:border-aztec-purple transition-colors',
          'text-white font-medium'
        )}
      >
        <div className="w-2 h-2 rounded-full bg-aztec-success" />
        <span>{truncateAddress(address || '')}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isDropdownOpen && 'rotate-180'
          )}
        />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-aztec-card border border-aztec-border rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 border-b border-aztec-border">
              <p className="text-xs text-gray-400 mb-1">Connected Address</p>
              <p className="text-sm text-white font-mono break-all">
                {address}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-aztec-dark rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-aztec-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
              <a
                href={`https://explorer.aztec.network/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-aztec-dark rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
              <button
                onClick={() => {
                  onDisconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-aztec-error hover:bg-aztec-dark rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
