import { IGame } from './models/Game';
import { gameTypeLabel } from './site-config';
import { guidesForGame } from './discovery-guides';

/** Search the same vocabulary on the homepage and category pages. */
export function gameMatchesSearch(game: IGame, query: string): boolean {
  const term = query.trim().toLowerCase();
  return !term || [
    game.name,
    game.description,
    game.type,
    gameTypeLabel(game.type),
    ...(game.topics ?? []).map(value => value.replace(/-/g, ' ')),
    ...(game.mechanics ?? []).map(value => value.replace(/-/g, ' '))
  ].some(value => value.toLowerCase().includes(term));
}

/** Mechanics matter more than broad topics; alphabetical order only breaks ties. */
export function relatedGamesFor(game: IGame, games: IGame[], limit = 4): IGame[] {
  const shared = (a: string[] = [], b: string[] = []) => a.filter(value => b.includes(value)).length;
  const curatedPeers = new Set(guidesForGame(game.slug)
    .flatMap(guide => [guide.sourceSlug, ...guide.picks.map(pick => pick.slug)]));
  const ranked = games
    .filter(candidate => candidate.slug !== game.slug)
    .map(candidate => ({
      game: candidate,
      score: shared(game.mechanics, candidate.mechanics) * 8
        + shared(game.topics, candidate.topics) * 3
        + (curatedPeers.has(candidate.slug) ? 2 : 0)
        + (candidate.type === game.type ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score || a.game.name.localeCompare(b.game.name));

  const relevant = ranked.filter(candidate => candidate.score > 1);
  // Older/new entries without tags can still offer same-category suggestions.
  return (relevant.length ? relevant : ranked.filter(candidate => candidate.score === 1))
    .slice(0, limit)
    .map(candidate => candidate.game);
}
