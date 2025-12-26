const { chromium } = require('playwright');

async function fetchDunePage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Fetching Dune Analytics page...');
    await page.goto('https://dune.com/obchakevich/crypto-cards-all-chains', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    
    // Wait for Cloudflare challenge if present (can take 30+ seconds)
    console.log('Waiting for page to fully load...');
    await page.waitForTimeout(35000);
    
    // Wait for content to load
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Extract page content
    const title = await page.title();
    const url = page.url();
    
    // Look for data tables, charts, or embedded content
    const pageContent = await page.content();
    const textContent = await page.textContent('body');
    
    // Look for links to other dashboards/queries
    const links = await page.$$eval('a[href*="dune.com"]', links => 
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      }))
    );
    
    // Look for iframes (embedded queries)
    const iframes = await page.$$eval('iframe', iframes =>
      iframes.map(iframe => ({
        src: iframe.src,
        title: iframe.title || ''
      }))
    );
    
    // Look for data visualization containers
    const charts = await page.$$eval('[class*="chart"], [class*="visualization"], [class*="query"]', elements =>
      elements.map(el => ({
        tag: el.tagName,
        className: el.className,
        text: el.textContent?.substring(0, 200) || ''
      }))
    );
    
    console.log('\n=== PAGE METADATA ===');
    console.log('Title:', title);
    console.log('URL:', url);
    
    console.log('\n=== LINKS FOUND ===');
    const uniqueLinks = [...new Map(links.map(link => [link.href, link])).values()];
    uniqueLinks.slice(0, 20).forEach(link => {
      console.log(`- ${link.text}: ${link.href}`);
    });
    
    console.log('\n=== IFRAMES (Embedded Queries) ===');
    iframes.forEach(iframe => {
      console.log(`- ${iframe.title || 'Untitled'}: ${iframe.src}`);
    });
    
    console.log('\n=== PAGE TEXT PREVIEW (first 2000 chars) ===');
    console.log(textContent?.substring(0, 2000) || 'No text content found');
    
    // Save full HTML for inspection
    const fs = require('fs');
    fs.writeFileSync('/workspace/wallets/.cursor/artifacts/dune-page.html', pageContent);
    console.log('\n=== Full HTML saved to .cursor/artifacts/dune-page.html ===');
    
    await browser.close();
    
    return {
      title,
      url,
      links: uniqueLinks,
      iframes,
      textPreview: textContent?.substring(0, 2000)
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    await browser.close();
    throw error;
  }
}

fetchDunePage()
  .then(data => {
    console.log('\n=== FETCH COMPLETE ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
