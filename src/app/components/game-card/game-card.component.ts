import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  Optional,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';

import type { IGame } from '@models/Game';

@Component({
    selector: 'app-game-card',
    imports: [RouterLink],
    templateUrl: './game-card.component.html',
    styleUrl: './game-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCardComponent {
  private platformId = inject(PLATFORM_ID);

  @Input()
  game!: IGame;

  @Input()
  isFavourite!: boolean;

  @Output()
  favouriteGame = new EventEmitter<boolean>();

  constructor(@Optional() private _analytics: Analytics) {}

  goto() {
    if (isPlatformBrowser(this.platformId)) {
      if (this._analytics) {
        logEvent(this._analytics, 'game_clicked', { game: this.game.name });
      }
      window.open(this.game.url, '_blank');
    }
  }

  onFavouriteGame() {
    this.favouriteGame.emit(!this.isFavourite);
  }
}
