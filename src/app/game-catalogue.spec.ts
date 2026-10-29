import Game, { IGame } from './models/Game';
import { gameMatchesSearch, relatedGamesFor } from './game-catalogue';
import { DISCOVERY_GUIDES, guidesForGame } from './discovery-guides';
import { CATEGORIES } from './site-config';
import { GAME_COUNT } from './content-meta';
import gamesData from '../assets/games.json';

describe('Game discovery', () => {
  const games = Game.array().parse(gamesData);
  const bySlug = (slug: string): IGame => games.find(game => game.slug === slug)!;

  it('keeps catalogue metadata, counts and guide references consistent', () => {
    expect(GAME_COUNT).toBe(games.length);
    for (const game of games) {
      expect(game.topics?.length).withContext(game.slug).toBeGreaterThan(0);
      expect(game.mechanics?.length).withContext(game.slug).toBeGreaterThan(0);
      expect(CATEGORIES.some(category => category.type === game.type)).toBeTrue();
    }
    for (const guide of DISCOVERY_GUIDES) {
      expect(new Set(guide.picks.map(pick => pick.slug)).size).toBe(guide.picks.length);
      expect(guide.picks.every(pick => !!bySlug(pick.slug))).toBeTrue();
    }
  });

  it('recommends actual letter-guessing games for Wordle, not music or gaming trivia', () => {
    const related = relatedGamesFor(bySlug('wordle'), games);
    expect(related.length).toBe(4);
    expect(related.every(game => game.mechanics?.includes('letter-guessing'))).toBeTrue();
    expect(related.some(game => ['bandle', 'brawldly', 'wordle'].includes(game.slug))).toBeFalse();
    expect(relatedGamesFor(bySlug('wordle'), [...games].reverse())).toEqual(related);
  });

  it('prioritises the shared grouping mechanic for Connections', () => {
    const related = relatedGamesFor(bySlug('connections'), games);
    expect(related[0].slug).toBe('cluster');
    expect(related.map(game => game.slug)).not.toContain('canuckle');
    expect(related.map(game => game.slug)).toContain('strands');
  });

  it('finds the most relevant hockey grid rather than the first alphabetical grid', () => {
    expect(relatedGamesFor(bySlug('puckdoku'), games)[0].slug).toBe('immaculate-grid-hockey');
  });

  it('supports untagged entries and never recommends the current game', () => {
    const a = { ...bySlug('wordle'), topics: undefined, mechanics: undefined };
    const b = { ...bySlug('canuckle'), topics: undefined, mechanics: undefined };
    expect(relatedGamesFor(a, [a, b])).toEqual([b]);
    expect(relatedGamesFor(a, [a])).toEqual([]);
  });

  it('searches descriptions, topics and human-readable mechanics', () => {
    expect(gameMatchesSearch(bySlug('bandle'), 'music')).toBeTrue();
    expect(gameMatchesSearch(bySlug('wordle'), 'letter guessing')).toBeTrue();
    expect(gameMatchesSearch(bySlug('wordle'), 'word')).toBeTrue();
    expect(gameMatchesSearch(bySlug('bandle'), 'musicians')).toBeTrue();
    expect(gameMatchesSearch(bySlug('wordle'), '   ')).toBeTrue();
    expect(gameMatchesSearch(bySlug('wordle'), 'geography')).toBeFalse();
  });

  it('links the original games and selected alternatives to their relevant guides', () => {
    expect(guidesForGame('wordle').map(guide => guide.path)).toContain('/games-like-wordle');
    expect(guidesForGame('connections').map(guide => guide.path)).toContain('/games-like-connections');
    expect(guidesForGame('bandle')).toEqual([]);
  });
});
