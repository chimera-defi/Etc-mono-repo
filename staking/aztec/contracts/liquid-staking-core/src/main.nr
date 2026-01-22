// LiquidStakingCore Contract - Main Entry Point for Aztec Liquid Staking
// Production-ready MVP - v3.0.x API
//
// Architecture:
// - Users deposit AZTEC -> receive stAZTEC at current exchange rate
// - Users request withdrawal -> burn stAZTEC -> enter WithdrawalQueue
// - After unbonding period -> users claim AZTEC from queue
// - Exchange rate only increases (rewards accrue to stAZTEC holders)

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

    // ============ CONSTANTS ============
    global MIN_DEPOSIT: u128 = 1_000_000_000_000_000_000;  // 1 AZTEC minimum (18 decimals)
    global RATE_SCALE: u128 = 10000;

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
    /// Exchange rate is read from StakedAztecToken (source of truth)
    /// nonce: Authorization nonce for AZTEC token transfer
    #[external("public")]
    fn deposit(amount: u128, nonce: Field) -> u128 {
        assert(!self.storage.paused.read(), "Contract is paused");
        assert(amount >= MIN_DEPOSIT, "Deposit below minimum");

        let depositor = self.msg_sender().unwrap();

        // Step 1: Transfer AZTEC from depositor to this contract
        let transfer_selector = FunctionSelector::from_signature("transfer_in_public((Field),(Field),u128,Field)");
        let token = self.storage.aztec_token.read();
        let _ = self.context.call_public_function(
            token,
            transfer_selector,
            [depositor.to_field(), self.address.to_field(), amount as Field, nonce],
            GasOpts::default()
        );

        // Step 2: Get current exchange rate from StakedAztecToken
        let rate_selector = FunctionSelector::from_signature("get_exchange_rate()");
        let staked_token = self.storage.staked_aztec_token.read();
        let rate_result = self.context.call_public_function(
            staked_token,
            rate_selector,
            [],
            GasOpts::default()
        );
        let exchange_rate = rate_result[0] as u64;

        // Step 3: Calculate stAZTEC to mint: amount * RATE_SCALE / rate
        let st_aztec_amount = (amount * RATE_SCALE) / (exchange_rate as u128);
        assert(st_aztec_amount > 0, "Deposit too small for current rate");

        // Step 4: Update accounting
        let pending = self.storage.pending_pool.read();
        self.storage.pending_pool.write(pending + amount);
        let total = self.storage.total_deposited.read();
        self.storage.total_deposited.write(total + amount);

        // Step 5: Mint stAZTEC to depositor (includes AZTEC backing tracking)
        let mint_selector = FunctionSelector::from_signature("mint((Field),u128,u128)");
        let _ = self.context.call_public_function(
            staked_token,
            mint_selector,
            [depositor.to_field(), st_aztec_amount as Field, amount as Field],
            GasOpts::default()
        );

        st_aztec_amount
    }

    /// Request withdrawal - burns stAZTEC and queues AZTEC withdrawal
    /// timestamp: Current block timestamp (for unbonding calculation)
    #[external("public")]
    fn request_withdrawal(st_aztec_amount: u128, timestamp: u64) -> u64 {
        assert(!self.storage.paused.read(), "Contract is paused");
        assert(st_aztec_amount > 0, "Amount must be positive");

        let withdrawer = self.msg_sender().unwrap();

        // Step 1: Burn stAZTEC and get AZTEC amount back (rate handled by token contract)
        let burn_selector = FunctionSelector::from_signature("burn((Field),u128)");
        let staked_token = self.storage.staked_aztec_token.read();
        let burn_result = self.context.call_public_function(
            staked_token,
            burn_selector,
            [withdrawer.to_field(), st_aztec_amount as Field],
            GasOpts::default()
        );
        let aztec_amount = burn_result[0] as u128;
        assert(aztec_amount > 0, "Withdrawal too small");

        // Step 2: Add to withdrawal queue
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
        assert(pending >= amount, "Insufficient pending pool");
        self.storage.pending_pool.write(pending - amount);

        let staked = self.storage.total_staked.read();
        self.storage.total_staked.write(staked + amount);
    }

    /// Add rewards (called by admin after claiming from validators)
    /// This increases the exchange rate for all stAZTEC holders
    #[external("public")]
    fn add_rewards(amount: u128) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");
        assert(amount > 0, "Amount must be positive");

        // Calculate protocol fee
        let fee_bps = self.storage.protocol_fee_bps.read();
        let fee = (amount * (fee_bps as u128)) / RATE_SCALE;
        let net_rewards = amount - fee;

        // Update accumulated fees
        let fees = self.storage.accumulated_fees.read();
        self.storage.accumulated_fees.write(fees + fee);

        // Update total deposited
        let total = self.storage.total_deposited.read();
        self.storage.total_deposited.write(total + net_rewards);

        // Update exchange rate in StakedAztecToken
        let reward_selector = FunctionSelector::from_signature("add_rewards(u128)");
        let staked_token = self.storage.staked_aztec_token.read();
        let _ = self.context.call_public_function(
            staked_token,
            reward_selector,
            [net_rewards as Field],
            GasOpts::default()
        );
    }

    /// Collect accumulated protocol fees to treasury
    #[external("public")]
    fn collect_fees(nonce: Field) -> u128 {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");

        let fees = self.storage.accumulated_fees.read();
        assert(fees > 0, "No fees to collect");

        // Reset accumulated fees
        self.storage.accumulated_fees.write(0);

        // Transfer fees to treasury
        let treasury = self.storage.treasury.read();
        let transfer_selector = FunctionSelector::from_signature("transfer_in_public((Field),(Field),u128,Field)");
        let token = self.storage.aztec_token.read();
        let _ = self.context.call_public_function(
            token,
            transfer_selector,
            [self.address.to_field(), treasury.to_field(), fees as Field, nonce],
            GasOpts::default()
        );

        fees
    }

    /// Fund the withdrawal queue with AZTEC (admin operation)
    #[external("public")]
    fn fund_withdrawal_queue(amount: u128, nonce: Field) {
        let caller = self.msg_sender().unwrap();
        assert(caller == self.storage.admin.read(), "Only admin");

        let queue = self.storage.withdrawal_queue.read();
        let fund_selector = FunctionSelector::from_signature("fund_withdrawals(u128,Field)");
        let _ = self.context.call_public_function(
            queue,
            fund_selector,
            [amount as Field, nonce],
            GasOpts::default()
        );
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
    fn get_accumulated_fees() -> u128 {
        self.storage.accumulated_fees.read()
    }

    #[external("public")]
    #[view]
    fn get_protocol_fee_bps() -> u64 {
        self.storage.protocol_fee_bps.read()
    }

    #[external("public")]
    #[view]
    fn is_paused() -> bool {
        self.storage.paused.read()
    }

    #[external("public")]
    #[view]
    fn get_min_deposit() -> u128 {
        MIN_DEPOSIT
    }

    /// Get contract configuration (for frontend)
    #[external("public")]
    #[view]
    fn get_staked_aztec_token() -> AztecAddress {
        self.storage.staked_aztec_token.read()
    }

    #[external("public")]
    #[view]
    fn get_withdrawal_queue() -> AztecAddress {
        self.storage.withdrawal_queue.read()
    }

    #[external("public")]
    #[view]
    fn get_aztec_token() -> AztecAddress {
        self.storage.aztec_token.read()
    }

    #[external("public")]
    #[view]
    fn get_treasury() -> AztecAddress {
        self.storage.treasury.read()
    }
}
