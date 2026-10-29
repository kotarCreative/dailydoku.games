import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { HeaderComponent } from '@components/header/header.component';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { IconComponent } from '@components/icon/icon.component';
import { GameFiltersComponent } from '@components/game-filters/game-filters.component';
import { SeoService } from '@services/seo.service';
import { GamesService } from '@services/games.service';
import { IGame } from '@models/Game';
import { SITE_URL, absoluteUrl, gameTypePlural } from '../../site-config';
import { DISCOVERY_GUIDES } from '../../discovery-guides';
import { ResolvedCategory } from '@resolvers/category.resolver';
import { gameMatchesSearch } from '../../game-catalogue';

/**
 * Category hub page (e.g. /word-games). Renders the games of one internal
 * type with CollectionPage + ItemList schema so crawlers read it as the
 * canonical directory for that genre.
 */
@Component({
  selector: 'app-category',
  imports: [HeaderComponent, GameCardComponent, DailyBannerComponent, RouterLink, IconComponent, GameFiltersComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private gamesService = inject(GamesService);
  private destroyRef = inject(DestroyRef);

  resolved = signal<ResolvedCategory | null>(null);
  readonly guides = DISCOVERY_GUIDES;
  readonly searchTerm = computed(() => this.gamesService.searchTerm);
  readonly visibleGames = computed(() => {
    const query = this.gamesService.searchTerm.trim().toLowerCase();
    return (this.resolved()?.games ?? []).filter(game => {
      if (this.gamesService.filterFavourites && !this.gamesService.isFavourite(game)) return false;
      return gameMatchesSearch(game, query);
    });
  });

  onSearchChange(event: Event): void {
    this.gamesService.setSearchTerm((event.target as HTMLInputElement).value);
  }

  resetFilters(): void {
    this.gamesService.setSearchTerm('');
    this.gamesService.setFilterFavourites(false);
  }

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.applyCategory(data['resolved'] as ResolvedCategory | null);
    });
  }

  private applyCategory(data: ResolvedCategory | null): void {
    if (!data) {
      return;
    }

    this.resolved.set(data);
    const { category, games } = data;

    // Drop schema owned by other pages when arriving via client-side nav.
    this.seoService.removeJsonLd('game-item-list');
    this.seoService.removeJsonLd('game');
    this.seoService.removeJsonLd('discovery-item-list');

    this.seoService.setMeta({
      title: category.title,
      description: category.description,
      url: category.path,
      keywords: [
        gameTypePlural(category.type),
        `free ${gameTypePlural(category.type)}`,
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
          name: category.heading,
          item: absoluteUrl(category.path)
        }
      ]
    });

    this.seoService.setJsonLd('category-item-list', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.heading,
      description: category.description,
      url: absoluteUrl(category.path),
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        name: category.heading,
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
  }

  onFavouriteGame(game: IGame, isFavourite: boolean): void {
    this.gamesService.favouriteGame(game, isFavourite);
  }

  isFavourite(game: IGame): boolean {
    return this.gamesService.isFavourite(game);
  }
}
