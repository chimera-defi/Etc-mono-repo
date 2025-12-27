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

### Functions

*   `#[public]`: Executed by the sequencer. Can read/write public state. Can only read historical private state (snapshots).
*   `#[private]`: Executed locally by the user. Can read/write private state. Can call public functions (which queue for sequencer).
*   `unconstrained`: View functions, not proven in ZK.

## 4. Token Transfers & AuthWit (Crucial!)

Based on the standard `Token.nr` implementation in Aztec v2.1.9, there are 4 distinct transfer patterns.

### The 4 Transfer Types

1.  **`transfer(to, amount)`**
    *   **Type**: Private -> Private
    *   **Context**: `#[private]`
    *   **Usage**: User sending their *own* funds. No `from` argument (implied `msg_sender`).
    *   **Auth**: Implicit.

2.  **`transfer_in_public(from, to, amount, nonce)`**
    *   **Type**: Public -> Public
    *   **Context**: `#[public]`
    *   **Usage**: Contract pulling funds from user (e.g., `LiquidStakingCore.deposit`).
    *   **Auth**: Requires **AuthWit** (Authorization Witness) if `from != msg_sender`.
    *   **Nonce**: `0` if `from == msg_sender`, otherwise specific nonce for the authorization.

3.  **`transfer_to_public(from, to, amount, nonce)`**
    *   **Type**: Private -> Public
    *   **Context**: `#[private]`
    *   **Usage**: Unshielding. Burns private notes, enqueues public mint.
    *   **Auth**: Requires AuthWit.

4.  **`transfer_in_private(from, to, amount, nonce)`**
    *   **Type**: Private -> Private (Authorized)
    *   **Context**: `#[private]`
    *   **Usage**: Approved spender moving someone else's private funds.
    *   **Auth**: Requires AuthWit.

### How to Implement `deposit` in LiquidStakingCore

When a user deposits into our pool, we want to "pull" their AZTEC tokens. Since we are likely in a public flow for the MVP (or unshielding), here is the pattern:

```rust
// LiquidStakingCore.nr

#[public]
fn deposit(amount: u128, nonce: Field) {
    let user = context.msg_sender();
    let pool_address = context.this_address();
    
    // 1. Pull AZTEC tokens from user to Pool
    // NOTE: User must have created an AuthWit for this call beforehand!
    Token::at(AZTEC_TOKEN_ADDRESS).transfer_in_public(
        user, 
        pool_address, 
        amount, 
        nonce
    ).call(&mut context);

    // 2. Mint stAZTEC to user
    // ...
}
```

### The `AuthWit` Workflow

For a user to call `deposit` successfully, they must first "authorize" the `transfer_in_public` call.

1.  **User Client**: Computes hash of `transfer_in_public(user, pool, amount, nonce)`.
2.  **User Client**: Signs this hash (ecdsa/schnorr).
3.  **User Client**: Pushes this auth witness to the `AuthRegistry` (public) or provides it in the PXE (private).
4.  **User Client**: Calls `LiquidStakingCore.deposit`.
5.  **LiquidStakingCore**: Calls `Token.transfer_in_public`.
6.  **Token Contract**: Checks `AuthRegistry`. Sees valid signature. Executes transfer.

**Development Tip**: In tests, use `utils::add_public_authwit_from_call_interface` to simulate this.

## 5. Key Patterns & Anti-Patterns

### Anti-Patterns
1.  **Missing `nonce`**: All authorized transfer functions take a `nonce`. Don't forget it.
2.  **Ignoring `#[authorize_once]`**: The standard Token contract uses this macro. It consumes the authorization, preventing replay attacks.
3.  **Synchronous Private->Public**: Calling a public function from private enqueues it. You can't get the result back in the same transaction logic.

### State Management
```rust
use dep::aztec::state_vars::{Map, PublicMutable, PrivateMutable};
// ... inside Storage struct ...
    total_supply: PublicMutable<u128, Context>,
    balances: Map<AztecAddress, PrivateMutable<u128, Context>, Context>,
```

## 6. Interface Definition

To call the Aztec Token from your contract, define this helper:

```rust
struct Token {
    address: AztecAddress,
}

impl Token {
    pub fn at(address: AztecAddress) -> Self {
        Self { address }
    }

    // Public -> Public
    pub fn transfer_in_public(
        self,
        from: AztecAddress,
        to: AztecAddress,
        amount: u128,
        nonce: Field
    ) -> CallInterface {
        CallInterface {
             target: self.address,
             selector: 0x......, // Check artifact for selector
             args: [from.to_field(), to.to_field(), amount as Field, nonce]
        }
    }
    
    // Private -> Public (Unshield)
    pub fn transfer_to_public(
        self,
        from: AztecAddress,
        to: AztecAddress,
        amount: u128,
        nonce: Field
    ) -> CallInterface {
        // ...
    }
}
```

## 7. Reference Implementations

*   **Standard Token**: `noir-contracts/contracts/app/token_contract/src/main.nr`
*   **AuthWit**: `aztec-nr/aztec/src/authwit/auth.nr`

*Generated by Aztec Agent for Liquid Staking Project*
