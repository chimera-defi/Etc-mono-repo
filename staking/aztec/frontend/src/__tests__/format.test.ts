import {
  formatAztec,
  formatRate,
  formatUsd,
  formatApy,
  formatTimeRemaining,
  parseAztec,
  truncateAddress,
} from '@/lib/format';

describe('formatAztec', () => {
  it('formats zero correctly', () => {
    expect(formatAztec(0n)).toBe('0.00');
  });

  it('formats whole numbers correctly', () => {
    const amount = 1000_000000000000000000n; // 1,000 AZTEC
    expect(formatAztec(amount)).toBe('1,000.00');
  });

  it('formats decimal amounts correctly', () => {
    const amount = 1234_560000000000000000n; // 1,234.56 AZTEC
    expect(formatAztec(amount)).toBe('1,234.56');
  });

  it('respects decimal parameter', () => {
    const amount = 1234_567890000000000000n;
    expect(formatAztec(amount, 4)).toBe('1,234.5678');
    expect(formatAztec(amount, 0)).toBe('1,234');
  });

  it('formats large amounts correctly', () => {
    const amount = 1000000_000000000000000000n; // 1M AZTEC
    expect(formatAztec(amount)).toBe('1,000,000.00');
  });
});

describe('formatRate', () => {
  it('formats 1.0 rate correctly', () => {
    expect(formatRate(10000)).toBe('1.0000');
  });

  it('formats rate > 1 correctly', () => {
    expect(formatRate(10250)).toBe('1.0250');
  });

  it('formats rate < 1 correctly', () => {
    expect(formatRate(9500)).toBe('0.9500');
  });
});

describe('formatUsd', () => {
  it('formats millions correctly', () => {
    expect(formatUsd(10500000)).toBe('$10.50M');
  });

  it('formats thousands correctly', () => {
    expect(formatUsd(5000)).toBe('$5.00K');
  });

  it('formats small amounts correctly', () => {
    expect(formatUsd(99.99)).toBe('$99.99');
  });
});

describe('formatApy', () => {
  it('formats APY as percentage', () => {
    expect(formatApy(8.5)).toBe('8.50%');
    expect(formatApy(12)).toBe('12.00%');
  });
});

describe('formatTimeRemaining', () => {
  it('returns Ready for zero or negative time', () => {
    expect(formatTimeRemaining(0)).toBe('Ready');
    expect(formatTimeRemaining(-1000)).toBe('Ready');
  });

  it('formats days correctly', () => {
    expect(formatTimeRemaining(4 * 24 * 60 * 60 * 1000)).toBe('4d 0h');
  });

  it('formats hours correctly', () => {
    expect(formatTimeRemaining(5 * 60 * 60 * 1000)).toBe('5h 0m');
  });

  it('formats minutes correctly', () => {
    expect(formatTimeRemaining(30 * 60 * 1000)).toBe('30m');
  });
});

describe('parseAztec', () => {
  it('parses empty string to 0', () => {
    expect(parseAztec('')).toBe(0n);
  });

  it('parses whole numbers correctly', () => {
    expect(parseAztec('1000')).toBe(1000_000000000000000000n);
  });

  it('parses decimals correctly', () => {
    expect(parseAztec('1.5')).toBe(1_500000000000000000n);
  });

  it('handles just decimal point', () => {
    expect(parseAztec('.')).toBe(0n);
  });
});

describe('truncateAddress', () => {
  it('truncates long addresses', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab32';
    expect(truncateAddress(address)).toBe('0x742d...Ab32');
  });

  it('handles empty string', () => {
    expect(truncateAddress('')).toBe('');
  });

  it('respects custom char count', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab32';
    expect(truncateAddress(address, 6)).toBe('0x742d35...f0Ab32');
  });
});
