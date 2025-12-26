#!/usr/bin/env node

/**
 * Extract Dashboard Data from Dune Analytics
 * 
 * This script uses Playwright to load the dashboard, wait for Cloudflare,
 * and extract all visible data including query IDs and actual data.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractDashboardData() {
  console.log('🚀 Starting dashboard data extraction...\n');
  
  const browser = await chromium.launch({ 
    headless: true, // Must be headless in this environment
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });
  
  const page = await context.newPage();
  
  // Intercept and log all network requests
  const networkRequests = [];
  const apiResponses = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api.dune.com') || url.includes('dune.com/api')) {
      networkRequests.push({
        url,
        method: request.method(),
        headers: request.headers(),
      });
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api.dune.com') || url.includes('dune.com/api')) {
      try {
        const body = await response.text();
        apiResponses.push({
          url,
          status: response.status(),
          headers: response.headers(),
          body: body.substring(0, 5000), // First 5KB
        });
      } catch (e) {
        // Ignore
      }
    }
  });
  
  try {
    console.log('📡 Navigating to dashboard...');
    await page.goto('https://dune.com/obchakevich/crypto-cards-all-chains', {
      waitUntil: 'networkidle',
      timeout: 180000, // 3 minutes
    });
    
    console.log('⏳ Waiting for Cloudflare challenge (this may take 60+ seconds)...');
    
    // Wait for Cloudflare challenge - check periodically
    let cloudflarePassed = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(2000);
      const title = await page.title();
      const bodyText = await page.textContent('body').catch(() => '');
      
      if (!title.includes('Just a moment') && !bodyText.includes('Verify you are human')) {
        cloudflarePassed = true;
        console.log(`✅ Cloudflare challenge passed after ${(i + 1) * 2} seconds`);
        break;
      }
      
      if (i % 5 === 0) {
        console.log(`   Still waiting... (${(i + 1) * 2}s)`);
      }
    }
    
    if (!cloudflarePassed) {
      console.log('⚠️  Cloudflare challenge may still be active, proceeding anyway...');
    }
    
    // Wait for dashboard content to load
    console.log('\n⏳ Waiting for dashboard content to load...');
    await page.waitForTimeout(10000);
    
    // Try to wait for specific elements that indicate content is loaded
    try {
      await page.waitForSelector('table, [class*="table"], [class*="chart"], [class*="visualization"]', {
        timeout: 30000,
      });
      console.log('✅ Dashboard content detected');
    } catch (e) {
      console.log('⚠️  Could not find expected content elements');
    }
    
    // Extract all visible text/data
    console.log('\n📊 Extracting visible data...');
    const pageData = await page.evaluate(() => {
      const data = {
        title: document.title,
        url: window.location.href,
        tables: [],
        textContent: document.body.innerText,
        scripts: [],
        metaData: {},
      };
      
      // Extract all tables
      const tables = document.querySelectorAll('table');
      tables.forEach((table, idx) => {
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
          const cells = Array.from(tr.querySelectorAll('th, td')).map(cell => 
            cell.textContent?.trim() || ''
          );
          if (cells.length > 0) {
            rows.push(cells);
          }
        });
        if (rows.length > 0) {
          data.tables.push({
            index: idx,
            rows,
          });
        }
      });
      
      // Extract data from script tags
      document.querySelectorAll('script').forEach(script => {
        const text = script.textContent || script.innerHTML || '';
        if (text.length > 100 && (text.includes('query') || text.includes('dashboard') || text.includes('data'))) {
          // Try to extract JSON
          try {
            const jsonMatch = text.match(/\{[\s\S]{100,}\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              data.scripts.push({
                type: 'json',
                data: parsed,
              });
            }
          } catch (e) {
            // Not JSON, save as text
            data.scripts.push({
              type: 'text',
              preview: text.substring(0, 1000),
            });
          }
        }
      });
      
      // Look for React/Next.js data
      const reactData = document.querySelector('#__NEXT_DATA__');
      if (reactData) {
        try {
          data.metaData.nextData = JSON.parse(reactData.textContent);
        } catch (e) {
          // Ignore
        }
      }
      
      return data;
    });
    
    // Extract IDs from page content and network requests
    console.log('\n🔍 Extracting IDs from page and network...');
    const pageContent = await page.content();
    
    // Extract dashboard ID
    const dashboardIdMatches = [
      ...pageContent.matchAll(/dashboard[_-]?id["\s:=]+(\d+)/gi),
      ...pageContent.matchAll(/"dashboardId":\s*(\d+)/gi),
      ...pageContent.matchAll(/\/dashboards\/(\d+)/gi),
    ];
    const dashboardIds = [...new Set(Array.from(dashboardIdMatches, m => parseInt(m[1], 10)))];
    
    // Extract query IDs
    const queryIdMatches = [
      ...pageContent.matchAll(/query[_-]?id["\s:=]+(\d+)/gi),
      ...pageContent.matchAll(/"queryId":\s*(\d+)/gi),
      ...pageContent.matchAll(/\/queries\/(\d+)/gi),
    ];
    const queryIds = [...new Set(Array.from(queryIdMatches, m => parseInt(m[1], 10)))];
    
    // Extract from network requests
    networkRequests.forEach(req => {
      const dashboardMatch = req.url.match(/dashboard[\/=](\d+)/);
      if (dashboardMatch) {
        dashboardIds.push(parseInt(dashboardMatch[1], 10));
      }
      const queryMatch = req.url.match(/query[\/=](\d+)/);
      if (queryMatch) {
        queryIds.push(parseInt(queryMatch[1], 10));
      }
    });
    
    // Extract from API responses
    apiResponses.forEach(resp => {
      try {
        const body = JSON.parse(resp.body);
        if (body.dashboard_id) dashboardIds.push(body.dashboard_id);
        if (body.query_id) queryIds.push(body.query_id);
        if (body.queries) {
          body.queries.forEach(q => {
            if (q.query_id) queryIds.push(q.query_id);
          });
        }
      } catch (e) {
        // Not JSON
      }
    });
    
    const uniqueDashboardIds = [...new Set(dashboardIds)];
    const uniqueQueryIds = [...new Set(queryIds)];
    
    // Save everything
    const artifactsDir = path.join(__dirname, '..', '.cursor', 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      dashboardUrl: 'https://dune.com/obchakevich/crypto-cards-all-chains',
      dashboardIds: uniqueDashboardIds,
      queryIds: uniqueQueryIds,
      pageData: {
        title: pageData.title,
        tables: pageData.tables,
        textPreview: pageData.textContent.substring(0, 5000),
      },
      networkRequests: networkRequests.slice(0, 50), // Limit size
      apiResponses: apiResponses.slice(0, 20), // Limit size
    };
    
    fs.writeFileSync(
      path.join(artifactsDir, 'dune-dashboard-snapshot.json'),
      JSON.stringify(snapshot, null, 2)
    );
    
    fs.writeFileSync(
      path.join(artifactsDir, 'dune-dashboard-full-content.html'),
      pageContent
    );
    
    // Save page text content
    fs.writeFileSync(
      path.join(artifactsDir, 'dune-dashboard-text.txt'),
      pageData.textContent
    );
    
    console.log('\n=== EXTRACTION RESULTS ===');
    console.log(`Dashboard IDs: ${uniqueDashboardIds.length > 0 ? uniqueDashboardIds.join(', ') : 'None found'}`);
    console.log(`Query IDs: ${uniqueQueryIds.length > 0 ? uniqueQueryIds.join(', ') : 'None found'}`);
    console.log(`Tables found: ${pageData.tables.length}`);
    console.log(`Network requests: ${networkRequests.length}`);
    console.log(`API responses: ${apiResponses.length}`);
    
    if (pageData.tables.length > 0) {
      console.log('\n=== TABLE DATA ===');
      pageData.tables.forEach((table, idx) => {
        console.log(`\nTable ${idx + 1} (${table.rows.length} rows):`);
        if (table.rows.length > 0) {
          console.log('Headers:', table.rows[0].join(' | '));
          console.log('Sample rows:');
          table.rows.slice(1, 4).forEach(row => {
            console.log('  ', row.join(' | '));
          });
        }
      });
    }
    
    console.log('\n✅ Snapshot saved to .cursor/artifacts/dune-dashboard-snapshot.json');
    
    return {
      dashboardIds: uniqueDashboardIds,
      queryIds: uniqueQueryIds,
      tables: pageData.tables,
    };
    
  } catch (error) {
    console.error('\n❌ Extraction failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

extractDashboardData()
  .then(result => {
    console.log('\n✨ Extraction complete!');
    if (result.queryIds.length > 0) {
      console.log(`\n🎯 Found ${result.queryIds.length} query ID(s): ${result.queryIds.join(', ')}`);
      console.log('\nNext step: Run fetch script with these IDs:');
      console.log(`node scripts/fetch-crypto-cards-data.js ${result.queryIds.join(' ')}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
