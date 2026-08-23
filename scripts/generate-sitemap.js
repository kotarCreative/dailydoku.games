const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generates all catalogue-derived SEO assets from src/assets/games.json:
 *
 *   - src/sitemap.xml           URLs for home, category hubs and every game
 *   - src/llms.txt              machine-readable site overview for AI crawlers
 *   - src/app/content-meta.ts   build-time constants (content lastmod date)
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
const SITE_NAME = siteConfig.siteName;
const SITE_DESCRIPTION = siteConfig.shortDescription || siteConfig.description;

const GAMES_JSON = path.join(__dirname, '..', 'src', 'assets', 'games.json');
const SITEMAP = path.join(__dirname, '..', 'src', 'sitemap.xml');
const LLMS_TXT = path.join(__dirname, '..', 'src', 'llms.txt');
const CONTENT_META = path.join(__dirname, '..', 'src', 'app', 'content-meta.ts');

// Category hub pages. Keep in sync with CATEGORIES in src/app/site-config.ts;
// scripts cannot import that file because it is TypeScript.
const CATEGORIES = [
  { path: '/word-games', heading: 'Daily Word Games' },
  { path: '/grid-puzzles', heading: 'Daily Grid Puzzles' },
  { path: '/trivia-games', heading: 'Daily Trivia Games' },
  { path: '/puzzles', heading: 'Daily Puzzles' }
];

/**
 * The catalogue's real last-modified date comes from git rather than the
 * clock, so unchanged pages stop claiming fresh lastmods on every build.
 * Falls back to today when git history is unavailable (e.g. shallow clones).
 */
function contentLastmod() {
  try {
    const iso = execSync(
      'git log -1 --format=%cI -- src/assets/games.json',
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(iso)) {
      return iso.slice(0, 10);
    }
  } catch {
    // fall through to the clock
  }
  return new Date().toISOString().split('T')[0];
}

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
    ...CATEGORIES.map(category =>
      urlEntry({
        loc: `${SITE_URL}${category.path}`,
        lastmod,
        priority: '0.9',
        changefreq: 'weekly'
      })
    ),
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

/**
 * llms.txt (https://llmtxt.org) gives AI answer engines an accurate, compact
 * summary of the site so citations describe DailyDoku correctly. Grouped by
 * category with one line per game, mirroring the public URL structure.
 */
function generateLlmsTxt(games) {
  const byType = {};
  games.forEach(game => {
    const key = game.type || 'puzzle';
    (byType[key] = byType[key] || []).push(game);
  });

  const sections = CATEGORIES.map(category => {
    const typeKey = {
      '/word-games': 'oodle',
      '/grid-puzzles': 'doku',
      '/trivia-games': 'trivia',
      '/puzzles': 'puzzle'
    }[category.path];

    const entries = (byType[typeKey] || [])
      .map(game =>
        `- [${game.name}](${SITE_URL}/games/${game.slug}): ${game.description}`
      )
      .join('\n');

    return `## ${category.heading}\n\n${entries}`;
  }).join('\n\n');

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${siteConfig.description} Every listing links to a page describing the game, how it plays and where to play it. All games are free, browser-based and refresh once per day.

## Pages

- [Home](${SITE_URL}/): the full directory of daily puzzles and daily games
${CATEGORIES.map(c => `- [${c.heading}](${SITE_URL}${c.path})`).join('\n')}

${sections}
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

  const lastmod = contentLastmod();

  fs.writeFileSync(SITEMAP, generateSitemap(games, lastmod));
  fs.writeFileSync(LLMS_TXT, generateLlmsTxt(games));
  fs.writeFileSync(
    CONTENT_META,
    `// Auto-generated by scripts/generate-sitemap.js from git history of
// games.json. Do not edit by hand; run a build to refresh.
export const CONTENT_LAST_UPDATED = '${lastmod}';
`
  );

  console.log(
    `Written ${SITEMAP} (${games.length + CATEGORIES.length + 1} urls), ${LLMS_TXT}, ${CONTENT_META} (lastmod ${lastmod})`
  );
}

main();
