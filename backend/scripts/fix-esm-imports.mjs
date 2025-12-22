#!/usr/bin/env node
/**
 * Post-build script to add .js extensions to relative imports
 * Required for Node.js ESM module resolution
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Regex to match relative imports without .js extension
// Matches: from './foo' or from '../bar' or from '../services/baz'
const importFromRegex = /from\s+['"](\.[^'"]+)['"]/g;
// Matches: import './foo' (side-effect imports)
const importSideEffectRegex = /import\s+['"](\.[^'"]+)['"]/g;

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(path);
    } else if (entry.name.endsWith('.js')) {
      yield path;
    }
  }
}

async function fixImports(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let modified = false;

  // Fix 'from' imports
  content = content.replace(importFromRegex, (match, importPath) => {
    if (importPath.endsWith('.js')) {
      return match;
    }
    modified = true;
    return `from '${importPath}.js'`;
  });

  // Fix side-effect imports
  content = content.replace(importSideEffectRegex, (match, importPath) => {
    if (importPath.endsWith('.js')) {
      return match;
    }
    modified = true;
    return `import '${importPath}.js'`;
  });

  if (modified) {
    await writeFile(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  }
}

async function main() {
  console.log('Fixing ESM imports in dist/ ...');
  let count = 0;
  
  for await (const file of walkDir(distDir)) {
    await fixImports(file);
    count++;
  }
  
  console.log(`Processed ${count} files`);
}

main().catch(console.error);
