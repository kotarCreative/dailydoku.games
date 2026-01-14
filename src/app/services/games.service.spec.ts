import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GamesService } from './games.service';
import { IGame } from '@models/Game';

describe('GamesService', () => {
  let service: GamesService;
  let httpMock: HttpTestingController;

  const mockGames: IGame[] = [
    {
      name: 'Game One',
      slug: 'game-one',
      type: 'Puzzle',
      url: 'http://game-one.com',
      logo: 'logo1.png',
      description: 'First game'
    },
    {
      name: 'Game Two',
      slug: 'game-two',
      type: 'Strategy',
      url: 'http://game-two.com',
      logo: 'logo2.png',
      description: 'Second game'
    },
    {
        name: 'Game Three',
        slug: 'game-three',
        type: 'Puzzle',
        url: 'http://game-three.com',
        logo: 'logo3.png',
        description: 'Third game'
      }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GamesService]
    });
    service = TestBed.inject(GamesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();

    const req = httpMock.expectOne('/assets/games.json');
    req.flush(mockGames);
  });

  it('should filter games by name', () => {
    const req = httpMock.expectOne('/assets/games.json');
    req.flush(mockGames);

    service.setSearchTerm('one');
    expect(service.games.length).toBe(1);
    expect(service.games[0].name).toBe('Game One');
  });

  it('should filter games by type', () => {
    const req = httpMock.expectOne('/assets/games.json');
    req.flush(mockGames);

    service.setSearchTerm('puzzle');
    expect(service.games.length).toBe(2);
    expect(service.games.some(g => g.name === 'Game One')).toBeTrue();
    expect(service.games.some(g => g.name === 'Game Three')).toBeTrue();
  });
});
