// RewardsManager Contract - Rewards Collection and Exchange Rate Updates
// TASK-109 implementation
//
// This contract manages:
// - Claiming rewards from validators
// - Calculating and updating the exchange rate
// - Protocol fee distribution
// - Cross-contract integration with StakedAztecToken for rate updates
// - Cross-contract integration with LiquidStakingCore for reward distribution
//
// Key features:
// - Exchange rate only increases (stAZTEC always gains value)
// - 10% default protocol fee on rewards
// - Transparent reward tracking

use dep::aztec::macros::aztec;

#[aztec]
pub contract RewardsManager {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::protocol_types::abis::function_selector::FunctionSelector;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Initial exchange rate: 10000 = 1.0 (basis points)
    global INITIAL_RATE: u64 = 10000;
    
    // Rate precision (10000 = 1.0)
    global RATE_PRECISION: u64 = 10000;

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Exchange rate tracking
        current_exchange_rate: PublicMutable<u64, Context>,
        last_rate_update: PublicMutable<u64, Context>,
        
        // Reward tracking
        total_rewards_claimed: PublicMutable<u128, Context>,
        total_fees_collected: PublicMutable<u128, Context>,
        rewards_per_validator: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        
        // Epoch tracking
        current_epoch: PublicMutable<u64, Context>,
        rewards_per_epoch: Map<u64, PublicMutable<u128, Context>, Context>,
        
        // Protocol fee (in basis points, 1000 = 10%)
        protocol_fee_bps: PublicMutable<u64, Context>,
        
        // Reference data for rate calculation
        total_aztec_backing: PublicMutable<u128, Context>,
        total_st_aztec_supply: PublicMutable<u128, Context>,
        
        // Contract references
        staked_aztec_token: PublicMutable<AztecAddress, Context>,
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        vault_manager: PublicMutable<AztecAddress, Context>,
        
        // Access control
        admin: PublicMutable<AztecAddress, Context>,
        keeper: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress, protocol_fee_bps_: u64) {
        assert(protocol_fee_bps_ <= 2000, "Fee cannot exceed 20%");
        
        storage.admin.write(admin_);
        storage.protocol_fee_bps.write(protocol_fee_bps_);
        storage.current_exchange_rate.write(INITIAL_RATE);
        storage.last_rate_update.write(0);
        storage.total_rewards_claimed.write(0);
        storage.total_fees_collected.write(0);
        storage.current_epoch.write(0);
        storage.total_aztec_backing.write(0);
        storage.total_st_aztec_supply.write(0);
        storage.paused.write(false);
    }

    // ============ ADMIN CONFIGURATION ============
    #[public]
    fn set_staked_aztec_token(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.staked_aztec_token.write(address);
    }
    
    #[public]
    fn set_liquid_staking_core(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.liquid_staking_core.write(address);
    }
    
    #[public]
    fn set_vault_manager(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.vault_manager.write(address);
    }
    
    #[public]
    fn set_keeper(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.keeper.write(address);
    }
    
    #[public]
    fn set_protocol_fee(new_fee_bps: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        assert(new_fee_bps <= 2000, "Fee cannot exceed 20%");
        storage.protocol_fee_bps.write(new_fee_bps);
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

    // ============ REWARD OPERATIONS ============
    
    /// Process rewards from a validator
    /// Called by keeper after claiming from Aztec staking
    /// This function:
    /// 1. Calculates protocol fee
    /// 2. Updates internal tracking
    /// 3. Updates backing amount
    /// 4. Calls LiquidStakingCore.add_rewards
    /// 5. Updates exchange rate on StakedAztecToken
    ///
    /// @param validator Address of validator rewards came from
    /// @param gross_amount Total rewards claimed (before fees)
    /// @param timestamp Current timestamp
    /// @return (net_rewards, fee_amount)
    #[public]
    fn process_rewards(
        validator: AztecAddress,
        gross_amount: u128,
        timestamp: u64
    ) -> pub (u128, u128) {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        assert(is_keeper | is_admin, "Only keeper or admin");
        assert(!storage.paused.read(), "Contract is paused");
        assert(gross_amount > 0, "Amount must be positive");
        
        // Calculate protocol fee
        let fee_bps = storage.protocol_fee_bps.read();
        let fee_amount = (gross_amount * (fee_bps as u128)) / 10000;
        let net_rewards = gross_amount - fee_amount;
        
        // Update tracking
        let total_rewards = storage.total_rewards_claimed.read();
        storage.total_rewards_claimed.write(total_rewards + gross_amount);
        
        let total_fees = storage.total_fees_collected.read();
        storage.total_fees_collected.write(total_fees + fee_amount);
        
        let validator_rewards = storage.rewards_per_validator.at(validator).read();
        storage.rewards_per_validator.at(validator).write(validator_rewards + gross_amount);
        
        // Update epoch tracking
        let epoch = storage.current_epoch.read();
        let epoch_rewards = storage.rewards_per_epoch.at(epoch).read();
        storage.rewards_per_epoch.at(epoch).write(epoch_rewards + gross_amount);
        
        // Update AZTEC backing
        let backing = storage.total_aztec_backing.read();
        let new_backing = backing + net_rewards;
        storage.total_aztec_backing.write(new_backing);
        
        storage.last_rate_update.write(timestamp);
        
        // Call LiquidStakingCore to add rewards
        RewardsManager::call_core_add_rewards(
            &mut context,
            storage.liquid_staking_core.read(),
            gross_amount
        );
        
        // Calculate and update new exchange rate
        let supply = storage.total_st_aztec_supply.read();
        if supply > 0 {
            let new_rate = ((new_backing * (RATE_PRECISION as u128)) / supply) as u64;
            let current_rate = storage.current_exchange_rate.read();
            
            // Only update if rate increased
            if new_rate > current_rate {
                storage.current_exchange_rate.write(new_rate);
                
                // Update exchange rate on StakedAztecToken
                RewardsManager::call_staked_token_update_rate(
                    &mut context,
                    storage.staked_aztec_token.read(),
                    new_rate
                );
            }
        }
        
        (net_rewards, fee_amount)
    }
    
    /// Update the exchange rate based on current backing and supply
    /// Rate = (total_aztec_backing * RATE_PRECISION) / total_st_aztec_supply
    ///
    /// @param total_backing Total AZTEC backing the stAZTEC supply
    /// @param total_supply Total stAZTEC supply
    /// @param timestamp Current timestamp
    /// @return New exchange rate
    #[public]
    fn update_exchange_rate(
        total_backing: u128,
        total_supply: u128,
        timestamp: u64
    ) -> pub u64 {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let core = storage.liquid_staking_core.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        let is_core = caller == core;
        assert(is_keeper | is_admin | is_core, "Unauthorized");
        assert(!storage.paused.read(), "Contract is paused");
        
        // Update stored values
        storage.total_aztec_backing.write(total_backing);
        storage.total_st_aztec_supply.write(total_supply);
        
        // Calculate new rate
        let new_rate = if total_supply == 0 {
            INITIAL_RATE
        } else {
            let rate_u128 = (total_backing * (RATE_PRECISION as u128)) / total_supply;
            rate_u128 as u64
        };
        
        // Ensure rate only increases (protects against manipulation)
        let current_rate = storage.current_exchange_rate.read();
        let final_rate = if new_rate > current_rate {
            new_rate
        } else {
            current_rate
        };
        
        storage.current_exchange_rate.write(final_rate);
        storage.last_rate_update.write(timestamp);
        
        // Update rate on StakedAztecToken
        RewardsManager::call_staked_token_update_rate(
            &mut context,
            storage.staked_aztec_token.read(),
            final_rate
        );
        
        final_rate
    }
    
    /// Advance to next epoch
    /// Called periodically (e.g., daily) by keeper
    ///
    /// @param timestamp Current timestamp
    #[public]
    fn advance_epoch(timestamp: u64) {
        let caller = context.msg_sender();
        let keeper = storage.keeper.read();
        let admin = storage.admin.read();
        let is_keeper = caller == keeper;
        let is_admin = caller == admin;
        assert(is_keeper | is_admin, "Only keeper or admin");
        
        let epoch = storage.current_epoch.read();
        storage.current_epoch.write(epoch + 1);
        storage.last_rate_update.write(timestamp);
    }
    
    /// Set initial backing and supply (for bootstrap)
    /// Only callable once when supply is 0
    ///
    /// @param initial_backing Initial AZTEC backing
    /// @param initial_supply Initial stAZTEC supply
    #[public]
    fn initialize_backing(initial_backing: u128, initial_supply: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        
        let current_supply = storage.total_st_aztec_supply.read();
        assert(current_supply == 0, "Already initialized");
        
        storage.total_aztec_backing.write(initial_backing);
        storage.total_st_aztec_supply.write(initial_supply);
        
        // Set initial rate if supply is positive
        if initial_supply > 0 {
            let rate = (initial_backing * (RATE_PRECISION as u128)) / initial_supply;
            let rate_u64 = if rate > 0 { rate as u64 } else { INITIAL_RATE };
            storage.current_exchange_rate.write(rate_u64);
        }
    }
    
    /// Sync supply from StakedAztecToken
    /// Used when deposits/withdrawals change supply
    ///
    /// @param new_supply New total stAZTEC supply
    #[public]
    fn sync_supply(new_supply: u128) {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        let admin = storage.admin.read();
        let is_core = caller == core;
        let is_admin = caller == admin;
        assert(is_core | is_admin, "Only core or admin");
        
        storage.total_st_aztec_supply.write(new_supply);
    }
    
    /// Sync backing from LiquidStakingCore
    /// Used when deposits/withdrawals change backing
    ///
    /// @param new_backing New total AZTEC backing
    #[public]
    fn sync_backing(new_backing: u128) {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        let admin = storage.admin.read();
        let is_core = caller == core;
        let is_admin = caller == admin;
        assert(is_core | is_admin, "Only core or admin");
        
        storage.total_aztec_backing.write(new_backing);
    }
    
    // ============ CROSS-CONTRACT CALL HELPERS ============
    
    /// Call LiquidStakingCore.add_rewards
    #[contract_library_method]
    fn call_core_add_rewards(
        context: &mut PublicContext,
        core_address: AztecAddress,
        amount: u128
    ) {
        let selector = FunctionSelector::from_signature("add_rewards(u128)");
        
        context.call_public_function(
            core_address,
            selector,
            [amount as Field].as_slice()
        );
    }
    
    /// Call StakedAztecToken.update_exchange_rate
    #[contract_library_method]
    fn call_staked_token_update_rate(
        context: &mut PublicContext,
        staked_token_address: AztecAddress,
        new_rate: u64
    ) {
        let selector = FunctionSelector::from_signature("update_exchange_rate(u64)");
        
        context.call_public_function(
            staked_token_address,
            selector,
            [new_rate as Field].as_slice()
        );
    }

    // ============ VIEW FUNCTIONS ============
    
    #[public]
    #[view]
    fn get_exchange_rate() -> pub u64 {
        storage.current_exchange_rate.read()
    }
    
    #[public]
    #[view]
    fn get_last_update() -> pub u64 {
        storage.last_rate_update.read()
    }
    
    #[public]
    #[view]
    fn get_total_rewards() -> pub u128 {
        storage.total_rewards_claimed.read()
    }
    
    #[public]
    #[view]
    fn get_total_fees() -> pub u128 {
        storage.total_fees_collected.read()
    }
    
    #[public]
    #[view]
    fn get_protocol_fee() -> pub u64 {
        storage.protocol_fee_bps.read()
    }
    
    #[public]
    #[view]
    fn get_current_epoch() -> pub u64 {
        storage.current_epoch.read()
    }
    
    #[public]
    #[view]
    fn get_epoch_rewards(epoch: u64) -> pub u128 {
        storage.rewards_per_epoch.at(epoch).read()
    }
    
    #[public]
    #[view]
    fn get_validator_rewards(validator: AztecAddress) -> pub u128 {
        storage.rewards_per_validator.at(validator).read()
    }
    
    #[public]
    #[view]
    fn get_total_backing() -> pub u128 {
        storage.total_aztec_backing.read()
    }
    
    #[public]
    #[view]
    fn get_total_supply() -> pub u128 {
        storage.total_st_aztec_supply.read()
    }
    
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }
    
    /// Calculate what the exchange rate would be given backing and supply
    #[public]
    #[view]
    fn preview_rate(backing: u128, supply: u128) -> pub u64 {
        if supply == 0 {
            INITIAL_RATE
        } else {
            let rate = (backing * (RATE_PRECISION as u128)) / supply;
            rate as u64
        }
    }
    
    /// Calculate AZTEC value of stAZTEC at current rate
    #[public]
    #[view]
    fn calculate_aztec_value(st_aztec_amount: u128) -> pub u128 {
        let rate = storage.current_exchange_rate.read();
        (st_aztec_amount * (rate as u128)) / (RATE_PRECISION as u128)
    }
    
    /// Calculate stAZTEC amount for AZTEC at current rate
    #[public]
    #[view]
    fn calculate_st_aztec_amount(aztec_amount: u128) -> pub u128 {
        let rate = storage.current_exchange_rate.read();
        if rate == 0 {
            0
        } else {
            (aztec_amount * (RATE_PRECISION as u128)) / (rate as u128)
        }
    }
    
    /// Get APY estimate based on recent rewards
    /// Returns APY in basis points (e.g., 800 = 8%)
    /// Note: This is a simplified calculation
    #[public]
    #[view]
    fn get_estimated_apy() -> pub u64 {
        let backing = storage.total_aztec_backing.read();
        let epoch = storage.current_epoch.read();
        
        // Default APY of 8% (800 bps) when no data available
        let default_apy: u64 = 800;
        
        // Need at least 1 epoch of data and non-zero backing
        if epoch == 0 {
            default_apy
        } else if backing == 0 {
            default_apy
        } else {
            // Get last epoch rewards
            let last_epoch = epoch - 1;
            let epoch_rewards = storage.rewards_per_epoch.at(last_epoch).read();
            
            // Simple APY: (epoch_rewards / backing) * 365 * 10000 (in bps)
            // Assuming 1 epoch per day for simplicity
            let daily_rate_bps = (epoch_rewards * 10000) / backing;
            let annual_rate_bps = daily_rate_bps * 365;
            
            // Cap at reasonable APY (max 50%)
            if annual_rate_bps > 5000 {
                5000
            } else {
                annual_rate_bps as u64
            }
        }
    }
    
    #[public]
    #[view]
    fn get_staked_aztec_token() -> pub AztecAddress {
        storage.staked_aztec_token.read()
    }
    
    #[public]
    #[view]
    fn get_liquid_staking_core() -> pub AztecAddress {
        storage.liquid_staking_core.read()
    }
}
