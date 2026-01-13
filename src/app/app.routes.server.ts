import { RenderMode, ServerRoute } from '@angular/ssr';

import gamesData from '../assets/games.json';

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
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
