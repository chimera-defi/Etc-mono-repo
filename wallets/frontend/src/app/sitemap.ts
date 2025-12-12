import { MetadataRoute } from 'next';
import { getAllDocuments } from '@/lib/markdown';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const documents = getAllDocuments();
  
  // Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Add all document pages
  documents.forEach((doc) => {
    // Parse date safely - handle invalid dates
    let lastModified = new Date();
    if (doc.lastUpdated) {
      try {
        const parsedDate = new Date(doc.lastUpdated);
        if (!isNaN(parsedDate.getTime())) {
          lastModified = parsedDate;
        }
      } catch {
        // Keep default date if parsing fails
      }
    }
    
    routes.push({
      url: `${baseUrl}/docs/${doc.slug}/`,
      lastModified: lastModified,
      changeFrequency: doc.category === 'comparison' ? 'weekly' : 'monthly',
      priority: doc.category === 'comparison' ? 0.9 : 0.7,
    });
  });

  return routes;
}
