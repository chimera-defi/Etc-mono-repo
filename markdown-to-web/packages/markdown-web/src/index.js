// Main entry point for markdown-web library
// Components
export { default as MarkdownContent } from './components/MarkdownContent.vue';
export { default as ContentCard } from './components/ContentCard.vue';
export { default as ContentStyles } from './components/ContentStyles.vue';
export { default as Breadcrumb } from './components/Breadcrumb.vue';

// Composables
export { useContent, createContentLoader } from './composables/useContent.js';
export { useStructuredData } from './composables/useStructuredData.js';

// Utilities
export { parseMarkdown, marked } from './utils/markdown.js';
export { 
  formatDate, 
  formatTag, 
  parseFrontmatter, 
  generateBreadcrumbItems,
  generateTwitterShareUrl,
  findRelatedContent,
  extractSection 
} from './utils/contentUtils.js';

// Re-export for convenience
export * from './components/index.js';
export * from './composables/index.js';
export * from './utils/index.js';
