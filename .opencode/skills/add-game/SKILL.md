---
name: add-game
description: Add a new daily puzzle game to dailydoku.games. Use when the user asks to add a game, register a new entry, or update the catalogue. Automates games.json, logo download/optimization, the logo manifest, and sitemap regeneration.
---

# Add a game to dailydoku.games

This skill walks through the canonical, repeatable workflow for adding a game to the catalogue. The project keeps the game list in `src/assets/games.json`, hosts its own logos under `src/assets/logos/`, and regenerates `src/sitemap.xml` from `games.json`. Two helper scripts do the heavy lifting:

- `scripts/fetch-logos.js` — downloads upstream logos, re-encodes them to a size-capped WebP (or keeps SVGs), writes them to `src/assets/logos/`, rewrites the `logo` field in `games.json`, and records the upstream source in `scripts/logo-manifest.json`.
- `scripts/generate-sitemap.js` — reads `games.json` and writes `src/sitemap.xml` with one `<url>` entry per game.

## Steps

1. **Find the game details.**
   - `name` — display name, title-cased (e.g. `Pixeal`).
   - `slug` — kebab-case, unique, used in the detail URL (e.g. `pixeal`).
   - `type` — one of the existing category strings: `doku`, `oodle`, `trivia`, `puzzle`.
   - `url` — the game link. Use `https://<domain>/?ref=daily-doku` when the site supports a referrer query string; otherwise just use the canonical URL.
   - `logo` — the upstream logo URL. Prefer a real image file (PNG/JPG/WebP/SVG) over an inline data URI. If the only option is the site's `og.png`, that is fine.
   - `description` — one short sentence describing how to play.

2. **Insert the entry into `src/assets/games.json`.**
   - Add the game in alphabetical order by `name`.
   - Set the `logo` field to the **upstream URL**, not a local path. `fetch-logos.js` will rewrite it later.

   Example:
   ```json
   {
     "name": "Pixeal",
     "slug": "pixeal",
     "type": "puzzle",
     "url": "https://pixeal.gg/?ref=daily-doku",
     "logo": "https://pixeal.gg/og.png",
     "description": "A pixel-art picture hides under the board. Draw it out, reveal as little as you can, and name it."
   }
   ```

3. **Download and optimize the logo.**
   ```bash
   node scripts/fetch-logos.js
   ```
   - The script will emit `✓ <slug> -> <file> (<bytes> bytes)` for a successful download.
   - It will also report any games whose logos could not be fetched (they stay hotlinked). Do not silently ignore failures; tell the user which games failed and why.
   - Do **not** manually copy images into `src/assets/logos/` or hand-edit the `logo` field to a local path before running the script.

4. **Regenerate the sitemap.**
   ```bash
   node scripts/generate-sitemap.js
   ```
   - This overwrites `src/sitemap.xml` with the correct `<lastmod>`, `<priority>`, and `<changefreq>` for every game.
   - Do not hand-edit `sitemap.xml`; always regenerate it from `games.json`.

5. **Verify the result.**
   - Confirm the new logo file exists in `src/assets/logos/` (usually `<slug>.webp`).
   - Confirm `src/assets/games.json` now points the game's `logo` at `/assets/logos/<slug>.webp` (or `.svg`/`.png` if the optimizer kept the original format).
   - Confirm `scripts/logo-manifest.json` has an entry for the slug recording the upstream `source` and local `file`.
   - Confirm `src/sitemap.xml` contains `/games/<slug>`.
   - Run the build to catch schema or asset issues:
     ```bash
     npm run build
     ```

## What not to do

- Do not add the logo directly to `src/assets/logos/` and then point `games.json` at it manually — that bypasses optimization and leaves the manifest out of sync.
- Do not edit `src/sitemap.xml` by hand; the generator is the source of truth.
- Do not run `git commit`/`git push` unless the user explicitly asks for it.

## Troubleshooting

- **Logo download fails** — check whether the URL blocks non-browser requests. `fetch-logos.js` already sends a browser-like `User-Agent`, but some hosts still return 403. In that case, try a different logo URL (e.g. `og.png` or `favicon.ico`), or leave it hotlinked and note the failure to the user.
- **Build budget warning** — unrelated to adding a single game; do not address it as part of this task.
- **`node_modules` is missing** — run `npm install` first.
