#!/usr/bin/env node

/**
 * Direct API Exploration
 * 
 * Since we can't easily scrape the dashboard, let's try to use the API
 * to explore what's available. We'll try different approaches to find
 * the dashboard and queries.
 */

const DUNE_API_KEY = process.env.DUNE_API_KEY || 'i1HPmyd56YPMUDlvpNIA3COilI9cciU6';
const DUNE_BASE_URL = process.env.DUNE_API_BASE_URL || 'https://api.dune.com/api/v1';

async function duneRequest(endpoint, options = {}) {
  const url = `${DUNE_BASE_URL}${endpoint}`;
  const headers = {
    'X-Dune-API-Key': DUNE_API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      return { error: `HTTP ${response.status}`, details: error };
    }
    
    return { success: true, data: await response.json() };
  } catch (error) {
    return { error: error.message };
  }
}

async function exploreAPI() {
  console.log('🔍 Exploring Dune API...\n');
  
  // Try to get user info
  console.log('1. Testing user endpoints...');
  const userEndpoints = ['/user', '/users/me', '/me'];
  for (const endpoint of userEndpoints) {
    const result = await duneRequest(endpoint);
    if (result.success) {
      console.log(`   ✅ ${endpoint}:`, JSON.stringify(result.data, null, 2));
    } else {
      console.log(`   ❌ ${endpoint}: ${result.error}`);
    }
  }
  
  // Try to find dashboard by trying common ID ranges
  console.log('\n2. Searching for dashboard (this may take a while)...');
  console.log('   Trying dashboard IDs in common ranges...');
  
  // Based on Dune's URL structure, dashboards often have IDs in certain ranges
  // Let's try a smarter approach - check if there's a pattern
  const testRanges = [
    [1, 10],
    [100, 110],
    [1000, 1010],
    [10000, 10010],
  ];
  
  let foundDashboards = [];
  for (const [start, end] of testRanges) {
    for (let id = start; id <= end && id <= start + 5; id++) { // Limit to 5 per range
      const result = await duneRequest(`/dashboard/${id}`);
      if (result.success && result.data) {
        const dashboard = result.data;
        console.log(`   ✅ Found dashboard ${id}: "${dashboard.name}"`);
        foundDashboards.push({ id, ...dashboard });
        
        // Check if this is our target dashboard
        if (dashboard.name?.toLowerCase().includes('crypto') && 
            dashboard.name?.toLowerCase().includes('card')) {
          console.log(`   🎯 This might be our target dashboard!`);
        }
      }
    }
  }
  
  // Try to get queries from found dashboards
  if (foundDashboards.length > 0) {
    console.log('\n3. Getting queries from found dashboards...');
    for (const dashboard of foundDashboards.slice(0, 3)) { // Limit to first 3
      const queries = await duneRequest(`/dashboard/${dashboard.id}/queries`);
      if (queries.success && queries.data) {
        console.log(`   Dashboard ${dashboard.id} queries:`, queries.data.length);
        if (queries.data.length > 0) {
          queries.data.forEach(q => {
            console.log(`     - Query ${q.query_id}: ${q.name || 'Unnamed'}`);
          });
        }
      }
    }
  }
  
  // Try query search (might require paid plan, but worth trying)
  console.log('\n4. Trying query search...');
  const searchTerms = ['crypto', 'card', 'crypto card', 'credit card'];
  for (const term of searchTerms) {
    const result = await duneRequest(`/queries?search=${encodeURIComponent(term)}`);
    if (result.success) {
      console.log(`   ✅ Search "${term}": Found ${result.data.length || 0} queries`);
      if (result.data && result.data.length > 0) {
        result.data.slice(0, 5).forEach(q => {
          console.log(`     - Query ${q.query_id}: ${q.name || 'Unnamed'}`);
        });
      }
    } else if (result.error?.includes('403')) {
      console.log(`   ⚠️  Search "${term}": Requires paid plan`);
    } else {
      console.log(`   ❌ Search "${term}": ${result.error}`);
    }
  }
  
  console.log('\n✨ Exploration complete!');
}

exploreAPI().catch(error => {
  console.error('\n💥 Error:', error);
  process.exit(1);
});
