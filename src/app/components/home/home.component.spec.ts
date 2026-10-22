import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { HomeComponent } from './home.component';

@Component({ selector: 'app-header', standalone: true, template: '',
  exportAs: 'siteHeader' })
class HeaderStub { openSuggestDialog() {} }
@Component({ selector: 'app-daily-banner', standalone: true, template: '' }) class BannerStub {}
@Component({ selector: 'app-game-list', standalone: true, template: '' }) class ListStub {}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  const games = { allGames: [{ name: 'Alpha', slug: 'alpha', description: 'A' }], searchTerm: '',
    filterFavourites: false,
    setSearchTerm: jasmine.createSpy('setSearchTerm').and.callFake((v: string) => games.searchTerm = v),
    setFilterFavourites: jasmine.createSpy('setFilterFavourites') };
  const seo = { setMeta: jasmine.createSpy('setMeta'), setJsonLd: jasmine.createSpy('setJsonLd'), removeJsonLd: jasmine.createSpy('removeJsonLd') };

  beforeEach(async () => {
    games.searchTerm = '';
    await TestBed.configureTestingModule({ imports: [HomeComponent], providers: [provideRouter([]),
      { provide: GamesService, useValue: games }, { provide: SeoService, useValue: seo }
    ] }).overrideComponent(HomeComponent, { remove: { imports: [
      (await import('@components/header/header.component')).HeaderComponent,
      (await import('@components/daily-banner/daily-banner.component')).DailyBannerComponent,
      (await import('@components/game-list/game-list.component')).GameListComponent
    ] }, add: { imports: [HeaderStub, BannerStub, ListStub] } }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('renders the daily hero and category links with their configured URLs', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Your daily dose');
    const links = [...fixture.nativeElement.querySelectorAll('nav[aria-label="Game filters"] a')] as HTMLAnchorElement[];
    expect(links[0].textContent.trim()).toBe('All games');
    expect(links.some(link => link.getAttribute('href') === '/word-games')).toBeTrue();
    expect(links.some(link => link.getAttribute('href') === '/grid-puzzles')).toBeTrue();
  });

  it('sends mobile search input to GamesService and reflects its current term', () => {
    const input = fixture.nativeElement.querySelector('input[aria-label="Search daily games"]') as HTMLInputElement;
    input.value = 'crossword'; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(games.setSearchTerm).toHaveBeenCalledWith('crossword');
    expect(input.value).toBe('crossword');
  });
});
