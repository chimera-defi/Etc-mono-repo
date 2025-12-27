// Basic Staking Pool Contract Skeleton
// NOTE: This is base Noir syntax. Aztec-specific macros require aztec-nargo.

// Pool state - would be storage in Aztec
struct PoolState {
    total_staked: u64,
    total_shares: u64,
    fee_bps: u64, // 1000 = 10%
}

// Deposit calculation - core staking logic
fn calculate_shares(amount: u64, total_staked: u64, total_shares: u64) -> u64 {
    if total_staked == 0 {
        amount
    } else {
        (amount * total_shares) / total_staked
    }
}

// Withdraw calculation
fn calculate_withdrawal(shares: u64, total_staked: u64, total_shares: u64) -> u64 {
    if total_shares == 0 {
        0
    } else {
        (shares * total_staked) / total_shares
    }
}

// Fee calculation
fn calculate_fee(amount: u64, fee_bps: u64) -> u64 {
    (amount * fee_bps) / 10000
}

// Main entry point (required for nargo compile)
fn main(deposit_amount: u64, current_staked: pub u64, current_shares: pub u64) -> pub u64 {
    calculate_shares(deposit_amount, current_staked, current_shares)
}

#[test]
fn test_initial_deposit() {
    // First deposit should receive 1:1 shares
    let shares = calculate_shares(1000, 0, 0);
    assert(shares == 1000);
}

#[test]
fn test_proportional_deposit() {
    // Pool has 1000 staked, 1000 shares. Deposit 500 -> get 500 shares
    let shares = calculate_shares(500, 1000, 1000);
    assert(shares == 500);
}

#[test]
fn test_withdrawal_with_rewards() {
    // Pool has 2000 staked (1000 principal + 1000 rewards), 1000 shares
    // Withdrawing 500 shares gets 1000 tokens
    let withdrawal = calculate_withdrawal(500, 2000, 1000);
    assert(withdrawal == 1000);
}

#[test]
fn test_fee_calculation() {
    // 10% fee (1000 bps) on 1000 tokens = 100
    let fee = calculate_fee(1000, 1000);
    assert(fee == 100);
}

#[test]
fn test_main() {
    let shares = main(500, 1000, 1000);
    assert(shares == 500);
}
