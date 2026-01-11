# Data Sources & External Links

## Transparency About Our External Links

Wallet Radar contains references to external websites. This page explains why we link to these sites and how we track this traffic.

## Types of External Links

### 1. Official Wallet Websites

**Examples:** trezor.io, ledger.com, coldcard.com, keyst.one, bitbox.swiss, etc.

**Why we link:**
- Provide official sources for users to verify features and download wallets
- Link to official GitHub repositories to verify open source status
- Help users distinguish official sites from fakes/scams

**Trust Signal:** All wallet links are to official domains. We explicitly avoid:
- Redirect URLs
- Shortened links
- Phishing-like domain variations
- Unofficial mirrors or forks

### 2. GitHub Repositories

**Examples:** trezor-firmware, ledger-live, rainbow, metamask-extension, etc.

**Why we link:**
- Verify open source claims
- Track development activity (commits, releases)
- Evaluate community engagement (stars, issues, forks)
- Provide source code transparency for security audits

**Trust Signal:** GitHub is the canonical source for open source software. By linking to official repos, we help users verify legitimacy.

### 3. Security Audits & Certifications

**Examples:** Published audit reports, security certifications, Certora reports

**Why we link:**
- Back up security claims with evidence
- Link to third-party verification (not our own claims)
- Help users understand security architecture

**Trust Signal:** We cite specific, published audit reports - not generic "audited" claims.

### 4. Research & Reference Sites

**Examples:** Etherscan, WalletBeat, chainlist.org, ethereum.org, walletconnect.com

**Why we link:**
- Provide independent data verification
- Reference community standards (EIP specifications, etc.)
- Link to other trusted research

**Trust Signal:** All references are to established, well-known sources.

### 5. Social & Community

**Examples:** Twitter/X, GitHub profiles, community forums

**Why we link:**
- Provide alternative contact/verification methods
- Show active community engagement
- Enable users to verify project legitimacy

**Trust Signal:** Official accounts verified through badges and consistency.

---

## Link Tracking: utm_source Parameter

All external links from Wallet Radar include the `utm_source=walletradar` query parameter.

### What This Means

When you click an external link, your browser adds: `?utm_source=walletradar&utm_medium=comparison`

Example:
- **You see:** `https://trezor.io/`
- **Your browser navigates to:** `https://trezor.io/?utm_source=walletradar&utm_medium=comparison`

### Why We Do This

1. **Transparency** - Websites we link to can see traffic originated from Wallet Radar
2. **Attribution** - We identify ourselves as the source, not hiding it
3. **Analytics** - Helps sites understand which research platforms drive traffic
4. **Respect** - Similar to how ChatGPT and other platforms identify their traffic

### Privacy Consideration

- utm parameters are **publicly visible** in your browser URL
- They don't collect personal data about you
- They simply identify the source website (walletradar.org)
- You can remove them manually without affecting functionality

---

## Data Accuracy & Verification

### How We Verify Information

1. **GitHub Activity** - Accessed directly via GitHub API (automated)
2. **Official Websites** - Manual verification on official domains
3. **Security Audits** - Retrieved from published audit reports
4. **Feature Claims** - Cross-referenced with official documentation
5. **Community Input** - Verified through multiple sources

### Update Frequency

- **Comparison tables:** Updated weekly (for active projects)
- **Detailed reviews:** Updated monthly
- **Security information:** Updated immediately when discovered

### Data Limitations

We mark items with status icons:
- ✅ **Active/Verified** - Recently verified as working
- ⚠️ **Verify** - Needs manual confirmation (website unclear/changing)
- 🔄 **Launching** - In development, not yet released
- ❌ **Defunct** - No longer available or maintained

**Important:** Always verify current information on official websites before making decisions.

---

## How This Builds Trust

By being transparent about our external linking:

1. **We're not hiding anything** - This is the opposite of phishing
2. **We identify ourselves** - utm_source shows we're proud to be the referrer
3. **We link to official sources** - Not redirects or intermediaries
4. **We cite our data** - You can verify everything independently
5. **We acknowledge limitations** - Status indicators show verification gaps

### Phishing vs. Legitimate Sites

| Characteristic | Wallet Radar | Phishing Site |
|---|---|---|
| **External links** | Official sites only | Fake/spoofed domains |
| **Link tracking** | Transparent (utm_source) | Hidden redirects |
| **Source disclosure** | Open, visible, documented | Concealed |
| **Data sources** | Cited and verifiable | Unverified claims |
| **Disclaimers** | Multiple, prominent | None |
| **Code transparency** | GitHub visible | Proprietary/hidden |

---

## Security Considerations

### Safe Link Clicking

Before clicking any external link:

1. ✅ Check the URL in your browser's address bar (not just the link text)
2. ✅ Verify the domain matches the expected official domain
3. ✅ Look for HTTPS and a security lock icon
4. ✅ Be wary of URLs that don't match their link text

### Common Phishing Tactics (Avoid)

❌ Links that say "click here" but go to unrelated sites
❌ Links asking you to enter passwords or private keys
❌ Shortened URLs hiding the real destination
❌ Brand-spoofing domains (e.g., "trezor-official.com" instead of "trezor.io")
❌ Sites that look like official wallets but ask for seed phrases

### Our Practice

✅ All links go to official domains we've verified
✅ No shortened URLs or redirects
✅ No credential collection anywhere on our site
✅ No mimicry of wallet login/setup pages
✅ Open source code you can audit

---

## Questions?

If you have concerns about any links or data on Wallet Radar:

1. **Report an issue:** [GitHub Issues](https://github.com/chimera-defi/Etc-mono-repo/issues)
2. **Email us:** chimera_deFi@protonmail.com
3. **Check our source:** [GitHub Repository](https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets)

---

## See Also

- [About Wallet Radar](/docs/about) - Our mission and independence
- [Contributing](/docs/contributing) - How to suggest corrections
- [Security Information](/.well-known/security.txt) - IETF RFC 9116 compliance
