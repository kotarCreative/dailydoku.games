import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { GameDetailComponent } from './game-detail.component';
import { HeaderComponent } from '@components/header/header.component';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';

@Component({ selector: 'app-header', standalone: true, template: '' }) class HeaderStub { openSuggestDialog() {} }
@Component({ selector: 'app-daily-banner', standalone: true, template: '' }) class BannerStub {}
@Component({ selector: 'app-game-card', standalone: true, template: '' })
class GameCardStub {
  @Input() game: unknown;
  @Input() isFavourite = false;
  @Output() favouriteGame = new EventEmitter<boolean>();
}

describe('GameDetailComponent', () => {
  const first = { name: 'First', slug: 'first', type: 'oodle', description: 'First game', about: 'Intro\n\nMore', logo: '/assets/logos/wordle.svg', url: 'https://example.com/first' };
  const second = { ...first, name: 'Second', slug: 'second', type: 'doku', url: 'https://example.com/second' };
  const routeData = new BehaviorSubject<Record<string, unknown>>({ game: { game: first, relatedGames: [second] } });
  const games = { isFavourite: jasmine.createSpy('isFavourite').and.returnValue(false), favouriteGame: jasmine.createSpy('favouriteGame') };
  const seo = { setMeta: jasmine.createSpy('setMeta'), setJsonLd: jasmine.createSpy('setJsonLd'), removeJsonLd: jasmine.createSpy('removeJsonLd') };
  let fixture: ReturnType<typeof TestBed.createComponent<GameDetailComponent>>;

  beforeEach(() => {
    routeData.next({ game: { game: first, relatedGames: [second] } });
    TestBed.configureTestingModule({ imports: [GameDetailComponent], providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { data: routeData } }, { provide: GamesService, useValue: games }, { provide: SeoService, useValue: seo }
    ] }).overrideComponent(GameDetailComponent, { remove: { imports: [HeaderComponent, GameCardComponent, DailyBannerComponent] }, add: { imports: [HeaderStub, GameCardStub, BannerStub] } });
    fixture = TestBed.createComponent(GameDetailComponent);
    fixture.detectChanges();
  });

  it('updates resolved content when navigating to another game on the same component', () => {
    routeData.next({ game: { game: second, relatedGames: [first] } }); fixture.detectChanges();
    expect(fixture.componentInstance.game()?.name).toBe('Second');
    expect(fixture.componentInstance.relatedGames()).toEqual([first]);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Second');
  });

  it('uses a native external play link without opening a duplicate tab', () => {
    const play = fixture.nativeElement.querySelector('.game-actions a') as HTMLAnchorElement;
    expect(play.getAttribute('href')).toBe(first.url);
    expect(play.getAttribute('target')).toBe('_blank');
    spyOn(window, 'open');
    fixture.componentInstance.playGame();
    expect(window.open).not.toHaveBeenCalled();
    expect(seo.setJsonLd).toHaveBeenCalledWith('game', jasmine.objectContaining({ playMode: 'SinglePlayer', url: jasmine.stringMatching('/games/first') }));
  });

  it('sets the game and breadcrumb schema without dropping metadata', () => {
    expect(seo.setMeta).toHaveBeenCalledWith(jasmine.objectContaining({ url: '/games/first', title: jasmine.stringMatching('First') }));
    expect(seo.setJsonLd).toHaveBeenCalledWith('breadcrumb', jasmine.objectContaining({ '@type': 'BreadcrumbList' }));
    expect(seo.setJsonLd).toHaveBeenCalledWith('game', jasmine.objectContaining({ '@type': 'Game' }));
  });

  it('describes a directory page rather than claiming the game is hosted here', () => {
    expect(seo.setMeta).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'First: How to Play & Similar Games | DailyDoku'
    }));
    expect(fixture.nativeElement.querySelector('.breadcrumbs a[href="/word-games"]')).not.toBeNull();
    const schema = seo.setJsonLd.calls.allArgs().filter(args => args[0] === 'game').at(-1)?.[1];
    expect(schema.offers).toBeUndefined();
    expect(schema.screenshot).toBeUndefined();
  });
});
