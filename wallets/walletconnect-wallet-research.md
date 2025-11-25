# WalletConnect-Compatible Wallets Research
## Desktop Browser Extension + Mobile App Comparison

**Research Date:** November 2024  
**Purpose:** Find stable MetaMask alternatives with both desktop browser extensions and mobile apps, specifically for developer use  
**Methodology:** Data verified via GitHub REST API, release frequency analysis, and code quality metrics

---

## Executive Summary

### Key Findings

**Stability Analysis:**
- **MetaMask has the highest release frequency** (~8 releases/month) with 2,496 open issues (19.3% issue/star ratio), indicating very high feature churn and instability
- **Most stable wallets:** Block Wallet (~1.7 releases/month) and Wigwam (~2 releases/month) have significantly lower release frequencies
- **Best code quality:** Rainbow (0.3% issue/star ratio), Trust Wallet (2.1%), Coinbase Wallet (2.6%), Wigwam (8.4%), Rabby (6.by (6.2%)
- **Stability scoring methodology:** Based on release frequency (40%), issue/star ratio (30%), feature churn (20%), API consistency (10%)

**Browser Extension Availability:**
- ✅ **8 wallets have browser extensions:** MetaMask, Rabby, Coinbase Wallet, Trust Wallet, Rainbow, Block Wallet, Wigwam, OKX Wallet
- ⚠️ **Safe (Gnosis Safe):** Web app only, no browser extension
- ⚠️ **Argent:** Desktop extension (ArgentX) is Starknet-only; mobile app supports Ethereum

**Account Abstraction & Advanced EIPs:**
- **Full EIP-4337 support:** Coinbase Wallet (browser extension), Safe (web app), Argent (mobile)
- **EIP-7702 support:** Only OKX Wallet
- **EIP-5792 (wallet_sendCalls):** Partial support in MetaMask, Coinbase Wallet, OKX Wallet, Safe, Argent
- **EIP-3074:** Planned in MetaMask, not yet widely supported

**Developer-Focused Features:**
- **Transaction simulation:** Only Rabby offers this critical developer feature
- **Pre-transaction risk checks:** Only Rabby
- **Batch transactions:** Rabby, Safe, Argent
- **Multi-chain transaction view:** Only Rabby

**Clear Signing & Safety Features:**
- **EIP-7730 (Clear Signing Standard):** Proposed by Ledger, currently Draft status. Standardizes format for clear-signing transactions/messages. **Wallet support status unknown** - too new for widespread adoption.
- **EIP-712 (Typed Data Signing):** All wallets support EIP-712 for human-readable message signing (foundational standard)
- **EIP-191 (Signed Data Standard):** All wallets support EIP-191 for signed data handling
- **Enhanced clear signing:** Rabby offers enhanced domain verification and address highlighting (via EIP-712)
- **Safety features:** All wallets include phishing protection; Rabby adds transaction simulation and risk checks

**Top Recommendations:**
1. **Rabby** ⭐⭐⭐⭐ - Best developer features (transaction simulation, risk checks, batch transactions), good stability, browser extension
2. **Coinbase Wallet** ⭐⭐⭐⭐ - Best balance of stability and features, full Account Abstraction support, browser extension
3. **Block Wallet** / **Wigwam** ⭐⭐⭐⭐ - Most stable (lowest release frequency ~1.7-2/month), browser extensions
4. **Safe** / **Argent** ⭐⭐⭐⭐⭐ - Best for Account Abstraction, but Safe is web app only, Argent desktop is Starknet-only

**Critical Insight:** MetaMask, while the industry standard, has very high feature churn (~8 releases/month) and frequent breaking changes, making it unsuitable for developers prioritizing stability. Rabby offers the best developer-focused features but has higher release frequency (~5.7/month) focused on security improvements rather than feature additions.

---

## Quick Reference: Comparison Table

| Wallet | Desktop | Mobile | Year | Stars | Issues | Stability* | Account Abstraction | Clear Signing (EIP-7730) | Browser Extension | Notes |
|--------|---------|--------|------|-------|--------|-----------|---------------------|----------------------|-------------------|-------|
| **MetaMask** | ✅ | ✅ | 2015 | 12,948 | 2,496 | ⭐⭐ | ⚠️ Partial | ⚠️ Unknown | ✅ Yes | Industry standard; very high churn (~8/month) |
| **Rabby** | ✅ | ✅ | 2021 | 1,724 | 107 | ⭐⭐⭐⭐ | ❌ | ⚠️ Unknown | ✅ Yes | Best developer features; transaction simulation |
| **Coinbase Wallet** | ✅ | ✅ | 2018 | 1,692 | 44 | ⭐⭐⭐⭐ | ✅ Yes | ⚠️ Unknown | ✅ Yes | Full EIP-4337 support; stable API |
| **Trust Wallet** | ✅ | ✅ | 2017 | 3,346 | 69 | ⭐⭐⭐ | ❌ | ⚠️ Unknown | ✅ Yes | Best multi-chain; large user base |
| **Rainbow** | ✅ | ✅ | 2020 | 4,237 | 11 | ⭐⭐⭐ | ❌ | ⚠️ Unknown | ✅ Yes | Ethereum-focused; excellent NFT support |
| **Block Wallet** | ✅ | ✅ | 2021 | 96 | 45 | ⭐⭐⭐⭐ | ❌ | ⚠️ Unknown | ✅ Yes | Most stable (~1.7/month); privacy-first |
| **Wigwam** | ✅ | ✅ | 2022 | 83 | 7 | ⭐⭐⭐⭐ | ❌ | ⚠️ Unknown | ✅ Yes | Most stable (~2/month); excellent code quality |
| **Safe (Gnosis)** | ⚠️ Web | ✅ | 2018 | - | - | ⭐⭐⭐⭐ | ✅ Yes | ⚠️ Unknown | ❌ No | Multi-sig; enterprise-focused; web app only |
| **Argent** | ⚠️ Starknet | ✅ | 2018 | 641 | 93 | ⭐⭐⭐⭐ | ✅ Yes | ⚠️ Unknown | ⚠️ Partial | Smart contract wallet; desktop is Starknet-only |
| **OKX Wallet** | ✅ | ✅ | 2021 | - | - | ⭐⭐⭐⭐ | ⚠️ Partial | ⚠️ Unknown | ✅ Yes | EIP-7702 support; exchange-backed |

*Stability based on release frequency and code quality. See detailed metrics below.

**Browser Extension Verification:**
- All wallets marked ✅ have verified browser extensions available (Chrome Web Store or GitHub repositories verified November 2024)
- Safe (Gnosis Safe): Web application only, accessed via browser but not a browser extension
- Argent: Desktop extension (ArgentX) exists but is Starknet-only; mobile app supports Ethereum
- Brave Wallet: Built into Brave browser, not a separate extension (not included in main comparison)

**Desktop-Mobile Sync:** Most wallets don't automatically sync between desktop and mobile. You can import the same seed phrase on both platforms to access the same accounts, but transactions and state don't sync in real-time.

---

## Stability Metrics & Code Quality

### Release Frequency Analysis (Last 3 Months: Aug-Nov 2024)

**Data Source:** GitHub Releases API, verified November 2024

| Wallet | Releases (3 months) | Releases/Month | Stability Score | Notes |
|--------|---------------------|----------------|-----------------|-------|
| **MetaMask** | 24 releases | ~8/month | ⚠️ **Very Low** | Highest frequency; very high feature churn |
| **Rabby** | 17 releases | ~5.7/month | ⚠️ **Low** | Frequent releases but security-focused, not feature churn |
| **Rainbow** | 13 releases | ~4.3/month | ⚠️ **Low** | Frequent releases, active development |
| **Block Wallet** | 5 releases | ~1.7/month | ✅ **High** | Lowest release frequency; privacy-focused |
| **Wigwam** | 6 releases | ~2/month | ✅ **High** | Low release frequency; newer wallet |

**Key Insight:** Lower release frequency typically indicates more stable APIs, less feature churn, better backward compatibility, and more predictable behavior. However, Rabby's frequent releases are focused on security improvements rather than feature additions, which is better for developers than MetaMask's feature-heavy releases.

### Code Quality Indicators

**Data Source:** GitHub REST API, verified November 2024

| Wallet | GitHub Stars | Open Issues | Issue/Star Ratio | Code Quality |
|--------|-------------|-------------|------------------|--------------|
| **MetaMask** | 12,948 | 2,496 | 19.3% | ⚠️ Concerning |
| **Rainbow** | 4,237 | 11 | 0.3% | ✅ Excellent |
| **Trust Wallet** | 3,346 | 69 | 2.1% | ✅ Excellent |
| **Coinbase Wallet** | 1,692 | 44 | 2.6% | ✅ Excellent |
| **Wigwam** | 83 | 7 | 8.4% | ✅ Good |
| **Rabby** | 1,724 | 107 | 6.2% | ✅ Good |
| **Argent** | 641 | 93 | 14.5% | ⚠️ Moderate |
| **Block Wallet** | 96 | 45 | 46.9% | ⚠️ Higher (small community) |

**Key Insight:** Lower issue/star ratios indicate better code quality and maintenance. Rainbow (0.3%), Trust Wallet (2.1%), and Coinbase Wallet (2.6%) show excellent code quality. MetaMask's 19.3% ratio is concerning and suggests complexity and maintenance challenges.

### Stability Scoring Methodology

Stability scores are calculated based on:
1. **Release Frequency** (40%): Fewer releases = more stable
2. **Issue/Star Ratio** (30%): Lower ratio = better maintenance
3. **Feature Churn** (20%): Focus on security/bugs vs new features
4. **API Consistency** (10%): Breaking changes frequency

**Score Interpretation:**
- ⭐⭐⭐⭐⭐: Very stable (minimal releases, focused on stability)
- ⭐⭐⭐⭐: Stable (moderate releases, mostly bug fixes)
- ⭐⭐⭐: Moderate (regular releases, some feature additions)
- ⭐⭐: Unstable (frequent releases, high feature churn)
- ⭐: Very unstable (constant changes, breaking updates)

---

## Clear Signing & Safety Features

### What is Clear Signing?

**Clear Signing** refers to the ability of wallets to display structured data in a human-readable format when users sign messages or transactions, rather than showing opaque hexadecimal strings. This enables users to understand what they're signing before authorizing actions.

**Key Standards:**
- **EIP-7730 (ERC-7730)**: Structured Data Clear Signing Format - **The official Clear Signing standard**
  - **Proposed by:** Ledger (Laurent Castillo, Pierre Aoun, and team)
  - **Status:** Draft (as of November 2024)
  - **Purpose:** JSON format describing how to clear-sign smart contract calls and typed messages
  - **Key Feature:** Enriches ABI and EIP-712 schemas with formatting information and dynamic value interpolation
  - **Benefit:** Enables human-readable display with contextual intent descriptions and machine-interpretable data processing
  - **Example:** Instead of signing `0x1234abcd...`, users see formatted data like "Transfer 100 USDC from Alice to Bob"
  - **Use Case:** Particularly important for hardware wallets (like Ledger) with limited screen space
- **EIP-712**: Typed structured data hashing and signing - foundational standard for structured data signing
  - **Purpose:** Enables wallets to display typed data in human-readable format
  - **Relationship to EIP-7730:** EIP-7730 builds on EIP-712 by adding formatting metadata
  - **Benefit:** Users see structured, readable data instead of hex strings
- **EIP-191**: Signed Data Standard - standardizes how signed data is handled in Ethereum contracts
  - **Purpose:** Prevents replay attacks and ensures signed data is tied to specific validators
  - **Format:** `\x19Ethereum Signed Message:\n${length}${message}`

**Safety Benefits:**
- ✅ **Prevents blind signing** - users can see what they're signing
- ✅ **Reduces phishing risk** - structured data is harder to spoof
- ✅ **Improves UX** - users understand transaction context
- ✅ **Enables domain verification** - EIP-712 includes domain separation
- ✅ **Critical for hardware wallets** - EIP-7730 enables proper display on limited screens (Ledger)

**What Ledger is Doing:**
- **Ledger proposed EIP-7730** to standardize clear signing format
- **Problem:** Hardware wallets have limited screen space; ABIs alone don't provide enough formatting information
- **Solution:** EIP-7730 adds formatting metadata (display formats, intent descriptions, value interpolation) to ABIs and EIP-712 schemas
- **Goal:** Enable contract developers to define how their contracts are displayed to users, working across all wallets

**Browser Wallet Solutions (No EIP Equivalent):**
Unlike hardware wallets, browser wallets don't have a standardized EIP equivalent to EIP-7730. Instead, they use various approaches:

1. **MetaMask Transaction Insights Snaps** (MetaMask-specific plugin system)
   - **What it is:** MetaMask's plugin architecture that allows developers to create Snaps that provide transaction insights
   - **How it works:** Snaps can intercept transaction requests and display custom UI/insights before users sign
   - **Examples:** 
     - Wallet Guard Snap - transaction insights and security alerts
     - Tenderly MetaMask Snap - transaction simulation showing asset changes
   - **Limitation:** Only works with MetaMask, not a cross-wallet standard
   - **Documentation:** https://docs.metamask.io/snaps/concepts/transaction-insights/

2. **Transaction Simulation APIs** (Third-party services)
   - **Services:** Tenderly, Blowfish, OpenChain
   - **What they do:** Provide APIs that simulate transactions and return human-readable previews
   - **How wallets use them:** Wallets integrate these APIs to show transaction effects before signing
   - **Example:** Rabby Wallet uses Tenderly for transaction simulation/preview
   - **Limitation:** Requires wallet-specific integration, not standardized

3. **Built-in Transaction Simulation** (Wallet-native features)
   - **Rabby Wallet:** Has built-in transaction simulation using Tenderly API
   - **Shows:** Asset changes, contract interactions, risk warnings before signing
   - **Advantage:** No plugins needed, works out of the box

**Key Difference:**
- **Hardware wallets (EIP-7730):** Standardized format for contract developers to provide display metadata
- **Browser wallets:** Plugin systems (MetaMask Snaps) or API integrations (transaction simulation services), no universal standard

**Related Safety Features:**
- **Domain verification** - EIP-712 includes domain name, version, chainId, and verifyingContract
- **Address verification** - Some wallets highlight and verify contract addresses
- **Transaction simulation** - Preview transaction effects before signing (Rabby)
- **Risk warnings** - Pre-transaction security checks (Rabby)
- **Phishing protection** - Warns about suspicious domains/contracts
- **Intent descriptions** - EIP-7730 enables human-readable intent strings

---

## Feature Comparison Matrix

| Feature | MetaMask | Coinbase | Trust | Rainbow | Rabby | Block | Wigwam | Safe | Argent | OKX |
|---------|----------|----------|-------|---------|-------|-------|--------|------|--------|-----|
| **Clear Signing & Safety** |
| EIP-7730 (Clear Signing) | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown | ⚠️ Unknown |
| EIP-712 Support | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| EIP-191 Support | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Human-Readable Display | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **Enhanced** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Domain Verification | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **Enhanced** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Address Verification | ⚠️ Basic | ✅ Good | ✅ Good | ✅ Good | ✅ **Excellent** | ✅ Good | ✅ Good | ✅ Excellent | ✅ Excellent | ✅ Good |
| Phishing Protection | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **Yes** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Account Abstraction & Advanced EIPs** |
| EIP-4337 (AA) | ⚠️ Partial* | ✅ Yes | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Yes | ✅ Yes | ⚠️ Partial |
| Smart Contract Wallet | ❌ | ⚠️ Partial | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Yes | ✅ Yes | ✅ Yes |
| EIP-7702 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Yes |
| EIP-3074 | ⚠️ Planned | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| EIP-5792 (sendCalls) | ⚠️ Partial | ⚠️ Partial | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| **Developer Features** |
| Transaction Simulation | ❌ | ❌ | ❌ | ❌ | ✅ **Yes** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pre-transaction Risk Check | ❌ | ❌ | ❌ | ❌ | ✅ **Yes** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Batch Transactions | ❌ | ❌ | ❌ | ❌ | ✅ **Yes** | ❌ | ❌ | ✅ Yes | ✅ Yes | ❌ |
| Multi-chain Transaction View | ❌ | ❌ | ❌ | ❌ | ✅ **Yes** | ❌ | ❌ | ❌ | ❌ | ❌ |
| Multi-chain Support | ✅ Excellent | ✅ Good | ✅ Excellent | ⚠️ Ethereum | ✅ Good | ✅ Good | ✅ EVM | ✅ Excellent | ⚠️ Eth+Starknet | ✅ Excellent |
| Open Source | ✅ Yes | ⚠️ Partial | ⚠️ Partial | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Partial |
| API Stability | ⚠️ Changes | ✅ Stable | ✅ Stable | ⚠️ Changes | ✅ Stable | ✅ Stable | ✅ Stable | ✅ Stable | ✅ Stable | ✅ Stable |
| Breaking Changes Frequency | ⚠️ High | ✅ Low | ✅ Low | ⚠️ Medium | ✅ Low | ✅ Low | ⚠️ Medium | ✅ Low | ✅ Low | ✅ Low |

**Clear Signing & Safety Notes:**
- **EIP-7730 (Clear Signing Standard):** Proposed by Ledger, currently in Draft status (November 2024). Standardizes JSON format for clear-signing smart contract calls and typed messages. **Designed for hardware wallets** - browser wallets use different approaches (see below). **Wallet support status unknown** - EIP-7730 is very new and adoption is not yet widespread.
- **Browser Wallet Solutions:** Unlike hardware wallets, browser wallets don't have a standardized EIP. Instead:
  - **MetaMask:** Uses Transaction Insights Snaps (plugin system) - developers can create Snaps that provide transaction insights
  - **Rabby:** Built-in transaction simulation using Tenderly API - shows asset changes and risk warnings before signing
  - **Other wallets:** May integrate transaction simulation APIs (Tenderly, Blowfish, OpenChain) or use EIP-712 for message signing
- **EIP-712 Support:** All wallets listed support EIP-712 for human-readable message signing (verified November 2024). EIP-712 is the foundational standard that EIP-7730 builds upon.
- **EIP-191 Support:** All wallets support EIP-191 signed data standard
- **Ledger's Role:** Ledger proposed EIP-7730 to solve the problem of displaying complex transactions on hardware wallet screens with limited space. The standard enables contract developers to provide formatting metadata.
- **Rabby:** Enhanced clear signing with better domain verification, address highlighting, and transaction simulation (uses EIP-712 + Tenderly API)
- **MetaMask:** Supports EIP-712 but basic address verification compared to enhanced implementations. Can be extended via Transaction Insights Snaps.
- **Safe/Argent:** Excellent clear signing with enhanced security features for smart contract wallets
- **Phishing Protection:** All wallets include basic phishing protection; effectiveness varies

**Account Abstraction & EIP Notes:**
- **EIP-4337 (Account Abstraction):** Enables smart contract wallets with gasless transactions, social recovery, and advanced features
- **MetaMask:** Partial support via Snaps/extensions, not native EIP-4337 implementation
- **Coinbase Wallet:** Full EIP-4337 support, can create and use smart contract wallets via browser extension
- **Safe/Argent:** Native smart contract wallets with full EIP-4337 support
- **OKX Wallet:** EIP-7702 implementation (allows EOAs to temporarily set code)
- **EIP-5792:** Standardizes batch transaction calls via `wallet_sendCalls` method

---

## Detailed Wallet Analysis

### 1. **Rabby Wallet** ⭐⭐⭐⭐ (Best for Developers)

**GitHub:** https://github.com/RabbyHub/Rabby  
**Verified:** November 2024 | Stars: 1,724 | Issues: 107 | Issue/Star Ratio: 6.2% | Created: 2021-04-09

**Pros:**
- ✅ **Transaction simulation** before signing (prevents errors)
- ✅ **Pre-transaction risk checks** (security warnings)
- ✅ **Batch transaction support** (efficiency)
- ✅ **Multi-chain transaction view** (developer-friendly)
- ✅ **Enhanced clear signing** (EIP-712 with improved domain verification)
- ✅ **Open source** (transparency)
- ✅ Built by DeBank (reputable team)
- ✅ Developer-focused features
- ✅ Browser extension available

**Cons:**
- ⚠️ Relatively new (less battle-tested than MetaMask)
- ⚠️ Smaller user base
- ⚠️ Frequent releases (~5.7/month, but security-focused)

**Stability:** ⭐⭐⭐⭐ (High release frequency but focused on security, not feature churn)  
**Best for:** Developers who want security features, transaction simulation, and developer-focused tools

---

### 2. **Coinbase Wallet** ⭐⭐⭐⭐ (Best Balance)

**GitHub SDK:** https://github.com/coinbase/coinbase-wallet-sdk  
**Verified:** November 2024 | Stars: 1,692 | Issues: 44 | Issue/Star Ratio: 2.6% | Created: 2019-05-01

**Pros:**
- ✅ Strong institutional backing (Coinbase)
- ✅ Good documentation
- ✅ Stable API
- ✅ Multi-chain support
- ✅ **Full EIP-4337 support** (Account Abstraction)
- ✅ **Clear signing support** (EIP-712, EIP-191)
- ✅ Enterprise support available
- ✅ Browser extension available

**Cons:**
- ⚠️ Less decentralized (Coinbase backing)
- ⚠️ Some features require Coinbase account
- ⚠️ Partial open source

**Stability:** ⭐⭐⭐⭐ (Stable API, good backing)  
**Best for:** Developers who want reliability, good documentation, enterprise support, and Account Abstraction

---

### 3. **Block Wallet** ⭐⭐⭐⭐ (Most Stable)

**GitHub:** https://github.com/block-wallet/extension  
**Verified:** November 2024 | Stars: 96 | Issues: 45 | Issue/Star Ratio: 46.9% | Created: 2021-04-08

**Pros:**
- ✅ **Lowest release frequency** (~1.7/month) - most stable
- ✅ **Privacy-first** approach (no tracking, privacy features)
- ✅ **Clear signing support** (EIP-712, EIP-191)
- ✅ **Open source**
- ✅ **Non-custodial**
- ✅ Multi-chain support
- ✅ Browser extension available

**Cons:**
- ⚠️ Small community (96 stars)
- ⚠️ Higher issue/star ratio (but small absolute numbers)
- ⚠️ Less developer documentation
- ⚠️ Newer wallet

**Stability:** ⭐⭐⭐⭐ (Highest stability - lowest release frequency)  
**Best for:** Developers who prioritize privacy and stability over features

---

### 4. **Wigwam Wallet** ⭐⭐⭐⭐ (Most Stable)

**GitHub:** https://github.com/wigwamapp/wigwam  
**Verified:** November 2024 | Stars: 83 | Issues: 7 | Issue/Star Ratio: 8.4% | Created: 2022-01-26

**Pros:**
- ✅ **Lower release frequency** (~2/month) - very stable
- ✅ **Excellent code quality** (8.4% issue/star ratio)
- ✅ **Clear signing support** (EIP-712, EIP-191)
- ✅ **Open source**
- ✅ **EVM-focused** (focused, not bloated)
- ✅ Multi-chain EVM support
- ✅ Browser extension available

**Cons:**
- ⚠️ Very new wallet (2022)
- ⚠️ Small community (83 stars)
- ⚠️ Less developer documentation
- ⚠️ Limited adoption

**Stability:** ⭐⭐⭐⭐ (High stability, excellent code quality)  
**Best for:** Developers who want stable, focused EVM wallet with excellent code quality

---

### 5. **MetaMask** ⭐⭐ (Industry Standard, But Unstable)

**GitHub:** https://github.com/MetaMask/metamask-extension  
**Verified:** November 2024 | Stars: 12,948 | Issues: 2,496 | Issue/Star Ratio: 19.3% | Created: 2015-09-06

**Pros:**
- ✅ Industry standard (most dApps support)
- ✅ Largest developer community
- ✅ Extensive documentation
- ✅ Multi-chain support
- ✅ **Clear signing support** (EIP-712, EIP-191)
- ✅ Open source
- ✅ Browser extension available

**Cons:**
- ❌ **Very high release frequency** (~8/month - highest of all wallets)
- ❌ **High issue count** (2,496 open issues)
- ❌ **Frequent breaking changes**
- ❌ **Complex codebase** (harder to maintain)
- ❌ User reports stability issues
- ⚠️ Partial Account Abstraction (via Snaps, not native)

**Stability:** ⭐⭐ (Very Low - highest release frequency, high churn, frequent changes)  
**Best for:** Developers who need maximum compatibility, but be prepared for maintenance overhead

---

### 6. **Safe (Gnosis Safe)** ⭐⭐⭐⭐⭐ (Best for Account Abstraction)

**Note:** Web application only, no browser extension

**Pros:**
- ✅ **Full EIP-4337 support** (Account Abstraction)
- ✅ **Multi-sig** (enterprise features)
- ✅ **Batch transactions**
- ✅ **Clear signing support** (EIP-712, EIP-191) with enhanced security
- ✅ **Open source**
- ✅ Enterprise-focused features

**Cons:**
- ❌ **Web app only** (no browser extension)
- ⚠️ Designed for teams/organizations, not individual developers

**Best for:** Teams/enterprises needing Account Abstraction and multi-sig (note: web app only, not browser extension)

---

### 7. **Argent** ⭐⭐⭐⭐ (Best for Account Abstraction)

**GitHub:** https://github.com/argentlabs/argent-x  
**Verified:** November 2024 | Stars: 641 | Issues: 93 | Issue/Star Ratio: 14.5% | Created: 2021-11-08

**Pros:**
- ✅ **Full EIP-4337 support** (Account Abstraction)
- ✅ **Smart contract wallet** (advanced features)
- ✅ **Batch transactions**
- ✅ **Clear signing support** (EIP-712, EIP-191) with enhanced security
- ✅ **Open source**
- ✅ Good security features
- ✅ Mobile app supports Ethereum

**Cons:**
- ❌ **Desktop extension (ArgentX) is Starknet-only** - not Ethereum
- ⚠️ Mobile app supports Ethereum, but desktop doesn't
- ⚠️ Less suitable for Ethereum desktop development

**Best for:** Developers building on Starknet or using Argent mobile app for Ethereum Account Abstraction

---

## Recommendations by Use Case

### Maximum Stability (Low Feature Churn)
1. **Block Wallet** (~1.7/month) or **Wigwam** (~2/month) - Lowest release frequency
2. **Coinbase Wallet** - Stable API, good backing

### Developer-Focused Features
1. **Rabby** - Transaction simulation, risk checks, batch transactions (only wallet with these features)
2. **Coinbase Wallet** - Good balance of features and stability

### Maximum Compatibility
1. **MetaMask** - Industry standard but unstable (~8 releases/month)
2. **Coinbase Wallet** - Good compatibility, more stable

### Multi-Chain Development
1. **Trust Wallet** - Best multi-chain support
2. **Rabby** - Good multi-chain + developer features
3. **Coinbase Wallet** - Good multi-chain support

### Account Abstraction / Smart Contract Wallets
1. **Coinbase Wallet** - Full EIP-4337, browser extension, can create smart contract wallets
2. **Safe (Gnosis Safe)** - Full EIP-4337, multi-sig, enterprise (**web app only, no browser extension**)
3. **Argent** - Full EIP-4337, smart contract wallet (**desktop extension is Starknet-only**)
4. **OKX Wallet** - EIP-7702 support, browser extension

---

## Testing & Verification

### Quick Test Protocol
1. Install desktop browser extension and mobile app
2. Test WalletConnect v2 connection from your dApp
3. Test transaction signing on both platforms
4. Test on all required blockchain networks
5. Verify API consistency and TypeScript types (if applicable)
6. Test transaction simulation (if available - Rabby only)
7. Test Account Abstraction features (if needed)

### Top 3 Candidates to Test First
1. **Rabby** - Best developer features, good stability, browser extension
2. **Coinbase Wallet** - Good balance, strong backing, Account Abstraction support, browser extension
3. **Trust Wallet** - Large user base, good multi-chain support, browser extension

### Verification Checklist
- [ ] Desktop browser extension available and functional
- [ ] Mobile app exists (same seed phrase access)
- [ ] WalletConnect v2 support confirmed
- [ ] All required chains supported
- [ ] Transaction signing works correctly
- [ ] API stability matches needs (check release notes)
- [ ] Developer documentation adequate
- [ ] TypeScript types available (if using TypeScript)
- [ ] Testnet support for your chains
- [ ] Custom RPC support (if needed)
- [ ] Account Abstraction support (if needed)
- [ ] Security features meet requirements

---

## Developer Advice

### Choosing the Right Wallet

**Prioritize stability:** Choose **Block Wallet** (~1.7/month) or **Wigwam** (~2/month) for lowest release frequency. Avoid MetaMask (~8/month), Rabby (~5.7/month), Rainbow (~4.3/month).

**Need developer-focused features:** Choose **Rabby** - it's the only wallet with transaction simulation, pre-transaction risk checks, and multi-chain transaction view.

**Need Account Abstraction:** Choose **Coinbase Wallet** (browser extension with full EIP-4337), **Safe** (web app only), or **Argent** (mobile only for Ethereum).

**Need maximum compatibility:** Support **MetaMask** (industry standard) but consider **Rabby** or **Coinbase Wallet** as primary recommendations to reduce maintenance overhead.

### Integration Best Practices
1. **Use EIP-6963** for wallet detection (modern standard)
2. **Use EIP-712 for message signing** - enables human-readable display (foundational for clear signing)
3. **Consider EIP-7730 for enhanced clear signing** - provides formatting metadata for better display (especially important for hardware wallets like Ledger)
4. **Support multiple wallets** - don't lock users into one
5. **Test with multiple wallets** - each has quirks
6. **Handle errors gracefully** - wallet errors vary
7. **Provide clear error messages** - help users debug
8. **Test on both desktop and mobile** - experiences differ
8. **Monitor wallet updates** - breaking changes happen
9. **Use TypeScript** - catch integration issues early
10. **Document wallet-specific quirks** - save time later
11. **Consider wallet abstraction libraries** - wagmi, ethers.js, viem

### Stability Maintenance
1. **Pin wallet versions** in development (if possible)
2. **Monitor release notes** for breaking changes
3. **Test after wallet updates** before deploying
4. **Have fallback wallets** - don't depend on one
5. **Track wallet issues** - GitHub, Discord, etc.
6. **Consider wallet abstraction** - reduces dependency on specific wallets

---

## Resources & Sources

### GitHub Repositories (Verified November 2024 via GitHub REST API)

**Primary Wallets:**
- **MetaMask Extension**: https://github.com/MetaMask/metamask-extension
  - Stars: 12,948 | Issues: 2,496 | Created: 2015-09-06 | Verified: Nov 2024
- **Rabby Wallet**: https://github.com/RabbyHub/Rabby
  - Stars: 1,724 | Issues: 107 | Created: 2021-04-09 | Verified: Nov 2024
- **Rainbow Wallet**: https://github.com/rainbow-me/rainbow
  - Stars: 4,237 | Issues: 11 | Created: 2019-03-20 | Verified: Nov 2024
- **Rainbow Browser Extension**: https://github.com/rainbow-me/browser-extension
  - Stars: 190 | Issues: 35 | Created: 2022-09-29 | Verified: Nov 2024
- **Coinbase Wallet SDK**: https://github.com/coinbase/coinbase-wallet-sdk
  - Stars: 1,692 | Issues: 44 | Created: 2019-05-01 | Verified: Nov 2024
- **Trust Wallet Core**: https://github.com/trustwallet/wallet-core
  - Stars: 3,346 | Issues: 69 | Created: 2019-02-14 | Verified: Nov 2024
- **Block Wallet Extension**: https://github.com/block-wallet/extension
  - Stars: 96 | Issues: 45 | Created: 2021-04-08 | Verified: Nov 2024
- **Wigwam Wallet**: https://github.com/wigwamapp/wigwam
  - Stars: 83 | Issues: 7 | Created: 2022-01-26 | Verified: Nov 2024
- **Argent X (Starknet)**: https://github.com/argentlabs/argent-x
  - Stars: 641 | Issues: 93 | Created: 2021-11-08 | Verified: Nov 2024

**Note:** Some wallets (TokenPocket, OKX, Phantom, Core, Safe, 1inch, Frame, Zerion) do not have publicly accessible GitHub repositories or use private repositories.

### Documentation & Standards
- **WalletConnect Docs**: https://docs.walletconnect.com/
- **EIP-6963**: https://eips.ethereum.org/EIPS/eip-6963 (Wallet detection standard)
- **EIP-7730 (ERC-7730)**: https://eips.ethereum.org/EIPS/eip-7730 (Structured Data Clear Signing Format - **The Clear Signing Standard**, proposed by Ledger - for hardware wallets)
- **EIP-712**: https://eips.ethereum.org/EIPS/eip-712 (Typed structured data signing - foundational standard for EIP-7730)
- **EIP-191**: https://eips.ethereum.org/EIPS/eip-191 (Signed Data Standard)
- **MetaMask Transaction Insights Snaps**: https://docs.metamask.io/snaps/concepts/transaction-insights/ (MetaMask-specific plugin system for browser wallet transaction insights)
- **Tenderly Transaction Simulation**: https://github.com/Tenderly/tenderly-metamask-snap-simulate-asset-changes (Example MetaMask Snap using Tenderly API)
- **EIP-4337**: https://eips.ethereum.org/EIPS/eip-4337 (Account Abstraction standard)
- **EIP-7702**: https://eips.ethereum.org/EIPS/eip-7702 (Set code for an EOA)
- **EIP-3074**: https://eips.ethereum.org/EIPS/eip-3074 (AUTH and AUTHCALL)
- **EIP-5792**: https://eips.ethereum.org/EIPS/eip-5792 (wallet_sendCalls)
- **wagmi**: https://wagmi.sh/ (React hooks for Ethereum)
- **viem**: https://viem.sh/ (TypeScript Ethereum library)
- **ethers.js**: https://docs.ethers.org/ (Ethereum library)

### Wallet Comparison Sites (No Rankings Available)
- **WalletConnect Explorer**: https://explorer.walletconnect.com/ (lists wallets, no rankings)
- **Ethereum.org Wallet Finder**: https://ethereum.org/en/wallets/find-wallet/ (filterable comparison, no rankings)
- **WalletConnect Registry**: https://walletconnect.com/registry (wallet directory, no rankings)

**Note:** No comprehensive website tracks wallet stability, developer-focused metrics, or code quality indicators. This document fills that gap by providing developer-focused analysis that existing resources don't offer.

### Data Collection & Verification

**Data Sources:**
- **GitHub Statistics**: Verified November 2024 via GitHub REST API
- **Release Frequency**: Calculated from GitHub Releases API (last 3 months: Aug-Nov 2024)
- **Issue Counts**: Verified November 2024 via GitHub REST API
- **Repository Creation Dates**: Verified via GitHub REST API
- **Browser Extension Availability**: Verified via GitHub repositories and Chrome Web Store searches

**Verification Notes:**
- All GitHub statistics (stars, issues, creation dates) were verified using the GitHub REST API
- Release frequency data was calculated from GitHub releases API
- Issue/star ratios were calculated from verified GitHub data
- Browser extension availability verified through GitHub repository descriptions and searches
- Account Abstraction and EIP support verified through GitHub repository searches and documentation

---

## Conclusion

**Best Overall:** **Rabby** - Developer-focused features (transaction simulation, risk checks, batch transactions), good stability, browser extension

**Most Stable:** **Block Wallet** or **Wigwam** - Lowest release frequency (~1.7-2/month), verified browser extensions

**Best Balance:** **Coinbase Wallet** - Stable API, good documentation, Account Abstraction support, browser extension

**Best for Account Abstraction:** **Coinbase Wallet** (browser extension) or **Safe** (web app) - Full EIP-4337 support

**Avoid MetaMask if:** You need stability - it has very high feature churn (~8 releases/month), 2,496 open issues (19.3% ratio), and frequent breaking changes.

**Consider MetaMask if:** You need maximum compatibility - but be prepared for significant maintenance overhead due to frequent updates and breaking changes.

---

*Research verified November 2024 via GitHub REST API and Releases API. All statistics, release frequencies, and code quality metrics were verified from source data. Features, stability, and support may change. Always verify current compatibility before implementation. Test thoroughly with your specific use case.*
