// VaultManager.nr - Pool Aggregation and Validator Management
// Aztec v2.1.9 compatible
// Manages 200k AZTEC batching and round-robin validator selection

use dep::aztec::macros::aztec;

#[aztec]
pub contract VaultManager {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Minimum stake per validator (200,000 AZTEC with 18 decimals)
    global MIN_STAKE_AMOUNT: u128 = 200_000_000_000_000_000_000_000; // 200k * 1e18

    // Maximum number of validators we can track
    global MAX_VALIDATORS: u64 = 100;

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Admin address
        admin: PublicMutable<AztecAddress, Context>,

        // Pending pool (deposits waiting to be staked)
        pending_pool: PublicMutable<u128, Context>,

        // Total staked across all validators
        total_staked: PublicMutable<u128, Context>,

        // Liquidity buffer (reserved for immediate withdrawals)
        liquidity_buffer: PublicMutable<u128, Context>,

        // Target liquidity buffer percentage (basis points, 500 = 5%)
        liquidity_buffer_target_bps: PublicMutable<u64, Context>,

        // Validator registry
        validator_count: PublicMutable<u64, Context>,
        validator_addresses: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        validator_active: Map<AztecAddress, PublicMutable<bool, Context>, Context>,
        validator_staked: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        validator_index: Map<AztecAddress, PublicMutable<u64, Context>, Context>,

        // Round-robin selection pointer
        next_validator_index: PublicMutable<u64, Context>,

        // Authorized callers (LiquidStakingCore, keeper bots)
        authorized_callers: Map<AztecAddress, PublicMutable<bool, Context>, Context>,

        // Paused state
        paused: PublicMutable<bool, Context>,

        // Staking token address (AZTEC token)
        staking_token: PublicMutable<AztecAddress, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin: AztecAddress, staking_token: AztecAddress) {
        storage.admin.write(admin);
        storage.staking_token.write(staking_token);
        storage.pending_pool.write(0);
        storage.total_staked.write(0);
        storage.liquidity_buffer.write(0);
        storage.liquidity_buffer_target_bps.write(500); // 5% default
        storage.validator_count.write(0);
        storage.next_validator_index.write(0);
        storage.paused.write(false);

        // Admin is authorized by default
        storage.authorized_callers.at(admin).write(true);
    }

    // ============ DEPOSIT POOL MANAGEMENT ============

    /// Add to pending pool when users deposit
    /// Called by LiquidStakingCore after receiving AZTEC
    #[public]
    fn add_to_pending_pool(amount: u128) {
        assert(!storage.paused.read(), "Vault is paused");

        let caller = context.msg_sender();
        let is_authorized = storage.authorized_callers.at(caller).read();
        assert(is_authorized, "Not authorized");

        let pending = storage.pending_pool.read();
        storage.pending_pool.write(pending + amount);
    }

    /// Check if staking is needed (pool >= 200k threshold)
    #[public]
    #[view]
    fn is_staking_needed() -> pub bool {
        let pending = storage.pending_pool.read();
        pending >= MIN_STAKE_AMOUNT
    }

    /// Get pending pool balance
    #[public]
    #[view]
    fn get_pending_pool() -> pub u128 {
        storage.pending_pool.read()
    }

    /// Execute staking when pool reaches 200k
    /// Called by keeper bot when threshold reached
    /// Returns: (validator_address, amount_staked)
    #[public]
    fn execute_stake() -> pub (AztecAddress, u128) {
        assert(!storage.paused.read(), "Vault is paused");

        let caller = context.msg_sender();
        let is_authorized = storage.authorized_callers.at(caller).read();
        let admin = storage.admin.read();
        assert(caller == admin || is_authorized, "Not authorized");

        let pending = storage.pending_pool.read();
        assert(pending >= MIN_STAKE_AMOUNT, "Pool below threshold");

        // Select next validator using round-robin
        let validator = select_next_validator_internal();

        // Calculate amount to stake (200k batch)
        let stake_amount = MIN_STAKE_AMOUNT;

        // Update pending pool
        storage.pending_pool.write(pending - stake_amount);

        // Update validator staked amount
        let current_staked = storage.validator_staked.at(validator).read();
        storage.validator_staked.at(validator).write(current_staked + stake_amount);

        // Update total staked
        let total = storage.total_staked.read();
        storage.total_staked.write(total + stake_amount);

        // TODO: Call Aztec native staking contract to actually stake
        // AztecStaking::at(STAKING_CONTRACT).stake(validator, stake_amount).call(&mut context);

        (validator, stake_amount)
    }

    /// Execute unstaking from a validator
    /// Called when liquidity is needed for withdrawals
    #[public]
    fn execute_unstake(validator: AztecAddress, amount: u128) {
        assert(!storage.paused.read(), "Vault is paused");

        let caller = context.msg_sender();
        let is_authorized = storage.authorized_callers.at(caller).read();
        let admin = storage.admin.read();
        assert(caller == admin || is_authorized, "Not authorized");

        let is_active = storage.validator_active.at(validator).read();
        assert(is_active, "Validator not active");

        let validator_stake = storage.validator_staked.at(validator).read();
        assert(validator_stake >= amount, "Insufficient stake on validator");

        // Update validator staked amount
        storage.validator_staked.at(validator).write(validator_stake - amount);

        // Update total staked
        let total = storage.total_staked.read();
        storage.total_staked.write(total - amount);

        // TODO: Call Aztec native staking contract to initiate unstaking
        // This will trigger the 7-day unbonding period
        // AztecStaking::at(STAKING_CONTRACT).unstake(validator, amount).call(&mut context);
    }

    // ============ VALIDATOR MANAGEMENT ============

    /// Register a new validator
    #[public]
    fn register_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        let is_already_active = storage.validator_active.at(validator).read();
        assert(!is_already_active, "Validator already registered");

        let count = storage.validator_count.read();
        assert(count < MAX_VALIDATORS, "Max validators reached");

        // Add to validator list
        storage.validator_addresses.at(count).write(validator);
        storage.validator_active.at(validator).write(true);
        storage.validator_staked.at(validator).write(0);
        storage.validator_index.at(validator).write(count);

        // Increment count
        storage.validator_count.write(count + 1);
    }

    /// Deactivate a validator (no new stakes, but existing stake remains)
    #[public]
    fn deactivate_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        let is_active = storage.validator_active.at(validator).read();
        assert(is_active, "Validator not active");

        storage.validator_active.at(validator).write(false);
    }

    /// Reactivate a previously deactivated validator
    #[public]
    fn reactivate_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        // Check validator was previously registered
        let index = storage.validator_index.at(validator).read();
        let stored_addr = storage.validator_addresses.at(index).read();
        assert(stored_addr == validator, "Validator not in registry");

        storage.validator_active.at(validator).write(true);
    }

    /// Internal: Select next validator using round-robin
    fn select_next_validator_internal() -> AztecAddress {
        let count = storage.validator_count.read();
        assert(count > 0, "No validators registered");

        let mut next_index = storage.next_validator_index.read();
        let mut selected = AztecAddress::from_field(0);
        let mut found = false;

        // Find next active validator (round-robin with skip for inactive)
        let mut attempts: u64 = 0;
        for _ in 0..100 {
            if found || attempts >= count {
                break;
            }

            let validator = storage.validator_addresses.at(next_index).read();
            let is_active = storage.validator_active.at(validator).read();

            if is_active {
                selected = validator;
                found = true;
            }

            next_index = (next_index + 1) % count;
            attempts += 1;
        }

        assert(found, "No active validators available");

        // Update next validator index for next time
        storage.next_validator_index.write((next_index + 1) % count);

        selected
    }

    /// Get next validator that would be selected
    #[public]
    #[view]
    fn get_next_validator() -> pub AztecAddress {
        let count = storage.validator_count.read();
        if count == 0 {
            return AztecAddress::from_field(0);
        }

        let next_index = storage.next_validator_index.read();

        // Find next active validator
        let mut current_index = next_index;
        for _ in 0..100 {
            let validator = storage.validator_addresses.at(current_index).read();
            let is_active = storage.validator_active.at(validator).read();

            if is_active {
                return validator;
            }

            current_index = (current_index + 1) % count;
            if current_index == next_index {
                break; // Looped through all
            }
        }

        AztecAddress::from_field(0) // No active validators
    }

    // ============ LIQUIDITY BUFFER MANAGEMENT ============

    /// Add to liquidity buffer (for instant withdrawals)
    #[public]
    fn add_to_liquidity_buffer(amount: u128) {
        let caller = context.msg_sender();
        let is_authorized = storage.authorized_callers.at(caller).read();
        assert(is_authorized, "Not authorized");

        let buffer = storage.liquidity_buffer.read();
        storage.liquidity_buffer.write(buffer + amount);
    }

    /// Withdraw from liquidity buffer
    #[public]
    fn withdraw_from_liquidity_buffer(amount: u128) -> pub u128 {
        let caller = context.msg_sender();
        let is_authorized = storage.authorized_callers.at(caller).read();
        assert(is_authorized, "Not authorized");

        let buffer = storage.liquidity_buffer.read();
        assert(buffer >= amount, "Insufficient liquidity buffer");

        storage.liquidity_buffer.write(buffer - amount);
        amount
    }

    /// Check if liquidity buffer needs refilling
    #[public]
    #[view]
    fn needs_buffer_refill() -> pub bool {
        let total = storage.total_staked.read();
        let pending = storage.pending_pool.read();
        let buffer = storage.liquidity_buffer.read();
        let target_bps = storage.liquidity_buffer_target_bps.read();

        let total_assets = total + pending + buffer;
        if total_assets == 0 {
            return false;
        }

        let target_buffer = (total_assets * (target_bps as u128)) / 10000;
        buffer < target_buffer
    }

    // ============ VIEW FUNCTIONS ============

    /// Get total staked amount
    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked.read()
    }

    /// Get liquidity buffer balance
    #[public]
    #[view]
    fn get_liquidity_buffer() -> pub u128 {
        storage.liquidity_buffer.read()
    }

    /// Get validator count
    #[public]
    #[view]
    fn get_validator_count() -> pub u64 {
        storage.validator_count.read()
    }

    /// Get active validator count
    #[public]
    #[view]
    fn get_active_validator_count() -> pub u64 {
        let count = storage.validator_count.read();
        let mut active: u64 = 0;

        for i in 0..100 {
            if i >= count {
                break;
            }
            let validator = storage.validator_addresses.at(i).read();
            let is_active = storage.validator_active.at(validator).read();
            if is_active {
                active += 1;
            }
        }

        active
    }

    /// Get validator stake
    #[public]
    #[view]
    fn get_validator_stake(validator: AztecAddress) -> pub u128 {
        storage.validator_staked.at(validator).read()
    }

    /// Get validator status
    #[public]
    #[view]
    fn is_validator_active(validator: AztecAddress) -> pub bool {
        storage.validator_active.at(validator).read()
    }

    /// Get vault statistics
    #[public]
    #[view]
    fn get_vault_stats() -> pub (u128, u128, u128, u64) {
        let pending = storage.pending_pool.read();
        let staked = storage.total_staked.read();
        let buffer = storage.liquidity_buffer.read();
        let validators = storage.validator_count.read();

        (pending, staked, buffer, validators)
    }

    /// Check if vault is paused
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    // ============ ADMIN FUNCTIONS ============

    /// Set authorized caller
    #[public]
    fn set_authorized_caller(caller_address: AztecAddress, authorized: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.authorized_callers.at(caller_address).write(authorized);
    }

    /// Set liquidity buffer target
    #[public]
    fn set_liquidity_buffer_target(target_bps: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        assert(target_bps <= 2000, "Target too high (max 20%)");
        storage.liquidity_buffer_target_bps.write(target_bps);
    }

    /// Transfer admin
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.admin.write(new_admin);
        storage.authorized_callers.at(new_admin).write(true);
    }

    /// Emergency pause
    #[public]
    fn set_paused(paused: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.paused.write(paused);
    }
}
