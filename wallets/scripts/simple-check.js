const { chromium } = require('playwright');
const fs = require('fs');

const companies = [
  { name: 'Trezor', url: 'https://trezor.io/', current: ['Trezor Safe 5', 'Trezor Safe 3'] },
  { name: 'Ledger', url: 'https://www.ledger.com/', current: ['Ledger Stax', 'Ledger Nano X', 'Ledger Nano S+'] },
  { name: 'OneKey', url: 'https://onekey.so/', current: ['OneKey Pro'] },
  { name: 'BitBox', url: 'https://bitbox.swiss/', current: ['BitBox02'] },
];

async function checkCompany(company) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log(`Checking ${company.name}...`);
    await page.goto(company.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(15000); // Wait for Cloudflare/JS
    
    const text = await page.textContent('body') || '';
    const title = await page.title();
    
    // Look for product names
    const productMatches = [];
    const productPatterns = [
      /(trezor|safe|model|one|two|three|3|5)/gi,
      /(ledger|nano|stax|blue|s|s\+|x)/gi,
      /(onekey|pro|mini|touch|classic)/gi,
      /(bitbox|02|01)/gi,
    ];
    
    // Save full text for review
    const outputDir = '/tmp/wallet-checks';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    fs.writeFileSync(`${outputDir}/${company.name.toLowerCase()}.txt`, text);
    
    console.log(`  Title: ${title}`);
    console.log(`  Text length: ${text.length} chars`);
    console.log(`  Saved to ${outputDir}/${company.name.toLowerCase()}.txt`);
    
    return { company: company.name, title, textLength: text.length };
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return { company: company.name, error: error.message };
  } finally {
    await browser.close();
  }
}

async function main() {
  for (const company of companies) {
    await checkCompany(company);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

main().catch(console.error);
