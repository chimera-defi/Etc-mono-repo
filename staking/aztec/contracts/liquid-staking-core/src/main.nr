// LiquidStakingCore Contract - Main Entry Point for Aztec Liquid Staking
// TASK-105, TASK-106, TASK-107 implementation
//
// This contract is the primary interface for users:
// - deposit() - Accept AZTEC, mint stAZTEC
// - request_withdrawal() - Burn stAZTEC, queue withdrawal
// - claim_withdrawal() - Claim after unbonding period
//
// Cross-contract interactions:
// - StakedAztecToken: mint/burn stAZTEC
// - WithdrawalQueue: add/process withdrawal requests
// - VaultManager: manage validator batching
// - RewardsManager: track rewards and exchange rate

use dep::aztec::macros::aztec;

#[aztec]
pub contract LiquidStakingCore {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Minimum stake batch size (200,000 AZTEC in wei)
    // Using u128 max to avoid overflow issues
    global BATCH_SIZE: u128 = 200_000_000_000_000_000_000_000; // 200k * 1e18

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Accounting
        total_deposited: PublicMutable<u128, Context>,
        pending_pool: PublicMutable<u128, Context>,
        total_staked_to_validators: PublicMutable<u128, Context>,
        liquidity_buffer: PublicMutable<u128, Context>,
        
        // Protocol fee (in basis points, 1000 = 10%)
        protocol_fee_bps: PublicMutable<u64, Context>,
        treasury: PublicMutable<AztecAddress, Context>,
        accumulated_fees: PublicMutable<u128, Context>,
        
        // Contract references
        staked_aztec_token: PublicMutable<AztecAddress, Context>,
        withdrawal_queue: PublicMutable<AztecAddress, Context>,
        vault_manager: PublicMutable<AztecAddress, Context>,
        rewards_manager: PublicMutable<AztecAddress, Context>,
        aztec_token: PublicMutable<AztecAddress, Context>,
        
        // Access control
        admin: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,
        
        // User tracking for transparency
        total_users: PublicMutable<u64, Context>,
        user_deposits: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(
        admin_: AztecAddress,
        treasury_: AztecAddress,
        protocol_fee_bps_: u64
    ) {
        assert(protocol_fee_bps_ <= 2000, "Fee cannot exceed 20%");
        
        storage.admin.write(admin_);
        storage.treasury.write(treasury_);
        storage.protocol_fee_bps.write(protocol_fee_bps_);
        
        storage.total_deposited.write(0);
        storage.pending_pool.write(0);
        storage.total_staked_to_validators.write(0);
        storage.liquidity_buffer.write(0);
        storage.accumulated_fees.write(0);
        storage.total_users.write(0);
        storage.paused.write(false);
    }

    // ============ ADMIN CONFIGURATION ============
    #[public]
    fn set_staked_aztec_token(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.staked_aztec_token.write(address);
    }
    
    #[public]
    fn set_withdrawal_queue(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.withdrawal_queue.write(address);
    }
    
    #[public]
    fn set_vault_manager(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.vault_manager.write(address);
    }
    
    #[public]
    fn set_rewards_manager(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.rewards_manager.write(address);
    }
    
    #[public]
    fn set_aztec_token(address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.aztec_token.write(address);
    }
    
    #[public]
    fn set_protocol_fee(new_fee_bps: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        assert(new_fee_bps <= 2000, "Fee cannot exceed 20%");
        storage.protocol_fee_bps.write(new_fee_bps);
    }
    
    #[public]
    fn set_treasury(new_treasury: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.treasury.write(new_treasury);
    }
    
    #[public]
    fn set_paused(paused_: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.paused.write(paused_);
    }
    
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.admin.write(new_admin);
    }

    // ============ CORE STAKING FUNCTIONS ============
    
    /// Deposit AZTEC and receive stAZTEC tokens
    /// The depositor receives stAZTEC proportional to the current exchange rate
    /// No minimum deposit requirement - anyone can deposit any amount
    ///
    /// @param amount Amount of AZTEC to deposit (in wei)
    /// @param exchange_rate Current exchange rate from StakedAztecToken (basis points, 10000 = 1.0)
    /// @return Amount of stAZTEC tokens minted
    #[public]
    fn deposit(amount: u128, exchange_rate: u64) -> pub u128 {
        assert(!storage.paused.read(), "Contract is paused");
        assert(amount > 0, "Amount must be positive");
        assert(exchange_rate > 0, "Exchange rate must be positive");
        
        let depositor = context.msg_sender();
        
        // Calculate stAZTEC to mint based on exchange rate
        // stAZTEC = AZTEC * 10000 / exchange_rate
        // When rate is 10000 (1.0), 1 AZTEC = 1 stAZTEC
        // When rate is 12000 (1.2), 1 AZTEC = 0.833 stAZTEC (shares worth more)
        let st_aztec_amount = (amount * 10000) / (exchange_rate as u128);
        assert(st_aztec_amount > 0, "Deposit too small for current rate");
        
        // Update pending pool (awaiting batching to validators)
        let current_pool = storage.pending_pool.read();
        storage.pending_pool.write(current_pool + amount);
        
        // Update total deposited
        let total = storage.total_deposited.read();
        storage.total_deposited.write(total + amount);
        
        // Track user deposit (first-time users increment counter)
        let user_deposit = storage.user_deposits.at(depositor).read();
        if user_deposit == 0 {
            let users = storage.total_users.read();
            storage.total_users.write(users + 1);
        }
        storage.user_deposits.at(depositor).write(user_deposit + amount);
        
        // NOTE: Cross-contract calls to be implemented:
        // 1. Transfer AZTEC from depositor to this contract (requires AuthWit)
        // 2. Call StakedAztecToken.mint(depositor, st_aztec_amount)
        //
        // For now, this contract tracks accounting and external integration
        // is handled by the deployment/test environment
        
        st_aztec_amount
    }
    
    /// Request withdrawal - burns stAZTEC and queues AZTEC withdrawal
    /// The withdrawal enters an unbonding period before it can be claimed
    ///
    /// @param st_aztec_amount Amount of stAZTEC to burn
    /// @param exchange_rate Current exchange rate from StakedAztecToken
    /// @param timestamp Current timestamp for unbonding calculation
    /// @return Request ID from WithdrawalQueue
    #[public]
    fn request_withdrawal(
        st_aztec_amount: u128,
        exchange_rate: u64,
        timestamp: u64
    ) -> pub u64 {
        assert(!storage.paused.read(), "Contract is paused");
        assert(st_aztec_amount > 0, "Amount must be positive");
        assert(exchange_rate > 0, "Exchange rate must be positive");
        
        let withdrawer = context.msg_sender();
        
        // Calculate AZTEC amount based on exchange rate
        // AZTEC = stAZTEC * exchange_rate / 10000
        let aztec_amount = (st_aztec_amount * (exchange_rate as u128)) / 10000;
        assert(aztec_amount > 0, "Withdrawal too small");
        
        // Update accounting - reduce from liquidity buffer if available
        let buffer = storage.liquidity_buffer.read();
        let pending = storage.pending_pool.read();
        
        // First use liquidity buffer, then pending pool
        // This optimizes for instant withdrawals when possible
        if buffer >= aztec_amount {
            storage.liquidity_buffer.write(buffer - aztec_amount);
        } else if buffer + pending >= aztec_amount {
            let from_buffer = buffer;
            let from_pending = aztec_amount - from_buffer;
            storage.liquidity_buffer.write(0);
            storage.pending_pool.write(pending - from_pending);
        } else {
            // Full unbonding required - handled by WithdrawalQueue
            // The keeper bot will initiate validator unstaking
        }
        
        // Generate request ID (simple incrementing counter simulation)
        // In production, this comes from WithdrawalQueue.add_request()
        let total = storage.total_deposited.read();
        let request_id = ((total / 1_000_000_000_000_000_000) as u64) + timestamp;
        
        // NOTE: Cross-contract calls to be implemented:
        // 1. Call StakedAztecToken.burn(withdrawer, st_aztec_amount)
        // 2. Call WithdrawalQueue.add_request(withdrawer, st_aztec_amount, aztec_amount, timestamp)
        
        request_id
    }
    
    /// Notify that pool has been staked to a validator
    /// Called by VaultManager when 200k batch is staked
    ///
    /// @param amount Amount staked to validator
    #[public]
    fn notify_staked(amount: u128) {
        let caller = context.msg_sender();
        let vault = storage.vault_manager.read();
        let admin = storage.admin.read();
        let is_vault = caller == vault;
        let is_admin = caller == admin;
        assert(is_vault | is_admin, "Only VaultManager or admin");
        
        // Move from pending pool to staked
        let pending = storage.pending_pool.read();
        assert(pending >= amount, "Insufficient pending pool");
        storage.pending_pool.write(pending - amount);
        
        let staked = storage.total_staked_to_validators.read();
        storage.total_staked_to_validators.write(staked + amount);
    }
    
    /// Add rewards to the protocol (increases exchange rate)
    /// Called by RewardsManager after claiming validator rewards
    ///
    /// @param amount Gross rewards amount
    #[public]
    fn add_rewards(amount: u128) {
        let caller = context.msg_sender();
        let rewards_mgr = storage.rewards_manager.read();
        let admin = storage.admin.read();
        let is_rewards = caller == rewards_mgr;
        let is_admin = caller == admin;
        assert(is_rewards | is_admin, "Only RewardsManager or admin");
        
        // Calculate protocol fee
        let fee_bps = storage.protocol_fee_bps.read();
        let fee = (amount * (fee_bps as u128)) / 10000;
        let net_rewards = amount - fee;
        
        // Add fee to accumulated
        let fees = storage.accumulated_fees.read();
        storage.accumulated_fees.write(fees + fee);
        
        // Add net rewards to liquidity buffer (available for withdrawals)
        let buffer = storage.liquidity_buffer.read();
        storage.liquidity_buffer.write(buffer + net_rewards);
        
        // Total deposited increases (backs the stAZTEC)
        let total = storage.total_deposited.read();
        storage.total_deposited.write(total + net_rewards);
    }
    
    /// Collect accumulated protocol fees
    /// Sends fees to treasury address
    #[public]
    fn collect_fees() -> pub u128 {
        let caller = context.msg_sender();
        let treasury = storage.treasury.read();
        let admin = storage.admin.read();
        let is_treasury = caller == treasury;
        let is_admin = caller == admin;
        assert(is_treasury | is_admin, "Only treasury or admin");
        
        let fees = storage.accumulated_fees.read();
        storage.accumulated_fees.write(0);
        
        // NOTE: In production, transfer AZTEC tokens to treasury
        
        fees
    }
    
    /// Add to liquidity buffer (for instant withdrawals)
    /// Can be used by admin to seed initial liquidity
    #[public]
    fn add_liquidity(amount: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        
        let buffer = storage.liquidity_buffer.read();
        storage.liquidity_buffer.write(buffer + amount);
    }

    // ============ VIEW FUNCTIONS ============
    
    #[public]
    #[view]
    fn get_total_deposited() -> pub u128 {
        storage.total_deposited.read()
    }
    
    #[public]
    #[view]
    fn get_pending_pool() -> pub u128 {
        storage.pending_pool.read()
    }
    
    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked_to_validators.read()
    }
    
    #[public]
    #[view]
    fn get_liquidity_buffer() -> pub u128 {
        storage.liquidity_buffer.read()
    }
    
    #[public]
    #[view]
    fn get_accumulated_fees() -> pub u128 {
        storage.accumulated_fees.read()
    }
    
    #[public]
    #[view]
    fn get_protocol_fee() -> pub u64 {
        storage.protocol_fee_bps.read()
    }
    
    #[public]
    #[view]
    fn get_total_users() -> pub u64 {
        storage.total_users.read()
    }
    
    #[public]
    #[view]
    fn get_user_deposit(user: AztecAddress) -> pub u128 {
        storage.user_deposits.at(user).read()
    }
    
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }
    
    /// Check if pending pool is ready for batching
    /// Returns true if >= 200k AZTEC waiting
    #[public]
    #[view]
    fn is_batch_ready() -> pub bool {
        let pending = storage.pending_pool.read();
        pending >= BATCH_SIZE
    }
    
    /// Calculate stAZTEC amount for a given AZTEC deposit
    #[public]
    #[view]
    fn preview_deposit(amount: u128, exchange_rate: u64) -> pub u128 {
        if exchange_rate == 0 {
            0
        } else {
            (amount * 10000) / (exchange_rate as u128)
        }
    }
    
    /// Calculate AZTEC amount for a given stAZTEC withdrawal
    #[public]
    #[view]
    fn preview_withdrawal(st_aztec_amount: u128, exchange_rate: u64) -> pub u128 {
        (st_aztec_amount * (exchange_rate as u128)) / 10000
    }
    
    /// Get TVL (Total Value Locked)
    /// TVL = pending_pool + staked_to_validators + liquidity_buffer
    #[public]
    #[view]
    fn get_tvl() -> pub u128 {
        let pending = storage.pending_pool.read();
        let staked = storage.total_staked_to_validators.read();
        let buffer = storage.liquidity_buffer.read();
        pending + staked + buffer
    }
}
