// Staking Math Tests
// Pure staking math functions - testable with standard nargo
// These functions mirror the logic in aztec-staking-pool

fn main() {
    // Entry point for bin type - runs basic sanity check
    let shares = calculate_shares_to_mint(1000, 0, 0);
    assert(shares == 1000);
}

// ============ PURE MATH FUNCTIONS ============

/// Calculate shares to mint for a deposit
/// Returns shares_to_mint
fn calculate_shares_to_mint(
    amount: u128,
    total_staked: u128,
    total_shares: u128
) -> u128 {
    if total_staked == 0 {
        // First deposit: 1:1 ratio
        amount
    } else {
        // Proportional to current pool
        (amount * total_shares) / total_staked
    }
}

/// Calculate tokens to return for a withdrawal (before fees)
/// Returns gross_amount
fn calculate_withdrawal_amount(
    shares_to_burn: u128,
    total_staked: u128,
    total_shares: u128
) -> u128 {
    if total_shares == 0 {
        0
    } else {
        (shares_to_burn * total_staked) / total_shares
    }
}

/// Calculate fee amount
/// fee_bps: 1000 = 10%, 100 = 1%
/// Returns fee_amount
fn calculate_fee(amount: u128, fee_bps: u64) -> u128 {
    (amount * (fee_bps as u128)) / 10000
}

/// Calculate net withdrawal after fee
/// Returns (net_amount, fee_amount)
fn calculate_net_withdrawal(
    shares_to_burn: u128,
    total_staked: u128,
    total_shares: u128,
    fee_bps: u64
) -> (u128, u128) {
    let gross = calculate_withdrawal_amount(shares_to_burn, total_staked, total_shares);
    let fee = calculate_fee(gross, fee_bps);
    (gross - fee, fee)
}

/// Calculate share value scaled by 1e18
/// Returns value per share (1e18 = 1:1 ratio)
fn calculate_share_value(total_staked: u128, total_shares: u128) -> u128 {
    let scale: u128 = 1_000_000_000_000_000_000; // 1e18
    if total_shares == 0 {
        scale // 1:1 ratio when empty
    } else {
        (total_staked * scale) / total_shares
    }
}

// ============ UNIT TESTS ============

#[test]
fn test_first_deposit_1_to_1() {
    // First deposit should mint 1:1
    let shares = calculate_shares_to_mint(1000, 0, 0);
    assert(shares == 1000);
}

#[test]
fn test_proportional_deposit() {
    // Pool has 1000 staked, 1000 shares (1:1)
    // Depositing 500 should mint 500 shares
    let shares = calculate_shares_to_mint(500, 1000, 1000);
    assert(shares == 500);
}

#[test]
fn test_deposit_after_rewards() {
    // Pool has 2000 staked, 1000 shares (2:1 value per share)
    // Depositing 1000 should mint 500 shares
    let shares = calculate_shares_to_mint(1000, 2000, 1000);
    assert(shares == 500);
}

#[test]
fn test_withdrawal_1_to_1() {
    // Pool has 1000 staked, 1000 shares
    // Burning 500 shares should return 500 tokens
    let amount = calculate_withdrawal_amount(500, 1000, 1000);
    assert(amount == 500);
}

#[test]
fn test_withdrawal_after_rewards() {
    // Pool has 2000 staked, 1000 shares (2:1)
    // Burning 500 shares should return 1000 tokens
    let amount = calculate_withdrawal_amount(500, 2000, 1000);
    assert(amount == 1000);
}

#[test]
fn test_fee_calculation_10_percent() {
    // 10% fee (1000 bps) on 1000 tokens = 100 fee
    let fee = calculate_fee(1000, 1000);
    assert(fee == 100);
}

#[test]
fn test_fee_calculation_1_percent() {
    // 1% fee (100 bps) on 1000 tokens = 10 fee
    let fee = calculate_fee(1000, 100);
    assert(fee == 10);
}

#[test]
fn test_fee_calculation_zero() {
    // 0% fee on any amount = 0
    let fee = calculate_fee(1000, 0);
    assert(fee == 0);
}

#[test]
fn test_net_withdrawal_with_fee() {
    // Pool: 1000 staked, 1000 shares, 10% fee
    // Burn 100 shares -> 100 gross, 10 fee, 90 net
    let (net, fee) = calculate_net_withdrawal(100, 1000, 1000, 1000);
    assert(net == 90);
    assert(fee == 10);
}

#[test]
fn test_share_value_1_to_1() {
    // 1000 staked, 1000 shares = 1e18 value per share
    let value = calculate_share_value(1000, 1000);
    assert(value == 1_000_000_000_000_000_000);
}

#[test]
fn test_share_value_2_to_1() {
    // 2000 staked, 1000 shares = 2e18 value per share
    let value = calculate_share_value(2000, 1000);
    assert(value == 2_000_000_000_000_000_000);
}

#[test]
fn test_share_value_empty_pool() {
    // Empty pool should return 1e18 (1:1 default)
    let value = calculate_share_value(0, 0);
    assert(value == 1_000_000_000_000_000_000);
}

#[test]
fn test_deposit_withdraw_roundtrip() {
    // Simulate: deposit 1000, get shares, withdraw all, get back 1000 (no fee)
    let total_staked: u128 = 0;
    let total_shares: u128 = 0;

    // Deposit 1000
    let shares = calculate_shares_to_mint(1000, total_staked, total_shares);
    let new_staked = total_staked + 1000;
    let new_shares = total_shares + shares;

    // Withdraw all shares (no fee)
    let amount = calculate_withdrawal_amount(shares, new_staked, new_shares);
    assert(amount == 1000);
}

#[test]
fn test_rewards_increase_share_value() {
    // Initial: 1000 staked, 1000 shares
    let initial_value = calculate_share_value(1000, 1000);

    // Add 500 rewards (1500 staked, still 1000 shares)
    let after_rewards = calculate_share_value(1500, 1000);

    // Share value should increase by 50%
    assert(after_rewards > initial_value);
    assert(after_rewards == 1_500_000_000_000_000_000);
}

#[test]
fn test_multiple_depositors_fair_share() {
    // User A deposits 1000 first
    let shares_a = calculate_shares_to_mint(1000, 0, 0);
    let staked_1 = 1000;
    let total_shares_1 = shares_a;

    // User B deposits 1000 second
    let shares_b = calculate_shares_to_mint(1000, staked_1, total_shares_1);
    let staked_2 = staked_1 + 1000;
    let total_shares_2 = total_shares_1 + shares_b;

    // Both should have equal shares
    assert(shares_a == shares_b);
    assert(shares_a == 1000);

    // Each should be able to withdraw their original deposit
    let withdraw_a = calculate_withdrawal_amount(shares_a, staked_2, total_shares_2);
    let withdraw_b = calculate_withdrawal_amount(shares_b, staked_2, total_shares_2);

    assert(withdraw_a == 1000);
    assert(withdraw_b == 1000);
}

#[test]
fn test_late_depositor_gets_fewer_shares() {
    // User A deposits 1000, gets 1000 shares
    let shares_a = calculate_shares_to_mint(1000, 0, 0);
    let total_1 = shares_a;

    // Rewards added: now 1500 staked, 1000 shares
    let staked_2: u128 = 1500;

    // User B deposits 1000, should get fewer shares
    let shares_b = calculate_shares_to_mint(1000, staked_2, total_1);

    // B gets ~666 shares (1000 * 1000 / 1500)
    assert(shares_b < shares_a);
    assert(shares_b == 666); // integer division
}

// ============ EDGE CASE TESTS ============

#[test]
fn test_large_numbers() {
    // Test with large but safe staking amounts (1M tokens, no decimals to avoid overflow)
    // Note: In production, would use smaller scale factor or checked math
    let large_amount: u128 = 1_000_000_000_000; // 1 trillion (fits safely)

    // First deposit
    let shares = calculate_shares_to_mint(large_amount, 0, 0);
    assert(shares == large_amount);

    // Share value with smaller scale to avoid overflow
    // At 1:1 ratio, value = (1T * 1e18) / 1T = 1e18 (ok)
    let value = calculate_share_value(large_amount, large_amount);
    assert(value == 1_000_000_000_000_000_000);
}

#[test]
fn test_small_deposit_into_large_pool() {
    // Large pool: 1 billion staked, 1 billion shares (no decimals to avoid overflow)
    let pool_staked: u128 = 1_000_000_000; // 1 billion
    let pool_shares: u128 = 1_000_000_000;

    // Small deposit: 1 unit
    let small_deposit: u128 = 1;

    let shares = calculate_shares_to_mint(small_deposit, pool_staked, pool_shares);
    assert(shares == small_deposit); // 1:1 ratio maintained
}

#[test]
fn test_fee_max_30_percent() {
    // 30% fee (3000 bps) on 1000 tokens = 300 fee
    let fee = calculate_fee(1000, 3000);
    assert(fee == 300);
}

#[test]
fn test_withdrawal_from_empty_pool() {
    // Edge case: shouldn't happen in practice, but ensure no crash
    let amount = calculate_withdrawal_amount(100, 0, 0);
    assert(amount == 0);
}
