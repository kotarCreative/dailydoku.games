import {
  effect,
  inject,
  Injectable,
  Optional,
  signal,
  WritableSignal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Analytics, logEvent } from '@angular/fire/analytics';

import Game, { IGame } from '@models/Game';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  get games(): IGame[] {
    return this._games().filter((game) => {
      if (this._filterFavourites()) {
        if (!this._favouriteGames().includes(game.name)) {
          return false;
        }
      }

      if (this._searchTerm()) {
        const searchTerm = this._searchTerm().toLowerCase();
        return game.name.toLowerCase().includes(searchTerm);
      }

      return true;
    });
  }

  get allGames(): IGame[] {
    return this._games();
  }

  get filterFavourites(): boolean {
    return this._filterFavourites();
  }

  get searchTerm(): string {
    return this._searchTerm();
  }

  private _games: WritableSignal<IGame[]> = signal([]);
  private _favouriteGames: WritableSignal<string[]> = signal([]);
  private _filterFavourites: WritableSignal<boolean> = signal(false);
  private _searchTerm: WritableSignal<string> = signal('');

  constructor(@Optional() private _analytics: Analytics) {
    this._loadGames();

    effect(() => {
      this._saveSettings(this._favouriteGames(), this._filterFavourites());
    });

    if (isPlatformBrowser(this.platformId)) {
      const savedSettings = localStorage.getItem('dailyDoku-settings');
      if (savedSettings) {
        const nextSettings = JSON.parse(savedSettings);
        this._favouriteGames.set(nextSettings.favouriteGames);
        this._filterFavourites.set(nextSettings.filterFavourites);
      }
    }
  }

  getGameBySlug(slug: string): IGame | undefined {
    return this._games().find((game) => game.slug === slug);
  }

  favouriteGame(game: IGame, isFavourite: boolean) {
    if (isFavourite) {
      if (this._analytics !== null) {
        logEvent(this._analytics, 'game_favourited', { game: game.name });
      }
      this._favouriteGames.set([...this._favouriteGames(), game.name]);
    } else {
      if (this._analytics !== null) {
        logEvent(this._analytics, 'game_unfavourited', { game: game.name });
      }
      const nextFavourites = this._favouriteGames().filter(
        (favouriteGame) => favouriteGame !== game.name
      );
      this._favouriteGames.set(nextFavourites);
    }
  }

  isFavourite(game: IGame): boolean {
    return this._favouriteGames().includes(game.name);
  }

  setFilterFavourites(filterFavourites: boolean) {
    this._filterFavourites.set(filterFavourites);
  }

  setSearchTerm(searchTerm: string) {
    this._searchTerm.set(searchTerm);
  }

  private _loadGames() {
    this.http.get<IGame[]>('/assets/games.json').subscribe({
      next: (games) => {
        const validatedGames: IGame[] = [];
        games.forEach((game) => {
          const validatedGame = Game.safeParse(game);
          if (validatedGame.success) {
            validatedGames.push(validatedGame.data);
          }
        });
        this._games.set(
          validatedGames.sort((a, b) => a.name.localeCompare(b.name))
        );
      },
      error: (err) => {
        console.error('Error loading games:', err);
      }
    });
  }

  private _saveSettings(favouriteGames: string[], filterFavourites: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      const nextSettings = {
        favouriteGames,
        filterFavourites,
      };
      localStorage.setItem('dailyDoku-settings', JSON.stringify(nextSettings));
    }
  }
}
