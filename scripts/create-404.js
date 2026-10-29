#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Vercel serves this file with a real 404 status. Its initial HTML must also
 * say noindex and explain the error before the Angular router boots.
 */
const BROWSER_DIR = path.join(__dirname, '..', 'dist', 'dailydoku', 'browser');
const SOURCE = path.join(BROWSER_DIR, 'index.csr.html');
const TARGET = path.join(BROWSER_DIR, '404.html');

if (!fs.existsSync(SOURCE)) {
  console.warn('No index.csr.html found; skipping 404.html generation.');
  process.exit(0);
}

const html = fs.readFileSync(SOURCE, 'utf8')
  .replace(/<title>.*?<\/title>/s, '<title>Page Not Found | DailyDoku</title>')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow">')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="The page you are looking for does not exist. Browse daily puzzles and games on DailyDoku.">')
  .replace(/<link rel="canonical"[^>]*>/, '')
  .replace('<app-root></app-root>', '<app-root><main style="max-width:48rem;margin:5rem auto;padding:24px"><h1 style="font-size:32px;font-weight:800">Page not found</h1><p style="margin:16px 0">This puzzle does not exist. Find your next daily challenge in the directory.</p><a href="/" class="dd-button">Browse daily games</a></main></app-root>');
fs.writeFileSync(TARGET, html);
console.log(`Written ${TARGET}`);
