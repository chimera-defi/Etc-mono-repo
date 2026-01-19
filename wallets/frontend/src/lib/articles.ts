import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Path to articles markdown files (wallets/articles directory)
const ARTICLES_DIR = path.join(process.cwd(), '..', 'articles');

export interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: 'comparison' | 'guide' | 'tutorial' | 'news';
  lastUpdated: string;
  author: string;
  wallets?: string[];
  tags?: string[];
}

/**
 * Get all article slugs from the articles directory
 */
export function getArticleSlugs(): string[] {
  try {
    if (!fs.existsSync(ARTICLES_DIR)) {
      return [];
    }

    const files = fs.readdirSync(ARTICLES_DIR);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading articles directory:', error);
    return [];
  }
}

/**
 * Get article by slug from articles directory
 */
export function getArticleBySlug(slug: string): Article | null {
  try {
    const filePath = path.join(ARTICLES_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      content,
      category: data.category || 'guide',
      lastUpdated: data.lastUpdated || new Date().toISOString().split('T')[0],
      author: data.author || 'Wallet Radar',
      wallets: data.wallets || [],
      tags: data.tags || [],
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

/**
 * Get all articles sorted by last updated date (newest first)
 */
export function getAllArticles(): Article[] {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map(slug => getArticleBySlug(slug))
    .filter((article): article is Article => article !== null);

  // Sort by lastUpdated date (newest first)
  return articles.sort((a, b) => {
    const dateA = new Date(a.lastUpdated).getTime();
    const dateB = new Date(b.lastUpdated).getTime();
    return dateB - dateA;
  });
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: Article['category']): Article[] {
  return getAllArticles().filter(article => article.category === category);
}

/**
 * Get related articles based on shared wallets or tags
 */
export function getRelatedArticles(currentSlug: string, limit = 3): Article[] {
  const currentArticle = getArticleBySlug(currentSlug);
  if (!currentArticle) return [];

  const allArticles = getAllArticles().filter(article => article.slug !== currentSlug);

  // Score articles by relevance
  const scored = allArticles.map(article => {
    let score = 0;

    // Same category = +10 points
    if (article.category === currentArticle.category) {
      score += 10;
    }

    // Shared wallets = +5 points per wallet
    if (currentArticle.wallets && article.wallets) {
      const sharedWallets = currentArticle.wallets.filter(wallet =>
        article.wallets?.includes(wallet)
      );
      score += sharedWallets.length * 5;
    }

    // Shared tags = +2 points per tag
    if (currentArticle.tags && article.tags) {
      const sharedTags = currentArticle.tags.filter(tag =>
        article.tags?.includes(tag)
      );
      score += sharedTags.length * 2;
    }

    return { article, score };
  });

  // Sort by score (descending) and return top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.article);
}
