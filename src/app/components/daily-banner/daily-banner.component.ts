import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyWalkthroughService } from '@services/daily-walkthrough.service';
import { GamesService } from '@services/games.service';
import { IconComponent } from '@components/icon/icon.component';
import { IGame } from '@models/Game';

@Component({
  selector: 'app-daily-banner',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './daily-banner.component.html',
  styleUrl: './daily-banner.component.scss'
})
export class DailyBannerComponent {
  private _walkthroughService = inject(DailyWalkthroughService);
  private _games = inject(GamesService);

  readonly session = this._walkthroughService.session;
  readonly streak = this._walkthroughService.streak;

  readonly today = new Date();
  readonly lineup = computed(() => {
    const session = this.session();
    if (!session) return [];
    return session.games.map(name => this._games.allGames.find(g => g.name === name)).filter((g): g is IGame => !!g);
  });
  readonly hasFavorites = computed(() => this.lineup().length > 0);
  readonly visitedCount = computed(() => this.lineup().filter(g => this.isVisited(g.name)).length);
  readonly progress = computed(() => this.lineup().length ? this.visitedCount() / this.lineup().length * 100 : 0);
  readonly nextGame = computed(() => this.lineup().find(g => !this.isVisited(g.name)) ?? null);
  readonly actionLabel = computed(() => !this.hasFavorites() ? 'Browse games' : this.visitedCount() === this.lineup().length ? 'Review my routine' : this.visitedCount() ? 'Resume my routine' : 'Start my routine');
  readonly mobileActionLabel = computed(() => !this.hasFavorites() ? 'Browse' : this.visitedCount() === this.lineup().length ? 'Review' : this.visitedCount() ? 'Resume' : 'Start');

  isVisited(name: string): boolean { return this._walkthroughService.getGameStatus(name) === 'completed'; }

  startDailyWalkthrough() {
    if (!this.hasFavorites()) {
      this.browse();
      return;
    }
    this._walkthroughService.startDailySession();
  }

  browse(favouritesOnly = false) {
    this._games.setFilterFavourites(favouritesOnly);
    if (typeof document !== 'undefined') {
      const gameList = document.querySelector('#games, #category-games, app-game-list');
      if (gameList) {
        gameList.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
