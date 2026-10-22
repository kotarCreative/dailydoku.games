import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconComponent] }).compileComponents();
    fixture = TestBed.createComponent(IconComponent);
  });

  it('renders an accessible-hidden external-link glyph by default', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(host.querySelector('svg path[d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"]')).not.toBeNull();
  });

  it('renders the requested icon variant', () => {
    fixture.componentInstance.name = 'arrow-right';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('svg path[d="M5 12h14"]')).not.toBeNull();
  });
});
