import { Component, computed, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GamesService } from '@services/games.service';
import { CATEGORIES } from '../../site-config';

@Component({
  selector: 'app-game-filters',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-filters.component.html',
  styleUrl: './game-filters.component.scss'
})
export class GameFiltersComponent {
  private gamesService = inject(GamesService);
  private router = inject(Router);
  @Input() activeCategory: string | null = null;

  readonly categories = CATEGORIES.map(category => ({ ...category, label: category.heading.replace(/^Daily /, '') }));
  readonly favouritesActive = computed(() => this.gamesService.filterFavourites);

  showFavourites(): void {
    this.gamesService.setFilterFavourites(true);
    if (this.router.url !== '/') void this.router.navigateByUrl('/');
  }

  clearFavourites(): void {
    this.gamesService.setFilterFavourites(false);
  }
}
