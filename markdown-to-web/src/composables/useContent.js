// Content composable for managing markdown pages
import { contentPages, getPageBySlug } from '@/data/index.js';
import { formatDate, formatTag, generateBreadcrumbItems, findRelatedContent } from '@/utils/contentUtils.js';

export function useContent() {
  // Helper functions for content management
  const getAllTags = () => {
    const tags = new Set();
    contentPages.forEach(page => {
      (page.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };
  
  const getFeaturedPages = () => 
    contentPages.filter(page => page.featured);
  
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
  
  const getBreadcrumbItems = (page = null) => {
    return generateBreadcrumbItems(page, '/', 'Home');
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
    getFilteredPages,
    loadPage,
    getRelatedPages,
    getBreadcrumbItems,
    setPageMeta,
    formatDate,
    formatTag
  };
}
