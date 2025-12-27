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
// These tests validate the LiquidStakingCore deposit/withdrawal math

/// Calculate stAZTEC to mint for AZTEC deposit
fn calculate_st_aztec_for_deposit(amount: u128, exchange_rate: u64) -> u128 {
    if exchange_rate == 0 {
        0
    } else {
        (amount * 10000) / (exchange_rate as u128)
    }
}

/// Calculate AZTEC for stAZTEC withdrawal
fn calculate_aztec_for_withdrawal(st_aztec_amount: u128, exchange_rate: u64) -> u128 {
    (st_aztec_amount * (exchange_rate as u128)) / 10000
}

/// Calculate protocol fee
fn calculate_protocol_fee(amount: u128, fee_bps: u64) -> u128 {
    (amount * (fee_bps as u128)) / 10000
}

#[test]
fn test_deposit_at_initial_rate() {
    // Rate 10000 = 1.0, so 100 AZTEC = 100 stAZTEC
    let amount: u128 = 100_000_000_000_000_000_000; // 100 tokens
    let rate: u64 = 10000;
    let st_aztec = calculate_st_aztec_for_deposit(amount, rate);
    assert(st_aztec == amount);
}

#[test]
fn test_deposit_exchange_rate_after_rewards() {
    // Rate 12000 = 1.2, so 120 AZTEC = 100 stAZTEC
    let amount: u128 = 120_000_000_000_000_000_000; // 120 tokens
    let rate: u64 = 12000;
    let st_aztec = calculate_st_aztec_for_deposit(amount, rate);
    assert(st_aztec == 100_000_000_000_000_000_000);
}

#[test]
fn test_withdrawal_at_initial_rate() {
    // Rate 10000 = 1.0, so 100 stAZTEC = 100 AZTEC
    let st_aztec: u128 = 100_000_000_000_000_000_000;
    let rate: u64 = 10000;
    let aztec = calculate_aztec_for_withdrawal(st_aztec, rate);
    assert(aztec == st_aztec);
}

#[test]
fn test_withdrawal_exchange_rate_after_rewards() {
    // Rate 12000 = 1.2, so 100 stAZTEC = 120 AZTEC
    let st_aztec: u128 = 100_000_000_000_000_000_000;
    let rate: u64 = 12000;
    let aztec = calculate_aztec_for_withdrawal(st_aztec, rate);
    assert(aztec == 120_000_000_000_000_000_000);
}

#[test]
fn test_protocol_fee_10_percent() {
    // 10% fee (1000 bps) on 1000 AZTEC
    let amount: u128 = 1000_000_000_000_000_000_000; // 1000 tokens
    let fee = calculate_protocol_fee(amount, 1000);
    assert(fee == 100_000_000_000_000_000_000); // 100 tokens
}

#[test]
fn test_protocol_fee_5_percent() {
    // 5% fee (500 bps) on 1000 AZTEC
    let amount: u128 = 1000_000_000_000_000_000_000;
    let fee = calculate_protocol_fee(amount, 500);
    assert(fee == 50_000_000_000_000_000_000); // 50 tokens
}

#[test]
fn test_deposit_withdrawal_roundtrip() {
    // Deposit AZTEC, then withdraw, should get back same amount (no fee)
    let deposit_amount: u128 = 1000_000_000_000_000_000_000;
    let rate: u64 = 10000;
    
    let st_aztec = calculate_st_aztec_for_deposit(deposit_amount, rate);
    let aztec_back = calculate_aztec_for_withdrawal(st_aztec, rate);
    
    assert(aztec_back == deposit_amount);
}

#[test]
fn test_rate_increase_benefits_early_stakers() {
    // User deposits at rate 10000, rate increases to 12000
    let deposit: u128 = 100_000_000_000_000_000_000;
    let initial_rate: u64 = 10000;
    let new_rate: u64 = 12000;
    
    // Get stAZTEC at initial rate
    let st_aztec = calculate_st_aztec_for_deposit(deposit, initial_rate);
    assert(st_aztec == 100_000_000_000_000_000_000);
    
    // Withdraw at new rate
    let aztec_out = calculate_aztec_for_withdrawal(st_aztec, new_rate);
    assert(aztec_out == 120_000_000_000_000_000_000);
    
    // Profit!
    assert(aztec_out > deposit);
}

// ============ VAULT MANAGER TESTS ============
// These tests validate round-robin and stake distribution math

#[test]
fn test_batch_size_constant() {
    // Verify 200k batch size is correct
    let batch_size: u128 = 200_000_000_000_000_000_000_000;
    let expected: u128 = 200000 * 1_000_000_000_000_000_000;
    assert(batch_size == expected);
}

#[test]
fn test_round_robin_with_3_validators() {
    let count: u32 = 3;
    let mut index: u32 = 0;
    
    // First selection: validator 0, next becomes 1
    index = (index + 1) % count;
    assert(index == 1);
    
    // Second selection: validator 1, next becomes 2
    index = (index + 1) % count;
    assert(index == 2);
    
    // Third selection: validator 2, next becomes 0
    index = (index + 1) % count;
    assert(index == 0);
}

#[test]
fn test_average_stake_calculation() {
    let total_staked: u128 = 600_000_000_000_000_000_000_000; // 600k
    let active_count: u32 = 3;
    let average = total_staked / (active_count as u128);
    assert(average == 200_000_000_000_000_000_000_000); // 200k each
}

#[test]
fn test_stake_distribution_even() {
    // 3 validators with 200k each = 600k total
    let stakes: [u128; 3] = [
        200_000_000_000_000_000_000_000,
        200_000_000_000_000_000_000_000,
        200_000_000_000_000_000_000_000
    ];
    
    let total: u128 = stakes[0] + stakes[1] + stakes[2];
    assert(total == 600_000_000_000_000_000_000_000);
}

// ============ REWARDS MANAGER TESTS ============
// These tests validate exchange rate and reward distribution math

/// Calculate exchange rate: (backing * 10000) / supply
fn calculate_exchange_rate(backing: u128, supply: u128) -> u64 {
    if supply == 0 {
        10000
    } else {
        let rate = (backing * 10000) / supply;
        rate as u64
    }
}

#[test]
fn test_initial_exchange_rate() {
    let rate = calculate_exchange_rate(0, 0);
    assert(rate == 10000);
}

#[test]
fn test_exchange_rate_1_to_1() {
    // 1000 AZTEC backs 1000 stAZTEC = rate 10000
    let backing: u128 = 1000_000_000_000_000_000_000;
    let supply: u128 = 1000_000_000_000_000_000_000;
    let rate = calculate_exchange_rate(backing, supply);
    assert(rate == 10000);
}

#[test]
fn test_exchange_rate_after_rewards() {
    // 1200 AZTEC backs 1000 stAZTEC = rate 12000
    let backing: u128 = 1200_000_000_000_000_000_000;
    let supply: u128 = 1000_000_000_000_000_000_000;
    let rate = calculate_exchange_rate(backing, supply);
    assert(rate == 12000);
}

#[test]
fn test_reward_distribution() {
    // 100 AZTEC rewards, 10% fee = 90 net, 10 fee
    let gross_rewards: u128 = 100_000_000_000_000_000_000;
    let fee_bps: u64 = 1000;
    let fee = calculate_protocol_fee(gross_rewards, fee_bps);
    let net = gross_rewards - fee;
    
    assert(fee == 10_000_000_000_000_000_000);
    assert(net == 90_000_000_000_000_000_000);
}

#[test]
fn test_rate_always_increases() {
    // Simulate rate check logic
    let current_rate: u64 = 10000;
    let new_rate: u64 = 9500; // Lower rate (shouldn't happen)
    
    // Final rate should be max(current, new)
    let final_rate = if new_rate > current_rate { new_rate } else { current_rate };
    assert(final_rate == 10000);
}

#[test]
fn test_rate_increases_with_rewards() {
    let current_rate: u64 = 10000;
    let new_rate: u64 = 10500; // Higher rate after rewards
    
    let final_rate = if new_rate > current_rate { new_rate } else { current_rate };
    assert(final_rate == 10500);
}

#[test]
fn test_apy_calculation() {
    // Daily rewards of 0.0219% = ~8% APY
    // epoch_rewards = 219 basis points per day
    let backing: u128 = 1_000_000_000_000_000_000_000_000; // 1M
    let daily_rewards: u128 = 219_000_000_000_000_000_000; // 219 tokens
    
    // Daily rate in bps: (219 * 10000) / 1M = 2.19 bps
    let daily_rate_bps = (daily_rewards * 10000) / backing;
    
    // Annual rate: 2.19 * 365 = ~800 bps = 8%
    let annual_rate_bps = daily_rate_bps * 365;
    
    // Should be approximately 800 (8%)
    assert(annual_rate_bps > 700);
    assert(annual_rate_bps < 900);
}

// ============ INTEGRATION SCENARIO TESTS ============
// These tests validate full deposit->stake->rewards->withdraw flows

#[test]
fn test_full_staking_scenario() {
    // Scenario: 10 users deposit 20k each = 200k total (1 batch)
    // After some time, 8% APY rewards accumulate
    
    // Initial state
    let mut total_backing: u128 = 0;
    let mut total_supply: u128 = 0;
    let initial_rate: u64 = 10000;
    
    // 10 users deposit 20k each
    let deposit_per_user: u128 = 20_000_000_000_000_000_000_000; // 20k
    for _i in 0..10 {
        let st_aztec = calculate_st_aztec_for_deposit(deposit_per_user, initial_rate);
        total_backing = total_backing + deposit_per_user;
        total_supply = total_supply + st_aztec;
    }
    
    assert(total_backing == 200_000_000_000_000_000_000_000); // 200k
    assert(total_supply == 200_000_000_000_000_000_000_000);
    
    // Rewards: ~8% APY annual, simulate 1 year
    // 200k * 0.08 = 16k rewards
    let gross_rewards: u128 = 16_000_000_000_000_000_000_000; // 16k
    let protocol_fee = calculate_protocol_fee(gross_rewards, 1000); // 10%
    let net_rewards = gross_rewards - protocol_fee;
    
    total_backing = total_backing + net_rewards;
    
    // New exchange rate
    let new_rate = calculate_exchange_rate(total_backing, total_supply);
    
    // Rate should be higher than initial
    assert(new_rate > initial_rate);
    
    // Each user's 20k stAZTEC is now worth more AZTEC
    let user_st_aztec: u128 = 20_000_000_000_000_000_000_000;
    let user_aztec_out = calculate_aztec_for_withdrawal(user_st_aztec, new_rate);
    
    // User should get more than they deposited
    assert(user_aztec_out > deposit_per_user);
}

#[test]
fn test_late_depositor_fair_treatment() {
    // Early user deposits 100k at rate 10000
    let early_deposit: u128 = 100_000_000_000_000_000_000_000;
    let mut backing: u128 = early_deposit;
    let early_st_aztec = calculate_st_aztec_for_deposit(early_deposit, 10000);
    let mut supply: u128 = early_st_aztec;
    
    // Rewards add 10k (rate increases)
    let rewards: u128 = 10_000_000_000_000_000_000_000;
    backing = backing + rewards;
    
    let new_rate = calculate_exchange_rate(backing, supply);
    assert(new_rate == 11000); // 110k backing / 100k supply = 1.1
    
    // Late user deposits 110k at rate 11000
    let late_deposit: u128 = 110_000_000_000_000_000_000_000;
    let late_st_aztec = calculate_st_aztec_for_deposit(late_deposit, new_rate);
    
    // Late user gets 100k stAZTEC (110k * 10000 / 11000)
    assert(late_st_aztec == 100_000_000_000_000_000_000_000);
    
    // Both users now have equal stAZTEC (fair!)
    assert(early_st_aztec == late_st_aztec);
}

#[test]
fn test_withdrawal_during_unbonding() {
    // User requests withdrawal, checks time logic
    let request_time: u64 = 1000000;
    let unbonding_period: u64 = 604800; // 7 days
    let claimable_at = request_time + unbonding_period;
    
    // Before unbonding complete
    let check_time_1: u64 = 1000000 + 300000; // ~3.5 days
    let is_claimable_1 = check_time_1 >= claimable_at;
    assert(!is_claimable_1);
    
    // After unbonding complete
    let check_time_2: u64 = 1000000 + 700000; // ~8 days
    let is_claimable_2 = check_time_2 >= claimable_at;
    assert(is_claimable_2);
}

// ============ CROSS-CONTRACT FLOW TESTS ============
// These tests validate the complete data flow through all contracts

/// Simulates the full deposit flow:
/// 1. User calls LiquidStakingCore.deposit
/// 2. LiquidStakingCore calls Token.transfer_in_public (pull AZTEC)
/// 3. LiquidStakingCore calls StakedAztecToken.mint (create stAZTEC)
/// 4. State is updated in all contracts
#[test]
fn test_deposit_flow_state_transitions() {
    // Initial state
    let mut core_pending_pool: u128 = 0;
    let mut core_total_deposited: u128 = 0;
    let mut token_total_supply: u128 = 0;
    let exchange_rate: u64 = 10000;
    
    // User deposits 100 AZTEC
    let deposit_amount: u128 = 100_000_000_000_000_000_000; // 100 * 1e18
    
    // Step 1: Calculate stAZTEC to mint
    let st_aztec_to_mint = calculate_st_aztec_for_deposit(deposit_amount, exchange_rate);
    assert(st_aztec_to_mint == deposit_amount); // 1:1 at initial rate
    
    // Step 2: Update LiquidStakingCore state
    core_pending_pool = core_pending_pool + deposit_amount;
    core_total_deposited = core_total_deposited + deposit_amount;
    
    // Step 3: Update StakedAztecToken state (after mint call)
    token_total_supply = token_total_supply + st_aztec_to_mint;
    
    // Verify final state
    assert(core_pending_pool == deposit_amount);
    assert(core_total_deposited == deposit_amount);
    assert(token_total_supply == st_aztec_to_mint);
}

/// Simulates the withdrawal request flow:
/// 1. User calls LiquidStakingCore.request_withdrawal
/// 2. LiquidStakingCore calls StakedAztecToken.burn (destroy stAZTEC)
/// 3. LiquidStakingCore calls WithdrawalQueue.add_request (queue withdrawal)
/// 4. After unbonding, user calls WithdrawalQueue.claim_withdrawal
/// 5. WithdrawalQueue calls Token.transfer (send AZTEC)
#[test]
fn test_withdrawal_flow_state_transitions() {
    // Initial state: User has 100 stAZTEC
    let user_st_aztec: u128 = 100_000_000_000_000_000_000;
    let mut token_total_supply: u128 = user_st_aztec;
    let mut queue_total_pending: u128 = 0;
    let exchange_rate: u64 = 12000; // 1.2 after some rewards
    
    // Step 1: Calculate AZTEC to withdraw
    let aztec_amount = calculate_aztec_for_withdrawal(user_st_aztec, exchange_rate);
    assert(aztec_amount == 120_000_000_000_000_000_000); // 120 AZTEC
    
    // Step 2: Burn stAZTEC
    token_total_supply = token_total_supply - user_st_aztec;
    assert(token_total_supply == 0);
    
    // Step 3: Add to withdrawal queue
    queue_total_pending = queue_total_pending + aztec_amount;
    assert(queue_total_pending == aztec_amount);
    
    // Step 4: Claim (after unbonding)
    // This would transfer AZTEC to user and update queue
    queue_total_pending = queue_total_pending - aztec_amount;
    assert(queue_total_pending == 0);
}

/// Simulates the batch staking flow:
/// 1. Multiple users deposit, pending_pool grows
/// 2. When pending_pool >= 200k, keeper triggers batch
/// 3. VaultManager selects validator via round-robin
/// 4. VaultManager records stake and calls LiquidStakingCore.notify_staked
/// 5. LiquidStakingCore moves funds from pending to staked
#[test]
fn test_batch_staking_flow() {
    let batch_size: u128 = 200_000_000_000_000_000_000_000; // 200k
    let mut pending_pool: u128 = 0;
    let mut staked_to_validators: u128 = 0;
    let mut vault_total_staked: u128 = 0;
    
    // 10 users deposit 20k each = 200k total
    let deposit_per_user: u128 = 20_000_000_000_000_000_000_000;
    for _i in 0..10 {
        pending_pool = pending_pool + deposit_per_user;
    }
    assert(pending_pool == batch_size);
    assert(pending_pool >= batch_size); // Ready for batching!
    
    // Keeper triggers batch stake
    // VaultManager.record_stake updates vault_total_staked
    vault_total_staked = vault_total_staked + batch_size;
    
    // LiquidStakingCore.notify_staked moves from pending to staked
    pending_pool = pending_pool - batch_size;
    staked_to_validators = staked_to_validators + batch_size;
    
    // Verify final state
    assert(pending_pool == 0);
    assert(staked_to_validators == batch_size);
    assert(vault_total_staked == batch_size);
}

/// Simulates the rewards distribution flow:
/// 1. Keeper claims rewards from validators
/// 2. RewardsManager.process_rewards calculates fees
/// 3. RewardsManager calls LiquidStakingCore.add_rewards
/// 4. RewardsManager calls StakedAztecToken.update_exchange_rate
/// 5. Exchange rate increases, stAZTEC worth more AZTEC
#[test]
fn test_rewards_distribution_flow() {
    // Initial state
    let mut total_backing: u128 = 1_000_000_000_000_000_000_000_000; // 1M AZTEC
    let mut total_supply: u128 = 1_000_000_000_000_000_000_000_000; // 1M stAZTEC
    let mut exchange_rate: u64 = 10000; // 1:1
    let protocol_fee_bps: u64 = 1000; // 10%
    
    // Rewards claimed: 80k AZTEC (8% annual)
    let gross_rewards: u128 = 80_000_000_000_000_000_000_000;
    
    // Step 1: Calculate protocol fee
    let protocol_fee = calculate_protocol_fee(gross_rewards, protocol_fee_bps);
    assert(protocol_fee == 8_000_000_000_000_000_000_000); // 8k
    
    let net_rewards = gross_rewards - protocol_fee;
    assert(net_rewards == 72_000_000_000_000_000_000_000); // 72k
    
    // Step 2: Add net rewards to backing
    total_backing = total_backing + net_rewards;
    assert(total_backing == 1_072_000_000_000_000_000_000_000);
    
    // Step 3: Calculate new exchange rate
    let new_rate = calculate_exchange_rate(total_backing, total_supply);
    assert(new_rate == 10720); // 1.072
    
    // Step 4: Verify rate only increases
    assert(new_rate > exchange_rate);
    exchange_rate = new_rate;
    
    // Step 5: Verify user benefits
    let user_st_aztec: u128 = 100_000_000_000_000_000_000; // 100 stAZTEC
    let user_aztec_value = calculate_aztec_for_withdrawal(user_st_aztec, exchange_rate);
    // 100 * 10720 / 10000 = 107.2 AZTEC
    assert(user_aztec_value == 107_200_000_000_000_000_000);
}

/// Simulates multiple deposits and withdrawals with varying rates
#[test]
fn test_mixed_operations_flow() {
    // Initial state
    let mut backing: u128 = 0;
    let mut supply: u128 = 0;
    let mut rate: u64 = 10000;
    
    // User A deposits 1000 at rate 10000
    let deposit_a: u128 = 1000_000_000_000_000_000_000;
    let st_aztec_a = calculate_st_aztec_for_deposit(deposit_a, rate);
    backing = backing + deposit_a;
    supply = supply + st_aztec_a;
    assert(st_aztec_a == deposit_a);
    
    // Rewards add 100 (10%)
    let rewards: u128 = 100_000_000_000_000_000_000;
    backing = backing + rewards;
    rate = calculate_exchange_rate(backing, supply);
    assert(rate == 11000);
    
    // User B deposits 1100 at rate 11000
    let deposit_b: u128 = 1100_000_000_000_000_000_000;
    let st_aztec_b = calculate_st_aztec_for_deposit(deposit_b, rate);
    backing = backing + deposit_b;
    supply = supply + st_aztec_b;
    assert(st_aztec_b == 1000_000_000_000_000_000_000); // Gets same stAZTEC as A
    
    // User A withdraws half
    let withdraw_a = st_aztec_a / 2;
    let aztec_out_a = calculate_aztec_for_withdrawal(withdraw_a, rate);
    // 500 stAZTEC * 11000 / 10000 = 550 AZTEC
    assert(aztec_out_a == 550_000_000_000_000_000_000);
    
    // User A profits: deposited 500 worth, gets 550 back
    assert(aztec_out_a > deposit_a / 2);
}

/// Test fee accumulation and collection flow
#[test]
fn test_fee_collection_flow() {
    let fee_bps: u64 = 1000; // 10%
    let mut accumulated_fees: u128 = 0;
    
    // Process 3 reward events
    let rewards_1: u128 = 100_000_000_000_000_000_000;
    let rewards_2: u128 = 200_000_000_000_000_000_000;
    let rewards_3: u128 = 150_000_000_000_000_000_000;
    
    accumulated_fees = accumulated_fees + calculate_protocol_fee(rewards_1, fee_bps);
    accumulated_fees = accumulated_fees + calculate_protocol_fee(rewards_2, fee_bps);
    accumulated_fees = accumulated_fees + calculate_protocol_fee(rewards_3, fee_bps);
    
    // Total fees: (100 + 200 + 150) * 10% = 45
    assert(accumulated_fees == 45_000_000_000_000_000_000);
    
    // Collect fees (transfers to treasury)
    let collected = accumulated_fees;
    accumulated_fees = 0;
    
    assert(collected == 45_000_000_000_000_000_000);
    assert(accumulated_fees == 0);
}

/// Test validator round-robin selection
#[test]
fn test_validator_selection_flow() {
    // Simulate 5 validators, select 7 times
    let validator_count: u32 = 5;
    let mut next_index: u32 = 0;
    let mut selections: [u32; 7] = [0, 0, 0, 0, 0, 0, 0];
    
    for i in 0..7 {
        selections[i] = next_index;
        next_index = (next_index + 1) % validator_count;
    }
    
    // Verify round-robin pattern: 0, 1, 2, 3, 4, 0, 1
    assert(selections[0] == 0);
    assert(selections[1] == 1);
    assert(selections[2] == 2);
    assert(selections[3] == 3);
    assert(selections[4] == 4);
    assert(selections[5] == 0);
    assert(selections[6] == 1);
}

/// Test complete deposit->batch->rewards->withdraw cycle
#[test]
fn test_complete_lifecycle() {
    // === SETUP ===
    let batch_size: u128 = 200_000_000_000_000_000_000_000; // 200k
    let user_deposit: u128 = 200_000_000_000_000_000_000_000; // 200k
    let mut exchange_rate: u64 = 10000;
    let fee_bps: u64 = 1000;
    
    // State tracking
    let mut pending_pool: u128 = 0;
    let mut staked: u128 = 0;
    let mut user_st_aztec: u128 = 0;
    let mut backing: u128 = 0;
    let mut supply: u128 = 0;
    
    // === PHASE 1: DEPOSIT ===
    let st_aztec_minted = calculate_st_aztec_for_deposit(user_deposit, exchange_rate);
    pending_pool = pending_pool + user_deposit;
    user_st_aztec = user_st_aztec + st_aztec_minted;
    backing = backing + user_deposit;
    supply = supply + st_aztec_minted;
    
    assert(pending_pool == batch_size);
    assert(user_st_aztec == user_deposit);
    
    // === PHASE 2: BATCH STAKE ===
    assert(pending_pool >= batch_size);
    pending_pool = pending_pool - batch_size;
    staked = staked + batch_size;
    
    assert(pending_pool == 0);
    assert(staked == batch_size);
    
    // === PHASE 3: REWARDS (after 1 year at 8% APY) ===
    let gross_rewards = (staked * 8) / 100; // 8% of 200k = 16k
    let fee = calculate_protocol_fee(gross_rewards, fee_bps);
    let net_rewards = gross_rewards - fee;
    
    backing = backing + net_rewards;
    exchange_rate = calculate_exchange_rate(backing, supply);
    
    // Rate should be ~1.072 (10720)
    assert(exchange_rate > 10000);
    assert(exchange_rate < 11000);
    
    // === PHASE 4: WITHDRAW ===
    let aztec_out = calculate_aztec_for_withdrawal(user_st_aztec, exchange_rate);
    
    // User should get more than deposited
    assert(aztec_out > user_deposit);
    
    // Profit is approximately 7.2% (8% - 10% protocol fee on 8% = 7.2%)
    // 200k * 1.072 = 214.4k
    let expected_min = user_deposit + ((user_deposit * 7) / 100); // At least 7%
    assert(aztec_out >= expected_min);
}
