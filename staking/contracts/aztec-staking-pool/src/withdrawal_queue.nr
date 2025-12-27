// WithdrawalQueue.nr - FIFO Withdrawal Queue for Aztec Liquid Staking
// Aztec v2.1.9 compatible
// Manages withdrawal requests with 7-day unbonding period

use dep::aztec::macros::aztec;

#[aztec]
pub contract WithdrawalQueue {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // ============ CONSTANTS ============
    // Queue size constant (Noir requires compile-time sizing)
    // 10,000 requests should handle significant volume
    global MAX_QUEUE_SIZE: u64 = 10000;

    // Default unbonding period: 7 days = 604800 seconds
    global DEFAULT_UNBONDING_PERIOD: u64 = 604800;

    // ============ STORAGE ============
    #[storage]
    struct Storage<Context> {
        // Queue pointers for FIFO ordering
        queue_head: PublicMutable<u64, Context>,
        queue_tail: PublicMutable<u64, Context>,

        // Next request ID to assign (starts at 1)
        next_request_id: PublicMutable<u64, Context>,

        // Unbonding period in seconds (configurable)
        unbonding_period: PublicMutable<u64, Context>,

        // Admin address for configuration and processing
        admin: PublicMutable<AztecAddress, Context>,

        // Total amount in unfulfilled withdrawal requests
        pending_withdrawal_amount: PublicMutable<u128, Context>,

        // Withdrawal request storage (using maps for each field)
        // Noir doesn't support arrays of structs in storage well
        // So we use separate maps keyed by queue position
        request_ids: Map<u64, PublicMutable<u64, Context>, Context>,
        request_users: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        request_amounts: Map<u64, PublicMutable<u128, Context>, Context>,
        request_timestamps: Map<u64, PublicMutable<u64, Context>, Context>,
        request_fulfilled: Map<u64, PublicMutable<bool, Context>, Context>,
        request_claimed: Map<u64, PublicMutable<bool, Context>, Context>,

        // Reverse lookup: request_id -> queue position
        request_id_to_position: Map<u64, PublicMutable<u64, Context>, Context>,

        // User's pending request count (for UI convenience)
        user_pending_requests: Map<AztecAddress, PublicMutable<u64, Context>, Context>,

        // Paused state for emergencies
        paused: PublicMutable<bool, Context>,

        // Authorized callers (LiquidStakingCore)
        authorized_callers: Map<AztecAddress, PublicMutable<bool, Context>, Context>,
    }

    // ============ INITIALIZER ============
    #[public]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        storage.queue_head.write(0);
        storage.queue_tail.write(0);
        storage.next_request_id.write(1); // Start request IDs at 1
        storage.unbonding_period.write(DEFAULT_UNBONDING_PERIOD);
        storage.admin.write(admin);
        storage.pending_withdrawal_amount.write(0);
        storage.paused.write(false);

        // Admin is an authorized caller by default
        storage.authorized_callers.at(admin).write(true);
    }

    // ============ PRIMARY FUNCTIONS ============

    /// Add a withdrawal request to the FIFO queue
    /// Called by LiquidStakingCore after user burns stAZTEC
    /// Returns: request_id for user to track their withdrawal
    #[public]
    fn add_withdrawal_request(user: AztecAddress, amount: u128) -> pub u64 {
        assert(!storage.paused.read(), "Queue is paused");

        // Only authorized callers (LiquidStakingCore) can add requests
        let caller = context.msg_sender();
        let is_authorized = storage.authorized_callers.at(caller).read();
        assert(is_authorized, "Not authorized to add requests");

        assert(amount > 0, "Amount must be positive");

        let queue_tail = storage.queue_tail.read();
        assert(queue_tail < MAX_QUEUE_SIZE, "Queue is full");

        // Get next request ID
        let request_id = storage.next_request_id.read();
        storage.next_request_id.write(request_id + 1);

        // Get current block number as timestamp proxy
        let current_timestamp = context.block_number() as u64;

        // Store withdrawal request in maps
        storage.request_ids.at(queue_tail).write(request_id);
        storage.request_users.at(queue_tail).write(user);
        storage.request_amounts.at(queue_tail).write(amount);
        storage.request_timestamps.at(queue_tail).write(current_timestamp);
        storage.request_fulfilled.at(queue_tail).write(false);
        storage.request_claimed.at(queue_tail).write(false);

        // Store reverse lookup
        storage.request_id_to_position.at(request_id).write(queue_tail);

        // Update queue tail
        storage.queue_tail.write(queue_tail + 1);

        // Update pending withdrawal amount
        let pending = storage.pending_withdrawal_amount.read();
        storage.pending_withdrawal_amount.write(pending + amount);

        // Update user's pending request count
        let user_pending = storage.user_pending_requests.at(user).read();
        storage.user_pending_requests.at(user).write(user_pending + 1);

        request_id
    }

    /// Process withdrawals at the head of the queue
    /// Marks requests as fulfilled if unbonding period has passed
    /// Returns: number of requests processed
    #[public]
    fn process_withdrawals(max_count: u32) -> pub u32 {
        assert(!storage.paused.read(), "Queue is paused");

        let caller = context.msg_sender();
        let admin = storage.admin.read();
        let is_authorized = storage.authorized_callers.at(caller).read();
        assert(caller == admin || is_authorized, "Not authorized to process");

        let mut head = storage.queue_head.read();
        let tail = storage.queue_tail.read();
        let mut processed: u32 = 0;

        let current_timestamp = context.block_number() as u64;
        let unbonding_period = storage.unbonding_period.read();

        // Process up to max_count requests from the head
        let mut i: u32 = 0;
        // Using a fixed loop bound that we break out of
        for _ in 0..1000 {
            if i >= max_count {
                break;
            }
            if head >= tail {
                break; // No more requests
            }

            let is_fulfilled = storage.request_fulfilled.at(head).read();

            if !is_fulfilled {
                let requested_at = storage.request_timestamps.at(head).read();

                // Check if unbonding period has passed
                if (current_timestamp >= requested_at) &&
                   ((current_timestamp - requested_at) >= unbonding_period) {
                    // Mark as fulfilled
                    storage.request_fulfilled.at(head).write(true);

                    // Update pending amount
                    let amount = storage.request_amounts.at(head).read();
                    let pending = storage.pending_withdrawal_amount.read();
                    if pending >= amount {
                        storage.pending_withdrawal_amount.write(pending - amount);
                    }

                    // Update user's pending count
                    let user = storage.request_users.at(head).read();
                    let user_pending = storage.user_pending_requests.at(user).read();
                    if user_pending > 0 {
                        storage.user_pending_requests.at(user).write(user_pending - 1);
                    }

                    processed += 1;
                } else {
                    // Stop at first request still in unbonding (FIFO ordering)
                    break;
                }
            }

            head += 1;
            i += 1;
        }

        // Update queue head
        storage.queue_head.write(head);

        processed
    }

    /// Claim a fulfilled withdrawal
    /// Only the original requester can claim
    /// Returns: amount to be transferred (caller must handle transfer)
    #[public]
    fn claim_withdrawal(request_id: u64) -> pub u128 {
        assert(!storage.paused.read(), "Queue is paused");

        let caller = context.msg_sender();

        // Find the request
        let position = storage.request_id_to_position.at(request_id).read();
        let stored_request_id = storage.request_ids.at(position).read();
        assert(stored_request_id == request_id, "Request not found");

        let user = storage.request_users.at(position).read();
        let is_fulfilled = storage.request_fulfilled.at(position).read();
        let is_claimed = storage.request_claimed.at(position).read();
        let amount = storage.request_amounts.at(position).read();

        // Verify caller is the requester
        assert(caller == user, "Only requester can claim");

        // Verify request is fulfilled and not claimed
        assert(is_fulfilled, "Withdrawal not yet fulfilled");
        assert(!is_claimed, "Already claimed");

        // Mark as claimed
        storage.request_claimed.at(position).write(true);

        // Return amount for caller to handle transfer
        amount
    }

    // ============ VIEW FUNCTIONS ============

    /// Check if a withdrawal request is ready to be claimed
    #[public]
    #[view]
    fn is_request_ready(request_id: u64) -> pub bool {
        let position = storage.request_id_to_position.at(request_id).read();
        let stored_request_id = storage.request_ids.at(position).read();

        if stored_request_id != request_id {
            return false;
        }

        let is_fulfilled = storage.request_fulfilled.at(position).read();
        let is_claimed = storage.request_claimed.at(position).read();

        is_fulfilled && !is_claimed
    }

    /// Get request status: (fulfilled, ready_to_claim, amount)
    #[public]
    #[view]
    fn check_request_status(request_id: u64) -> pub (bool, bool, u128) {
        let position = storage.request_id_to_position.at(request_id).read();
        let stored_request_id = storage.request_ids.at(position).read();

        if stored_request_id != request_id {
            return (false, false, 0);
        }

        let is_fulfilled = storage.request_fulfilled.at(position).read();
        let is_claimed = storage.request_claimed.at(position).read();
        let amount = storage.request_amounts.at(position).read();

        let ready = is_fulfilled && !is_claimed;

        (is_fulfilled, ready, amount)
    }

    /// Get time remaining until request is ready (in seconds/blocks)
    #[public]
    #[view]
    fn get_time_until_ready(request_id: u64) -> pub u64 {
        let position = storage.request_id_to_position.at(request_id).read();
        let stored_request_id = storage.request_ids.at(position).read();

        if stored_request_id != request_id {
            return 0;
        }

        let is_fulfilled = storage.request_fulfilled.at(position).read();
        if is_fulfilled {
            return 0;
        }

        let requested_at = storage.request_timestamps.at(position).read();
        let current_timestamp = context.block_number() as u64;
        let unbonding_period = storage.unbonding_period.read();

        if current_timestamp >= requested_at {
            let elapsed = current_timestamp - requested_at;
            if elapsed >= unbonding_period {
                0
            } else {
                unbonding_period - elapsed
            }
        } else {
            unbonding_period
        }
    }

    /// Get the current queue length (unfulfilled requests)
    #[public]
    #[view]
    fn get_queue_length() -> pub u64 {
        let head = storage.queue_head.read();
        let tail = storage.queue_tail.read();

        if tail > head {
            tail - head
        } else {
            0
        }
    }

    /// Get the total pending withdrawal amount
    #[public]
    #[view]
    fn get_pending_withdrawal_amount() -> pub u128 {
        storage.pending_withdrawal_amount.read()
    }

    /// Get request details by ID
    #[public]
    #[view]
    fn get_request_details(request_id: u64) -> pub (AztecAddress, u128, u64, bool, bool) {
        let position = storage.request_id_to_position.at(request_id).read();
        let stored_request_id = storage.request_ids.at(position).read();

        if stored_request_id != request_id {
            // Return empty/zero values if not found
            return (AztecAddress::from_field(0), 0, 0, false, false);
        }

        let user = storage.request_users.at(position).read();
        let amount = storage.request_amounts.at(position).read();
        let timestamp = storage.request_timestamps.at(position).read();
        let is_fulfilled = storage.request_fulfilled.at(position).read();
        let is_claimed = storage.request_claimed.at(position).read();

        (user, amount, timestamp, is_fulfilled, is_claimed)
    }

    /// Get user's pending request count
    #[public]
    #[view]
    fn get_user_pending_count(user: AztecAddress) -> pub u64 {
        storage.user_pending_requests.at(user).read()
    }

    /// Get queue statistics
    #[public]
    #[view]
    fn get_queue_stats() -> pub (u64, u64, u64, u128) {
        let head = storage.queue_head.read();
        let tail = storage.queue_tail.read();
        let next_id = storage.next_request_id.read();
        let pending = storage.pending_withdrawal_amount.read();

        (head, tail, next_id, pending)
    }

    /// Get unbonding period
    #[public]
    #[view]
    fn get_unbonding_period() -> pub u64 {
        storage.unbonding_period.read()
    }

    /// Check if queue is paused
    #[public]
    #[view]
    fn is_paused() -> pub bool {
        storage.paused.read()
    }

    // ============ ADMIN FUNCTIONS ============

    /// Set authorized caller (LiquidStakingCore contract)
    #[public]
    fn set_authorized_caller(caller_address: AztecAddress, authorized: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.authorized_callers.at(caller_address).write(authorized);
    }

    /// Update unbonding period (only admin)
    #[public]
    fn set_unbonding_period(new_period: u64) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        // Sanity check: must be at least 1 day, at most 30 days
        assert(new_period >= 86400, "Period too short (min 1 day)");
        assert(new_period <= 2592000, "Period too long (max 30 days)");

        storage.unbonding_period.write(new_period);
    }

    /// Transfer admin role
    #[public]
    fn set_admin(new_admin: AztecAddress) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.admin.write(new_admin);
        storage.authorized_callers.at(new_admin).write(true);
    }

    /// Emergency pause
    #[public]
    fn set_paused(paused: bool) {
        let caller = context.msg_sender();
        let admin = storage.admin.read();
        assert(caller == admin, "Only admin");

        storage.paused.write(paused);
    }
}
