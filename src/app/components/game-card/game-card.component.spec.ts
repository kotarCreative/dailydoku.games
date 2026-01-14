import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
  let component: GameCardComponent;
  let fixture: ComponentFixture<GameCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCardComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-id', // Mock any needed params
              },
            },
            queryParams: of({}), // Mock queryParams if needed
          },
        },
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameCardComponent);
    component = fixture.componentInstance;
    
    // Initialize required inputs if any
    component.game = {
        name: 'Test Game',
        description: 'Test Description',
        logo: 'test-logo.png',
        slug: 'test-game',
        type: 'Test Type',
        url: 'http://test-game.com'
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
