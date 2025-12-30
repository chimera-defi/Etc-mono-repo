# Parallel Work Handoff - Non-Blocking Tasks

**Date:** 2025-12-30
**Status:** Smart contracts complete (Phase 2 done), ready for parallel frontend + bot work
**Total Parallelizable Agents:** 6 agents can work simultaneously

---

## Current Status Summary

### ✅ COMPLETE: Smart Contracts (Phase 2)
- 7 contracts fully implemented (176 functions)
- 64/64 tests passing
- No TODO/FIXME comments in code
- Ready for Aztec compilation testing

### 🚀 READY TO START: Non-Blocking Work
These can proceed **immediately** without waiting for anything:

| Work Stream | Agents | Dependencies | Priority |
|-------------|--------|--------------|----------|
| Frontend (Mock Data) | 3 | None | High |
| Bot Infrastructure | 2 | Contract ABIs only | High |
| Security Docs | 1 | None | Medium |

---

## Part 1: Frontend Development (3 Parallel Agents)

### Agent Allocation

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND WORK BREAKDOWN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent F1: Setup + Core UI       Agent F2: Feature Components   │
│  ├── Project scaffolding         ├── StakeWidget                │
│  ├── Tailwind config             ├── WithdrawalQueue            │
│  ├── Button, Input, Card         ├── PortfolioView              │
│  └── Tabs, Badge, Modal          └── TransactionStatus          │
│                                                                  │
│                    Agent F3: Integration + Polish                │
│                    ├── Mock hooks (useStaking, useWallet)        │
│                    ├── Page assembly                             │
│                    ├── Responsive design                         │
│                    └── Testing + Build verification              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Timeline:
  F1: Day 1-2 (setup + UI kit)
  F2: Day 1-3 (can start immediately, use placeholder components)
  F3: Day 2-4 (starts when F1 delivers UI kit)
```

---

### AGENT F1: Project Setup + UI Kit

**Estimated Time:** 6-8 hours
**Dependencies:** None
**Output:** `/staking/aztec/frontend/` with UI components

#### Prompt

```text
You are a frontend engineer setting up the Aztec Liquid Staking UI.

## CONTEXT
- No frontend exists yet
- Target: Dark-themed DeFi app (similar to Lido, Rocket Pool)
- Must be Aztec-compatible (NOT Ethereum/wagmi/viem)
- Smart contracts are complete with these key functions:
  - deposit(amount, exchange_rate, nonce) → returns stAZTEC amount
  - request_withdrawal(st_aztec_amount, exchange_rate, timestamp) → returns request_id
  - claim_withdrawal(request_id, timestamp) → returns AZTEC amount

## YOUR TASKS

### 1. Project Scaffolding
```bash
cd /workspace/staking/aztec
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend
npm install lucide-react clsx tailwind-merge @tanstack/react-query
```

### 2. Configure Tailwind for Dark Theme
Update `tailwind.config.ts`:
- Dark mode: class-based
- Custom colors: aztec-purple (#7B3FE4), aztec-dark (#0D0D1A), aztec-card (#1A1A2E)
- Font: Inter or system

### 3. Create UI Kit Components in `src/components/ui/`

**Button.tsx:**
- Variants: primary (purple gradient), secondary (outlined), ghost
- Sizes: sm, md, lg
- States: default, hover, disabled, loading (spinner)
- Props: variant, size, loading, disabled, onClick, children

**Input.tsx:**
- Dark background (#1A1A2E)
- Purple border on focus
- Optional "MAX" button inside (right side)
- Props: value, onChange, placeholder, max, onMax, disabled, error

**Card.tsx:**
- Dark background with subtle border
- Optional header with title
- Props: title, children, className

**Tabs.tsx:**
- Segmented control style (Stake | Unstake)
- Active tab highlighted with gradient
- Props: tabs[], activeTab, onChange

**Badge.tsx:**
- Status indicators: success (green), warning (yellow), pending (purple pulse)
- Props: variant, children

**Modal.tsx:**
- Overlay with backdrop blur
- Close button (X)
- Props: isOpen, onClose, title, children

### 4. Create Utility Functions in `src/lib/`

**cn.ts:** Class name merge utility
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**format.ts:** Number formatting utilities
```typescript
export function formatAztec(amount: bigint): string;
export function formatRate(rate: number): string; // 10000 → "1.00"
export function formatUsd(amount: number): string;
```

## VERIFICATION CHECKLIST
Before marking complete:
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] All 6 UI components render correctly
- [ ] Dark theme applied consistently
- [ ] README.md has setup instructions

## OUTPUT
Report back with:
1. Project structure created
2. Components implemented (list each with status)
3. Any design decisions made
4. Instructions for Agent F2 to use the components
```

---

### AGENT F2: Feature Components

**Estimated Time:** 8-10 hours
**Dependencies:** UI Kit from F1 (can start with placeholders)
**Output:** StakeWidget, WithdrawalQueue, PortfolioView

#### Prompt

```text
You are a frontend engineer building the main feature components.

## CONTEXT
- UI Kit components should be in `src/components/ui/` (from Agent F1)
- If UI Kit not ready, create temporary versions and note for replacement
- Use MOCK DATA throughout - no chain connection yet
- Exchange rate: 10000 = 1.0 (basis points)

## MOCK DATA CONSTANTS (create in `src/mocks/data.ts`)
```typescript
export const MOCK_DATA = {
  exchangeRate: 10250, // 1.025 - stAZTEC worth more than AZTEC
  tvl: 10_500_000, // $10.5M
  apy: 8.5, // 8.5%
  userBalance: {
    aztec: 50000_000000000000000000n, // 50,000 AZTEC (18 decimals)
    stAztec: 45000_000000000000000000n, // 45,000 stAZTEC
  },
  withdrawalRequests: [
    { id: 1, amount: 1000n * 10n**18n, requestedAt: Date.now() - 86400000 * 3, claimableAt: Date.now() + 86400000 * 4 },
    { id: 2, amount: 500n * 10n**18n, requestedAt: Date.now() - 86400000 * 8, claimableAt: Date.now() - 86400000 * 1 }, // Ready
  ],
  unbondingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
```

## YOUR TASKS

### 1. StakeWidget (`src/components/StakeWidget.tsx`)

**Structure:**
```
┌─────────────────────────────────────┐
│  [Stake]  [Unstake]  ← Tabs         │
├─────────────────────────────────────┤
│  You Pay                            │
│  ┌─────────────────────────────┐   │
│  │ 0.0          AZTEC    [MAX] │   │
│  └─────────────────────────────┘   │
│                                     │
│  You Receive                        │
│  ┌─────────────────────────────┐   │
│  │ 0.0          stAZTEC        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Exchange Rate: 1 AZTEC = 0.975 stAZTEC │
│  Protocol Fee: 10%                  │
│  Network Cost: ~$0.20               │
│                                     │
│  [    Stake AZTEC    ] ← Button     │
└─────────────────────────────────────┘
```

**Props:**
```typescript
interface StakeWidgetProps {
  onStake: (amount: bigint) => Promise<void>;
  onUnstake: (amount: bigint) => Promise<void>;
  userBalance: { aztec: bigint; stAztec: bigint };
  exchangeRate: number;
  isConnected: boolean;
}
```

**Behavior:**
- Tab switch changes input/output labels
- Stake: Input AZTEC → Output stAZTEC
- Unstake: Input stAZTEC → Output AZTEC (+ 7-day warning)
- Calculate output: `outputAmount = inputAmount * 10000 / exchangeRate` (stake)
- MAX button fills user balance
- Button disabled if: not connected, amount > balance, amount === 0

### 2. WithdrawalQueue (`src/components/WithdrawalQueue.tsx`)

**Structure:**
```
┌─────────────────────────────────────┐
│  Pending Withdrawals                │
├─────────────────────────────────────┤
│  1,000 AZTEC  │ Unbonding │ 4d left │
│  ─────────────────────────────────  │
│  500 AZTEC    │ [Claim]   │ Ready   │
└─────────────────────────────────────┘
```

**Props:**
```typescript
interface WithdrawalRequest {
  id: number;
  amount: bigint;
  requestedAt: number;
  claimableAt: number;
}

interface WithdrawalQueueProps {
  requests: WithdrawalRequest[];
  onClaim: (requestId: number) => Promise<void>;
  currentTime: number;
}
```

**Behavior:**
- Show "Unbonding" badge if `currentTime < claimableAt`
- Show "Ready" badge (green) + Claim button if ready
- Time remaining: calculate from `claimableAt - currentTime`
- Empty state: "No pending withdrawals"

### 3. PortfolioView (`src/components/PortfolioView.tsx`)

**Structure:**
```
┌─────────────────────────────────────┐
│  Your Portfolio                     │
├─────────────────────────────────────┤
│  stAZTEC Balance   │ 45,000 stAZTEC │
│  AZTEC Value       │ ~46,125 AZTEC  │
│  USD Value         │ ~$92,250       │
│  ──────────────────────────────────│
│  Total Rewards     │ +1,125 AZTEC   │
│  APY               │ 8.5%           │
└─────────────────────────────────────┘
```

**Props:**
```typescript
interface PortfolioViewProps {
  stAztecBalance: bigint;
  exchangeRate: number;
  aztecPrice: number; // USD
  apy: number;
}
```

### 4. StatsBar (`src/components/StatsBar.tsx`)

**Structure:**
```
┌──────────────┬──────────────┬──────────────┐
│  TVL         │  APY         │  Rate        │
│  $10.5M      │  8.5%        │  1.025       │
└──────────────┴──────────────┴──────────────┘
```

### 5. ConnectWallet (`src/components/ConnectWallet.tsx`)

**States:**
- Disconnected: "Connect Wallet" button
- Connecting: Loading spinner
- Connected: Truncated address + disconnect option

**Mock behavior:** Toggle between states on click

## VERIFICATION CHECKLIST
- [ ] StakeWidget renders and calculates correctly
- [ ] WithdrawalQueue shows requests with proper states
- [ ] PortfolioView displays formatted numbers
- [ ] All components use UI Kit from F1 (or temp versions)
- [ ] Mock data works without chain connection
- [ ] TypeScript compiles: `npm run type-check`

## OUTPUT
Report back with:
1. Components created (list each)
2. Mock data structure finalized
3. Any UX decisions made
4. Integration instructions for Agent F3
```

---

### AGENT F3: Integration + Testing

**Estimated Time:** 6-8 hours
**Dependencies:** F1 (UI Kit), F2 (Feature Components)
**Output:** Complete working frontend with mock mode

#### Prompt

```text
You are a frontend engineer assembling the final application.

## CONTEXT
- UI Kit from Agent F1 in `src/components/ui/`
- Feature components from Agent F2 in `src/components/`
- Need to wire everything together with mock hooks

## YOUR TASKS

### 1. Create Mock Hooks (`src/hooks/`)

**useWallet.ts:**
```typescript
interface UseWalletReturn {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): UseWalletReturn {
  // Mock implementation
  // connect() sets address to "0x1234...5678"
  // disconnect() clears address
}
```

**useStaking.ts:**
```typescript
interface UseStakingReturn {
  // Protocol data
  exchangeRate: number;
  tvl: number;
  apy: number;
  
  // User data
  aztecBalance: bigint;
  stAztecBalance: bigint;
  withdrawalRequests: WithdrawalRequest[];
  
  // Actions
  stake: (amount: bigint) => Promise<{ txHash: string }>;
  requestWithdrawal: (amount: bigint) => Promise<{ requestId: number }>;
  claimWithdrawal: (requestId: number) => Promise<{ txHash: string }>;
  
  // Loading states
  isStaking: boolean;
  isWithdrawing: boolean;
  isClaiming: boolean;
}
```

**useTransaction.ts:**
```typescript
interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'stake' | 'unstake' | 'claim';
  amount: bigint;
}

export function useTransaction() {
  // Track recent transactions
  // Show toast notifications
}
```

### 2. Create Main Page (`src/app/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] stAZTEC     [Docs] [Discord]    [Connect Wallet]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         Liquid Stake Your Aztec                             │
│         Earn 8.5% APY while keeping your assets liquid      │
│                                                             │
│  ┌─────────────────┬─────────────────┬─────────────────┐   │
│  │  TVL: $10.5M    │  APY: 8.5%      │  Rate: 1.025    │   │
│  └─────────────────┴─────────────────┴─────────────────┘   │
│                                                             │
│              ┌──────────────────────────┐                   │
│              │      StakeWidget         │                   │
│              └──────────────────────────┘                   │
│                                                             │
│              ┌──────────────────────────┐                   │
│              │    PortfolioView         │ (if connected)    │
│              └──────────────────────────┘                   │
│                                                             │
│              ┌──────────────────────────┐                   │
│              │   WithdrawalQueue        │ (if has requests) │
│              └──────────────────────────┘                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Docs]  [Discord]  [Terms]    © 2025 stAZTEC              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Add Toast Notifications

Create `src/components/ToastProvider.tsx`:
- Success: Green, auto-dismiss 5s
- Error: Red, manual dismiss
- Pending: Purple pulse, no auto-dismiss

### 4. Add Loading States

- Skeleton loaders for data fetching
- Button spinners for transactions
- Full-page loader for initial load

### 5. Create Development Modes

**package.json scripts:**
```json
{
  "dev": "next dev",
  "dev:mock": "NEXT_PUBLIC_MOCK=true next dev",
  "build": "next build",
  "test": "jest",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

### 6. Add Tests (`src/__tests__/`)

**StakeWidget.test.tsx:**
- Renders stake tab by default
- Calculates output amount correctly
- Disables button when amount > balance
- Shows error for invalid input

**WithdrawalQueue.test.tsx:**
- Renders empty state
- Shows pending requests
- Enables claim for ready requests

### 7. Responsive Design

- Mobile: Stack vertically, full-width inputs
- Tablet: Centered card, 600px max-width
- Desktop: Centered card, 500px max-width

## VERIFICATION CHECKLIST
- [ ] `npm run dev` - App loads, all components render
- [ ] `npm run build` - Production build succeeds
- [ ] `npm run lint` - No linting errors
- [ ] `npm run type-check` - TypeScript compiles
- [ ] `npm test` - All tests pass
- [ ] Mock mode works end-to-end (stake, unstake, claim)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark theme consistent throughout

## OUTPUT
Report back with:
1. Final project structure
2. Test coverage summary
3. Screenshots of key flows
4. Instructions for running locally
5. Next steps for real Aztec integration
```

---

## Part 2: Bot Infrastructure (2 Parallel Agents)

### Agent Allocation

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOT WORK BREAKDOWN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent B1: Staking + Rewards Bots    Agent B2: Withdrawal + Monitor │
│  ├── staking-keeper/                 ├── withdrawal-keeper/      │
│  │   ├── Watch deposits              │   ├── Monitor queue       │
│  │   ├── Trigger batching            │   ├── Process claims      │
│  │   └── Execute stakes              │   └── Manage liquidity    │
│  └── rewards-keeper/                 └── monitoring/             │
│      ├── Claim rewards                   ├── Validator health    │
│      ├── Update exchange rate            ├── TVL tracking        │
│      └── Distribute fees                 └── Alerting            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Both agents also contribute to:
  - shared/ (common utilities)
  - k8s/ (deployment manifests)
```

---

### AGENT B1: Staking + Rewards Bots

**Estimated Time:** 12-16 hours
**Dependencies:** Contract ABIs (can mock initially)
**Output:** `/staking/aztec/bots/staking-keeper/` and `/rewards-keeper/`

#### Prompt

```text
You are a backend engineer building keeper bots for Aztec liquid staking.

## CONTEXT
- Aztec is NOT EVM - do not use ethers.js, viem, wagmi
- Use AztecJS for chain interaction (or mock if SDK not ready)
- Smart contracts are complete with these key functions:
  - LiquidStakingCore: deposit, request_withdrawal, notify_staked, add_rewards
  - VaultManager: execute_batch_stake, select_next_validator
  - RewardsManager: process_rewards, update_exchange_rate

## PROJECT STRUCTURE
```
/workspace/staking/aztec/bots/
├── staking-keeper/
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── config.ts         # Environment config
│   │   ├── watcher.ts        # Event listener
│   │   ├── executor.ts       # Transaction executor
│   │   └── __tests__/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
├── rewards-keeper/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── scheduler.ts      # Cron-like scheduling
│   │   ├── claimer.ts        # Reward claiming logic
│   │   └── __tests__/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
└── shared/
    ├── src/
    │   ├── aztec-client.ts   # Aztec SDK wrapper
    │   ├── logger.ts         # Structured logging
    │   ├── metrics.ts        # Prometheus metrics
    │   └── retry.ts          # Exponential backoff
    └── package.json
```

## YOUR TASKS

### 1. Create Shared Utilities (`bots/shared/`)

**aztec-client.ts:**
```typescript
// Mock Aztec SDK wrapper - replace with real SDK when available
export interface AztecClient {
  connect(rpcUrl: string): Promise<void>;
  getBlockNumber(): Promise<number>;
  readContract<T>(address: string, method: string, args: any[]): Promise<T>;
  writeContract(address: string, method: string, args: any[]): Promise<{ txHash: string }>;
  watchEvents(address: string, eventName: string, callback: (event: any) => void): () => void;
}

export function createAztecClient(): AztecClient {
  // Mock implementation for development
}
```

**logger.ts:**
```typescript
// Structured JSON logging
export const logger = {
  info: (message: string, meta?: object) => {},
  error: (message: string, error: Error, meta?: object) => {},
  warn: (message: string, meta?: object) => {},
};
```

**metrics.ts:**
```typescript
import { Counter, Gauge, Histogram } from 'prom-client';

export const metrics = {
  stakingBatchesProcessed: new Counter({ name: 'staking_batches_processed', help: 'Total batches staked' }),
  pendingPoolSize: new Gauge({ name: 'pending_pool_size', help: 'Current pending pool in AZTEC' }),
  rewardsClaimed: new Counter({ name: 'rewards_claimed', help: 'Total rewards claimed' }),
  exchangeRate: new Gauge({ name: 'exchange_rate', help: 'Current exchange rate (basis points)' }),
};
```

**retry.ts:**
```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  // Exponential backoff implementation
}
```

### 2. Staking Keeper (`bots/staking-keeper/`)

**config.ts:**
```typescript
export const config = {
  aztecRpcUrl: process.env.AZTEC_RPC_URL || 'http://localhost:8080',
  liquidStakingCoreAddress: process.env.LIQUID_STAKING_CORE_ADDRESS,
  vaultManagerAddress: process.env.VAULT_MANAGER_ADDRESS,
  batchThreshold: BigInt(process.env.BATCH_THRESHOLD || '200000000000000000000000'), // 200k
  pollingInterval: parseInt(process.env.POLLING_INTERVAL || '60000'), // 1 minute
  privateKey: process.env.BOT_PRIVATE_KEY,
};
```

**watcher.ts:**
```typescript
export class DepositWatcher {
  constructor(private client: AztecClient, private config: Config) {}
  
  async start(): Promise<void> {
    // Poll for pending pool size
    // Or watch for DepositProcessed events (if available)
  }
  
  async getPendingPoolSize(): Promise<bigint> {
    return this.client.readContract(
      this.config.liquidStakingCoreAddress,
      'get_pending_pool',
      []
    );
  }
}
```

**executor.ts:**
```typescript
export class StakingExecutor {
  async executeBatchStake(): Promise<string> {
    // 1. Check pending pool >= threshold
    // 2. Call VaultManager.execute_batch_stake
    // 3. Log and emit metrics
    // 4. Return tx hash
  }
}
```

**index.ts:**
```typescript
async function main() {
  const client = createAztecClient();
  await client.connect(config.aztecRpcUrl);
  
  const watcher = new DepositWatcher(client, config);
  const executor = new StakingExecutor(client, config);
  
  logger.info('Staking keeper started');
  
  // Main loop
  while (true) {
    try {
      const poolSize = await watcher.getPendingPoolSize();
      metrics.pendingPoolSize.set(Number(poolSize));
      
      if (poolSize >= config.batchThreshold) {
        logger.info('Batch threshold reached', { poolSize: poolSize.toString() });
        const txHash = await executor.executeBatchStake();
        logger.info('Batch staked', { txHash });
        metrics.stakingBatchesProcessed.inc();
      }
    } catch (error) {
      logger.error('Error in main loop', error as Error);
    }
    
    await sleep(config.pollingInterval);
  }
}
```

### 3. Rewards Keeper (`bots/rewards-keeper/`)

**scheduler.ts:**
```typescript
import { Queue, Worker } from 'bullmq';

export function createRewardsScheduler(redis: Redis) {
  const queue = new Queue('rewards', { connection: redis });
  
  // Schedule daily rewards claim
  await queue.add('claim-rewards', {}, {
    repeat: { cron: '0 0 * * *' } // Daily at midnight
  });
  
  return queue;
}
```

**claimer.ts:**
```typescript
export class RewardsClaimer {
  async processRewards(validatorAddress: string, grossAmount: bigint): Promise<void> {
    // 1. Call RewardsManager.process_rewards
    // 2. Log net rewards and fees
    // 3. Update exchange rate metric
  }
  
  async getValidatorRewards(validatorAddress: string): Promise<bigint> {
    // Query rewards available for claiming
  }
}
```

### 4. Add Tests

**staking-keeper/__tests__/executor.test.ts:**
- Test batch execution when threshold met
- Test skip when threshold not met
- Test retry on failure

**rewards-keeper/__tests__/claimer.test.ts:**
- Test reward calculation
- Test exchange rate update
- Test fee distribution

### 5. Add Dockerfiles

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## VERIFICATION CHECKLIST
- [ ] `npm run lint` - No errors in all packages
- [ ] `npm run build` - TypeScript compiles
- [ ] `npm test` - All tests pass
- [ ] Both bots start without errors (mock mode)
- [ ] Metrics endpoint works (/metrics)
- [ ] Dockerfiles build successfully
- [ ] README has setup instructions

## OUTPUT
Report back with:
1. Files created (list structure)
2. Test coverage for each bot
3. Mock vs real SDK differences noted
4. Prometheus metrics exposed
5. Any Aztec SDK questions/blockers
```

---

### AGENT B2: Withdrawal + Monitoring Bots

**Estimated Time:** 12-16 hours
**Dependencies:** Contract ABIs (can mock initially)
**Output:** `/staking/aztec/bots/withdrawal-keeper/` and `/monitoring/`

#### Prompt

```text
You are a backend engineer building withdrawal and monitoring bots.

## CONTEXT
- Aztec is NOT EVM - do not use ethers.js, viem, wagmi
- Smart contracts complete with:
  - WithdrawalQueue: add_request, claim_withdrawal, is_claimable, get_queue_length
  - ValidatorRegistry: is_active, get_validator_stake, get_total_staked

## PROJECT STRUCTURE
```
/workspace/staking/aztec/bots/
├── withdrawal-keeper/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── queue-monitor.ts    # Watch withdrawal queue
│   │   ├── processor.ts        # Process ready withdrawals
│   │   ├── liquidity.ts        # Manage liquidity buffer
│   │   └── __tests__/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── monitoring/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── validator-health.ts # Check validator status
│   │   ├── tvl-tracker.ts      # Track TVL
│   │   ├── alerting.ts         # Alert integrations
│   │   └── __tests__/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
└── k8s/                        # Kubernetes manifests
    ├── staking-keeper.yaml
    ├── rewards-keeper.yaml
    ├── withdrawal-keeper.yaml
    ├── monitoring.yaml
    └── configmap.yaml
```

## YOUR TASKS

### 1. Withdrawal Keeper (`bots/withdrawal-keeper/`)

**queue-monitor.ts:**
```typescript
export class QueueMonitor {
  async getQueueStatus(): Promise<{
    queueLength: number;
    totalPending: bigint;
    readyToClaim: number[];
  }> {
    // Query WithdrawalQueue contract
  }
  
  async checkRequestClaimable(requestId: number, currentTime: number): Promise<boolean> {
    return this.client.readContract(
      this.config.withdrawalQueueAddress,
      'is_claimable',
      [requestId, currentTime]
    );
  }
}
```

**processor.ts:**
```typescript
export class WithdrawalProcessor {
  async processReadyWithdrawals(): Promise<void> {
    // 1. Get all ready requests
    // 2. Check liquidity buffer
    // 3. If insufficient, trigger unstaking from validators
    // 4. Process each claim
  }
  
  async ensureLiquidity(requiredAmount: bigint): Promise<void> {
    // Check buffer, unstake if needed
  }
}
```

**liquidity.ts:**
```typescript
export class LiquidityManager {
  async getBufferBalance(): Promise<bigint> {
    // Query liquidity buffer
  }
  
  async requestUnstake(amount: bigint): Promise<void> {
    // Trigger validator unstaking via VaultManager
  }
}
```

### 2. Monitoring Bot (`bots/monitoring/`)

**validator-health.ts:**
```typescript
export interface ValidatorStatus {
  address: string;
  isActive: boolean;
  stake: bigint;
  lastChecked: number;
}

export class ValidatorHealthChecker {
  async checkAllValidators(): Promise<ValidatorStatus[]> {
    // Query each registered validator
  }
  
  async alertIfUnhealthy(validators: ValidatorStatus[]): Promise<void> {
    // Send alerts for inactive validators
  }
}
```

**tvl-tracker.ts:**
```typescript
export class TVLTracker {
  async getCurrentTVL(): Promise<{
    pendingPool: bigint;
    stakedToValidators: bigint;
    liquidityBuffer: bigint;
    total: bigint;
  }> {
    // Query LiquidStakingCore.get_tvl()
  }
  
  async emitMetrics(tvl: TVLData): void {
    metrics.tvlTotal.set(Number(tvl.total));
    metrics.tvlPending.set(Number(tvl.pendingPool));
    metrics.tvlStaked.set(Number(tvl.stakedToValidators));
  }
}
```

**alerting.ts:**
```typescript
export interface AlertConfig {
  telegram?: { botToken: string; chatId: string };
  pagerduty?: { serviceKey: string };
  slack?: { webhookUrl: string };
}

export class Alerter {
  async sendAlert(severity: 'critical' | 'warning' | 'info', message: string): Promise<void> {
    // Send to configured channels
  }
}

// Alert conditions
export const ALERT_CONDITIONS = {
  validatorOffline: { severity: 'critical', threshold: 5 * 60 * 1000 }, // 5 min
  tvlDropPercent: { severity: 'warning', threshold: 10 }, // 10% drop
  queueBacklog: { severity: 'warning', threshold: 100 }, // 100+ pending
  exchangeRateDrop: { severity: 'critical', threshold: 100 }, // 1% drop (100 bps)
};
```

### 3. Kubernetes Manifests (`bots/k8s/`)

**staking-keeper.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: staking-keeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: staking-keeper
  template:
    metadata:
      labels:
        app: staking-keeper
    spec:
      containers:
      - name: staking-keeper
        image: ghcr.io/your-org/staking-keeper:latest
        envFrom:
        - configMapRef:
            name: bot-config
        - secretRef:
            name: bot-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        ports:
        - containerPort: 9090
          name: metrics
        livenessProbe:
          httpGet:
            path: /health
            port: 9090
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: staking-keeper
spec:
  selector:
    app: staking-keeper
  ports:
  - port: 9090
    name: metrics
```

**configmap.yaml:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bot-config
data:
  AZTEC_RPC_URL: "https://next.devnet.aztec-labs.com"
  POLLING_INTERVAL: "60000"
  BATCH_THRESHOLD: "200000000000000000000000"
  METRICS_PORT: "9090"
```

### 4. Add Tests

**withdrawal-keeper/__tests__/processor.test.ts:**
- Test processing ready withdrawals
- Test liquidity check
- Test unstaking trigger

**monitoring/__tests__/alerting.test.ts:**
- Test alert condition detection
- Test alert message formatting
- Test channel routing

### 5. Add Health Endpoints

Each bot should expose:
- GET /health - Returns 200 if healthy
- GET /metrics - Prometheus metrics
- GET /ready - Returns 200 when ready to process

## VERIFICATION CHECKLIST
- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Compiles
- [ ] `npm test` - All tests pass
- [ ] Both bots start in mock mode
- [ ] K8s manifests valid: `kubectl apply --dry-run=client -f k8s/`
- [ ] Health endpoints respond
- [ ] Metrics endpoint works

## OUTPUT
Report back with:
1. Files created
2. Test coverage
3. Alert conditions implemented
4. K8s deployment instructions
5. Monitoring dashboard recommendations
```

---

## Coordination Between Agents

### File Ownership

| Directory | Owner | Collaborators |
|-----------|-------|---------------|
| `frontend/src/components/ui/` | F1 | F2, F3 |
| `frontend/src/components/` | F2 | F3 |
| `frontend/src/hooks/` | F3 | - |
| `frontend/src/app/` | F3 | - |
| `bots/shared/` | B1 | B2 |
| `bots/staking-keeper/` | B1 | - |
| `bots/rewards-keeper/` | B1 | - |
| `bots/withdrawal-keeper/` | B2 | - |
| `bots/monitoring/` | B2 | - |
| `bots/k8s/` | B2 | B1 |

### Handoff Points

```
Day 1:
  F1 starts → delivers UI kit
  F2 starts → uses placeholder components
  B1 starts → delivers shared utilities
  B2 starts → uses shared utilities from B1

Day 2:
  F1 → F2, F3: UI kit ready
  B1 → B2: shared/ ready

Day 3:
  F2 → F3: Feature components ready
  
Day 4:
  F3 delivers: Complete frontend
  B1 delivers: Staking + rewards bots
  B2 delivers: Withdrawal + monitoring bots
```

---

## Success Criteria

### Frontend Complete When:
- [ ] `npm run build` succeeds
- [ ] All 4 user flows work with mock data
- [ ] Tests pass
- [ ] Responsive on mobile/desktop
- [ ] README has setup instructions

### Bots Complete When:
- [ ] All 4 bots start without errors
- [ ] Tests pass (80%+ coverage)
- [ ] Metrics exposed
- [ ] K8s manifests valid
- [ ] README has deployment instructions

---

## Quick Start Commands

```bash
# Frontend (any agent)
cd /workspace/staking/aztec/frontend
npm install
npm run dev

# Bots (any agent)
cd /workspace/staking/aztec/bots/staking-keeper
npm install
npm run dev

# Run all tests
cd /workspace/staking/aztec/frontend && npm test
cd /workspace/staking/aztec/bots/staking-keeper && npm test
cd /workspace/staking/aztec/bots/rewards-keeper && npm test
cd /workspace/staking/aztec/bots/withdrawal-keeper && npm test
cd /workspace/staking/aztec/bots/monitoring && npm test
```

---

*Generated: 2025-12-30*
*Contract Status: Phase 2 complete (64/64 tests passing)*
*Ready for: Phase 3 (Integration Testing), Phase 4 (Bots), Phase 4.5 (Frontend)*
