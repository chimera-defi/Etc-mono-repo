#!/usr/bin/env node

/**
 * Discover Dune Dashboard Structure
 * 
 * This script attempts to find the dashboard ID and query IDs for the
 * crypto cards dashboard.
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
  
  console.log(`\n📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

async function discoverDashboard() {
  console.log('🔍 Discovering Dune Dashboard Structure...\n');
  console.log(`Dashboard URL: https://dune.com/obchakevich/crypto-cards-all-chains`);
  console.log(`Username: obchakevich\n`);
  
  try {
    // Try to get user's dashboards (if endpoint exists)
    console.log('Attempt 1: Getting user dashboards...');
    try {
      const dashboards = await duneRequest(`/user/dashboards`);
      console.log('✅ Found dashboards:', JSON.stringify(dashboards, null, 2));
      
      // Look for crypto cards dashboard
      const cryptoCardsDashboard = dashboards.find(d => 
        d.name?.toLowerCase().includes('crypto') && 
        d.name?.toLowerCase().includes('card')
      );
      
      if (cryptoCardsDashboard) {
        console.log('\n✅ Found crypto cards dashboard:', cryptoCardsDashboard);
        return cryptoCardsDashboard.dashboard_id;
      }
    } catch (error) {
      console.log('⚠️  User dashboards endpoint not available:', error.message);
    }
    
    // Try to search for dashboard by username
    console.log('\nAttempt 2: Searching by username...');
    try {
      const result = await duneRequest(`/user/obchakevich/dashboards`);
      console.log('✅ Found user dashboards:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('⚠️  Username search not available:', error.message);
    }
    
    // Manual approach: Try common dashboard IDs
    console.log('\nAttempt 3: Trying to extract dashboard ID from URL pattern...');
    console.log('Note: Dashboard IDs are typically numeric.');
    console.log('We may need to manually inspect the dashboard page to find the ID.');
    
    // Try a few common patterns (unlikely to work, but worth trying)
    const possibleIds = [1, 100, 1000, 10000];
    for (const id of possibleIds) {
      try {
        const dashboard = await duneRequest(`/dashboard/${id}`);
        console.log(`\n✅ Found dashboard ${id}:`, dashboard.name);
        if (dashboard.name?.toLowerCase().includes('crypto') || 
            dashboard.name?.toLowerCase().includes('card')) {
          console.log('🎯 This might be our dashboard!');
          return id;
        }
      } catch (error) {
        // Expected to fail for most IDs
      }
    }
    
    console.log('\n⚠️  Could not automatically discover dashboard ID.');
    console.log('\nNext steps:');
    console.log('1. Visit: https://dune.com/obchakevich/crypto-cards-all-chains');
    console.log('2. Open browser DevTools → Network tab');
    console.log('3. Look for API calls containing dashboard_id');
    console.log('4. Or check page source for dashboard ID');
    console.log('\nAlternatively, we can try to find queries by searching.');
    
  } catch (error) {
    console.error('\n❌ Discovery failed:', error.message);
    throw error;
  }
}

async function findQueriesByKeyword() {
  console.log('\n🔍 Attempting to find queries by keyword...');
  
  try {
    // Try query search endpoint (if exists)
    const queries = await duneRequest('/queries?search=crypto+cards');
    console.log('✅ Found queries:', JSON.stringify(queries, null, 2));
    return queries;
  } catch (error) {
    console.log('⚠️  Query search not available:', error.message);
    return null;
  }
}

// Main execution
(async () => {
  try {
    const dashboardId = await discoverDashboard();
    
    if (dashboardId) {
      console.log(`\n✅ Dashboard ID: ${dashboardId}`);
      
      // Get queries in dashboard
      console.log('\n📊 Fetching dashboard queries...');
      const queries = await duneRequest(`/dashboard/${dashboardId}/queries`);
      console.log('✅ Dashboard queries:', JSON.stringify(queries, null, 2));
    } else {
      // Try alternative approach
      await findQueriesByKeyword();
    }
    
    console.log('\n✨ Discovery complete');
  } catch (error) {
    console.error('\n💥 Discovery failed:', error);
    process.exit(1);
  }
})();
