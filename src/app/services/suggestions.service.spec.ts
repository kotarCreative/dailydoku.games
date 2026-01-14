import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';

import { SuggestionsService } from './suggestions.service';

describe('SuggestionsService', () => {
  let service: SuggestionsService;

  const mockFirestore = {
    // Add mock implementations if needed for specific tests
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SuggestionsService,
        { provide: Firestore, useValue: mockFirestore }
      ]
    });
    service = TestBed.inject(SuggestionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
