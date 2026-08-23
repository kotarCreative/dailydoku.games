import { Routes } from '@angular/router';

import { HomeComponent } from '@components/home/home.component';
import { GameDetailComponent } from '@components/game-detail/game-detail.component';
import { CategoryComponent } from '@components/category/category.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import { gameResolver } from './resolvers/game.resolver';
import { categoryResolver } from './resolvers/category.resolver';
import { CATEGORIES } from './site-config';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'games/:slug',
    component: GameDetailComponent,
    resolve: { game: gameResolver }
  },
  // One hub route per category; the config travels in route data so the
  // resolver and component stay generic.
  ...CATEGORIES.map((category) => ({
    path: category.path.slice(1),
    component: CategoryComponent,
    resolve: { resolved: categoryResolver },
    data: { category }
  })),
  { path: '**', component: NotFoundComponent }
];
