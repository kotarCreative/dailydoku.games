import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

import Game, { IGame } from '@models/Game';
import { CategoryConfig } from '../site-config';

export interface ResolvedCategory {
  category: CategoryConfig;
  games: IGame[];
}

/**
 * Loads the catalogue once and slices out the games belonging to the
 * category's type. Mirrors gameResolver so both hub pages and detail pages
 * resolve synchronously during prerendering.
 */
export const categoryResolver: ResolveFn<ResolvedCategory | null> = (route) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<IGame[]>('/assets/games.json').pipe(
    map((games) => {
      const validatedGames: IGame[] = [];
      games.forEach((game) => {
        const validatedGame = Game.safeParse(game);
        if (validatedGame.success) {
          validatedGames.push(validatedGame.data);
        }
      });

      // The category config is injected via route data when the static
      // category routes are registered.
      const category = route.data['category'] as CategoryConfig | undefined;

      if (!category) {
        router.navigate(['/']);
        return null;
      }

      return {
        category,
        games: validatedGames.filter((game) => game.type === category.type)
      };
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(null);
    })
  );
};
