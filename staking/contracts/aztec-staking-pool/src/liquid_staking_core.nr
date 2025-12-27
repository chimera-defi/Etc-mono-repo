// LiquidStakingCore.nr - Main Entry Point for Aztec Liquid Staking
// Aztec v2.1.9 compatible
// Coordinates deposits, withdrawals, and integrates all components

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
        // Admin address
        admin: PublicMutable<AztecAddress, Context>,

        // Component contract addresses
        st_aztec_token: PublicMutable<AztecAddress, Context>,
        withdrawal_queue: PublicMutable<AztecAddress, Context>,
        vault_manager: PublicMutable<AztecAddress, Context>,
        rewards_manager: PublicMutable<AztecAddress, Context>,

        // AZTEC token address (native staking token)
        aztec_token: PublicMutable<AztecAddress, Context>,

        // Protocol statistics
        total_deposited: PublicMutable<u128, Context>,
        total_withdrawn: PublicMutable<u128, Context>,
        total_users: PublicMutable<u64, Context>,

        // User tracking (has deposited before)
        user_deposited: Map<AztecAddress, PublicMutable<bool, Context>, Context>,

        // Protocol fee (basis points, 1000 = 10%)
        protocol_fee_bps: PublicMutable<u64, Context>,

        // Fee recipient (treasury)
        fee_recipient: PublicMutable<AztecAddress, Context>,

        // Paused state
        paused: PublicMutable<bool, Context>,

        // Minimum deposit amount (to prevent dust attacks)
        min_deposit: PublicMutable<u128, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(
        admin: AztecAddress,
        aztec_token: AztecAddress,
        st_aztec_token: AztecAddress,
        withdrawal_queue: AztecAddress,
        vault_manager: AztecAddress,
        fee_recipient: AztecAddress,
    ) {
        storage.admin.write(admin);
        storage.aztec_token.write(aztec_token);
        storage.st_aztec_token.write(st_aztec_token);
        storage.withdrawal_queue.write(withdrawal_queue);
        storage.vault_manager.write(vault_manager);
        storage.fee_recipient.write(fee_recipient);
        storage.rewards_manager.write(AztecAddress::from_field(0)); // Set later

        storage.total_deposited.write(0);
        storage.total_withdrawn.write(0);
        storage.total_users.write(0);
        storage.protocol_fee_bps.write(1000); // 10% default fee
        storage.paused.write(false);
        storage.min_deposit.write(1_000_000_000_000_000_000); // 1 AZTEC minimum
    }

    // ============ DEPOSIT FUNCTIONS ============

    /// Deposit AZTEC and receive stAZTEC
    /// User must have approved this contract to spend their AZTEC
    /// Returns: amount of stAZTEC minted
    #[public]
    fn deposit(amount: u128) -> pub u128 {
        assert(!storage.paused.read(), "Protocol is paused");
        assert(amount > 0, "Amount must be positive");

        let min_deposit = storage.min_deposit.read();
        assert(amount >= min_deposit, "Below minimum deposit");

        let depositor = context.msg_sender();

        // Get component addresses
        let st_aztec_token = storage.st_aztec_token.read();
        let vault_manager = storage.vault_manager.read();

        // Calculate stAZTEC amount based on current exchange rate
        // exchange_rate is in basis points (10000 = 1.0)
        // st_aztec_amount = aztec_amount * 10000 / exchange_rate
        let exchange_rate = get_exchange_rate_internal();
        let st_aztec_amount = (amount * 10000) / (exchange_rate as u128);

        assert(st_aztec_amount > 0, "stAZTEC amount too small");

        // Track new user
        let has_deposited = storage.user_deposited.at(depositor).read();
        if !has_deposited {
            storage.user_deposited.at(depositor).write(true);
            let total_users = storage.total_users.read();
            storage.total_users.write(total_users + 1);
        }

        // Update statistics
        let total = storage.total_deposited.read();
        storage.total_deposited.write(total + amount);

        // TODO: Transfer AZTEC from depositor to this contract
        // Token::at(aztec_token).transfer_from(depositor, context.this_address(), amount, 0).call(&mut context);

        // TODO: Call StakedAztecToken to mint stAZTEC to depositor
        // StakedAztecToken::at(st_aztec_token).mint(depositor, st_aztec_amount).call(&mut context);

        // TODO: Call VaultManager to add to pending pool
        // VaultManager::at(vault_manager).add_to_pending_pool(amount).call(&mut context);

        st_aztec_amount
    }

    // ============ WITHDRAWAL FUNCTIONS ============

    /// Request withdrawal by burning stAZTEC
    /// Adds request to withdrawal queue with 7-day unbonding
    /// Returns: request_id for tracking
    #[public]
    fn request_withdrawal(st_aztec_amount: u128) -> pub u64 {
        assert(!storage.paused.read(), "Protocol is paused");
        assert(st_aztec_amount > 0, "Amount must be positive");

        let withdrawer = context.msg_sender();

        // Get component addresses
        let st_aztec_token = storage.st_aztec_token.read();
        let withdrawal_queue = storage.withdrawal_queue.read();

        // Calculate AZTEC amount based on current exchange rate
        let exchange_rate = get_exchange_rate_internal();
        let aztec_amount = (st_aztec_amount * (exchange_rate as u128)) / 10000;

        assert(aztec_amount > 0, "AZTEC amount too small");

        // Update statistics
        let total = storage.total_withdrawn.read();
        storage.total_withdrawn.write(total + aztec_amount);

        // TODO: Call StakedAztecToken to burn stAZTEC from withdrawer
        // StakedAztecToken::at(st_aztec_token).burn(withdrawer, st_aztec_amount).call(&mut context);

        // TODO: Call WithdrawalQueue to add request
        // let request_id = WithdrawalQueue::at(withdrawal_queue).add_withdrawal_request(withdrawer, aztec_amount).call(&mut context);

        // Placeholder return - in production this would be the actual request_id
        let next_id = storage.total_withdrawn.read() as u64; // Temporary placeholder
        next_id
    }

    /// Claim a fulfilled withdrawal
    /// Called after unbonding period has passed and request processed
    /// Returns: AZTEC amount received
    #[public]
    fn claim_withdrawal(request_id: u64) -> pub u128 {
        assert(!storage.paused.read(), "Protocol is paused");

        let claimer = context.msg_sender();
        let withdrawal_queue = storage.withdrawal_queue.read();
        let aztec_token = storage.aztec_token.read();

        // TODO: Call WithdrawalQueue to claim and get amount
        // let amount = WithdrawalQueue::at(withdrawal_queue).claim_withdrawal(request_id).call(&mut context);

        // TODO: Transfer AZTEC to claimer
        // Token::at(aztec_token).transfer(claimer, amount).call(&mut context);

        // Placeholder return
        0
    }

    /// Check withdrawal request status
    #[public]
    #[view]
    fn get_withdrawal_status(request_id: u64) -> pub (bool, bool, u128) {
        let withdrawal_queue = storage.withdrawal_queue.read();

        // TODO: Call WithdrawalQueue to check status
        // let (fulfilled, ready, amount) = WithdrawalQueue::at(withdrawal_queue).check_request_status(request_id).call(&mut context);

        // Placeholder return
        (false, false, 0)
    }

    // ============ EXCHANGE RATE ============

    /// Internal: Get current exchange rate from stAZTEC token
    fn get_exchange_rate_internal() -> u64 {
        // TODO: Call StakedAztecToken to get exchange rate
        // let st_aztec_token = storage.st_aztec_token.read();
        // StakedAztecToken::at(st_aztec_token).get_exchange_rate().call(&mut context);

        // Placeholder: 1:1 initial rate
        10000
    }

    /// Get current exchange rate (public view)
    #[public]
    #[view]
    fn get_exchange_rate() -> pub u64 {
        // In production, read from stAZTEC token
        // For now, return base rate
        10000
    }

    // ============ REWARDS MANAGEMENT ============

    /// Trigger rewards collection and exchange rate update
    /// Called by rewards keeper bot
    #[public]
    fn collect_and_distribute_rewards() {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        let rewards_manager = storage.rewards_manager.read();
        let st_aztec_token = storage.st_aztec_token.read();
        let fee_recipient = storage.fee_recipient.read();
        let protocol_fee_bps = storage.protocol_fee_bps.read();

        // TODO: Implement rewards collection
        // 1. Query validator rewards
        // 2. Calculate new exchange rate
        // 3. Take protocol fee
        // 4. Update stAZTEC exchange rate
    }

    // ============ VIEW FUNCTIONS ============

    /// Get protocol statistics
    #[public]
    #[view]
    fn get_protocol_stats() -> pub (u128, u128, u64) {
        let deposited = storage.total_deposited.read();
        let withdrawn = storage.total_withdrawn.read();
        let users = storage.total_users.read();

        (deposited, withdrawn, users)
    }

    /// Get TVL (Total Value Locked)
    #[public]
    #[view]
    fn get_tvl() -> pub u128 {
        let deposited = storage.total_deposited.read();
        let withdrawn = storage.total_withdrawn.read();

        if deposited > withdrawn {
            deposited - withdrawn
        } else {
            0
        }
    }

    /// Get component addresses
    #[public]
    #[view]
    fn get_component_addresses() -> pub (AztecAddress, AztecAddress, AztecAddress, AztecAddress) {
        let st_aztec = storage.st_aztec_token.read();
        let queue = storage.withdrawal_queue.read();
        let vault = storage.vault_manager.read();
        let rewards = storage.rewards_manager.read();

        (st_aztec, queue, vault, rewards)
    }

    /// Check if user has deposited
    #[public]
    #[view]
    fn has_user_deposited(user: AztecAddress) -> pub bool {
        storage.user_deposited.at(user).read()
    }

    /// Get protocol fee
    #[public]
    #[view]
    fn get_protocol_fee_bps() -> pub u64 {
        storage.protocol_fee_bps.read()
    }

    /// Get minimum deposit
    #[public]
    #[view]
    fn get_min_deposit() -> pub u128 {
        storage.min_deposit.read()
    }

    /// Check if protocol is paused
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    // ============ ADMIN FUNCTIONS ============

    /// Set rewards manager address
    #[public]
    fn set_rewards_manager(rewards_manager: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.rewards_manager.write(rewards_manager);
    }

    /// Set protocol fee (max 20%)
    #[public]
    fn set_protocol_fee(fee_bps: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        assert(fee_bps <= 2000, "Fee too high (max 20%)");

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

    /// Set minimum deposit
    #[public]
    fn set_min_deposit(min_amount: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.min_deposit.write(min_amount);
    }

    /// Transfer admin
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.admin.write(new_admin);
    }

    /// Emergency pause
    #[public]
    fn set_paused(paused: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.paused.write(paused);
    }

    /// Update component address (for upgrades)
    #[public]
    fn update_component(component_type: u8, new_address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        // 0 = stAZTEC token, 1 = withdrawal queue, 2 = vault manager, 3 = rewards manager
        if component_type == 0 {
            storage.st_aztec_token.write(new_address);
        } else if component_type == 1 {
            storage.withdrawal_queue.write(new_address);
        } else if component_type == 2 {
            storage.vault_manager.write(new_address);
        } else if component_type == 3 {
            storage.rewards_manager.write(new_address);
        }
    }
}
