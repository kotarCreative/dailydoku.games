import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { Firestore } from '@angular/fire/firestore';

import { SuggestDialogComponent } from './suggest-dialog.component';
import { SuggestionsService } from '@services/suggestions.service';

describe('SuggestDialogComponent', () => {
  let component: SuggestDialogComponent;
  let fixture: ComponentFixture<SuggestDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockFirestore = {
    // Add mock implementations if needed
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestDialogComponent],
      providers: [
        { provide: DialogRef, useValue: mockDialogRef },
        SuggestionsService,
        { provide: Firestore, useValue: mockFirestore }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuggestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
