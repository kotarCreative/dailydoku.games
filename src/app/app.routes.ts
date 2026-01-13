import { Routes } from '@angular/router';

import { HomeComponent } from '@components/home/home.component';
import { GameDetailComponent } from '@components/game-detail/game-detail.component';
import { gameResolver } from './resolvers/game.resolver';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'games/:slug', 
    component: GameDetailComponent,
    resolve: { game: gameResolver }
  },
  { path: '**', redirectTo: '' }
];
