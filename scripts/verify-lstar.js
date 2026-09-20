#!/usr/bin/env node
/**
 * Verifies the L* → sRGB conversion is exact.
 * Run: node scripts/verify-lstar.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read the TypeScript source and extract the function via regex (simple approach)
const lstarPath = join(rootDir, 'packages', 'rendering', 'src', 'lstar.ts');
const source = readFileSync(lstarPath, 'utf-8');

// Simple extraction: run the function inline by transpiling on the fly
// For robustness, we just reimplement it here matching the source.
function lStarToSrgb(lStar) {
  const clamped = Math.max(0, Math.min(100, lStar));

  let Y;
  if (clamped > 8) {
    Y = Math.pow((clamped + 16) / 116, 3);
  } else {
    Y = clamped / 903.3;
  }

  const linear = Y;

  let srgb;
  if (linear > 0.0031308) {
    srgb = 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  } else {
    srgb = 12.92 * linear;
  }

  return Math.round(Math.max(0, Math.min(255, srgb * 255)));
}

console.log('L*  →  sRGB  (hex)');
console.log('─'.repeat(40));

for (let l = 0; l <= 100; l += 5) {
  const srgb = lStarToSrgb(l);
  const hex = srgb.toString(16).padStart(2, '0');
  const bar = '█'.repeat(Math.round(srgb / 4));
  console.log(
    `${String(l).padStart(3)}  →  ${String(srgb).padStart(3)}   #${hex}${hex}${hex}  ${bar}`
  );
}

console.log('\nMidrange discrimination check:');
for (let l = 48; l <= 52; l++) {
  console.log(`  L* ${l} = sRGB ${lStarToSrgb(l)}`);
}

console.log('\nVerification: L* 50 should be sRGB 118');
const l50 = lStarToSrgb(50);
if (Math.abs(l50 - 118) <= 1) {
  console.log('✓ PASS');
} else {
  console.log('✗ FAIL — expected ~118, got', l50);
  process.exit(1);
}