// ABOUTME: Script to generate PWA icons from favicon.svg
// ABOUTME: Creates 192x192, 512x512, and maskable icons

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Read SVG
const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'));

// Create a version with solid background for better visibility
const svgWithBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#0f172a"/>
  <g transform="translate(128, 128) scale(10.67)">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </linearGradient>
    </defs>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" fill="none" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m9 10 2 2 4-4" fill="none" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

// Generate icons
async function generate() {
  // 192x192 icon
  await sharp(Buffer.from(svgWithBg))
    .resize(192, 192)
    .png()
    .toFile(join(iconsDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // 512x512 icon
  await sharp(Buffer.from(svgWithBg))
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // Maskable icon (needs more padding)
  const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f172a"/>
  <g transform="translate(156, 156) scale(8.33)">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </linearGradient>
    </defs>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" fill="none" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m9 10 2 2 4-4" fill="none" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'maskable-icon.png'));
  console.log('Created maskable-icon.png');

  console.log('Done!');
}

generate().catch(console.error);
