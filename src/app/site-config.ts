import siteConfig from '../site.config.json';

export const SITE_NAME = siteConfig.siteName;
export const SITE_URL = siteConfig.siteUrl;
export const TWITTER_HANDLE = siteConfig.twitterHandle;
export const DEFAULT_TITLE = siteConfig.title;
export const DEFAULT_DESCRIPTION = siteConfig.description;
export const DEFAULT_KEYWORDS = siteConfig.keywords;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

/** Builds an absolute URL from a root-relative path. */
export function absoluteUrl(path = '/'): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/**
 * Absolutises an asset path for use in og:image / schema.org, where relative
 * URLs are not reliably resolved by crawlers and social scrapers.
 *
 * Game logos are normally self-hosted under /assets/logos, but a logo whose
 * host blocks our build-time download stays as a remote URL, so both shapes
 * have to be handled.
 */
export function absoluteAssetUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

/**
 * Search-friendly labels for the internal `type` values used in games.json.
 * The raw values ("oodle", "doku") are internal jargon and make for poor page
 * titles and keywords, so they are mapped to terms people actually search for.
 */
interface GameTypeLabel {
  /** Single word shown on badges, where it is only a hint at the genre. */
  short: string;
  /** Long form used in page titles and meta descriptions. */
  label: string;
  /** Plural long form used in prose. */
  plural: string;
}

const GAME_TYPE_LABELS: Record<string, GameTypeLabel> = {
  oodle: { short: 'Word', label: 'Daily Word Game', plural: 'daily word games' },
  doku: { short: 'Grid', label: 'Daily Grid Puzzle', plural: 'daily grid puzzles' },
  trivia: { short: 'Trivia', label: 'Daily Trivia Game', plural: 'daily trivia games' },
  puzzle: { short: 'Puzzle', label: 'Daily Puzzle', plural: 'daily puzzles' }
};

const FALLBACK_TYPE_LABEL: GameTypeLabel = {
  short: 'Puzzle',
  label: 'Daily Puzzle',
  plural: 'daily puzzles'
};

/**
 * One-word genre hint for badges. Kept separate from `gameTypeLabel` so the
 * keyword-rich long form can stay in titles/meta without bloating the UI.
 */
export function gameTypeShortLabel(type?: string): string {
  return typeLabels(type).short;
}

/** Normalises a raw game type, tolerating inconsistent casing in the data. */
export function gameTypeLabel(type?: string): string {
  return typeLabels(type).label;
}

export function gameTypePlural(type?: string): string {
  return typeLabels(type).plural;
}

function typeLabels(type?: string): GameTypeLabel {
  const key = (type ?? '').trim().toLowerCase();
  return GAME_TYPE_LABELS[key] ?? FALLBACK_TYPE_LABEL;
}

/**
 * Category hub pages. Each maps a crawlable URL to one internal game `type`,
 * giving the site ranking surfaces for genre queries ("daily word games")
 * that individual game pages cannot win.
 */
export interface CategoryConfig {
  /** URL path of the hub page. */
  path: string;
  /** Internal game type this category collects. */
  type: string;
  /** Page heading (h1). */
  heading: string;
  /** Meta/OG title. */
  title: string;
  /** Meta description and intro paragraph source. */
  description: string;
  /** Extra prose rendered under the heading for on-page content. */
  intro: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    path: '/word-games',
    type: 'oodle',
    heading: 'Daily Word Games',
    title: 'Daily Word Games - Free Word Puzzles to Play Every Day | DailyDoku',
    description:
      'Play the best free daily word games in one place. Wordle, Quordle, Contexto, Heardle and 20+ more daily word puzzles, all free and refreshed every morning.',
    intro:
      'One new puzzle per day is what makes these games addictive - everyone plays the same challenge, so scores and streaks actually mean something. This collection gathers the best daily word games on the web, from classic five-letter guessing to semantic hunts, song intros and themed variants.',
  },
  {
    path: '/grid-puzzles',
    type: 'doku',
    heading: 'Daily Grid Puzzles',
    title: 'Daily Grid Puzzles - Free Trivia Grids & Sudoku-Style Games | DailyDoku',
    description:
      'Free daily grid puzzles for sports, movies, music and gaming fans. Immaculate Grid, Pokedoku, HoopGrids and more trivia grids, updated every day.',
    intro:
      'Fill every cell without repeats and you have earned your daily bragging rights. These trivia grids cross two criteria per square, testing whether you really remember who played where, which films qualify and which Pokémon fit the bill.',
  },
  {
    path: '/trivia-games',
    type: 'trivia',
    heading: 'Daily Trivia Games',
    title: 'Daily Trivia Games - Free Geography, Music & Quiz Puzzles | DailyDoku',
    description:
      'Test yourself with free daily trivia games. Geography guessing, photo dating, box office history and more quiz games with a fresh round every day.',
    intro:
      'Every day brings a fresh set of questions the whole internet answers together. Guess countries from photos, date historic images or rebuild decades-old charts - these daily trivia games turn general knowledge into a habit.',
  },
  {
    path: '/puzzles',
    type: 'puzzle',
    heading: 'Daily Puzzles',
    title: 'Daily Puzzles - Free Logic, Word & Jigsaw Games Every Day | DailyDoku',
    description:
      'Solve a new free puzzle every day. Connections, Strands, Spelling Bee, Murdle, Waffle and more daily logic and word puzzles, all in one place.',
    intro:
      'Logic grids, hidden themes, murder mysteries and jigsaws: these daily puzzles reward careful thinking over fast fingers. Like everything here, they are free, browser-based and refresh once a day so your streak stays honest.',
  },
];

/** Looks up a category config by its URL path. */
export function categoryByPath(path: string): CategoryConfig | undefined {
  return CATEGORIES.find((category) => category.path === path);
}
