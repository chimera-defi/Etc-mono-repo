# Wallet Project Expansion: Research Summary & Next Steps

## 🚀 Executive Summary
We have identified two high-value categories to expand the wallet radar: **Neo-Banks** (Crypto-Friendly Banking) and **On/Off-Ramps** (Infrastructure). These adjacent verticals complement the existing Wallet and Card comparisons, providing a full financial stack view for developers and power users.

## 📂 New Categories & Entities

### 1. Neo-Banks & Friendly Banking
*Banks that bridge the gap between fiat and crypto.*

*   **Top Picks (Personal):**
    *   **Juno (US):** Best for crypto-natives (L2 on-ramps, paycheck in crypto).
    *   **Revolut (Global):** Best all-in-one super app (easy buy/sell).
    *   **Monzo (UK/US):** Solid daily driver with reasonable crypto tolerance.
*   **Top Picks (Business):**
    *   **Mercury (US):** The startup standard. Friendly to non-MSB crypto startups.
    *   **FV Bank (US/PR):** Integrated custody + banking for serious ops.
*   **Niche:**
    *   **Xapo (Global):** Bitcoin-native private banking.

### 2. On/Off-Ramp Infrastructure
*The "plumbing" developers use to get users funded.*

*   **Leaders:**
    *   **MoonPay:** Best coverage & UX (High fees).
    *   **Transak:** Developer favorite (Compliance + NFT checkout).
    *   **Ramp:** Speed demon (Great for EU/L2s).
*   **Specialized:**
    *   **Sardine:** Fraud/Risk focus (Instant ACH).
    *   **Stripe:** Brand trust (Familiar UI).
    *   **Banxa:** Local payment methods king.

---

## 🤖 Research Task List (Completed & Planned)

### Phase 1: Initial Scoping (✅ Completed)
*   [x] Ideate categories (Neo-Banks, Ramps).
*   [x] Identify key entities.
*   [x] Draft preliminary comparison points (Fees, Jurisdiction, Dev UX).
*   [x] Generate `NEOBANK_COMPARISON_DRAFT.md` and `RAMP_COMPARISON_DRAFT.md`.

### Phase 2: Deep Dive Data Collection (🚀 Next Steps)
*   [ ] **Agent Task:** Verify fee structures for all On-Ramps (Spread vs. Processing Fee).
*   [ ] **Agent Task:** Confirm "Business Account" crypto policies for Monzo vs. Mercury vs. Revolut Business.
*   [ ] **Agent Task:** Check API/SDK documentation for developer ease-of-use (Ramps).

---

## 🧠 Child Agent Prompts
*Use these prompts to gather specific data points for the final tables.*

### Prompt A: Neo-Bank Policy Verification
"Agent, verify the current 'Acceptable Use Policy' for **Mercury** and **Monzo** regarding cryptocurrency. Specifically, search for:
1. Are transfers to exchanges (Coinbase/Kraken) explicitly allowed?
2. Are 'P2P crypto trading' transactions grounds for account closure?
3. Does Mercury allow accounts for DAOs or token issuers (MSBs)?"

### Prompt B: Ramp Fee Analysis
"Agent, simulate a $100 purchase of ETH on **MoonPay**, **Transak**, and **Ramp Network** for a US user.
1. Record the 'Processing Fee'.
2. Record the 'Network/Gas Fee'.
3. Compare the 'Exchange Rate' offered vs. current market spot price (the spread).
4. Calculate the 'Total Cost' for the user (Fees + Spread impact)."

### Prompt C: Developer Integration Check
"Agent, review the developer documentation for **Sardine** and **Stripe Crypto**.
1. How many lines of code to embed a simple 'Buy ETH' widget?
2. Do they offer a React SDK?
3. What are the webhook events for 'Transaction Success'?"

---

## 🏁 Recommendation
**Proceed to create two new main comparison files:**
1.  `NEOBANK_COMPARISON.md`: Focus on "Friendliness" and "Native Features".
2.  `RAMP_COMPARISON.md`: Focus on "Developer Experience" and "User Fees".
