import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { GameListComponent } from '@components/game-list/game-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dailydoku.games';
}
