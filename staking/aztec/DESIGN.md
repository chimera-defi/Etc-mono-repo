# Component Design: Aztec Staking

**Last Updated:** December 27, 2025
**Scope:** Detailed design for individual components.

---

## 1. Smart Contract: `StakingPool.nr`

### Interface Definitions
To interact with the Aztec Token Standard, we define the following trait (until standard libs are imported):

```noir
trait Token {
    // Transfer from msg_sender to specific address
    fn transfer_in_public(from: AztecAddress, to: AztecAddress, amount: u128, nonce: Field);
    
    // Transfer from this contract to specific address
    fn transfer_public(to: AztecAddress, amount: u128, nonce: Field);
}
```

### Storage Layout
```noir
struct Storage<Context> {
    total_staked: PublicMutable<u128, Context>,
    total_shares: PublicMutable<u128, Context>,
    shares: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
    admin: PublicMutable<AztecAddress, Context>,
    fee_bps: PublicMutable<u64, Context>,
    paused: PublicMutable<bool, Context>,
}
```

---

## 2. Frontend Components

### `StakingCard.tsx`
*   **Purpose**: Main interaction point.
*   **Props**: `balance`, `apy`, `exchangeRate`.
*   **State**: `amount` (input), `tab` (Deposit/Withdraw).
*   **Actions**:
    *   `onDeposit()`: Calls `StakingPool.deposit(amount)`.
    *   `onWithdraw()`: Calls `StakingPool.withdraw(shares)`.

### `StatsCard.tsx`
*   **Purpose**: Protocol health at a glance.
*   **Data**:
    *   TVL (Total Value Locked in AZTEC and USD).
    *   APY (Annual Percentage Yield).
    *   Exchange Rate (1 stAZTEC = X.XXXX AZTEC).

---

## 3. Bot Logic

### Staking Keeper (`apps/staking-keeper`)
```typescript
async function run() {
    const poolBalance = await contract.getPublicBalance(POOL_ADDRESS);
    const THRESHOLD = 200_000n * 10n**18n; // 200k AZTEC

    if (poolBalance >= THRESHOLD) {
        console.log("Threshold met. Initiating stake...");
        const validator = selectValidator(); // Round-robin or performance based
        await contract.stake(validator, THRESHOLD);
    }
}
```

### Rewards Keeper (`apps/rewards-keeper`)
```typescript
async function run() {
    // Check every epoch
    const rewards = await validator.getPendingRewards(POOL_ADDRESS);
    if (rewards > 0) {
        await contract.claimRewards();
        // Contract automatically updates exchange rate
    }
}
```
