/**
 * Jest Setup for Aztec Integration Tests
 * 
 * This file runs before all tests to check if sandbox is available.
 * Tests will skip gracefully when sandbox is not running.
 * 
 * PREREQUISITES (for full tests):
 * 1. Aztec sandbox must be running: `aztec start --sandbox`
 * 2. Contracts must be compiled with aztec-nargo
 * 3. Contract artifacts must be in the artifacts/ directory
 */

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

// Track sandbox availability
export let sandboxAvailable = false;

// Check sandbox availability without importing heavy Aztec SDK
async function checkSandbox(): Promise<boolean> {
  try {
    const response = await fetch(`${TEST_CONFIG.PXE_URL}/status`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

beforeAll(async () => {
  console.log('\\n========================================');
  console.log('Aztec Liquid Staking Integration Tests');
  console.log('========================================\\n');
  
  console.log(`Checking sandbox at ${TEST_CONFIG.PXE_URL}...`);
  sandboxAvailable = await checkSandbox();
  
  if (sandboxAvailable) {
    console.log('✅ Sandbox is running - full tests will execute\\n');
  } else {
    console.log('⚠️  Sandbox not available - tests will run in SKIP mode');
    console.log('   Start sandbox with: aztec start --sandbox');
    console.log('   Tests will pass but log "skipped" messages\\n');
  }
});

afterAll(async () => {
  console.log('\\n========================================');
  console.log('Tests Complete');
  if (!sandboxAvailable) {
    console.log('(Run with sandbox for full integration testing)');
  }
  console.log('========================================\\n');
});

// Export for use in tests
export function skipIfNoSandbox(): boolean {
  if (!sandboxAvailable) {
    console.log('  → Skipping (sandbox not available)');
    return true;
  }
  return false;
}
