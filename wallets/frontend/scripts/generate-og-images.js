#!/usr/bin/env node
/**
 * OG Image Generator for Wallet Radar
 * 
 * Generates page-specific Open Graph images for social sharing.
 * Images are 1200x630 pixels (Twitter/OG standard).
 * 
 * Usage: node scripts/generate-og-images.js
 */

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration
const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT_DIR = path.join(__dirname, '../public');

// Colors (matching Wallet Radar theme)
const COLORS = {
  primary: '#3b82f6',      // Blue
  primaryDark: '#1d4ed8',  // Darker blue
  background: '#0f172a',   // Dark slate
  backgroundAlt: '#1e293b', // Slightly lighter
  text: '#ffffff',
  textMuted: '#94a3b8',
  accent: '#22c55e',       // Green for scores
  accentYellow: '#eab308', // Yellow
  border: '#334155',
};

// Wallet data for the images
// IMPORTANT: This data must match WALLET_COMPARISON_UNIFIED_TABLE.md and HARDWARE_WALLET_COMPARISON_TABLE.md
// Last verified: December 2025
const WALLET_DATA = {
  software: [
    // Data from WALLET_COMPARISON_UNIFIED_TABLE.md
    { name: 'Rabby', score: 92, platforms: 'Mobile+Ext', chains: '94', status: '🟢' },
    { name: 'Trust', score: 85, platforms: 'Mobile+Ext', chains: '163', status: '🟢' },
    { name: 'Rainbow', score: 82, platforms: 'Mobile+Ext', chains: '15+', status: '🟢' },
    { name: 'Brave', score: 78, platforms: 'Mobile+Ext', chains: '10+', status: '🟢' },
    { name: 'Coinbase', score: 75, platforms: 'Mobile+Ext', chains: '20+', status: '🟢' },
  ],
  hardware: [
    // Data from HARDWARE_WALLET_COMPARISON_TABLE.md
    { name: 'Trezor Safe 5', score: 94, price: '~$169', security: 'Optiga SE', status: '🟢' },
    { name: 'Keystone 3 Pro', score: 91, price: '~$149', security: '3× SE', status: '🟢' },
    { name: 'ColdCard Mk4', score: 91, price: '~$150', security: 'Dual SE', status: '🟢' },
    { name: 'Trezor Safe 3', score: 91, price: '~$79', security: 'Optiga SE', status: '🟢' },
    { name: 'BitBox02', score: 88, price: '~$150', security: 'ATECC', status: '🟢' },
  ],
  cards: [
    // Data from CRYPTO_CREDIT_CARD_COMPARISON_TABLE.md - Top 5 by score
    // Last verified: December 2025
    { name: 'Ready Card', cashback: '10%', type: 'Debit', region: 'EU/UK', status: '🟢' },
    { name: 'Bybit Card', cashback: '10%', type: 'Debit', region: 'EEA', status: '🟢' },
    { name: 'Plutus Card', cashback: '3-9%', type: 'Debit', region: 'EU/UK', status: '🟢' },
    { name: 'Coinbase Card', cashback: '1-4%', type: 'Debit', region: 'US', status: '🟢' },
    { name: 'Nexo Card', cashback: '2%', type: 'Credit', region: 'EU/UK', status: '🟢' },
  ],
};

/**
 * Draw rounded rectangle
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw the Wallet Radar logo/branding
 */
function drawBranding(ctx) {
  // Logo area (left side)
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText('📡 Wallet Radar', 50, 55);
  
  // Tagline
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('Developer-Focused Crypto Wallet Research', 50, 85);
}

/**
 * Draw a data table
 */
function drawTable(ctx, headers, data, startY) {
  const startX = 50;
  const rowHeight = 50;
  const colWidths = headers.map((_, i) => {
    if (i === 0) return 220; // Name column
    return 140; // Other columns
  });
  
  // Table background
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const tableHeight = (data.length + 1) * rowHeight + 20;
  
  ctx.fillStyle = COLORS.backgroundAlt;
  roundRect(ctx, startX - 15, startY - 15, tableWidth + 30, tableHeight, 12);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  roundRect(ctx, startX - 15, startY - 15, tableWidth + 30, tableHeight, 12);
  ctx.stroke();
  
  // Header row
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = 'bold 16px Arial, sans-serif';
  let x = startX;
  headers.forEach((header, i) => {
    ctx.fillText(header, x, startY + 20);
    x += colWidths[i];
  });
  
  // Header separator
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(startX - 10, startY + 35);
  ctx.lineTo(startX + tableWidth + 10, startY + 35);
  ctx.stroke();
  
  // Data rows
  ctx.font = '18px Arial, sans-serif';
  data.forEach((row, rowIndex) => {
    const y = startY + 70 + rowIndex * rowHeight;
    x = startX;
    
    Object.values(row).forEach((value, colIndex) => {
      // Special styling for score column
      if (colIndex === 1 && typeof value === 'number') {
        // Score with color coding
        if (value >= 90) {
          ctx.fillStyle = COLORS.accent;
        } else if (value >= 80) {
          ctx.fillStyle = '#22d3ee'; // Cyan
        } else if (value >= 70) {
          ctx.fillStyle = COLORS.accentYellow;
        } else {
          ctx.fillStyle = '#f87171'; // Red
        }
        ctx.font = 'bold 18px Arial, sans-serif';
      } else if (colIndex === 0) {
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 18px Arial, sans-serif';
      } else {
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = '16px Arial, sans-serif';
      }
      
      ctx.fillText(String(value), x, y);
      x += colWidths[colIndex];
    });
  });
}

/**
 * Draw footer with stats
 */
function drawFooter(ctx, stats) {
  const y = HEIGHT - 50;
  
  // Footer background
  ctx.fillStyle = COLORS.backgroundAlt;
  ctx.fillRect(0, y - 30, WIDTH, 80);
  
  // Stats
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '16px Arial, sans-serif';
  
  let x = 50;
  stats.forEach((stat, i) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(stat.value, x, y + 5);
    
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(stat.label, x, y + 25);
    
    x += 200;
  });
  
  // URL
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('walletradar.org', WIDTH - 200, y + 15);
}

/**
 * Generate Software Wallets OG Image
 */
function generateSoftwareWalletsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, COLORS.background);
  gradient.addColorStop(1, '#0c1929');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Branding
  drawBranding(ctx);
  
  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText('Software Wallet Comparison', 50, 160);
  
  // Subtitle
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('24+ EVM wallets scored on security, activity & developer experience', 50, 195);
  
  // Table
  const headers = ['Wallet', 'Score', 'Platforms', 'Chains', 'Status'];
  drawTable(ctx, headers, WALLET_DATA.software, 230);
  
  // Footer
  drawFooter(ctx, [
    { value: '24+', label: 'Wallets Compared' },
    { value: '163', label: 'Max Chains (Trust)' },
    { value: 'Weekly', label: 'Data Updates' },
  ]);
  
  return canvas;
}

/**
 * Generate Hardware Wallets OG Image
 */
function generateHardwareWalletsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Branding
  drawBranding(ctx);
  
  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText('Hardware Wallet Comparison', 50, 160);
  
  // Subtitle
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('23+ cold storage devices reviewed for security & open source firmware', 50, 195);
  
  // Table
  const headers = ['Wallet', 'Score', 'Price', 'Security', 'Status'];
  drawTable(ctx, headers, WALLET_DATA.hardware, 230);
  
  // Footer
  drawFooter(ctx, [
    { value: '23+', label: 'Devices Reviewed' },
    { value: 'Trezor', label: 'Top Pick (Score: 94)' },
    { value: '$79+', label: 'Starting Price' },
  ]);
  
  return canvas;
}

/**
 * Generate Crypto Cards OG Image
 */
function generateCryptoCardsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#14532d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Branding
  drawBranding(ctx);
  
  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText('Crypto Credit Card Comparison', 50, 160);
  
  // Subtitle
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('27+ crypto debit & credit cards compared for rewards & availability', 50, 195);
  
  // Table
  const headers = ['Card', 'Cashback', 'Type', 'Region', 'Status'];
  drawTable(ctx, headers, WALLET_DATA.cards, 230);
  
  // Footer
  drawFooter(ctx, [
    { value: '27+', label: 'Cards Compared' },
    { value: '10%', label: 'Max Cashback' },
    { value: 'Global', label: 'Availability' },
  ]);
  
  return canvas;
}

/**
 * Generate default/homepage OG Image
 */
function generateDefaultImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, COLORS.primary);
  gradient.addColorStop(1, COLORS.primaryDark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Center content
  ctx.textAlign = 'center';
  
  // Logo/Icon
  ctx.font = '72px Arial';
  ctx.fillText('📡', WIDTH / 2, HEIGHT / 2 - 100);
  
  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText('Wallet Radar', WIDTH / 2, HEIGHT / 2);
  
  // Tagline
  ctx.font = '28px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Developer-Focused Crypto Wallet Research', WIDTH / 2, HEIGHT / 2 + 55);
  
  // Stats row
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('24+ Software Wallets  •  23+ Hardware Wallets  •  27+ Crypto Cards', WIDTH / 2, HEIGHT / 2 + 120);
  
  // URL
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = COLORS.text;
  ctx.fillText('walletradar.org', WIDTH / 2, HEIGHT - 50);
  
  ctx.textAlign = 'left';
  
  return canvas;
}

/**
 * Save canvas to PNG file
 */
function saveCanvas(canvas, filename) {
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Generated: ${filepath}`);
}

/**
 * Generate Software Wallets Details Page Image (non-table)
 */
function generateSoftwareWalletsDetailsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, COLORS.background);
  gradient.addColorStop(1, '#0c1929');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Branding
  drawBranding(ctx);

  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText('Software Wallet Guide', 50, 160);

  // Subtitle
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Developer-focused recommendations and methodology', 50, 195);

  // Recommendations section
  const startY = 250;

  // Section title
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('🎯 Top Recommendations', 50, startY);

  // Top picks
  const picks = [
    { rank: '🥇', name: 'Rabby', score: 92, for: 'Development - tx simulation, catches bugs' },
    { rank: '🥈', name: 'Trust', score: 85, for: 'Production - stable, 163 chains' },
    { rank: '🥉', name: 'Rainbow', score: 82, for: 'Production - best code quality' },
  ];

  let y = startY + 50;
  picks.forEach((pick) => {
    // Rank
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText(pick.rank, 50, y);

    // Wallet name and score
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(pick.name, 110, y);

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(`${pick.score}`, 250, y);

    // Description
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(pick.for, 110, y + 28);

    y += 80;
  });

  // Use cases section
  y += 20;
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('💡 Use Cases', 50, y);

  const useCases = [
    '• Maximum Stability: Brave (78) - ~2 releases/month',
    '• Account Abstraction: Coinbase (75) - EIP-4337 support',
    '• Compatibility Testing: MetaMask (68) - test last',
  ];

  y += 40;
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '18px Arial, sans-serif';
  useCases.forEach((useCase) => {
    ctx.fillText(useCase, 50, y);
    y += 35;
  });

  // Footer
  drawFooter(ctx, [
    { value: '24+', label: 'Wallets Compared' },
    { value: 'Weekly', label: 'Data Updates' },
    { value: 'Open Source', label: 'Methodology' },
  ]);

  return canvas;
}

/**
 * Generate Hardware Wallets Details Page Image (non-table)
 */
function generateHardwareWalletsDetailsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Branding
  drawBranding(ctx);

  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText('Hardware Wallet Guide', 50, 160);

  // Subtitle
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Cold storage security and recommendations', 50, 195);

  // Recommendations section
  const startY = 250;

  // Section title
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('🎯 Top Recommendations', 50, startY);

  // Top picks
  const picks = [
    { rank: '🥇', name: 'Trezor Safe 5', score: 94, for: 'Best overall - Optiga SE, $169' },
    { rank: '🥈', name: 'Keystone 3 Pro', score: 91, for: 'Air-gapped - 3× SE chips, $149' },
    { rank: '🥉', name: 'ColdCard Mk4', score: 91, for: 'Bitcoin-first - Dual SE, $150' },
  ];

  let y = startY + 50;
  picks.forEach((pick) => {
    // Rank
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText(pick.rank, 50, y);

    // Wallet name and score
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(pick.name, 110, y);

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(`${pick.score}`, 370, y);

    // Description
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(pick.for, 110, y + 28);

    y += 80;
  });

  // Key features section
  y += 20;
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('🔒 Security Features', 50, y);

  const features = [
    '• Secure Element chips for key storage',
    '• Open source firmware for transparency',
    '• Air-gapped options for maximum security',
  ];

  y += 40;
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '18px Arial, sans-serif';
  features.forEach((feature) => {
    ctx.fillText(feature, 50, y);
    y += 35;
  });

  // Footer
  drawFooter(ctx, [
    { value: '23+', label: 'Devices Reviewed' },
    { value: '$79+', label: 'Starting Price' },
    { value: 'Secure Element', label: 'Protection' },
  ]);

  return canvas;
}

/**
 * Generate Crypto Cards Details Page Image (non-table)
 */
function generateCryptoCardsDetailsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#14532d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Branding
  drawBranding(ctx);

  // Title
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText('Crypto Card Guide', 50, 160);

  // Subtitle
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText('Maximize cashback and rewards on crypto spending', 50, 195);

  // Recommendations section
  const startY = 250;

  // Section title
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('🎯 Top Cashback Cards', 50, startY);

  // Top picks
  const picks = [
    { rank: '🥇', name: 'Ready Card', cashback: '10%', for: 'EU/UK - Debit card' },
    { rank: '🥈', name: 'Bybit Card', cashback: '10%', for: 'EEA - Debit card' },
    { rank: '🥉', name: 'Plutus Card', cashback: '3-9%', for: 'EU/UK - Tiered rewards' },
  ];

  let y = startY + 50;
  picks.forEach((pick) => {
    // Rank
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText(pick.rank, 50, y);

    // Card name and cashback
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(pick.name, 110, y);

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(pick.cashback, 330, y);

    // Description
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(pick.for, 110, y + 28);

    y += 80;
  });

  // Regional options section
  y += 20;
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('🌍 Regional Options', 50, y);

  const regions = [
    '• US: Coinbase Card (1-4%), Fold Card (1.5%)',
    '• EU/UK: Nexo Card (2%), Crypto.com (1-8%)',
    '• Global: Multiple options with varying limits',
  ];

  y += 40;
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '18px Arial, sans-serif';
  regions.forEach((region) => {
    ctx.fillText(region, 50, y);
    y += 35;
  });

  // Footer
  drawFooter(ctx, [
    { value: '27+', label: 'Cards Compared' },
    { value: '10%', label: 'Max Cashback' },
    { value: 'Global', label: 'Coverage' },
  ]);

  return canvas;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Generating OG Images for Wallet Radar...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate all images (6 total: 3 table + 3 details)
  console.log('📊 Generating table comparison images...');
  saveCanvas(generateSoftwareWalletsImage(), 'og-software-wallets-table.png');
  saveCanvas(generateHardwareWalletsImage(), 'og-hardware-wallets-table.png');
  saveCanvas(generateCryptoCardsImage(), 'og-crypto-cards-table.png');

  console.log('\n📖 Generating details/guide images...');
  saveCanvas(generateSoftwareWalletsDetailsImage(), 'og-software-wallets-details.png');
  saveCanvas(generateHardwareWalletsDetailsImage(), 'og-hardware-wallets-details.png');
  saveCanvas(generateCryptoCardsDetailsImage(), 'og-crypto-cards-details.png');

  // Only generate default image if it doesn't exist or --force flag is passed
  console.log('\n🏠 Checking default homepage image...');
  const defaultImagePath = path.join(OUTPUT_DIR, 'og-image.png');
  if (!fs.existsSync(defaultImagePath) || process.argv.includes('--force')) {
    saveCanvas(generateDefaultImage(), 'og-image.png');
  } else {
    console.log('⏭️  Skipped: og-image.png (already exists, use --force to regenerate)');
  }

  console.log('\n✨ All OG images generated successfully!');
  console.log('\nGenerated files:');
  console.log('  📊 Table pages: og-{software-wallets,hardware-wallets,crypto-cards}-table.png');
  console.log('  📖 Details pages: og-{software-wallets,hardware-wallets,crypto-cards}-details.png');
  console.log('  🏠 Homepage: og-image.png');
  console.log('\nNext steps:');
  console.log('1. Review the generated images in /public/');
  console.log('2. Update seo.ts to map table/details pages to correct images');
  console.log('3. Test with Twitter Card Validator: https://cards-dev.twitter.com/validator');
}

main().catch(console.error);
