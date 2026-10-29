import siteConfig from '../site.config.json';
import { GAME_COUNT } from './content-meta';

export const SITE_NAME = siteConfig.siteName;
export const SITE_URL = siteConfig.siteUrl;
export const TWITTER_HANDLE = siteConfig.twitterHandle;
export const DEFAULT_TITLE = siteConfig.title.replace('{gameCount}', String(GAME_COUNT));
export const DEFAULT_DESCRIPTION = siteConfig.description.replace('{gameCount}', String(GAME_COUNT));
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
      'Discover daily word games, from Wordle and Quordle to Connections, crosswords and word searches. Compare the rules and find your next word puzzle.',
    intro:
      'Find a daily word puzzle that fits your mood: guess letters in Wordle, follow meaning in Contexto, group words in Connections or tackle a bite-sized crossword. These games focus on words and language; music and geography guessing live in our trivia collection.',
  },
  {
    path: '/grid-puzzles',
    type: 'doku',
    heading: 'Daily Grid Puzzles',
    title: 'Daily Grid Puzzles - Sports, Movie & Trivia Grids | DailyDoku',
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
      'Discover daily trivia games for geography, music, movies, gaming and general knowledge. Compare photo puzzles, song guessing and daily quizzes.',
    intro:
      'Put your knowledge to work with a new challenge: recognise a song in Bandle, identify a film in Framed, guess a country in Worldle or tackle a general-knowledge quiz. This collection includes music, geography, movies, history and gaming trivia, not just traditional question-and-answer rounds.',
  },
  {
    path: '/puzzles',
    type: 'puzzle',
    heading: 'Daily Puzzles',
    title: 'Daily Logic & Visual Puzzles - Mysteries, Paths & More | DailyDoku',
    description:
      'Discover daily logic and visual puzzles: Murdle mysteries, arrow escape challenges, path puzzles and colour memory games. Find a new daily challenge.',
    intro:
      'Prefer deduction, patterns or visual challenges to trivia? Explore murder mysteries, arrow escape boards, path puzzles, colour memory tests and jigsaws. For crosswords, word searches and letter guessing, visit our daily word games collection.',
  },
];

/** Looks up a category config by its URL path. */
export function categoryByPath(path: string): CategoryConfig | undefined {
  return CATEGORIES.find((category) => category.path === path);
}
