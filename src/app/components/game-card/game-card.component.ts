import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import type { IGame }  from '@models/Game';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCardComponent {
  @Input()
  game!: IGame;

  goto() {
    window.open(this.game.url, '_blank');
  }
}
