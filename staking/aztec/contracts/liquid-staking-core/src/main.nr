// LiquidStakingCore Contract - Main Entry Point for Aztec Liquid Staking
// Simplified MVP - v3.0.x API

use dep::aztec::macros::aztec;

#[aztec]
pub contract LiquidStakingCore {
    use dep::aztec::protocol_types::{
        address::AztecAddress,
        abis::function_selector::FunctionSelector,
        traits::ToField,
    };
    use dep::aztec::context::gas::GasOpts;
    use dep::aztec::state_vars::PublicMutable;
    use dep::aztec::macros::{
        functions::{external, initializer, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Accounting
        total_deposited: PublicMutable<u128, Context>,
        pending_pool: PublicMutable<u128, Context>,
        total_staked: PublicMutable<u128, Context>,

        // Protocol fee (basis points, 1000 = 10%)
        protocol_fee_bps: PublicMutable<u64, Context>,
        treasury: PublicMutable<AztecAddress, Context>,
        accumulated_fees: PublicMutable<u128, Context>,

        // Contract references
        staked_aztec_token: PublicMutable<AztecAddress, Context>,
        withdrawal_queue: PublicMutable<AztecAddress, Context>,
        aztec_token: PublicMutable<AztecAddress, Context>,

        // Access control
        admin: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[external("public")]
    #[initializer]
    fn constructor(admin_: AztecAddress, treasury_: AztecAddress, protocol_fee_bps_: u64) {
        assert(protocol_fee_bps_ <= 2000, "Fee cannot exceed 20%");

        self.storage.admin.write(admin_);
        self.storage.treasury.write(treasury_);
        self.storage.protocol_fee_bps.write(protocol_fee_bps_);
        self.storage.total_deposited.write(0);
        self.storage.pending_pool.write(0);
        self.storage.total_staked.write(0);
        self.storage.accumulated_fees.write(0);
        self.storage.paused.write(false);
    }

    // ============ ADMIN CONFIGURATION ============
    #[external("public")]
    fn set_staked_aztec_token(address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");
        self.storage.staked_aztec_token.write(address);
    }

    #[external("public")]
    fn set_withdrawal_queue(address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");
        self.storage.withdrawal_queue.write(address);
    }

    #[external("public")]
    fn set_aztec_token(address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");
        self.storage.aztec_token.write(address);
    }

    #[external("public")]
    fn set_admin(new_admin: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");
        self.storage.admin.write(new_admin);
    }

    #[external("public")]
    fn set_paused(paused_: bool) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");
        self.storage.paused.write(paused_);
    }

    // ============ CORE STAKING FUNCTIONS ============

    /// Deposit AZTEC and receive stAZTEC tokens
    #[external("public")]
    fn deposit(amount: u128, exchange_rate: u64, nonce: Field) -> u128 {
        assert(!self.storage.paused.read(), "Paused");
        assert(amount > 0, "Amount must be positive");
        assert(exchange_rate > 0, "Rate must be positive");

        let depositor = self.msg_sender().unwrap();

        // Calculate stAZTEC: amount * 10000 / rate
        let st_aztec_amount = (amount * 10000) / (exchange_rate as u128);
        assert(st_aztec_amount > 0, "Deposit too small");

        // Update accounting
        let pending = self.storage.pending_pool.read();
        self.storage.pending_pool.write(pending + amount);
        let total = self.storage.total_deposited.read();
        self.storage.total_deposited.write(total + amount);

        // Transfer AZTEC from depositor
        let transfer_selector = FunctionSelector::from_signature("transfer_in_public((Field),(Field),u128,Field)");
        let token = self.storage.aztec_token.read();
        let _ = self.context.call_public_function(
            token,
            transfer_selector,
            [depositor.to_field(), self.address.to_field(), amount as Field, nonce],
            GasOpts::default()
        );

        // Mint stAZTEC to depositor
        let mint_selector = FunctionSelector::from_signature("mint((Field),u128)");
        let staked_token = self.storage.staked_aztec_token.read();
        let _ = self.context.call_public_function(
            staked_token,
            mint_selector,
            [depositor.to_field(), st_aztec_amount as Field],
            GasOpts::default()
        );

        st_aztec_amount
    }

    /// Request withdrawal - burns stAZTEC and queues AZTEC withdrawal
    #[external("public")]
    fn request_withdrawal(st_aztec_amount: u128, exchange_rate: u64, timestamp: u64) -> u64 {
        assert(!self.storage.paused.read(), "Paused");
        assert(st_aztec_amount > 0, "Amount must be positive");
        assert(exchange_rate > 0, "Rate must be positive");

        let withdrawer = self.msg_sender().unwrap();

        // Calculate AZTEC: stAZTEC * rate / 10000
        let aztec_amount = (st_aztec_amount * (exchange_rate as u128)) / 10000;
        assert(aztec_amount > 0, "Withdrawal too small");

        // Burn stAZTEC
        let burn_selector = FunctionSelector::from_signature("burn((Field),u128)");
        let staked_token = self.storage.staked_aztec_token.read();
        let _ = self.context.call_public_function(
            staked_token,
            burn_selector,
            [withdrawer.to_field(), st_aztec_amount as Field],
            GasOpts::default()
        );

        // Add to withdrawal queue
        let queue_selector = FunctionSelector::from_signature("add_request((Field),u128,u64)");
        let queue = self.storage.withdrawal_queue.read();
        let result = self.context.call_public_function(
            queue,
            queue_selector,
            [withdrawer.to_field(), aztec_amount as Field, timestamp as Field],
            GasOpts::default()
        );

        result[0] as u64
    }

    /// Notify that pool has been staked (called by admin/keeper)
    #[external("public")]
    fn notify_staked(amount: u128) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");

        let pending = self.storage.pending_pool.read();
        assert(pending >= amount, "Insufficient pending");
        self.storage.pending_pool.write(pending - amount);

        let staked = self.storage.total_staked.read();
        self.storage.total_staked.write(staked + amount);
    }

    /// Add rewards (called by admin after claiming from validators)
    #[external("public")]
    fn add_rewards(amount: u128) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");

        // Calculate protocol fee
        let fee_bps = self.storage.protocol_fee_bps.read();
        let fee = (amount * (fee_bps as u128)) / 10000;

        let fees = self.storage.accumulated_fees.read();
        self.storage.accumulated_fees.write(fees + fee);

        let total = self.storage.total_deposited.read();
        self.storage.total_deposited.write(total + amount - fee);
    }

    // ============ VIEW FUNCTIONS ============
    #[external("public")]
    #[view]
    fn get_total_deposited() -> u128 {
        self.storage.total_deposited.read()
    }

    #[external("public")]
    #[view]
    fn get_pending_pool() -> u128 {
        self.storage.pending_pool.read()
    }

    #[external("public")]
    #[view]
    fn get_total_staked() -> u128 {
        self.storage.total_staked.read()
    }

    #[external("public")]
    #[view]
    fn is_paused() -> bool {
        self.storage.paused.read()
    }
}
