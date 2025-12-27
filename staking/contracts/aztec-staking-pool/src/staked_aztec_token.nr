// StakedAztecToken.nr - Liquid Staking Token for Aztec
// Aztec v2.1.9 compatible
// ERC20-like token representing staked AZTEC positions

use dep::aztec::macros::aztec;

#[aztec]
pub contract StakedAztecToken {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Token metadata
        decimals: PublicMutable<u8, Context>,

        // Owner/Admin for protocol management
        owner: PublicMutable<AztecAddress, Context>,

        // Balances (public for transparency of staking positions)
        public_balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,

        // Total supply tracking
        total_supply: PublicMutable<u128, Context>,

        // Exchange rate: stAZTEC to AZTEC (in basis points, 10000 = 1.0)
        // Rate increases as rewards accrue
        exchange_rate: PublicMutable<u64, Context>,

        // Minter permissions (only LiquidStakingCore can mint/burn)
        minters: Map<AztecAddress, PublicMutable<bool, Context>, Context>,

        // Rewards manager address (can update exchange rate)
        rewards_manager: PublicMutable<AztecAddress, Context>,

        // Paused state for emergencies
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(owner: AztecAddress, rewards_manager: AztecAddress) {
        storage.owner.write(owner);
        storage.rewards_manager.write(rewards_manager);
        storage.decimals.write(18);
        storage.total_supply.write(0);
        storage.exchange_rate.write(10000); // 1.0 initial rate
        storage.paused.write(false);

        // Owner is approved minter by default
        storage.minters.at(owner).write(true);
    }

    // ============ PUBLIC FUNCTIONS ============

    /// Mint new stAZTEC tokens (only minters - typically LiquidStakingCore)
    /// Called when users deposit AZTEC
    #[public]
    fn mint(to: AztecAddress, amount: u128) {
        assert(!storage.paused.read(), "Token is paused");

        // Access control: check if caller is minter
        let caller = context.msg_sender();
        let is_minter = storage.minters.at(caller).read();
        assert(is_minter, "Only minters can mint");

        assert(amount > 0, "Amount must be positive");

        // Update balances
        let current_balance = storage.public_balances.at(to).read();
        storage.public_balances.at(to).write(current_balance + amount);

        // Update total supply
        let current_supply = storage.total_supply.read();
        storage.total_supply.write(current_supply + amount);
    }

    /// Burn stAZTEC tokens (only minters - typically LiquidStakingCore)
    /// Called when users request withdrawal
    #[public]
    fn burn(from: AztecAddress, amount: u128) {
        assert(!storage.paused.read(), "Token is paused");

        // Access control: check if caller is minter
        let caller = context.msg_sender();
        let is_minter = storage.minters.at(caller).read();
        assert(is_minter, "Only minters can burn");

        assert(amount > 0, "Amount must be positive");

        let current_balance = storage.public_balances.at(from).read();
        assert(current_balance >= amount, "Insufficient balance");

        // Update balances
        storage.public_balances.at(from).write(current_balance - amount);

        // Update total supply
        let current_supply = storage.total_supply.read();
        storage.total_supply.write(current_supply - amount);
    }

    /// Transfer stAZTEC tokens between accounts
    /// Allows secondary market trading of staked positions
    #[public]
    fn transfer(to: AztecAddress, amount: u128) -> pub bool {
        assert(!storage.paused.read(), "Token is paused");

        let from = context.msg_sender();

        assert(amount > 0, "Amount must be positive");

        // Check balance
        let from_balance = storage.public_balances.at(from).read();
        assert(from_balance >= amount, "Insufficient balance");

        // Update balances atomically
        storage.public_balances.at(from).write(from_balance - amount);
        let to_balance = storage.public_balances.at(to).read();
        storage.public_balances.at(to).write(to_balance + amount);

        true
    }

    /// Transfer stAZTEC from one account to another (with authorization)
    /// Allows contracts to move tokens on behalf of users
    #[public]
    fn transfer_from(from: AztecAddress, to: AztecAddress, amount: u128) -> pub bool {
        assert(!storage.paused.read(), "Token is paused");

        let caller = context.msg_sender();

        // Only allow if caller is the from address or is a minter (protocol contract)
        let is_minter = storage.minters.at(caller).read();
        assert(from == caller || is_minter, "Not authorized");

        assert(amount > 0, "Amount must be positive");

        // Check balance
        let from_balance = storage.public_balances.at(from).read();
        assert(from_balance >= amount, "Insufficient balance");

        // Update balances atomically
        storage.public_balances.at(from).write(from_balance - amount);
        let to_balance = storage.public_balances.at(to).read();
        storage.public_balances.at(to).write(to_balance + amount);

        true
    }

    /// Update exchange rate (only rewards manager)
    /// Called when staking rewards are distributed
    #[public]
    fn update_exchange_rate(new_rate: u64) {
        let caller = context.msg_sender();
        let rewards_manager = storage.rewards_manager.read();
        assert(caller == rewards_manager, "Only rewards manager");

        // Rate should only increase (rewards accrue, not decrease)
        let current_rate = storage.exchange_rate.read();
        assert(new_rate >= current_rate, "Rate cannot decrease");

        storage.exchange_rate.write(new_rate);
    }

    // ============ ADMIN FUNCTIONS ============

    /// Grant minting permission to an address (only owner)
    #[public]
    fn set_minter(minter: AztecAddress, approved: bool) {
        let caller = context.msg_sender();
        let owner = storage.owner.read();
        assert(caller == owner, "Only owner");

        storage.minters.at(minter).write(approved);
    }

    /// Set the rewards manager address (only owner)
    #[public]
    fn set_rewards_manager(new_rewards_manager: AztecAddress) {
        let caller = context.msg_sender();
        let owner = storage.owner.read();
        assert(caller == owner, "Only owner");

        storage.rewards_manager.write(new_rewards_manager);
    }

    /// Transfer ownership to a new address (only owner)
    #[public]
    fn transfer_ownership(new_owner: AztecAddress) {
        let caller = context.msg_sender();
        let owner = storage.owner.read();
        assert(caller == owner, "Only owner");

        storage.owner.write(new_owner);
        storage.minters.at(new_owner).write(true);
    }

    /// Emergency pause (only owner)
    #[public]
    fn set_paused(paused: bool) {
        let caller = context.msg_sender();
        let owner = storage.owner.read();
        assert(caller == owner, "Only owner");

        storage.paused.write(paused);
    }

    // ============ VIEW FUNCTIONS ============

    /// Get balance of an account
    #[public]
    #[view]
    fn balance_of(account: AztecAddress) -> pub u128 {
        storage.public_balances.at(account).read()
    }

    /// Get total supply
    #[public]
    #[view]
    fn get_total_supply() -> pub u128 {
        storage.total_supply.read()
    }

    /// Get current exchange rate (basis points, 10000 = 1.0)
    #[public]
    #[view]
    fn get_exchange_rate() -> pub u64 {
        storage.exchange_rate.read()
    }

    /// Get decimals
    #[public]
    #[view]
    fn get_decimals() -> pub u8 {
        storage.decimals.read()
    }

    /// Check if address is a minter
    #[public]
    #[view]
    fn is_minter(account: AztecAddress) -> pub bool {
        storage.minters.at(account).read()
    }

    /// Check if token is paused
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    /// Get the owner address
    #[public]
    #[view]
    fn get_owner() -> pub AztecAddress {
        storage.owner.read()
    }

    /// Get the rewards manager address
    #[public]
    #[view]
    fn get_rewards_manager() -> pub AztecAddress {
        storage.rewards_manager.read()
    }

    /// Calculate the AZTEC value of a stAZTEC amount
    /// Used for displaying user's actual AZTEC position value
    #[public]
    #[view]
    fn get_aztec_value(st_aztec_amount: u128) -> pub u128 {
        let exchange_rate = storage.exchange_rate.read();
        (st_aztec_amount * (exchange_rate as u128)) / 10000
    }

    /// Calculate how much stAZTEC for a given AZTEC amount
    /// Used for deposit preview
    #[public]
    #[view]
    fn get_st_aztec_for_deposit(aztec_amount: u128) -> pub u128 {
        let exchange_rate = storage.exchange_rate.read();
        (aztec_amount * 10000) / (exchange_rate as u128)
    }
}
