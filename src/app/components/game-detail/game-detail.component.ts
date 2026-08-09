import { Component, inject, OnInit, Optional, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';

import { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';

@Component({
  selector: 'app-game-detail',
  imports: [RouterLink],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gamesService = inject(GamesService);
  private seoService = inject(SeoService);

  game = signal<IGame | null>(null);
  isFavourite = signal(false);

  constructor(@Optional() private _analytics: Analytics) {}

  ngOnInit(): void {
    // Get game from resolver - this is available synchronously during SSR
    const game = this.route.snapshot.data['game'] as IGame | null;
    
    if (game) {
      this.game.set(game);
      this.isFavourite.set(this.gamesService.isFavourite(game));
      
      const description = game.description || `Play ${game.name} - a daily puzzle game on Dailydoku`;
      const gameType = game.type?.toLowerCase() || 'puzzle';
      
      this.seoService.setMeta({
        title: `${game.name} - Play Daily ${this.capitalizeFirst(gameType)} Game | Dailydoku`,
        description: description,
        url: `/games/${game.slug}`,
        image: game.logo,
        imageAlt: `${game.name} logo`,
        keywords: `${game.name}, ${gameType} game, daily puzzle, ${game.name} game, play ${game.name}`,
        type: 'website'
      });

      this.seoService.setJsonLd('breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.daily-doku.com/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: game.name,
            item: `https://www.daily-doku.com/games/${game.slug}`
          }
        ]
      });
    }
  }

  playGame(): void {
    const game = this.game();
    if (game) {
      if (this._analytics !== null) {
        logEvent(this._analytics, 'game_clicked', { game: game.name });
      }
      window.open(game.url, '_blank');
    }
  }

  onFavouriteGame(): void {
    const game = this.game();
    if (game) {
      const newFavouriteState = !this.isFavourite();
      this.gamesService.favouriteGame(game, newFavouriteState);
      this.isFavourite.set(newFavouriteState);
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
