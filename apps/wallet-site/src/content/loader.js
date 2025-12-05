/**
 * Content loader for wallet-site
 * 
 * This loader reads markdown files from the /wallets folder at the project root
 * and adds frontmatter programmatically since the source files don't have it.
 * 
 * This demonstrates how to use markdown-web with external content sources.
 */
import { parseMarkdown, parseFrontmatter } from 'markdown-web';

// Use Vite's import.meta.glob to load markdown files from the wallets folder
// The path is relative to this file's location
const modules = import.meta.glob('../../../wallets/*.md', { 
  eager: true, 
  query: '?raw',
  import: 'default'
});

/**
 * Generate metadata from filename and content
 * Since the source markdown files don't have frontmatter, we generate it
 */
function generateMetadata(path, content) {
  // Extract filename without extension
  const filename = path.split('/').pop().replace('.md', '');
  
  // Create a slug from the filename
  const slug = filename.toLowerCase().replace(/_/g, '-');
  
  // Extract title from first h1 or generate from filename
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch 
    ? titleMatch[1] 
    : filename.replace(/_/g, ' ').replace(/-/g, ' ');
  
  // Extract first paragraph as excerpt
  const paragraphMatch = content.match(/^(?!#|\||\>|\-|\*|\d\.)[A-Za-z].+$/m);
  const excerpt = paragraphMatch 
    ? paragraphMatch[0].substring(0, 200) + (paragraphMatch[0].length > 200 ? '...' : '')
    : `Content from ${filename}`;
  
  // Determine tags based on content
  const tags = [];
  if (content.toLowerCase().includes('wallet')) tags.push('wallets');
  if (content.toLowerCase().includes('evm') || content.toLowerCase().includes('ethereum')) tags.push('ethereum');
  if (content.toLowerCase().includes('comparison') || content.toLowerCase().includes('compare')) tags.push('comparison');
  if (content.toLowerCase().includes('developer')) tags.push('development');
  if (tags.length === 0) tags.push('documentation');
  
  // Determine if featured (main comparison doc)
  const featured = filename.includes('COMPARISON') || filename.includes('UNIFIED');
  
  return {
    id: slug,
    slug: slug,
    title: title,
    excerpt: excerpt,
    author: 'Wallet Research Team',
    publishDate: new Date().toISOString().split('T')[0],
    tags: tags,
    featured: featured,
    meta: {
      description: excerpt,
      keywords: tags.join(', ')
    }
  };
}

/**
 * Create a content loader from the wallet markdown files
 * This is compatible with markdown-web's useContent composable
 */
export function createWalletContentLoader() {
  // Load and process content pages
  const loadedPages = Object.entries(modules)
    .map(([path, rawContent]) => {
      if (!path.endsWith('.md')) return null;
      
      // Skip PR_INFO.md as it's not user-facing content
      if (path.includes('PR_INFO')) return null;
      
      const content = typeof rawContent === 'string' ? rawContent : '';
      
      // Check if content has frontmatter
      const { frontmatter, content: markdownContent } = parseFrontmatter(content);
      
      // If no frontmatter was found, generate metadata
      const metadata = Object.keys(frontmatter).length > 0 
        ? frontmatter 
        : generateMetadata(path, content);
      
      // Parse the markdown content
      const parsedContent = parseMarkdown(markdownContent || content);
      
      return {
        ...metadata,
        content: parsedContent,
        rawContent: markdownContent || content,
        sourcePath: path
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Featured items first, then by date
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
    });

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

// Create and export the content loader instance
export const contentLoader = createWalletContentLoader();
