/**
 * Test Utilities for Aztec Integration Tests
 * 
 * This file provides utility functions for integration testing.
 * Full implementation requires Aztec sandbox and compiled contracts.
 */

import { TEST_CONFIG } from './setup.js';

// ============================================
// Contract Addresses (set after deployment)
// ============================================
export interface DeployedContracts {
  aztecToken: string;
  stakedAztecToken: string;
  liquidStakingCore: string;
  withdrawalQueue: string;
  validatorRegistry: string;
  vaultManager: string;
  rewardsManager: string;
}

export const contracts: DeployedContracts = {
  aztecToken: '',
  stakedAztecToken: '',
  liquidStakingCore: '',
  withdrawalQueue: '',
  validatorRegistry: '',
  vaultManager: '',
  rewardsManager: '',
};

// ============================================
// Conversion Helpers
// ============================================

/**
 * Convert human-readable amount to wei (1e18)
 */
export function toWei(amount: number | string): bigint {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(value * 1e18));
}

/**
 * Convert wei to human-readable amount
 */
export function fromWei(wei: bigint): number {
  return Number(wei) / 1e18;
}

/**
 * Convert basis points to percentage string
 */
export function bpsToPercent(bps: bigint): string {
  return `${Number(bps) / 100}%`;
}

/**
 * Calculate stAZTEC amount from AZTEC given exchange rate
 */
export function calculateStAztec(aztecAmount: bigint, exchangeRate: bigint): bigint {
  // stAZTEC = AZTEC * BASE_RATE / current_rate
  return (aztecAmount * TEST_CONFIG.INITIAL_RATE) / exchangeRate;
}

/**
 * Calculate AZTEC amount from stAZTEC given exchange rate
 */
export function calculateAztec(stAztecAmount: bigint, exchangeRate: bigint): bigint {
  // AZTEC = stAZTEC * current_rate / BASE_RATE
  return (stAztecAmount * exchangeRate) / TEST_CONFIG.INITIAL_RATE;
}

// ============================================
// Time Helpers
// ============================================

/**
 * Calculate claim_after timestamp
 */
export function calculateClaimAfter(currentTime: number): number {
  return currentTime + TEST_CONFIG.UNBONDING_PERIOD;
}

/**
 * Check if withdrawal is claimable
 */
export function isClaimable(claimAfter: number, currentTime: number): boolean {
  return currentTime >= claimAfter;
}

// ============================================
// Fee Calculation
// ============================================

/**
 * Calculate protocol fee from reward amount
 */
export function calculateFee(rewardAmount: bigint): bigint {
  return (rewardAmount * TEST_CONFIG.PROTOCOL_FEE_BPS) / 10000n;
}

/**
 * Calculate net rewards after fee
 */
export function calculateNetRewards(rewardAmount: bigint): bigint {
  return rewardAmount - calculateFee(rewardAmount);
}

// ============================================
// Exchange Rate Helpers
// ============================================

/**
 * Calculate new exchange rate after rewards
 */
export function calculateNewExchangeRate(
  totalAssets: bigint,
  newRewards: bigint,
  totalShares: bigint
): bigint {
  if (totalShares === 0n) return TEST_CONFIG.INITIAL_RATE;
  const netRewards = calculateNetRewards(newRewards);
  const newTotalAssets = totalAssets + netRewards;
  // rate = (total_assets * BASE_RATE) / total_shares
  return (newTotalAssets * TEST_CONFIG.INITIAL_RATE) / totalShares;
}

// ============================================
// Logging Helpers
// ============================================

export function logDeposit(user: string, aztecAmount: bigint, stAztecAmount: bigint): void {
  console.log(`  Deposit: ${fromWei(aztecAmount)} AZTEC → ${fromWei(stAztecAmount)} stAZTEC for ${user.slice(0, 10)}...`);
}

export function logWithdraw(user: string, stAztecAmount: bigint, aztecAmount: bigint): void {
  console.log(`  Withdraw: ${fromWei(stAztecAmount)} stAZTEC → ${fromWei(aztecAmount)} AZTEC for ${user.slice(0, 10)}...`);
}

export function logRewards(amount: bigint, fee: bigint, net: bigint): void {
  console.log(`  Rewards: ${fromWei(amount)} AZTEC (fee: ${fromWei(fee)}, net: ${fromWei(net)})`);
}

export function logExchangeRate(oldRate: bigint, newRate: bigint): void {
  const oldMultiplier = Number(oldRate) / 10000;
  const newMultiplier = Number(newRate) / 10000;
  console.log(`  Exchange Rate: ${oldMultiplier}x → ${newMultiplier}x`);
}
