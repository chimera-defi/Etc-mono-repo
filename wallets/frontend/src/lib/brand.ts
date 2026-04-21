interface BrandPreset {
  displayName: string;
  shortName: string;
  baseUrl: string;
  defaultDescription: string;
  githubUrl: string;
  issuesUrl: string;
  twitterUrl: string;
  twitterHandle: string;
  contactEmail: string;
  utmSource: string;
}

const BRAND_PRESETS: Record<string, BrandPreset> = {
  walletradar: {
    displayName: 'Wallet Radar',
    shortName: 'Wallet Radar',
    baseUrl: 'https://walletradar.org',
    defaultDescription:
      'Independent research and comparison of crypto wallets, hardware wallets, and payment solutions. Scoring, security audits, GitHub activity analysis, and developer experience benchmarks.',
    githubUrl: 'https://github.com/chimera-defi/Etc-mono-repo/tree/main/wallets',
    issuesUrl: 'https://github.com/chimera-defi/Etc-mono-repo/issues',
    twitterUrl: 'https://x.com/chimeradefi',
    twitterHandle: '@chimeradefi',
    contactEmail: 'chimera_deFi@protonmail.com',
    utmSource: 'walletradar',
  },
};

const DEFAULT_PRESET = 'walletradar';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'brand';
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
}

function getPreset(): BrandPreset {
  const presetId = (process.env.NEXT_PUBLIC_BRAND_PROFILE || DEFAULT_PRESET).toLowerCase();
  return BRAND_PRESETS[presetId] || BRAND_PRESETS[DEFAULT_PRESET];
}

export interface BrandProfile {
  profileId: string;
  displayName: string;
  shortName: string;
  baseUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  githubUrl: string;
  issuesUrl: string;
  twitterUrl: string;
  twitterHandle: string;
  contactEmail: string;
  utmSource: string;
  ogImageVersion: string;
}

function resolveBrand(): BrandProfile {
  const preset = getPreset();
  const displayName = process.env.NEXT_PUBLIC_BRAND_NAME || preset.displayName;
  const shortName = process.env.NEXT_PUBLIC_BRAND_SHORT_NAME || preset.shortName || displayName;
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || preset.baseUrl);

  return {
    profileId: (process.env.NEXT_PUBLIC_BRAND_PROFILE || DEFAULT_PRESET).toLowerCase(),
    displayName,
    shortName,
    baseUrl,
    defaultTitle:
      process.env.NEXT_PUBLIC_DEFAULT_TITLE ||
      `${displayName} - Developer-Focused Crypto Wallet Research`,
    defaultDescription:
      process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION || preset.defaultDescription,
    githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || preset.githubUrl,
    issuesUrl: process.env.NEXT_PUBLIC_ISSUES_URL || preset.issuesUrl,
    twitterUrl: process.env.NEXT_PUBLIC_TWITTER_URL || preset.twitterUrl,
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || preset.twitterHandle,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || preset.contactEmail,
    utmSource:
      process.env.NEXT_PUBLIC_UTM_SOURCE ||
      preset.utmSource ||
      slugify(displayName),
    ogImageVersion: process.env.NEXT_PUBLIC_OG_IMAGE_VERSION || 'v5',
  };
}

export const brand = resolveBrand();

export function withBrand(title: string): string {
  return `${title} | ${brand.displayName}`;
}

export function aboutBrandLabel(): string {
  return `About ${brand.displayName}`;
}

export function appendUtm(url: string, medium = 'comparison'): string {
  if (!brand.utmSource || url.startsWith('mailto:')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.get('utm_source')) {
      parsed.searchParams.set('utm_source', brand.utmSource);
    }
    if (medium && !parsed.searchParams.get('utm_medium')) {
      parsed.searchParams.set('utm_medium', medium);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function brandFaqQuestion(questionBody: string): string {
  return questionBody.replace(/Wallet Radar/g, brand.displayName);
}

export function brandFaqAnswer(answer: string): string {
  return answer.replace(/Wallet Radar/g, brand.displayName);
}
