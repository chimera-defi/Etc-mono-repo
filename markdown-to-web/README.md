# Markdown to Web

A monorepo containing a reusable Markdown-to-Website library and example implementations.

## Structure

```
markdown-to-web/
├── packages/
│   ├── markdown-web/      # Reusable library
│   │   ├── src/
│   │   │   ├── components/  # Vue components
│   │   │   ├── composables/ # Vue composables
│   │   │   ├── utils/       # Utility functions
│   │   │   └── styles/      # CSS styles
│   │   └── package.json
│   │
│   └── wallet-rankings/   # Example app using the library
│       ├── src/
│       │   └── content/     # Markdown content
│       └── package.json
│
└── package.json           # Workspace root
```

## Quick Start

```bash
# Install all dependencies
npm install

# Run the wallet-rankings app in development
npm run dev

# Build for production
npm run build

# Preview the build
npm run preview
```

## Using markdown-web in Your Own Project

1. Install the library:
```bash
npm install markdown-web
# or copy the package to your workspace
```

2. Import components and utilities:
```javascript
import { 
  MarkdownContent,
  HomePage,
  ContentPage,
  useContent,
  parseMarkdown 
} from 'markdown-web';
```

3. Add your content in `src/content/*.md` with frontmatter.

See `packages/wallet-rankings/` for a complete example.

## Credits

Extracted from [SharedStake UI](https://github.com/SharedStake/SharedStake-ui).
