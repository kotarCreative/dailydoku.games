import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyWalkthroughComponent } from './daily-walkthrough.component';
import { DailyWalkthroughService } from '@services/daily-walkthrough.service';
import { GamesService } from '@services/games.service';

@Component({ standalone: true, imports: [DailyWalkthroughComponent], template: '@if (service.isActive()) { <app-daily-walkthrough /> }' })
class TestHost { service = inject(DailyWalkthroughService); }

describe('DailyWalkthroughComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let state: any;
  let focusTarget: HTMLButtonElement;
  const alpha = { name: 'Alpha', slug: 'alpha', type: 'puzzle', url: 'https://example.test', logo: '', description: '' };
  beforeEach(() => {
    document.body.style.overflow = 'auto';
    state = {
      session: signal({ date: new Date().toISOString().slice(0, 10), games: ['Alpha'], completedGames: [], startTime: 1 }),
      progress: signal(0), streak: signal(0), isActive: signal(true),
      stopDailySession: jasmine.createSpy('stop').and.callFake(() => state.isActive.set(false)),
      completeGame: jasmine.createSpy('complete'), getGameStatus: jasmine.createSpy().and.callFake((name: string) => state.session().completedGames.includes(name) ? 'completed' : 'pending')
    };
    TestBed.configureTestingModule({ imports: [TestHost], providers: [
      { provide: DailyWalkthroughService, useValue: state },
      { provide: GamesService, useValue: { allGames: [alpha], getGameBySlug: () => alpha } }
    ] });
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });
  afterEach(() => { fixture.destroy(); document.body.style.overflow = ''; });

  it('tracks a visit on outbound-link activation only', () => {
    const link = fixture.nativeElement.querySelector('a.primary') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    link.click();
    expect(state.completeGame).toHaveBeenCalledWith('Alpha');
  });

  it('keeps the line-up in a labelled keyboard-scrollable region ahead of separate footer actions', () => {
    const lineup = fixture.nativeElement.querySelector('.sheet-lineup') as HTMLElement;
    expect(lineup.getAttribute('role')).toBe('region');
    expect(lineup.getAttribute('aria-label')).toBe('Daily line-up games');
    expect(lineup.getAttribute('tabindex')).toBe('0');
    expect(lineup.querySelectorAll('.routine-row').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.sheet-footer .primary')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.sheet-footer .edit-routine')).not.toBeNull();
  });

  it('renders every game in the scroll region without moving footer actions into it', () => {
    const games = Array.from({ length: 25 }, (_, index) => ({ ...alpha, name: `Game ${index + 1}` }));
    TestBed.inject(GamesService).allGames.splice(0, 1, ...games);
    state.session.set({ ...state.session(), games: games.map(game => game.name) });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.sheet-lineup .routine-row').length).toBe(25);
    expect(fixture.nativeElement.querySelector('.sheet-footer .primary')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.sheet-footer .edit-routine')).not.toBeNull();
  });

  it('closes on Escape and restores body scroll and prior focus', async () => {
    focusTarget = document.createElement('button'); document.body.appendChild(focusTarget); focusTarget.focus();
    fixture.destroy();
    state.isActive.set(true); fixture = TestBed.createComponent(TestHost); fixture.detectChanges();
    await Promise.resolve();
    expect(document.body.style.overflow).toBe('hidden');
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(state.stopDailySession).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.activeElement).toBe(focusTarget);
    focusTarget.remove();
  });
});
