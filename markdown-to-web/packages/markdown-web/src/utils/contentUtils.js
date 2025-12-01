// Content utilities for markdown-web

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format tag string to readable format
 * @param {string} tag - Tag string (e.g., "liquid-staking")
 * @returns {string} Formatted tag (e.g., "Liquid Staking")
 */
export const formatTag = (tag) => {
  if (!tag) return '';
  return tag.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Generate breadcrumb items
 * @param {Object} page - Page object (optional)
 * @param {string} basePath - Base path for breadcrumbs
 * @param {string} baseName - Base name for breadcrumbs
 * @returns {Array} Breadcrumb items
 */
export const generateBreadcrumbItems = (page = null, basePath = '/', baseName = 'Home') => {
  const baseItems = [
    { name: baseName, url: basePath }
  ];
  
  if (page) {
    baseItems.push({
      name: page.title,
      url: `${basePath}${page.slug}`
    });
  }
  
  return baseItems;
};

/**
 * Generate Twitter share URL
 * @param {string} title - Page title
 * @param {string} url - Page URL
 * @returns {string} Twitter share URL
 */
export const generateTwitterShareUrl = (title, url) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);
  return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
};

/**
 * Find related content based on shared tags
 * @param {Object} currentContent - Current content item
 * @param {Array} allContent - All content items
 * @param {number} limit - Maximum number of related items
 * @returns {Array} Related content items
 */
export const findRelatedContent = (currentContent, allContent, limit = 3) => {
  if (!currentContent || !currentContent.tags) return [];
  
  const currentTags = currentContent.tags;
  return allContent
    .filter(item => item.id !== currentContent.id)
    .filter(item => item.tags && item.tags.some(tag => currentTags.includes(tag)))
    .slice(0, limit);
};

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Raw markdown with frontmatter
 * @returns {Object} { frontmatter, content, contentStart }
 */
export const parseFrontmatter = (content) => {
  const lines = content.split('\n');
  const frontmatter = {};
  let contentStart = 0;
  
  if (lines[0] === '---') {
    let inMeta = false;
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        contentStart = i + 1;
        break;
      }
      
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine === 'meta:') {
        inMeta = true;
        frontmatter.meta = {};
        continue;
      }
      
      const indentLevel = line.search(/\S/);
      if (inMeta && indentLevel >= 2) {
        const [key, ...valueParts] = trimmedLine.split(':');
        if (key && valueParts.length > 0) {
          let value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          frontmatter.meta[key.trim()] = value;
        }
      } else {
        inMeta = false;
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          let value = valueParts.join(':').trim();
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
          } else if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          frontmatter[key.trim()] = value;
        }
      }
    }
  }
  
  const markdownContent = lines.slice(contentStart).join('\n');
  return { frontmatter, content: markdownContent, contentStart };
};

/**
 * Extract section content by heading
 * @param {string} rawContent - Raw markdown content
 * @param {string} headingPattern - Regex pattern to match heading
 * @returns {string|null} Section content or null if not found
 */
export const extractSection = (rawContent, headingPattern) => {
  if (!rawContent) return null;
  
  const lines = rawContent.split('\n');
  let sectionStart = -1;
  let sectionEnd = -1;
  
  const pattern = new RegExp(headingPattern, 'i');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(pattern)) {
      sectionStart = i;
    } else if (sectionStart !== -1 && line.match(/^##\s+/)) {
      sectionEnd = i;
      break;
    }
  }
  
  if (sectionStart === -1) return null;
  
  const sectionLines = sectionEnd === -1 ? lines.slice(sectionStart) : lines.slice(sectionStart, sectionEnd);
  return sectionLines.join('\n');
};
