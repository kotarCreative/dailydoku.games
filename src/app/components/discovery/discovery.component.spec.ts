import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { HeaderComponent } from '@components/header/header.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { DiscoveryComponent } from './discovery.component';
import { DISCOVERY_GUIDES } from '../../discovery-guides';
import { ResolvedGuide } from '@resolvers/discovery.resolver';
import Game from '@models/Game';
import gamesData from '../../../assets/games.json';

@Component({ selector: 'app-header', template: '' }) class HeaderStub {}
@Component({ selector: 'app-daily-banner', template: '' }) class BannerStub {}
@Component({ selector: 'app-game-card', template: '' })
class GameCardStub {
  @Input() game: unknown;
  @Input() isFavourite = false;
  @Output() favouriteGame = new EventEmitter<boolean>();
}

describe('DiscoveryComponent', () => {
  const games = Game.array().parse(gamesData);
  const resolve = (index: number): ResolvedGuide => ({
    guide: DISCOVERY_GUIDES[index],
    picks: DISCOVERY_GUIDES[index].picks.map(pick => ({
      ...pick, game: games.find(game => game.slug === pick.slug)!
    }))
  });
  const routeData = new BehaviorSubject({ resolved: resolve(0) });
  const seo = { setMeta: jasmine.createSpy('setMeta'), setJsonLd: jasmine.createSpy('setJsonLd'), removeJsonLd: jasmine.createSpy('removeJsonLd') };
  const service = { isFavourite: () => false, favouriteGame: jasmine.createSpy('favouriteGame') };
  let fixture: ReturnType<typeof TestBed.createComponent<DiscoveryComponent>>;

  beforeEach(() => {
    routeData.next({ resolved: resolve(0) });
    TestBed.configureTestingModule({ imports: [DiscoveryComponent], providers: [
      provideRouter([]), { provide: ActivatedRoute, useValue: { data: routeData } },
      { provide: SeoService, useValue: seo }, { provide: GamesService, useValue: service }
    ] }).overrideComponent(DiscoveryComponent, {
      remove: { imports: [HeaderComponent, DailyBannerComponent, GameCardComponent] },
      add: { imports: [HeaderStub, BannerStub, GameCardStub] }
    });
    fixture = TestBed.createComponent(DiscoveryComponent);
    fixture.detectChanges();
  });

  it('renders unique comparisons, questions and crawlable game links', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Games Like Wordle');
    expect(fixture.nativeElement.querySelectorAll('.guide-pick').length).toBe(resolve(0).picks.length);
    expect(fixture.nativeElement.querySelector('a[href="/games/quordle"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.questions h3').length).toBeGreaterThan(0);
    expect(seo.setMeta).toHaveBeenCalledWith(jasmine.objectContaining({ url: '/games-like-wordle' }));
    expect(seo.setJsonLd).toHaveBeenCalledWith('discovery-item-list', jasmine.objectContaining({
      '@type': 'CollectionPage', mainEntity: jasmine.objectContaining({ numberOfItems: resolve(0).picks.length })
    }));
  });

  it('updates the guide and metadata on client-side navigation', () => {
    routeData.next({ resolved: resolve(1) });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Games Like Connections');
    expect(fixture.nativeElement.querySelectorAll('.guide-pick').length).toBe(resolve(1).picks.length);
    expect(seo.setMeta).toHaveBeenCalledWith(jasmine.objectContaining({ url: '/games-like-connections' }));
  });
});
