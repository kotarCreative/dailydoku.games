import {
  effect,
  inject,
  Injectable,
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
  firestore: Firestore = inject(Firestore);

  get games(): IGame[] {
    return this._games();
  }

  private _analytics = inject(Analytics);
  private gamesCollection = collection(this.firestore, 'games');
  private _games: WritableSignal<IGame[]> = signal([]);
  private _favouriteGames: WritableSignal<string[]> = signal([]);

  constructor() {
    this._getGames();
    effect(() => {
      localStorage.setItem(
        'dailyDoku-favouriteGames',
        JSON.stringify(this._favouriteGames())
      );
    });

    const savedFavouriteGames = localStorage.getItem(
      'dailyDoku-favouriteGames'
    );
    if (savedFavouriteGames) {
      this._favouriteGames.set(JSON.parse(savedFavouriteGames));
    }
  }

  favouriteGame(game: IGame, isFavourite: boolean) {
    // Save the favourite state to the local storage
    if (isFavourite) {
      logEvent(this._analytics, 'game_favourited', { game: game.name });
      this._favouriteGames.set([...this._favouriteGames(), game.name]);
    } else {
      logEvent(this._analytics, 'game_unfavourited', { game: game.name });
      const nextFavourites = this._favouriteGames().filter(
        (favouriteGame) => favouriteGame !== game.name
      );
      this._favouriteGames.set(nextFavourites);
    }
  }

  isFavourite(game: IGame) {
    return this._favouriteGames().includes(game.name);
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
}
