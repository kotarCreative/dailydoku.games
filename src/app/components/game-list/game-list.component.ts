import { Component } from '@angular/core';

import { GameCardComponent } from '@components/game-card/game-card.component';
import { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';

@Component({
    selector: 'app-game-list',
    imports: [GameCardComponent],
    templateUrl: './game-list.component.html',
    styleUrl: './game-list.component.scss'
})
export class GameListComponent {
  get games() {
    return this._gamesService.games;
  }

  get resultCount(): number {
    return this.games.length;
  }

  get heading(): string {
    return this._gamesService.filterFavourites ? 'Your favourites' : 'Find your next favourite';
  }

  get showEmptySearchMessage(): boolean {
    return this.games.length === 0 && !!this._gamesService.searchTerm && !this.showEmptyFavouritesMessage;
  }

  get showEmptyFavouritesMessage(): boolean {
    const gamesService = this._gamesService;
    return (
      gamesService.filterFavourites &&
      gamesService.favouriteCount === 0 &&
      !gamesService.searchTerm
    );
  }

  constructor(private _gamesService: GamesService) {}

  onFavouriteGame(game: IGame, isFavourite: boolean) { 
    this._gamesService.favouriteGame(game, isFavourite);
  }

  clearSearch() {
    this._gamesService.setSearchTerm('');
  }

  showAllGames() {
    this._gamesService.setFilterFavourites(false);
    this._gamesService.setSearchTerm('');
  }

  isFavourite(game: IGame) {
    return this._gamesService.isFavourite(game);
  }
}
