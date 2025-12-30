const { chromium } = require('playwright');

const companies = [
  { name: 'Trezor', url: 'https://trezor.io/', current: ['Trezor Safe 5', 'Trezor Safe 3'] },
  { name: 'Keystone', url: 'https://keyst.one/', current: ['Keystone 3 Pro'] },
  { name: 'Ledger', url: 'https://www.ledger.com/', current: ['Ledger Stax', 'Ledger Nano X', 'Ledger Nano S+'] },
  { name: 'OneKey', url: 'https://onekey.so/', current: ['OneKey Pro'] },
  { name: 'BitBox', url: 'https://bitbox.swiss/', current: ['BitBox02'] },
  { name: 'Coldcard', url: 'https://coldcard.com/', current: ['ColdCard Mk4'] },
  { name: 'Blockstream', url: 'https://blockstream.com/jade/', current: ['Blockstream Jade'] },
  { name: 'Foundation', url: 'https://foundationdevices.com/', current: ['Foundation Passport'] },
  { name: 'Keycard', url: 'https://keycard.tech/', current: ['Keycard Shell', 'Keycard'] },
  { name: 'NGRAVE', url: 'https://www.ngrave.io/', current: ['NGRAVE ZERO'] },
  { name: 'SafePal', url: 'https://www.safepal.com/', current: ['SafePal S1'] },
  { name: 'Tangem', url: 'https://tangem.com/', current: ['Tangem Wallet'] },
  { name: 'Ellipal', url: 'https://www.ellipal.com/', current: ['Ellipal Titan 2.0'] },
  { name: 'SecuX', url: 'https://secuxtech.com/', current: ['SecuX V20'] },
  { name: 'Arculus', url: 'https://www.getarculus.com/', current: ['Arculus'] },
  { name: 'BC Vault', url: 'https://bc-vault.com/', current: ['BC Vault'] },
  { name: 'GridPlus', url: 'https://gridplus.io/', current: ['GridPlus Lattice1'] },
];

async function checkCompany(company) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log(`\n🔍 Checking ${company.name}...`);
    await page.goto(company.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    
    // Wait a bit for any dynamic content and Cloudflare
    await page.waitForTimeout(10000);
    
    // Get page content
    const content = await page.content();
    const text = await page.textContent('body');
    
    // Look for product names, model numbers, hardware wallet mentions
    const productKeywords = [
      'wallet', 'hardware', 'device', 'model', 'pro', 'plus', 'mini', 'nano',
      'safe', 'key', 'card', 'vault', 'titan', 'zero', 'jade', 'passport',
      'lattice', 'stax', 'bitbox', 'coldcard', 'keystone', 'onekey'
    ];
    
    // Extract potential product names
    const potentialProducts = [];
    const headings = await page.$$eval('h1, h2, h3, h4', els => 
      els.map(el => el.textContent.trim()).filter(t => t.length > 0)
    );
    
    const companyUrl = company.url;
    const links = await page.$$eval('a', els => 
      els.map(el => ({
        text: el.textContent.trim(),
        href: el.href
      })).filter(l => l.text.length > 0 && l.href.includes(companyUrl))
    );
    
    console.log(`   Found ${headings.length} headings, ${links.length} links`);
    
    // Look for product pages - filter in Node context, not browser
    const productLinks = links.filter(l => {
      const textLower = l.text.toLowerCase();
      const hrefLower = l.href.toLowerCase();
      return textLower.includes('product') ||
        textLower.includes('hardware') ||
        textLower.includes('wallet') ||
        textLower.includes('device') ||
        hrefLower.includes('product') ||
        hrefLower.includes('hardware') ||
        hrefLower.includes('wallet');
    });
    
    if (productLinks.length > 0) {
      console.log(`   Product-related links found: ${productLinks.slice(0, 5).map(l => l.text).join(', ')}`);
    }
    
    // Save page content for manual review
    const filename = `/tmp/${company.name.toLowerCase().replace(/\s+/g, '-')}-page.html`;
    require('fs').writeFileSync(filename, content);
    console.log(`   Saved page content to ${filename}`);
    
    return {
      company: company.name,
      url: company.url,
      headings: headings.slice(0, 20),
      productLinks: productLinks.slice(0, 10),
      textPreview: text.substring(0, 500)
    };
    
  } catch (error) {
    console.error(`   ❌ Error checking ${company.name}:`, error.message);
    return { company: company.name, error: error.message };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('Starting hardware wallet verification...\n');
  
  const results = [];
  for (const company of companies) {
    const result = await checkCompany(company);
    results.push(result);
    // Be polite - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n=== SUMMARY ===\n');
  results.forEach(r => {
    if (r.error) {
      console.log(`❌ ${r.company}: ${r.error}`);
    } else {
      console.log(`✅ ${r.company}: Checked`);
      if (r.headings && r.headings.length > 0) {
        console.log(`   Sample headings: ${r.headings.slice(0, 3).join(', ')}`);
      }
    }
  });
}

main().catch(console.error);
