/**
 * Format a bigint AZTEC/stAZTEC amount (18 decimals) to human-readable string
 */
export function formatAztec(amount: bigint, decimals: number = 2): string {
  const divisor = 10n ** 18n;
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  const fractionalStr = fractionalPart.toString().padStart(18, '0');
  const truncatedFraction = fractionalStr.slice(0, decimals);
  
  const integerFormatted = integerPart.toLocaleString('en-US');
  
  if (decimals === 0) {
    return integerFormatted;
  }
  
  return `${integerFormatted}.${truncatedFraction}`;
}

/**
 * Format an exchange rate from basis points to decimal
 * 10000 = 1.0, 10250 = 1.025
 */
export function formatRate(rateBasisPoints: number): string {
  const rate = rateBasisPoints / 10000;
  return rate.toFixed(4);
}

/**
 * Format a USD amount
 */
export function formatUsd(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Format APY as percentage
 */
export function formatApy(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

/**
 * Format time remaining in human-readable form
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ready';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Parse a string input to bigint with 18 decimals
 */
export function parseAztec(value: string): bigint {
  if (!value || value === '.') return 0n;
  
  const parts = value.split('.');
  const integerPart = parts[0] || '0';
  let fractionalPart = parts[1] || '';
  
  fractionalPart = fractionalPart.padEnd(18, '0').slice(0, 18);
  
  const combined = integerPart + fractionalPart;
  return BigInt(combined);
}

/**
 * Truncate an address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
