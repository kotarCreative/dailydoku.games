import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';

import Game, { IGame } from '@models/Game';
import { DiscoveryGuide } from '../discovery-guides';

export interface ResolvedGuide {
  guide: DiscoveryGuide;
  picks: { game: IGame; bestFor: string; comparison: string }[];
}

export const discoveryResolver: ResolveFn<ResolvedGuide> = route => {
  const guide = route.data['guide'] as DiscoveryGuide;
  return inject(HttpClient).get<IGame[]>('/assets/games.json').pipe(
    map(data => {
      const games = Game.array().parse(data);
      return {
        guide,
        picks: guide.picks.map(pick => {
          const game = games.find(candidate => candidate.slug === pick.slug);
          if (!game) throw new Error(`Missing game in ${guide.path}: ${pick.slug}`);
          return { ...pick, game };
        })
      };
    })
  );
};
