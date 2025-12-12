#!/usr/bin/env node

/**
 * Convert SVG placeholder assets to production-ready PNG/ICO formats
 * Requires: npm install --save-dev sharp
 * For favicon.ico: requires ImageMagick (convert command) or use online tool
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');

// Conversion tasks: [source, target, width, height]
const conversions = [
  ['og-image.svg', 'og-image.png', 1200, 630],
  ['logo.svg', 'logo.png', 512, 512],
  ['logo.svg', 'logo-192.png', 192, 192],
  ['logo.svg', 'logo-512.png', 512, 512],
  ['favicon.svg', 'favicon-16.png', 16, 16],
  ['favicon.svg', 'favicon-32.png', 32, 32],
  ['favicon.svg', 'favicon-48.png', 48, 48],
  ['apple-touch-icon.svg', 'apple-touch-icon.png', 180, 180],
  ['icon-192.svg', 'icon-192.png', 192, 192],
  ['icon-512.svg', 'icon-512.png', 512, 512],
];

async function convertAssets() {
  console.log('Starting asset conversion...\n');

  for (const [source, target, width, height] of conversions) {
    const sourcePath = path.join(publicDir, source);
    const targetPath = path.join(publicDir, target);

    try {
      if (!fs.existsSync(sourcePath)) {
        console.log(`⚠️  Skipping ${source} (not found)`);
        continue;
      }

      await sharp(sourcePath)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 59, g: 130, b: 246, alpha: 1 }, // #3b82f6
        })
        .png()
        .toFile(targetPath);

      console.log(`✅ Converted ${source} → ${target} (${width}x${height})`);
    } catch (error) {
      console.error(`❌ Failed to convert ${source}:`, error.message);
    }
  }

  console.log('\n✅ Asset conversion complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Create favicon.ico manually using ImageMagick:');
  console.log('      convert favicon-16.png favicon-32.png favicon-48.png favicon.ico');
  console.log('   2. Or use an online tool like https://favicon.io/favicon-converter/');
  console.log('   3. Replace placeholder SVGs with production-ready designs');
}

convertAssets().catch(console.error);
