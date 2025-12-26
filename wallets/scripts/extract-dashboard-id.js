#!/usr/bin/env node

/**
 * Extract Dashboard ID from Dune Analytics page
 * Uses Playwright to load the page and extract dashboard/query IDs
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractDashboardId() {
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
    console.log('🌐 Loading Dune Analytics dashboard...');
    await page.goto('https://dune.com/obchakevich/crypto-cards-all-chains', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    
    // Wait for Cloudflare
    console.log('⏳ Waiting for Cloudflare challenge...');
    await page.waitForTimeout(45000);
    
    // Wait for page content
    await page.waitForTimeout(10000);
    
    // Extract dashboard ID from page content
    console.log('🔍 Extracting dashboard ID...');
    
    // Method 1: Look for dashboard ID in page content
    const pageContent = await page.content();
    
    // Try to find dashboard ID in various formats
    const dashboardIdPatterns = [
      /dashboard[_-]?id["\s:=]+(\d+)/gi,
      /"dashboardId":\s*(\d+)/gi,
      /dashboard\/(\d+)/gi,
      /\/dashboards\/(\d+)/gi,
    ];
    
    const foundIds = new Set();
    for (const pattern of dashboardIdPatterns) {
      const matches = pageContent.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          foundIds.add(parseInt(match[1], 10));
        }
      }
    }
    
    // Method 2: Look for query IDs
    const queryIdPatterns = [
      /query[_-]?id["\s:=]+(\d+)/gi,
      /"queryId":\s*(\d+)/gi,
      /\/queries\/(\d+)/gi,
    ];
    
    const foundQueryIds = new Set();
    for (const pattern of queryIdPatterns) {
      const matches = pageContent.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          foundQueryIds.add(parseInt(match[1], 10));
        }
      }
    }
    
    // Method 3: Check network requests
    console.log('📡 Monitoring network requests...');
    const networkData = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('api.dune.com') || url.includes('dashboard') || url.includes('query')) {
        networkData.push({
          url,
          status: response.status(),
        });
      }
    });
    
    await page.waitForTimeout(5000);
    
    // Extract IDs from network URLs
    for (const req of networkData) {
      const dashboardMatch = req.url.match(/dashboard[\/=](\d+)/);
      if (dashboardMatch) {
        foundIds.add(parseInt(dashboardMatch[1], 10));
      }
      const queryMatch = req.url.match(/query[\/=](\d+)/);
      if (queryMatch) {
        foundQueryIds.add(parseInt(queryMatch[1], 10));
      }
    }
    
    // Method 4: Try to execute JavaScript in page context
    try {
      const jsExtracted = await page.evaluate(() => {
        const data = {
          dashboardId: null,
          queryIds: [],
        };
        
        // Look for React/Next.js data
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          const text = script.textContent || '';
          const dashboardMatch = text.match(/dashboardId["\s:]+(\d+)/);
          if (dashboardMatch) {
            data.dashboardId = parseInt(dashboardMatch[1], 10);
          }
          const queryMatches = text.matchAll(/queryId["\s:]+(\d+)/g);
          for (const match of queryMatches) {
            data.queryIds.push(parseInt(match[1], 10));
          }
        }
        
        return data;
      });
      
      if (jsExtracted.dashboardId) {
        foundIds.add(jsExtracted.dashboardId);
      }
      jsExtracted.queryIds.forEach(id => foundQueryIds.add(id));
    } catch (e) {
      console.log('⚠️  JavaScript extraction failed:', e.message);
    }
    
    // Save page content for manual inspection
    const artifactsDir = path.join(__dirname, '..', '.cursor', 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(artifactsDir, 'dune-dashboard-source.html'),
      pageContent
    );
    
    console.log('\n=== EXTRACTION RESULTS ===');
    console.log('Dashboard IDs found:', Array.from(foundIds));
    console.log('Query IDs found:', Array.from(foundQueryIds));
    console.log('Network requests:', networkData.length);
    
    if (foundIds.size > 0 || foundQueryIds.size > 0) {
      const result = {
        dashboardIds: Array.from(foundIds),
        queryIds: Array.from(foundQueryIds),
        timestamp: new Date().toISOString(),
      };
      
      fs.writeFileSync(
        path.join(artifactsDir, 'dune-ids.json'),
        JSON.stringify(result, null, 2)
      );
      
      console.log('\n✅ IDs saved to .cursor/artifacts/dune-ids.json');
      return result;
    } else {
      console.log('\n⚠️  Could not extract IDs automatically');
      console.log('Page source saved to .cursor/artifacts/dune-dashboard-source.html');
      console.log('Please manually inspect the HTML to find dashboard/query IDs');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

extractDashboardId()
  .then(result => {
    if (result) {
      console.log('\n✨ Extraction complete');
      process.exit(0);
    } else {
      console.log('\n⚠️  Manual inspection required');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
