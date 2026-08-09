import { Component, effect, inject, OnInit } from '@angular/core';

import { HeaderComponent } from '@components/header/header.component';
import { GameListComponent } from '@components/game-list/game-list.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { SeoService } from '@services/seo.service';
import { GamesService } from '@services/games.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, GameListComponent, DailyBannerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private seoService = inject(SeoService);
  private gamesService = inject(GamesService);

  constructor() {
    effect(() => {
      const games = this.gamesService.allGames;
      if (games.length === 0) {
        return;
      }

      this.seoService.setJsonLd('game-item-list', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: games.map((game, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: game.name,
          url: `https://www.daily-doku.com/games/${game.slug}`
        }))
      });
    });
  }

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Dailydoku: A place to discover puzzle games',
      description: 'Find your new favourite puzzle game. Search for games like wordle, cine2nerdle, pokedoku, and more.',
      url: '/',
      keywords: 'daily puzzle games, wordle, pokedoku, word games, trivia games, puzzle games, daily games, wordle alternatives',
      type: 'website'
    });
  }
}
