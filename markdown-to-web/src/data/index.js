// Content data loader for markdown-to-web
import { parseMarkdown } from '@/utils/markdown.js';
import { parseFrontmatter } from '@/utils/contentUtils.js';

// Use Vite's import.meta.glob to dynamically load all markdown files
// Content files should be in src/content/
const contentModules = import.meta.glob('/src/content/**/*.md', { 
  eager: true, 
  query: '?raw',
  import: 'default'
});

// Load and process content pages
const loadedPages = Object.entries(contentModules)
  .map(([path, content]) => {
    // Skip non-markdown files
    if (!path.endsWith('.md')) {
      return null;
    }
    
    // Process markdown content
    if (typeof content === 'string') {
      const { frontmatter, content: markdownContent } = parseFrontmatter(content);
      
      return {
        ...frontmatter,
        content: parseMarkdown(markdownContent),
        rawContent: markdownContent
      };
    }
    
    return null;
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));

// Export content data and utilities
export const contentPages = loadedPages;

export const getPageBySlug = (slug) => 
  contentPages.find(page => page.slug === slug);

export const getFeaturedPages = () => 
  contentPages.filter(page => page.featured);

export const getPagesByTag = (tag) => 
  contentPages.filter(page => page.tags?.includes(tag));

export const getAllTags = () => {
  const tags = new Set();
  contentPages.forEach(page => {
    (page.tags || []).forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
};
