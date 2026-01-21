// StakedAztecToken (stAZTEC) - Liquid Staking Token Contract
// TASK-101 to TASK-104 implementation
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

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        total_supply: PublicMutable<u128, Context>,
        exchange_rate: PublicMutable<u64, Context>,
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        rewards_manager: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
    }

    // ============ INITIALIZER ============
    #[external("public")]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        self.storage.admin.write(admin_);
        self.storage.total_supply.write(0);
        self.storage.exchange_rate.write(10000);
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
    fn set_rewards_manager(rewards_address: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin can set rewards manager");
        self.storage.rewards_manager.write(rewards_address);
    }

    #[external("public")]
    fn set_admin(new_admin: AztecAddress) {
        let caller = self.msg_sender().unwrap();
        let admin = self.storage.admin.read();
        assert(caller == admin, "Only admin");
        self.storage.admin.write(new_admin);
    }

    // ============ MINT/BURN FUNCTIONS ============
    #[external("public")]
    fn mint(to: AztecAddress, amount: u128) {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can mint");
        assert(amount > 0, "Amount must be positive");

        let balance = self.storage.balances.at(to).read();
        self.storage.balances.at(to).write(balance + amount);

        let supply = self.storage.total_supply.read();
        self.storage.total_supply.write(supply + amount);
    }

    #[external("public")]
    fn burn(from: AztecAddress, amount: u128) {
        let caller = self.msg_sender().unwrap();
        let core = self.storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can burn");
        assert(amount > 0, "Amount must be positive");

        let balance = self.storage.balances.at(from).read();
        assert(balance >= amount, "Insufficient balance to burn");
        self.storage.balances.at(from).write(balance - amount);

        let supply = self.storage.total_supply.read();
        self.storage.total_supply.write(supply - amount);
    }

    // ============ TRANSFER FUNCTION ============
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

    // ============ EXCHANGE RATE ============
    #[external("public")]
    fn update_exchange_rate(new_rate: u64) {
        let caller = self.msg_sender().unwrap();
        let rewards_manager = self.storage.rewards_manager.read();
        let admin = self.storage.admin.read();

        // Check caller is authorized (rewards manager or admin)
        let is_rewards_manager = caller == rewards_manager;
        let is_admin = caller == admin;
        assert(is_rewards_manager | is_admin, "Only RewardsManager or admin can update rate");

        let current_rate = self.storage.exchange_rate.read();
        assert(new_rate >= current_rate, "Rate can only increase");

        self.storage.exchange_rate.write(new_rate);
    }

    // ============ VIEW FUNCTIONS ============
    #[external("public")]
    #[view]
    fn balance_of(account: AztecAddress) -> u128 {
        self.storage.balances.at(account).read()
    }

    #[external("public")]
    #[view]
    fn get_total_supply() -> u128 {
        self.storage.total_supply.read()
    }

    #[external("public")]
    #[view]
    fn get_exchange_rate() -> u64 {
        self.storage.exchange_rate.read()
    }

    // Convert stAZTEC to AZTEC: stAZTEC * rate / 10000
    #[external("public")]
    #[view]
    fn convert_to_aztec(st_aztec_amount: u128) -> u128 {
        let rate = self.storage.exchange_rate.read();
        (st_aztec_amount * (rate as u128)) / 10000
    }

    // Convert AZTEC to stAZTEC: AZTEC * 10000 / rate
    #[external("public")]
    #[view]
    fn convert_to_st_aztec(aztec_amount: u128) -> u128 {
        let rate = self.storage.exchange_rate.read();
        (aztec_amount * 10000) / (rate as u128)
    }
}
