import {
  effect,
  inject,
  Injectable,
  Optional,
  signal,
  WritableSignal,
} from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import Game, { IGame } from '@models/Game';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class GamesService {
  get games(): IGame[] {
    return this._games().filter((game) => {
      if (this._filterFavourites()) {
        return this._favouriteGames().includes(game.name);
      }
      return true;
    });
  }

  get filterFavourites(): boolean {
    return this._filterFavourites();
  }

  firestore: Firestore = inject(Firestore);

  private gamesCollection = collection(this.firestore, 'games');
  private _games: WritableSignal<IGame[]> = signal([]);
  private _favouriteGames: WritableSignal<string[]> = signal([]);
  private _filterFavourites: WritableSignal<boolean> = signal(false);

  constructor(@Optional() private _analytics: Analytics) {
    this._getGames();
    effect(() => {
      this._saveSettings(this._favouriteGames(), this._filterFavourites());
    });

    const savedSettings = localStorage.getItem('dailyDoku-settings');
    if (savedSettings) {
      const nextSettings = JSON.parse(savedSettings);
      this._favouriteGames.set(nextSettings.favouriteGames);
      this._filterFavourites.set(nextSettings.filterFavourites);
    }
  }

  favouriteGame(game: IGame, isFavourite: boolean) {
    // Save the favourite state to the local storage
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

  isFavourite(game: IGame) {
    return this._favouriteGames().includes(game.name);
  }

  setFilterFavourites(filterFavourites: boolean) {
    this._filterFavourites.set(filterFavourites);
  }

  private _getGames() {
    this._getFirestoreGames();
  }

  private _getFirestoreGames() {
    collectionData(this.gamesCollection)
      .pipe(untilDestroyed(this))
      .subscribe((games) => {
        const typedGames = games as IGame[];
        const validatedGames: IGame[] = [];
        typedGames.forEach((game) => {
          const validatedGame = Game.safeParse(game);
          if (validatedGame.success) {
            validatedGames.push(validatedGame.data);
          }
        });
        this._games.set(
          validatedGames.sort((a, b) => a.name.localeCompare(b.name))
        );
      });
  }

  private _saveSettings(favouriteGames: string[], filterFavourites: boolean) {
    const nextSettings = {
      favouriteGames,
      filterFavourites,
    };
    localStorage.setItem('dailyDoku-settings', JSON.stringify(nextSettings));
  }
}
