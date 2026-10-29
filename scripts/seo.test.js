const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateSitemap, generateLlmsTxt, validateGuides } = require('./generate-sitemap');
const games = require('../src/assets/games.json');
const guides = require('../src/discovery-guides.json');
const site = require('../src/site.config.json');

test('sitemap includes every game, category, guide and About exactly once', () => {
  const xml = generateSitemap(games, '2026-10-28');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, games.length + 4 + guides.length + 2);
  assert.equal(new Set(urls).size, urls.length);
  for (const path of ['/about', ...guides.map(guide => guide.path), ...games.map(game => `/games/${game.slug}`)]) {
    assert.ok(urls.includes(`${site.siteUrl}${path}`), path);
  }
});

test('machine-readable overview uses current counts and accurately describes a directory', () => {
  const text = generateLlmsTxt(games);
  assert.ok(text.includes(`Browse ${games.length} daily games`));
  assert.ok(!text.includes('{gameCount}'));
  assert.ok(!text.includes('60+'));
  assert.ok(text.includes('not the publisher'));
  for (const guide of guides) assert.ok(text.includes(`${site.siteUrl}${guide.path}`));
});

test('guide validation prevents missing games, duplicate picks and duplicate routes', () => {
  assert.doesNotThrow(() => validateGuides(games));
  assert.throws(() => validateGuides(games, [{ ...guides[0], picks: [{ slug: 'missing' }] }]), /Missing or duplicate/);
  assert.throws(() => validateGuides(games, [{ ...guides[0], picks: [guides[0].picks[0], guides[0].picks[0]] }]), /Missing or duplicate/);
  assert.throws(() => validateGuides(games, [guides[0], guides[0]]), /duplicate discovery path/);
  assert.throws(() => validateGuides(games, [{ ...guides[0], path: '/word-games' }]), /duplicate discovery path/);
  assert.throws(() => validateGuides(games, [{ ...guides[0], sourceSlug: 'missing' }]), /Missing source game/);
});
