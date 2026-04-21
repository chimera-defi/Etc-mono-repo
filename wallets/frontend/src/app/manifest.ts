import { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.defaultTitle,
    short_name: brand.shortName,
    description: brand.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      {
        src: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: '192x192',
      },
      {
        src: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: '512x512',
      },
    ],
  };
}
