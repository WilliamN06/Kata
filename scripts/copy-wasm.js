#!/usr/bin/env node
/**
 * Copies sql-wasm.wasm from node_modules to apps/web/public/
 * Run this after installing dependencies.
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function findFile(dir, name, maxDepth = 5, depth = 0) {
  if (depth > maxDepth) return null;
  if (!existsSync(dir)) return null;

  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry === name) {
        const full = join(dir, entry);
        if (statSync(full).isFile()) return full;
      }
    }
    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      const full = join(dir, entry);
      if (!existsSync(full)) continue;
      try {
        if (statSync(full).isDirectory()) {
          const found = findFile(full, name, maxDepth, depth + 1);
          if (found) return found;
        }
      } catch {}
    }
  } catch {}

  return null;
}

const source = findFile(join(rootDir, 'node_modules'), 'sql-wasm.wasm');
if (!source) {
  console.error('Could not find sql-wasm.wasm in node_modules');
  console.error('Try running: pnpm install');
  process.exit(1);
}

const targetDir = join(rootDir, 'apps', 'web', 'public');
mkdirSync(targetDir, { recursive: true });

const target = join(targetDir, 'sql-wasm.wasm');
copyFileSync(source, target);

console.log(`✓ Copied sql-wasm.wasm`);
console.log(`  From: ${source}`);
console.log(`  To:   ${target}`);