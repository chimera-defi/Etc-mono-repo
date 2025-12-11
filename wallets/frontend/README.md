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
| `WALLET_COMPARISON_UNIFIED.md` | `/docs/wallet-comparison-unified` |
| `HARDWARE_WALLET_COMPARISON.md` | `/docs/hardware-wallet-comparison` |
| `CONTRIBUTING.md` | `/docs/contributing` |

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
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |

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

## License

MIT
