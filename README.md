# DailydokuGames

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## SEO and discovery content

- `src/assets/games.json` is the catalogue. Use `topics` (such as `music` or
  `geography`) and `mechanics` (such as `letter-guessing` or `trivia-grid`) for
  search and relevant related-game recommendations. Existing tag names can be
  reused across primary categories. Keep game names and slugs stable so saved
  favourites and existing links continue to work.
- `src/discovery-guides.json` contains curated comparison guides, including the
  original game's `sourceSlug`, selected games and the reason for each pick.
  Routes, prerendering, homepage links and sitemap entries use this same file.
  Missing games or duplicate picks fail the build rather than publishing broken
  guides. Comparisons should describe actual differences, not invented ratings,
  first-hand testing claims or unverified reset times.
- `src/site.config.json` accepts `{gameCount}` in the site title and descriptions.
  The build generates the count from the catalogue; do not edit
  `src/app/content-meta.ts`, `src/sitemap.xml` or `src/llms.txt` by hand.

Run `npm run test:seo` for sitemap/guide validation. After `npm run build`, run
`npm run check:seo` to check every prerendered page for unique titles, canonicals,
one H1, descriptions, valid JSON-LD, working internal links and a noindex 404.
For the browser unit suite: `CHROME_BIN=/usr/bin/chromium npm test -- --watch=false --browsers=ChromeHeadless`.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
