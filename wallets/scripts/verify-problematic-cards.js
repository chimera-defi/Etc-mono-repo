#!/usr/bin/env node
/**
 * Verify problematic crypto cards using Playwright
 */

const { chromium } = require('playwright');

const CARDS_TO_CHECK = [
  {
    name: 'Binance Card',
    urls: [
      'https://www.binance.com/en/cards',
      'https://www.binance.com/en-GB/cards',
      'https://www.binance.com/en/support/faq/introduction-to-binance-card-e0dce01982d745b0bd7fc4f243865dcc'
    ]
  },
  {
    name: 'Hi Card',
    urls: [
      'https://hi.com',
      'https://hi.com/card',
      'https://hi.com/products'
    ]
  },
  {
    name: 'Uphold Card',
    urls: [
      'https://uphold.com',
      'https://uphold.com/debit-card',
      'https://uphold.com/en/debit-card'
    ]
  },
  {
    name: 'Gemini Card',
    urls: [
      'https://www.gemini.com/credit-card',
      'https://www.gemini.com/card',
      'https://www.gemini.com/products/credit-card'
    ]
  },
  {
    name: 'Bybit Card',
    urls: [
      'https://www.bybit.com/en/card',
      'https://www.bybit.com/card',
      'https://www.bybit.com/en-US/card'
    ]
  },
  {
    name: 'Mode Card',
    urls: [
      'https://modeapp.com',
      'https://mode.com',
      'https://www.modeapp.com/card'
    ]
  },
  {
    name: 'Swissborg Card',
    urls: [
      'https://swissborg.com',
      'https://swissborg.com/card',
      'https://swissborg.com/products'
    ]
  }
];

async function checkCard(browser, card) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Checking: ${card.name}`);
  console.log(`${'='.repeat(60)}`);

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  let accessible = false;
  let content = '';
  let status = 'unknown';

  for (const url of card.urls) {
    const page = await context.newPage();
    console.log(`\n→ Trying: ${url}`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait a bit for JS to load
      await page.waitForTimeout(3000);
      
      const textContent = await page.evaluate(() => document.body?.innerText || '');
      const title = await page.title();
      
      if (textContent.length > 100 && !textContent.includes('404') && !textContent.includes('not found')) {
        accessible = true;
        content = textContent.substring(0, 5000);
        status = 'active';
        console.log(`  ✅ Accessible (${textContent.length} chars)`);
        console.log(`  Title: ${title}`);
        
        // Look for key info
        const lowerContent = textContent.toLowerCase();
        if (lowerContent.includes('card')) {
          console.log(`  📌 Contains "card" reference`);
        }
        if (lowerContent.includes('cashback') || lowerContent.includes('cash back')) {
          console.log(`  📌 Contains cashback info`);
        }
        if (lowerContent.includes('brazil') || lowerContent.includes('brasil')) {
          console.log(`  📌 Mentions Brazil`);
        }
        if (lowerContent.includes('europe') || lowerContent.includes('eu ') || lowerContent.includes('eea')) {
          console.log(`  📌 Mentions Europe/EU/EEA`);
        }
        if (lowerContent.includes('discontinued') || lowerContent.includes('no longer')) {
          console.log(`  ⚠️ May be discontinued`);
          status = 'possibly_discontinued';
        }
        
        await page.close();
        break;
      } else {
        console.log(`  ❌ Page empty, 404, or not found`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message.substring(0, 80)}`);
    }
    
    await page.close();
  }

  await context.close();

  return {
    name: card.name,
    accessible,
    status,
    contentPreview: content.substring(0, 1500)
  };
}

async function main() {
  console.log('🔍 Verifying Problematic Crypto Cards\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (const card of CARDS_TO_CHECK) {
    const result = await checkCard(browser, card);
    results.push(result);
  }

  await browser.close();

  // Summary
  console.log('\n\n📊 VERIFICATION SUMMARY');
  console.log('========================\n');
  
  for (const result of results) {
    const icon = result.accessible ? '✅' : '❌';
    const statusText = result.status === 'possibly_discontinued' ? '⚠️ May be discontinued' : result.status;
    console.log(`${icon} ${result.name}: ${statusText}`);
    
    if (result.contentPreview && result.contentPreview.length > 0) {
      console.log(`\n--- Content Preview ---`);
      console.log(result.contentPreview);
      console.log(`--- End Preview ---\n`);
    }
  }
}

main().catch(console.error);
