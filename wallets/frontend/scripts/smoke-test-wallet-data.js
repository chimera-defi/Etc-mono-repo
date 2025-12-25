#!/usr/bin/env node
/**
 * Minimal, dependency-free smoke test for Wallet Radar data tables.
 *
 * Goal: keep `npm test` as a CI gate without pulling in a large test framework.
 * This validates the *source-of-truth* markdown tables for expected structure
 * and a few known invariants that protect against accidental column drift.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const WALLETS_DIR = path.join(ROOT, '..'); // /workspace/wallets

function readFile(p) {
  assert.ok(fs.existsSync(p), `Expected file to exist: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

function parseMarkdownTable(content) {
  const lines = content.split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('|') || /^\|[\s-:|]+\|$/.test(line)) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length) rows.push(cells);
  }
  return rows;
}

function findRow(rows, includesText) {
  const needle = includesText.toLowerCase();
  return rows.find((r) => r.some((c) => c.toLowerCase().includes(needle)));
}

function main() {
  const softwarePath = path.join(WALLETS_DIR, 'WALLET_COMPARISON_UNIFIED_TABLE.md');
  const hardwarePath = path.join(WALLETS_DIR, 'HARDWARE_WALLET_COMPARISON_TABLE.md');
  const cardsPath = path.join(WALLETS_DIR, 'CRYPTO_CREDIT_CARD_COMPARISON_TABLE.md');

  const software = parseMarkdownTable(readFile(softwarePath));
  const hardware = parseMarkdownTable(readFile(hardwarePath));
  const cards = parseMarkdownTable(readFile(cardsPath));

  // Basic size invariants (header + plenty of rows)
  assert.ok(software.length >= 10, 'Expected software table to have >= 10 rows');
  assert.ok(hardware.length >= 10, 'Expected hardware table to have >= 10 rows');
  assert.ok(cards.length >= 10, 'Expected cards table to have >= 10 rows');

  // Header invariants (protects column drift)
  const swHeader = software[0];
  assert.equal(swHeader[0], 'Wallet', 'Software table first column should be Wallet');
  assert.equal(swHeader[1], 'Score', 'Software table second column should be Score');

  const hwHeader = hardware[0];
  assert.equal(hwHeader[0], 'Wallet', 'Hardware table first column should be Wallet');
  assert.equal(hwHeader[7], 'Price', 'Hardware table Price should be column 8');

  const cardHeader = cards[0];
  assert.equal(cardHeader[0], 'Card', 'Card table first column should be Card');
  assert.equal(cardHeader[1], 'Score', 'Card table second column should be Score');

  // Row spot-checks (protects against accidental renames/removals)
  const rabbyRow = findRow(software, 'Rabby');
  assert.ok(rabbyRow, 'Expected to find Rabby row in software table');

  const trezor5Row = findRow(hardware, 'Trezor Safe 5');
  assert.ok(trezor5Row, 'Expected to find Trezor Safe 5 row in hardware table');
  assert.ok(/\$/.test(trezor5Row[7] || ''), 'Expected hardware Price cell to contain $ for Trezor Safe 5');

  const bybitRow = findRow(cards, 'Bybit Card');
  assert.ok(bybitRow, 'Expected to find Bybit Card row in cards table');

  console.log('✅ Wallet data smoke test passed');
}

try {
  main();
} catch (err) {
  console.error('❌ Wallet data smoke test failed');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
}

