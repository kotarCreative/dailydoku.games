import { Component, effect, inject, OnInit } from '@angular/core';

import { HeaderComponent } from '@components/header/header.component';
import { GameListComponent } from '@components/game-list/game-list.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { SeoService } from '@services/seo.service';
import { GamesService } from '@services/games.service';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_URL,
  absoluteUrl
} from '../../site-config';

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

      // CollectionPage wrapping the game list tells crawlers this page is a
      // curated directory of daily puzzles rather than a single game page.
      this.seoService.setJsonLd('game-item-list', {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/#collection`,
        name: 'Daily Puzzles & Daily Games',
        description: DEFAULT_DESCRIPTION,
        url: absoluteUrl('/'),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          name: 'Daily puzzles and daily games',
          numberOfItems: games.length,
          itemListElement: games.map((game, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: game.name,
            description: game.description || undefined,
            url: absoluteUrl(`/games/${game.slug}`)
          }))
        }
      });
    });
  }

  ngOnInit(): void {
    // Drop game-page schema when arriving back here via client-side nav.
    this.seoService.removeJsonLd('breadcrumb');
    this.seoService.removeJsonLd('game');

    this.seoService.setMeta({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: '/',
      keywords: DEFAULT_KEYWORDS,
      type: 'website'
    });
  }
}
