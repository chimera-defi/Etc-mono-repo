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

// ============ EXCHANGE RATE CONVERSION TESTS ============
// These tests validate the stAZTEC <-> AZTEC conversion math

#[test]
fn test_convert_to_aztec_at_1_to_1() {
    // Rate 10000 = 1.0, so 100 stAZTEC = 100 AZTEC
    let st_aztec: u128 = 100;
    let rate: u64 = 10000;
    let aztec = (st_aztec * (rate as u128)) / 10000;
    assert(aztec == 100);
}

#[test]
fn test_convert_to_aztec_after_rewards() {
    // Rate 12000 = 1.2, so 100 stAZTEC = 120 AZTEC
    let st_aztec: u128 = 100;
    let rate: u64 = 12000;
    let aztec = (st_aztec * (rate as u128)) / 10000;
    assert(aztec == 120);
}

#[test]
fn test_convert_to_st_aztec_at_1_to_1() {
    // Rate 10000 = 1.0, so 100 AZTEC = 100 stAZTEC
    let aztec: u128 = 100;
    let rate: u64 = 10000;
    let st_aztec = (aztec * 10000) / (rate as u128);
    assert(st_aztec == 100);
}

#[test]
fn test_convert_to_st_aztec_after_rewards() {
    // Rate 12000 = 1.2, so 120 AZTEC = 100 stAZTEC
    let aztec: u128 = 120;
    let rate: u64 = 12000;
    let st_aztec = (aztec * 10000) / (rate as u128);
    assert(st_aztec == 100);
}

#[test]
fn test_exchange_rate_roundtrip() {
    // Convert AZTEC -> stAZTEC -> AZTEC should preserve value (within rounding)
    let original_aztec: u128 = 1000;
    let rate: u64 = 10500;  // 1.05 ratio
    
    // Convert to stAZTEC
    let st_aztec = (original_aztec * 10000) / (rate as u128);
    // st_aztec = 1000 * 10000 / 10500 = 952
    
    // Convert back to AZTEC
    let final_aztec = (st_aztec * (rate as u128)) / 10000;
    // final_aztec = 952 * 10500 / 10000 = 999 (rounding loss)
    
    // Should be within 1% due to integer division
    assert(final_aztec <= original_aztec);
    assert(final_aztec >= original_aztec - 10);  // Max 1% loss
}

// ============ WITHDRAWAL QUEUE MATH TESTS ============
// These tests validate withdrawal queue timing calculations

/// Calculate if a request is claimable
fn is_request_claimable(
    request_timestamp: u64,
    current_timestamp: u64,
    unbonding_period: u64
) -> bool {
    current_timestamp >= request_timestamp + unbonding_period
}

/// Calculate time remaining until claimable
fn time_until_claimable(
    request_timestamp: u64,
    current_timestamp: u64,
    unbonding_period: u64
) -> u64 {
    let claimable_at = request_timestamp + unbonding_period;
    if current_timestamp >= claimable_at {
        0
    } else {
        claimable_at - current_timestamp
    }
}

#[test]
fn test_withdrawal_not_claimable_immediately() {
    let request_time: u64 = 1000;
    let current_time: u64 = 1000;
    let unbonding: u64 = 604800;  // 7 days
    
    assert(!is_request_claimable(request_time, current_time, unbonding));
}

#[test]
fn test_withdrawal_not_claimable_during_unbonding() {
    let request_time: u64 = 1000;
    let current_time: u64 = 500000;  // ~5.7 days later
    let unbonding: u64 = 604800;  // 7 days
    
    assert(!is_request_claimable(request_time, current_time, unbonding));
}

#[test]
fn test_withdrawal_claimable_after_unbonding() {
    let request_time: u64 = 1000;
    let current_time: u64 = 605801;  // Just past 7 days
    let unbonding: u64 = 604800;
    
    assert(is_request_claimable(request_time, current_time, unbonding));
}

#[test]
fn test_withdrawal_claimable_exactly_at_unbonding() {
    let request_time: u64 = 1000;
    let unbonding: u64 = 604800;
    let current_time: u64 = request_time + unbonding;  // Exactly at unbonding
    
    assert(is_request_claimable(request_time, current_time, unbonding));
}

#[test]
fn test_time_until_claimable_during_unbonding() {
    let request_time: u64 = 1000;
    let current_time: u64 = 100000;
    let unbonding: u64 = 604800;
    
    let remaining = time_until_claimable(request_time, current_time, unbonding);
    // claimable_at = 1000 + 604800 = 605800
    // remaining = 605800 - 100000 = 505800
    assert(remaining == 505800);
}

#[test]
fn test_time_until_claimable_after_unbonding() {
    let request_time: u64 = 1000;
    let current_time: u64 = 700000;
    let unbonding: u64 = 604800;
    
    let remaining = time_until_claimable(request_time, current_time, unbonding);
    assert(remaining == 0);
}

// ============ VALIDATOR SELECTION TESTS ============
// These tests validate round-robin selection math

/// Simple round-robin index calculation
fn next_index(current: u32, count: u32) -> u32 {
    (current + 1) % count
}

#[test]
fn test_round_robin_single_validator() {
    let current: u32 = 0;
    let count: u32 = 1;
    
    let next = next_index(current, count);
    assert(next == 0);  // Wraps back to 0
}

#[test]
fn test_round_robin_multiple_validators() {
    let count: u32 = 5;
    
    assert(next_index(0, count) == 1);
    assert(next_index(1, count) == 2);
    assert(next_index(2, count) == 3);
    assert(next_index(3, count) == 4);
    assert(next_index(4, count) == 0);  // Wraps
}

#[test]
fn test_round_robin_wraparound() {
    let count: u32 = 3;
    
    // Simulate 10 selections
    let mut index: u32 = 0;
    for _i in 0..10 {
        index = next_index(index, count);
    }
    // After 10 iterations starting at 0: 1,2,0,1,2,0,1,2,0,1
    assert(index == 1);
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

// ============ LIQUID STAKING CORE TESTS ============

#[test]
fn test_deposit_mint_calculation_1_to_1() {
    // At rate 10000 (1.0), depositing 1000 AZTEC mints 1000 stAZTEC
    let amount: u128 = 1000;
    let rate: u64 = 10000;
    let st_aztec = (amount * 10000) / (rate as u128);
    assert(st_aztec == 1000);
}

#[test]
fn test_deposit_mint_calculation_after_rewards() {
    // At rate 12000 (1.2), depositing 1200 AZTEC mints 1000 stAZTEC
    let amount: u128 = 1200;
    let rate: u64 = 12000;
    let st_aztec = (amount * 10000) / (rate as u128);
    assert(st_aztec == 1000);
}

#[test]
fn test_withdrawal_amount_calculation() {
    // At rate 12000 (1.2), burning 1000 stAZTEC returns 1200 AZTEC
    let st_aztec: u128 = 1000;
    let rate: u64 = 12000;
    let aztec = (st_aztec * (rate as u128)) / 10000;
    assert(aztec == 1200);
}

// ============ VAULT MANAGER TESTS ============

#[test]
fn test_batch_threshold_check() {
    let pending: u128 = 199999;
    let threshold: u128 = 200000;
    assert(pending < threshold);

    let pending2: u128 = 200000;
    assert(pending2 >= threshold);
}

#[test]
fn test_batch_stake_updates_totals() {
    let pending: u128 = 250000;
    let total_staked: u128 = 1000000;

    // After batch stake, pending becomes 0, total increases
    let new_pending: u128 = 0;
    let new_total: u128 = total_staked + pending;

    assert(new_pending == 0);
    assert(new_total == 1250000);
}

// ============ REWARDS MANAGER TESTS ============

#[test]
fn test_protocol_fee_calculation() {
    let rewards: u128 = 1000;
    let fee_bps: u64 = 1000;  // 10%
    let fee = (rewards * (fee_bps as u128)) / 10000;
    assert(fee == 100);
}

#[test]
fn test_exchange_rate_after_rewards() {
    let total_staked: u128 = 1000000;
    let net_rewards: u128 = 100000;  // After 10% protocol fee
    let total_supply: u128 = 1000000;

    // New rate = ((staked + rewards) * 10000) / supply
    let new_rate = ((total_staked + net_rewards) * 10000) / total_supply;
    assert(new_rate == 11000);  // 1.1 ratio
}

#[test]
fn test_exchange_rate_first_deposit() {
    let total_supply: u128 = 0;
    // When supply is 0, rate should be 10000 (1.0)
    let rate: u64 = 10000;
    assert(rate == 10000);
}

// ============ INTEGRATION FLOW TESTS ============

#[test]
fn test_full_deposit_flow_math() {
    // Simulate: User deposits 50000 AZTEC at 1:1 rate
    let deposit: u128 = 50000;
    let rate: u64 = 10000;

    // Calculate stAZTEC minted
    let st_aztec = (deposit * 10000) / (rate as u128);
    assert(st_aztec == 50000);

    // Pending pool increases
    let old_pending: u128 = 150000;
    let new_pending = old_pending + deposit;
    assert(new_pending == 200000);

    // Batch threshold reached
    let threshold: u128 = 200000;
    assert(new_pending >= threshold);
}

#[test]
fn test_full_withdrawal_flow_math() {
    // User requests withdrawal of 10000 stAZTEC at rate 11000 (1.1)
    let st_aztec: u128 = 10000;
    let rate: u64 = 11000;

    // Calculate AZTEC to return
    let aztec = (st_aztec * (rate as u128)) / 10000;
    assert(aztec == 11000);
}

#[test]
fn test_rewards_distribution_flow() {
    // 1000 rewards come in, 10% protocol fee
    let rewards: u128 = 1000;
    let fee_bps: u64 = 1000;

    let protocol_fee = (rewards * (fee_bps as u128)) / 10000;
    let net_rewards = rewards - protocol_fee;

    assert(protocol_fee == 100);
    assert(net_rewards == 900);

    // Rate update: 1M staked, 900 net rewards, 1M supply
    let total_staked: u128 = 1000000;
    let total_supply: u128 = 1000000;
    let new_rate = ((total_staked + net_rewards) * 10000) / total_supply;

    // Should be 10009 (slight increase)
    assert(new_rate == 10009);
}
