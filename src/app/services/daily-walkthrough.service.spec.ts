import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { GamesService } from './games.service';
import { DailyWalkthroughService } from './daily-walkthrough.service';
import { IGame } from '@models/Game';

describe('DailyWalkthroughService async catalogue initialization', () => {
  const game = (name: string): IGame => ({ name, slug: name.toLowerCase(), type: 'puzzle', url: `https://${name}.test`, logo: '', description: '' });
  let games: ReturnType<typeof signal<IGame[]>>;
  let favourites: ReturnType<typeof signal<string[]>>;
  let service: DailyWalkthroughService;

  beforeEach(() => {
    localStorage.removeItem('dailyDoku-walkthrough');
    games = signal<IGame[]>([]);
    favourites = signal<string[]>([]);
    TestBed.configureTestingModule({ providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: GamesService, useValue: {
        get allGames() { return games(); },
        isFavourite: (g: IGame) => favourites().includes(g.name),
      } }
    ] });
    service = TestBed.inject(DailyWalkthroughService);
  });

  afterEach(() => { localStorage.removeItem('dailyDoku-walkthrough'); TestBed.resetTestingModule(); });

  it('creates the session once asynchronously loaded catalogue and favourites arrive', async () => {
    games.set([game('Alpha'), game('Beta')]);
    favourites.set(['Alpha', 'Beta']);
    TestBed.flushEffects();
    expect(service.session()?.games).toEqual(jasmine.arrayContaining(['Alpha', 'Beta']));
    service.startDailySession();
    expect(service.isActive()).toBeTrue();
  });

  it('resets yesterday’s session after the catalogue arrives', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    localStorage.setItem('dailyDoku-walkthrough', JSON.stringify({
      session: { date: yesterday, games: ['Alpha'], completedGames: ['Alpha'], startTime: 1, endTime: 2 },
      streak: 3
    }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: GamesService, useValue: { get allGames() { return games(); }, isFavourite: (g: IGame) => favourites().includes(g.name) } }
    ] });
    service = TestBed.inject(DailyWalkthroughService);
    games.set([game('Alpha')]); favourites.set(['Alpha']); TestBed.flushEffects();
    expect(service.session()?.date).toBe(new Date().toISOString().slice(0, 10));
    expect(service.session()?.completedGames).toEqual([]);
    expect(service.streak()).toBe(3);
  });

  it('does not count a second streak day when adding another favourite today', () => {
    games.set([game('Alpha'), game('Beta')]); favourites.set(['Alpha']); TestBed.flushEffects();
    service.completeGame('Alpha');
    expect(service.streak()).toBe(1);
    favourites.set(['Alpha', 'Beta']); TestBed.flushEffects();
    service.completeGame('Beta');
    expect(service.streak()).toBe(1);
  });

  it('does not mark a game outside the daily routine as visited', () => {
    games.set([game('Alpha')]); favourites.set(['Alpha']); TestBed.flushEffects();
    service.completeGame('Unknown game');
    expect(service.session()?.completedGames).toEqual([]);
    expect(service.streak()).toBe(0);
  });

  it('does not replace a restored session while the initial catalogue is empty', async () => {
    const today = new Date().toISOString().split('T')[0];
    const restored = { date: today, games: ['Beta', 'Alpha'], completedGames: ['Beta'], startTime: 123 };
    localStorage.setItem('dailyDoku-walkthrough', JSON.stringify({ session: restored, streak: 3 }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: GamesService, useValue: { get allGames() { return games(); }, isFavourite: (g: IGame) => favourites().includes(g.name) } }
    ] });
    service = TestBed.inject(DailyWalkthroughService);
    games.set([game('Alpha'), game('Beta')]); favourites.set(['Alpha', 'Beta']); TestBed.flushEffects();
    expect(service.session()).toEqual(restored);
  });
});
