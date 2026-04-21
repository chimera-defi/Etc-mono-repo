#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_DIR = process.cwd();
const DEFAULT_CONFIG = 'brand-exports.json';

function normalizeBaseUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) throw new Error('baseUrl is required');
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
}

function loadProfiles() {
  const argPath = process.argv[2] || DEFAULT_CONFIG;
  const configPath = path.resolve(APP_DIR, argPath);

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Missing brand export config: ${configPath}\n` +
      'Create one from brand-exports.example.json.'
    );
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Brand export config must be a non-empty JSON array.');
  }

  return parsed.map((item, index) => {
    const id = String(item.id || '').trim();
    const displayName = String(item.displayName || '').trim();
    if (!id || !displayName) {
      throw new Error(`Invalid profile at index ${index}: id and displayName are required.`);
    }

    return {
      id,
      profile: String(item.profile || item.id).trim(),
      displayName,
      shortName: String(item.shortName || item.displayName).trim(),
      baseUrl: normalizeBaseUrl(item.baseUrl),
      utmSource: String(item.utmSource || item.id).trim(),
      defaultTitle: item.defaultTitle ? String(item.defaultTitle) : '',
      defaultDescription: item.defaultDescription ? String(item.defaultDescription) : '',
      githubUrl: item.githubUrl ? String(item.githubUrl) : '',
      issuesUrl: item.issuesUrl ? String(item.issuesUrl) : '',
      twitterUrl: item.twitterUrl ? String(item.twitterUrl) : '',
      twitterHandle: item.twitterHandle ? String(item.twitterHandle) : '',
      contactEmail: item.contactEmail ? String(item.contactEmail) : '',
    };
  });
}

function replaceAll(content, replacements) {
  return replacements.reduce((next, [from, to]) => next.split(from).join(to), content);
}

function patchStaticAssets(outDir, profile) {
  const host = new URL(profile.baseUrl).host;
  const replacements = [
    ['Wallet Radar', profile.displayName],
    ['walletradar.org', host],
    ['https://walletradar.org', profile.baseUrl],
  ];

  const patchTargets = [
    'llms.txt',
    'merchant-center.xml',
    'manifest.json',
  ];

  for (const relativePath of patchTargets) {
    const fullPath = path.join(outDir, relativePath);
    if (!fs.existsSync(fullPath)) continue;

    const raw = fs.readFileSync(fullPath, 'utf8');
    const next = replaceAll(raw, replacements);
    fs.writeFileSync(fullPath, next, 'utf8');
  }
}

function buildProfile(profile) {
  const env = {
    ...process.env,
    NEXT_PUBLIC_BRAND_PROFILE: profile.profile,
    NEXT_PUBLIC_BRAND_NAME: profile.displayName,
    NEXT_PUBLIC_BRAND_SHORT_NAME: profile.shortName,
    NEXT_PUBLIC_BASE_URL: profile.baseUrl,
    NEXT_PUBLIC_UTM_SOURCE: profile.utmSource,
  };

  if (profile.defaultTitle) env.NEXT_PUBLIC_DEFAULT_TITLE = profile.defaultTitle;
  if (profile.defaultDescription) env.NEXT_PUBLIC_DEFAULT_DESCRIPTION = profile.defaultDescription;
  if (profile.githubUrl) env.NEXT_PUBLIC_GITHUB_URL = profile.githubUrl;
  if (profile.issuesUrl) env.NEXT_PUBLIC_ISSUES_URL = profile.issuesUrl;
  if (profile.twitterUrl) env.NEXT_PUBLIC_TWITTER_URL = profile.twitterUrl;
  if (profile.twitterHandle) env.NEXT_PUBLIC_TWITTER_HANDLE = profile.twitterHandle;
  if (profile.contactEmail) env.NEXT_PUBLIC_CONTACT_EMAIL = profile.contactEmail;

  console.log(`\n=== Building brand: ${profile.id} (${profile.displayName}) ===`);
  execSync('npm run build', {
    cwd: APP_DIR,
    stdio: 'inherit',
    env,
  });

  const outDir = path.join(APP_DIR, 'out');
  if (!fs.existsSync(outDir)) {
    throw new Error('Expected out/ after build, but it does not exist.');
  }

  patchStaticAssets(outDir, profile);

  const targetRoot = path.join(APP_DIR, 'out-brands');
  const targetDir = path.join(targetRoot, profile.id);

  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetRoot, { recursive: true });
  fs.cpSync(outDir, targetDir, { recursive: true });

  console.log(`Exported: ${targetDir}`);
}

function main() {
  const profiles = loadProfiles();
  console.log(`Loaded ${profiles.length} brand profile(s).`);

  for (const profile of profiles) {
    buildProfile(profile);
  }

  console.log('\nDone. Multi-brand exports are in out-brands/<id>.');
}

main();
