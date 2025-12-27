# Architecture Gaps & Strategic Risks
**Critical "Unknown Unknowns" & Design Decisions Required**

*Last Updated: December 27, 2025*

## 1. Upgradeability Strategy (Critical Technical Gap)

**The Issue:** The current architecture uses immutable Noir contracts. If a bug is found or we need to change parameters (e.g., protocol fee, unbonding period) after launch, we are stuck.

**Current State:** No upgrade pattern defined.

**Options:**
1.  **Registry Pattern:** `LiquidStakingCore` points to `VaultManager` and `RewardsManager` via storage variables that can be updated by an `admin` (TimeLock).
    *   *Pros:* Simple, modular.
    *   *Cons:* Changing the "Core" logic itself is hard (requires migration of funds).
2.  **Proxy Pattern:** (If supported by Aztec) Delegate calls to implementation addresses.
    *   *Status:* **Unknown** if Aztec supports delegatecall-style proxies efficiently yet.
3.  **Migration-only:** No upgrades. To upgrade, deploy v2 and ask users to withdraw v1 -> deposit v2.
    *   *Pros:* Maximum trustlessness.
    *   *Cons:* Terrible UX, liquidity fragmentation.

**Recommendation (Acting CTO):** Implement **Option 1 (Registry/Modular)** immediately.
*   Ensure `LiquidStakingCore` stores the address of `VaultManager` and calls it dynamically.
*   Ensure `admin` can update this address (behind a 48h TimeLock).
*   **Action Item:** Add `set_vault_manager` and `set_rewards_manager` to `LiquidStakingCore` specs.

## 2. Slashing & Insurance Fund Mechanics (Critical Economic Gap)

**The Issue:** If a validator is slashed, the protocol loses AZTEC. The `stAZTEC` token is backed 1:1 (conceptually). If backing drops < 1:1, who pays?

**Current State:** `ASSUMPTIONS.md` lists slashing as "UNVERIFIED".

**Scenarios:**
1.  **Socialized Loss:** The exchange rate drops. Everyone loses 5%.
    *   *Risk:* Bank run. If slashing happens, users rush to withdraw before the rate updates.
2.  **Insurance Fund:** Protocol fees (10%) first go to an Insurance Fund until it hits X% of TVL.
    *   *Risk:* Capital inefficient early on.
3.  **Operator Bond:** We (the company) post a bond.
    *   *Risk:* Capital intensive for us.

**Recommendation (Acting CEO):** **Hybrid Model (Scenario 2 + 1).**
*   **Primary:** First 50% of protocol revenue goes to an on-chain Insurance Fund until it covers 5% of TVL.
*   **Secondary:** If loss > Insurance Fund, the exchange rate updates (Socialized Loss).
*   **Action Item:** Add `InsuranceFund` logic to `RewardsManager`.

## 3. Bot <-> Contract Interface (Critical Operational Gap)

**The Issue:** Bots are "dumb". They need explicit events to wake up. We haven't defined the *exact* payload of these events.

**Current State:** "Emit events" is a vague todo.

**Requirements:**
*   `DepositProcessed`: Must include `total_pending` so Bot knows if it's time to batch.
*   `WithdrawalRequested`: Must include `unlock_timestamp` (if known) or `epoch_index`.
*   `ValidatorStatusChange`: If a validator goes offline, Registry must emit event so Monitoring Bot screams.

**Action Item:** Create `events.nr` library shared by all contracts to ensure type safety between Contracts and Bots (which will likely parse the ABI).

## 4. Privacy vs. Transparency (Strategic Gap)

**The Issue:** Aztec is a privacy chain. Our protocol currently uses `#[public]` for everything. We are building a "transparent" protocol on a "private" chain.

**Risk:** Competitors (like Olla) might launch "Private Staking" (shielded deposits). We look like the "legacy" option on day 1.

**Mitigation:**
*   **Phase 1:** Launch Public. It's faster to audit and build.
*   **Phase 2:** "Shielded Staking". Allow users to deposit `Note` (private) -> receive `Private stAZTEC`.
*   **Action Item:** Do not over-engineer Phase 1. Accept public state for now, but design `LiquidStakingCore` to potentially accept private calls later (or deploy a separate `PrivateAdapter` contract).

## 5. Validator Infrastructure as Code (IaC)

**The Issue:** "Deploy 3 nodes" is not a plan. It's a wish.

**Current State:** No Terraform/Ansible.

**Action Item:** Create `ops/` directory. We need a reproducible definition of a "Validator Node" (Docker compose, systemd service, key management). We cannot manually SSH into servers for production.
