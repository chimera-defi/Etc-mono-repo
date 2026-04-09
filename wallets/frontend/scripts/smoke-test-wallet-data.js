#!/usr/bin/env node
/**
 * Lightweight smoke tests for the markdown table data pipeline.
 *
 * Purpose:
 * - Catch table header/column drift early (before it breaks parsing/UI).
 * - Spot-check a few known rows for key invariants (e.g. price column semantics).
 *
 * Notes:
 * - Dependency-free (plain Node.js).
 * - Reads markdown tables from the parent `wallets/` directory.
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const {
  computeSoftwareScore,
  computeHardwareScore,
  computeCardScore,
  computeRampScore,
  recommendationEmoji,
} = require(path.join(__dirname, '..', 'src', 'lib', 'scoring.js'));
const { processAllTables } = require(path.join(__dirname, '..', '..', 'scripts', 'sync_table_scores.js'));

const FRONTEND_DIR = path.resolve(__dirname, '..');
const WALLETS_DIR = path.resolve(FRONTEND_DIR, '..');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function readFileOrFail(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing file: ${filePath}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function parseMarkdownTable(content) {
  const lines = content.split('\n');
  const rows = [];

  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (/^\|[\s-:|]+\|$/.test(line)) continue; // separator row

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

    if (cells.length) rows.push(cells);
  }

  return rows;
}

function normalizeHeaderCell(cell) {
  return String(cell)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9/+_-]/g, '');
}

function assertHeaders(fileLabel, actualHeader, expectedHeader) {
  const actual = actualHeader.map(normalizeHeaderCell);
  const expected = expectedHeader.map(normalizeHeaderCell);

  const sameLength = actual.length === expected.length;
  const sameValues = sameLength && actual.every((v, i) => v === expected[i]);

  if (!sameValues) {
    fail(
      `${fileLabel}: header mismatch.\n` +
        `Expected (${expectedHeader.length}): ${expectedHeader.join(' | ')}\n` +
        `Actual   (${actualHeader.length}): ${actualHeader.join(' | ')}`
    );
    return;
  }

  ok(`${fileLabel}: headers match (${expectedHeader.length} columns)`);
}

function findRowByFirstCellSubstring(rows, needle) {
  const n = needle.toLowerCase();
  return rows.find((r) => String(r[0] || '').toLowerCase().includes(n)) || null;
}

function assertComputedScore(fileLabel, row, computeScore, scoreIndex, recommendationIndex = null) {
  const scoreInfo = computeScore(row);
  const scoreCell = String(row[scoreIndex] || '');
  const expectedScore = String(scoreInfo.score);

  if (!scoreCell.includes(expectedScore)) {
    fail(`${fileLabel}: computed score drift for "${row[0]}". Expected "${expectedScore}" in "${scoreCell}"`);
    return;
  }

  if (recommendationIndex !== null) {
    const recCell = String(row[recommendationIndex] || '');
    const expectedRec = recommendationEmoji(scoreInfo.recommendation);
    if (!recCell.includes(expectedRec)) {
      fail(`${fileLabel}: computed recommendation drift for "${row[0]}". Expected "${expectedRec}" in "${recCell}"`);
      return;
    }
  } else {
    const expectedRec = recommendationEmoji(scoreInfo.recommendation);
    if (!scoreCell.includes(expectedRec)) {
      fail(`${fileLabel}: score emoji drift for "${row[0]}". Expected "${expectedRec}" in "${scoreCell}"`);
      return;
    }
  }

  ok(`${fileLabel}: computed score matches for ${row[0]}`);
}

function run() {
  console.log('🔎 Running wallet table smoke tests...\n');

  // ---- Software wallets table ----
  const softwarePath = path.join(WALLETS_DIR, 'SOFTWARE_WALLETS.md');
  const softwareContent = readFileOrFail(softwarePath);
  const softwareRows = parseMarkdownTable(softwareContent);
  if (softwareRows.length < 5) fail('Software table has too few rows (expected header + data).');

  const softwareExpectedHeader = [
    'Wallet',
    'Score',
    'Core',
    'Rel/Mo',
    'RPC',
    'GitHub',
    'Active',
    'Chains',
    'Devices',
    'Testnets',
    'License',
    'API',        // NEW: API openness column
    'Audits',
    'Funding',
    'Tx Sim',
    'Scam',
    'Account',
    'ENS/Naming',
    'HW',
    'Best For',
    'Rec',
  ];
  assertHeaders('Software wallets table', softwareRows[0], softwareExpectedHeader);

  const rabbyRow = findRowByFirstCellSubstring(softwareRows, 'rabby');
  if (!rabbyRow) {
    fail('Software wallets table: could not find Rabby row.');
  } else {
    const chains = rabbyRow[7] || '';
    const license = rabbyRow[10] || '';
    assertComputedScore('Software wallets table', rabbyRow, computeSoftwareScore, 1, 20);
    // Chains now uses HTML img tags for chain logos
    // Rabby is EVM-only, so it should have eth.svg image
    if (!/eth\.svg/.test(chains) && !/⟠/.test(chains)) fail(`Rabby chains drifted (expected eth.svg or ⟠ for EVM), got: "${chains}"`);
    if (!/mit/i.test(license)) fail(`Rabby license drifted (expected MIT), got: "${license}"`);
    ok('Software wallets table: Rabby spot-check passed');
  }

  // ---- Hardware wallets table ----
  const hardwarePath = path.join(WALLETS_DIR, 'HARDWARE_WALLETS.md');
  const hardwareContent = readFileOrFail(hardwarePath);
  const hardwareRows = parseMarkdownTable(hardwareContent);
  if (hardwareRows.length < 5) fail('Hardware table has too few rows (expected header + data).');

  const hardwareExpectedHeader = [
    'Wallet',
    'Score',
    'GitHub',
    'Air-Gap',
    'Open Source',
    'Secure Elem',
    'Display',
    'Price',
    'Conn',
    'Activity',
    'Rec',
  ];
  assertHeaders('Hardware wallets table', hardwareRows[0], hardwareExpectedHeader);

  const trezorSafe5Row = findRowByFirstCellSubstring(hardwareRows, 'trezor safe 5');
  if (!trezorSafe5Row) {
    fail('Hardware wallets table: could not find Trezor Safe 5 row.');
  } else {
    const display = trezorSafe5Row[6] || '';
    const price = trezorSafe5Row[7] || '';
    assertComputedScore('Hardware wallets table', trezorSafe5Row, computeHardwareScore, 1, 10);
    if (/\$/.test(display)) {
      fail(`Hardware table: Display cell unexpectedly contains "$": "${display}"`);
    }
    if (!/\$/.test(price)) {
      fail(`Hardware table: Price cell missing "$" (expected ~$...), got: "${price}"`);
    }
    ok('Hardware wallets table: Trezor Safe 5 spot-check passed');
  }

  // Regression check: "inactive" must not be misclassified as "active".
  const ledgerNanoSRow =
    hardwareRows.find((row) => String(row[0] || '').toLowerCase().includes('ledger nano s**')) || null;
  if (!ledgerNanoSRow) {
    fail('Hardware wallets table: could not find Ledger Nano S row.');
  } else {
    assertComputedScore('Hardware wallets table', ledgerNanoSRow, computeHardwareScore, 1, 10);
    const activity = ledgerNanoSRow[9] || '';
    const rec = ledgerNanoSRow[10] || '';
    let hasFailure = false;
    if (!/inactive/i.test(activity)) {
      fail(`Hardware wallets table: expected Ledger Nano S activity to be inactive, got "${activity}"`);
      hasFailure = true;
    }
    if (!/🔴/.test(rec)) {
      fail(`Hardware wallets table: inactive Ledger Nano S should be 🔴, got "${rec}"`);
      hasFailure = true;
    }
    if (!hasFailure) {
      ok('Hardware wallets table: inactive status classification check passed');
    }
  }

  // Also verify the parser is still reading the hardware "Price" from the right column.
  const parserPath = path.join(FRONTEND_DIR, 'src', 'lib', 'wallet-data.ts');
  const parserContent = readFileOrFail(parserPath);
  if (!parserContent.includes('parsePrice(cells[7]')) {
    fail('wallet-data.ts: expected hardware price parsing from cells[7] (Price column).');
  } else {
    ok('wallet-data.ts: hardware price parsing uses cells[7] (Price column)');
  }

  // ---- Crypto cards table ----
  const cardsPath = path.join(WALLETS_DIR, 'CRYPTO_CARDS.md');
  const cardsContent = readFileOrFail(cardsPath);
  const cardsRows = parseMarkdownTable(cardsContent);
  if (cardsRows.length < 5) fail('Cards table has too few rows (expected header + data).');

  // Provider column merged into Card column (Jan 2026) - card names now link directly to provider
  const cardsExpectedHeader = [
    'Card',
    'Score',
    'Type',
    'Custody',    // Custody column added Jan 2026
    'Biz',
    'Region',
    'Cash Back',
    'Annual Fee',
    'FX Fee',
    'Rewards',
    'Status',
    'Best For',
  ];
  assertHeaders('Crypto cards table', cardsRows[0], cardsExpectedHeader);

  // Spot-check EtherFi Cash (top-ranked card after Jan 2026 recalculation)
  // Card column now contains both name and URL: [**Card Name**](url)
  const etherfiRow = findRowByFirstCellSubstring(cardsRows, 'etherfi cash');
  if (!etherfiRow) {
    fail('Crypto cards table: could not find EtherFi Cash row.');
  } else {
    const card = etherfiRow[0] || '';
    const custody = etherfiRow[3] || '';
    const status = etherfiRow[10] || '';     // Status column at index 10 after removing Provider
    assertComputedScore('Crypto cards table', etherfiRow, computeCardScore, 1);
    if (!/Self/.test(custody)) fail(`EtherFi Cash custody drifted (expected Self), got: "${custody}"`);
    // Card column should now have URL embedded
    if (!/ether\.fi/i.test(card)) fail(`EtherFi Cash card column should contain ether.fi URL, got: "${card}"`);
    if (!/✅/.test(status)) fail(`EtherFi Cash status drifted (expected ✅), got: "${status}"`);
    ok('Crypto cards table: EtherFi Cash spot-check passed');
  }

  // Spot-check Ready Card (self-custody, 3% cashback - major correction Jan 2026)
  const readyRow = findRowByFirstCellSubstring(cardsRows, 'ready card');
  if (!readyRow) {
    fail('Crypto cards table: could not find Ready Card row.');
  } else {
    const card = readyRow[0] || '';
    const custody = readyRow[3] || '';
    const cashback = readyRow[6] || '';  // Cash Back column
    assertComputedScore('Crypto cards table', readyRow, computeCardScore, 1);
    if (!/Self/.test(custody)) fail(`Ready Card custody drifted (expected Self), got: "${custody}"`);
    // Card column should now have URL embedded
    if (!/ready\.co/i.test(card)) fail(`Ready Card card column should contain ready.co URL, got: "${card}"`);
    // Cash back should be 3% (not "Up to 10%" - major correction)
    if (!/3%/.test(cashback)) fail(`Ready Card cash back should be 3% (verified), got: "${cashback}"`);
    ok('Crypto cards table: Ready Card spot-check passed');
  }

  // ---- Ramps table ----
  const rampsPath = path.join(WALLETS_DIR, 'RAMPS.md');
  const rampsContent = readFileOrFail(rampsPath);
  const rampsRows = parseMarkdownTable(rampsContent);
  if (rampsRows.length < 5) fail('Ramps table has too few rows (expected header + data).');

  const rampsExpectedHeader = [
    'Provider',
    'Score',
    'Type',
    'On-Ramp',
    'Off-Ramp',
    'Coverage',
    'Fee Model',
    'Min Fee',
    'Dev UX',
    'Status',
    'Best For',
  ];
  assertHeaders('Ramps table', rampsRows[0], rampsExpectedHeader);

  const transakRow = findRowByFirstCellSubstring(rampsRows, 'transak');
  if (!transakRow) {
    fail('Ramps table: could not find Transak row.');
  } else {
    assertComputedScore('Ramps table', transakRow, computeRampScore, 1);
  }

  const driftResults = processAllTables({ write: false }).filter((result) => result.changed);
  if (driftResults.length > 0) {
    fail(`Score sync drift detected in: ${driftResults.map((result) => result.label).join(', ')}`);
  } else {
    ok('Score sync script reports clean tables');
  }

  console.log('\nDone.');
  if (process.exitCode) {
    console.error('\nOne or more checks failed.');
    process.exit(process.exitCode);
  }
}

run();
