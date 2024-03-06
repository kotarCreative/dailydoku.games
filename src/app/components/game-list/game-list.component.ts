import { Component } from '@angular/core';

import { GameCardComponent } from '@components/game-card/game-card.component';
import { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [GameCardComponent],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.scss'
})
export class GameListComponent {
  get games() {
    return this._gamesService.games;
  }

  constructor(private _gamesService: GamesService) {}

  onFavouriteGame(game: IGame, isFavourite: boolean) { 
    this._gamesService.favouriteGame(game, isFavourite);
  }

  isFavourite(game: IGame) {
    return this._gamesService.isFavourite(game);
  }
}
