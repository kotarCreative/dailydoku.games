import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { HeaderComponent } from '@components/header/header.component';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { SeoService } from '@services/seo.service';
import { GamesService } from '@services/games.service';
import { IGame } from '@models/Game';
import { SITE_URL, absoluteUrl, gameTypePlural } from '../../site-config';
import { ResolvedCategory } from '@resolvers/category.resolver';

/**
 * Category hub page (e.g. /word-games). Renders the games of one internal
 * type with CollectionPage + ItemList schema so crawlers read it as the
 * canonical directory for that genre.
 */
@Component({
  selector: 'app-category',
  imports: [HeaderComponent, GameCardComponent, RouterLink],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private gamesService = inject(GamesService);

  resolved = signal<ResolvedCategory | null>(null);

  ngOnInit(): void {
    const data = this.route.snapshot.data['resolved'] as ResolvedCategory | null;

    if (!data) {
      return;
    }

    this.resolved.set(data);
    const { category, games } = data;

    // Drop schema owned by other pages when arriving via client-side nav.
    this.seoService.removeJsonLd('game-item-list');
    this.seoService.removeJsonLd('game');

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
