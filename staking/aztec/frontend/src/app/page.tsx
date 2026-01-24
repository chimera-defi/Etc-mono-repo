'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Github, Twitter, BookOpen, MessageCircle } from 'lucide-react';
import { StakeWidget, WithdrawalQueue, PortfolioView, StatsBar, ConnectWallet, useToast } from '@/components';
import { useWallet, useStaking, useTransaction } from '@/hooks';
import { MOCK_DATA } from '@/mocks/data';

export default function Home() {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const {
    exchangeRate,
    tvl,
    apy,
    aztecBalance,
    stAztecBalance,
    withdrawalRequests,
    stake,
    requestWithdrawal,
    claimWithdrawal,
  } = useStaking(isConnected);
  const { trackTransaction } = useTransaction();
  const { addToast } = useToast();

  // Update current time every second for withdrawal queue
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStake = async (amount: bigint) => {
    try {
      const { txHash } = await stake(amount);
      trackTransaction(txHash, 'stake', amount);
    } catch (error) {
      addToast('error', 'Stake Failed', 'Transaction was rejected');
    }
  };

  const handleUnstake = async (amount: bigint) => {
    try {
      const { requestId } = await requestWithdrawal(amount);
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      trackTransaction(txHash, 'unstake', amount);
      addToast('info', 'Withdrawal Requested', `Request #${requestId} created. Available in 7 days.`);
    } catch (error) {
      addToast('error', 'Withdrawal Failed', 'Transaction was rejected');
    }
  };

  const handleClaim = async (requestId: number) => {
    try {
      const request = withdrawalRequests.find((r) => r.id === requestId);
      const { txHash } = await claimWithdrawal(requestId);
      trackTransaction(txHash, 'claim', request?.amount || 0n);
    } catch (error) {
      addToast('error', 'Claim Failed', 'Transaction was rejected');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-aztec-dark/80 backdrop-blur-lg border-b border-aztec-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">st</span>
            </div>
            <span className="text-xl font-bold text-white">stAZTEC</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" />
              Docs
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              Discord
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </a>
          </nav>

          <ConnectWallet
            address={address}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Liquid Stake Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-primary">
                Aztec
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Earn {apy.toFixed(1)}% APY while keeping your assets liquid.
              No minimum stake. No lock-up. Privacy-preserving.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center mb-12">
            <StatsBar tvl={tvl} apy={apy} exchangeRate={exchangeRate} />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Left Column - Stake Widget */}
            <div className="flex justify-center">
              <StakeWidget
                onStake={handleStake}
                onUnstake={handleUnstake}
                userBalance={{ aztec: aztecBalance, stAztec: stAztecBalance }}
                exchangeRate={exchangeRate}
                isConnected={isConnected}
                aztecPriceUsd={MOCK_DATA.aztecPriceUsd}
              />
            </div>

            {/* Right Column - Portfolio & Withdrawals */}
            <div className="space-y-6">
              {isConnected && (
                <>
                  <PortfolioView
                    stAztecBalance={stAztecBalance}
                    exchangeRate={exchangeRate}
                    aztecPrice={MOCK_DATA.aztecPriceUsd}
                    apy={apy}
                  />
                  
                  {withdrawalRequests.length > 0 && (
                    <WithdrawalQueue
                      requests={withdrawalRequests}
                      onClaim={handleClaim}
                      currentTime={currentTime}
                    />
                  )}
                </>
              )}

              {!isConnected && (
                <div className="bg-aztec-card/50 backdrop-blur rounded-2xl border border-aztec-border p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-aztec-purple/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-aztec-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Connect to Get Started
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Connect your Aztec wallet to stake AZTEC and start earning rewards.
                  </p>
                  <button
                    onClick={connect}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Protocol Info */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-aztec-card/30 rounded-xl border border-aztec-border">
              <div className="w-12 h-12 rounded-lg bg-aztec-purple/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-aztec-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Minimum</h3>
              <p className="text-gray-400 text-sm">
                Stake any amount of AZTEC. The 200k minimum is handled by our protocol.
              </p>
            </div>

            <div className="p-6 bg-aztec-card/30 rounded-xl border border-aztec-border">
              <div className="w-12 h-12 rounded-lg bg-aztec-purple/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-aztec-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-gray-400 text-sm">
                Built on Aztec - your staking activity remains private by default.
              </p>
            </div>

            <div className="p-6 bg-aztec-card/30 rounded-xl border border-aztec-border">
              <div className="w-12 h-12 rounded-lg bg-aztec-purple/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-aztec-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Stay Liquid</h3>
              <p className="text-gray-400 text-sm">
                Use stAZTEC across DeFi while earning staking rewards.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-aztec-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>© 2025 stAZTEC</span>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Discord"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
