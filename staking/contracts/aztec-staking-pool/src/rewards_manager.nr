// RewardsManager.nr - Rewards Collection and Distribution
// Aztec v2.1.9 compatible
// Manages staking rewards, exchange rate updates, and protocol fees

use dep::aztec::macros::aztec;

#[aztec]
pub contract RewardsManager {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Basis points denominator (10000 = 100%)
    global BASIS_POINTS: u64 = 10000;

    // Maximum protocol fee (20%)
    global MAX_PROTOCOL_FEE_BPS: u64 = 2000;

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Admin address
        admin: PublicMutable<AztecAddress, Context>,

        // Component contract addresses
        st_aztec_token: PublicMutable<AztecAddress, Context>,
        vault_manager: PublicMutable<AztecAddress, Context>,
        liquid_staking_core: PublicMutable<AztecAddress, Context>,

        // Protocol fee configuration (basis points)
        protocol_fee_bps: PublicMutable<u64, Context>,

        // Fee recipient (treasury)
        fee_recipient: PublicMutable<AztecAddress, Context>,

        // Accumulated protocol fees (pending distribution)
        pending_protocol_fees: PublicMutable<u128, Context>,

        // Total rewards collected (lifetime)
        total_rewards_collected: PublicMutable<u128, Context>,

        // Total fees distributed (lifetime)
        total_fees_distributed: PublicMutable<u128, Context>,

        // Last rewards update timestamp/block
        last_rewards_update: PublicMutable<u64, Context>,

        // Minimum time between reward updates (in blocks)
        min_update_interval: PublicMutable<u64, Context>,

        // Authorized reward collectors (keeper bots)
        authorized_collectors: Map<AztecAddress, PublicMutable<bool, Context>, Context>,

        // Per-validator rewards tracking
        validator_rewards: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        validator_last_claim: Map<AztecAddress, PublicMutable<u64, Context>, Context>,

        // Paused state
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(
        admin: AztecAddress,
        st_aztec_token: AztecAddress,
        vault_manager: AztecAddress,
        fee_recipient: AztecAddress,
        protocol_fee_bps: u64,
    ) {
        assert(protocol_fee_bps <= MAX_PROTOCOL_FEE_BPS, "Fee too high");

        storage.admin.write(admin);
        storage.st_aztec_token.write(st_aztec_token);
        storage.vault_manager.write(vault_manager);
        storage.fee_recipient.write(fee_recipient);
        storage.protocol_fee_bps.write(protocol_fee_bps);
        storage.liquid_staking_core.write(AztecAddress::from_field(0)); // Set later

        storage.pending_protocol_fees.write(0);
        storage.total_rewards_collected.write(0);
        storage.total_fees_distributed.write(0);
        storage.last_rewards_update.write(0);
        storage.min_update_interval.write(100); // ~100 blocks between updates
        storage.paused.write(false);

        // Admin is authorized collector by default
        storage.authorized_collectors.at(admin).write(true);
    }

    // ============ REWARDS COLLECTION ============

    /// Collect rewards from validators and update exchange rate
    /// Called by authorized keeper bots
    /// Returns: (total_rewards, protocol_fee, net_rewards)
    #[public]
    fn collect_rewards() -> pub (u128, u128, u128) {
        assert(!storage.paused.read(), "Rewards collection paused");

        let caller = context.msg_sender();
        let is_authorized = storage.authorized_collectors.at(caller).read();
        let admin = storage.admin.read();
        assert(caller == admin || is_authorized, "Not authorized");

        // Check minimum interval
        let current_block = context.block_number() as u64;
        let last_update = storage.last_rewards_update.read();
        let min_interval = storage.min_update_interval.read();

        if last_update > 0 {
            assert(current_block >= last_update + min_interval, "Too soon to collect");
        }

        // TODO: Query actual validator rewards from Aztec staking
        // For now, this is a placeholder that would be called by keeper with actual amounts
        // In production: iterate validators, query rewards, sum total

        // Placeholder: Rewards would be passed in or queried
        let total_rewards: u128 = 0; // Would come from actual staking queries

        // Calculate protocol fee
        let protocol_fee_bps = storage.protocol_fee_bps.read();
        let protocol_fee = (total_rewards * (protocol_fee_bps as u128)) / (BASIS_POINTS as u128);
        let net_rewards = total_rewards - protocol_fee;

        // Update pending fees
        let pending = storage.pending_protocol_fees.read();
        storage.pending_protocol_fees.write(pending + protocol_fee);

        // Update lifetime totals
        let total_collected = storage.total_rewards_collected.read();
        storage.total_rewards_collected.write(total_collected + total_rewards);

        // Update last collection timestamp
        storage.last_rewards_update.write(current_block);

        // TODO: Call StakedAztecToken to update exchange rate
        // StakedAztecToken::at(st_aztec_token).update_exchange_rate(new_rate).call(&mut context);

        (total_rewards, protocol_fee, net_rewards)
    }

    /// Record rewards from a specific validator
    /// Called when claiming from individual validators
    #[public]
    fn record_validator_rewards(validator: AztecAddress, amount: u128) {
        assert(!storage.paused.read(), "Rewards collection paused");

        let caller = context.msg_sender();
        let is_authorized = storage.authorized_collectors.at(caller).read();
        let admin = storage.admin.read();
        let vault_manager = storage.vault_manager.read();
        assert(caller == admin || caller == vault_manager || is_authorized, "Not authorized");

        let current_block = context.block_number() as u64;

        // Update validator-specific tracking
        let current_rewards = storage.validator_rewards.at(validator).read();
        storage.validator_rewards.at(validator).write(current_rewards + amount);
        storage.validator_last_claim.at(validator).write(current_block);

        // Calculate and accrue protocol fee
        let protocol_fee_bps = storage.protocol_fee_bps.read();
        let protocol_fee = (amount * (protocol_fee_bps as u128)) / (BASIS_POINTS as u128);

        let pending = storage.pending_protocol_fees.read();
        storage.pending_protocol_fees.write(pending + protocol_fee);

        // Update lifetime totals
        let total_collected = storage.total_rewards_collected.read();
        storage.total_rewards_collected.write(total_collected + amount);
    }

    // ============ EXCHANGE RATE CALCULATION ============

    /// Calculate new exchange rate based on total assets
    /// Exchange rate = (total_aztec / total_st_aztec) * 10000
    #[public]
    #[view]
    fn calculate_new_exchange_rate(
        total_staked: u128,
        pending_pool: u128,
        liquidity_buffer: u128,
        unclaimed_rewards: u128,
        total_st_aztec_supply: u128,
    ) -> pub u64 {
        if total_st_aztec_supply == 0 {
            return 10000; // 1:1 base rate
        }

        // Total AZTEC controlled = staked + pending + buffer + rewards - pending_fees
        let pending_fees = storage.pending_protocol_fees.read();
        let total_aztec = total_staked + pending_pool + liquidity_buffer + unclaimed_rewards;

        // Subtract pending fees (they belong to protocol, not stakers)
        let net_aztec = if total_aztec > pending_fees {
            total_aztec - pending_fees
        } else {
            0
        };

        // Calculate rate in basis points
        // rate = (net_aztec * 10000) / total_st_aztec
        let rate = (net_aztec * 10000) / total_st_aztec_supply;

        // Ensure rate is at least 1:1 (10000 basis points)
        // Rate should only increase as rewards accrue
        if rate < 10000 {
            10000
        } else if rate > 100000 {
            // Cap at 10x to prevent overflow issues
            100000
        } else {
            rate as u64
        }
    }

    /// Trigger exchange rate update on StakedAztecToken
    /// Called after rewards collection
    #[public]
    fn update_exchange_rate(new_rate: u64) {
        assert(!storage.paused.read(), "Rewards collection paused");

        let caller = context.msg_sender();
        let is_authorized = storage.authorized_collectors.at(caller).read();
        let admin = storage.admin.read();
        assert(caller == admin || is_authorized, "Not authorized");

        // Validate rate is reasonable
        assert(new_rate >= 10000, "Rate below base");
        assert(new_rate <= 100000, "Rate too high");

        // TODO: Call StakedAztecToken to update
        // let st_aztec_token = storage.st_aztec_token.read();
        // StakedAztecToken::at(st_aztec_token).update_exchange_rate(new_rate).call(&mut context);
    }

    // ============ FEE DISTRIBUTION ============

    /// Distribute accumulated protocol fees to fee recipient
    /// Returns: amount distributed
    #[public]
    fn distribute_protocol_fees() -> pub u128 {
        assert(!storage.paused.read(), "Distribution paused");

        let caller = context.msg_sender();
        let admin = storage.admin.read();
        let fee_recipient = storage.fee_recipient.read();
        assert(caller == admin || caller == fee_recipient, "Not authorized");

        let pending = storage.pending_protocol_fees.read();
        assert(pending > 0, "No fees to distribute");

        // Reset pending fees
        storage.pending_protocol_fees.write(0);

        // Update lifetime distributed
        let total_distributed = storage.total_fees_distributed.read();
        storage.total_fees_distributed.write(total_distributed + pending);

        // TODO: Transfer fees to recipient
        // Token::at(aztec_token).transfer(fee_recipient, pending).call(&mut context);

        pending
    }

    // ============ VIEW FUNCTIONS ============

    /// Get pending protocol fees
    #[public]
    #[view]
    fn get_pending_protocol_fees() -> pub u128 {
        storage.pending_protocol_fees.read()
    }

    /// Get total rewards collected (lifetime)
    #[public]
    #[view]
    fn get_total_rewards_collected() -> pub u128 {
        storage.total_rewards_collected.read()
    }

    /// Get total fees distributed (lifetime)
    #[public]
    #[view]
    fn get_total_fees_distributed() -> pub u128 {
        storage.total_fees_distributed.read()
    }

    /// Get protocol fee rate
    #[public]
    #[view]
    fn get_protocol_fee_bps() -> pub u64 {
        storage.protocol_fee_bps.read()
    }

    /// Get last rewards update block
    #[public]
    #[view]
    fn get_last_rewards_update() -> pub u64 {
        storage.last_rewards_update.read()
    }

    /// Get validator rewards (lifetime)
    #[public]
    #[view]
    fn get_validator_rewards(validator: AztecAddress) -> pub u128 {
        storage.validator_rewards.at(validator).read()
    }

    /// Get validator last claim block
    #[public]
    #[view]
    fn get_validator_last_claim(validator: AztecAddress) -> pub u64 {
        storage.validator_last_claim.at(validator).read()
    }

    /// Get rewards statistics
    #[public]
    #[view]
    fn get_rewards_stats() -> pub (u128, u128, u128, u64) {
        let total_collected = storage.total_rewards_collected.read();
        let total_distributed = storage.total_fees_distributed.read();
        let pending = storage.pending_protocol_fees.read();
        let last_update = storage.last_rewards_update.read();

        (total_collected, total_distributed, pending, last_update)
    }

    /// Check if paused
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    /// Check if address is authorized collector
    #[public]
    #[view]
    fn is_authorized_collector(addr: AztecAddress) -> pub bool {
        storage.authorized_collectors.at(addr).read()
    }

    // ============ ADMIN FUNCTIONS ============

    /// Set protocol fee (max 20%)
    #[public]
    fn set_protocol_fee(fee_bps: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        assert(fee_bps <= MAX_PROTOCOL_FEE_BPS, "Fee too high");

        storage.protocol_fee_bps.write(fee_bps);
    }

    /// Set fee recipient
    #[public]
    fn set_fee_recipient(recipient: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.fee_recipient.write(recipient);
    }

    /// Set authorized collector
    #[public]
    fn set_authorized_collector(collector: AztecAddress, authorized: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.authorized_collectors.at(collector).write(authorized);
    }

    /// Set minimum update interval
    #[public]
    fn set_min_update_interval(interval: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        // Must be at least 10 blocks, at most 10000 blocks
        assert(interval >= 10, "Interval too short");
        assert(interval <= 10000, "Interval too long");

        storage.min_update_interval.write(interval);
    }

    /// Set LiquidStakingCore address
    #[public]
    fn set_liquid_staking_core(core: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.liquid_staking_core.write(core);
    }

    /// Update component addresses
    #[public]
    fn set_st_aztec_token(token: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.st_aztec_token.write(token);
    }

    #[public]
    fn set_vault_manager(vault: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.vault_manager.write(vault);
    }

    /// Transfer admin
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.admin.write(new_admin);
        storage.authorized_collectors.at(new_admin).write(true);
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
