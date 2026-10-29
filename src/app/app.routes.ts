import { Routes } from '@angular/router';

import { HomeComponent } from '@components/home/home.component';
import { CategoryComponent } from '@components/category/category.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import { gameResolver } from './resolvers/game.resolver';
import { categoryResolver } from './resolvers/category.resolver';
import { CATEGORIES } from './site-config';
import { DISCOVERY_GUIDES } from './discovery-guides';
import { discoveryResolver } from './resolvers/discovery.resolver';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'about',
    loadComponent: () => import('@components/about/about.component').then(module => module.AboutComponent)
  },
  ...DISCOVERY_GUIDES.map(guide => ({
    path: guide.path.slice(1),
    loadComponent: () => import('@components/discovery/discovery.component').then(module => module.DiscoveryComponent),
    resolve: { resolved: discoveryResolver },
    data: { guide }
  })),
  {
    path: 'games/:slug',
    loadComponent: () => import('@components/game-detail/game-detail.component').then(module => module.GameDetailComponent),
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
