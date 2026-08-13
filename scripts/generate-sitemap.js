const fs = require('fs');
const path = require('path');

/**
 * Generates src/sitemap.xml from the static game list in src/assets/games.json.
 *
 * games.json is the authoritative source for the catalogue. This used to be
 * fetched from Firestore at build time, but the collection had drifted behind
 * the local file (4 games missing, a stale description and an inconsistent
 * `type` casing), so every build silently reverted good data. The list is small
 * and changes rarely, so keeping it in the repo makes builds deterministic and
 * reviewable in git.
 */

const siteConfig = require(path.join(__dirname, '..', 'src', 'site.config.json'));
const SITE_URL = siteConfig.siteUrl;

const GAMES_JSON = path.join(__dirname, '..', 'src', 'assets', 'games.json');
const SITEMAP = path.join(__dirname, '..', 'src', 'sitemap.xml');

function urlEntry({ loc, lastmod, priority, changefreq }) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`;
}

function generateSitemap(games, lastmod) {
  const urls = [
    urlEntry({
      loc: `${SITE_URL}/`,
      lastmod,
      priority: '1.0',
      changefreq: 'daily'
    }),
    ...games.map(game =>
      urlEntry({
        loc: `${SITE_URL}/games/${game.slug}`,
        lastmod,
        priority: '0.8',
        changefreq: 'weekly'
      })
    )
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

function main() {
  if (!fs.existsSync(GAMES_JSON)) {
    console.error(`${GAMES_JSON} not found.`);
    process.exit(1);
  }

  const games = JSON.parse(fs.readFileSync(GAMES_JSON, 'utf8'));

  const missingSlug = games.filter(game => !game.slug || !game.name);
  if (missingSlug.length) {
    console.error(`${missingSlug.length} game(s) are missing a name or slug.`);
    process.exit(1);
  }

  const duplicates = games
    .map(game => game.slug)
    .filter((slug, index, all) => all.indexOf(slug) !== index);
  if (duplicates.length) {
    console.error(`Duplicate slugs in games.json: ${[...new Set(duplicates)].join(', ')}`);
    process.exit(1);
  }

  const lastmod = new Date().toISOString().split('T')[0];
  fs.writeFileSync(SITEMAP, generateSitemap(games, lastmod));

  console.log(`Written ${SITEMAP} (${games.length + 1} urls, lastmod ${lastmod})`);
}

main();
