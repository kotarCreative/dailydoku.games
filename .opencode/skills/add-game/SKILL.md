---
name: add-game
description: Add a new daily puzzle game to dailydoku.games. Use when the user asks to add a game, register a new entry, work through the pending game suggestions, or update the catalogue. Reads pending suggestions from Firestore and automates games.json, logo download/optimization, the logo manifest, and sitemap regeneration.
---

# Add a game to dailydoku.games

This skill walks through the canonical, repeatable workflow for adding a game to the catalogue. The project keeps the game list in `src/assets/games.json`, hosts its own logos under `src/assets/logos/`, and regenerates `src/sitemap.xml` from `games.json`. Three helper scripts do the heavy lifting:

- `scripts/list-suggestions.js` — reads the pending game suggestions visitors submitted through the site's "suggest a game" dialog (the Firestore `suggestions` collection) and flags which ones are not yet in the catalogue.
- `scripts/fetch-logos.js` — downloads upstream logos, re-encodes them to a size-capped WebP (or keeps SVGs), writes them to `src/assets/logos/`, rewrites the `logo` field in `games.json`, and records the upstream source in `scripts/logo-manifest.json`.
- `scripts/generate-sitemap.js` — reads `games.json` and writes `src/sitemap.xml` with one `<url>` entry per game.

## Steps

1. **Find what to add.**
   - The usual source is the pending suggestions. Run:
     ```bash
     node scripts/list-suggestions.js
     ```
     Each row is marked `NEW` (not in the catalogue) or `listed` (already added). Work from the `NEW` rows — see [Reading the suggestions](#reading-the-suggestions) for details, credentials and failure modes.
   - Only add suggestions that are genuine daily puzzle/game sites matching the catalogue's categories. Skip anything irrelevant, spammy, dead, or paywalled, and tell the user what you skipped and why.
   - If several suggestions are new, the user may want to pick a subset. When the intent is ambiguous, list the `NEW` rows and confirm which to add before editing `games.json`.
   - If the user names a specific game instead, skip the script and work from that.

2. **Fill in the game details.** Suggestions only carry a `name` and a `url`, so derive the rest:
   - `name` — display name, title-cased (e.g. `Pixeal`). Keep the suggestion's spelling unless it is clearly wrong.
   - `slug` — kebab-case, unique, used in the detail URL (e.g. `pixeal`). Derive from the name and check it does not already exist in `games.json`.
   - `type` — one of the existing category strings: `doku`, `oodle`, `trivia`, `puzzle`. Pick by how the game plays.
   - `url` — the game link. Strip tracking parameters (e.g. `utm_source=...`) and use `https://<domain>/?ref=daily-doku` when the site supports a referrer query string; otherwise use the canonical URL.
   - `logo` — the upstream logo URL. Prefer a real image file (PNG/JPG/WebP/SVG) over an inline data URI. If the only option is the site's `og.png`, that is fine.
   - `description` — one short sentence describing how to play (no trailing period), shown on the game card. Visit the site if the suggestion does not make the rules obvious.
   - `about` — the longer prose on the game detail page: two short paragraphs separated by a blank line (`\n\n`). The first explains what the game is; the second covers how a round plays and how the daily reset works. It is optional in the schema but every existing game has one, so always write it.

3. **Insert the entry into `src/assets/games.json`.**
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
     "description": "A pixel-art picture hides under the board. Draw it out, reveal as little as you can, and name it.",
     "about": "Pixeal hides a pixel-art picture under a grid of tiles. Each tile you uncover costs points, so the game is a tug-of-war between seeing enough to guess the subject and keeping your reveal as small as possible.\n\nType what you think is hidden and a correct answer ends the round, with your score rewarding restraint over brute force. A new picture is drawn every day."
   }
   ```
   - Write `about` as a single JSON string containing two paragraphs joined by `\n\n`.

4. **Download and optimize the logo.**
   ```bash
   node scripts/fetch-logos.js
   ```
   - The script will emit `✓ <slug> -> <file> (<bytes> bytes)` for a successful download.
   - It will also report any games whose logos could not be fetched (they stay hotlinked). Do not silently ignore failures; tell the user which games failed and why.
   - Do **not** manually copy images into `src/assets/logos/` or hand-edit the `logo` field to a local path before running the script.

5. **Regenerate the sitemap.**
   ```bash
   node scripts/generate-sitemap.js
   ```
   - This overwrites `src/sitemap.xml` with the correct `<lastmod>`, `<priority>`, and `<changefreq>` for every game.
   - Do not hand-edit `sitemap.xml`; always regenerate it from `games.json`.

6. **Verify the result.**
   - Confirm the new logo file exists in `src/assets/logos/` (usually `<slug>.webp`).
   - Confirm `src/assets/games.json` now points the game's `logo` at `/assets/logos/<slug>.webp` (or `.svg`/`.png` if the optimizer kept the original format).
   - Confirm `scripts/logo-manifest.json` has an entry for the slug recording the upstream `source` and local `file`.
   - Confirm `src/sitemap.xml` contains `/games/<slug>`.
   - Re-run `node scripts/list-suggestions.js` and confirm the games you just added now read `listed` rather than `NEW`.
   - Run the build to catch schema or asset issues:
     ```bash
     npm run build
     ```

## Reading the suggestions

Suggestions are written by the site's dialog to the Firestore `suggestions` collection (see `src/app/services/suggestions.service.ts`). Each document is `{ suggestion: { name, url } }`.

```bash
node scripts/list-suggestions.js          # human-readable table, NEW vs listed
node scripts/list-suggestions.js --json   # machine-readable JSON
```

The script matches each suggestion against `games.json` by normalised URL, name and slug, so a `listed` marker means it is already in the catalogue and can be ignored.

Reading the collection needs Firestore admin credentials. The script authenticates with the Firebase **service-account key kept at the repo root** (gitignored — e.g. `dailydoku-31cec-<id>.json`). It discovers credentials from `$GOOGLE_APPLICATION_CREDENTIALS`, or otherwise from any `*.json` service-account key in the repo root. There is no `firebase-admin` dependency: the key mints an OAuth token and the Firestore REST API is called directly.

- If the script reports **no service-account key found**, tell the user the key is missing from the repo root; do not attempt to create or download one yourself.
- Adding a game does **not** remove or mark the suggestion. The script will list it as `listed` on the next run, which is expected.

## What not to do

- Do not add the logo directly to `src/assets/logos/` and then point `games.json` at it manually — that bypasses optimization and leaves the manifest out of sync.
- Do not edit `src/sitemap.xml` by hand; the generator is the source of truth.
- Do not add every `NEW` suggestion blindly — filter out non-games, dead links and spam, and report what you skipped.
- Do not run `git commit`/`git push` unless the user explicitly asks for it.

## Troubleshooting

- **No service-account key found** — the read step needs the Firebase service-account JSON at the repo root. Ask the user to place it there (it is gitignored); do not fabricate credentials. The rest of the workflow can still proceed for any game the user names explicitly.
- **Firestore query fails with HTTP 403/404** — the key may be for the wrong project or lack the datastore scope; report the error rather than retrying.
- **Logo download fails** — check whether the URL blocks non-browser requests. `fetch-logos.js` already sends a browser-like `User-Agent`, but some hosts still return 403. In that case, try a different logo URL (e.g. `og.png` or `favicon.ico`), or leave it hotlinked and note the failure to the user.
- **Logo download fails with HTTP 429 (bot checkpoint)** — hosts behind a Vercel (or similar) security checkpoint reject every non-browser request, including via image proxies, so a hotlinked logo will also fail for visitors who have never passed the challenge. Fetch the image in a real browser instead (headless Chromium via Playwright: load the page so the challenge sets its cookie, then `fetch()` the image URL from the page context), then import the bytes through the same optimizer and add the manifest entry yourself:
  ```js
  const webp = await sharp(bytes).webp({ quality: 82 }).toBuffer();
  // write src/assets/logos/<slug>.webp, point games.json at it,
  // and record { source, file, bytes } in scripts/logo-manifest.json
  ```
  Re-running `fetch-logos.js` afterwards should report `0 failed` with the logo cached.
- **Build budget warning** — unrelated to adding a single game; do not address it as part of this task.
- **`node_modules` is missing** — run `npm install` first.
