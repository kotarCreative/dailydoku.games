import { Component, inject, OnInit, Optional, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';

import { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { GameCardComponent } from '@components/game-card/game-card.component';
import {
  SITE_NAME,
  SITE_URL,
  absoluteAssetUrl,
  absoluteUrl,
  gameTypeLabel,
  gameTypePlural,
  gameTypeShortLabel
} from '../../site-config';
import { CONTENT_LAST_UPDATED } from '../../content-meta';
import { ResolvedGame } from '@resolvers/game.resolver';

@Component({
  selector: 'app-game-detail',
  imports: [RouterLink, GameCardComponent],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gamesService = inject(GamesService);
  private seoService = inject(SeoService);

  game = signal<IGame | null>(null);
  aboutParagraphs = signal<string[]>([]);
  relatedGames = signal<IGame[]>([]);
  isFavourite = signal(false);
  /** One-word genre hint for the badge; titles/schema use the long form. */
  typeLabel = signal('Puzzle');
  /** Plural genre phrase used by the related-games heading. */
  typePlural = signal('daily puzzles');

  constructor(@Optional() private _analytics: Analytics) {}

  ngOnInit(): void {
    // Get game from resolver - this is available synchronously during SSR
    const resolved = this.route.snapshot.data['game'] as ResolvedGame | null;

    if (!resolved) {
      return;
    }

    const { game, relatedGames } = resolved;

    this.game.set(game);
    this.relatedGames.set(relatedGames);
    this.aboutParagraphs.set((game.about ?? '').split('\n\n').filter(Boolean));
    this.isFavourite.set(this.gamesService.isFavourite(game));

    // Drop schema owned by other pages when arriving via client-side nav.
    this.seoService.removeJsonLd('game-item-list');
    this.seoService.removeJsonLd('category-item-list');

    const typeLabel = gameTypeLabel(game.type);
    const typePlural = gameTypePlural(game.type);
    this.typeLabel.set(gameTypeShortLabel(game.type));
    this.typePlural.set(typePlural);

    const description = game.description
      ? `${game.description}. Play ${game.name} free on DailyDoku and track your daily streak.`
      : `Play ${game.name}, a free daily puzzle you can play once a day. Find ${game.name} and 60+ more ${typePlural} on DailyDoku.`;

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
      screenshot: absoluteUrl('/assets/og-image.png'),
      genre: typeLabel,
      gamePlatform: 'Web Browser',
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      inLanguage: 'en',
      dateModified: CONTENT_LAST_UPDATED,
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

  onRelatedFavourite(game: IGame, isFavourite: boolean): void {
    this.gamesService.favouriteGame(game, isFavourite);
  }

  isFavouriteRelated(game: IGame): boolean {
    return this.gamesService.isFavourite(game);
  }
}
