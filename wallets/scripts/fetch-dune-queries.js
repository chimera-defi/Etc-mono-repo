#!/usr/bin/env node

/**
 * Fetch Dune Query Data
 * 
 * This script attempts to fetch data from Dune queries.
 * We'll try common query IDs or use a known query ID if available.
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

async function executeAndFetchQuery(queryId) {
  console.log(`\n🔄 Executing query ${queryId}...`);
  
  try {
    // Execute query
    const execution = await duneRequest(`/query/${queryId}/execute`, {
      method: 'POST',
    });
    
    console.log('✅ Query execution started:', execution.execution_id);
    console.log('State:', execution.state);
    
    // Poll for results
    let status = execution;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max
    
    while (status.state !== 'QUERY_STATE_COMPLETED' && attempts < maxAttempts) {
      if (status.state === 'QUERY_STATE_FAILED' || status.state === 'QUERY_STATE_CANCELLED') {
        throw new Error(`Query failed with state: ${status.state}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      status = await duneRequest(`/execution/${execution.execution_id}/status`);
      attempts++;
      
      if (attempts % 5 === 0) {
        console.log(`⏳ Still waiting... (${attempts * 2}s)`);
      }
    }
    
    if (status.state !== 'QUERY_STATE_COMPLETED') {
      throw new Error(`Query timed out after ${attempts * 2} seconds`);
    }
    
    console.log('✅ Query completed!');
    
    // Fetch results
    const results = await duneRequest(`/execution/${execution.execution_id}/results`);
    
    return results;
    
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`⚠️  Query ${queryId} not found`);
      return null;
    }
    throw error;
  }
}

async function tryCommonQueryIds() {
  console.log('🔍 Trying to find queries by testing common IDs...\n');
  console.log('Note: This is a brute-force approach. We\'ll try a range of IDs.');
  
  // Try a range of query IDs (common ranges for public queries)
  const ranges = [
    [1000000, 1000100], // Common public query range
    [2000000, 2000100],
    [3000000, 3000100],
  ];
  
  for (const [start, end] of ranges) {
    console.log(`\nTrying range ${start} to ${end}...`);
    
    // Sample a few IDs from the range
    const sampleIds = [
      start,
      start + 10,
      start + 50,
      start + 100,
    ].filter(id => id <= end);
    
    for (const queryId of sampleIds) {
      try {
        const result = await executeAndFetchQuery(queryId);
        if (result) {
          console.log(`\n🎯 Found working query ${queryId}!`);
          console.log('Columns:', result.result.metadata.column_names);
          console.log('Rows:', result.result.metadata.total_row_count);
          console.log('\nSample data:', JSON.stringify(result.result.rows.slice(0, 3), null, 2));
          return { queryId, result };
        }
      } catch (error) {
        // Expected for most IDs
        if (!error.message.includes('404') && !error.message.includes('not found')) {
          console.log(`⚠️  Error with query ${queryId}:`, error.message);
        }
      }
    }
  }
  
  return null;
}

// Alternative: Try to get query by checking if we can access query metadata
async function getQueryMetadata(queryId) {
  try {
    const query = await duneRequest(`/query/${queryId}`);
    return query;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🚀 Dune Query Fetcher\n');
  console.log('This script attempts to find and execute queries.');
  console.log('Since we don\'t know the exact query IDs, we\'ll try common ranges.\n');
  
  // First, let's see if there's a way to get query info without executing
  console.log('Attempt 1: Testing query metadata endpoint...');
  const testQueryId = 1000000;
  const metadata = await getQueryMetadata(testQueryId);
  if (metadata) {
    console.log('✅ Query metadata endpoint works!');
    console.log('Sample query:', JSON.stringify(metadata, null, 2));
  } else {
    console.log('⚠️  Query metadata endpoint not available or query not found');
  }
  
  // Try to find queries
  console.log('\nAttempt 2: Trying to find queries...');
  const found = await tryCommonQueryIds();
  
  if (found) {
    console.log('\n✅ Successfully found and executed a query!');
    console.log('Query ID:', found.queryId);
  } else {
    console.log('\n⚠️  Could not find queries automatically');
    console.log('\nNext steps:');
    console.log('1. Manually visit the dashboard');
    console.log('2. Inspect network requests to find query IDs');
    console.log('3. Or contact dashboard owner for query IDs');
  }
}

main().catch(error => {
  console.error('\n💥 Error:', error.message);
  process.exit(1);
});
