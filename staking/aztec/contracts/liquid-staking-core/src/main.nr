// LiquidStakingCore - Main Entry Point for Aztec Liquid Staking Protocol
// Integrates StakedAztecToken, WithdrawalQueue, ValidatorRegistry, and VaultManager

use dep::aztec::macros::aztec;

#[aztec]
pub contract LiquidStakingCore {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Core accounting
        total_deposited: PublicMutable<u128, Context>,
        pending_pool: PublicMutable<u128, Context>,
        total_staked: PublicMutable<u128, Context>,
        liquidity_buffer: PublicMutable<u128, Context>,

        // Contract references
        staked_aztec_token: PublicMutable<AztecAddress, Context>,
        withdrawal_queue: PublicMutable<AztecAddress, Context>,
        validator_registry: PublicMutable<AztecAddress, Context>,
        vault_manager: PublicMutable<AztecAddress, Context>,

        // Access control and state
        admin: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,

        // Exchange rate (basis points: 10000 = 1:1)
        exchange_rate: PublicMutable<u64, Context>,

        // Withdrawal request tracking
        next_request_id: PublicMutable<u64, Context>,
        withdrawal_request_user: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        withdrawal_request_amount: Map<u64, PublicMutable<u128, Context>, Context>,
    }

    // ============ CONSTANTS ============
    // Batch threshold for staking (200,000 AZTEC)
    const BATCH_THRESHOLD: u128 = 200000;
    const BASIS_POINTS: u64 = 10000;

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        storage.admin.write(admin_);
        storage.paused.write(false);
        storage.total_deposited.write(0);
        storage.pending_pool.write(0);
        storage.total_staked.write(0);
        storage.liquidity_buffer.write(0);
        storage.exchange_rate.write(10000);
        storage.next_request_id.write(1);
    }

    // ============ ADMIN FUNCTIONS ============
    #[public]
    fn set_staked_aztec_token(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set token address");
        storage.staked_aztec_token.write(address);
    }

    #[public]
    fn set_withdrawal_queue(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set queue address");
        storage.withdrawal_queue.write(address);
    }

    #[public]
    fn set_validator_registry(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set registry address");
        storage.validator_registry.write(address);
    }

    #[public]
    fn set_vault_manager(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set vault manager address");
        storage.vault_manager.write(address);
    }

    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set new admin");
        storage.admin.write(new_admin);
    }

    #[public]
    fn set_paused(paused_: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can pause/unpause");
        storage.paused.write(paused_);
    }

    // ============ CORE STAKING FUNCTIONS ============
    #[public]
    fn deposit(amount: u128) -> pub u128 {
        let paused = storage.paused.read();
        assert(!paused, "Contract is paused");
        assert(amount > 0, "Amount must be greater than zero");

        let caller = context.msg_sender();

        // Get current exchange rate
        let rate = storage.exchange_rate.read();

        // Calculate stAZTEC to mint: (amount * 10000) / exchange_rate
        let st_aztec_amount = (amount * (BASIS_POINTS as u128)) / (rate as u128);

        // Update pending pool
        let current_pending = storage.pending_pool.read();
        storage.pending_pool.write(current_pending + amount);

        // Update total deposited
        let current_total = storage.total_deposited.read();
        storage.total_deposited.write(current_total + amount);

        // Check if we've reached batch threshold
        let new_pending = current_pending + amount;
        let should_stake = new_pending >= BATCH_THRESHOLD;

        // Note: In production, this would:
        // 1. Transfer AZTEC tokens from caller to this contract
        // 2. Call staked_aztec_token.mint(caller, st_aztec_amount)
        // 3. If should_stake is true, trigger batch staking to validators
        // For now, we just track the accounting

        st_aztec_amount
    }

    #[public]
    fn request_withdrawal(st_aztec_amount: u128) -> pub u64 {
        let paused = storage.paused.read();
        assert(!paused, "Contract is paused");
        assert(st_aztec_amount > 0, "Amount must be greater than zero");

        let caller = context.msg_sender();

        // Get exchange rate
        let rate = storage.exchange_rate.read();

        // Calculate AZTEC amount: (st_aztec_amount * exchange_rate) / 10000
        let aztec_amount = (st_aztec_amount * (rate as u128)) / (BASIS_POINTS as u128);

        // Generate request ID
        let request_id = storage.next_request_id.read();
        storage.next_request_id.write(request_id + 1);

        // Store withdrawal request info
        storage.withdrawal_request_user.at(request_id).write(caller);
        storage.withdrawal_request_amount.at(request_id).write(aztec_amount);

        // Note: In production, this would:
        // 1. Call staked_aztec_token.burn(caller, st_aztec_amount)
        // 2. Call withdrawal_queue.add_request(caller, st_aztec_amount, aztec_amount, current_timestamp)
        // 3. Update liquidity accounting
        // For now, we just track the request

        request_id
    }

    // ============ BATCH STAKING ============
    #[public]
    fn trigger_batch_stake() {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can trigger batch stake");

        let pending = storage.pending_pool.read();
        assert(pending >= BATCH_THRESHOLD, "Pending pool below threshold");

        // Move pending to staked
        let current_staked = storage.total_staked.read();
        storage.total_staked.write(current_staked + pending);
        storage.pending_pool.write(0);

        // Note: In production, this would:
        // 1. Select validators from validator_registry
        // 2. Distribute funds across selected validators
        // 3. Call vault_manager to deploy to vaults
        // 4. Update validator balances
    }

    // ============ LIQUIDITY MANAGEMENT ============
    #[public]
    fn set_liquidity_buffer(amount: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set liquidity buffer");
        storage.liquidity_buffer.write(amount);
    }

    #[public]
    fn update_exchange_rate(new_rate: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can update exchange rate");

        let current_rate = storage.exchange_rate.read();
        assert(new_rate >= current_rate, "Rate can only increase or stay same");

        storage.exchange_rate.write(new_rate);
    }

    // ============ VIEW FUNCTIONS ============
    #[public]
    #[view]
    fn get_pending_pool() -> pub u128 {
        storage.pending_pool.read()
    }

    #[public]
    #[view]
    fn get_total_deposited() -> pub u128 {
        storage.total_deposited.read()
    }

    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked.read()
    }

    #[public]
    #[view]
    fn get_exchange_rate() -> pub u64 {
        storage.exchange_rate.read()
    }

    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    #[public]
    #[view]
    fn get_liquidity_buffer() -> pub u128 {
        storage.liquidity_buffer.read()
    }

    #[public]
    #[view]
    fn get_admin() -> pub AztecAddress {
        storage.admin.read()
    }

    #[public]
    #[view]
    fn get_staked_aztec_token() -> pub AztecAddress {
        storage.staked_aztec_token.read()
    }

    #[public]
    #[view]
    fn get_withdrawal_queue() -> pub AztecAddress {
        storage.withdrawal_queue.read()
    }

    #[public]
    #[view]
    fn get_validator_registry() -> pub AztecAddress {
        storage.validator_registry.read()
    }

    #[public]
    #[view]
    fn get_vault_manager() -> pub AztecAddress {
        storage.vault_manager.read()
    }

    #[public]
    #[view]
    fn get_withdrawal_request_user(request_id: u64) -> pub AztecAddress {
        storage.withdrawal_request_user.at(request_id).read()
    }

    #[public]
    #[view]
    fn get_withdrawal_request_amount(request_id: u64) -> pub u128 {
        storage.withdrawal_request_amount.at(request_id).read()
    }

    #[public]
    #[view]
    fn calculate_st_aztec_for_aztec(aztec_amount: u128) -> pub u128 {
        let rate = storage.exchange_rate.read();
        (aztec_amount * (BASIS_POINTS as u128)) / (rate as u128)
    }

    #[public]
    #[view]
    fn calculate_aztec_for_st_aztec(st_aztec_amount: u128) -> pub u128 {
        let rate = storage.exchange_rate.read();
        (st_aztec_amount * (rate as u128)) / (BASIS_POINTS as u128)
    }
}
