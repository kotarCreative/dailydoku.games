import { Component, Optional } from '@angular/core';
import { Auth } from '@angular/fire/auth';

import { HeaderComponent } from '@components/header/header.component';
import { GameListComponent } from '@components/game-list/game-list.component';

@Component({
    selector: 'app-root',
    imports: [HeaderComponent, GameListComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(@Optional() private auth: Auth) {}
}
