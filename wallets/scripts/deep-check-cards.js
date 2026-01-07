#!/usr/bin/env node
/**
 * Deep check for problematic crypto cards
 */

const { chromium } = require('playwright');

async function checkUrl(page, url, name) {
  console.log(`\n→ ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body?.innerText || '');
    const title = await page.title();
    
    if (text.length > 50) {
      console.log(`  ✅ ${title} (${text.length} chars)`);
      return { accessible: true, title, content: text.substring(0, 3000) };
    } else {
      console.log(`  ❌ Empty or minimal content`);
      return { accessible: false };
    }
  } catch (e) {
    console.log(`  ❌ ${e.message.substring(0, 60)}`);
    return { accessible: false, error: e.message };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  console.log('🔍 Deep Check: Problematic Crypto Cards\n');

  // 1. BYBIT - Try different regional URLs
  console.log('\n' + '='.repeat(60));
  console.log('BYBIT CARD');
  console.log('='.repeat(60));
  const bybitUrls = [
    'https://www.bybit.com/en-GB/card/',
    'https://www.bybit.com/cards',
    'https://www.bybit.nl/en/cards/',
    'https://bybit.com/card',
    'https://learn.bybit.com/card/',
    'https://www.bybit.com/en/promo/card'
  ];
  let bybitFound = false;
  for (const url of bybitUrls) {
    const result = await checkUrl(page, url, 'Bybit');
    if (result.accessible) {
      bybitFound = true;
      console.log('\n--- BYBIT CONTENT ---');
      console.log(result.content);
      console.log('--- END ---\n');
      break;
    }
  }
  if (!bybitFound) console.log('\n⚠️ BYBIT CARD: All URLs failed - may be geo-restricted or discontinued');

  // 2. MODE - Check correct URL
  console.log('\n' + '='.repeat(60));
  console.log('MODE BITCOIN CARD');
  console.log('='.repeat(60));
  const modeUrls = [
    'https://www.modeapp.com',
    'https://modebanking.com',
    'https://mode.co.uk',
    'https://modecard.com'
  ];
  let modeFound = false;
  for (const url of modeUrls) {
    const result = await checkUrl(page, url, 'Mode');
    if (result.accessible && result.content.toLowerCase().includes('bitcoin')) {
      modeFound = true;
      console.log('\n--- MODE CONTENT ---');
      console.log(result.content);
      console.log('--- END ---\n');
      break;
    }
  }
  if (!modeFound) console.log('\n⚠️ MODE CARD: modeapp.com unreachable - company may be inactive');

  // 3. SWISSBORG
  console.log('\n' + '='.repeat(60));
  console.log('SWISSBORG');
  console.log('='.repeat(60));
  const swissborgUrls = [
    'https://swissborg.com/en',
    'https://swissborg.com/earn',
    'https://app.swissborg.com',
    'https://swissborg.app'
  ];
  for (const url of swissborgUrls) {
    const result = await checkUrl(page, url, 'Swissborg');
    if (result.accessible) {
      console.log('\n--- SWISSBORG CONTENT ---');
      console.log(result.content);
      console.log('--- END ---\n');
      break;
    }
  }

  // 4. HI CARD - Check for card specific page
  console.log('\n' + '='.repeat(60));
  console.log('HI CARD');
  console.log('='.repeat(60));
  const hiUrls = [
    'https://hi.com/benefits',
    'https://hi.com/membership',
    'https://hi.com/spend'
  ];
  for (const url of hiUrls) {
    const result = await checkUrl(page, url, 'Hi');
    if (result.accessible) {
      console.log('\n--- HI CONTENT ---');
      console.log(result.content);
      console.log('--- END ---\n');
      break;
    }
  }

  // 5. UPHOLD
  console.log('\n' + '='.repeat(60));
  console.log('UPHOLD CARD');
  console.log('='.repeat(60));
  const upholdUrls = [
    'https://uphold.com/en-us',
    'https://uphold.com/en-gb',
    'https://uphold.com/products'
  ];
  for (const url of upholdUrls) {
    const result = await checkUrl(page, url, 'Uphold');
    if (result.accessible) {
      console.log('\n--- UPHOLD CONTENT ---');
      console.log(result.content);
      console.log('--- END ---\n');
      break;
    }
  }

  await browser.close();

  console.log('\n\n📊 FINAL ASSESSMENT');
  console.log('='.repeat(60));
  console.log(`
Based on verification attempts:

1. BYBIT CARD: ❓ HTTP2 errors on all URLs - likely geo-restricted or service changes
2. MODE CARD: ❌ modeapp.com unreachable, mode.com is different company (BI tool)
3. SWISSBORG: ❓ Main site may be geo-restricted, no card-specific page found
4. HI CARD: ⚠️ Site active but card product unclear, old copyright (2021-2022)
5. UPHOLD: ⚠️ Site shows error, card status uncertain
  `);
}

main().catch(console.error);
