import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DailyBannerComponent } from './daily-banner.component';
import { DailyWalkthroughService } from '@services/daily-walkthrough.service';
import { GamesService } from '@services/games.service';

describe('DailyBannerComponent', () => {
  let fixture: ComponentFixture<DailyBannerComponent>;
  let active: boolean;
  let service: any;
  const game = { name: 'Alpha', slug: 'alpha', type: 'puzzle', url: 'https://example.test', logo: '', description: '' };
  let games: any;
  beforeEach(() => {
    active = false;
    service = { session: signal(null), streak: signal(0), startDailySession: jasmine.createSpy('start').and.callFake(() => active = true), getGameStatus: jasmine.createSpy().and.returnValue('not-in-session') };
    games = { allGames: [game], setFilterFavourites: jasmine.createSpy() };
    TestBed.configureTestingModule({ imports: [DailyBannerComponent], providers: [
      { provide: DailyWalkthroughService, useValue: service }, { provide: GamesService, useValue: games }
    ] });
    fixture = TestBed.createComponent(DailyBannerComponent);
  });
  it('offers browse and does not start when there are no favourites', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.resume').textContent).toContain('Browse');
    fixture.componentInstance.startDailyWalkthrough();
    expect(service.startDailySession).not.toHaveBeenCalled();
  });
  it('starts the routine when favourites are available', () => {
    service.session.set({ date: new Date().toISOString().slice(0, 10), games: ['Alpha'], completedGames: [], startTime: 1 });
    fixture.detectChanges();
    fixture.componentInstance.startDailyWalkthrough();
    expect(service.startDailySession).toHaveBeenCalled();
    expect(active).toBeTrue();
  });
  it('sets favourites-only when editing the routine', () => {
    fixture.componentInstance.browse(true);
    expect(games.setFilterFavourites).toHaveBeenCalledWith(true);
  });
});
