// Aztec Liquid Staking Pool Contract
// Based on Aztec v2.1.9 patterns (PriceFeed, Lending contracts)
//
// This is a standalone staking pool with share-based accounting.
// It demonstrates the core deposit/withdraw patterns with proper
// cross-contract token transfers.

use dep::aztec::macros::aztec;

#[aztec]
pub contract StakingPool {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::protocol_types::abis::function_selector::FunctionSelector;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Pool state
        total_staked: PublicMutable<u128, Context>,
        total_shares: PublicMutable<u128, Context>,

        // User balances (shares held)
        shares: Map<AztecAddress, PublicMutable<u128, Context>, Context>,

        // Protocol configuration
        admin: PublicMutable<AztecAddress, Context>,
        fee_bps: PublicMutable<u64, Context>,  // 1000 = 10%
        fee_recipient: PublicMutable<AztecAddress, Context>,

        // Accumulated fees
        pending_fees: PublicMutable<u128, Context>,

        // Pause state for emergencies
        paused: PublicMutable<bool, Context>,
        
        // Token contract address
        staking_token: PublicMutable<AztecAddress, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin: AztecAddress, fee_bps: u64, fee_recipient: AztecAddress) {
        storage.admin.write(admin);
        storage.fee_bps.write(fee_bps);
        storage.fee_recipient.write(fee_recipient);
        storage.total_staked.write(0);
        storage.total_shares.write(0);
        storage.pending_fees.write(0);
        storage.paused.write(false);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    #[public]
    fn set_staking_token(token_address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.staking_token.write(token_address);
    }

    #[public]
    fn set_fee_bps(new_fee_bps: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        assert(new_fee_bps <= 3000, "Fee too high (max 30%)");

        storage.fee_bps.write(new_fee_bps);
    }

    #[public]
    fn set_paused(paused: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.paused.write(paused);
    }

    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.admin.write(new_admin);
    }
    
    #[public]
    fn set_fee_recipient(new_recipient: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.fee_recipient.write(new_recipient);
    }

    // ============ PUBLIC FUNCTIONS ============

    /// Deposit tokens and receive shares
    /// 
    /// IMPORTANT: User must create AuthWit BEFORE calling this function!
    /// The AuthWit authorizes this contract to pull tokens from the user.
    ///
    /// @param amount Amount of tokens to deposit
    /// @param nonce AuthWit nonce for token transfer
    /// @return Number of shares minted
    #[public]
    fn deposit(amount: u128, nonce: Field) -> pub u128 {
        assert(!storage.paused.read(), "Pool is paused");
        assert(amount > 0, "Amount must be positive");

        let caller = context.msg_sender();
        let this_address = context.this_address();
        let total_staked = storage.total_staked.read();
        let total_shares = storage.total_shares.read();

        // Calculate shares to mint
        // If pool is empty, 1:1 ratio
        // Otherwise, proportional to current share value
        let shares_to_mint = if total_staked == 0 {
            amount
        } else {
            (amount * total_shares) / total_staked
        };

        assert(shares_to_mint > 0, "Shares minted must be positive");

        // Execute token transfer: pull tokens from user to pool
        StakingPool::call_token_transfer_in_public(
            &mut context,
            storage.staking_token.read(),
            caller,
            this_address,
            amount,
            nonce
        );

        // Update totals
        storage.total_staked.write(total_staked + amount);
        storage.total_shares.write(total_shares + shares_to_mint);

        // Update user shares
        let current_shares = storage.shares.at(caller).read();
        storage.shares.at(caller).write(current_shares + shares_to_mint);

        shares_to_mint
    }

    /// Withdraw tokens by burning shares
    /// Returns: amount of tokens received
    #[public]
    fn withdraw(shares_to_burn: u128) -> pub u128 {
        assert(!storage.paused.read(), "Pool is paused");
        assert(shares_to_burn > 0, "Shares must be positive");

        let caller = context.msg_sender();
        let user_shares = storage.shares.at(caller).read();
        assert(user_shares >= shares_to_burn, "Insufficient shares");

        let total_staked = storage.total_staked.read();
        let total_shares = storage.total_shares.read();

        // Calculate tokens to return
        let tokens_to_return = (shares_to_burn * total_staked) / total_shares;

        // Calculate and deduct fee
        let fee_bps = storage.fee_bps.read();
        let fee_amount = (tokens_to_return * (fee_bps as u128)) / 10000;
        let net_amount = tokens_to_return - fee_amount;

        // Update totals
        storage.total_staked.write(total_staked - tokens_to_return);
        storage.total_shares.write(total_shares - shares_to_burn);
        storage.pending_fees.write(storage.pending_fees.read() + fee_amount);

        // Update user shares
        storage.shares.at(caller).write(user_shares - shares_to_burn);

        // Transfer tokens back to user
        StakingPool::call_token_transfer_in_public(
            &mut context,
            storage.staking_token.read(),
            context.this_address(),
            caller,
            net_amount,
            0 // nonce 0 for self-transfer
        );

        net_amount
    }

    /// Add staking rewards to the pool (increases share value)
    /// Only callable by admin
    /// 
    /// @param amount Amount of reward tokens to add
    /// @param nonce AuthWit nonce if admin is not this contract
    #[public]
    fn add_rewards(amount: u128, nonce: Field) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can add rewards");

        // Transfer reward tokens from admin to pool
        StakingPool::call_token_transfer_in_public(
            &mut context,
            storage.staking_token.read(),
            caller,
            context.this_address(),
            amount,
            nonce
        );

        let total_staked = storage.total_staked.read();
        storage.total_staked.write(total_staked + amount);
    }

    /// Collect accumulated fees
    /// Only callable by fee recipient
    #[public]
    fn collect_fees() -> pub u128 {
        let fee_recipient = storage.fee_recipient.read();
        let caller = context.msg_sender();
        assert(caller == fee_recipient, "Only fee recipient can collect");

        let fees = storage.pending_fees.read();
        storage.pending_fees.write(0);

        // Transfer fees to recipient
        if fees > 0 {
            StakingPool::call_token_transfer_in_public(
                &mut context,
                storage.staking_token.read(),
                context.this_address(),
                fee_recipient,
                fees,
                0 // nonce 0 for self-transfer
            );
        }

        fees
    }

    // ============ CROSS-CONTRACT CALL HELPERS ============
    
    /// Call Token.transfer_in_public to move tokens
    /// User must have authorized this via AuthWit before calling
    #[contract_library_method]
    fn call_token_transfer_in_public(
        context: &mut PublicContext,
        token_address: AztecAddress,
        from: AztecAddress,
        to: AztecAddress,
        amount: u128,
        nonce: Field
    ) {
        // Function signature: transfer_in_public(from: AztecAddress, to: AztecAddress, amount: u128, nonce: Field)
        let selector = FunctionSelector::from_signature("transfer_in_public((Field),(Field),u128,Field)");
        
        context.call_public_function(
            token_address,
            selector,
            [from.to_field(), to.to_field(), amount as Field, nonce].as_slice()
        );
    }

    // ============ VIEW FUNCTIONS ============

    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked.read()
    }

    #[public]
    #[view]
    fn get_total_shares() -> pub u128 {
        storage.total_shares.read()
    }

    #[public]
    #[view]
    fn get_share_balance(account: AztecAddress) -> pub u128 {
        storage.shares.at(account).read()
    }

    #[public]
    #[view]
    fn get_share_value() -> pub u128 {
        let total_staked = storage.total_staked.read();
        let total_shares = storage.total_shares.read();

        if total_shares == 0 {
            1_000_000_000_000_000_000 // 1e18 = 1:1 ratio
        } else {
            (total_staked * 1_000_000_000_000_000_000) / total_shares
        }
    }

    #[public]
    #[view]
    fn get_fee_bps() -> pub u64 {
        storage.fee_bps.read()
    }

    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    #[public]
    #[view]
    fn get_pending_fees() -> pub u128 {
        storage.pending_fees.read()
    }
    
    #[public]
    #[view]
    fn get_staking_token() -> pub AztecAddress {
        storage.staking_token.read()
    }

    /// Calculate how many shares a deposit would receive
    #[public]
    #[view]
    fn preview_deposit(amount: u128) -> pub u128 {
        let total_staked = storage.total_staked.read();
        let total_shares = storage.total_shares.read();

        if total_staked == 0 {
            amount
        } else {
            (amount * total_shares) / total_staked
        }
    }

    /// Calculate how many tokens a withdrawal would receive
    #[public]
    #[view]
    fn preview_withdraw(shares: u128) -> pub u128 {
        let total_staked = storage.total_staked.read();
        let total_shares = storage.total_shares.read();

        if total_shares == 0 {
            0
        } else {
            let gross = (shares * total_staked) / total_shares;
            let fee_bps = storage.fee_bps.read();
            let fee = (gross * (fee_bps as u128)) / 10000;
            gross - fee
        }
    }
}
