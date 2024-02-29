import { Injectable, signal, WritableSignal } from '@angular/core';
import type { IGame } from '@models/Game';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  get games(): IGame[] {
    return this._games();
  }

  private _games: WritableSignal<IGame[]> = signal([]);

  constructor() {
    this._games.set(this._getGames());
  }

  private _getGames() {
    return [{
      uuid: '1234',
      name: 'pokedoku',
      type: 'doku',
      description: 'This game is for the best franchise ever made',
      url: 'https://pokedoku.com/',
      backgroundImage: 'https://pokedoku.com/logo_right_dark.svg'
    },
      {
        uuid: '5678',
        name: 'puckdoku',
        type: 'doku',
        description: 'Who likes hockey anyways?',
        url: 'https://puckdoku.com',
        backgroundImage: 'https://www.puckdoku.com/puckdoku-logo-white.svg'
      }
    ];
  }
}
