import { Component } from '@angular/core';

import { GameCardComponent } from '@components/game-card/game-card.component';
import { GamesService } from '@services/games-service.service';

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
}
