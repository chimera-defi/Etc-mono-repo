/**
 * Tooltip content for table headers and cells across all wallet comparison tables.
 * Content is derived from the legend sections of the markdown files.
 */

// ============================================================================
// SOFTWARE WALLET TOOLTIPS
// ============================================================================

export const softwareWalletTooltips = {
  // Table headers
  headers: {
    compare: 'Select wallets to compare side-by-side',
    wallet: 'Wallet name with overall score (0-100)',
    status: 'Recommendation status: 🟢 Recommended (75+), 🟡 Situational (50-74), 🔴 Avoid (<50), ⚪ Not for dev',
    platforms: 'Supported platforms: 📱 Mobile, 🌐 Browser Extension, 💻 Desktop App, 🔗 Web App',
    chains: 'Supported blockchain networks',
    features: 'Security features: Tx Simulation, Scam Alerts, Hardware Wallet Support',
    license: 'License type: ✅ FOSS (MIT, GPL, MPL), ⚠️ Source-available, ❌ Proprietary',
    links: 'External links to GitHub and website',
  },

  // Cell values
  recommendation: {
    recommended: 'Recommended (score 75+): Meets core criteria and has strong features',
    situational: 'Situational (score 50-74): Good for specific use cases, may have limitations',
    avoid: 'Avoid (score <50): Major issues or abandoned development',
    'not-for-dev': 'Not for developers: Consumer-focused, lacks developer features',
  },

  license: {
    open: 'Open source: MIT, GPL, MPL, or similar FOSS license',
    partial: 'Source-available: Code visible but restrictive license (e.g., BUSL)',
    closed: 'Proprietary: Closed source code',
  },

  active: {
    active: 'Active: Commits within last 30 days',
    slow: 'Slow: Last commit 1-4 months ago',
    inactive: 'Inactive: No commits for 4+ months',
    private: 'Private: Closed source repository',
  },

  devices: {
    mobile: 'Mobile app available (iOS/Android)',
    browser: 'Browser extension available',
    desktop: 'Desktop app available',
    web: 'Web app available',
  },

  features: {
    txSimulation: 'Transaction simulation: Preview transaction outcomes before signing',
    scamAlerts: 'Scam/phishing alerts: Built-in protection against malicious sites',
    hardwareSupport: 'Hardware wallet support: Connect Ledger, Trezor, etc.',
  },

  core: {
    full: 'Core criteria met: Has both mobile app AND browser extension',
    partial: 'Partial: Missing either mobile app or browser extension',
    none: 'Does not meet core criteria',
  },

  apiOpenness: {
    open: 'Open API: Backend services are open source AND self-hostable',
    public: 'Public API: APIs accessible without auth, but code is proprietary',
    partial: 'Partial API: Uses third-party providers (Infura, Alchemy) or limited open APIs',
    closed: 'Closed API: Proprietary backend, no public access',
  },

  audits: {
    recent: 'Recent audit: Security audit completed in 2023 or later',
    old: 'Old audit: Security audit is outdated (pre-2023)',
    bounty: 'Bug bounty: Has active bug bounty program (e.g., HackerOne)',
    none: 'No audit: No known security audits or bounty program',
  },

  funding: {
    sustainable: 'Sustainable: Established company or profitable business model',
    vc: 'VC-dependent: Relies on venture capital funding',
    risky: 'Risky: Unknown or unstable funding source',
  },

  ensNaming: {
    full: 'Full ENS: Mainnet + subdomain support',
    basic: 'Basic ENS: Mainnet only',
    import: 'Import only: Can display ENS but cannot send to .eth addresses',
    none: 'No ENS support',
  },
} as const;

// ============================================================================
// HARDWARE WALLET TOOLTIPS
// ============================================================================

export const hardwareWalletTooltips = {
  headers: {
    compare: 'Select wallets to compare side-by-side',
    wallet: 'Wallet name with overall score (0-100) and price',
    status: 'Recommendation status: 🟢 Recommended (75+), 🟡 Situational (50-74), 🔴 Avoid (<50)',
    airGap: 'Air-gap capability for enhanced security',
    secureElement: 'Secure Element (SE) chip for key storage',
    openSource: 'Firmware and bootloader source code availability',
    connectivity: 'Connection methods: USB, Bluetooth, QR, NFC, MicroSD',
    links: 'External links to GitHub and website',
  },

  airGap: {
    true: 'Air-gapped: QR codes or MicroSD only, never connects during signing',
    false: 'Not air-gapped: Requires USB or Bluetooth connection for signing',
  },

  secureElement: {
    true: 'Has Secure Element: Dedicated security chip protects private keys',
    false: 'No Secure Element: Uses MCU only (less physical security)',
  },

  openSource: {
    full: 'Fully open source: Firmware and bootloader code available',
    partial: 'Partially open: Companion app open, but firmware is closed',
    closed: 'Closed source: Proprietary firmware',
  },

  connectivity: {
    'USB-C': 'USB-C: Modern wired connection',
    USB: 'USB: Wired connection',
    Bluetooth: 'Bluetooth: Wireless connection',
    QR: 'QR codes: Air-gapped communication via camera',
    NFC: 'NFC: Near-field communication (tap to connect)',
    MicroSD: 'MicroSD: Air-gapped data transfer via memory card',
    WiFi: 'WiFi: Network connection',
  },

  display: {
    'Touch Color': 'Color touchscreen display',
    'Mono OLED': 'Monochrome OLED display with buttons',
    'Color LCD': 'Color LCD display',
    LCD: 'LCD display',
    'E-Ink Touch': 'E-Ink touchscreen (like e-readers)',
    None: 'No display (NFC card form factor)',
  },

  activity: {
    active: 'Active: Firmware commits within last 30 days',
    slow: 'Slow: Last commit 1-4 months ago',
    inactive: 'Inactive: No commits for 4+ months',
    private: 'Private: Closed source firmware repository',
  },
} as const;

// ============================================================================
// CRYPTO CARD TOOLTIPS
// ============================================================================

export const cryptoCardTooltips = {
  headers: {
    compare: 'Select cards to compare side-by-side',
    card: 'Card name with overall score (0-100)',
    cardType: 'Card type: Credit, Debit, Prepaid, or Business',
    region: 'Geographic availability',
    cashback: 'Maximum cashback/rewards rate (may require staking or tiers)',
    rewards: 'Type of rewards earned (BTC, ETH, platform tokens)',
    annualFee: 'Yearly card fee ($0 = no annual fee)',
  },

  cardType: {
    credit: 'Credit card: Borrow funds, pay back monthly',
    debit: 'Debit card: Spend directly from balance',
    prepaid: 'Prepaid card: Load funds before spending',
    business: 'Business card: For company expenses',
  },

  custody: {
    self: 'Self-custody: You control your private keys (non-custodial)',
    exchange: 'Exchange custody: Funds held on centralized exchange',
    cefi: 'CeFi custody: Funds held by centralized finance company',
  },

  businessSupport: {
    yes: 'Business accounts supported',
    no: 'Personal accounts only',
    verify: 'Business support status needs verification',
  },

  status: {
    active: 'Active: Card is available and working',
    verify: 'Verify: Status or availability needs confirmation',
    launching: 'Launching: Card is coming soon',
  },

  region: {
    US: 'Available in United States',
    EU: 'Available in European Union and/or UK',
    UK: 'Available in United Kingdom only',
    CA: 'Available in Canada',
    AU: 'Available in Australia',
    Global: 'Available globally (200+ countries)',
  },
} as const;

// ============================================================================
// RAMP TOOLTIPS
// ============================================================================

export const rampTooltips = {
  headers: {
    compare: 'Select providers to compare side-by-side',
    provider: 'Provider name with overall score (0-100)',
    status: 'Recommendation: 🟢 Recommended (75+), 🟡 Situational (50-74), 🔴 Avoid (<50)',
    type: 'On-Ramp (fiat → crypto), Off-Ramp (crypto → fiat), or Both',
    coverage: 'Number of countries supported',
    feeModel: 'Fee structure: Low, Medium, High, Variable, or Usage-Based',
    minFee: 'Minimum transaction fee (~ indicates approximate)',
    devUx: 'Developer experience quality: Excellent, Great, Good, Advanced',
    links: 'External links to provider website',
  },

  rampType: {
    both: 'Both: Supports fiat → crypto (on-ramp) AND crypto → fiat (off-ramp)',
    'on-ramp': 'On-Ramp only: Convert fiat to crypto',
    'off-ramp': 'Off-Ramp only: Convert crypto to fiat',
  },

  feeModel: {
    Low: 'Low fees: Generally under 2% total cost',
    'Low/Medium': 'Low to medium fees: Around 1.5-2.5% total cost',
    Medium: 'Medium fees: Around 2-3.5% total cost',
    'Medium/High': 'Medium to high fees: Around 3-4.5% total cost',
    High: 'High fees: Over 4% total cost',
    Variable: 'Variable: Fees depend on payment method, region, or volume',
    'Usage Based': 'Usage-based: Custom pricing based on integration and volume',
    Custom: 'Custom: Pricing negotiated based on business needs',
  },

  devUx: {
    Excellent: 'Excellent: Best-in-class SDK/API, great docs, easy integration',
    Great: 'Great: Well-designed SDK with good documentation',
    Good: 'Good: Solid API with standard documentation',
    Advanced: 'Advanced: Powerful features but may require more setup',
    Basic: 'Basic: Simple widget-based integration',
  },

  status: {
    active: 'Active: Provider is operational',
    verify: 'Verify: Status needs confirmation',
    launching: 'Launching: Coming soon',
  },

  // Fee structure notes
  feeNotes: {
    processing: 'Processing fee: Charged by the provider (typically 1-4.5%)',
    network: 'Network fee: Gas costs paid by user',
    spread: 'Spread: Hidden cost in quoted vs. market price (1-3%)',
    warning: '"Zero fee" often hides costs in spread. Always check Amount Received vs. Spot Price.',
  },
} as const;

// ============================================================================
// COMMON TOOLTIPS
// ============================================================================

export const commonTooltips = {
  score: 'Score (0-100): Weighted score based on security, features, and usability',

  recommendation: {
    recommended: '🟢 Recommended (75+): Strong choice for most users',
    situational: '🟡 Situational (50-74): Good for specific use cases',
    avoid: '🔴 Avoid (<50): Significant issues or limitations',
  },

  chains: {
    evm: 'EVM: Ethereum & all EVM-compatible chains (Polygon, Arbitrum, Base, Optimism, etc.)',
    bitcoin: 'Bitcoin: Bitcoin network (BTC, SegWit, Taproot)',
    solana: 'Solana: Solana network (SOL)',
    move: 'Move: Move-based chains (Sui, Aptos)',
    cosmos: 'Cosmos: Cosmos ecosystem (ATOM, Osmosis, Celestia, etc.)',
    polkadot: 'Polkadot: Polkadot/Substrate chains (DOT, Kusama)',
    starknet: 'Starknet: Starknet L2 (Cairo-based, not EVM)',
    other: 'Other chains: TON, XRP, Tron, Cardano, etc.',
  },
} as const;

// Type exports for type-safe tooltip access
export type SoftwareWalletTooltipKey = keyof typeof softwareWalletTooltips.headers;
export type HardwareWalletTooltipKey = keyof typeof hardwareWalletTooltips.headers;
export type CryptoCardTooltipKey = keyof typeof cryptoCardTooltips.headers;
export type RampTooltipKey = keyof typeof rampTooltips.headers;
