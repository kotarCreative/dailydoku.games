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
      description: 'Fill the doku with pokemon that match types and other stats',
      url: 'https://pokedoku.com/',
      logo: 'https://pokedoku.com/logo_right_dark.svg'
    },
      {
        uuid: '5678',
        name: 'puckdoku',
        type: 'doku',
        description: 'Fill the doku with hockey players that match teams and other stats',
        url: 'https://puckdoku.com',
        logo: 'https://www.puckdoku.com/favicon.ico'
      },
      {
        uuid: '91011',
        name: 'cine2nerdle',
        type: 'doku',
        description: 'Try to solve what topics match a specific movie',
        url: 'https://www.cinenerdle2.app/',
        logo: 'https://www.cinenerdle2.app/icon.png'
      },
      {
        uuid: '121314',
        name: 'Worldle',
        type: 'oodle',
        description: 'Try to guess the country from a picture of its silhouette',
        url: 'https://worldle.teuteuf.fr/',
        logo: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f30e.png'
      },
      {
        uuid: '151617',
        name: 'Globle',
        type: 'trivia',
        description: 'Try to guess the country from a picture of its silhouette',
        url: 'https://globle-game.com/game',
        logo: 'https://globle-game.com/favicon.ico'
      },
      {
        uuid: '181920',
        name: 'Heardle',
        type: 'oodle',
        description: 'Try to guess the song from a small snippet of the song',
        url: 'https://heardlewordle.io/',
        logo: 'https://heardlewordle.io/cache/data/image/options/heardle-game2-m60x60.png'
      },
      {
        uuid: '212223',
        name: 'Filmdle',
        type: 'oodle',
        description: 'Try to guess the movie from the tagline and other hints',
        url: 'https://heardlewordle.io/filmdle',
        logo: 'https://heardlewordle.io/cache/data/image/game/filmdle-m228x151.png'
      },
      {
        uuid: '242526',
        name: 'Pokedle',
        type: 'oodle',
        description: 'Try to guess the pokemons name from clues given when guessing other pokemon',
        url: 'https://pokedle.com/classic',
        logo: 'https://pokedle.com/assets/pokedle-logo-Bg91LnfX.png'
      }
    ];
  }
}
