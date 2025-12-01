// Content composable for managing markdown pages
import { formatDate, formatTag, generateBreadcrumbItems, findRelatedContent, parseFrontmatter } from '../utils/contentUtils.js';
import { parseMarkdown } from '../utils/markdown.js';

/**
 * Create a content loader from markdown modules
 * @param {Object} modules - Result of import.meta.glob for markdown files
 * @returns {Object} { contentPages, getPageBySlug, getFeaturedPages, getPagesByTag, getAllTags }
 */
export function createContentLoader(modules) {
  // Load and process content pages
  const loadedPages = Object.entries(modules)
    .map(([path, content]) => {
      if (!path.endsWith('.md')) return null;
      
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

  const getPageBySlug = (slug) => 
    loadedPages.find(page => page.slug === slug);

  const getFeaturedPages = () => 
    loadedPages.filter(page => page.featured);

  const getPagesByTag = (tag) => 
    loadedPages.filter(page => page.tags?.includes(tag));

  const getAllTags = () => {
    const tags = new Set();
    loadedPages.forEach(page => {
      (page.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  return {
    contentPages: loadedPages,
    getPageBySlug,
    getFeaturedPages,
    getPagesByTag,
    getAllTags
  };
}

/**
 * Vue composable for content management
 * @param {Object} contentLoader - Result of createContentLoader
 * @returns {Object} Content utilities for Vue components
 */
export function useContent(contentLoader) {
  const { contentPages, getPageBySlug, getFeaturedPages, getPagesByTag, getAllTags } = contentLoader;
  
  const getFilteredPages = (selectedTag) => {
    if (selectedTag) {
      return contentPages.filter(page => page.tags?.includes(selectedTag));
    }
    return contentPages;
  };
  
  const loadPage = (slug) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const page = getPageBySlug(slug);
        resolve(page);
      }, 100);
    });
  };
  
  const getRelatedPages = (currentPage, limit = 3) => {
    return findRelatedContent(currentPage, contentPages, limit);
  };
  
  const getBreadcrumbItems = (page = null, basePath = '/', baseName = 'Home') => {
    return generateBreadcrumbItems(page, basePath, baseName);
  };
  
  const setPageMeta = (title, description) => {
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || '');
    }
  };
  
  return {
    // Data
    contentPages,
    
    // Helper functions
    getAllTags,
    getFeaturedPages,
    getPagesByTag,
    getFilteredPages,
    loadPage,
    getRelatedPages,
    getBreadcrumbItems,
    setPageMeta,
    formatDate,
    formatTag
  };
}
