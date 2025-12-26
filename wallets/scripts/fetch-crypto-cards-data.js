#!/usr/bin/env node

/**
 * Fetch Crypto Cards Data from Dune Analytics
 * 
 * This script fetches data from Dune Analytics queries and transforms it
 * for use in the wallet radar frontend.
 * 
 * Usage:
 *   node scripts/fetch-crypto-cards-data.js [query-id-1] [query-id-2] ...
 * 
 * If no query IDs provided, it will attempt to use known query IDs from
 * the crypto cards dashboard.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
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

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DUNE_BASE_URL = process.env.DUNE_API_BASE_URL || 'https://api.dune.com/api/v1';

if (!DUNE_API_KEY) {
  console.error('❌ DUNE_API_KEY not set!');
  console.error('Add it to frontend/.env.local: DUNE_API_KEY=your-key');
  process.exit(1);
}

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

async function executeQuery(queryId) {
  console.log(`\n🔄 Executing query ${queryId}...`);
  
  const execution = await duneRequest(`/query/${queryId}/execute`, {
    method: 'POST',
  });
  
  console.log(`✅ Execution started: ${execution.execution_id}`);
  return execution.execution_id;
}

async function waitForCompletion(executionId, maxWait = 120000) {
  const startTime = Date.now();
  let status;
  
  while (Date.now() - startTime < maxWait) {
    status = await duneRequest(`/execution/${executionId}/status`);
    
    if (status.state === 'QUERY_STATE_COMPLETED') {
      console.log('✅ Query completed!');
      return status;
    }
    
    if (status.state === 'QUERY_STATE_FAILED' || status.state === 'QUERY_STATE_CANCELLED') {
      throw new Error(`Query failed: ${status.state}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.stdout.write('.');
  }
  
  throw new Error(`Query timed out after ${maxWait}ms`);
}

async function getResults(executionId) {
  const results = await duneRequest(`/execution/${executionId}/results`);
  return results;
}

function transformCardData(rawRows) {
  // Group by card name
  const cardMap = new Map();
  
  for (const row of rawRows) {
    // Try to identify card name from various possible fields
    const cardName = row.card_name || row.card || row.name || row.provider || 'Unknown';
    const key = cardName.toString().toLowerCase().trim();
    
    if (!cardMap.has(key)) {
      cardMap.set(key, {
        cardName: cardName.toString(),
        supportedChains: [],
        chainCount: 0,
        totalTransactions: null,
        totalVolumeUsd: null,
        activeUsers: null,
        chainMetrics: [],
      });
    }
    
    const card = cardMap.get(key);
    
    // Extract chain information
    if (row.chain || row.blockchain || row.network) {
      const chain = (row.chain || row.blockchain || row.network).toString().toLowerCase();
      if (!card.supportedChains.includes(chain)) {
        card.supportedChains.push(chain);
        card.chainCount = card.supportedChains.length;
      }
    }
    
    // Extract metrics
    if (row.transactions !== undefined || row.tx_count !== undefined) {
      const tx = Number(row.transactions || row.tx_count || 0);
      if (card.totalTransactions === null) card.totalTransactions = 0;
      card.totalTransactions += tx;
    }
    
    if (row.volume_usd !== undefined || row.volume !== undefined || row.usd_volume !== undefined) {
      const vol = Number(row.volume_usd || row.volume || row.usd_volume || 0);
      if (card.totalVolumeUsd === null) card.totalVolumeUsd = 0;
      card.totalVolumeUsd += vol;
    }
    
    if (row.users !== undefined || row.active_users !== undefined || row.user_count !== undefined) {
      const users = Number(row.users || row.active_users || row.user_count || 0);
      card.activeUsers = Math.max(card.activeUsers || 0, users);
    }
    
    // Chain-specific metrics
    if (row.chain && (row.transactions || row.volume_usd || row.users)) {
      card.chainMetrics.push({
        chain: row.chain.toString().toLowerCase(),
        transactions: Number(row.transactions || 0),
        volume: Number(row.volume_usd || row.volume || 0),
        users: Number(row.users || 0),
      });
    }
  }
  
  return Array.from(cardMap.values());
}

async function fetchQueryData(queryId) {
  try {
    const executionId = await executeQuery(queryId);
    await waitForCompletion(executionId);
    const results = await getResults(executionId);
    
    console.log(`\n📊 Query Results:`);
    console.log(`   Columns: ${results.result.metadata.column_names.join(', ')}`);
    console.log(`   Rows: ${results.result.metadata.total_row_count}`);
    
    const transformed = transformCardData(results.result.rows);
    
    return {
      queryId,
      executionId,
      columns: results.result.metadata.column_names,
      rawRows: results.result.rows,
      transformedCards: transformed,
      metadata: results.result.metadata,
    };
  } catch (error) {
    console.error(`\n❌ Error fetching query ${queryId}:`, error.message);
    return null;
  }
}

async function main() {
  const queryIds = process.argv.slice(2).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  
  if (queryIds.length === 0) {
    console.log('📋 Crypto Cards Data Fetcher\n');
    console.log('Usage: node scripts/fetch-crypto-cards-data.js [query-id-1] [query-id-2] ...\n');
    console.log('To find query IDs:');
    console.log('1. Visit: https://dune.com/obchakevich/crypto-cards-all-chains');
    console.log('2. Open browser DevTools → Network tab');
    console.log('3. Look for API calls to /api/v1/query/ or /api/v1/execution/');
    console.log('4. Extract query IDs from the URLs\n');
    console.log('Example: node scripts/fetch-crypto-cards-data.js 3000000 3000001\n');
    return;
  }
  
  console.log(`🚀 Fetching data from ${queryIds.length} query/queries...\n`);
  
  const results = [];
  for (const queryId of queryIds) {
    const data = await fetchQueryData(queryId);
    if (data) {
      results.push(data);
    }
  }
  
  if (results.length === 0) {
    console.log('\n⚠️  No data fetched');
    return;
  }
  
  // Save results
  const artifactsDir = path.join(__dirname, '..', '.cursor', 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  
  const outputFile = path.join(artifactsDir, 'dune-crypto-cards-data.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Data saved to: ${outputFile}`);
  console.log(`\n📊 Summary:`);
  results.forEach((result, idx) => {
    console.log(`\nQuery ${result.queryId}:`);
    console.log(`  Columns: ${result.columns.length}`);
    console.log(`  Raw rows: ${result.rawRows.length}`);
    console.log(`  Transformed cards: ${result.transformedCards.length}`);
    if (result.transformedCards.length > 0) {
      console.log(`  Sample cards: ${result.transformedCards.slice(0, 3).map(c => c.cardName).join(', ')}`);
    }
  });
}

main().catch(error => {
  console.error('\n💥 Error:', error);
  process.exit(1);
});
