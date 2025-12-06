// Content loader for wallet-rankings
import { createContentLoader } from 'markdown-web';

// Use Vite's import.meta.glob to dynamically load all markdown files
const modules = import.meta.glob('./**/*.md', { 
  eager: true, 
  query: '?raw',
  import: 'default'
});

// Create and export the content loader
export const contentLoader = createContentLoader(modules);
