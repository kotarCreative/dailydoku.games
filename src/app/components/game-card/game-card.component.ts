import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  Optional,
} from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

import type { IGame } from '@models/Game';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCardComponent {
  @Input()
  game!: IGame;

  @Input()
  isFavourite!: boolean;

  @Output()
  favouriteGame = new EventEmitter<boolean>();

  constructor(@Optional() private _analytics: Analytics) {}

  goto() {
    logEvent(this._analytics, 'game_clicked', { game: this.game.name });
    window.open(this.game.url, '_blank');
  }

  onFavouriteGame() {
    this.favouriteGame.emit(!this.isFavourite);
  }
}
