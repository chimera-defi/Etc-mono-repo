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
  SCORING_METHODOLOGY_VERSION,
  computeSoftwareScore,
  computeHardwareScore,
  computeCardScore,
  computeRampScore,
  assignRecommendationBands,
  recommendationEmoji,
} = require(path.join(__dirname, '..', 'src', 'lib', 'scoring.js'));
const { processAllTables } = require(path.join(__dirname, '..', '..', 'scripts', 'sync_table_scores.js'));

const FRONTEND_DIR = path.resolve(__dirname, '..');
const WALLETS_DIR = path.resolve(FRONTEND_DIR, '..');
const CURRENT_YEAR = new Date().getUTCFullYear();

const SOFTWARE_CONTRACT_MUTATORS = {
  Core: () => '❌',
  'Rel/Mo': () => '0',
  RPC: () => '❌',
  GitHub: () => 'Private',
  Active: () => '❌ Inactive',
  Chains: () => '/chains/eth /chains/btc /chains/sol /chains/move /chains/cosmos /chains/polkadot /chains/starknet TON',
  Devices: () => '📱',
  Testnets: () => '❌',
  License: () => '❌ Closed',
  API: () => '❌ Closed',
  Audits: () => '❌',
  Funding: () => '🔴 Unknown',
  'Tx Sim': () => '❌',
  Scam: () => '❌',
  Account: () => 'EOA',
  'ENS/Naming': () => 'None',
  HW: () => '❌',
};

const HARDWARE_CONTRACT_MUTATORS = {
  GitHub: () => 'Private',
  'Air-Gap': () => '✅',
  'Open Source': () => '❌ Closed',
  'Secure Elem': () => '❌ None',
  Display: () => 'No Display',
  Price: () => '~$999',
  Conn: () => 'USB + BT + WiFi',
  Activity: () => '❌ Inactive',
  Founded: () => String(CURRENT_YEAR),
  Funding: () => '🔴 Unknown',
};

const CARDS_CONTRACT_MUTATORS = {
  Type: () => 'Prepaid',
  Custody: () => '🏦 Exchange',
  Biz: () => '❌',
  Region: () => '🇺🇸 US',
  'Cash Back': () => '0%',
  'Annual Fee': () => '$499',
  'FX Fee': () => '3%',
  Rewards: () => 'None',
  Status: () => '❌ Inactive',
};

const RAMPS_CONTRACT_MUTATORS = {
  Type: () => 'On-Ramp',
  'On-Ramp': () => '❌',
  'Off-Ramp': () => '❌',
  Coverage: () => '~5 Countries',
  'Fee Model': () => 'High',
  'Min Fee': () => '~$50.00',
  'Dev UX': () => 'Basic',
  Status: () => '❌ Inactive',
  Founded: () => '2010',
  Funding: () => '🟢 Revenue',
};

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

function parseTableLine(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parsePrimaryTable(content) {
  const lines = content.split('\n');
  const headerIndex = lines.findIndex((line, index) => (
    line.startsWith('|') &&
    index + 1 < lines.length &&
    /^\|[\s-:|]+\|$/.test(lines[index + 1].trim())
  ));

  if (headerIndex === -1) {
    return { header: [], rows: [] };
  }

  const header = parseTableLine(lines[headerIndex]);
  const rows = [];

  for (let i = headerIndex + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.startsWith('|')) break;
    if (/^\|[\s-:|]+\|$/.test(line.trim())) continue;
    rows.push(parseTableLine(line));
  }

  return { header, rows };
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

function assertComputedScore(
  fileLabel,
  row,
  computeScore,
  scoreIndex,
  recommendationIndex = null,
  expectedRecommendation = null
) {
  const scoreInfo = computeScore(row);
  const scoreCell = String(row[scoreIndex] || '');
  const expectedScore = String(scoreInfo.score);

  if (!scoreCell.includes(expectedScore)) {
    fail(`${fileLabel}: computed score drift for "${row[0]}". Expected "${expectedScore}" in "${scoreCell}"`);
    return;
  }

  const recommendation = expectedRecommendation || scoreInfo.recommendation;
  const expectedRec = recommendationEmoji(recommendation);

  if (recommendationIndex !== null) {
    const recCell = String(row[recommendationIndex] || '');
    if (!recCell.includes(expectedRec)) {
      fail(`${fileLabel}: computed recommendation drift for "${row[0]}". Expected "${expectedRec}" in "${recCell}"`);
      return;
    }
  } else {
    if (!scoreCell.includes(expectedRec)) {
      fail(`${fileLabel}: score emoji drift for "${row[0]}". Expected "${expectedRec}" in "${scoreCell}"`);
      return;
    }
  }

  ok(`${fileLabel}: computed score matches for ${row[0]}`);
}

function assertAllRowsColumnShape(fileLabel, header, rows) {
  let failures = 0;
  for (const row of rows) {
    if (row.length !== header.length) {
      fail(`${fileLabel}: row has ${row.length} columns, expected ${header.length}: ${row[0] || '<unknown>'}`);
      failures += 1;
      continue;
    }
    const emptyIndex = row.findIndex((cell) => cell.trim().length === 0);
    if (emptyIndex !== -1) {
      fail(`${fileLabel}: empty cell at column ${emptyIndex + 1} in row ${row[0] || '<unknown>'}`);
      failures += 1;
    }
  }

  if (failures === 0) {
    ok(`${fileLabel}: all ${rows.length} rows have complete column coverage`);
  }
}

function assertAllRowsComputed(
  fileLabel,
  rows,
  computeScore,
  scoreIndex,
  recommendationIndex = null,
  expectedRecommendations = []
) {
  let failures = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const scoreInfo = computeScore(row);
    const scoreCell = String(row[scoreIndex] || '');
    const expectedScore = String(scoreInfo.score);
    if (!scoreCell.includes(expectedScore)) {
      fail(`${fileLabel}: score drift in row ${row[0]}. Expected "${expectedScore}" in "${scoreCell}"`);
      failures += 1;
      continue;
    }

    const recommendation = expectedRecommendations[i] || scoreInfo.recommendation;
    const expectedRec = recommendationEmoji(recommendation);
    if (recommendationIndex !== null) {
      const recCell = String(row[recommendationIndex] || '');
      if (!recCell.includes(expectedRec)) {
        fail(`${fileLabel}: recommendation drift in row ${row[0]}. Expected "${expectedRec}" in "${recCell}"`);
        failures += 1;
      }
    } else if (!scoreCell.includes(expectedRec)) {
      fail(`${fileLabel}: score emoji drift in row ${row[0]}. Expected "${expectedRec}" in "${scoreCell}"`);
      failures += 1;
    }
  }

  if (failures === 0) {
    ok(`${fileLabel}: computed scoring validated for all ${rows.length} rows`);
  }
}

function assertScoredColumnContract(fileLabel, header, row, computeScore, mutatorsByHeader) {
  let failures = 0;
  const baseline = computeScore(row);

  for (const [headerName, mutate] of Object.entries(mutatorsByHeader)) {
    const columnIndex = header.findIndex(
      (cell) => normalizeHeaderCell(cell) === normalizeHeaderCell(headerName)
    );

    if (columnIndex === -1) {
      fail(`${fileLabel}: scorer contract references missing header "${headerName}"`);
      failures += 1;
      continue;
    }

    const mutatedRow = [...row];
    mutatedRow[columnIndex] = mutate(String(mutatedRow[columnIndex] || ''));
    const mutated = computeScore(mutatedRow);

    if (mutated.score === baseline.score && mutated.recommendation === baseline.recommendation) {
      fail(
        `${fileLabel}: scorer contract drift — mutating "${headerName}" did not change score/recommendation ` +
          `(baseline ${baseline.score}/${baseline.recommendation}, mutated ${mutated.score}/${mutated.recommendation})`
      );
      failures += 1;
    }
  }

  if (failures === 0) {
    ok(`${fileLabel}: scored-column contract validated (${Object.keys(mutatorsByHeader).length} columns)`);
  }
}

function assertCompanyColumns(fileLabel, rows, foundedIndex, fundingIndex) {
  let failures = 0;

  for (const row of rows) {
    const founded = String(row[foundedIndex] || '').trim();
    const funding = String(row[fundingIndex] || '').trim();
    if (!/^\d{4}$/.test(founded)) {
      fail(`${fileLabel}: founded year must be YYYY in row ${row[0]}, got "${founded}"`);
      failures += 1;
    } else {
      const year = parseInt(founded, 10);
      if (year < 1990 || year > CURRENT_YEAR) {
        fail(`${fileLabel}: founded year out of range in row ${row[0]}, got "${founded}"`);
        failures += 1;
      }
    }

    if (!/^(🟢|🟡|🔴)\s+/.test(funding)) {
      fail(`${fileLabel}: funding cell must start with 🟢/🟡/🔴 in row ${row[0]}, got "${funding}"`);
      failures += 1;
    }
  }

  if (failures === 0) {
    ok(`${fileLabel}: founded/funding metadata validated for all ${rows.length} rows`);
  }
}

function assertMethodologyVersionTag(fileLabel, content) {
  if (!content.includes(SCORING_METHODOLOGY_VERSION)) {
    fail(`${fileLabel}: missing methodology version tag "${SCORING_METHODOLOGY_VERSION}"`);
  } else {
    ok(`${fileLabel}: methodology version tag is current (${SCORING_METHODOLOGY_VERSION})`);
  }
}

function run() {
  console.log('🔎 Running wallet table smoke tests...\n');

  // ---- Software wallets table ----
  const softwarePath = path.join(WALLETS_DIR, 'SOFTWARE_WALLETS.md');
  const softwareContent = readFileOrFail(softwarePath);
  assertMethodologyVersionTag('Software wallets table', softwareContent);
  const softwareTable = parsePrimaryTable(softwareContent);
  const softwareRows = softwareTable.rows;
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
  const softwareScoreInfos = softwareRows.map((row) => computeSoftwareScore(row));
  const softwareExpectedRecommendations = assignRecommendationBands('software', softwareScoreInfos).recommendations;
  assertHeaders('Software wallets table', softwareTable.header, softwareExpectedHeader);
  assertAllRowsColumnShape('Software wallets table', softwareTable.header, softwareRows);
  assertAllRowsComputed(
    'Software wallets table',
    softwareRows,
    computeSoftwareScore,
    1,
    20,
    softwareExpectedRecommendations
  );

  const rabbyRow = findRowByFirstCellSubstring(softwareRows, 'rabby');
  if (!rabbyRow) {
    fail('Software wallets table: could not find Rabby row.');
  } else {
    const chains = rabbyRow[7] || '';
    const license = rabbyRow[10] || '';
    const rabbyIndex = softwareRows.indexOf(rabbyRow);
    assertComputedScore(
      'Software wallets table',
      rabbyRow,
      computeSoftwareScore,
      1,
      20,
      softwareExpectedRecommendations[rabbyIndex]
    );
    // Chains now uses HTML img tags for chain logos
    // Rabby is EVM-only, so it should have eth.svg image
    if (!/eth\.svg/.test(chains) && !/⟠/.test(chains)) fail(`Rabby chains drifted (expected eth.svg or ⟠ for EVM), got: "${chains}"`);
    if (!/mit/i.test(license)) fail(`Rabby license drifted (expected MIT), got: "${license}"`);
    assertScoredColumnContract(
      'Software wallets table',
      softwareTable.header,
      rabbyRow,
      computeSoftwareScore,
      SOFTWARE_CONTRACT_MUTATORS
    );
    ok('Software wallets table: Rabby spot-check passed');
  }

  // ---- Hardware wallets table ----
  const hardwarePath = path.join(WALLETS_DIR, 'HARDWARE_WALLETS.md');
  const hardwareContent = readFileOrFail(hardwarePath);
  assertMethodologyVersionTag('Hardware wallets table', hardwareContent);
  const hardwareTable = parsePrimaryTable(hardwareContent);
  const hardwareRows = hardwareTable.rows;
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
    'Founded',
    'Funding',
    'Rec',
  ];
  const hardwareScoreInfos = hardwareRows.map((row) => computeHardwareScore(row));
  const hardwareExpectedRecommendations = assignRecommendationBands('hardware', hardwareScoreInfos).recommendations;
  assertHeaders('Hardware wallets table', hardwareTable.header, hardwareExpectedHeader);
  assertAllRowsColumnShape('Hardware wallets table', hardwareTable.header, hardwareRows);
  assertCompanyColumns('Hardware wallets table', hardwareRows, 10, 11);
  assertAllRowsComputed(
    'Hardware wallets table',
    hardwareRows,
    computeHardwareScore,
    1,
    12,
    hardwareExpectedRecommendations
  );

  const trezorSafe5Row = findRowByFirstCellSubstring(hardwareRows, 'trezor safe 5');
  if (!trezorSafe5Row) {
    fail('Hardware wallets table: could not find Trezor Safe 5 row.');
  } else {
    const display = trezorSafe5Row[6] || '';
    const price = trezorSafe5Row[7] || '';
    const trezorSafe5Index = hardwareRows.indexOf(trezorSafe5Row);
    assertComputedScore(
      'Hardware wallets table',
      trezorSafe5Row,
      computeHardwareScore,
      1,
      12,
      hardwareExpectedRecommendations[trezorSafe5Index]
    );
    if (/\$/.test(display)) {
      fail(`Hardware table: Display cell unexpectedly contains "$": "${display}"`);
    }
    if (!/\$/.test(price)) {
      fail(`Hardware table: Price cell missing "$" (expected ~$...), got: "${price}"`);
    }
    const degradedCompanySignals = [...trezorSafe5Row];
    degradedCompanySignals[10] = String(CURRENT_YEAR);
    degradedCompanySignals[11] = '🔴 Unknown';
    const baseScore = computeHardwareScore(trezorSafe5Row).score;
    const degradedScore = computeHardwareScore(degradedCompanySignals).score;
    if (degradedScore >= baseScore) {
      fail(
        `Hardware wallets table: founded/funding signals should affect score (base ${baseScore}, degraded ${degradedScore}).`
      );
    } else {
      ok('Hardware wallets table: founded/funding signals influence score as expected');
    }
    assertScoredColumnContract(
      'Hardware wallets table',
      hardwareTable.header,
      trezorSafe5Row,
      computeHardwareScore,
      HARDWARE_CONTRACT_MUTATORS
    );
    ok('Hardware wallets table: Trezor Safe 5 spot-check passed');
  }

  // Regression check: "inactive" must not be misclassified as "active".
  const ledgerNanoSRow =
    hardwareRows.find((row) => String(row[0] || '').toLowerCase().includes('ledger nano s**')) || null;
  if (!ledgerNanoSRow) {
    fail('Hardware wallets table: could not find Ledger Nano S row.');
  } else {
    const ledgerNanoSIndex = hardwareRows.indexOf(ledgerNanoSRow);
    assertComputedScore(
      'Hardware wallets table',
      ledgerNanoSRow,
      computeHardwareScore,
      1,
      12,
      hardwareExpectedRecommendations[ledgerNanoSIndex]
    );
    const activity = ledgerNanoSRow[9] || '';
    const rec = ledgerNanoSRow[12] || '';
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

  const inactiveStatusPos = parserContent.indexOf('/\\binactive\\b/.test(lower)');
  const activeStatusPos = parserContent.indexOf('/\\bactive\\b/.test(lower)');
  if (inactiveStatusPos === -1 || activeStatusPos === -1 || inactiveStatusPos > activeStatusPos) {
    fail('wallet-data.ts: parseStatus should check inactive before active to avoid substring misclassification.');
  } else {
    ok('wallet-data.ts: parseStatus inactive/active ordering is correct');
  }

  if (!parserContent.includes('const headerIndex = lines.findIndex') || !parserContent.includes("if (!line.startsWith('|')) break;")) {
    fail('wallet-data.ts: parseMarkdownTable should only read the primary comparison table (not all tables in file).');
  } else {
    ok('wallet-data.ts: parseMarkdownTable is primary-table scoped');
  }

  const walletTablePath = path.join(FRONTEND_DIR, 'src', 'components', 'WalletTable.tsx');
  const walletTableContent = readFileOrFail(walletTablePath);
  const hasRecommendationErrorVariant = /if \(recommendation === 'avoid' \|\| recommendation === 'not-for-dev'\) variant = 'error';/.test(walletTableContent);
  const hasRecommendationSuccessVariant = /else if \(recommendation === 'recommended'\) variant = 'success';/.test(walletTableContent);
  const hasBandingTooltipCopy = /Banding: 🟢 top half, 🟡 middle quartile, 🔴 bottom quartile or inactive\./.test(walletTableContent);
  const hasBelowMedianCopy = /Below median/.test(walletTableContent);
  const hasMedianPropWiring = /scoreMedian=\{scoreMedian\}/.test(walletTableContent);
  const hasExplicitScoreHeader = /HeaderTooltip label="Score"/.test(walletTableContent);
  if (!hasRecommendationErrorVariant || !hasRecommendationSuccessVariant || !hasBandingTooltipCopy || !hasMedianPropWiring) {
    fail('WalletTable.tsx: score badge must color by recommendation bands and keep score column wired.');
  } else if (hasBelowMedianCopy) {
    fail('WalletTable.tsx: stale "below median" score color copy should be removed.');
  } else {
    ok('WalletTable.tsx: recommendation-band score color regression guard passed');
  }
  if (!hasExplicitScoreHeader) {
    fail('WalletTable.tsx: table view must include an explicit Score column header.');
  } else {
    ok('WalletTable.tsx: explicit Score column header guard passed');
  }

  // ---- Crypto cards table ----
  const cardsPath = path.join(WALLETS_DIR, 'CRYPTO_CARDS.md');
  const cardsContent = readFileOrFail(cardsPath);
  assertMethodologyVersionTag('Crypto cards table', cardsContent);
  const cardsTable = parsePrimaryTable(cardsContent);
  const cardsRows = cardsTable.rows;
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
    'Rec',
  ];
  const cardsScoreInfos = cardsRows.map((row) => computeCardScore(row));
  const cardsExpectedRecommendations = assignRecommendationBands('cards', cardsScoreInfos).recommendations;
  assertHeaders('Crypto cards table', cardsTable.header, cardsExpectedHeader);
  assertAllRowsColumnShape('Crypto cards table', cardsTable.header, cardsRows);
  assertAllRowsComputed(
    'Crypto cards table',
    cardsRows,
    computeCardScore,
    1,
    12,
    cardsExpectedRecommendations
  );

  // Spot-check EtherFi Cash (top-ranked card after Jan 2026 recalculation)
  // Card column now contains both name and URL: [**Card Name**](url)
  const etherfiRow = findRowByFirstCellSubstring(cardsRows, 'etherfi cash');
  if (!etherfiRow) {
    fail('Crypto cards table: could not find EtherFi Cash row.');
  } else {
    const card = etherfiRow[0] || '';
    const custody = etherfiRow[3] || '';
    const status = etherfiRow[10] || '';     // Status column at index 10 after removing Provider
    const etherfiIndex = cardsRows.indexOf(etherfiRow);
    assertComputedScore(
      'Crypto cards table',
      etherfiRow,
      computeCardScore,
      1,
      12,
      cardsExpectedRecommendations[etherfiIndex]
    );
    if (!/Self/.test(custody)) fail(`EtherFi Cash custody drifted (expected Self), got: "${custody}"`);
    // Card column should now have URL embedded
    if (!/ether\.fi/i.test(card)) fail(`EtherFi Cash card column should contain ether.fi URL, got: "${card}"`);
    if (!/✅/.test(status)) fail(`EtherFi Cash status drifted (expected ✅), got: "${status}"`);
    assertScoredColumnContract(
      'Crypto cards table',
      cardsTable.header,
      etherfiRow,
      computeCardScore,
      CARDS_CONTRACT_MUTATORS
    );
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
    const readyIndex = cardsRows.indexOf(readyRow);
    assertComputedScore(
      'Crypto cards table',
      readyRow,
      computeCardScore,
      1,
      12,
      cardsExpectedRecommendations[readyIndex]
    );
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
  assertMethodologyVersionTag('Ramps table', rampsContent);
  const rampsTable = parsePrimaryTable(rampsContent);
  const rampsRows = rampsTable.rows;
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
    'Founded',
    'Funding',
    'Best For',
    'Rec',
  ];
  const rampsScoreInfos = rampsRows.map((row) => computeRampScore(row));
  const rampsExpectedRecommendations = assignRecommendationBands('ramps', rampsScoreInfos).recommendations;
  assertHeaders('Ramps table', rampsTable.header, rampsExpectedHeader);
  assertAllRowsColumnShape('Ramps table', rampsTable.header, rampsRows);
  assertCompanyColumns('Ramps table', rampsRows, 10, 11);
  assertAllRowsComputed(
    'Ramps table',
    rampsRows,
    computeRampScore,
    1,
    13,
    rampsExpectedRecommendations
  );

  const transakRow = findRowByFirstCellSubstring(rampsRows, 'transak');
  if (!transakRow) {
    fail('Ramps table: could not find Transak row.');
  } else {
    const transakIndex = rampsRows.indexOf(transakRow);
    assertComputedScore(
      'Ramps table',
      transakRow,
      computeRampScore,
      1,
      13,
      rampsExpectedRecommendations[transakIndex]
    );
    const improvedCompanySignals = [...transakRow];
    improvedCompanySignals[10] = '2010';
    improvedCompanySignals[11] = '🟢 Revenue';
    const baseScore = computeRampScore(transakRow).score;
    const improvedScore = computeRampScore(improvedCompanySignals).score;
    if (improvedScore <= baseScore) {
      fail(
        `Ramps table: founded/funding signals should affect score (base ${baseScore}, improved ${improvedScore}).`
      );
    } else {
      ok('Ramps table: founded/funding signals influence score as expected');
    }
    assertScoredColumnContract(
      'Ramps table',
      rampsTable.header,
      transakRow,
      computeRampScore,
      RAMPS_CONTRACT_MUTATORS
    );
  }

  const driftResults = processAllTables({ write: false }).filter((result) => result.changed);
  if (driftResults.length > 0) {
    fail(`Score sync drift detected in: ${driftResults.map((result) => result.label).join(', ')}`);
  } else {
    ok('Score sync script reports clean tables');
  }

  const syncScriptPath = path.join(WALLETS_DIR, 'scripts', 'sync_table_scores.js');
  const syncScriptContent = readFileOrFail(syncScriptPath);
  if (!syncScriptContent.includes('assignRecommendationBands')) {
    fail('sync_table_scores.js: expected percentile recommendation assignment via assignRecommendationBands().');
  } else {
    ok('sync_table_scores.js: recommendation assignment is centralized');
  }

  console.log('\nDone.');
  if (process.exitCode) {
    console.error('\nOne or more checks failed.');
    process.exit(process.exitCode);
  }
}

run();
