// Aztec Liquid Staking Pool Contract
// Based on Aztec v2.1.9 patterns (PriceFeed, Lending contracts)

use dep::aztec::macros::aztec;

#[aztec]
pub contract StakingPool {
    use dep::aztec::protocol_types::address::AztecAddress;
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

    // ============ PUBLIC FUNCTIONS ============

    /// Deposit tokens and receive shares
    /// Returns: number of shares minted
    #[public]
    fn deposit(amount: u128) -> pub u128 {
        assert(!storage.paused.read(), "Pool is paused");
        assert(amount > 0, "Amount must be positive");

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

        // Update totals
        storage.total_staked.write(total_staked + amount);
        storage.total_shares.write(total_shares + shares_to_mint);

        // Update user shares
        let caller = context.msg_sender();
        let current_shares = storage.shares.at(caller).read();
        storage.shares.at(caller).write(current_shares + shares_to_mint);

        // TODO(CRITICAL): Token transfer NOT IMPLEMENTED!
        // This contract does accounting only - NO actual AZTEC moves!
        // Either:
        // 1. This contract should call aztec_token.transfer_from(caller, this, amount)
        // 2. Or LiquidStakingCore should call this contract AND handle transfers
        // Currently NEITHER contract transfers tokens!
        // See: AGENT-PROMPTS-PHASE2.md PROMPT A

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

        // TODO(CRITICAL): Token transfer NOT IMPLEMENTED!
        // User's shares are burned but NO AZTEC is returned!
        // Required: aztec_token.transfer(caller, net_amount)
        // Currently user loses shares and gets nothing back!
        // See: AGENT-PROMPTS-PHASE2.md PROMPT A

        net_amount
    }

    /// Add staking rewards to the pool (increases share value)
    /// Only callable by admin
    #[public]
    fn add_rewards(amount: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can add rewards");

        let total_staked = storage.total_staked.read();
        storage.total_staked.write(total_staked + amount);

        // TODO(HIGH): Reward tokens NOT TRANSFERRED!
        // This increases total_staked but no actual rewards arrive!
        // In production: RewardsManager should transfer AZTEC here
        // Currently: Numbers go up but no real value added
        // See: AGENT-PROMPTS-PHASE2.md PROMPT B
    }

    /// Collect accumulated fees
    #[public]
    fn collect_fees() -> pub u128 {
        let fee_recipient = storage.fee_recipient.read();
        let caller = context.msg_sender();
        assert(caller == fee_recipient, "Only fee recipient can collect");

        let fees = storage.pending_fees.read();
        storage.pending_fees.write(0);

        // TODO(HIGH): Fee tokens NOT TRANSFERRED!
        // pending_fees reset to 0 but recipient gets nothing!
        // Required: aztec_token.transfer(fee_recipient, fees)
        // Currently: Fees are "collected" but no actual transfer
        // See: AGENT-PROMPTS-PHASE2.md PROMPT B

        fees
    }

    // ============ ADMIN FUNCTIONS ============

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
