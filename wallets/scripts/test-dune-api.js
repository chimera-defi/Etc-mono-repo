#!/usr/bin/env node

/**
 * Test script for Dune Analytics API integration
 * 
 * Usage:
 *   DUNE_API_KEY=your-key node scripts/test-dune-api.js
 * 
 * This script tests the Dune API connection and attempts to fetch
 * data from the crypto cards dashboard.
 */

// Load environment variables from frontend/.env.local if it exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', 'frontend', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

// Use native fetch (Node 18+) or node-fetch for older versions
let fetch;
try {
  // Try native fetch first (Node 18+)
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.error('❌ fetch not available. Install node-fetch: npm install node-fetch');
  process.exit(1);
}

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DUNE_BASE_URL = process.env.DUNE_API_BASE_URL || 'https://api.dune.com/api/v1';

if (!DUNE_API_KEY) {
  console.error('❌ DUNE_API_KEY not set!');
  console.error('\nTo test the API:');
  console.error('1. Get an API key from https://dune.com/settings/api');
  console.error('2. Set it as an environment variable:');
  console.error('   export DUNE_API_KEY=your-api-key-here');
  console.error('3. Or add it to frontend/.env.local:');
  console.error('   DUNE_API_KEY=your-api-key-here\n');
  process.exit(1);
}

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

async function testApiConnection() {
  console.log('🧪 Testing Dune Analytics API Connection...\n');
  console.log(`API Key: ${DUNE_API_KEY.substring(0, 10)}...${DUNE_API_KEY.substring(DUNE_API_KEY.length - 4)}`);
  console.log(`Base URL: ${DUNE_BASE_URL}\n`);
  
  try {
    // Test 1: Try to get user info (if endpoint exists)
    console.log('Test 1: Checking API connectivity...');
    try {
      // Note: This endpoint may not exist, but it's a good connectivity test
      const result = await duneRequest('/user');
      console.log('✅ API connection successful');
      console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
      if (error.message.includes('404')) {
        console.log('⚠️  /user endpoint not found (this is okay)');
      } else {
        throw error;
      }
    }
    
    // Test 2: Try to find dashboard by username
    console.log('\nTest 2: Searching for dashboard...');
    console.log('⚠️  Dashboard search may require different endpoint');
    console.log('   Dashboard URL: https://dune.com/obchakevich/crypto-cards-all-chains');
    console.log('   We need to find the dashboard ID from the URL');
    
    // Test 3: Manual query execution test
    console.log('\nTest 3: Query execution test');
    console.log('⚠️  To test query execution, we need:');
    console.log('   1. Dashboard ID (from dashboard URL)');
    console.log('   2. Query ID (from dashboard queries)');
    console.log('\n   Once we have these, we can test:');
    console.log('   - executeDuneQuery(queryId)');
    console.log('   - getQueryResults(executionId)');
    
    console.log('\n✅ API test complete!');
    console.log('\nNext steps:');
    console.log('1. Manually visit: https://dune.com/obchakevich/crypto-cards-all-chains');
    console.log('2. Extract dashboard ID from page source or network requests');
    console.log('3. Use getDashboardQueries(dashboardId) to find query IDs');
    console.log('4. Execute queries and fetch results');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    console.error(error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n⚠️  Authentication failed. Check your API key.');
    }
    process.exit(1);
  }
}

// Run tests
testApiConnection()
  .then(() => {
    console.log('\n✨ All tests completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
