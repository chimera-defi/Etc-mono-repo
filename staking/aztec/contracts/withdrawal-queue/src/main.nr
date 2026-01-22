// WithdrawalQueue Contract - FIFO Withdrawal Queue with Unbonding
// Simplified for MVP - v3.0.x API

use dep::aztec::macros::aztec;

#[aztec]
pub contract WithdrawalQueue {
    use dep::aztec::protocol_types::{
        address::AztecAddress,
        abis::function_selector::FunctionSelector,
        traits::ToField,
    };
    use dep::aztec::context::gas::GasOpts;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{external, initializer, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Queue management
        next_request_id: PublicMutable<u64, Context>,
        total_pending: PublicMutable<u128, Context>,

        // Request data (indexed by request_id)
        request_user: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        request_aztec_amount: Map<u64, PublicMutable<u128, Context>, Context>,
        request_timestamp: Map<u64, PublicMutable<u64, Context>, Context>,
        request_fulfilled: Map<u64, PublicMutable<bool, Context>, Context>,

        // Access control
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,

        // Configuration
        unbonding_period: PublicMutable<u64, Context>,

        // Token contract
        aztec_token: PublicMutable<AztecAddress, Context>,
    }

    // ============ INITIALIZER ============
    #[external("public")]
    #[initializer]
    fn constructor(admin_: AztecAddress, unbonding_period_: u64) {
        self.storage.admin.write(admin_);
        self.storage.next_request_id.write(1);
        self.storage.total_pending.write(0);
        self.storage.unbonding_period.write(unbonding_period_);
    }

    // ============ ADMIN FUNCTIONS ============
    #[external("public")]
    fn set_liquid_staking_core(core_address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin");
        self.storage.liquid_staking_core.write(core_address);
    }

    #[external("public")]
    fn set_aztec_token(token_address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin");
        self.storage.aztec_token.write(token_address);
    }

    #[external("public")]
    fn set_admin(new_admin: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin");
        self.storage.admin.write(new_admin);
    }

    // ============ QUEUE OPERATIONS ============

    /// Add a withdrawal request to the queue
    /// Only callable by LiquidStakingCore
    #[external("public")]
    fn add_request(
        user: AztecAddress,
        aztec_amount: u128,
        timestamp: u64
    ) -> u64 {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore");

        let request_id = self.storage.next_request_id.read();
        self.storage.next_request_id.write(request_id + 1);

        self.storage.request_user.at(request_id).write(user);
        self.storage.request_aztec_amount.at(request_id).write(aztec_amount);
        self.storage.request_timestamp.at(request_id).write(timestamp);
        self.storage.request_fulfilled.at(request_id).write(false);

        let total = self.storage.total_pending.read();
        self.storage.total_pending.write(total + aztec_amount);

        request_id
    }

    /// Claim a completed withdrawal after unbonding period
    #[external("public")]
    fn claim_withdrawal(request_id: u64, current_timestamp: u64) -> u128 {
        let caller = self.msg_sender().unwrap();

        let user = self.storage.request_user.at(request_id).read();
        assert(caller == user, "Not your request");

        let fulfilled = self.storage.request_fulfilled.at(request_id).read();
        assert(!fulfilled, "Already claimed");

        let request_timestamp = self.storage.request_timestamp.at(request_id).read();
        let unbonding_period = self.storage.unbonding_period.read();
        assert(
            current_timestamp >= request_timestamp + unbonding_period,
            "Unbonding not complete"
        );

        self.storage.request_fulfilled.at(request_id).write(true);

        let aztec_amount = self.storage.request_aztec_amount.at(request_id).read();
        let total = self.storage.total_pending.read();
        self.storage.total_pending.write(total - aztec_amount);

        // Transfer AZTEC to user
        let selector = FunctionSelector::from_signature("transfer_in_public((Field),(Field),u128,Field)");
        let token = self.storage.aztec_token.read();
        let _ = self.context.call_public_function(
            token,
            selector,
            [self.address.to_field(), user.to_field(), aztec_amount as Field, 0],
            GasOpts::default()
        );

        aztec_amount
    }

    /// Fund the queue with AZTEC for withdrawals
    #[external("public")]
    fn fund_withdrawals(amount: u128, nonce: Field) {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        let admin = self.storage.admin.read();
        assert((caller == core) | (caller == admin), "Only core or admin");

        let selector = FunctionSelector::from_signature("transfer_in_public((Field),(Field),u128,Field)");
        let token = self.storage.aztec_token.read();
        let _ = self.context.call_public_function(
            token,
            selector,
            [caller.to_field(), self.address.to_field(), amount as Field, nonce],
            GasOpts::default()
        );
    }

    // ============ VIEW FUNCTIONS ============

    /// Get full request details for frontend
    #[external("public")]
    #[view]
    fn get_request(request_id: u64) -> (AztecAddress, u128, u64, bool) {
        let user = self.storage.request_user.at(request_id).read();
        let amount = self.storage.request_aztec_amount.at(request_id).read();
        let timestamp = self.storage.request_timestamp.at(request_id).read();
        let fulfilled = self.storage.request_fulfilled.at(request_id).read();
        (user, amount, timestamp, fulfilled)
    }

    #[external("public")]
    #[view]
    fn get_request_amount(request_id: u64) -> u128 {
        self.storage.request_aztec_amount.at(request_id).read()
    }

    #[external("public")]
    #[view]
    fn get_request_user(request_id: u64) -> AztecAddress {
        self.storage.request_user.at(request_id).read()
    }

    #[external("public")]
    #[view]
    fn get_request_timestamp(request_id: u64) -> u64 {
        self.storage.request_timestamp.at(request_id).read()
    }

    #[external("public")]
    #[view]
    fn is_request_fulfilled(request_id: u64) -> bool {
        self.storage.request_fulfilled.at(request_id).read()
    }

    #[external("public")]
    #[view]
    fn is_claimable(request_id: u64, current_timestamp: u64) -> bool {
        let fulfilled = self.storage.request_fulfilled.at(request_id).read();
        let request_timestamp = self.storage.request_timestamp.at(request_id).read();
        let unbonding_period = self.storage.unbonding_period.read();

        !fulfilled & (current_timestamp >= request_timestamp + unbonding_period)
    }

    /// Calculate time remaining until claimable
    #[external("public")]
    #[view]
    fn time_until_claimable(request_id: u64, current_timestamp: u64) -> u64 {
        let request_timestamp = self.storage.request_timestamp.at(request_id).read();
        let unbonding_period = self.storage.unbonding_period.read();
        let claimable_at = request_timestamp + unbonding_period;

        if current_timestamp >= claimable_at {
            0
        } else {
            claimable_at - current_timestamp
        }
    }

    #[external("public")]
    #[view]
    fn get_total_pending() -> u128 {
        self.storage.total_pending.read()
    }

    #[external("public")]
    #[view]
    fn get_unbonding_period() -> u64 {
        self.storage.unbonding_period.read()
    }

    #[external("public")]
    #[view]
    fn get_next_request_id() -> u64 {
        self.storage.next_request_id.read()
    }
}
