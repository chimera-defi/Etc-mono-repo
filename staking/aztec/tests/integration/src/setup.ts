/**
 * Jest Setup for Aztec Integration Tests
 * 
 * This file runs before all tests to set up the Aztec sandbox connection.
 * 
 * PREREQUISITES:
 * 1. Aztec sandbox must be running: `aztec start --sandbox`
 * 2. Contracts must be compiled with aztec-nargo
 * 3. Contract artifacts must be in the artifacts/ directory
 */

import { createPXEClient } from '@aztec/aztec.js';

// Global test configuration
export const TEST_CONFIG = {
  PXE_URL: process.env.PXE_URL || 'http://localhost:8080',
  SANDBOX_URL: process.env.SANDBOX_URL || 'http://localhost:8545',
  
  // Test amounts (in wei, 1e18 = 1 token)
  DEPOSIT_AMOUNT: 100_000_000_000_000_000_000n, // 100 AZTEC
  BATCH_SIZE: 200_000_000_000_000_000_000_000n, // 200k AZTEC
  
  // Test timing
  UNBONDING_PERIOD: 604800, // 7 days in seconds
  
  // Exchange rate basis points (10000 = 1.0)
  INITIAL_RATE: 10000n,
  
  // Protocol fee (1000 = 10%)
  PROTOCOL_FEE_BPS: 1000n,
};

// Global state for tests
export let pxe: Awaited<ReturnType<typeof createPXEClient>>;

beforeAll(async () => {
  console.log('\\n========================================');
  console.log('Aztec Liquid Staking Integration Tests');
  console.log('========================================\\n');
  
  try {
    // Connect to PXE
    console.log(`Connecting to PXE at ${TEST_CONFIG.PXE_URL}...`);
    pxe = createPXEClient(TEST_CONFIG.PXE_URL);
    
    // Verify connection
    const nodeInfo = await pxe.getNodeInfo();
    console.log(`Connected to Aztec node v${nodeInfo.nodeVersion}`);
    console.log(`Chain ID: ${nodeInfo.chainId}`);
    console.log(`Protocol Version: ${nodeInfo.protocolVersion}\\n`);
  } catch (error) {
    console.error('\\n⚠️  Failed to connect to Aztec sandbox');
    console.error('Make sure sandbox is running: aztec start --sandbox\\n');
    throw error;
  }
});

afterAll(async () => {
  console.log('\\n========================================');
  console.log('Tests Complete');
  console.log('========================================\\n');
});

// Helper to check if sandbox is available
export async function ensureSandboxRunning(): Promise<boolean> {
  try {
    await pxe.getNodeInfo();
    return true;
  } catch {
    return false;
  }
}
