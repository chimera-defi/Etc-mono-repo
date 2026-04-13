/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export for AWS Amplify static hosting
  // This generates a fully static site in the 'out' directory
  output: 'export',

  // Enable trailing slashes for clean URLs
  trailingSlash: true,

  // Security headers are applied through the repo-root customHttp.yml because
  // this app is deployed as a static Amplify export.

  // Webpack configuration for node modules used at build time
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;
