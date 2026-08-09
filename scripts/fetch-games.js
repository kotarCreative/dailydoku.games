const fs = require('fs');
const path = require('path');

const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/dailydoku-31cec/databases/(default)/documents/games?pageSize=200';
const SITE_URL = 'https://www.daily-doku.com';

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function transformFirestoreGame(doc) {
  const fields = doc.fields;
  return {
    name: fields.name?.stringValue || '',
    slug: slugify(fields.name?.stringValue || ''),
    type: fields.type?.stringValue || '',
    url: fields.url?.stringValue || '',
    logo: fields.logo?.stringValue || '',
    description: fields.description?.stringValue || ''
  };
}

function generateSitemap(games) {
  const urls = [
    `  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>`
  ];

  games.forEach(game => {
    urls.push(`  <url>
    <loc>${SITE_URL}/games/${game.slug}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

async function main() {
  console.log('Fetching games from Firestore...');
  
  try {
    const response = await fetch(FIRESTORE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.documents || !Array.isArray(data.documents)) {
      throw new Error('Invalid response format from Firestore');
    }

    const games = data.documents
      .map(transformFirestoreGame)
      .filter(game => game.name && game.slug)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Fetched ${games.length} games from Firestore`);

    // Merge with existing local games so games not yet in Firestore survive
    const gamesJsonPath = path.join(__dirname, '..', 'src', 'assets', 'games.json');
    const existingGames = fs.existsSync(gamesJsonPath)
      ? JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'))
      : [];
    const merged = new Map();
    games.forEach(game => merged.set(game.slug, game));
    existingGames.forEach(game => {
      if (game.slug && !merged.has(game.slug)) {
        merged.set(game.slug, game);
      }
    });
    const allGames = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));

    // Write games.json
    fs.writeFileSync(gamesJsonPath, JSON.stringify(allGames, null, 2));
    console.log(`Written ${gamesJsonPath} (${allGames.length} games)`);

    // Generate and write sitemap.xml
    const sitemap = generateSitemap(allGames);
    const sitemapPath = path.join(__dirname, '..', 'src', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`Written ${sitemapPath}`);

    console.log('Done!');
  } catch (error) {
    console.error('Error fetching games:', error.message);
    process.exit(1);
  }
}

main();
