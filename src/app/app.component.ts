import { Component, Optional } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from '@angular/fire/auth';

import { HeaderComponent } from '@components/header/header.component';
import { GameListComponent } from '@components/game-list/game-list.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HeaderComponent, GameListComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(@Optional() private auth: Auth) {}
}
