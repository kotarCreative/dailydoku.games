// Check the actual prerendered output, not just the Angular configuration.
// Run after `npm run build` so additions cannot miss metadata or internal links.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const site = require('../src/site.config.json');
const games = require('../src/assets/games.json');
const guides = require('../src/discovery-guides.json');

const root = path.join(__dirname, '../dist/dailydoku/browser');
const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.equal(urls.length, games.length + 4 + guides.length + 2, 'Sitemap page count');
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');

function localFile(href) {
  const url = new URL(href, site.siteUrl);
  if (url.origin !== site.siteUrl) return null;
  const target = path.join(root, decodeURIComponent(url.pathname));
  return [target, `${target}.html`, path.join(target, 'index.html')]
    .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
}

const titles = new Set();
for (const url of urls) {
  const file = localFile(url);
  assert.ok(file, `Missing prerender: ${url}`);
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title && !titles.has(title), `Missing or duplicate title: ${url}`);
  titles.add(title);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `Expected one H1: ${url}`);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `Wrong canonical: ${url}`);
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, `Duplicate canonical: ${url}`);
  assert.ok(/<meta name="description" content="[^"]+"/.test(html), `Missing description: ${url}`);
  assert.ok(/<meta name="robots" content="index, follow/.test(html), `Not indexable: ${url}`);
  assert.ok(!html.includes('{gameCount}') && !html.includes('60+'), `Stale game count: ${url}`);

  for (const match of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = match[1].replace(/&amp;/g, '&');
    if (/^(mailto:|tel:)/.test(href)) continue;
    if (new URL(href, site.siteUrl).origin === site.siteUrl) {
      assert.ok(localFile(href), `Broken internal link on ${url}: ${href}`);
    }
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
    const schema = JSON.parse(match[1]);
    assert.ok(schema['@context'] && schema['@type'], `Invalid schema: ${url}`);
  }
}

const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
assert.ok(/<meta name="robots" content="noindex/.test(notFound), '404 must be noindex');
console.log(`SEO output checks passed: ${urls.length} pages, unique titles, canonicals, headings, schema and internal links.`);
