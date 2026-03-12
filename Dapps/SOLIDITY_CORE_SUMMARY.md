# Solidity Core: What's Happening and Where the Language is Headed

## TL;DR Summary

**Solidity is NOT forking.** Instead, it's evolving through two connected tracks:

1. **Classic Solidity** - The production language today (0.8.x → 0.9.x → 1.0)
2. **Core Solidity** - A fundamental redesign of the type system that will eventually become the default

**Key headline:** Yes, **inheritance is being removed** in Core Solidity. This is a deliberate design decision.

---

## What is Core Solidity?

Core Solidity is a **rebuild of Solidity's type system and compiler frontend** that will:

- Introduce powerful new features (generics, algebraic data types, pattern matching)
- Provide a strong foundation for compiler correctness
- Enable community-driven language evolution through a standard library
- Expand capabilities of verification and analysis tooling

**Important:** Core Solidity is NOT a new language—it's an extension. Most existing Solidity concepts carry over, and the surface syntax will remain familiar.

---

## Why the Change?

The Solidity team acknowledges the current language has problems:

1. **Technical debt** from 10 years of organic growth
2. **Inconsistent features** implemented in an ad-hoc manner
3. **Limited type system** that can't support generics safely
4. **No formal specification** - the language is too complex to formalize

Rather than grafting complex features onto the existing system (which risks introducing critical bugs), they chose to redesign from the ground up.

---

## What's Being Removed or Changed?

### Definitely Being Removed:
- **Inheritance** - Completely removed in Core Solidity
  
### Under Consideration for Rework/Replacement:
- `try`...`catch`
- Libraries (current form)
- Function pointers
- Type conversion mechanisms
- Data locations (current implementation)
- `.send()`/`.transfer()` builtins
- Virtual modifiers

---

## What's Being Added?

Core Solidity introduces features from modern languages like Rust, Haskell, and Lean:

### 1. **Algebraic Data Types (ADTs) & Pattern Matching**

Instead of enums, you can define rich types:

```solidity
// Define auction states with attached data
data AuctionState =
    NotStarted(uint256)          // stores reserve price
  | Active(uint256, address)     // stores bid + bidder
  | Ended(uint256, address)      // stores winning bid + winner
  | Cancelled(uint256, address); // stores bid at cancellation

// Pattern matching handles each case
function processAuction(state: AuctionState) -> AuctionState {
    match state {
    | NotStarted(reserve) =>
        require(msg.value >= reserve);
        return Active(msg.value, msg.sender);
    | Active(currentBid, bidder) =>
        require(msg.value > currentBid);
        return Active(msg.value, msg.sender);
    | _ => return state;
    }
}
```

### 2. **Generics / Parametric Polymorphism**

Write functions and types that work with any type:

```solidity
forall T . function identity(x : T) -> T {
    return x;
}

data Result(T) = Ok | Err(T)
```

### 3. **Traits / Type Classes**

Define shared interfaces with type-specific implementations:

```solidity
forall T . class T:Mul {
    function mul(lhs : T, rhs : T) -> T;
}

instance wad:Mul {
    function mul(lhs : wad, rhs : wad) -> wad {
        // Fixed-point multiplication implementation
    }
}
```

### 4. **Type Inference (Hindley-Milner)**

The compiler can infer types automatically, reducing boilerplate.

### 5. **First-Class & Anonymous Functions**

Functions become first-class values:

```solidity
// Short notation: (uint) -> (bool)
// Instead of: function(uint) returns (bool)
```

### 6. **Compile-Time Evaluation**

More computation happens at compile time, catching errors earlier.

---

## Timeline & Versioning

| Version | Status | Description |
|---------|--------|-------------|
| **0.8.x** | Current | Classic Solidity, production-ready |
| **0.9.x** | Planned | Breaking release - IR pipeline default, deprecations |
| **0.10+** | Future | Convergence with Core Solidity syntax |
| **1.0** | Goal | Core Solidity becomes the default frontend |

### Syntax Changes Coming (0.9 → 1.0):
- **Postfix type notation**: `uint variable` → `variable: uint`
- **New ternary syntax**: `condition ? a : b` → `if (condition) a else b`
- **Short function types**: `function(uint) returns (bool)` → `(uint) -> (bool)`
- **Magic properties → functions**: `block.number` → `block.number()`

---

## Compatibility & Migration

### Good News:
- **ABI compatibility maintained** - Classic and Core contracts can interoperate
- **Same-project coexistence** - Use both languages side by side
- **Cross-language imports** - Share free functions and interfaces
- **Automated upgrade tools** - Being investigated for release

### Breaking Changes to Expect:
- Inheritance removal requires refactoring
- Some features reworked (try/catch, libraries, data locations)
- Syntax changes (postfix types, etc.)

**The team explicitly wants to avoid a Python 2 → Python 3 situation.**

---

## Standard Library

A major goal is moving functionality OUT of the compiler INTO a standard library:

- Types like `uint256` will be defined in-language, not hardcoded
- Community can contribute via an EIP-style process
- Easier to extend and maintain
- Library authors empowered to create reusable abstractions

---

## Your Current Code

Looking at your Dapps contracts:

```solidity
// Current (Classic Solidity)
contract NFT is ERC721, Ownable {
    // inheritance from OpenZeppelin
}

contract Token is ERC20, Ownable {
    // inheritance from OpenZeppelin
}
```

**In Core Solidity**, these patterns will need to be refactored. Instead of inheritance:
- Use **composition** and **traits**
- Import shared functionality as modules
- Leverage algebraic data types for state modeling

OpenZeppelin and other library providers will likely provide Core Solidity versions of their contracts.

---

## Current Status (December 2025)

| Component | Status |
|-----------|--------|
| **Core Solidity Prototype** | Working - typechecks and generates Yul |
| **Type System** | Mostly stable, adding compile-time eval + modules |
| **Standard Library** | Rudimentary, covers basics |
| **Production Implementation** | Not started - will be in Rust/C++/Zig |
| **Formal Semantics** | Planned in Lean theorem prover |

The prototype is available at: [github.com/argotorg/solcore](https://github.com/argotorg/solcore)

---

## Future Features (Post 1.0)

The team is considering for future versions:

1. **Linear Types** - Enforce resource semantics (like Rust's ownership)
2. **Macros** - User-definable syntactic transformations
3. **Refinement Types** - Enforce program invariants at compile time
4. **Theorem Proving** - Integration for formal verification

---

## Key Takeaways to Share

1. **Not a fork** - It's an evolution with two connected tracks
2. **Inheritance is going away** - Core Solidity will NOT have contract inheritance
3. **Modern features coming** - Generics, pattern matching, traits, type inference
4. **Gradual migration** - Classic and Core can coexist in the same project
5. **Community-driven future** - Standard library will be open for contributions
6. **Formal specification** - Core Solidity will have executable formal semantics
7. **Timeline unclear** - No concrete dates, but active development

---

## Resources

- [The Road to Core Solidity](https://soliditylang.org/blog/2025/10/21/the-road-to-core-solidity) - Overview blog post
- [Core Solidity Deep Dive](https://soliditylang.org/blog/2025/11/14/core-solidity-deep-dive) - Technical details
- [Solidity Summit 2025 Recap](https://soliditylang.org/blog/2025/12/04/solidity-summit-2025-recap) - Latest updates
- [solcore Repository](https://github.com/argotorg/solcore) - Working prototype
- [Feedback Forum Thread](https://forum.soliditylang.org/t/call-for-feedback-solidity-long-term-roadmap/3530) - Community discussion

---

*Last updated: December 2025*
*Sources: Official Solidity Blog (soliditylang.org)*
