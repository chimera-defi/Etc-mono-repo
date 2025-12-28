// VaultManager - Pool Aggregation and Batch Staking Contract
// Manages deposit aggregation and batch staking to validators

use dep::aztec::macros::aztec;

#[aztec]
pub contract VaultManager {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::PublicMutable;
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        pending_pool: PublicMutable<u128, Context>,
        total_staked: PublicMutable<u128, Context>,
        batch_threshold: PublicMutable<u128, Context>,
        next_validator_index: PublicMutable<u32, Context>,
        validator_registry: PublicMutable<AztecAddress, Context>,
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        storage.admin.write(admin_);
        storage.pending_pool.write(0);
        storage.total_staked.write(0);
        storage.batch_threshold.write(200000);
        storage.next_validator_index.write(0);
        storage.paused.write(false);
    }

    // ============ ADMIN FUNCTIONS ============
    #[public]
    fn set_validator_registry(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set validator registry");
        storage.validator_registry.write(address);
    }

    #[public]
    fn set_liquid_staking_core(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set liquid staking core");
        storage.liquid_staking_core.write(address);
    }

    #[public]
    fn set_batch_threshold(threshold: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set batch threshold");
        assert(threshold > 0, "Threshold must be positive");
        storage.batch_threshold.write(threshold);
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
        assert(caller == admin, "Only admin can pause");
        storage.paused.write(paused_);
    }

    // ============ DEPOSIT RECORDING ============
    #[public]
    fn record_deposit(amount: u128) -> pub bool {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can record deposits");
        assert(!storage.paused.read(), "Contract is paused");
        assert(amount > 0, "Amount must be positive");

        let current_pending = storage.pending_pool.read();
        let new_pending = current_pending + amount;
        storage.pending_pool.write(new_pending);

        let threshold = storage.batch_threshold.read();
        new_pending >= threshold
    }

    // ============ BATCH STAKING ============
    #[public]
    fn execute_batch_stake() -> pub u128 {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can execute batch stake");
        assert(!storage.paused.read(), "Contract is paused");

        let pending = storage.pending_pool.read();
        let threshold = storage.batch_threshold.read();
        assert(pending >= threshold, "Pending pool below threshold");

        let stake_amount = pending;
        storage.pending_pool.write(0);

        let current_staked = storage.total_staked.read();
        storage.total_staked.write(current_staked + stake_amount);

        let current_index = storage.next_validator_index.read();
        storage.next_validator_index.write(current_index + 1);

        // TODO(CRITICAL): Actual staking NOT IMPLEMENTED!
        // This just updates numbers - NO tokens are staked anywhere!
        // Required implementation:
        // 1. Call validator_registry.get_active_validators()
        // 2. Select validators (round-robin or weighted)
        // 3. Actually stake AZTEC with Aztec protocol
        // 4. Track per-validator balances
        // WITHOUT THIS, TOKENS SIT IN CONTRACT EARNING NOTHING
        // See: AGENT-PROMPTS-PHASE2.md PROMPT G

        stake_amount
    }

    // ============ VIEW FUNCTIONS ============
    #[public]
    #[view]
    fn get_pending_pool() -> pub u128 {
        storage.pending_pool.read()
    }

    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked.read()
    }

    #[public]
    #[view]
    fn get_batch_threshold() -> pub u128 {
        storage.batch_threshold.read()
    }

    #[public]
    #[view]
    fn get_next_validator_index() -> pub u32 {
        storage.next_validator_index.read()
    }

    #[public]
    #[view]
    fn is_ready_for_batch() -> pub bool {
        let pending = storage.pending_pool.read();
        let threshold = storage.batch_threshold.read();
        pending >= threshold
    }

    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }
}
