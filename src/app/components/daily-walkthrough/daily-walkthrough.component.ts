import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyWalkthroughService } from '@services/daily-walkthrough.service';
import { GamesService } from '@services/games.service';
import { GameCardComponent } from '@components/game-card/game-card.component';
import { IGame } from '@models/Game';

@Component({
  selector: 'app-daily-walkthrough',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './daily-walkthrough.component.html',
  styleUrls: ['./daily-walkthrough.component.scss']
})
export class DailyWalkthroughComponent {
  private _walkthroughService = inject(DailyWalkthroughService);
  private _gamesService = inject(GamesService);

  readonly session = this._walkthroughService.session;
  readonly progress = this._walkthroughService.progress;
  readonly streak = this._walkthroughService.streak;

  readonly sortedGames = computed(() => {
    const session = this.session();
    if (!session) return [];
    
    // Return games in the random order determined for the day
    return session.games
      .map(name => this._gamesService.getGameBySlug(this._slugify(name))) // Assuming name->slug mapping or direct lookup
      // Fallback: try to find by name directly if slug lookup fails or name isn't slug
      .map((game, index) => {
         if (!game) return this._gamesService.allGames.find(g => g.name === session.games[index]);
         return game;
      })
      .filter((g): g is IGame => !!g);
  });

  readonly remainingGamesCount = computed(() => {
     const session = this.session();
     return session ? session.games.length - session.completedGames.length : 0;
  });

  isCompleted(gameName: string): boolean {
    return this._walkthroughService.getGameStatus(gameName) === 'completed';
  }

  toggleComplete(gameName: string, event: Event) {
    event.stopPropagation();
    this._walkthroughService.completeGame(gameName);
  }

  playGame(game: IGame) {
    // Mark as complete immediately when playing
    this._walkthroughService.completeGame(game.name);
    
    // Stop the walkthrough overlay so the user can see the game page
    this._walkthroughService.stopDailySession();

    // Navigate to the game page directly
    window.open(game.url, '_blank');
  }
  
  exitWalkthrough() {
      this._walkthroughService.stopDailySession();
  }

  // Helper as utility since games service uses slug lookup but favorites stores names
  private _slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  }
}
