# Front-End Marketing Copy & Content

## Overview
This document contains all marketing copy, headlines, descriptions, and content needed for the front-end website. Use this as the single source of truth for all text content.

---

## 🏠 Homepage Content

### Hero Section

#### Headline Options

**Option 1 (Recommended):**
```
Ethereum Node Setup
In Minutes, Not Days
```

**Option 2:**
```
Run Your Own
Uncensored Ethereum Node
```

**Option 3:**
```
From Zero to Validator
In One Command
```

#### Subheadline

```
Transform a fresh cloud server into a fully-configured Ethereum node. 
Choose from 6 execution clients and 6 consensus clients. Set up MEV-Boost, 
secure RPC endpoints, and comprehensive security hardening—all automated. 
Save 2+ days compared to manual guides.
```

#### Badge Text

```
Zero to Ethereum node in 30 minutes
```

#### Primary CTA Button

```
Get Started
```

#### Secondary CTA Button

```
View on GitHub
```

#### Stats Section

**Stat 1:**
- Number: `12`
- Label: `Clients Supported`

**Stat 2:**
- Number: `36`
- Label: `Client Combinations`

**Stat 3:**
- Number: `~30m`
- Label: `Setup Time`

**Stat 4:**
- Number: `1`
- Label: `Command`

---

## 🎯 Feature Sections

### Feature 1: Client Diversity

**Title:**
```
Choose Your Perfect Client Stack
```

**Description:**
```
Support for all major Ethereum clients—mix and match execution and consensus 
clients for optimal performance and network diversity. From lightweight Nimbus 
to enterprise-grade Teku, find the perfect combination for your hardware and needs.
```

**Icon:** `Grid3x3` or `Layers` (Lucide)

**Key Points:**
- 6 execution clients (Geth, Erigon, Reth, Nethermind, Besu, Nimbus-eth1)
- 6 consensus clients (Prysm, Lighthouse, Teku, Nimbus, Lodestar, Grandine)
- 36 possible combinations
- Hardware-specific recommendations

---

### Feature 2: One-Liner Installation

**Title:**
```
From Zero to Node in One Command
```

**Description:**
```
No manual configuration files. No hours of reading documentation. Just one 
command and you're running. Our automated scripts handle everything—security 
hardening, client installation, MEV setup, and RPC configuration.
```

**Icon:** `Terminal` or `Zap` (Lucide)

**Code Example:**
```bash
curl -fsSL https://raw.githubusercontent.com/chimera-defi/eth2-quickstart/main/run_1.sh | bash
```

**Key Points:**
- Single command installation
- Automated configuration
- Idempotent (safe to re-run)
- No manual file editing required

---

### Feature 3: Security First

**Title:**
```
Enterprise-Grade Security Out of the Box
```

**Description:**
```
Firewall rules, fail2ban, SSH hardening, secure file permissions—all configured 
automatically. Your node is protected from day one with industry best practices 
and comprehensive security monitoring.
```

**Icon:** `Shield` or `Lock` (Lucide)

**Security Features:**
- UFW firewall configuration
- Fail2ban protection
- SSH key authentication
- Secure file permissions
- Localhost service binding
- Security monitoring

**Key Points:**
- Zero-config security
- Industry best practices
- Protection from common attacks
- Continuous monitoring

---

### Feature 4: MEV Integration

**Title:**
```
Maximize Validator Rewards
```

**Description:**
```
Built-in MEV-Boost and Commit-Boost support. Configure once, earn more. 
Connect to multiple relays, set minimum bids, and optimize your validator 
rewards automatically.
```

**Icon:** `TrendingUp` or `Coins` (Lucide)

**MEV Features:**
- MEV-Boost integration (standard)
- Commit-Boost support (advanced)
- Multiple relay connections
- Configurable minimum bids
- Automatic optimization

**Key Points:**
- Increase validator rewards
- Multiple MEV solutions
- Easy configuration
- Automatic relay management

---

### Feature 5: Uncensored RPC

**Title:**
```
Your Own Censorship-Resistant RPC
```

**Description:**
```
Run your own RPC endpoint. Faster than Infura/Alchemy, completely uncensored. 
Share with friends, use for your dApps, or offer as a service. Includes SSL 
certificates, rate limiting, and security hardening.
```

**Icon:** `Globe` or `Server` (Lucide)

**RPC Features:**
- Fast, local RPC endpoint
- SSL/TLS encryption
- Rate limiting
- Censorship-resistant
- Nginx or Caddy support
- Easy domain setup

**Key Points:**
- Faster than public RPCs
- No censorship
- SSL included
- Easy to share
- Production-ready

---

## 📖 Quickstart Page Content

### Page Title

```
Quick Start Guide - Ethereum Node Setup
```

### Page Meta Description

```
Get your Ethereum node running in 30 minutes. Step-by-step guide with 
automated scripts, client selection, and security configuration.
```

### Prerequisites Section

**Title:**
```
Prerequisites
```

**Content:**
```
Before you begin, ensure you have:

- **Server**: Cloud VPS with SSH access (Ubuntu 20.04+)
- **Hardware**: 2-4TB SSD/NVMe, 16-64GB RAM, 4-8 cores
- **Network**: Stable broadband connection (unmetered preferred)
- **Access**: SSH key configured or root access
```

### Installation Steps

**Step 1: Download and Prepare**
```bash
git clone https://github.com/chimera-defi/eth2-quickstart
cd eth2-quickstart
chmod +x run_1.sh
```

**Step 2: Run Server Setup (as root)**
```bash
sudo ./run_1.sh
```

This script will:
- Upgrade Ubuntu and programs
- Set up firewalls and security hardening
- Create non-root user for safety
- Install required programs

**Step 3: Reboot and Configure**
```bash
sudo reboot
# Login as new user (default: eth@ip)
```

**Step 4: Configure and Install Clients**
```bash
# Edit exports.sh with your settings
nano exports.sh

# Or use interactive client selection
./select_clients.sh

# Run installation
./run_2.sh
```

**Step 5: Start Services**
```bash
sudo systemctl start eth1 cl validator mev
sudo systemctl status eth1 cl validator mev
```

### Troubleshooting Section

**Title:**
```
Troubleshooting
```

**Common Issues:**

**Issue 1: Services not starting**
```bash
# Check logs
journalctl -u service_name -f

# Verify configuration
./docs/verify_security.sh
```

**Issue 2: Sync issues**
- Verify network connectivity
- Check client status
- Review client-specific documentation

**Issue 3: Permission errors**
- Ensure proper file ownership
- Check file permissions
- Verify user has sudo access

**Getting Help:**
- Check documentation: `docs/` directory
- Review logs: `journalctl -u service_name`
- GitHub Issues: [Link to issues]
- GitHub Discussions: [Link to discussions]

---

## 📚 Learn Page Content

### Page Title

```
Learn - Ethereum Node Setup Documentation
```

### Page Meta Description

```
Comprehensive documentation for Ethereum node setup, client configuration, 
security, MEV integration, and RPC endpoints.
```

### Documentation Links Section

**Title:**
```
Documentation Hub
```

**Links:**

1. **Main README**
   - Description: Project overview and quickstart guide
   - Link: `README.md`

2. **Scripts Reference**
   - Description: Detailed script reference and usage
   - Link: `docs/SCRIPTS.md`

3. **Configuration Guide**
   - Description: Configuration architecture and conventions
   - Link: `docs/CONFIGURATION_GUIDE.md`

4. **Security Guide**
   - Description: Comprehensive security documentation
   - Link: `docs/SECURITY_GUIDE.md`

5. **MEV Guide**
   - Description: MEV setup and configuration
   - Link: `docs/MEV_GUIDE.md`

6. **Workflow Guide**
   - Description: Setup workflow and process
   - Link: `docs/WORKFLOW.md`

### Client Comparison Tables

**Execution Clients Table:**

| Client | Language | Description | Best For | Install Script |
|--------|----------|-------------|----------|----------------|
| **Geth** | Go | Original Go implementation, most stable | Beginners, stability | `geth.sh` |
| **Erigon** | Go | Re-architected for efficiency | Performance, fast sync | `erigon.sh` |
| **Reth** | Rust | Modern Rust implementation | Performance, modularity | `reth.sh` |
| **Nethermind** | C# | Enterprise-focused .NET client | Enterprise, advanced features | `nethermind.sh` |
| **Besu** | Java | Apache 2.0 licensed, enterprise-ready | Private networks, compliance | `besu.sh` |
| **Nimbus-eth1** | Nim | Lightweight, resource efficient | Raspberry Pi, low resources | `nimbus_eth1.sh` |

**Consensus Clients Table:**

| Client | Language | Description | Best For | Install Script |
|--------|----------|-------------|----------|----------------|
| **Prysm** | Go | Well-documented, reliable | Beginners, documentation | `prysm.sh` |
| **Lighthouse** | Rust | Security-focused, high performance | Performance, security | `lighthouse.sh` |
| **Teku** | Java | ConsenSys-developed, enterprise features | Institutional, monitoring | `teku.sh` |
| **Nimbus** | Nim | Lightweight, resource efficient | Raspberry Pi, low resources | `nimbus.sh` |
| **Lodestar** | TypeScript | Developer-friendly, modern | Development, TypeScript devs | `lodestar.sh` |
| **Grandine** | Rust | High-performance, cutting-edge | Advanced users, performance | `grandine.sh` |

### Configuration Examples

**Example 1: Basic Configuration**
```bash
# In exports.sh
export ETH_NETWORK='mainnet'
export FEE_RECIPIENT='0xYourAddress'
export GRAFITTI='YourNode'
```

**Example 2: Client Selection**
```bash
# Execution client
export EXEC_CLIENT='geth'

# Consensus client
export CONS_CLIENT='prysm'
```

**Example 3: MEV Configuration**
```bash
# MEV-Boost setup
export MEV_RELAYS='https://relay1,https://relay2'
export MIN_BID=0.002
```

---

## 🔍 SEO & Meta Content

### Homepage Meta Tags

**Title:**
```
Ethereum Node Quick Setup - From Zero to Validator in 30 Minutes
```

**Description:**
```
Transform a fresh cloud server into a fully-configured Ethereum node. 
Choose from 6 execution and 6 consensus clients. Automated security, 
MEV integration, and RPC endpoints. Save 2+ days vs manual setup.
```

**Keywords:**
```
ethereum node, validator setup, eth2 quickstart, ethereum staking, 
rpc node, mev boost, ethereum clients, node installation
```

### Open Graph Tags

**og:title:**
```
Ethereum Node Quick Setup - Automated Installation in Minutes
```

**og:description:**
```
Get your Ethereum node running in 30 minutes. Support for 12 clients, 
automated security, MEV integration, and uncensored RPC endpoints.
```

**og:image:**
```
/og-image.jpg (1200x630px)
```

**og:url:**
```
https://eth2-quickstart.com (or actual domain)
```

### Twitter Card Tags

**twitter:card:**
```
summary_large_image
```

**twitter:title:**
```
Ethereum Node Quick Setup - Zero to Validator in 30 Minutes
```

**twitter:description:**
```
Automated Ethereum node installation. 12 clients, security hardening, 
MEV integration. Save 2+ days vs manual setup.
```

**twitter:image:**
```
/og-image.jpg
```

---

## 🎨 UI Text & Labels

### Navigation

- **Logo/Brand:** `Ethereum Node Setup` or `ETH2 Quick Start`
- **GitHub Link:** `GitHub`
- **Learn Link:** `Learn`
- **Get Started Button:** `Get Started`

### Footer

- **Copyright:** `© 2024 Ethereum Node Quick Setup`
- **Links:**
  - GitHub
  - Documentation
  - Issues
  - Discussions

### Buttons & CTAs

- **Primary CTA:** `Get Started`
- **Secondary CTA:** `View on GitHub`
- **Copy Code:** `Copy`
- **Learn More:** `Learn More`
- **View Docs:** `View Documentation`

### Status Messages

- **Loading:** `Loading...`
- **Error:** `Something went wrong. Please try again.`
- **Success:** `Installation complete!`
- **Copy Success:** `Copied to clipboard!`

---

## 📝 Terminal Mockup Content

### Installation Command Example

```bash
$ curl -fsSL https://raw.githubusercontent.com/chimera-defi/eth2-quickstart/main/run_1.sh | bash

==================================================
       Ethereum Node Quick Start Setup
==================================================

[*] Checking system requirements...
[*] Updating system packages...
[*] Setting up firewall rules...
[*] Creating secure user...
[*] Installing dependencies...
[*] Configuration complete!

Run './run_2.sh' to install clients.
```

### Alternative: Service Status

```bash
$ sudo systemctl status eth1 cl validator mev

● eth1.service - Ethereum Execution Client
   Active: active (running)
   
● cl.service - Ethereum Consensus Client  
   Active: active (running)
   
● validator.service - Ethereum Validator
   Active: active (running)
   
● mev.service - MEV-Boost
   Active: active (running)
```

---

## 🎯 Call-to-Action Variations

### Primary CTAs

1. **"Get Started"** → Links to quickstart page
2. **"Start Setup"** → Links to quickstart page
3. **"Install Now"** → Links to quickstart page

### Secondary CTAs

1. **"View on GitHub"** → Links to GitHub repo
2. **"Read Documentation"** → Links to learn page
3. **"Learn More"** → Links to learn page

### Feature CTAs

1. **"Choose Clients"** → Links to client selection guide
2. **"Configure Security"** → Links to security guide
3. **"Set Up MEV"** → Links to MEV guide

---

## 📊 Social Proof Content

### Testimonials (Placeholder - Replace with Real)

**Testimonial 1:**
> "Saved me 2 days of configuration. Everything just works."
> — Solo Staker

**Testimonial 2:**
> "Best Ethereum node setup I've used. Security is top-notch."
> — Node Operator

**Testimonial 3:**
> "The client selection guide helped me choose the perfect stack."
> — Validator

### Metrics (If Available)

- GitHub Stars: `[Number]`
- Installations: `[Number]`
- Community Size: `[Number]`

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Front-End Development Team
