// StakedAztecToken (stAZTEC) - Liquid Staking Token Contract
// TASK-101 to TASK-104 implementation

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
        balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        total_supply: PublicMutable<u128, Context>,
        exchange_rate: PublicMutable<u64, Context>,
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        rewards_manager: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        storage.admin.write(admin_);
        storage.total_supply.write(0);
        storage.exchange_rate.write(10000);
    }

    // ============ ADMIN FUNCTIONS ============
    #[public]
    fn set_liquid_staking_core(core_address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set core address");
        storage.liquid_staking_core.write(core_address);
    }
    
    #[public]
    fn set_rewards_manager(rewards_address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can set rewards manager");
        storage.rewards_manager.write(rewards_address);
    }
    
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.admin.write(new_admin);
    }

    // ============ MINT/BURN FUNCTIONS ============
    #[public]
    fn mint(to: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can mint");
        assert(amount > 0, "Amount must be positive");
        
        let balance = storage.balances.at(to).read();
        storage.balances.at(to).write(balance + amount);
        
        let supply = storage.total_supply.read();
        storage.total_supply.write(supply + amount);
    }
    
    #[public]
    fn burn(from: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can burn");
        assert(amount > 0, "Amount must be positive");
        
        let balance = storage.balances.at(from).read();
        assert(balance >= amount, "Insufficient balance to burn");
        storage.balances.at(from).write(balance - amount);
        
        let supply = storage.total_supply.read();
        storage.total_supply.write(supply - amount);
    }

    // ============ TRANSFER FUNCTION ============
    #[public]
    fn transfer(to: AztecAddress, amount: u128) {
        let from = context.msg_sender();
        assert(amount > 0, "Amount must be positive");
        
        let from_balance = storage.balances.at(from).read();
        assert(from_balance >= amount, "Insufficient balance");
        
        storage.balances.at(from).write(from_balance - amount);
        
        let to_balance = storage.balances.at(to).read();
        storage.balances.at(to).write(to_balance + amount);
    }

    // ============ EXCHANGE RATE ============
    #[public]
    fn update_exchange_rate(new_rate: u64) {
        let caller = context.msg_sender();
        let rewards_manager = storage.rewards_manager.read();
        let admin = storage.admin.read();
        
        // Check caller is authorized (rewards manager or admin)
        let is_rewards_manager = caller == rewards_manager;
        let is_admin = caller == admin;
        assert(is_rewards_manager | is_admin, "Only RewardsManager or admin can update rate");
        
        let current_rate = storage.exchange_rate.read();
        assert(new_rate >= current_rate, "Rate can only increase");
        
        storage.exchange_rate.write(new_rate);
    }

    // ============ VIEW FUNCTIONS ============
    #[public]
    #[view]
    fn balance_of(account: AztecAddress) -> pub u128 {
        storage.balances.at(account).read()
    }
    
    #[public]
    #[view]
    fn get_total_supply() -> pub u128 {
        storage.total_supply.read()
    }
    
    #[public]
    #[view]
    fn get_exchange_rate() -> pub u64 {
        storage.exchange_rate.read()
    }
    
    // Convert stAZTEC to AZTEC: stAZTEC * rate / 10000
    #[public]
    #[view]
    fn convert_to_aztec(st_aztec_amount: u128) -> pub u128 {
        let rate = storage.exchange_rate.read();
        (st_aztec_amount * (rate as u128)) / 10000
    }
    
    // Convert AZTEC to stAZTEC: AZTEC * 10000 / rate
    #[public]
    #[view]
    fn convert_to_st_aztec(aztec_amount: u128) -> pub u128 {
        let rate = storage.exchange_rate.read();
        (aztec_amount * 10000) / (rate as u128)
    }
}
