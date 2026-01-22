// StakedAztecToken (stAZTEC) - Liquid Staking Token Contract
// ERC20-compatible liquid staking derivative token
// Updated for Aztec v3.0.x API

use dep::aztec::macros::aztec;

#[aztec]
pub contract StakedAztecToken {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{external, initializer, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Exchange rate scale: 10000 = 1.0 (basis points)
    global RATE_SCALE: u128 = 10000;

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // ERC20 state
        balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        allowances: Map<AztecAddress, Map<AztecAddress, PublicMutable<u128, Context>, Context>, Context>,
        total_supply: PublicMutable<u128, Context>,

        // Liquid staking state
        exchange_rate: PublicMutable<u64, Context>,  // stAZTEC to AZTEC rate (10000 = 1:1)
        total_aztec_backing: PublicMutable<u128, Context>,  // Total AZTEC backing the stAZTEC

        // Access control
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
    }

    // ============ INITIALIZER ============
    #[external("public")]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        self.storage.admin.write(admin_);
        self.storage.total_supply.write(0);
        self.storage.total_aztec_backing.write(0);
        self.storage.exchange_rate.write(10000);  // Initial rate: 1 stAZTEC = 1 AZTEC
    }

    // ============ ADMIN FUNCTIONS ============
    #[external("public")]
    fn set_liquid_staking_core(core_address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin can set core address");
        self.storage.liquid_staking_core.write(core_address);
    }

    #[external("public")]
    fn set_admin(new_admin: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin");
        self.storage.admin.write(new_admin);
    }

    // ============ MINT/BURN FUNCTIONS (Only LiquidStakingCore) ============

    /// Mint stAZTEC when AZTEC is deposited
    /// Also tracks the AZTEC backing for exchange rate calculation
    #[external("public")]
    fn mint(to: AztecAddress, st_aztec_amount: u128, aztec_backing: u128) {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can mint");
        assert(st_aztec_amount > 0, "Amount must be positive");

        // Update balance
        let balance = self.storage.balances.at(to).read();
        self.storage.balances.at(to).write(balance + st_aztec_amount);

        // Update total supply
        let supply = self.storage.total_supply.read();
        let new_supply = supply + st_aztec_amount;
        self.storage.total_supply.write(new_supply);

        // Update total AZTEC backing
        let backing = self.storage.total_aztec_backing.read();
        let new_backing = backing + aztec_backing;
        self.storage.total_aztec_backing.write(new_backing);

        // Update exchange rate: rate = (backing * 10000) / supply
        if new_supply > 0 {
            let new_rate = ((new_backing * RATE_SCALE) / new_supply) as u64;
            let current_rate = self.storage.exchange_rate.read();
            if new_rate > current_rate {
                self.storage.exchange_rate.write(new_rate);
            }
        }
    }

    /// Burn stAZTEC when withdrawal is requested
    /// Returns the amount of AZTEC the user should receive
    #[external("public")]
    fn burn(from: AztecAddress, st_aztec_amount: u128) -> u128 {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can burn");
        assert(st_aztec_amount > 0, "Amount must be positive");

        let balance = self.storage.balances.at(from).read();
        assert(balance >= st_aztec_amount, "Insufficient balance to burn");

        // Calculate AZTEC equivalent BEFORE burning using current rate
        let rate = self.storage.exchange_rate.read();
        let aztec_amount = (st_aztec_amount * (rate as u128)) / RATE_SCALE;

        // Update balance
        self.storage.balances.at(from).write(balance - st_aztec_amount);

        // Update total supply
        let supply = self.storage.total_supply.read();
        let new_supply = supply - st_aztec_amount;
        self.storage.total_supply.write(new_supply);

        // Update total AZTEC backing
        let backing = self.storage.total_aztec_backing.read();
        let new_backing = backing - aztec_amount;
        self.storage.total_aztec_backing.write(new_backing);

        // Note: Exchange rate stays the same when burning proportionally

        aztec_amount
    }

    /// Add rewards to backing without minting new stAZTEC (increases exchange rate)
    #[external("public")]
    fn add_rewards(reward_amount: u128) {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        let admin = self.storage.admin.read();
        assert((caller == core) | (caller == admin), "Only core or admin");

        // Update backing
        let backing = self.storage.total_aztec_backing.read();
        let new_backing = backing + reward_amount;
        self.storage.total_aztec_backing.write(new_backing);

        // Update exchange rate (this will increase it)
        let supply = self.storage.total_supply.read();
        if supply > 0 {
            let new_rate = ((new_backing * RATE_SCALE) / supply) as u64;
            let current_rate = self.storage.exchange_rate.read();
            if new_rate > current_rate {
                self.storage.exchange_rate.write(new_rate);
            }
        }
    }

    // ============ ERC20 TRANSFER FUNCTIONS ============

    #[external("public")]
    fn transfer(to: AztecAddress, amount: u128) {
        let from = self.msg_sender().unwrap();
        assert(amount > 0, "Amount must be positive");

        let from_balance = self.storage.balances.at(from).read();
        assert(from_balance >= amount, "Insufficient balance");

        self.storage.balances.at(from).write(from_balance - amount);

        let to_balance = self.storage.balances.at(to).read();
        self.storage.balances.at(to).write(to_balance + amount);
    }

    #[external("public")]
    fn transfer_from(from: AztecAddress, to: AztecAddress, amount: u128) {
        let spender = self.msg_sender().unwrap();
        assert(amount > 0, "Amount must be positive");

        // Check and decrease allowance
        let current_allowance = self.storage.allowances.at(from).at(spender).read();
        assert(current_allowance >= amount, "Insufficient allowance");
        self.storage.allowances.at(from).at(spender).write(current_allowance - amount);

        // Execute transfer
        let from_balance = self.storage.balances.at(from).read();
        assert(from_balance >= amount, "Insufficient balance");
        self.storage.balances.at(from).write(from_balance - amount);

        let to_balance = self.storage.balances.at(to).read();
        self.storage.balances.at(to).write(to_balance + amount);
    }

    #[external("public")]
    fn approve(spender: AztecAddress, amount: u128) {
        let owner = self.msg_sender().unwrap();
        self.storage.allowances.at(owner).at(spender).write(amount);
    }

    // ============ VIEW FUNCTIONS ============

    #[external("public")]
    #[view]
    fn balance_of(account: AztecAddress) -> u128 {
        self.storage.balances.at(account).read()
    }

    #[external("public")]
    #[view]
    fn allowance(owner: AztecAddress, spender: AztecAddress) -> u128 {
        self.storage.allowances.at(owner).at(spender).read()
    }

    #[external("public")]
    #[view]
    fn total_supply() -> u128 {
        self.storage.total_supply.read()
    }

    #[external("public")]
    #[view]
    fn get_exchange_rate() -> u64 {
        self.storage.exchange_rate.read()
    }

    #[external("public")]
    #[view]
    fn get_total_aztec_backing() -> u128 {
        self.storage.total_aztec_backing.read()
    }

    /// Convert stAZTEC to AZTEC: stAZTEC * rate / 10000
    #[external("public")]
    #[view]
    fn convert_to_aztec(st_aztec_amount: u128) -> u128 {
        let rate = self.storage.exchange_rate.read();
        (st_aztec_amount * (rate as u128)) / RATE_SCALE
    }

    /// Convert AZTEC to stAZTEC: AZTEC * 10000 / rate
    #[external("public")]
    #[view]
    fn convert_to_st_aztec(aztec_amount: u128) -> u128 {
        let rate = self.storage.exchange_rate.read();
        (aztec_amount * RATE_SCALE) / (rate as u128)
    }

    /// Get user's stAZTEC balance in terms of AZTEC value
    #[external("public")]
    #[view]
    fn balance_of_in_aztec(account: AztecAddress) -> u128 {
        let st_balance = self.storage.balances.at(account).read();
        let rate = self.storage.exchange_rate.read();
        (st_balance * (rate as u128)) / RATE_SCALE
    }
}
