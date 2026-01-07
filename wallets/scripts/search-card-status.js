#!/usr/bin/env node
/**
 * Search for card status information
 */

const { chromium } = require('playwright');

async function searchGoogle(browser, query) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  try {
    // Use DuckDuckGo instead of Google (less blocking)
    await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await page.waitForTimeout(2000);
    
    // Get search results
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.result__body');
      return Array.from(items).slice(0, 5).map(item => {
        const titleEl = item.querySelector('.result__title');
        const snippetEl = item.querySelector('.result__snippet');
        return {
          title: titleEl?.innerText || '',
          snippet: snippetEl?.innerText || ''
        };
      });
    });
    
    await page.close();
    await context.close();
    return results;
  } catch (error) {
    console.log(`  Search error: ${error.message.substring(0, 50)}`);
    await page.close();
    await context.close();
    return [];
  }
}

async function main() {
  console.log('🔍 Searching for Card Status Information\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const searches = [
    { name: 'Bybit Card', query: 'bybit crypto card 2025 status europe' },
    { name: 'Mode Bitcoin Card', query: 'mode bitcoin card UK 2025' },
    { name: 'Swissborg Card', query: 'swissborg card discontinued 2025' },
    { name: 'Hi Card', query: 'hi.com crypto card 2025 cashback' },
    { name: 'Uphold Debit Card', query: 'uphold debit card 2025 status' }
  ];

  for (const search of searches) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Searching: ${search.name}`);
    console.log(`Query: "${search.query}"`);
    console.log(`${'='.repeat(50)}`);
    
    const results = await searchGoogle(browser, search.query);
    
    if (results.length > 0) {
      for (const result of results) {
        console.log(`\n📌 ${result.title}`);
        console.log(`   ${result.snippet}`);
      }
    } else {
      console.log('No results found');
    }
  }

  await browser.close();
}

main().catch(console.error);
