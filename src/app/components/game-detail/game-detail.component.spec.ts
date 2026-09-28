import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import type { IGame } from '@models/Game';
import { GamesService } from '@services/games.service';
import { SeoService } from '@services/seo.service';
import { GameDetailComponent } from './game-detail.component';

describe('GameDetailComponent', () => {
  let fixture: ComponentFixture<GameDetailComponent>;

  const game: IGame = {
    name: 'Play Higher Lower',
    slug: 'higher-or-lower',
    type: 'trivia',
    url: 'https://playhigherlower.com/daily',
    logo: '/assets/logos/higher-or-lower.webp',
    description: 'Compare two values and choose which is higher.'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                game: { game, relatedGames: [] }
              }
            }
          }
        },
        {
          provide: GamesService,
          useValue: {
            isFavourite: () => false,
            favouriteGame: () => undefined
          }
        },
        {
          provide: SeoService,
          useValue: {
            removeJsonLd: () => undefined,
            setMeta: () => undefined,
            setJsonLd: () => undefined
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameDetailComponent);
    fixture.detectChanges();
  });

  it('renders the game destination as a secure external link', () => {
    const element: HTMLElement = fixture.nativeElement;
    const link = element.querySelector<HTMLAnchorElement>(`a[href="${game.url}"]`);

    expect(link).not.toBeNull();
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toContain('noopener');
  });
});
