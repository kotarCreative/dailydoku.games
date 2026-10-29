import { Component, computed, DestroyRef, inject, OnInit, Optional, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Analytics, logEvent } from '@angular/fire/analytics';

import { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { HeaderComponent } from '@components/header/header.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { IconComponent } from '@components/icon/icon.component';
import {
  SITE_NAME,
  SITE_URL,
  CATEGORIES,
  absoluteAssetUrl,
  absoluteUrl,
  gameTypeLabel,
  gameTypePlural,
  gameTypeShortLabel
} from '../../site-config';
import { CONTENT_LAST_UPDATED } from '../../content-meta';
import { ResolvedGame } from '@resolvers/game.resolver';
import { guidesForGame } from '../../discovery-guides';

@Component({
  selector: 'app-game-detail',
  imports: [RouterLink, GameCardComponent, HeaderComponent, DailyBannerComponent, IconComponent, UpperCasePipe],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss'
})
export class GameDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gamesService = inject(GamesService);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);

  game = signal<IGame | null>(null);
  aboutParagraphs = signal<string[]>([]);
  relatedGames = signal<IGame[]>([]);
  readonly category = computed(() => CATEGORIES.find(category => category.type === this.game()?.type));
  readonly guides = computed(() => guidesForGame(this.game()?.slug ?? ''));
  isFavourite = signal(false);
  /** One-word genre hint for the badge; titles/schema use the long form. */
  typeLabel = signal('Puzzle');
  /** Plural genre phrase used by the related-games heading. */
  typePlural = signal('daily puzzles');

  constructor(@Optional() private _analytics: Analytics) {}

  ngOnInit(): void {
    // The same component is reused when following a related-game link.
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.applyResolvedGame(data['game'] as ResolvedGame | null);
    });
  }

  private applyResolvedGame(resolved: ResolvedGame | null): void {
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
    this.seoService.removeJsonLd('discovery-item-list');

    const typeLabel = gameTypeLabel(game.type);
    const typePlural = gameTypePlural(game.type);
    this.typeLabel.set(gameTypeShortLabel(game.type));
    this.typePlural.set(typePlural);

    const description = game.description
      ? `${game.description.replace(/[.!?]+$/, '')}. Learn how ${game.name} works and discover similar daily games on DailyDoku.`
      : `Learn how ${game.name} works, open the game on its own website and discover similar ${typePlural} on DailyDoku.`;

    this.seoService.setMeta({
      title: `${game.name}: How to Play & Similar Games | ${SITE_NAME}`,
      description,
      url: `/games/${game.slug}`,
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
          name: this.category()?.heading ?? 'Daily Games',
          item: absoluteUrl(this.category()?.path ?? '/')
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: game.name,
          item: absoluteUrl(`/games/${game.slug}`)
        }
      ]
    });

    // Describe the game without claiming a rich-result entitlement, a gameplay
    // screenshot or a price that has not been verified for every publisher.
    this.seoService.setJsonLd('game', {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: game.name,
      description: game.description || `${game.name} is a ${typeLabel.toLowerCase()}.`,
      url: absoluteUrl(`/games/${game.slug}`),
      image: absoluteAssetUrl(game.logo),
      genre: typeLabel,
      gamePlatform: 'Web Browser',
      playMode: 'SinglePlayer',
      applicationCategory: 'Game',
      inLanguage: 'en',
      dateModified: CONTENT_LAST_UPDATED,
      sameAs: game.url || undefined,
      isPartOf: { '@id': `${SITE_URL}/#website` }
    });
  }

  playGame(): void {
    const game = this.game();
    if (game) {
      if (this._analytics) {
        logEvent(this._analytics, 'game_clicked', { game: game.name });
      }
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
