#!/usr/bin/env node
/**
 * Generates placeholder build icons using pure Node.js (no ImageMagick needed)
 * Run: node scripts/gen-placeholder-icons.js
 * 
 * For production, replace build/icon.ico, build/icon.icns, and build/icons/*.png
 * with your real Escape from Churkov artwork.
 */

const fs = require('fs');
const path = require('path');

// Minimal 1x1 orange PNG (base64)
// Replace the icons in build/ with real artwork for production
const TINY_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

const iconsDir = path.join(__dirname, '..', 'build', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 32, 48, 128, 256, 512];
sizes.forEach(size => {
  const dest = path.join(iconsDir, `${size}x${size}.png`);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, Buffer.from(TINY_PNG_B64, 'base64'));
    console.log(`Created placeholder: ${dest}`);
  }
});

// Placeholder .ico (same tiny PNG — real ICO format needed for production)
const icoPath = path.join(__dirname, '..', 'build', 'icon.ico');
if (!fs.existsSync(icoPath)) {
  fs.writeFileSync(icoPath, Buffer.from(TINY_PNG_B64, 'base64'));
  console.log('Created placeholder: build/icon.ico');
}

// Placeholder .icns
const icnsPath = path.join(__dirname, '..', 'build', 'icon.icns');
if (!fs.existsSync(icnsPath)) {
  fs.writeFileSync(icnsPath, Buffer.from(TINY_PNG_B64, 'base64'));
  console.log('Created placeholder: build/icon.icns');
}

console.log('\n✅ Placeholder icons ready (replace with real artwork before release!)');
