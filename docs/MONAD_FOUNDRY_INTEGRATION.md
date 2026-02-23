# Monad Foundry Integration Guide

**Date Created:** 2026-02-14  
**Purpose:** Set up Monad Foundry in development environment for smart contract testing on Monad network  
**Status:** Ready for execution  

---

## 📋 **Prerequisites**

- ✅ Unix-like terminal (Bash on macOS/Linux; WSL on Windows)
- ✅ Rust installed via `rustup.rs`
- ✅ Git installed
- ✅ Access to Monad RPC endpoints:
  - Testnet: `https://testnet-rpc.monad.xyz`
  - Mainnet: `https://rpc.monad.xyz`
- ⚠️ No conflicting standard Foundry installations (or allow override)

---

## 🚀 **Step-by-Step Integration**

### **Step 1: Install Monad Foundry Installer**

```bash
curl -L https://raw.githubusercontent.com/category-labs/foundry/monad/foundryup/install | bash
```

**Confirmation:** After running, restart terminal and verify:
```bash
foundryup --help
```

**Output expected:** Help text with `--network monad` option visible

---

### **Step 2: Install Monad Foundry**

```bash
foundryup --network monad
```

**Verification:**
```bash
forge --version
cast --version
anvil --version
chisel --version
```

**Expected output:** All commands should show Monad-specific versions (look for "monad" in version string)

---

### **Step 3: Set Up Local Monad EVM Node**

```bash
anvil --monad
```

**Run in separate terminal.** Keep running for subsequent steps.

**Output expected:**
```
Listening on 127.0.0.1:8545
```

---

### **Step 4: Configure Forking**

**Option A: Fork Testnet**
```bash
anvil --fork-url https://testnet-rpc.monad.xyz
```

**Option B: Fork Mainnet** (use cautiously)
```bash
anvil --fork-url https://rpc.monad.xyz
```

**Verification:** In another terminal:
```bash
cast block --rpc-url http://localhost:8545
```

**Expected output:** Block data with Monad-compatible fields

---

### **Step 5: Initialize Foundry Project with Monad Config**

```bash
mkdir my-monad-project && cd my-monad-project
forge init
```

**Edit `foundry.toml`:**
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
gas_price = 1  # Monad-specific gas model (adjust as needed)
```

**Create sample contract** (`src/MyContract.sol`):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    uint256 public value;

    function setValue(uint256 newValue) public {
        value = newValue;
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
```

**Test it:**
```bash
forge test
```

**Expected output:** Tests pass with Monad's gas rules applied

---

### **Step 6: Interact Using Cast**

```bash
# Query local node
cast block --rpc-url http://localhost:8545

# Get account info
cast account 0x1234567890123456789012345678901234567890 --rpc-url http://localhost:8545

# Deploy contract
forge create src/MyContract.sol:MyContract --rpc-url http://localhost:8545
```

**Confirmation:** Commands execute successfully with no RPC errors

---

### **Step 7: Verify Monad Features**

**Interactive REPL test:**
```bash
chisel
```

In chisel, test Monad precompiles:
```solidity
// Query Monad-specific block info
block.number
block.timestamp
block.gasLimit
```

**Expected:** Commands return values; no compilation errors

---

## 🔧 **Troubleshooting**

| Issue | Solution |
|---|---|
| `foundryup` command not found | Restart terminal after Step 1; check `$PATH` |
| Version conflicts | `foundryup --network monad --force` to override |
| Anvil won't start | Check port 8545 is free; use `--port 8546` if occupied |
| Cast RPC errors | Verify endpoint is reachable: `curl https://testnet-rpc.monad.xyz` |
| Compilation fails | Ensure Rust is up-to-date: `rustup update` |

---

## 📚 **Reference Links**

- **Monad Foundry Docs:** https://docs.monad.xyz/tooling-and-infra/toolkits/monad-foundry
- **Foundry Book:** https://book.getfoundry.sh/
- **GitHub Repository:** https://github.com/category-labs/foundry/tree/monad
- **monad-revm (EVM impl):** https://github.com/category-labs/monad-revm
- **Releases:** https://github.com/category-labs/foundry/releases
- **RPC Endpoints:** https://docs.monad.xyz/network-information/rpc-endpoints

---

## ✅ **Verification Checklist**

After completing all steps, verify:

- [ ] `foundryup --network monad` installed successfully
- [ ] `forge --version` shows Monad support
- [ ] `anvil --monad` runs without errors
- [ ] `cast block --rpc-url http://localhost:8545` returns block data
- [ ] Sample contract compiles: `forge build`
- [ ] Sample tests pass: `forge test`
- [ ] Chisel REPL launches without errors
- [ ] No compilation warnings related to Monad features

---

## 📊 **Integration Status**

| Component | Status | Last Verified |
|---|---|---|
| Monad Foundry Installer | Ready | 2026-02-14 |
| Forge (build tool) | Ready | — |
| Cast (interaction tool) | Ready | — |
| Anvil (local node) | Ready | — |
| Chisel (REPL) | Ready | — |
| Sample project | Ready | — |

---

## 🎯 **Next Steps**

1. **Execute Steps 1–7** in order, confirming each
2. **Record outputs** of verification commands (Step 7)
3. **Create real Monad project** using template contracts
4. **Test against testnet** by deploying sample contract
5. **Document findings** in `/docs/MONAD_INTEGRATION_RESULTS.md`

---

## 📝 **Notes**

- Monad Foundry overrides standard Foundry temporarily; restore with `foundryup` (no args)
- Gas model in Monad differs from Ethereum; adjust `foundry.toml` accordingly
- Keep Anvil running in background during development
- For production, always test on testnet first before mainnet deployment

---

**Created by:** Claude (OpenClaw)  
**For repo:** Etc-mono-repo  
**Integration date:** 2026-02-14  
**Reference:** OpenAI Agentic Primitives (Skills + Templates)
