// ValidatorRegistry Contract - Validator Tracking and Management
// TASK-111 implementation

use dep::aztec::macros::aztec;

#[aztec]
pub contract ValidatorRegistry {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // Validator status codes:
    // 0 = Not registered, 1 = Active, 2 = Inactive, 3 = Slashed, 4 = Exiting, 5 = Exited

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Validator tracking
        validator_count: PublicMutable<u32, Context>,
        active_validator_count: PublicMutable<u32, Context>,
        
        // Validator data (indexed by validator address)
        validator_status: Map<AztecAddress, PublicMutable<u8, Context>, Context>,
        validator_stake: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        validator_index: Map<AztecAddress, PublicMutable<u32, Context>, Context>,
        validator_added_at: Map<AztecAddress, PublicMutable<u64, Context>, Context>,
        
        // Validator list (indexed by position for round-robin)
        validator_at_index: Map<u32, PublicMutable<AztecAddress, Context>, Context>,
        
        // Round-robin selection state
        next_validator_index: PublicMutable<u32, Context>,
        
        // Total stake
        total_staked: PublicMutable<u128, Context>,
        
        // Slashing tracking
        total_slashed: PublicMutable<u128, Context>,
        slash_count: PublicMutable<u32, Context>,
        
        // Access control
        vault_manager: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
        
        // Emergency state
        paused: PublicMutable<bool, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        storage.admin.write(admin_);
        storage.validator_count.write(0);
        storage.active_validator_count.write(0);
        storage.next_validator_index.write(0);
        storage.total_staked.write(0);
        storage.total_slashed.write(0);
        storage.slash_count.write(0);
        storage.paused.write(false);
    }

    // ============ ADMIN FUNCTIONS ============
    #[public]
    fn set_vault_manager(vault_address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.vault_manager.write(vault_address);
    }
    
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.admin.write(new_admin);
    }
    
    #[public]
    fn set_paused(paused_: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.paused.write(paused_);
    }

    // ============ VALIDATOR MANAGEMENT ============
    #[public]
    fn add_validator(validator: AztecAddress, timestamp: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can add validators");
        assert(!storage.paused.read(), "Registry is paused");
        
        let status = storage.validator_status.at(validator).read();
        assert(status == 0, "Validator already registered");
        
        let count = storage.validator_count.read();
        
        storage.validator_status.at(validator).write(1);  // Active
        storage.validator_stake.at(validator).write(0);
        storage.validator_index.at(validator).write(count);
        storage.validator_added_at.at(validator).write(timestamp);
        storage.validator_at_index.at(count).write(validator);
        
        storage.validator_count.write(count + 1);
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active + 1);
    }
    
    #[public]
    fn deactivate_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        
        let status = storage.validator_status.at(validator).read();
        assert(status == 1, "Validator not active");
        
        storage.validator_status.at(validator).write(2);  // Inactive
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active - 1);
    }
    
    #[public]
    fn reactivate_validator(validator: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        
        let status = storage.validator_status.at(validator).read();
        assert(status == 2, "Validator not inactive");
        
        storage.validator_status.at(validator).write(1);  // Active
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active + 1);
    }
    
    #[public]
    fn record_stake(validator: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let vault = storage.vault_manager.read();
        let admin = storage.admin.read();
        let is_vault = caller == vault;
        let is_admin = caller == admin;
        assert(is_vault | is_admin, "Only VaultManager or admin");
        
        let status = storage.validator_status.at(validator).read();
        assert(status == 1, "Validator not active");
        
        let current = storage.validator_stake.at(validator).read();
        storage.validator_stake.at(validator).write(current + amount);
        
        let total = storage.total_staked.read();
        storage.total_staked.write(total + amount);
    }
    
    #[public]
    fn record_unstake(validator: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let vault = storage.vault_manager.read();
        let admin = storage.admin.read();
        let is_vault = caller == vault;
        let is_admin = caller == admin;
        assert(is_vault | is_admin, "Only VaultManager or admin");
        
        let current = storage.validator_stake.at(validator).read();
        assert(current >= amount, "Insufficient stake recorded");
        storage.validator_stake.at(validator).write(current - amount);
        
        let total = storage.total_staked.read();
        storage.total_staked.write(total - amount);
    }
    
    #[public]
    fn record_slash(validator: AztecAddress, amount: u128) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin can record slashing");
        
        storage.validator_status.at(validator).write(3);  // Slashed
        
        let current = storage.validator_stake.at(validator).read();
        let slashed = if amount > current { current } else { amount };
        storage.validator_stake.at(validator).write(current - slashed);
        
        let total = storage.total_staked.read();
        storage.total_staked.write(total - slashed);
        
        let total_slashed = storage.total_slashed.read();
        storage.total_slashed.write(total_slashed + slashed);
        
        let slash_count = storage.slash_count.read();
        storage.slash_count.write(slash_count + 1);
        
        let active = storage.active_validator_count.read();
        storage.active_validator_count.write(active - 1);
    }

    // ============ VIEW FUNCTIONS ============
    #[public]
    #[view]
    fn get_validator_status(validator: AztecAddress) -> pub u8 {
        storage.validator_status.at(validator).read()
    }
    
    #[public]
    #[view]
    fn get_validator_stake(validator: AztecAddress) -> pub u128 {
        storage.validator_stake.at(validator).read()
    }
    
    #[public]
    #[view]
    fn is_active(validator: AztecAddress) -> pub bool {
        storage.validator_status.at(validator).read() == 1
    }
    
    #[public]
    #[view]
    fn get_validator_count() -> pub u32 {
        storage.validator_count.read()
    }
    
    #[public]
    #[view]
    fn get_active_validator_count() -> pub u32 {
        storage.active_validator_count.read()
    }
    
    #[public]
    #[view]
    fn get_total_staked() -> pub u128 {
        storage.total_staked.read()
    }
    
    #[public]
    #[view]
    fn get_total_slashed() -> pub u128 {
        storage.total_slashed.read()
    }
    
    #[public]
    #[view]
    fn get_validator_at(index: u32) -> pub AztecAddress {
        storage.validator_at_index.at(index).read()
    }
    
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }
    
    #[public]
    #[view]
    fn get_slash_count() -> pub u32 {
        storage.slash_count.read()
    }
}
