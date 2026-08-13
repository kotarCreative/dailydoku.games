const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Downloads every game logo referenced in games.json and rewrites the `logo`
 * field to point at our own /assets/logos/ copy.
 *
 * Why: the logos were hotlinked straight from each game's own domain, which
 * meant every visitor's browser hit ~30 third-party hosts on the home page.
 * That leaked referrers, set third-party cookies (a Lighthouse Best Practices
 * failure), and left the grid at the mercy of other people's uptime and
 * hotlink policies.
 *
 * Downloaded rasters are also re-encoded to a capped-size WebP, because the
 * originals are frequently far larger than the ~128px slot they render in
 * (one was a 3840x1195 PNG weighing 1.1MB).
 *
 * Runs as part of `prebuild`. games.json is committed with `logo` already
 * pointing at the local copy, so a normal build does no network work at all:
 * every logo is resolved from the manifest. Network requests only happen for a
 * newly added game, or when a file named in the manifest has gone missing.
 *
 * To add a game, add it to games.json with `logo` set to the upstream image URL
 * and run `node scripts/fetch-logos.js`; it will download, optimise and rewrite
 * the field in place.
 */

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets', 'logos');
const GAMES_JSON = path.join(__dirname, '..', 'src', 'assets', 'games.json');
const MANIFEST = path.join(__dirname, 'logo-manifest.json');
const PUBLIC_PREFIX = '/assets/logos';

const REQUEST_TIMEOUT_MS = 15000;

// Cards render the logo in a 128px-tall box, so 256px covers 2x displays.
const MAX_DIMENSION = 256;
const WEBP_QUALITY = 82;

// Some hosts reject requests without a browser-ish UA.
const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
};

const MIME_EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
  'image/ico': '.ico'
};

const ALLOWED_EXTENSIONS = new Set(Object.values(MIME_EXTENSIONS));

function isLocal(logo) {
  return typeof logo === 'string' && logo.startsWith(PUBLIC_PREFIX);
}

/**
 * Picks a file extension from the response content-type, falling back to the
 * URL path. Several logos are served from query-string image proxies
 * (e.g. /_next/image?url=...) where the path carries no usable extension.
 */
function resolveExtension(contentType, url) {
  const mime = (contentType || '').split(';')[0].trim().toLowerCase();
  if (MIME_EXTENSIONS[mime]) {
    return MIME_EXTENSIONS[mime];
  }

  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      return ext;
    }
  } catch {
    // Ignore malformed URLs; fall through to the default below.
  }

  return '.png';
}

/**
 * Pulls the highest-resolution frame out of an .ico container and returns
 * something sharp can decode.
 *
 * sharp/libvips cannot read .ico at all, and a third of the logos are favicons.
 * An ICO is just a directory of frames, each either a whole PNG or a headerless
 * DIB. Every frame across the current data set is either an embedded PNG or a
 * 32bpp BGRA DIB with a 40-byte header and no palette, so only those two cases
 * are handled; anything else returns null and keeps the original file.
 */
function decodeIco(buffer) {
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    return null;
  }

  const count = buffer.readUInt16LE(4);
  let best = null;

  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16;
    if (entry + 16 > buffer.length) {
      break;
    }

    // A zero byte in the ICO directory means 256px.
    const width = buffer[entry] || 256;
    const height = buffer[entry + 1] || 256;
    const size = buffer.readUInt32LE(entry + 8);
    const offset = buffer.readUInt32LE(entry + 12);

    if (offset + size > buffer.length) {
      continue;
    }
    if (!best || width * height > best.width * best.height) {
      best = { width, height, data: buffer.subarray(offset, offset + size) };
    }
  }

  if (!best) {
    return null;
  }

  // Frame is a complete PNG; sharp can take it directly.
  if (best.data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
    return sharp(best.data);
  }

  const headerSize = best.data.readUInt32LE(0);
  const bitsPerPixel = best.data.readUInt16LE(14);
  if (headerSize !== 40 || bitsPerPixel !== 32) {
    return null;
  }

  const pixels = best.data.subarray(headerSize);
  const expected = best.width * best.height * 4;
  if (pixels.length < expected) {
    return null;
  }

  // DIB pixels are BGRA and stored bottom-up, so swap channels and flip.
  const rgba = Buffer.allocUnsafe(expected);
  for (let i = 0; i < expected; i += 4) {
    rgba[i] = pixels[i + 2];
    rgba[i + 1] = pixels[i + 1];
    rgba[i + 2] = pixels[i];
    rgba[i + 3] = pixels[i + 3];
  }

  return sharp(rgba, {
    raw: { width: best.width, height: best.height, channels: 4 }
  }).flip();
}

/**
 * Re-encodes a raster logo to a size-capped WebP. SVGs are passed through
 * untouched since they are already resolution-independent and tiny.
 *
 * Returns the original buffer/extension if anything goes wrong or if the
 * re-encode would not actually save bytes.
 */
async function optimize(buffer, extension) {
  if (extension === '.svg') {
    return { buffer, extension };
  }

  try {
    const image =
      extension === '.ico'
        ? decodeIco(buffer)
        : sharp(buffer, { animated: extension === '.gif' });

    if (!image) {
      return { buffer, extension };
    }

    const { width, height } = await image.metadata();

    const oversized =
      (width && width > MAX_DIMENSION) || (height && height > MAX_DIMENSION);

    const optimized = await (oversized
      ? image.resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true
        })
      : image
    )
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    if (!oversized && optimized.length >= buffer.length) {
      return { buffer, extension };
    }

    return { buffer: optimized, extension: '.webp' };
  } catch (error) {
    // .ico files with unusual encodings are the usual culprit. Keeping the
    // original is fine; it just misses the size win.
    console.warn(`  ~ could not optimize (${error.message}); keeping original`);
    return { buffer, extension };
  }
}

function readManifest() {
  if (!fs.existsSync(MANIFEST)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {
    console.warn('Logo manifest was unreadable; rebuilding it from scratch.');
    return {};
  }
}

async function download(url) {
  const response = await fetch(url, {
    headers: HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error('empty response body');
  }

  return { buffer, contentType: response.headers.get('content-type') };
}

async function main() {
  if (!fs.existsSync(GAMES_JSON)) {
    console.error(`${GAMES_JSON} not found.`);
    process.exit(1);
  }

  const games = JSON.parse(fs.readFileSync(GAMES_JSON, 'utf8'));
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const manifest = readManifest();
  const nextManifest = {};

  let downloaded = 0;
  let cached = 0;
  const failures = [];

  for (const game of games) {
    const { slug, logo } = game;
    if (!slug) {
      continue;
    }

    const cachedEntry = manifest[slug];

    // A local path means this logo was already imported on an earlier run, so
    // the upstream URL it came from lives in the manifest. A remote URL means a
    // newly added game that still needs downloading.
    const source = isLocal(logo) ? cachedEntry?.source : logo;

    if (!source) {
      if (logo) {
        failures.push(`${slug}: no remote source recorded for "${logo}"`);
      }
      continue;
    }

    const reusable =
      cachedEntry &&
      cachedEntry.source === source &&
      cachedEntry.file &&
      fs.existsSync(path.join(ASSETS_DIR, cachedEntry.file));

    if (reusable) {
      game.logo = `${PUBLIC_PREFIX}/${cachedEntry.file}`;
      nextManifest[slug] = cachedEntry;
      cached++;
      continue;
    }

    try {
      const raw = await download(source);
      const { buffer, extension } = await optimize(
        raw.buffer,
        resolveExtension(raw.contentType, source)
      );
      const file = `${slug}${extension}`;

      // Remove any previous copy under a different extension.
      if (cachedEntry?.file && cachedEntry.file !== file) {
        fs.rmSync(path.join(ASSETS_DIR, cachedEntry.file), { force: true });
      }

      fs.writeFileSync(path.join(ASSETS_DIR, file), buffer);

      game.logo = `${PUBLIC_PREFIX}/${file}`;
      nextManifest[slug] = { source, file, bytes: buffer.length };
      downloaded++;
      console.log(`  ✓ ${slug} -> ${file} (${buffer.length} bytes)`);
    } catch (error) {
      // Keep the remote URL so the image still renders rather than 404s.
      game.logo = source;
      if (cachedEntry) {
        nextManifest[slug] = cachedEntry;
      }
      failures.push(`${slug}: ${error.message}`);
    }
  }

  fs.writeFileSync(GAMES_JSON, `${JSON.stringify(games, null, 2)}\n`);
  fs.writeFileSync(MANIFEST, `${JSON.stringify(nextManifest, null, 2)}\n`);

  console.log(
    `Logos: ${downloaded} downloaded, ${cached} already cached, ${failures.length} failed.`
  );

  if (failures.length) {
    console.warn('Logos still hotlinked from their original host:');
    failures.forEach(failure => console.warn(`  ! ${failure}`));
  }
}

main();
