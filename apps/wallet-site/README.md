# Wallet Site

A demonstration of using the `markdown-web` library to build a site that reads content from a separate location.

## Architecture

```
/workspace/
├── apps/
│   └── wallet-site/          # This app (consumer of markdown-web)
│       ├── src/
│       │   └── content/
│       │       └── loader.js # Reads from ../../wallets/
│       └── package.json      # References markdown-web via file:
│
├── markdown-to-web/
│   └── packages/
│       └── markdown-web/     # The reusable library
│
└── wallets/                  # Content source (markdown files)
    ├── WALLET_COMPARISON_UNIFIED.md
    ├── README.md
    └── ...
```

## Key Points

1. **Separate concerns**: The library (`markdown-web`), the app (`wallet-site`), and the content (`wallets/`) are all in different locations
2. **Local package reference**: Uses `"markdown-web": "file:../../markdown-to-web/packages/markdown-web"` to reference the local package
3. **External content**: The content loader reads from `../../wallets/` instead of having its own content copies
4. **Frontmatter injection**: Since the wallet markdown files don't have frontmatter, the loader adds it programmatically

## Quick Start

```bash
# Install dependencies (from this directory)
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How the Content Loader Works

The `src/content/loader.js` file:
1. Uses Vite's `import.meta.glob` to load markdown files from `../../wallets/`
2. Adds frontmatter metadata programmatically (since source files don't have it)
3. Exports a content loader compatible with `markdown-web`

This pattern allows you to:
- Keep content in a separate repository/folder
- Apply consistent styling without modifying source files
- Build multiple sites from the same content source

## Customization

To use this pattern for your own site:

1. Copy this `wallet-site` folder
2. Update `src/content/loader.js` to point to your content folder
3. Modify `src/config.js` with your site details
4. Customize styles in `src/assets/styles/main.css`
