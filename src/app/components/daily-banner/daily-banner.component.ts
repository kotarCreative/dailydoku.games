import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyWalkthroughService } from '@services/daily-walkthrough.service';

@Component({
  selector: 'app-daily-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-banner.component.html',
  styleUrl: './daily-banner.component.scss'
})
export class DailyBannerComponent {
  private _walkthroughService = inject(DailyWalkthroughService);

  readonly session = this._walkthroughService.session;
  readonly streak = this._walkthroughService.streak;

  readonly completedCount = computed(() => {
    const session = this.session();
    return session ? session.completedGames.length : 0;
  });

  readonly totalCount = computed(() => {
    const session = this.session();
    return session ? session.games.length : 0;
  });

  readonly isStarted = computed(() => {
    return this.completedCount() > 0;
  });
  
  readonly isCompleted = computed(() => {
      const session = this.session();
      if (!session) return false;
      return session.completedGames.length === session.games.length && session.games.length > 0;
  });

  readonly hasFavorites = computed(() => this.totalCount() > 0);

  startDailyWalkthrough() {
    if (!this.hasFavorites()) {
      const gameList = document.querySelector('app-game-list');
      if (gameList) {
        gameList.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    this._walkthroughService.startDailySession();
  }
}
