import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { GamesService } from '@services/games.service';
import { GameFiltersComponent } from './game-filters.component';

describe('GameFiltersComponent', () => {
  let fixture: ComponentFixture<GameFiltersComponent>;
  const filterFavourites = signal(false);
  const games = {
    get filterFavourites() { return filterFavourites(); },
    searchTerm: 'crossword',
    setFilterFavourites: jasmine.createSpy('setFilterFavourites').and.callFake((value: boolean) => filterFavourites.set(value))
  };

  beforeEach(async () => {
    filterFavourites.set(false);
    games.setFilterFavourites.calls.reset();
    await TestBed.configureTestingModule({ imports: [GameFiltersComponent], providers: [provideRouter([]), { provide: GamesService, useValue: games }] }).compileComponents();
    fixture = TestBed.createComponent(GameFiltersComponent);
  });

  it('marks only the active category, and favourites suppresses all other active states', () => {
    fixture.componentRef.setInput('activeCategory', '/word-games');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Game filters');
    expect(nav.querySelector('a[href="/word-games"]').getAttribute('aria-current')).toBe('page');
    expect(nav.querySelector('a[href="/"]').getAttribute('aria-current')).toBeNull();
    filterFavourites.set(true);
    fixture.detectChanges();
    expect(nav.querySelector('button').getAttribute('aria-pressed')).toBe('true');
    expect([...nav.querySelectorAll('a')].every((link: HTMLAnchorElement) => link.getAttribute('aria-current') === null)).toBeTrue();
    filterFavourites.set(false);
    fixture.detectChanges();
    expect(nav.querySelector('a[href="/word-games"]').getAttribute('aria-current')).toBe('page');
  });

  it('activates favourites without losing search and navigates home', async () => {
    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('/word-games');
    const navigate = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(games.setFilterFavourites).toHaveBeenCalledWith(true);
    expect(games.searchTerm).toBe('crossword');
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('clears favourites when a category is selected', () => {
    filterFavourites.set(true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('a[href="/word-games"]') as HTMLAnchorElement).click();
    expect(games.setFilterFavourites).toHaveBeenCalledWith(false);
  });

  it('selects All games when the favourites view is cleared', () => {
    filterFavourites.set(true);
    fixture.detectChanges();
    const allGames = fixture.nativeElement.querySelector('a[href="/"]') as HTMLAnchorElement;
    allGames.click();
    fixture.detectChanges();
    expect(filterFavourites()).toBeFalse();
    expect(allGames.getAttribute('aria-current')).toBe('page');
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-pressed')).toBe('false');
  });

  it('does not toggle off or navigate again when Favourites is already selected at home', () => {
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    filterFavourites.set(true);
    fixture.detectChanges();
    fixture.componentInstance.showFavourites();
    expect(filterFavourites()).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
    expect(games.searchTerm).toBe('crossword');
  });
});
