# Wallet Comparison Frontend

A developer-focused crypto wallet comparison website generated from Markdown files using Next.js.

## Features

- 📊 **Markdown-to-Website**: Automatically converts Markdown files to beautiful web pages
- 🎨 **Modern UI**: Built with Next.js 14, Tailwind CSS, and Lucide icons
- 📱 **Responsive**: Mobile-first design with desktop optimization
- 🔍 **SEO Optimized**: Proper metadata for all pages
- 📚 **Table of Contents**: Auto-generated navigation for long documents
- 🌓 **Dark Mode Ready**: CSS variables for theming

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (optional - defaults to configured GA ID)
cp .env.example .env.local
# Edit .env.local with your Google Analytics Measurement ID if needed

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles + prose styling
│   │   ├── layout.tsx       # Root layout with nav/footer
│   │   ├── page.tsx         # Home page
│   │   ├── not-found.tsx    # 404 page
│   │   └── docs/[slug]/
│   │       └── page.tsx     # Dynamic document pages
│   ├── components/
│   │   ├── Navigation.tsx   # Header navigation
│   │   ├── Footer.tsx       # Site footer
│   │   ├── MarkdownRenderer.tsx  # Markdown to HTML
│   │   ├── TableOfContents.tsx   # TOC sidebar
│   │   ├── WalletCard.tsx   # Document card
│   │   └── StatsCard.tsx    # Statistics display
│   └── lib/
│       ├── markdown.ts      # Markdown processing utilities
│       └── utils.ts         # Utility functions
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Content Management

The frontend reads Markdown files from the parent `wallets/` directory:

| File | Page URL |
|------|----------|
| `README.md` | `/docs/readme` |
| `SOFTWARE_WALLETS.md` | `/docs/software-wallets` |
| `HARDWARE_WALLETS.md` | `/docs/hardware-wallets` |
| `CRYPTO_CARDS.md` | `/docs/crypto-cards` |
| `CONTRIBUTING.md` | `/docs/contributing` |

### Wallet data tables (used by `/explore`)

The interactive explorer reads **markdown tables** from the parent `wallets/` directory via `src/lib/wallet-data.ts`.

If you change any of these table column orders, you must update the parser + run tests:

- `SOFTWARE_WALLETS.md` (software wallets)
  - Columns: Wallet, Score, Core, Rel/Mo, RPC, GitHub, Active, Chains, Devices, Testnets, License, Audits, Funding, Tx Sim, Scam, Account, ENS/Naming, HW, Best For, Rec
- `HARDWARE_WALLETS.md` (hardware wallets)
  - Columns: Wallet, Score, GitHub, Air-Gap, Open Source, Secure Elem, Display, Price, Conn, Activity, Rec
- `CRYPTO_CARDS.md` (cards)
  - Columns: Card, Score, Type, Custody, Biz, Region, Cash Back, Annual Fee, FX Fee, Rewards, Status, Best For
  - Note: Card column contains clickable link to provider website (e.g., `[**Card Name**](url)`)

`npm test` runs a lightweight smoke test in `scripts/smoke-test-wallet-data.js` to catch table header/structure drift.

### Adding New Documents

1. Add a new Markdown file to `wallets/`
2. Update `DOCUMENT_CONFIG` in `src/lib/markdown.ts`:

```typescript
'NEW_FILE.md': {
  title: 'Page Title',
  description: 'Brief description',
  category: 'comparison' | 'research' | 'guide' | 'other',
  order: 6, // Display order
},
```

3. Rebuild the site

## AWS Amplify Deployment

This project is configured for AWS Amplify deployment. The `amplify.yml` in the repo root handles:

1. Installing dependencies
2. Building the Next.js app
3. Deploying the static output

### Manual Deployment

```bash
# Build for production
npm run build

# The output is in .next/ directory
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown + remark-gfm + rehype plugins
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes OG image generation) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |
| `npm test` | Run wallet data smoke tests |
| `npm run generate-og` | Generate page-specific OG images |
| `npm run validate-cards` | Validate Twitter Cards and OG tags |

## Customization

### Colors

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  /* ... */
}
```

### Typography

Markdown styling is in `src/app/globals.css` under `.prose-wallet` classes.

### Navigation

Update `navItems` in `src/components/Navigation.tsx` to change the header menu.

## Analytics & Privacy

### Google Analytics 4

Google Analytics 4 (GA4) is integrated via standard inline scripts in the HTML `<head>`:

- **Measurement ID**: `G-L6ZV569CMN` (hardcoded in `layout.tsx` for static export reliability)
- **Location**: Inline scripts in `src/app/layout.tsx`
- **Implementation**: Standard Google-recommended approach for static sites

The GA script is included directly in the HTML head (not via React components) to ensure tracking works reliably on statically exported sites.

## SEO Features

### Implemented SEO

| Feature | Status | Notes |
|---------|--------|-------|
| Meta tags | ✅ | Title, description, keywords |
| Open Graph | ✅ | Full OG tags for social sharing |
| Twitter Cards | ✅ | Summary large image cards |
| Structured Data | ✅ | Organization, WebSite, FAQPage, Article, BreadcrumbList, HowTo, ItemList |
| Sitemap | ✅ | Dynamic generation via `sitemap.ts` |
| robots.txt | ✅ | Proper crawl directives |
| Canonical URLs | ✅ | Trailing slashes enabled |
| Dynamic Keywords | ✅ | Content-based keyword generation |
| Reading Time | ✅ | Calculated from content |
| Preconnect Hints | ✅ | Google Analytics domains |
| Lazy Loading | ✅ | Images in markdown content |
| Search/Filter | ✅ | Client-side doc filtering |

### SEO Utilities

The `src/lib/seo.ts` file provides utilities:

```typescript
// Get page-specific OG image path
getOgImagePath(slug: string): string

// Generate UTM-tagged URLs for campaign tracking
generateUtmUrl(baseUrl: string, path: string, params: {...}): string

// Get social sharing URLs for all platforms
getSocialShareUrls(pageUrl: string, title: string, description?: string): {...}

// Calculate reading time
calculateReadingTime(content: string): number

// Format reading time for display
formatReadingTime(minutes: number): string

// Optimize meta descriptions (150-160 chars)
optimizeMetaDescription(text: string): string

// Generate dynamic keywords
generateKeywords(title: string, category: string, content: string): string[]

// Extract wallet names for structured data
extractWalletNames(content: string): string[]

// Generate OG image URL (extensible for dynamic generation)
getOgImageUrl(title: string, category: string, baseUrl: string): string
```

## Social Sharing & Ads

### Page-Specific OG Images

Each comparison page has custom-generated OG images for social sharing:

| Page | OG Image |
|------|----------|
| Software Wallets (table) | `/og-software-wallets-table.png` |
| Software Wallets (details) | `/og-software-wallets-details.png` |
| Hardware Wallets (table) | `/og-hardware-wallets-table.png` |
| Hardware Wallets (details) | `/og-hardware-wallets-details.png` |
| Crypto Cards (table) | `/og-crypto-cards-table.png` |
| Crypto Cards (details) | `/og-crypto-cards-details.png` |
| Explore | `/og-explore.png` |
| Default | `/og-image.png` |

OG images are automatically regenerated on build via `npm run prebuild`.

### Social Sharing Component

The `<SocialShare>` component is included on all document pages with:
- Twitter/X share button
- Facebook share button
- LinkedIn share button
- Email share button
- Copy link button

### Twitter Card Validation

After building, validate your Twitter Cards:

```bash
npm run validate-cards
```

Then test with the official validators:
- Twitter: https://cards-dev.twitter.com/validator
- Facebook: https://developers.facebook.com/tools/debug/
- LinkedIn: https://www.linkedin.com/post-inspector/

### Creating Twitter/X Ads with Rich Previews

The OG images are automatically generated to show compelling data tables when shared on Twitter/X.

#### Generate OG Images

```bash
# Regenerate all OG images (runs automatically on build)
npm run generate-og

# Force regenerate the default image too
npm run generate-og -- --force
```

#### Validate Before Posting

```bash
# Check all pages have valid Twitter Cards
npm run validate-cards
```

Then test with official validators:
- **Twitter**: https://cards-dev.twitter.com/validator
- **Facebook**: https://developers.facebook.com/tools/debug/
- **LinkedIn**: https://www.linkedin.com/post-inspector/

#### UTM Parameters for Campaign Tracking

Use the `generateUtmUrl()` utility or add parameters manually:

```
https://walletradar.org/docs/software-wallets/?utm_source=twitter&utm_medium=social&utm_campaign=software_dec2025
```

---

## Tweet Templates

Ready-to-use templates for promoting Wallet Radar:

### Software Wallets
```
Stop gambling on wallet updates breaking your dApp tests.

We've tracked GitHub activity, release frequency, and security audits to find the most STABLE MetaMask alternatives.

Rabby scored highest (92/100).

Full comparison → walletradar.org/docs/software-wallets/

#DeFi #Web3 #crypto
```

### Hardware Wallets
```
Looking for a Ledger alternative after the Recover controversy?

We've scored hardware wallets on:
🔐 Security architecture
🔓 Open source firmware
📊 Development activity
💰 Value for money

Top pick: Trezor Safe 5 (94/100)

walletradar.org/docs/hardware-wallets/
```

### Crypto Cards
```
Tired of searching for the best crypto card?

We compared crypto debit & credit cards:
💳 Cashback rates (up to 10%)
🌍 Availability (US/EU/Global)
💰 Fees & requirements

walletradar.org/docs/crypto-cards/
```

### General Promotion
```
📡 Wallet Radar

Developer-focused crypto wallet research:
• software wallets compared
• hardware wallets reviewed
• crypto cards analyzed

Free. Open source. No affiliate links (currently).

walletradar.org
```

### Best Posting Times (Crypto Twitter)

| Day | Best Times (EST) |
|-----|-----------------|
| Monday-Thursday | 9am, 12pm, 5pm |
| Friday | 9am, 12pm |
| Weekend | 11am, 4pm |

### Hashtags

**Primary**: #DeFi #Web3 #crypto #Ethereum

**Secondary**: #MetaMask #CryptoWallet #blockchain

---

## Future SEO Enhancements

For server deployments (non-static export), you can enable:

1. **Dynamic OG Images**: Use `@vercel/og` in an API route
2. **Server-Side Search**: Add a real search endpoint for SearchAction schema
3. **Incremental Static Regeneration**: For more frequent content updates

## License

MIT
