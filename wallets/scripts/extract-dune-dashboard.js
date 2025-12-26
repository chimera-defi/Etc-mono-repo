const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractDuneDashboard() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Dune Analytics dashboard...');
    await page.goto('https://dune.com/obchakevich/crypto-cards-all-chains', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    
    // Wait for Cloudflare challenge to complete (can take 30-60 seconds)
    console.log('Waiting for Cloudflare challenge...');
    await page.waitForTimeout(45000);
    
    // Wait for page to fully load
    console.log('Waiting for dashboard content to load...');
    try {
      await page.waitForSelector('body', { timeout: 30000 });
      await page.waitForTimeout(10000); // Additional wait for dynamic content
    } catch (e) {
      console.log('Timeout waiting for content, proceeding anyway...');
    }
    
    // Extract page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if we're still on Cloudflare challenge page
    const bodyText = await page.textContent('body');
    if (bodyText && bodyText.includes('Just a moment')) {
      console.log('⚠️ Still on Cloudflare challenge page');
      console.log('Attempting to wait longer...');
      await page.waitForTimeout(30000);
    }
    
    // Extract all links from the page
    const links = await page.$$eval('a[href]', links => 
      links.map(link => ({
        text: link.textContent?.trim() || '',
        href: link.href,
        title: link.title || ''
      })).filter(link => link.href.includes('dune.com'))
    );
    
    // Extract iframes (embedded queries)
    const iframes = await page.$$eval('iframe', iframes =>
      iframes.map(iframe => ({
        src: iframe.src,
        title: iframe.title || iframe.getAttribute('title') || ''
      }))
    );
    
    // Try to find query IDs in the page source
    const pageContent = await page.content();
    const queryIdMatches = pageContent.match(/query[_-]?id["\s:=]+(\d+)/gi) || [];
    const dashboardIdMatches = pageContent.match(/dashboard[_-]?id["\s:=]+(\d+)/gi) || [];
    
    // Extract data from tables (if any are visible)
    const tables = await page.$$eval('table', tables =>
      tables.map((table, idx) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        return {
          index: idx,
          rowCount: rows.length,
          headers: rows[0] ? Array.from(rows[0].querySelectorAll('th, td')).map(cell => cell.textContent?.trim()) : [],
          sampleRows: rows.slice(1, 4).map(row => 
            Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim())
          )
        };
      })
    );
    
    // Extract text content for analysis
    const mainContent = await page.textContent('main') || await page.textContent('body');
    const contentPreview = mainContent?.substring(0, 5000) || '';
    
    // Look for JSON data in script tags
    const scripts = await page.$$eval('script[type="application/json"], script:not([src])', scripts =>
      scripts.map(script => {
        try {
          const text = script.textContent || '';
          if (text.includes('query') || text.includes('dashboard') || text.includes('data')) {
            return text.substring(0, 1000); // First 1000 chars
          }
          return null;
        } catch (e) {
          return null;
        }
      }).filter(Boolean)
    );
    
    // Save full HTML for inspection
    const artifactsDir = path.join(__dirname, '..', '.cursor', 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(artifactsDir, 'dune-dashboard-full.html'),
      pageContent
    );
    
    // Extract results
    const results = {
      title,
      url: page.url(),
      timestamp: new Date().toISOString(),
      links: [...new Map(links.map(link => [link.href, link])).values()].slice(0, 50),
      iframes,
      queryIds: [...new Set(queryIdMatches.map(m => m.match(/\d+/)?.[0]).filter(Boolean))],
      dashboardIds: [...new Set(dashboardIdMatches.map(m => m.match(/\d+/)?.[0]).filter(Boolean))],
      tables,
      contentPreview,
      scriptsFound: scripts.length,
      cloudflareBlocked: bodyText?.includes('Just a moment') || title.includes('Just a moment')
    };
    
    // Save results as JSON
    fs.writeFileSync(
      path.join(artifactsDir, 'dune-dashboard-extract.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n=== EXTRACTION RESULTS ===');
    console.log('Title:', results.title);
    console.log('URL:', results.url);
    console.log('Cloudflare Blocked:', results.cloudflareBlocked);
    console.log('Links found:', results.links.length);
    console.log('Iframes found:', results.iframes.length);
    console.log('Query IDs found:', results.queryIds);
    console.log('Dashboard IDs found:', results.dashboardIds);
    console.log('Tables found:', results.tables.length);
    console.log('\n=== SAMPLE LINKS ===');
    results.links.slice(0, 10).forEach(link => {
      console.log(`- ${link.text.substring(0, 50)}: ${link.href}`);
    });
    
    if (results.tables.length > 0) {
      console.log('\n=== TABLE DATA ===');
      results.tables.forEach((table, idx) => {
        console.log(`\nTable ${idx + 1}:`);
        console.log('Headers:', table.headers);
        console.log('Sample rows:', table.sampleRows);
      });
    }
    
    console.log('\n=== FILES SAVED ===');
    console.log(`- HTML: ${path.join(artifactsDir, 'dune-dashboard-full.html')}`);
    console.log(`- JSON: ${path.join(artifactsDir, 'dune-dashboard-extract.json')}`);
    
    await browser.close();
    return results;
    
  } catch (error) {
    console.error('Error extracting dashboard:', error);
    await browser.close();
    throw error;
  }
}

extractDuneDashboard()
  .then(results => {
    console.log('\n✅ Extraction complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  });
