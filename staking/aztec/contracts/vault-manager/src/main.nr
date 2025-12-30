// VaultManager Contract - Batch Pooling and Validator Selection
// TASK-108 implementation
//
// This contract manages:
// - 200k AZTEC batch pooling before staking
// - Round-robin validator selection
// - Stake distribution across validators
// - Integration with ValidatorRegistry
// - Cross-contract calls to LiquidStakingCore.notify_staked
//
// Key features:
// - Ensures fair distribution across active validators
// - Tracks stake per validator
// - Provides next validator selection for keeper bots

use dep::aztec::macros::aztec;

#[aztec]
pub contract VaultManager {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::protocol_types::abis::function_selector::FunctionSelector;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Minimum stake batch size (200,000 AZTEC in wei)
    global BATCH_SIZE: u128 = 200_000_000_000_000_000_000_000; // 200k * 1e18
    
    // Maximum validators supported
    global MAX_VALIDATORS: u32 = 100;

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Validator tracking
        validator_count: PublicMutable<u32, Context>,
        active_validator_count: PublicMutable<u32, Context>,
        
        // Validator list (index -> address)
        validators: Map<u32, PublicMutable<AztecAddress, Context>, Context>,
        
        // Reverse lookup (address -> index)
        validator_index: Map<AztecAddress, PublicMutable<u32, Context>, Context>,
        
        // Validator active status (address -> bool)
        validator_active: Map<AztecAddress, PublicMutable<bool, Context>, Context>,
        
        // Stake tracking (address -> amount)
        stake_per_validator: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        
        // Total stake across all validators
        total_staked: PublicMutable<u128, Context>,
        
        // Round-robin selection state
        next_validator_index: PublicMutable<u32, Context>,
        
        // Batch tracking
        batches_processed: PublicMutable<u64, Context>,
        
        // Contract references
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        validator_registry: PublicMutable<AztecAddress, Context>,
        
        // Access control
        admin: PublicMutable<AztecAddress, Context>,
        keeper: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        storage.admin.write(admin_);
        storage.validator_count.write(0);
        storage.active_validator_count.write(0);
        storage.next_validator_index.write(0);
        storage.total_staked.write(0);
        storage.batches_processed.write(0);
        storage.paused.write(false);
    }

    // ============ ADMIN CONFIGURATION ============
    #[public]
    fn set_liquid_staking_core(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.liquid_staking_core.write(address);
    }
    
    #[public]
    fn set_validator_registry(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.validator_registry.write(address);
    }
    
    #[public]
    fn set_keeper(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.keeper.write(address);
    }
    
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.admin.write(new_admin);
    }
    
    #[public]
    fn set_paused(paused_: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.paused.write(paused_);
    }

    // ============ VALIDATOR MANAGEMENT ============
    
    /// Register a new validator
    /// Only admin can add validators
    ///
    /// @param validator Address of the validator
    #[public]
    fn register_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can register validators");
        assert(!storage.paused.read(), "Contract is paused");
        
        let count = storage.validator_count.read();
        assert(count < MAX_VALIDATORS, "Maximum validators reached");
        
        // Check not already registered
        let existing_active = storage.validator_active.at(validator).read();
        assert(!existing_active, "Validator already active");
        
        // Add to list
        storage.validators.at(count).write(validator);
        storage.validator_index.at(validator).write(count);
        storage.validator_active.at(validator).write(true);
        storage.stake_per_validator.at(validator).write(0);
        
        storage.validator_count.write(count + 1);
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active + 1);
    }
    
    /// Deactivate a validator (stop routing new stakes)
    /// Existing stake remains until unstaked
    ///
    /// @param validator Address of the validator to deactivate
    #[public]
    fn deactivate_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        
        let is_active = storage.validator_active.at(validator).read();
        assert(is_active, "Validator not active");
        
        storage.validator_active.at(validator).write(false);
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active - 1);
    }
    
    /// Reactivate a previously deactivated validator
    ///
    /// @param validator Address of the validator to reactivate
    #[public]
    fn reactivate_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        
        let is_active = storage.validator_active.at(validator).read();
        assert(!is_active, "Validator already active");
        
        // Check validator was registered before
        let index = storage.validator_index.at(validator).read();
        let validator_at_index = storage.validators.at(index).read();
        assert(validator_at_index == validator, "Validator not registered");
        
        storage.validator_active.at(validator).write(true);
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active + 1);
    }

    // ============ STAKING OPERATIONS ============
    
    /// Select next validator for staking using round-robin
    /// Skips inactive validators
    ///
    /// @return Address of selected validator
    #[public]
    fn select_next_validator() -> pub AztecAddress {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        assert(is_keeper | is_admin, "Only keeper or admin");
        assert(!storage.paused.read(), "Contract is paused");
        
        let active_count = storage.active_validator_count.read();
        assert(active_count > 0, "No active validators");
        
        let total_count = storage.validator_count.read();
        let mut current_index = storage.next_validator_index.read();
        let starting_index = current_index;
        
        // Find next active validator (round-robin with skip)
        let mut found_validator = storage.validators.at(0).read();
        let mut found = false;
        
        // Loop through validators to find an active one
        // Use a bounded loop to avoid infinite loops
        for _i in 0..100 {
            if !found {
                let validator = storage.validators.at(current_index).read();
                let is_active = storage.validator_active.at(validator).read();
                
                if is_active {
                    found_validator = validator;
                    found = true;
                    
                    // Update next index for next call
                    let next = (current_index + 1) % total_count;
                    storage.next_validator_index.write(next);
                } else {
                    // Move to next validator
                    current_index = (current_index + 1) % total_count;
                    
                    // Check if we've looped around (shouldn't happen if active_count > 0)
                    if current_index == starting_index {
                        // No active validators found - break loop
                        found = true; // Exit loop
                    }
                }
            }
        }
        
        found_validator
    }
    
    /// Record a stake to a validator and notify LiquidStakingCore
    /// Called when keeper executes actual stake transaction
    ///
    /// @param validator Address of validator receiving stake
    /// @param amount Amount staked
    #[public]
    fn record_stake(validator: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let core = storage.liquid_staking_core.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        let is_core = caller == core;
        assert(is_keeper | is_admin | is_core, "Unauthorized");
        
        let is_active = storage.validator_active.at(validator).read();
        assert(is_active, "Validator not active");
        
        let current = storage.stake_per_validator.at(validator).read();
        storage.stake_per_validator.at(validator).write(current + amount);
        
        let total = storage.total_staked.read();
        storage.total_staked.write(total + amount);
        
        // Increment batch counter
        let batches = storage.batches_processed.read();
        storage.batches_processed.write(batches + 1);
        
        // Notify LiquidStakingCore that stake has been processed
        VaultManager::call_core_notify_staked(
            &mut context,
            storage.liquid_staking_core.read(),
            amount
        );
    }
    
    /// Record an unstake from a validator
    /// Called when withdrawing from a validator
    ///
    /// @param validator Address of validator
    /// @param amount Amount unstaked
    #[public]
    fn record_unstake(validator: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let core = storage.liquid_staking_core.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        let is_core = caller == core;
        assert(is_keeper | is_admin | is_core, "Unauthorized");
        
        let current = storage.stake_per_validator.at(validator).read();
        assert(current >= amount, "Insufficient stake recorded");
        storage.stake_per_validator.at(validator).write(current - amount);
        
        let total = storage.total_staked.read();
        storage.total_staked.write(total - amount);
    }
    
    /// Execute a batch stake to the selected validator
    /// This is the main function called by the keeper when pending pool >= 200k
    ///
    /// @param batch_amount Amount to stake (should be BATCH_SIZE)
    /// @return Selected validator address
    #[public]
    fn execute_batch_stake(batch_amount: u128) -> pub AztecAddress {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        assert(is_keeper | is_admin, "Only keeper or admin");
        assert(!storage.paused.read(), "Contract is paused");
        assert(batch_amount >= BATCH_SIZE, "Batch too small");
        
        // Select validator using round-robin
        let validator = VaultManager::at(context.this_address()).select_next_validator(&mut context);
        
        // Record the stake
        let is_active = storage.validator_active.at(validator).read();
        assert(is_active, "Selected validator not active");
        
        let current = storage.stake_per_validator.at(validator).read();
        storage.stake_per_validator.at(validator).write(current + batch_amount);
        
        let total = storage.total_staked.read();
        storage.total_staked.write(total + batch_amount);
        
        let batches = storage.batches_processed.read();
        storage.batches_processed.write(batches + 1);
        
        // Notify LiquidStakingCore
        VaultManager::call_core_notify_staked(
            &mut context,
            storage.liquid_staking_core.read(),
            batch_amount
        );
        
        validator
    }
    
    /// Get the validator with lowest stake (for load balancing)
    /// Useful for distributing stake evenly
    ///
    /// @return Address of validator with lowest stake
    #[public]
    #[view]
    fn get_lowest_stake_validator() -> pub AztecAddress {
        let count = storage.validator_count.read();
        assert(count > 0, "No validators registered");
        
        let mut lowest_validator = storage.validators.at(0).read();
        let mut lowest_stake = storage.stake_per_validator.at(lowest_validator).read();
        let lowest_active = storage.validator_active.at(lowest_validator).read();
        
        // Initialize with max if first validator is not active
        if !lowest_active {
            lowest_stake = 0xffffffffffffffffffffffffffffffff; // max u128
        }
        
        // Find active validator with lowest stake
        for i in 1..100 {
            let idx = i as u32;
            if idx < count {
                let validator = storage.validators.at(idx).read();
                let is_active = storage.validator_active.at(validator).read();
                
                if is_active {
                    let stake = storage.stake_per_validator.at(validator).read();
                    if stake < lowest_stake {
                        lowest_stake = stake;
                        lowest_validator = validator;
                    }
                }
            }
        }
        
        lowest_validator
    }
    
    // ============ CROSS-CONTRACT CALL HELPERS ============
    
    /// Call LiquidStakingCore.notify_staked
    #[contract_library_method]
    fn call_core_notify_staked(
        context: &mut PublicContext,
        core_address: AztecAddress,
        amount: u128
    ) {
        let selector = FunctionSelector::from_signature("notify_staked(u128)");
        
        context.call_public_function(
            core_address,
            selector,
            [amount as Field].as_slice()
        );
    }

    // ============ VIEW FUNCTIONS ============
    
    #[public]
    #[view]
    fn get_validator_count() -> pub u32 {
        storage.validator_count.read()
    }
    
    #[public]
    #[view]
    fn get_active_validator_count() -> pub u32 {
        storage.active_validator_count.read()
    }
    
    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked.read()
    }
    
    #[public]
    #[view]
    fn get_validator_stake(validator: AztecAddress) -> pub u128 {
        storage.stake_per_validator.at(validator).read()
    }
    
    #[public]
    #[view]
    fn is_validator_active(validator: AztecAddress) -> pub bool {
        storage.validator_active.at(validator).read()
    }
    
    #[public]
    #[view]
    fn get_validator_at(index: u32) -> pub AztecAddress {
        assert(index < storage.validator_count.read(), "Index out of bounds");
        storage.validators.at(index).read()
    }
    
    #[public]
    #[view]
    fn get_next_validator_index() -> pub u32 {
        storage.next_validator_index.read()
    }
    
    #[public]
    #[view]
    fn get_batches_processed() -> pub u64 {
        storage.batches_processed.read()
    }
    
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }
    
    #[public]
    #[view]
    fn get_batch_size() -> pub u128 {
        BATCH_SIZE
    }
    
    /// Calculate average stake per active validator
    #[public]
    #[view]
    fn get_average_stake() -> pub u128 {
        let total = storage.total_staked.read();
        let active = storage.active_validator_count.read();
        
        if active == 0 {
            0
        } else {
            total / (active as u128)
        }
    }
    
    #[public]
    #[view]
    fn get_liquid_staking_core() -> pub AztecAddress {
        storage.liquid_staking_core.read()
    }
    
    #[public]
    #[view]
    fn get_keeper() -> pub AztecAddress {
        storage.keeper.read()
    }
}
