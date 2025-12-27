# Aztec Noir & Nargo: The Missing Manual (for v0.30+)

This guide consolidates research, patterns, and examples for Aztec's Noir language and Nargo build tool. It is designed to help future agents navigate the complexities of writing smart contracts on Aztec, specifically for liquid staking.

## 1. Quick Reference

*   **Language**: Noir (Rust-like ZK-DSL)
*   **Extension**: `.nr`
*   **Build Tool**: `aztec-nargo` (wrapper around `nargo` with Aztec backend)
*   **Key Version**: v0.30.0+ (Aztec v2.1.9)
*   **Documentation**: [Aztec Docs](https://docs.aztec.network), [Noir Docs](https://noir-lang.org/docs)

## 2. Build System Verification

To verify your environment is set up correctly:

```bash
# Check nargo version
aztec-nargo --version

# Compile a contract
cd staking/aztec/contracts/aztec-staking-pool
aztec-nargo compile
```

**Common Issue**: If `nargo` is missing, ensure `aztec-up` has been run and your path is updated. In CI/CD, use the `aztecprotocol/aztec` docker image.

## 3. Core Concepts

### Public vs. Private State

Aztec is unique because it supports both **public** (transparent, like Ethereum) and **private** (encrypted, ZK) state.

*   **Public State**: Stored in a Merkle tree, visible to everyone. Use `PublicMutable` or `Map<_, PublicMutable>`.
*   **Private State**: Stored as UTXO notes (Encrypted Logs). Use `PrivateMutable` or `Map<_, PrivateMutable>`.

**Anti-Pattern**: Using `#[public]` for everything. This defeats the purpose of privacy.
**Best Practice**: Use private state for user balances and sensitive data. Use public state for global counters (total staked, exchange rates).

### Functions

*   `#[public]`: Executed by the sequencer. Can read/write public state. Can only read historical private state (snapshots).
*   `#[private]`: Executed locally by the user. Can read/write private state. Can call public functions (which queue for sequencer).
*   `unconstrained`: View functions, not proven in ZK.

## 4. Key Patterns & Implementation Guide

### A. State Management

```rust
use dep::aztec::state_vars::{Map, PublicMutable, PrivateMutable};
// ... inside Storage struct ...
    // Public: Everyone can see the total supply
    total_supply: PublicMutable<u128, Context>,
    
    // Private: Only the user knows their balance
    balances: Map<AztecAddress, PrivateMutable<u128, Context>, Context>,
```

### B. Token Transfers (The Hard Part)

In Aztec, "transferring" tokens often means different things depending on context:
1.  **Public Transfer**: Just updating a mapping (like ERC20).
2.  **Private Transfer**: Destroying sender's notes and creating new notes for recipient.
3.  **Shielding**: Public -> Private.
4.  **Unshielding**: Private -> Public.

**Cross-Contract Token Transfer Example**:
To transfer tokens from a user to your contract (e.g., `deposit`), you usually need an **AuthWit** (Authentication Witness) unless you are using a public approval flow.

```rust
// In your contract's deposit function
#[public]
fn deposit(amount: u128, token_address: AztecAddress) {
    // 1. Check allowances (if public) or assume AuthWit provided (if private context)
    
    // 2. Call the token contract to transfer 'amount' from msg_sender to this contract
    // NOTE: This is a low-level call example. Use high-level interfaces if available.
    // The exact interface depends on the Token contract implementation (e.g., TokenBridge).
    
    // Example using a hypothetical interface:
    Token::at(token_address).transfer_public(
        context.msg_sender(),   // from
        context.this_address(), // to
        amount,                 // amount
        0                       // nonce (0 for public)
    ).call(&mut context);
}
```

### C. Cross-Contract Calls

Aztec contracts interact asynchronously in some cases, but synchronous calls are possible within the same phase (Public->Public or Private->Private).

**Public -> Public Call**:
```rust
// Define the interface of the other contract
// (Or use dep::aztec::macros::functions::public if you have the source)
// ...

// Calling it:
let return_val = OtherContract::at(address).some_function(args).call(&mut context);
```

**Private -> Public Call**:
You cannot get the return value immediately because the public function runs later (by the sequencer). You "enqueue" the call.

```rust
// In a #[private] function
OtherContract::at(address).some_public_function(args).enqueue(&mut context);
```

### D. Reading Public State from Private Context

You can only read *historical* public state from a private function (using a header/snapshot). You cannot read the "current" pending state because it hasn't settled yet.

```rust
// In #[private] function
let historical_val = storage.some_public_var.read(); // Reads from the note hash tree snapshot
```

## 5. Anti-Patterns to Avoid

1.  **Synchronous Assumptions**: Don't assume a public function called from a private function executes immediately. It executes later.
2.  **Missing AuthWit**: If your contract needs to move user funds, the user must authorize it. In public, this is `approve`. In private, this is `AuthWit`.
3.  **Leaking Privacy**: Don't store user-specific data (like individual stake amounts) in `PublicMutable` unless explicitly intended to be public.
4.  **Integer Overflows**: Noir checks for overflows, but be mindful of `u128` limits when dealing with high-precision math (18 decimals).

## 6. Cheatsheet: Liquid Staking Architecture

For `StakingPool.nr`:

1.  **Deposit (Private)**:
    *   User calls `deposit_private(amount)`.
    *   Contract verifies funds (private notes).
    *   Contract transfers AZTEC from User -> Pool (Private Transfer).
    *   Contract mints stAZTEC to User (Private Mint).
    *   Global `total_staked` (Public) needs to be updated. This requires a `call_public_function` to update the global counter.

2.  **Deposit (Public)**:
    *   User calls `deposit_public(amount)`.
    *   Contract transfers AZTEC from User -> Pool (Public Transfer).
    *   Contract mints stAZTEC to User (Public Mint).
    *   Updates `total_staked`.

3.  **Withdraw**:
    *   Reverse of deposit. Burn stAZTEC, send AZTEC.

## 7. Example Code: Safe Public Token Transfer

```rust
// Helper to call a standard Aztec Token
struct Token {
    address: AztecAddress,
}

impl Token {
    pub fn at(address: AztecAddress) -> Self {
        Self { address }
    }

    pub fn transfer_public(
        self,
        from: AztecAddress,
        to: AztecAddress,
        amount: u128,
        nonce: Field
    ) -> CallInterface {
        // This is a simplified representation of the call interface.
        // In a real project, you would import the Token interface from a library.
        // e.g. use dep::aztec::oracle::...
        // For now, this serves as a pattern reference.
        CallInterface {
             target: self.address,
             selector: 0x12345678, // usage specific
             args: [from.to_field(), to.to_field(), amount as Field, nonce]
        }
    }
}
```

*Generated by Aztec Agent for Liquid Staking Project*
