// RewardsManager - Rewards Distribution and Exchange Rate Management
// Manages protocol fees and staking rewards distribution

use dep::aztec::macros::aztec;

#[aztec]
pub contract RewardsManager {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::PublicMutable;
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        total_rewards_distributed: PublicMutable<u128, Context>,
        protocol_fee_bps: PublicMutable<u64, Context>,
        protocol_fee_recipient: PublicMutable<AztecAddress, Context>,
        pending_protocol_fees: PublicMutable<u128, Context>,
        staked_aztec_token: PublicMutable<AztecAddress, Context>,
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
        last_update_timestamp: PublicMutable<u64, Context>,
        current_exchange_rate: PublicMutable<u64, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress, fee_recipient: AztecAddress) {
        storage.admin.write(admin_);
        storage.protocol_fee_recipient.write(fee_recipient);
        storage.protocol_fee_bps.write(1000);
        storage.total_rewards_distributed.write(0);
        storage.pending_protocol_fees.write(0);
        storage.last_update_timestamp.write(0);
        storage.current_exchange_rate.write(10000);
    }

    // ============ ADMIN FUNCTIONS ============
    #[public]
    fn set_staked_aztec_token(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set staked aztec token");
        storage.staked_aztec_token.write(address);
    }

    #[public]
    fn set_liquid_staking_core(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set liquid staking core");
        storage.liquid_staking_core.write(address);
    }

    #[public]
    fn set_protocol_fee_bps(new_fee: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set protocol fee");
        assert(new_fee <= 3000, "Fee too high (max 30%)");
        storage.protocol_fee_bps.write(new_fee);
    }

    #[public]
    fn set_protocol_fee_recipient(recipient: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set fee recipient");
        storage.protocol_fee_recipient.write(recipient);
    }

    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.admin.write(new_admin);
    }

    // ============ REWARDS PROCESSING ============
    #[public]
    fn process_rewards(
        reward_amount: u128,
        total_staked: u128,
        total_supply: u128,
        timestamp: u64
    ) -> pub u64 {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        let admin = storage.admin.read();
        let is_core = caller == core;
        let is_admin = caller == admin;
        assert(is_core | is_admin, "Only LiquidStakingCore or admin can process rewards");

        let fee_bps = storage.protocol_fee_bps.read();
        let protocol_fee = (reward_amount * (fee_bps as u128)) / 10000;
        let net_rewards = reward_amount - protocol_fee;

        let current_pending = storage.pending_protocol_fees.read();
        storage.pending_protocol_fees.write(current_pending + protocol_fee);

        // TODO(CRITICAL): INTEGER OVERFLOW BUG!
        // If total_value is large, multiplying by 10000 overflows u128!
        // Example: total_value > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF/10000
        // Required fix: Check for overflow before multiplication
        // See: AGENT-PROMPTS-PHASE2.md PROMPT C for safe implementation
        let new_rate = if total_supply == 0 {
            10000
        } else {
            let total_value = total_staked + net_rewards;
            ((total_value * 10000) / total_supply) as u64
        };

        storage.current_exchange_rate.write(new_rate);
        storage.last_update_timestamp.write(timestamp);

        let total_distributed = storage.total_rewards_distributed.read();
        storage.total_rewards_distributed.write(total_distributed + reward_amount);

        // TODO(HIGH): StakedAztecToken NOT UPDATED!
        // We store new_rate locally but StakedAztecToken doesn't know!
        // Required: Call staked_aztec_token.update_exchange_rate(new_rate)
        // Currently: stAZTEC has stale exchange rate
        // See: AGENT-PROMPTS-PHASE2.md PROMPT B

        new_rate
    }

    // ============ FEE CLAIMING ============
    #[public]
    fn claim_protocol_fees() -> pub u128 {
        let caller = context.msg_sender();
        let fee_recipient = storage.protocol_fee_recipient.read();
        assert(caller == fee_recipient, "Only fee recipient can claim");

        let pending = storage.pending_protocol_fees.read();
        storage.pending_protocol_fees.write(0);

        // TODO(HIGH): Fee tokens NOT TRANSFERRED!
        // pending_protocol_fees reset to 0 but NO actual transfer!
        // Required: Call aztec_token.transfer(fee_recipient, pending)
        // Currently: Fees are "claimed" but recipient gets nothing
        // See: AGENT-PROMPTS-PHASE2.md PROMPT B

        pending
    }

    // ============ VIEW FUNCTIONS ============
    #[public]
    #[view]
    fn get_current_exchange_rate() -> pub u64 {
        storage.current_exchange_rate.read()
    }

    #[public]
    #[view]
    fn get_total_rewards_distributed() -> pub u128 {
        storage.total_rewards_distributed.read()
    }

    #[public]
    #[view]
    fn get_pending_protocol_fees() -> pub u128 {
        storage.pending_protocol_fees.read()
    }

    #[public]
    #[view]
    fn get_protocol_fee_bps() -> pub u64 {
        storage.protocol_fee_bps.read()
    }

    #[public]
    #[view]
    fn get_last_update_timestamp() -> pub u64 {
        storage.last_update_timestamp.read()
    }
}
