import { RenderMode, ServerRoute } from '@angular/ssr';

import gamesData from '../assets/games.json';
import { CATEGORIES } from './site-config';
import { DISCOVERY_GUIDES } from './discovery-guides';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'games/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return gamesData.map((game: { slug: string }) => ({ slug: game.slug }));
    },
  },
  { path: 'about', renderMode: RenderMode.Prerender },
  ...DISCOVERY_GUIDES.map((guide): ServerRoute => ({
    path: guide.path.slice(1), renderMode: RenderMode.Prerender
  })),
  // Category hubs are a fixed set of static paths.
  ...CATEGORIES.map(
    (category): ServerRoute => ({
      path: category.path.slice(1),
      renderMode: RenderMode.Prerender,
    })
  ),
  {
    // Prerendered wildcard emits a standalone 404 page instead of falling
    // back to the home page (soft-404s confuse crawlers).
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
