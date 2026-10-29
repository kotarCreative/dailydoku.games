import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent } from '@components/header/header.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { IGame } from '@models/Game';
import { ResolvedGuide } from '@resolvers/discovery.resolver';
import { DISCOVERY_GUIDES } from '../../discovery-guides';
import { SITE_URL, absoluteUrl } from '../../site-config';

@Component({
  selector: 'app-discovery',
  imports: [HeaderComponent, DailyBannerComponent, GameCardComponent, RouterLink],
  templateUrl: './discovery.component.html',
  styleUrl: './discovery.component.scss'
})
export class DiscoveryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private seoService = inject(SeoService);
  private gamesService = inject(GamesService);

  readonly resolved = signal<ResolvedGuide | null>(null);
  readonly guides = DISCOVERY_GUIDES;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      const resolved = data['resolved'] as ResolvedGuide;
      this.resolved.set(resolved);
      const { guide, picks } = resolved;

      this.seoService.removeJsonLd('game');
      this.seoService.removeJsonLd('game-item-list');
      this.seoService.removeJsonLd('category-item-list');
      this.seoService.setMeta({ title: guide.title, description: guide.description, url: guide.path });
      this.seoService.setJsonLd('breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Daily Puzzles & Games', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: guide.heading, item: absoluteUrl(guide.path) }
        ]
      });
      this.seoService.setJsonLd('discovery-item-list', {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: guide.heading,
        description: guide.description,
        url: absoluteUrl(guide.path),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: picks.length,
          itemListOrder: 'https://schema.org/ItemListUnordered',
          itemListElement: picks.map(({ game }, index) => ({
            '@type': 'ListItem', position: index + 1, name: game.name,
            url: absoluteUrl(`/games/${game.slug}`)
          }))
        }
      });
    });
  }

  isFavourite(game: IGame): boolean {
    return this.gamesService.isFavourite(game);
  }

  onFavouriteGame(game: IGame, favourite: boolean): void {
    this.gamesService.favouriteGame(game, favourite);
  }
}
