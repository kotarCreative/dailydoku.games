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
