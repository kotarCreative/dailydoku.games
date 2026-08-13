import { Component, inject, OnInit, Optional, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';

import { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import {
  SITE_NAME,
  SITE_URL,
  absoluteAssetUrl,
  absoluteUrl,
  gameTypeLabel,
  gameTypePlural,
  gameTypeShortLabel
} from '../../site-config';

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
  /** One-word genre hint for the badge; titles/schema use the long form. */
  typeLabel = signal('Puzzle');

  constructor(@Optional() private _analytics: Analytics) {}

  ngOnInit(): void {
    // Get game from resolver - this is available synchronously during SSR
    const game = this.route.snapshot.data['game'] as IGame | null;

    if (!game) {
      return;
    }

    this.game.set(game);
    this.isFavourite.set(this.gamesService.isFavourite(game));

    // Drop the home page collection schema when arriving via client-side nav.
    this.seoService.removeJsonLd('game-item-list');

    const typeLabel = gameTypeLabel(game.type);
    const typePlural = gameTypePlural(game.type);
    this.typeLabel.set(gameTypeShortLabel(game.type));

    const description = game.description
      ? `${game.description}. Play ${game.name} free on DailyDoku and track your daily streak.`
      : `Play ${game.name}, a free daily puzzle you can play once a day. Find ${game.name} and 40+ more ${typePlural} on DailyDoku.`;

    this.seoService.setMeta({
      title: `${game.name} - Play the ${typeLabel} Free | ${SITE_NAME}`,
      description,
      url: `/games/${game.slug}`,
      image: absoluteAssetUrl(game.logo),
      imageAlt: `${game.name} logo`,
      keywords: [
        game.name,
        `${game.name} game`,
        `play ${game.name}`,
        `${game.name} daily puzzle`,
        typeLabel.toLowerCase(),
        typePlural,
        'daily puzzles',
        'daily games'
      ].join(', '),
      type: 'website'
    });

    this.seoService.setJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Daily Puzzles & Daily Games',
          item: absoluteUrl('/')
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: game.name,
          item: absoluteUrl(`/games/${game.slug}`)
        }
      ]
    });

    // Game schema makes the page eligible for richer game results and states
    // plainly that this is a free, browser-based daily puzzle.
    this.seoService.setJsonLd('game', {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: game.name,
      description: game.description || `${game.name} is a free ${typeLabel.toLowerCase()}.`,
      url: absoluteUrl(`/games/${game.slug}`),
      image: absoluteAssetUrl(game.logo),
      genre: typeLabel,
      gamePlatform: 'Web Browser',
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      inLanguage: 'en',
      sameAs: game.url || undefined,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    });
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
}
