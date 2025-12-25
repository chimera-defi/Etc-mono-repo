#!/usr/bin/env node
/**
 * Twitter Card Validation Script
 * 
 * Validates that all pages have proper Twitter Card meta tags.
 * Run after build to ensure OG images and meta tags are correct.
 * 
 * Usage: node scripts/validate-twitter-cards.js
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../out');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://walletradar.org';

// Required Twitter Card meta tags
const REQUIRED_TAGS = [
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
  'og:title',
  'og:description',
  'og:image',
  'og:url',
];

// OG image specifications
const OG_IMAGE_SPECS = {
  expectedWidth: 1200,
  expectedHeight: 630,
  minFileSize: 10000, // 10KB minimum
  maxFileSize: 5000000, // 5MB maximum
};

/**
 * Extract meta tags from HTML content
 */
function extractMetaTags(html) {
  const tags = {};
  
  // Match all meta tags
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match;
  
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    
    // Extract property/name and content
    const propertyMatch = attrs.match(/(?:property|name)=["']([^"']+)["']/);
    const contentMatch = attrs.match(/content=["']([^"']+)["']/);
    
    if (propertyMatch && contentMatch) {
      tags[propertyMatch[1]] = contentMatch[1];
    }
  }
  
  return tags;
}

/**
 * Validate a single HTML file
 */
function validateFile(filePath) {
  const relativePath = path.relative(OUT_DIR, filePath);
  const html = fs.readFileSync(filePath, 'utf-8');
  const tags = extractMetaTags(html);
  
  const issues = [];
  const warnings = [];
  
  // Check required tags
  for (const tag of REQUIRED_TAGS) {
    if (!tags[tag]) {
      issues.push(`Missing required tag: ${tag}`);
    }
  }
  
  // Validate twitter:card value
  if (tags['twitter:card'] && tags['twitter:card'] !== 'summary_large_image') {
    warnings.push(`twitter:card should be 'summary_large_image', got '${tags['twitter:card']}'`);
  }
  
  // Validate image URLs are absolute
  const imageUrl = tags['twitter:image'] || tags['og:image'];
  if (imageUrl && !imageUrl.startsWith('http')) {
    issues.push(`Image URL must be absolute: ${imageUrl}`);
  }
  
  // Validate title length (Twitter max: 70 chars)
  const title = tags['twitter:title'] || tags['og:title'];
  if (title && title.length > 70) {
    warnings.push(`Title may be truncated (${title.length} chars, max 70)`);
  }
  
  // Validate description length (Twitter max: 200 chars)
  const desc = tags['twitter:description'] || tags['og:description'];
  if (desc && desc.length > 200) {
    warnings.push(`Description may be truncated (${desc.length} chars, max 200)`);
  }
  
  return {
    file: relativePath,
    tags,
    issues,
    warnings,
    valid: issues.length === 0,
  };
}

/**
 * Validate OG images exist and have correct dimensions
 */
function validateOgImages() {
  const publicDir = path.join(__dirname, '../public');
  const expectedImages = [
    'og-image.png',
    // Current generated set (see scripts/generate-og-images.js output)
    'og-software-wallets-table.png',
    'og-software-wallets-details.png',
    'og-hardware-wallets-table.png',
    'og-hardware-wallets-details.png',
    'og-crypto-cards-table.png',
    'og-crypto-cards-details.png',
    'og-explore.png',
  ];
  
  const results = [];
  
  for (const imageName of expectedImages) {
    const imagePath = path.join(publicDir, imageName);
    const result = {
      image: imageName,
      exists: false,
      size: 0,
      issues: [],
    };
    
    if (fs.existsSync(imagePath)) {
      result.exists = true;
      const stats = fs.statSync(imagePath);
      result.size = stats.size;
      
      if (stats.size < OG_IMAGE_SPECS.minFileSize) {
        result.issues.push(`Image too small (${stats.size} bytes, min ${OG_IMAGE_SPECS.minFileSize})`);
      }
      if (stats.size > OG_IMAGE_SPECS.maxFileSize) {
        result.issues.push(`Image too large (${stats.size} bytes, max ${OG_IMAGE_SPECS.maxFileSize})`);
      }
    } else {
      result.issues.push('Image file not found');
    }
    
    results.push(result);
  }
  
  return results;
}

/**
 * Find all HTML files in the output directory
 */
function findHtmlFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.name === 'index.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Validating Twitter Cards and OG Tags...\n');
  
  // Validate OG images
  console.log('📸 Checking OG Images:\n');
  const imageResults = validateOgImages();
  
  for (const result of imageResults) {
    const status = result.exists && result.issues.length === 0 ? '✅' : '❌';
    console.log(`${status} ${result.image}`);
    if (result.exists) {
      console.log(`   Size: ${(result.size / 1024).toFixed(1)} KB`);
    }
    for (const issue of result.issues) {
      console.log(`   ⚠️  ${issue}`);
    }
  }
  
  // Validate HTML files
  console.log('\n📄 Checking HTML Pages:\n');
  
  const htmlFiles = findHtmlFiles(OUT_DIR);
  
  if (htmlFiles.length === 0) {
    console.log('⚠️  No HTML files found. Run `npm run build` first.\n');
    console.log('To validate after build, run:');
    console.log('  npm run build && node scripts/validate-twitter-cards.js\n');
    return;
  }
  
  let allValid = true;
  let totalIssues = 0;
  let totalWarnings = 0;
  
  for (const file of htmlFiles) {
    const result = validateFile(file);
    
    if (!result.valid || result.warnings.length > 0) {
      const status = result.valid ? '⚠️' : '❌';
      console.log(`${status} ${result.file}`);
      
      for (const issue of result.issues) {
        console.log(`   ❌ ${issue}`);
        totalIssues++;
      }
      for (const warning of result.warnings) {
        console.log(`   ⚠️  ${warning}`);
        totalWarnings++;
      }
    } else {
      console.log(`✅ ${result.file}`);
    }
    
    if (!result.valid) {
      allValid = false;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   Pages checked: ${htmlFiles.length}`);
  console.log(`   Issues: ${totalIssues}`);
  console.log(`   Warnings: ${totalWarnings}`);
  
  if (allValid && totalWarnings === 0) {
    console.log('\n✅ All Twitter Cards are valid!\n');
  } else if (allValid) {
    console.log('\n⚠️  Some warnings found, but all required tags present.\n');
  } else {
    console.log('\n❌ Some pages have invalid Twitter Cards.\n');
    process.exit(1);
  }
  
  // Helpful links
  console.log('🔗 Validation Tools:');
  console.log(`   Twitter: https://cards-dev.twitter.com/validator`);
  console.log(`   Facebook: https://developers.facebook.com/tools/debug/`);
  console.log(`   LinkedIn: https://www.linkedin.com/post-inspector/`);
  console.log('');
}

main();
