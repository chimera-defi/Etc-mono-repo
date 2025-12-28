# Environment Setup Required

**Priority:** 🔴 Do this FIRST

The contracts are complete but cannot compile because `aztec-nargo` requires Docker.

---

## The Problem

```bash
# This works (pure Noir)
cd contracts/staking-math-tests && ~/.nargo/bin/nargo test  # ✅ 64 tests pass

# This fails (needs aztec-nargo)
cd contracts/liquid-staking-core && ~/.nargo/bin/nargo check  # ❌ Panics on #[aztec] macros
```

---

## Option A: Get Docker Working

```bash
# Check Docker
docker --version
sudo systemctl start docker

# Pull Aztec image and extract aztec-nargo
docker pull aztecprotocol/aztec:latest
docker run --rm -v ~/aztec-bin:/out aztecprotocol/aztec:latest cp /usr/local/bin/aztec-nargo /out/

# Compile
cd /workspace/staking/aztec/contracts/liquid-staking-core
~/aztec-bin/aztec-nargo compile
```

---

## Option B: Native Install

```bash
# Try official installer
curl -s https://install.aztec.network | bash
```

---

## Option C: CI Compilation

If local setup fails, use GitHub Actions with the Aztec Docker image.

---

## Success Criteria

```bash
aztec-nargo compile  # Creates target/ directory with .json artifacts
```

---

## Do NOT

- Modify contract code (it's complete)
- Try to make `#[aztec]` macros work with standard `nargo`
- Spend >30 min on one approach before trying alternatives
