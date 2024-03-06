import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import type { IGame } from '@models/Game';
import Game from '@models/Game';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class GamesService {
  firestore: Firestore = inject(Firestore);

  get games(): IGame[] {
    return this._games();
  }

  private gamesCollection = collection(this.firestore, 'games');
  private _games: WritableSignal<IGame[]> = signal([]);

  constructor() {
    this._getGames();
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
        this._games.set(validatedGames.sort((a, b) => a.name.localeCompare(b.name)));
      });
  }
}
