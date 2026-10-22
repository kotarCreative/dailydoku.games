import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HeaderComponent } from './header.component';
import { GamesService } from '@services/games.service';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, HttpClientTestingModule],
      providers: [GamesService, provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clears the favourites filter when Discover is selected', () => {
    const service = TestBed.inject(GamesService);
    service.setFilterFavourites(true);
    component.showDiscover();
    expect(service.filterFavourites).toBeFalse();
  });

  it('closes the mobile menu on Escape', () => {
    component.menuOpen.set(true);
    component.closeMenuOnEscape();
    expect(component.menuOpen()).toBeFalse();
  });

  it('does not include a search input in the mobile menu', () => {
    component.menuOpen.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#mobile-menu')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#mobile-menu input[type="search"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.desktop-search input')).not.toBeNull();
  });

  it('keeps search reactive to GamesService changes', () => {
    const service = TestBed.inject(GamesService);
    service.setSearchTerm('word');
    expect(component.searchTerm()).toBe('word');
  });

  it('does not render a separate desktop, mobile or menu favourites control', () => {
    component.menuOpen.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Show favourites"]')).toBeNull();
    const labels = [...fixture.nativeElement.querySelectorAll('button')].map(button => (button as HTMLElement).textContent?.trim());
    expect(labels).not.toContain('Favourites');
    expect(labels).not.toContain('My favourites');
  });
});
