// Composable for managing structured data (JSON-LD)
import { extractSection } from '../utils/contentUtils.js';

// Schema generators
const createOrganization = (name = 'Markdown to Web', url = '', logoUrl = '') => ({
  "@type": "Organization",
  "name": name,
  "logo": logoUrl ? {
    "@type": "ImageObject",
    "url": logoUrl,
    "width": 200,
    "height": 60
  } : undefined,
  "url": url
});

const parseFAQQuestions = (faqContent) => {
  const questions = [];
  const lines = faqContent.split('\n');
  let currentQuestion = null;
  let currentAnswer = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^#{2,3}\s+(.+)/)) {
      if (currentQuestion && currentAnswer.length > 0) {
        questions.push({
          "@type": "Question",
          "name": currentQuestion,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": currentAnswer.join(' ').trim()
          }
        });
      }
      
      currentQuestion = trimmedLine.replace(/^#{2,3}\s+/, '').replace(/\?$/, '');
      currentAnswer = [];
    } else if (currentQuestion && trimmedLine && !trimmedLine.startsWith('#')) {
      currentAnswer.push(trimmedLine);
    }
  }
  
  if (currentQuestion && currentAnswer.length > 0) {
    questions.push({
      "@type": "Question",
      "name": currentQuestion,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": currentAnswer.join(' ').trim()
      }
    });
  }
  
  return questions;
};

export function useStructuredData(config = {}) {
  const { 
    organizationName = 'Markdown to Web',
    siteUrl = '',
    logoUrl = ''
  } = config;
  
  const schemaCache = new Map();
  
  const generateArticleSchema = (page, currentUrl) => {
    if (!page) return null;
    
    const wordCount = page.rawContent ? page.rawContent.split(/\s+/).length : 0;
    
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": page.title,
      "description": page.meta?.description || page.excerpt,
      "image": page.featuredImage || undefined,
      "author": {
        "@type": "Organization",
        "name": page.author || organizationName,
        "url": siteUrl
      },
      "publisher": createOrganization(organizationName, siteUrl, logoUrl),
      "datePublished": page.publishDate,
      "dateModified": page.modifiedDate || page.publishDate,
      "mainEntityOfPage": { "@type": "WebPage", "@id": currentUrl },
      "keywords": page.meta?.keywords || page.tags?.join(', '),
      "wordCount": wordCount,
      "inLanguage": "en-US",
      "url": currentUrl
    };
  };
  
  const generateFAQSchema = (faqContent) => {
    if (!faqContent) return null;
    
    const questions = parseFAQQuestions(faqContent);
    if (questions.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions
    };
  };
  
  const generateBreadcrumbSchema = (breadcrumbs, baseUrl = '') => {
    if (!breadcrumbs?.length) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `${baseUrl}${crumb.url}`
      }))
    };
  };
  
  const injectSchema = (schema, id) => {
    if (!schema) return;
    
    removeSchema(id);
    schemaCache.set(id, schema);
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  };
  
  const removeSchema = (id) => {
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
      schemaCache.delete(id);
    }
  };
  
  const injectPageSchemas = (page, currentUrl) => {
    if (!page) return;
    
    const articleSchema = generateArticleSchema(page, currentUrl);
    if (articleSchema) injectSchema(articleSchema, 'article-schema');
    
    const faqContent = extractSection(page.rawContent, '^##\\s+.*[Ff][Aa][Qq].*$');
    if (faqContent) {
      const faqSchema = generateFAQSchema(faqContent);
      if (faqSchema) injectSchema(faqSchema, 'faq-schema');
    }
  };
  
  const cleanupPageSchemas = () => {
    removeSchema('article-schema');
    removeSchema('faq-schema');
  };
  
  return {
    generateArticleSchema,
    generateFAQSchema,
    generateBreadcrumbSchema,
    injectSchema,
    removeSchema,
    injectPageSchemas,
    cleanupPageSchemas
  };
}
