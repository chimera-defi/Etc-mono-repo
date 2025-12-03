# markdown-web

A reusable Vue 3 library for converting Markdown files into beautiful, styled web content.

## Installation

```bash
npm install markdown-web
```

## Usage

### Basic Markdown Rendering

```vue
<template>
  <MarkdownContent :markdown="markdownText" />
</template>

<script>
import { MarkdownContent } from 'markdown-web';

export default {
  components: { MarkdownContent },
  data() {
    return {
      markdownText: '# Hello World\n\nThis is **bold** text.'
    };
  }
};
</script>
```

### Content Management with Frontmatter

```javascript
// src/content/loader.js
import { createContentLoader } from 'markdown-web';

// Use Vite's glob import to load markdown files
const modules = import.meta.glob('./content/**/*.md', { 
  eager: true, 
  query: '?raw',
  import: 'default'
});

export const contentLoader = createContentLoader(modules);
```

```vue
<script>
import { useContent } from 'markdown-web';
import { contentLoader } from './content/loader.js';

export default {
  setup() {
    const content = useContent(contentLoader);
    return { ...content };
  }
};
</script>
```

### Available Components

| Component | Description |
|-----------|-------------|
| `MarkdownContent` | Renders markdown or pre-parsed HTML |
| `ContentCard` | Card component for content listings |
| `ContentStyles` | Provides CSS styles for markdown |
| `Breadcrumb` | Breadcrumb navigation |

### Composables

| Composable | Description |
|------------|-------------|
| `useContent` | Content management utilities |
| `useStructuredData` | SEO structured data (JSON-LD) |
| `createContentLoader` | Parse markdown files with frontmatter |

### Utilities

| Function | Description |
|----------|-------------|
| `parseMarkdown` | Convert markdown to styled HTML |
| `parseFrontmatter` | Extract frontmatter from markdown |
| `formatDate` | Format date strings |
| `formatTag` | Format tag strings |

## Frontmatter Format

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
  keywords: "seo, keywords"
---

# Content starts here
```

## Styling

The library uses CSS variables for theming. Override in your app:

```css
:root {
  --md-color-primary: #10b981;
  --md-color-primary-light: #34d399;
  --md-color-bg: #111827;
  --md-color-surface: #1f2937;
  --md-color-text: #f3f4f6;
  --md-color-text-muted: #9ca3af;
  --md-color-border: #374151;
}
```

## License

MIT
