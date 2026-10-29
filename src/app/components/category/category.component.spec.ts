import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { CategoryComponent } from './category.component';
import { CATEGORIES } from '../../site-config';
import { HeaderComponent } from '@components/header/header.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { GameCardComponent } from '@components/game-card/game-card.component';

@Component({ selector: 'app-header', standalone: true, template: '' }) class HeaderStub { openSuggestDialog() {} }
@Component({ selector: 'app-daily-banner', standalone: true, template: '' }) class BannerStub {}
@Component({ selector: 'app-game-card', standalone: true, template: '' })
class GameCardStub {
  @Input() game: unknown;
  @Input() isFavourite = false;
  @Output() favouriteGame = new EventEmitter<boolean>();
}

describe('CategoryComponent', () => {
  const word = { name: 'Wordle', slug: 'wordle', type: 'oodle', description: '', logo: '', url: '' };
  const grid = { name: 'Pokedoku', slug: 'pokedoku', type: 'doku', description: '', logo: '', url: '' };
  let term = ''; let favourites = false;
  const games = { get searchTerm() { return term; }, get filterFavourites() { return favourites; },
    setSearchTerm: jasmine.createSpy('setSearchTerm').and.callFake(v => term = v),
    setFilterFavourites: jasmine.createSpy('setFilterFavourites').and.callFake(v => favourites = v),
    isFavourite: jasmine.createSpy('isFavourite').and.callFake(game => game === word),
    favouriteGame: jasmine.createSpy('favouriteGame') };
  const seo = { setMeta: jasmine.createSpy('setMeta'), setJsonLd: jasmine.createSpy('setJsonLd'), removeJsonLd: jasmine.createSpy('removeJsonLd') };
  let component: CategoryComponent;
  const routeData = new BehaviorSubject({ resolved: { category: CATEGORIES[0], games: [word, grid] } });

  beforeEach(() => {
    term = ''; favourites = false;
    routeData.next({ resolved: { category: CATEGORIES[0], games: [word, grid] } });
    TestBed.configureTestingModule({ imports: [CategoryComponent], providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { data: routeData } },
      { provide: GamesService, useValue: games }, { provide: SeoService, useValue: seo }
    ] }).overrideComponent(CategoryComponent, { remove: { imports: [HeaderComponent, DailyBannerComponent, GameCardComponent] }, add: { imports: [HeaderStub, BannerStub, GameCardStub] } });
    component = TestBed.createComponent(CategoryComponent).componentInstance;
    component.ngOnInit();
  });

  it('updates content and metadata between category routes without recreating the component', () => {
    routeData.next({ resolved: { category: CATEGORIES[1], games: [grid] } });
    expect(component.resolved()?.category).toBe(CATEGORIES[1]);
    expect(component.visibleGames()).toEqual([grid]);
    expect(seo.setMeta).toHaveBeenCalledWith(jasmine.objectContaining({ url: CATEGORIES[1].path }));
  });

  it('maps the resolved category and retains its SEO metadata/schema', () => {
    expect(component.resolved()?.category).toBe(CATEGORIES[0]);
    expect(component.visibleGames()).toEqual([word, grid]);
    expect(seo.setMeta).toHaveBeenCalledWith(jasmine.objectContaining({ title: CATEGORIES[0].title, url: CATEGORIES[0].path }));
    expect(seo.setJsonLd).toHaveBeenCalledWith('category-item-list', jasmine.objectContaining({ '@type': 'CollectionPage' }));
  });

  it('filters by game name and favourite state, then reset clears both filters', () => {
    term = 'word'; expect(component.visibleGames()).toEqual([word]);
    term = ''; favourites = true; expect(component.visibleGames()).toEqual([word]);
    component.resetFilters();
    expect(games.setSearchTerm).toHaveBeenCalledWith('');
    expect(games.setFilterFavourites).toHaveBeenCalledWith(false);
    favourites = false;
    component.resolved.set({ category: CATEGORIES[0], games: [word, grid] });
    expect(component.visibleGames()).toEqual([word, grid]);
  });
});
