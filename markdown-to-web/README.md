# Markdown to Web

A Vue 3 + Vite static site generator that converts Markdown files into beautiful, responsive websites. Extracted from [SharedStake UI](https://github.com/SharedStake/SharedStake-ui).

## Features

- 📝 **Markdown to HTML** - GitHub-flavored markdown with custom styling
- 🎨 **Beautiful Tables** - Optimized for data-heavy comparison content
- 🔍 **SEO Ready** - Structured data, Open Graph, and meta tags
- 📱 **Responsive** - Mobile-first design with Tailwind CSS
- ⚡ **Fast** - Vite-powered development and optimized builds
- 🏷️ **Tag Filtering** - Filter content by tags
- 🔗 **Related Content** - Automatic related content suggestions

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Content

1. Create a Markdown file in `src/content/`:

```markdown
---
id: "my-article"
slug: "my-article"
title: "My Article Title"
excerpt: "Brief description of the article"
author: "Your Name"
publishDate: "2025-01-01"
tags: ["tag1", "tag2"]
featured: false
meta:
  description: "SEO description"
  keywords: "keyword1, keyword2"
---

# My Article

Content goes here...
```

2. The content will automatically appear on the homepage and be accessible at `/my-article`.

## Configuration

Edit `src/config.js` to customize:

```javascript
export const siteConfig = {
  title: 'Your Site Title',
  description: 'Your site description',
  about: 'About section text',
  organizationName: 'Your Organization',
  siteUrl: 'https://yoursite.com',
  logoUrl: '/logo.png',
  twitter: '@yourhandle',
  github: 'https://github.com/your/repo'
};
```

## Project Structure

```
markdown-to-web/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css          # Tailwind CSS + custom styles
│   ├── components/
│   │   ├── Blog/
│   │   │   ├── ContentCard.vue   # Content card component
│   │   │   ├── ContentPage.vue   # Individual page view
│   │   │   ├── ContentStyles.vue # Markdown styling
│   │   │   └── HomePage.vue      # Homepage listing
│   │   └── Common/
│   │       └── Breadcrumb.vue    # Breadcrumb navigation
│   ├── composables/
│   │   ├── useContent.js         # Content management
│   │   └── useStructuredData.js  # SEO structured data
│   ├── content/                  # Your markdown files
│   │   └── *.md
│   ├── data/
│   │   └── index.js              # Content loader
│   ├── router/
│   │   └── index.js              # Vue Router config
│   ├── utils/
│   │   ├── contentUtils.js       # Utility functions
│   │   └── markdown.js           # Markdown parser
│   ├── App.vue                   # Root component
│   ├── config.js                 # Site configuration
│   └── main.js                   # App entry point
├── public/                       # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier |
| `slug` | Yes | URL slug |
| `title` | Yes | Page title |
| `excerpt` | Yes | Brief description |
| `author` | Yes | Author name |
| `publishDate` | Yes | ISO date string |
| `tags` | No | Array of tags |
| `featured` | No | Show in featured section |
| `meta.description` | No | SEO description |
| `meta.keywords` | No | SEO keywords |

## Customization

### Styling

The markdown content uses `md-*` CSS classes defined in `ContentStyles.vue`. Customize colors by editing the CSS variables in `main.css` or the Tailwind classes in the components.

### Theme Colors

Default theme uses emerald/cyan gradients. Change in:
- `tailwind.config.js` - brand colors
- `main.css` - CSS variables
- Component files - gradient classes

## Credits

Extracted and adapted from [SharedStake UI](https://github.com/SharedStake/SharedStake-ui) blog system.

## License

MIT
