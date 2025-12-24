import { describe, expect, it } from 'vitest';

import {
  parseCryptoCards,
  parseHardwareWallets,
  parseSoftwareWallets,
} from './wallet-data';

describe('wallet-data table parsers', () => {
  it('parses software wallets table with basic invariants', () => {
    const wallets = parseSoftwareWallets();

    expect(wallets.length).toBeGreaterThan(10);

    const rabby = wallets.find((w) => w.name === 'Rabby');
    expect(rabby).toBeTruthy();
    expect(rabby?.type).toBe('software');
    expect(rabby?.score).toBeGreaterThanOrEqual(80);
    expect(rabby?.chains).toBe(94);
    expect(rabby?.devices.desktop).toBe(true);
    expect(rabby?.releasesPerMonth).toBe(6);
    expect(rabby?.txSimulation).toBe(true);
  });

  it('parses hardware wallets table and reads price from Price column (not Display)', () => {
    const wallets = parseHardwareWallets();

    expect(wallets.length).toBeGreaterThan(10);
    expect(wallets.every((w) => ['full', 'partial', 'closed'].includes(w.openSource))).toBe(true);

    const safe5 = wallets.find((w) => w.name === 'Trezor Safe 5');
    expect(safe5).toBeTruthy();
    expect(safe5?.type).toBe('hardware');
    expect(safe5?.display).toBe('Touch Color');
    expect(safe5?.price).toBe(169);
    expect(safe5?.connectivity).toContain('USB-C');
  });

  it('parses crypto cards table with basic invariants', () => {
    const cards = parseCryptoCards();

    expect(cards.length).toBeGreaterThan(10);

    const bybit = cards.find((c) => c.name === 'Bybit Card');
    expect(bybit).toBeTruthy();
    expect(bybit?.type).toBe('card');
    expect(bybit?.score).toBe(88);
    expect(bybit?.regionCode).toBe('EU');
    expect(bybit?.provider).toBe('Bybit');
    expect(bybit?.providerUrl).toMatch(/^https:\/\/www\.bybit\.com\//);
  });
});

