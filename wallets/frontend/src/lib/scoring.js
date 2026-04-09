const SOFTWARE_MAX_SCORE = 100;
const HARDWARE_MAX_SCORE = 100;
const CARD_MAX_SCORE = 100;
const RAMP_MAX_SCORE = 100;

const SCORING_METHODOLOGY_VERSION = '2026-04-visible-columns-v1';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundScore(value) {
  return Math.round(clamp(value, 0, 100));
}

function extractInteger(cell) {
  const match = String(cell || '').match(/-?\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function extractPercentages(cell) {
  return Array.from(String(cell || '').matchAll(/(\d+(?:\.\d+)?)%/g)).map((match) => parseFloat(match[1]));
}

function extractCurrencyAmounts(cell) {
  return Array.from(String(cell || '').matchAll(/\$ ?(\d+(?:\.\d+)?)/g)).map((match) => parseFloat(match[1]));
}

function hasMarkdownLink(cell) {
  return /\[[^\]]+\]\((https?:\/\/[^)]+)\)/.test(String(cell || ''));
}

function includesAny(cell, patterns) {
  const text = String(cell || '').toLowerCase();
  return patterns.some((pattern) => text.includes(pattern));
}

function parseBooleanCell(cell) {
  return String(cell || '').includes('✅');
}

function parsePartialLevel(cell) {
  const text = String(cell || '');
  if (text.includes('✅')) return 'full';
  if (text.includes('⚠️')) return 'partial';
  return 'none';
}

function parseStatusCell(cell) {
  const text = String(cell || '');
  const lower = text.toLowerCase();
  // Check "inactive" first so it is not misclassified by "active" substring matching.
  if (text.includes('❌') || /\binactive\b/.test(lower)) return 'inactive';
  if (text.includes('🔒') || /\bprivate\b/.test(lower)) return 'private';
  if (text.includes('⚠️') || /\bslow\b/.test(lower)) return 'slow';
  if (text.includes('✅') || /\bactive\b/.test(lower)) return 'active';
  return 'inactive';
}

function parseLicenseLevel(cell) {
  const text = String(cell || '');
  if (text.includes('✅')) return 'open';
  if (text.includes('⚠️')) return 'partial';
  return 'closed';
}

function parseApiOpenness(cell) {
  const text = String(cell || '');
  const lower = text.toLowerCase();
  if (text.includes('✅') || lower.includes('open')) return 'open';
  if (text.includes('🌐') || lower.includes('public')) return 'public';
  if (text.includes('⚠️') || lower.includes('partial') || lower.includes('limited')) return 'partial';
  return 'closed';
}

function parseAuditLevel(cell) {
  const text = String(cell || '');
  const lower = text.toLowerCase();
  if (text.includes('✅') && /(2023|2024|2025|2026|certora)/i.test(text)) return 'recent';
  if (text.includes('✅')) return 'recent';
  if (text.includes('🐛') || lower.includes('h1') || lower.includes('bug bounty')) return 'bounty';
  if (text.includes('⚠️')) return 'old';
  return 'none';
}

function parseFundingLevel(cell) {
  const text = String(cell || '');
  if (text.includes('🟢')) return 'sustainable';
  if (text.includes('🟡')) return 'vc';
  return 'risky';
}

function parseEnsLevel(cell) {
  const text = String(cell || '').toLowerCase();
  if (text.includes('full')) return 'full';
  if (text.includes('basic')) return 'basic';
  if (text.includes('import')) return 'import';
  return 'none';
}

function parseChainBreadth(cell) {
  const raw = String(cell || '');
  const patterns = [
    ['/chains/eth', 'evm'],
    ['/chains/btc', 'bitcoin'],
    ['/chains/sol', 'solana'],
    ['/chains/move', 'move'],
    ['/chains/cosmos', 'cosmos'],
    ['/chains/polkadot', 'polkadot'],
    ['/chains/starknet', 'starknet'],
  ];
  let count = 0;
  for (const [pattern] of patterns) {
    if (raw.includes(pattern)) count += 1;
  }
  if (/[¹²³⁴⁵⁶⁷⁸⁹+]/.test(raw) || includesAny(raw, ['ton', 'tron', 'xrp', 'cardano', 'stellar', 'tezos'])) {
    count += 1;
  }
  return count;
}

function parseDeviceFlags(cell) {
  const text = String(cell || '');
  return {
    mobile: text.includes('📱'),
    browser: text.includes('🌐'),
    desktop: text.includes('💻'),
    web: text.includes('🔗'),
  };
}

function parseAccountTypes(cell) {
  const text = String(cell || '');
  return {
    safe: text.includes('Safe'),
    eip4337: text.includes('4337'),
    eip7702: text.includes('7702'),
  };
}

function buildBreakdown(total, max, entries, recommendation, methodologyVersion = SCORING_METHODOLOGY_VERSION) {
  return {
    score: roundScore(total),
    maxScore: max,
    recommendation,
    methodologyVersion,
    breakdown: entries.map((entry) => ({
      key: entry.key,
      label: entry.label,
      score: roundScore(entry.score),
      max: entry.max,
      note: entry.note,
    })),
  };
}

function softwareRecommendation(score, ctx) {
  if (ctx.activity === 'inactive') return 'avoid';
  if (score >= 80) return 'recommended';
  if (score >= 55) return 'situational';
  if (ctx.core !== 'full' || ctx.devControl <= 10) return 'not-for-dev';
  return 'avoid';
}

function hardwareRecommendation(score, ctx) {
  if (ctx.activity === 'inactive') return 'avoid';
  if (score >= 72) return 'recommended';
  if (score >= 45) return 'situational';
  return 'avoid';
}

function cardRecommendation(score, ctx) {
  if (ctx.status === 'inactive') return 'avoid';
  if (ctx.status === 'launching' && score < 70) return 'situational';
  if (score >= 75) return 'recommended';
  if (score >= 50) return 'situational';
  return 'avoid';
}

function rampRecommendation(score, ctx) {
  if (ctx.status === 'inactive') return 'avoid';
  if (ctx.status === 'launching' && score < 75) return 'situational';
  if (score >= 78) return 'recommended';
  if (score >= 55) return 'situational';
  return 'avoid';
}

function recommendationEmoji(recommendation) {
  if (recommendation === 'recommended') return '🟢';
  if (recommendation === 'situational') return '🟡';
  return '🔴';
}

function computeSoftwareScore(cells) {
  const core = parsePartialLevel(cells[2]);
  const releases = extractInteger(cells[3]);
  const rpc = parsePartialLevel(cells[4]);
  const githubPublic = hasMarkdownLink(cells[5]);
  const activity = parseStatusCell(cells[6]);
  const chainBreadth = parseChainBreadth(cells[7]);
  const devices = parseDeviceFlags(cells[8]);
  const testnets = parseBooleanCell(cells[9]);
  const license = parseLicenseLevel(cells[10]);
  const api = parseApiOpenness(cells[11]);
  const audits = parseAuditLevel(cells[12]);
  const funding = parseFundingLevel(cells[13]);
  const txSimulation = parsePartialLevel(cells[14]);
  const scamProtection = parsePartialLevel(cells[15]);
  const accountTypes = parseAccountTypes(cells[16]);
  const ensNaming = parseEnsLevel(cells[17]);
  const hardwareSupport = parsePartialLevel(cells[18]);

  let coreReadiness = 0;
  if (core === 'full' && devices.mobile && devices.browser) coreReadiness = 20;
  else if (core === 'partial') coreReadiness = 10;
  else if (devices.mobile || devices.browser) coreReadiness = 4;

  let releaseDiscipline = 9;
  if (activity === 'inactive') releaseDiscipline = 4;
  else if (releases === null) releaseDiscipline = 9;
  else if (releases <= 2) releaseDiscipline = 15;
  else if (releases <= 4) releaseDiscipline = 13;
  else if (releases <= 6) releaseDiscipline = 11;
  else if (releases <= 8) releaseDiscipline = 8;
  else releaseDiscipline = 5;

  const txScore = txSimulation === 'full' ? 10 : txSimulation === 'partial' ? 5 : 0;
  const rpcScore = rpc === 'full' ? 4 : rpc === 'partial' ? 2 : 0;
  const scamScore = scamProtection === 'full' ? 4 : scamProtection === 'partial' ? 2 : 0;
  const testnetScore = testnets ? 4 : 0;
  const hardwareScore = hardwareSupport === 'full' ? 2 : hardwareSupport === 'partial' ? 1 : 0;
  const developerSafetyControl = txScore + rpcScore + scamScore + testnetScore + hardwareScore;

  let chainScore = 1;
  if (chainBreadth >= 6) chainScore = 5;
  else if (chainBreadth >= 4) chainScore = 4;
  else if (chainBreadth >= 2) chainScore = 3;

  const advancedAccountCount = [accountTypes.safe, accountTypes.eip4337, accountTypes.eip7702].filter(Boolean).length;
  let accountScore = 1;
  if (advancedAccountCount >= 2) accountScore = 5;
  else if (advancedAccountCount === 1) accountScore = 3;

  const namingScore =
    ensNaming === 'full' ? 2 :
    ensNaming === 'basic' || ensNaming === 'import' ? 1 :
    0;

  let deviceExtras = 0;
  if (devices.desktop && devices.web) deviceExtras = 3;
  else if (devices.desktop || devices.web) deviceExtras = 2;
  else if (devices.mobile && devices.browser) deviceExtras = 1;

  const ecosystemAccounts = chainScore + accountScore + namingScore + deviceExtras;

  const githubScore = githubPublic ? 3 : 0;
  const licenseScore = license === 'open' ? 4 : license === 'partial' ? 2 : 0;
  const apiScore =
    api === 'open' ? 4 :
    api === 'public' ? 3 :
    api === 'partial' ? 2 :
    0;
  const fundingScore =
    funding === 'sustainable' ? 3 :
    funding === 'vc' ? 2 :
    0;
  const transparencyAccess = githubScore + licenseScore + apiScore + fundingScore;

  const activityScore =
    activity === 'active' ? 7 :
    activity === 'slow' ? 4 :
    activity === 'private' ? 3 :
    0;
  const auditScore =
    audits === 'recent' ? 5 :
    audits === 'bounty' ? 3 :
    audits === 'old' ? 2 :
    0;
  const maintenanceAssurance = activityScore + auditScore;

  const total =
    coreReadiness +
    releaseDiscipline +
    developerSafetyControl +
    ecosystemAccounts +
    transparencyAccess +
    maintenanceAssurance;

  const entries = [
    {
      key: 'core',
      label: 'Core Readiness',
      score: coreReadiness,
      max: 20,
      note: 'Mobile + extension coverage remains the gating requirement.',
    },
    {
      key: 'releases',
      label: 'Release Discipline',
      score: releaseDiscipline,
      max: 15,
      note: 'Lower release churn is scored as safer for production dApp teams.',
    },
    {
      key: 'dev_control',
      label: 'Developer Safety & Control',
      score: developerSafetyControl,
      max: 24,
      note: 'RPC control, testnets, simulation, scam alerts, and hardware signing.',
    },
    {
      key: 'ecosystem',
      label: 'Ecosystem & Accounts',
      score: ecosystemAccounts,
      max: 15,
      note: 'Chain reach, account flexibility, naming, and device breadth.',
    },
    {
      key: 'transparency',
      label: 'Transparency & Access',
      score: transparencyAccess,
      max: 14,
      note: 'Open code, backend openness, public repos, and funding resilience.',
    },
    {
      key: 'maintenance',
      label: 'Maintenance & Assurance',
      score: maintenanceAssurance,
      max: 12,
      note: 'Recent activity plus verifiable audit coverage.',
    },
  ];

  const score = roundScore(total);
  const recommendation = softwareRecommendation(score, {
    activity,
    core,
    devControl: developerSafetyControl,
  });

  return buildBreakdown(total, SOFTWARE_MAX_SCORE, entries, recommendation);
}

function parseHardwareOpenSource(cell) {
  const text = String(cell || '').toLowerCase();
  if (text.includes('sdk only')) return 'sdk';
  if (text.includes('✅')) return 'full';
  if (text.includes('⚠️')) return 'partial';
  return 'closed';
}

function parseSecureElementScore(cell) {
  const text = String(cell || '').toLowerCase();
  if (text.includes('❌') || text.includes('none')) {
    return { score: 4, note: 'No secure element listed.' };
  }

  let score = 18;
  let note = 'Secure element present.';

  if (includesAny(text, ['tropic01', 'tropic'])) {
    score = 24;
    note = 'Custom silicon / Tropic secure element listed.';
  } else if (includesAny(text, ['3×', '3x', 'triple', 'dual'])) {
    score = 22;
    note = 'Multiple secure elements listed.';
  } else if (includesAny(text, ['optiga', 'atecc', 'eal6', 'eal7'])) {
    score = 20;
    note = 'Named certified secure element listed.';
  } else if (includesAny(text, ['se', 'cc'])) {
    score = 18;
    note = 'Generic secure element listed.';
  }

  return { score, note };
}

function parseHardwareDisplayScore(cell) {
  const text = String(cell || '').toLowerCase();
  if (includesAny(text, ['touch color'])) return { score: 12, note: 'Touch color display.' };
  if (includesAny(text, ['e-ink'])) return { score: 10, note: 'Readable e-ink display.' };
  if (includesAny(text, ['color lcd'])) return { score: 9, note: 'Color LCD display.' };
  if (includesAny(text, ['touch edge'])) return { score: 8, note: 'Touch edge gestures.' };
  if (includesAny(text, ['touch keypad'])) return { score: 8, note: 'Touch keypad / PIN entry.' };
  if (includesAny(text, ['mono oled', 'oled'])) return { score: 7, note: 'Monochrome OLED display.' };
  if (includesAny(text, ['lcd'])) return { score: 6, note: 'Basic LCD display.' };
  return { score: 1, note: 'No display listed.' };
}

function parseHardwarePriceScore(cell) {
  const amounts = extractCurrencyAmounts(cell);
  if (!amounts.length) return { score: 4, note: 'Price not clear from table.' };
  const average = amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
  if (average <= 80) return { score: 10, note: 'Strong value tier.' };
  if (average <= 120) return { score: 8, note: 'Competitive mid-range pricing.' };
  if (average <= 180) return { score: 6, note: 'Reasonable premium pricing.' };
  if (average <= 260) return { score: 4, note: 'Premium-priced device.' };
  if (average <= 350) return { score: 2, note: 'Expensive relative to peers.' };
  return { score: 1, note: 'Very high price.' };
}

function parseHardwareConnectivityScore(cell) {
  const text = String(cell || '');
  const hasQr = text.includes('QR');
  const hasMicroSd = text.includes('MicroSD');
  const hasUsb = text.includes('USB');
  const hasBluetooth = text.includes('BT') || text.includes('Bluetooth');
  const hasNfc = text.includes('NFC');
  const hasWifi = text.includes('WiFi');

  if ((hasQr || hasMicroSd) && !hasUsb && !hasBluetooth && !hasWifi) {
    return { score: 10, note: 'Offline-first connectivity.' };
  }
  if (hasQr || hasMicroSd) {
    return { score: 8, note: 'Includes offline transfer options.' };
  }
  if (hasUsb && !hasBluetooth) {
    return { score: 6, note: 'Simple wired connectivity.' };
  }
  if (hasUsb && hasBluetooth) {
    return { score: 4, note: 'Convenient but broader attack surface.' };
  }
  if (hasNfc) {
    return { score: 3, note: 'Tap-based connectivity.' };
  }
  if (hasWifi) {
    return { score: 2, note: 'Networked device connectivity.' };
  }
  return { score: 3, note: 'Unclear connectivity profile.' };
}

function computeHardwareScore(cells) {
  const githubCell = String(cells[2] || '');
  const airGap = parseBooleanCell(cells[3]);
  const openSource = parseHardwareOpenSource(cells[4]);
  const secureElement = parseSecureElementScore(cells[5]);
  const display = parseHardwareDisplayScore(cells[6]);
  const price = parseHardwarePriceScore(cells[7]);
  const connectivity = parseHardwareConnectivityScore(cells[8]);
  const activity = parseStatusCell(cells[9]);

  const githubScore =
    githubCell.toLowerCase().includes('sdk only') ? 4 :
    hasMarkdownLink(githubCell) ? 8 :
    0;

  const securityArchitecture = secureElement.score + (airGap ? 10 : 0);

  const transparencyMaintenance =
    githubScore +
    (openSource === 'full' ? 12 : openSource === 'partial' ? 7 : openSource === 'sdk' ? 4 : 0) +
    (activity === 'active' ? 8 : activity === 'slow' ? 5 : activity === 'private' ? 3 : 0);

  const usabilityValue = display.score + price.score + connectivity.score;

  const total = securityArchitecture + transparencyMaintenance + usabilityValue;

  const entries = [
    {
      key: 'security',
      label: 'Security Architecture',
      score: securityArchitecture,
      max: 34,
      note: airGap ? `${secureElement.note} Air-gapped signing supported.` : secureElement.note,
    },
    {
      key: 'transparency',
      label: 'Transparency & Maintenance',
      score: transparencyMaintenance,
      max: 28,
      note: 'Public firmware, open-source depth, and current maintenance status.',
    },
    {
      key: 'ux',
      label: 'Usability & Value',
      score: usabilityValue,
      max: 32,
      note: 'Display quality, connectivity ergonomics, and price positioning.',
    },
  ];

  const score = roundScore(total);
  const recommendation = hardwareRecommendation(score, { activity });

  return buildBreakdown(total, HARDWARE_MAX_SCORE, entries, recommendation);
}

function parseCardTypeScore(cell) {
  const lower = String(cell || '').toLowerCase();
  if (lower.includes('credit')) return 6;
  if (lower.includes('debit')) return 5;
  if (lower.includes('business')) return 4;
  return 3;
}

function parseCustodyScore(cell) {
  if (String(cell || '').includes('🔐')) return 14;
  if (String(cell || '').includes('🏦')) return 6;
  return 8;
}

function parseBusinessScore(cell) {
  const text = String(cell || '');
  if (text.includes('✅')) return 4;
  if (text.includes('⚠️')) return 2;
  return 1;
}

function parseRegionScore(cell) {
  const text = String(cell || '');
  const countryCount = extractInteger(text);
  if (text.includes('🌍')) return 11;
  if ((text.includes('🇺🇸') && text.includes('🇪🇺')) || countryCount >= 10) return 10;
  if (text.includes('🇺🇸') || text.includes('🇪🇺') || text.includes('🇬🇧') || text.includes('🇨🇦') || text.includes('🇦🇺')) return 8;
  return 5;
}

function effectiveCashbackRate(cell) {
  const text = String(cell || '').toLowerCase();
  const percentages = extractPercentages(text);
  if (!percentages.length) return 0;
  const max = Math.max(...percentages);
  const min = Math.min(...percentages);

  if (text.includes('up to')) {
    return max * 0.8;
  }
  if (percentages.length >= 2) {
    return (min + max) / 2;
  }

  return max;
}

function parseCashbackScore(cell) {
  const effective = effectiveCashbackRate(cell);
  if (effective >= 8) return 15;
  if (effective >= 5) return 13;
  if (effective >= 3) return 10;
  if (effective >= 1) return 6;
  return 1;
}

function parseAnnualFeeScore(cell) {
  const text = String(cell || '').toLowerCase();
  if (text.includes('tbd')) return 3;
  const amounts = extractCurrencyAmounts(text);
  if (!amounts.length) return 8;
  const max = Math.max(...amounts);
  if (max === 0) return 12;
  if (max <= 20) return 10;
  if (max <= 100) return 7;
  if (max <= 300) return 4;
  return 1;
}

function parseFxFeeScore(cell) {
  const text = String(cell || '').toLowerCase();
  if (text.includes('tbd')) return 2;
  if (text.includes('weekday')) return 4;
  const percentages = extractPercentages(text);
  const max = percentages.length ? Math.max(...percentages) : 0;
  if (max === 0) return 8;
  if (max <= 1) return 6;
  if (max <= 2) return 4;
  if (max <= 3) return 2;
  return 1;
}

function parseRewardsScore(cell) {
  const text = String(cell || '').toLowerCase();
  if (includesAny(text, ['multi', 'stables'])) return 10;
  if (includesAny(text, ['btc, eth', 'eth, btc', 'btc', 'eth', 'usdc', 'usdt', 'crypto'])) return 7;
  if (includesAny(text, ['none'])) return 0;
  return 4;
}

function parseCardStatus(cell) {
  const text = String(cell || '');
  if (text.includes('❌') || text.toLowerCase().includes('inactive') || text.toLowerCase().includes('discontinued')) return 'inactive';
  if (text.includes('✅')) return 'active';
  if (text.includes('🔄')) return 'launching';
  return 'verify';
}

function computeCardScore(cells) {
  const status = parseCardStatus(cells[10]);

  const productModel =
    parseCardTypeScore(cells[2]) +
    parseBusinessScore(cells[4]);

  const custodyCoverage =
    parseCustodyScore(cells[3]) +
    parseRegionScore(cells[5]);

  const rewardsValue =
    parseCashbackScore(cells[6]) +
    parseRewardsScore(cells[9]);

  const feeFriction =
    parseAnnualFeeScore(cells[7]) +
    parseFxFeeScore(cells[8]);

  const deliveryConfidence =
    status === 'active' ? 10 :
    status === 'verify' ? 6 :
    status === 'launching' ? 4 :
    0;

  const rawTotal = productModel + custodyCoverage + rewardsValue + feeFriction + deliveryConfidence - (status === 'inactive' ? 28 : 0);
  const total = (rawTotal / 90) * CARD_MAX_SCORE;

  const entries = [
    {
      key: 'product_model',
      label: 'Product Model',
      score: productModel,
      max: 10,
      note: 'Card type and business support.',
    },
    {
      key: 'custody_coverage',
      label: 'Custody & Coverage',
      score: custodyCoverage,
      max: 25,
      note: 'Custody model plus regional reach.',
    },
    {
      key: 'rewards',
      label: 'Rewards Value',
      score: rewardsValue,
      max: 25,
      note: 'Cashback ceiling and reward asset quality.',
    },
    {
      key: 'fees',
      label: 'Fee Friction',
      score: feeFriction,
      max: 20,
      note: 'Annual fees and foreign exchange costs.',
    },
    {
      key: 'confidence',
      label: 'Delivery Confidence',
      score: deliveryConfidence,
      max: 10,
      note: 'Current product status and verification confidence.',
    },
  ];

  const score = roundScore(total);
  const recommendation = cardRecommendation(score, { status });

  return buildBreakdown(total, CARD_MAX_SCORE, entries, recommendation);
}

function parseRampCoverageScore(cell) {
  const text = String(cell || '').toLowerCase();
  const countries = extractInteger(text);
  if (text.includes('global')) return 25;
  if ((countries || 0) >= 150) return 23;
  if ((countries || 0) >= 100) return 20;
  if ((countries || 0) >= 50) return 16;
  if ((countries || 0) >= 20) return 12;
  if (includesAny(text, ['us + select', 'select global'])) return 12;
  return 8;
}

function parseRampTypeScore(typeCell, onRampCell, offRampCell) {
  const lower = String(typeCell || '').toLowerCase();
  const onRamp = parseBooleanCell(onRampCell);
  const offRamp = parseBooleanCell(offRampCell);
  if (lower.includes('both') && onRamp && offRamp) return 15;
  if (onRamp && offRamp) return 13;
  if (onRamp || offRamp) return 8;
  return 4;
}

function parseFeeModelScore(cell) {
  const lower = String(cell || '').toLowerCase();
  if (includesAny(lower, ['low', 'low/medium'])) return 15;
  if (includesAny(lower, ['medium'])) return 11;
  if (includesAny(lower, ['usage based', 'custom', 'variable'])) return 8;
  if (includesAny(lower, ['high'])) return 5;
  return 8;
}

function parseMinimumFeeScore(cell) {
  const lower = String(cell || '').toLowerCase();
  if (lower.includes('custom')) return 5;
  const amounts = extractCurrencyAmounts(lower);
  if (!amounts.length) return 7;
  const min = Math.min(...amounts);
  if (min <= 1) return 10;
  if (min <= 3) return 8;
  if (min <= 5) return 6;
  if (min <= 10) return 4;
  return 2;
}

function parseDevUxScore(cell) {
  const lower = String(cell || '').toLowerCase();
  if (includesAny(lower, ['excellent'])) return 18;
  if (includesAny(lower, ['advanced'])) return 16;
  if (includesAny(lower, ['great'])) return 15;
  if (includesAny(lower, ['good'])) return 11;
  if (includesAny(lower, ['basic'])) return 7;
  return 10;
}

function computeRampScore(cells) {
  const status = parseCardStatus(cells[9]);

  const coverage = parseRampCoverageScore(cells[5]);
  const typeBreadth = parseRampTypeScore(cells[2], cells[3], cells[4]);
  const devUx = parseDevUxScore(cells[8]);
  const price = parseFeeModelScore(cells[6]) + parseMinimumFeeScore(cells[7]);
  const confidence =
    status === 'active' ? 15 :
    status === 'verify' ? 9 :
    status === 'launching' ? 5 :
    0;

  const total = coverage + typeBreadth + devUx + price + confidence;

  const entries = [
    {
      key: 'coverage',
      label: 'Coverage',
      score: coverage,
      max: 25,
      note: 'Country and regional support breadth.',
    },
    {
      key: 'type',
      label: 'Product Breadth',
      score: typeBreadth,
      max: 15,
      note: 'Whether the provider supports both on-ramp and off-ramp flows.',
    },
    {
      key: 'integration',
      label: 'Developer UX',
      score: devUx,
      max: 18,
      note: 'SDK, widget, and integration quality.',
    },
    {
      key: 'pricing',
      label: 'Pricing Shape',
      score: price,
      max: 25,
      note: 'Fee model competitiveness and minimum fee friction.',
    },
    {
      key: 'confidence',
      label: 'Operational Confidence',
      score: confidence,
      max: 15,
      note: 'Current verification and product status.',
    },
  ];

  const score = roundScore(total);
  const recommendation = rampRecommendation(score, { status });

  return buildBreakdown(total, RAMP_MAX_SCORE, entries, recommendation);
}

function formatScoreBreakdownTooltip(scoreInfo) {
  const lines = [`Score ${scoreInfo.score}/${scoreInfo.maxScore}`];
  for (const entry of scoreInfo.breakdown) {
    lines.push(`${entry.label}: ${entry.score}/${entry.max}`);
  }
  return lines.join('\n');
}

module.exports = {
  SCORING_METHODOLOGY_VERSION,
  computeSoftwareScore,
  computeHardwareScore,
  computeCardScore,
  computeRampScore,
  recommendationEmoji,
  formatScoreBreakdownTooltip,
};
