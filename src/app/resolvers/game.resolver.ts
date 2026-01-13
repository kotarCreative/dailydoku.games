import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

import Game, { IGame } from '@models/Game';

export const gameResolver: ResolveFn<IGame | null> = (route) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const slug = route.paramMap.get('slug');

  return http.get<IGame[]>('/assets/games.json').pipe(
    map((games) => {
      const validatedGames: IGame[] = [];
      games.forEach((game) => {
        const validatedGame = Game.safeParse(game);
        if (validatedGame.success) {
          validatedGames.push(validatedGame.data);
        }
      });

      const game = validatedGames.find((g) => g.slug === slug);

      if (!game) {
        router.navigate(['/']);
        return null;
      }

      return game;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(null);
    })
  );
};
