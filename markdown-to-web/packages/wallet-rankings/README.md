# Wallet Rankings

A crypto wallet comparison website built with the `markdown-web` library.

## Features

- Comprehensive comparison of 19 EVM-compatible wallets
- Data-driven analysis from GitHub API
- Transaction simulation, account abstraction, and chain support comparisons
- Beautiful, responsive design with Tailwind CSS

## Quick Start

```bash
# From the monorepo root
npm install
npm run dev

# Or from this directory
npm install
npm run dev
```

## Structure

```
wallet-rankings/
├── src/
│   ├── content/        # Markdown content files
│   ├── views/          # Vue page components
│   ├── router/         # Vue Router configuration
│   ├── assets/         # CSS styles
│   ├── App.vue         # Root component
│   ├── main.js         # Entry point
│   └── config.js       # Site configuration
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json
```

## Adding Content

1. Create a new `.md` file in `src/content/`
2. Add frontmatter at the top:

```markdown
---
id: "unique-id"
slug: "url-slug"
title: "Page Title"
excerpt: "Short description"
author: "Author Name"
publishDate: "2024-01-01"
tags: ["tag1", "tag2"]
featured: true
---

# Your content here
```

3. The page will be automatically available at `/{slug}`

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## License

MIT
