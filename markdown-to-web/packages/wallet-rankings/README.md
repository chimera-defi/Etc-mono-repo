# Wallet Rankings

A crypto wallet comparison website built with [markdown-web](../markdown-web/).

## Features

- 📊 Comparison of 19 EVM-compatible wallets
- 📈 GitHub activity status tracking
- 🎯 Use-case recommendations
- 📱 Responsive dark theme design

## Quick Start

From the workspace root:

```bash
# Install all dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

Or from this directory:

```bash
npm run dev
```

## Adding Content

1. Create markdown files in `src/content/` with frontmatter:

```markdown
---
id: "unique-id"
slug: "url-slug"
title: "Page Title"
excerpt: "Brief description"
author: "Author Name"
publishDate: "2025-01-01"
tags: ["tag1", "tag2"]
featured: true
meta:
  description: "SEO description"
---

# Content here
```

2. Content is automatically loaded and displayed.

## Project Structure

```
wallet-rankings/
├── src/
│   ├── assets/styles/   # Tailwind CSS
│   ├── content/         # Markdown content
│   ├── router/          # Vue Router
│   ├── views/           # Page components
│   ├── App.vue
│   ├── config.js        # Site configuration
│   └── main.js
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Configuration

Edit `src/config.js`:

```javascript
export const siteConfig = {
  title: 'Wallet Rankings',
  description: 'Your description',
  about: 'About text',
  // ... more options
};
```

## Data Sources

- GitHub REST API for repository activity
- WalletBeat for RPC and ENS data
- Wallet documentation and registries
