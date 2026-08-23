#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Copies the CSR fallback shell to 404.html. Vercel serves that file (with a
 * real 404 status) for any path without a prerendered match; once booted, the
 * Angular router renders the NotFoundComponent inside it.
 */
const BROWSER_DIR = path.join(__dirname, '..', 'dist', 'dailydoku', 'browser');
const SOURCE = path.join(BROWSER_DIR, 'index.csr.html');
const TARGET = path.join(BROWSER_DIR, '404.html');

if (!fs.existsSync(SOURCE)) {
  console.warn('No index.csr.html found; skipping 404.html generation.');
  process.exit(0);
}

fs.copyFileSync(SOURCE, TARGET);
console.log(`Written ${TARGET}`);
