#!/usr/bin/env node
/**
 * Crypto Card Website Verification Script
 * Uses Playwright to verify card information from official websites
 * 
 * Usage: node verify-crypto-cards.js [card-name]
 * Examples:
 *   node verify-crypto-cards.js gnosis-pay
 *   node verify-crypto-cards.js all
 */

const { chromium } = require('playwright');

// Card configurations with URLs to check
const CARDS = {
  'gnosis-pay': {
    name: 'Gnosis Pay',
    urls: [
      'https://gnosispay.com',
      'https://gnosispay.com/faq',
      'https://gnosispay.com/pricing'
    ],
    searchTerms: ['region', 'country', 'countries', 'europe', 'eu', 'uk', 'available', 'launch', 'expand', 'eea', 'eur'],
    description: 'DeFi-native self-custodial debit card'
  },
  'etherfi-cash': {
    name: 'EtherFi Cash',
    urls: [
      'https://ether.fi/cash',
      'https://ether.fi/the-club'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'annual', 'region', 'available'],
    description: 'Non-custodial DeFi credit card'
  },
  'ready-card': {
    name: 'Ready Card',
    urls: [
      'https://www.ready.co/card',
      'https://www.ready.co'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'region', 'country', 'self-custody'],
    description: 'Self-custody debit card'
  },
  'hi-card': {
    name: 'Hi Card',
    urls: [
      'https://hi.com',
      'https://hi.com/card'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'region'],
    description: 'High cashback debit card'
  },
  'wirex-card': {
    name: 'Wirex Card',
    urls: [
      'https://wirexapp.com/card',
      'https://wirexapp.com'
    ],
    searchTerms: ['cashback', 'cryptoback', 'reward', 'fee', 'region'],
    description: 'Multi-crypto debit card'
  },
  'fold-card': {
    name: 'Fold Card',
    urls: [
      'https://foldapp.com',
      'https://foldapp.com/card'
    ],
    searchTerms: ['bitcoin', 'btc', 'reward', 'cashback', 'fee'],
    description: 'Bitcoin rewards debit card'
  },
  'gemini-card': {
    name: 'Gemini Card',
    urls: [
      'https://www.gemini.com/credit-card',
      'https://www.gemini.com/card'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'bitcoin', 'eth'],
    description: 'Crypto rewards credit card'
  },
  'coinbase-card': {
    name: 'Coinbase Card',
    urls: [
      'https://www.coinbase.com/card',
      'https://www.coinbase.com/en/card'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'crypto'],
    description: 'Crypto debit card'
  },
  'bybit-card': {
    name: 'Bybit Card',
    urls: [
      'https://www.bybit.com/en/cards/',
      'https://www.bybit.com/en-US/cards/'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'region', 'eea'],
    description: 'Exchange debit card'
  },
  'plutus-card': {
    name: 'Plutus Card',
    urls: [
      'https://plutus.it',
      'https://plutus.it/card'
    ],
    searchTerms: ['cashback', 'plu', 'reward', 'fee', 'region'],
    description: 'PLU rewards debit card'
  },
  'binance-card': {
    name: 'Binance Card',
    urls: [
      'https://www.binance.com/en/cards',
      'https://www.binance.com/cards'
    ],
    searchTerms: ['cashback', 'bnb', 'reward', 'fee', 'region'],
    description: 'BNB rewards debit card'
  },
  'revolut-crypto': {
    name: 'Revolut Crypto',
    urls: [
      'https://www.revolut.com/crypto/crypto-card/',
      'https://www.revolut.com/crypto/'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'crypto'],
    description: 'Fiat+Crypto card'
  },
  'nexo-card': {
    name: 'Nexo Card',
    urls: [
      'https://nexo.com/card',
      'https://nexo.com/nexo-card'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'credit'],
    description: 'Crypto-backed credit card'
  },
  '1inch-card': {
    name: '1inch Card',
    urls: [
      'https://1inch.com/card',
      'https://1inch.io/card'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'region'],
    description: 'DeFi debit card'
  },
  'kucard': {
    name: 'KuCard',
    urls: [
      'https://www.kucoin.com/kucard',
      'https://www.kucoin.com/card'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'region'],
    description: 'KuCoin debit card'
  },
  'crypto-com': {
    name: 'Crypto.com Visa',
    urls: [
      'https://crypto.com/cards',
      'https://crypto.com/us/cards'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'cro', 'stake'],
    description: 'CRO staking rewards card'
  },
  'redotpay': {
    name: 'Redotpay',
    urls: [
      'https://redotpay.com',
      'https://www.redotpay.com'
    ],
    searchTerms: ['cashback', 'cash back', 'reward', 'fee', 'region'],
    description: 'Multi-region debit card'
  },
  'shakepay-card': {
    name: 'Shakepay Card',
    urls: [
      'https://shakepay.com/card',
      'https://shakepay.com'
    ],
    searchTerms: ['cashback', 'bitcoin', 'btc', 'reward', 'fee'],
    description: 'Canada Bitcoin card'
  },
  'bitpay-card': {
    name: 'BitPay Card',
    urls: [
      'https://bitpay.com/card',
      'https://bitpay.com'
    ],
    searchTerms: ['cashback', 'bitcoin', 'reward', 'fee'],
    description: 'Bitcoin spending card'
  },
  'mode-card': {
    name: 'Mode Card',
    urls: [
      'https://modeapp.com',
      'https://www.modeapp.com'
    ],
    searchTerms: ['cashback', 'bitcoin', 'btc', 'reward', 'fee', 'region'],
    description: 'Bitcoin rewards card'
  },
  'swissborg-card': {
    name: 'Swissborg Card',
    urls: [
      'https://swissborg.com/card',
      'https://swissborg.com/products/card',
      'https://swissborg.com'
    ],
    searchTerms: ['card', 'cashback', 'chsb', 'reward', 'fee'],
    description: 'CHSB rewards card'
  },
  'uphold-card': {
    name: 'Uphold Card',
    urls: [
      'https://uphold.com/card',
      'https://uphold.com/debit-card',
      'https://uphold.com'
    ],
    searchTerms: ['card', 'debit', 'cashback', 'reward', 'fee'],
    description: 'Multi-crypto debit card'
  },
  'coinjar-card': {
    name: 'CoinJar Card',
    urls: [
      'https://www.coinjar.com/card',
      'https://www.coinjar.com/au/features/coinjar-card',
      'https://www.coinjar.com'
    ],
    searchTerms: ['card', 'cashback', 'bitcoin', 'reward', 'fee'],
    description: 'Australia Bitcoin card'
  },
  'cryptospend': {
    name: 'CryptoSpend',
    urls: [
      'https://cryptospend.com.au',
      'https://www.cryptospend.com.au'
    ],
    searchTerms: ['cashback', 'reward', 'fee', 'self-custody'],
    description: 'Australia multi-crypto card'
  },
  'okx-card': {
    name: 'OKX Card',
    urls: [
      'https://www.okx.com/card',
      'https://www.okx.com/web3/defi/card'
    ],
    searchTerms: ['card', 'cashback', 'reward', 'fee', 'region'],
    description: 'OKX debit card'
  },
  'kraken-card': {
    name: 'Kraken Card',
    urls: [
      'https://www.kraken.com/features/card',
      'https://www.kraken.com'
    ],
    searchTerms: ['card', 'debit', 'cashback', 'reward', 'fee'],
    description: 'Kraken debit card'
  },
  'reap': {
    name: 'Reap',
    urls: [
      'https://reap.global',
      'https://reap.global/resources/info/pricing'
    ],
    searchTerms: ['card', 'corporate', 'business', 'fee', 'stablecoin'],
    description: 'Business crypto card'
  }
};

async function verifyCard(browser, cardKey) {
  const card = CARDS[cardKey];
  if (!card) {
    console.log(`Unknown card: ${cardKey}`);
    return null;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Verifying: ${card.name}`);
  console.log(`Description: ${card.description}`);
  console.log(`${'='.repeat(60)}`);

  const results = {
    name: card.name,
    timestamp: new Date().toISOString(),
    urls: [],
    foundTerms: [],
    pageContent: [],
    errors: []
  };

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  for (const url of card.urls) {
    console.log(`\n→ Checking: ${url}`);
    const page = await context.newPage();
    
    try {
      // Navigate with extended timeout for Cloudflare
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 45000 
      });

      // Wait for potential Cloudflare challenge
      await page.waitForTimeout(5000);

      // Get page content
      const content = await page.content();
      const textContent = await page.evaluate(() => document.body?.innerText || '');
      
      // Check for Cloudflare challenge
      if (content.includes('Just a moment') || content.includes('cf-browser-verification')) {
        console.log('  ⏳ Cloudflare detected, waiting...');
        await page.waitForTimeout(30000);
        const newContent = await page.evaluate(() => document.body?.innerText || '');
        if (newContent.length > textContent.length) {
          results.pageContent.push({
            url,
            status: 'cloudflare-passed',
            content: newContent.substring(0, 10000)
          });
        } else {
          results.pageContent.push({
            url,
            status: 'cloudflare-blocked',
            content: 'Cloudflare protection active'
          });
        }
      } else {
        results.pageContent.push({
          url,
          status: 'success',
          content: textContent.substring(0, 10000)
        });
      }

      // Search for relevant terms
      const lowerContent = textContent.toLowerCase();
      for (const term of card.searchTerms) {
        if (lowerContent.includes(term.toLowerCase())) {
          // Find context around the term
          const index = lowerContent.indexOf(term.toLowerCase());
          const start = Math.max(0, index - 100);
          const end = Math.min(textContent.length, index + term.length + 200);
          const context = textContent.substring(start, end).trim();
          
          if (!results.foundTerms.some(t => t.term === term && t.context === context)) {
            results.foundTerms.push({ term, context, url });
          }
        }
      }

      results.urls.push({ url, status: 'accessible' });
      console.log(`  ✅ Accessible - ${textContent.length} chars`);

    } catch (error) {
      results.urls.push({ url, status: 'error', error: error.message });
      results.errors.push({ url, error: error.message });
      console.log(`  ❌ Error: ${error.message.substring(0, 100)}`);
    } finally {
      await page.close();
    }
  }

  await context.close();
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const cardFilter = args[0] || 'gnosis-pay';
  
  console.log('🔍 Crypto Card Verification Script');
  console.log('===================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    let cardsToVerify = [];
    
    if (cardFilter === 'all') {
      cardsToVerify = Object.keys(CARDS);
    } else {
      cardsToVerify = cardFilter.split(',').map(c => c.trim());
    }

    const results = {};
    
    for (const cardKey of cardsToVerify) {
      if (CARDS[cardKey]) {
        results[cardKey] = await verifyCard(browser, cardKey);
      } else {
        console.log(`⚠️ Unknown card: ${cardKey}`);
      }
    }

    // Output summary
    console.log('\n\n📊 VERIFICATION SUMMARY');
    console.log('========================\n');
    
    for (const [key, result] of Object.entries(results)) {
      if (!result) continue;
      
      console.log(`\n## ${result.name}`);
      console.log(`- Timestamp: ${result.timestamp}`);
      console.log(`- URLs checked: ${result.urls.length}`);
      console.log(`- Accessible: ${result.urls.filter(u => u.status === 'accessible').length}`);
      console.log(`- Terms found: ${result.foundTerms.length}`);
      
      if (result.foundTerms.length > 0) {
        console.log('\n### Key Information Found:');
        for (const term of result.foundTerms.slice(0, 10)) {
          console.log(`\n**${term.term}** (from ${term.url}):`);
          console.log(`"...${term.context}..."`);
        }
      }

      if (result.pageContent.length > 0) {
        console.log('\n### Page Content Preview:');
        for (const page of result.pageContent) {
          console.log(`\n**${page.url}** (${page.status}):`);
          // Print first 2000 chars
          console.log(page.content.substring(0, 2000));
        }
      }

      if (result.errors.length > 0) {
        console.log('\n### Errors:');
        for (const err of result.errors) {
          console.log(`- ${err.url}: ${err.error}`);
        }
      }
    }

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
