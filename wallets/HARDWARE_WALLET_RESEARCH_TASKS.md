# Hardware Wallet Research Tasks

> **Created:** December 8, 2025  
> **Purpose:** Research and verify additional hardware wallet projects for potential inclusion in our comparison table

---

## 🔍 Research Summary: "OpenBuild"

### Verdict: ❌ **Does NOT appear to exist as a hardware wallet group**

Your friend may be thinking of one of these:

| Name | What It Actually Is | URL |
|------|---------------------|-----|
| **OpenBuild (openbuildxyz)** | Web3 developer community platform (NOT hardware) | https://github.com/openbuildxyz |
| **OpenBuilds** | CNC machine/linear motion components (NOT crypto) | https://github.com/OpenBuilds |
| **Open-source HW wallets** | Category term, not a specific group | Various projects |

**Possible Confusion Sources:**
1. "Open Build" could be a general term for open-source hardware wallet projects
2. Could be confusing with **Keystone's** marketing ("The best open source hardware wallet")
3. Could be a local/small project not on GitHub

**Verification Steps:**
- [ ] Ask your friend for more details (website? GitHub? physical device seen?)
- [ ] Search Twitter/X for "OpenBuild hardware wallet"
- [ ] Search crypto forums (BitcoinTalk, Reddit r/Bitcoin, r/CryptoCurrency)
- [ ] Check if it's a regional/non-English project

---

## 👤 Research: Richard Moore (ricmoo)

### Who He Is

**Richard Moore** is the creator and maintainer of **ethers.js**, one of the two most popular Ethereum JavaScript libraries (the other being viem/wagmi).

| Repository | Description | Stars | Last Active |
|------------|-------------|-------|-------------|
| [ethers-io/ethers.js](https://github.com/ethers-io/ethers.js) | Complete Ethereum library and wallet implementation | 8,589 | Dec 3, 2025 ✅ |

### Hardware Wallet Connection

Richard Moore is **NOT** directly building hardware wallets, but he's highly relevant because:

1. **ethers.js includes wallet abstractions** - His library is used to connect to hardware wallets
2. **Hardware wallet SDK integration** - Ledger, Trezor, etc. use ethers.js for their web integrations
3. **Security-focused developer** - Known for thoughtful security considerations
4. **Ethereum ecosystem influence** - His opinions on wallets carry weight

### Research Tasks for Richard Moore's Opinions

- [ ] Search his Twitter (@ricmoo) for hardware wallet recommendations
- [ ] Check ethers.js documentation for hardware wallet integration guides
- [ ] Look for any talks/presentations he's given on wallet security
- [ ] Search his GitHub for any hardware-related side projects (found: `ducki` for KiCad PCB exports)

---

## 🆕 Hardware Wallets NOT in Our Comparison

### Verified Active Projects (Should Consider Adding)

| Project | GitHub | Stars | Last Active | Type | Notes |
|---------|--------|-------|-------------|------|-------|
| **SeedSigner** | [SeedSigner/seedsigner](https://github.com/SeedSigner/seedsigner) | 965 | Oct 23, 2025 | DIY BTC signing | Raspberry Pi-based, air-gapped |
| **Blockstream Jade** | [Blockstream/Jade](https://github.com/Blockstream/Jade) | 438 | Dec 8, 2025 ✅ | BTC hardware | From Blockstream, open source |
| **Specter DIY** | [cryptoadvance/specter-diy](https://github.com/cryptoadvance/specter-diy) | 531 | Dec 4, 2025 ✅ | DIY air-gapped | QR-based communication |
| **Krux** | [selfcustody/krux](https://github.com/selfcustody/krux) | 291 | Dec 4, 2025 ✅ | DIY BTC signing | Open-source firmware |
| **Satochip** | [Toporin/SatochipApplet](https://github.com/Toporin/SatochipApplet) | 155 | Active | Smartcard | JavaCard-based wallet |
| **Keycard** | [keycard-tech/keycard-shell](https://github.com/keycard-tech/keycard-shell) | 52 | Active | Modular card | From Status team |

### Needs More Research

| Project | Notes | Status |
|---------|-------|--------|
| **Portal (TwentyTwo)** | Bitcoin-only NFC wallet | GitHub not found - may be private or pre-release |
| **Sonica** | Cheap air-gapped device | Very new (1 star), needs evaluation |
| **openHW** | Arduino-based wallet | Small project (22 stars), needs security review |

---

## 📋 Task List: Wallet Verification Process

### For Each New Wallet Discovery

#### 1. Existence Verification
- [ ] **GitHub repo exists** - Is there an active public repository?
- [ ] **Official website** - Does a legitimate product page exist?
- [ ] **Physical product** - Can you actually buy/build this device?
- [ ] **Team identifiable** - Who's behind it? (real people, not anon)

#### 2. Technical Verification
- [ ] **Firmware open source?** - Can we audit the actual device firmware (not just SDK)?
- [ ] **Secure Element?** - Does it have hardware security (SE, HSM)?
- [ ] **Air-gap capability?** - QR/MicroSD only, or requires USB/BT?
- [ ] **Reproducible builds?** - Can firmware be verified against source?

#### 3. Activity Verification
```bash
# Run this for each new wallet repo:
./scripts/refresh-hardware-wallet-data.sh --repo "owner/repo-name"
```
- [ ] **Last commit date** - Within 3 months?
- [ ] **Issue response time** - Are issues being addressed?
- [ ] **Release frequency** - Appropriate for hardware (2-4/year)?

#### 4. Provenance Verification
- [ ] **Company background** - Where are they based? Funding?
- [ ] **Security audits** - Any third-party audits?
- [ ] **Track record** - Any security incidents?
- [ ] **Community reputation** - What do Bitcoin/Ethereum devs say?

#### 5. Table Fit Verification
- [ ] **Meets minimum criteria** - Has SE or compelling security story
- [ ] **Not a scam** - Verified legitimate project
- [ ] **Active development** - Not abandoned
- [ ] **Fills a gap** - Offers something our current wallets don't

---

## 🎯 Priority Research Queue

### High Priority (Active, Open Source, Significant Community)

1. **Blockstream Jade** ⭐⭐⭐
   - 438 GitHub stars, actively maintained
   - From Blockstream (highly reputable Bitcoin company)
   - Open source firmware
   - Supports Bitcoin + Liquid
   - ~$65 price point
   - **Should definitely add to comparison**

2. **SeedSigner** ⭐⭐⭐
   - 965 GitHub stars (most popular DIY option)
   - True air-gap (QR only)
   - DIY with Raspberry Pi Zero
   - Bitcoin-only
   - ~$50-100 (self-build)
   - **Should add as "DIY" category entry**

3. **Specter DIY** ⭐⭐
   - 531 GitHub stars
   - QR-based air-gap
   - ESP32-based (various hardware options)
   - Bitcoin-focused
   - **Should add as alternative DIY option**

### Medium Priority (Smaller but Legitimate)

4. **Krux** ⭐⭐
   - 291 GitHub stars
   - Similar to SeedSigner concept
   - Different hardware approach
   - **May consolidate with SeedSigner entry or add separately**

5. **Satochip** ⭐
   - 155 GitHub stars
   - JavaCard smartcard approach
   - Different form factor
   - **Interesting alternative, needs more research**

### Low Priority (Very Small/Niche)

6. **Keycard (Status)** ⭐
   - 52 stars but from reputable team
   - Modular approach
   - **Watch for growth**

---

## 📊 Proposed Table Additions

After research, here's what I recommend adding:

```markdown
| Wallet | Score | GitHub | Air-Gap | Open Source | SE | Display | Price | Conn | Activity | Rec |
|--------|-------|--------|---------|-------------|-----|---------|-------|------|----------|-----|
| **Blockstream Jade** | TBD | [Jade](https://github.com/Blockstream/Jade) | ❌ | ✅ Full | ✅ SE | LCD | ~$65 | USB/BT | ✅ Active | TBD |
| **SeedSigner** | TBD | [seedsigner](https://github.com/SeedSigner/seedsigner) | ✅ Full | ✅ Full | ❌ None | LCD | ~$50-100* | QR | ⚠️ Slow | TBD |
| **Specter DIY** | TBD | [specter-diy](https://github.com/cryptoadvance/specter-diy) | ✅ Full | ✅ Full | ❌ None | LCD | ~$50-150* | QR | ✅ Active | TBD |

*DIY cost varies based on components
```

---

## 🔗 Useful Verification Resources

### Community Resources
- [WalletScrutiny](https://walletscrutiny.com/) - Verifies open source claims
- [Bitcoin Wiki - Hardware Wallets](https://en.bitcoin.it/wiki/Hardware_wallet)
- [r/Bitcoin](https://reddit.com/r/Bitcoin) - Community discussions
- [BitcoinTalk Hardware](https://bitcointalk.org/index.php?board=14.0) - Forum discussions

### Technical Verification
- GitHub - Check commit history, issues, releases
- Official documentation - Compare claims to reality
- Security audit reports - Find third-party assessments

### Price Verification
- Official manufacturer websites (always verify before purchase)
- Note: Prices change frequently; use ~ prefix

---

## 📝 Research Log

### December 8, 2025

**"OpenBuild" Investigation:**
- Searched GitHub for "openbuild hardware wallet" - no matches
- Found `openbuildxyz` (Web3 developer community) - NOT hardware
- Found `OpenBuilds` (CNC machines) - NOT crypto
- **Conclusion:** "OpenBuild" as a hardware wallet group does not appear to exist. May be:
  - Confusion with another project name
  - A very new/private project
  - A non-English/regional project
  - A misremembering of "open-source build" concept

**Richard Moore Investigation:**
- Confirmed creator of ethers.js (8.5k stars)
- Active on GitHub as of Dec 3, 2025
- Has KiCad-related repo (PCB design) - interesting but not wallet-related
- No direct hardware wallet project found
- Recommend following @ricmoo on Twitter for wallet opinions

**New Wallet Projects Found:**
- Blockstream Jade: 438 stars, very active, should add
- SeedSigner: 965 stars, DIY champion, should add
- Specter DIY: 531 stars, alternative DIY, should add
- Krux: 291 stars, another DIY option
- Satochip: 155 stars, smartcard approach

---

## ✅ Action Items

### Immediate
1. [ ] Reach out to friend for more details on "OpenBuild"
2. [ ] Add Blockstream Jade to comparison table
3. [ ] Create "DIY/Self-Build" section for SeedSigner, Specter DIY

### Short-term
4. [ ] Score Blockstream Jade using existing methodology
5. [ ] Score SeedSigner (note: no SE, but air-gapped)
6. [ ] Update AGENTS.md with DIY wallet guidelines

### Long-term
7. [ ] Monitor Portal (TwentyTwo) for public release
8. [ ] Review Satochip for smartcard category
9. [ ] Consider "Form Factor" column (device vs card vs DIY)

---

*This document should be updated as research progresses.*
