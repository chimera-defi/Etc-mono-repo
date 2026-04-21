import { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: [
      `${brand.baseUrl}/sitemap.xml`,
      `${brand.baseUrl}/merchant-center.xml`,
    ],
    host: brand.baseUrl,
  };
}
