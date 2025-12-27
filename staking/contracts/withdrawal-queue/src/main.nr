// WithdrawalQueue Contract - FIFO Withdrawal Queue with Unbonding
// TASK-110 implementation

use dep::aztec::macros::aztec;

#[aztec]
pub contract WithdrawalQueue {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Queue management
        queue_head: PublicMutable<u64, Context>,
        queue_tail: PublicMutable<u64, Context>,
        next_request_id: PublicMutable<u64, Context>,
        total_pending: PublicMutable<u128, Context>,
        
        // Request data stored in maps (indexed by request_id)
        request_user: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        request_shares_burned: Map<u64, PublicMutable<u128, Context>, Context>,
        request_aztec_amount: Map<u64, PublicMutable<u128, Context>, Context>,
        request_timestamp: Map<u64, PublicMutable<u64, Context>, Context>,
        request_fulfilled: Map<u64, PublicMutable<bool, Context>, Context>,
        
        // Queue position mapping (position -> request_id)
        queue_position_to_id: Map<u64, PublicMutable<u64, Context>, Context>,
        
        // User request tracking (user -> count)
        user_request_count: Map<AztecAddress, PublicMutable<u64, Context>, Context>,
        
        // Access control
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
        
        // Configuration
        unbonding_period: PublicMutable<u64, Context>,
        max_queue_size: PublicMutable<u64, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress, unbonding_period_: u64) {
        storage.admin.write(admin_);
        storage.queue_head.write(0);
        storage.queue_tail.write(0);
        storage.next_request_id.write(1);
        storage.total_pending.write(0);
        storage.unbonding_period.write(unbonding_period_);
        storage.max_queue_size.write(10000);
    }

    // ============ ADMIN FUNCTIONS ============
    #[public]
    fn set_liquid_staking_core(core_address: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.liquid_staking_core.write(core_address);
    }
    
    #[public]
    fn set_unbonding_period(new_period: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.unbonding_period.write(new_period);
    }
    
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");
        storage.admin.write(new_admin);
    }

    // ============ QUEUE OPERATIONS ============
    #[public]
    fn add_request(
        user: AztecAddress, 
        shares_burned: u128, 
        aztec_amount: u128,
        timestamp: u64
    ) -> pub u64 {
        let caller = context.msg_sender();
        let core = storage.liquid_staking_core.read();
        assert(caller == core, "Only LiquidStakingCore can add requests");
        
        let tail = storage.queue_tail.read();
        let head = storage.queue_head.read();
        let max_size = storage.max_queue_size.read();
        assert(tail - head < max_size, "Queue is full");
        
        let request_id = storage.next_request_id.read();
        storage.next_request_id.write(request_id + 1);
        
        storage.request_user.at(request_id).write(user);
        storage.request_shares_burned.at(request_id).write(shares_burned);
        storage.request_aztec_amount.at(request_id).write(aztec_amount);
        storage.request_timestamp.at(request_id).write(timestamp);
        storage.request_fulfilled.at(request_id).write(false);
        
        storage.queue_position_to_id.at(tail).write(request_id);
        storage.queue_tail.write(tail + 1);
        
        let total = storage.total_pending.read();
        storage.total_pending.write(total + aztec_amount);
        
        let user_count = storage.user_request_count.at(user).read();
        storage.user_request_count.at(user).write(user_count + 1);
        
        request_id
    }
    
    #[public]
    fn claim_withdrawal(request_id: u64, current_timestamp: u64) -> pub u128 {
        let caller = context.msg_sender();
        
        let user = storage.request_user.at(request_id).read();
        assert(caller == user, "Not your request");
        
        let fulfilled = storage.request_fulfilled.at(request_id).read();
        assert(!fulfilled, "Already claimed");
        
        let request_timestamp = storage.request_timestamp.at(request_id).read();
        let unbonding_period = storage.unbonding_period.read();
        assert(
            current_timestamp >= request_timestamp + unbonding_period,
            "Unbonding period not complete"
        );
        
        storage.request_fulfilled.at(request_id).write(true);
        
        let aztec_amount = storage.request_aztec_amount.at(request_id).read();
        let total = storage.total_pending.read();
        storage.total_pending.write(total - aztec_amount);
        
        aztec_amount
    }

    // ============ VIEW FUNCTIONS ============
    #[public]
    #[view]
    fn get_request_user(request_id: u64) -> pub AztecAddress {
        storage.request_user.at(request_id).read()
    }
    
    #[public]
    #[view]
    fn get_request_amount(request_id: u64) -> pub u128 {
        storage.request_aztec_amount.at(request_id).read()
    }
    
    #[public]
    #[view]
    fn get_request_timestamp(request_id: u64) -> pub u64 {
        storage.request_timestamp.at(request_id).read()
    }
    
    #[public]
    #[view]
    fn is_request_fulfilled(request_id: u64) -> pub bool {
        storage.request_fulfilled.at(request_id).read()
    }
    
    #[public]
    #[view]
    fn is_claimable(request_id: u64, current_timestamp: u64) -> pub bool {
        let fulfilled = storage.request_fulfilled.at(request_id).read();
        let request_timestamp = storage.request_timestamp.at(request_id).read();
        let unbonding_period = storage.unbonding_period.read();
        
        // Claimable if not fulfilled AND unbonding period has passed
        let not_fulfilled = !fulfilled;
        let unbonding_complete = current_timestamp >= request_timestamp + unbonding_period;
        not_fulfilled & unbonding_complete
    }
    
    #[public]
    #[view]
    fn get_queue_length() -> pub u64 {
        let head = storage.queue_head.read();
        let tail = storage.queue_tail.read();
        tail - head
    }
    
    #[public]
    #[view]
    fn get_total_pending() -> pub u128 {
        storage.total_pending.read()
    }
    
    #[public]
    #[view]
    fn get_unbonding_period() -> pub u64 {
        storage.unbonding_period.read()
    }
    
    #[public]
    #[view]
    fn get_user_request_count(user: AztecAddress) -> pub u64 {
        storage.user_request_count.at(user).read()
    }
    
    #[public]
    #[view]
    fn time_until_claimable(request_id: u64, current_timestamp: u64) -> pub u64 {
        let request_timestamp = storage.request_timestamp.at(request_id).read();
        let unbonding_period = storage.unbonding_period.read();
        let claimable_at = request_timestamp + unbonding_period;
        
        if current_timestamp >= claimable_at {
            0
        } else {
            claimable_at - current_timestamp
        }
    }
}
