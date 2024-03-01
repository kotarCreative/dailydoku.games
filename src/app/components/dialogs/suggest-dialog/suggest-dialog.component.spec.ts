import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestDialogComponent } from './suggest-dialog.component';

describe('SuggestDialogComponent', () => {
  let component: SuggestDialogComponent;
  let fixture: ComponentFixture<SuggestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestDialogComponent]
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
