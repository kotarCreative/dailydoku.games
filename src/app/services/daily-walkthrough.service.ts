import { computed, effect, inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GamesService } from './games.service';
import { DailySession } from '@models/daily-session';
import { IGame } from '@models/Game';

@Injectable({
  providedIn: 'root'
})
export class DailyWalkthroughService {
  private _gamesService = inject(GamesService);
  private platformId = inject(PLATFORM_ID);

  private _currentSession: WritableSignal<DailySession | null> = signal(null);
  private _currentStreak: WritableSignal<number> = signal(0);
  private _isWalkthroughActive: WritableSignal<boolean> = signal(false);

  readonly progress = computed(() => {
    const session = this._currentSession();
    if (!session || session.games.length === 0) return 0;
    return (session.completedGames.length / session.games.length) * 100;
  });

  readonly session = computed(() => this._currentSession());
  readonly streak = computed(() => this._currentStreak());
  readonly isActive = computed(() => this._isWalkthroughActive());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this._loadState();
      this._checkAndResetDaily();
    }

    effect(() => {
      this._saveState();
    });

    // Listen to favorite changes
    effect(() => {
       // We access the signal directly to get reactive updates
       const favorites = this._gamesService.allGames
        .filter(g => this._gamesService.isFavourite(g))
        .map(g => g.name);
        
       this._syncFavorites(favorites);
    }, { allowSignalWrites: true });
  }

  startDailySession() {
    this._checkAndResetDaily();
    this._isWalkthroughActive.set(true);
  }

  stopDailySession() {
    this._isWalkthroughActive.set(false);
  }

  completeGame(gameName: string) {
    const session = this._currentSession();
    if (!session) return;

    if (!session.completedGames.includes(gameName)) {
      const updatedSession = {
        ...session,
        completedGames: [...session.completedGames, gameName]
      };

      // Check for daily completion
      if (updatedSession.completedGames.length === updatedSession.games.length && 
          session.completedGames.length !== session.games.length) {
        this._incrementStreak();
        updatedSession.endTime = Date.now();
      }

      this._currentSession.set(updatedSession);
    }
  }

  getGameStatus(gameName: string): 'pending' | 'completed' | 'not-in-session' {
    const session = this._currentSession();
    if (!session) return 'not-in-session';
    
    if (!session.games.includes(gameName)) return 'not-in-session';
    return session.completedGames.includes(gameName) ? 'completed' : 'pending';
  }

  private _syncFavorites(currentFavorites: string[]) {
      const session = this._currentSession();
      if (!session) return;
      
      const today = new Date().toISOString().split('T')[0];
      if (session.date !== today) return; // Only sync for current day session

      const sessionGamesSet = new Set(session.games);
      const currentFavoritesSet = new Set(currentFavorites);
      
      // Find added games
      const addedGames = currentFavorites.filter(g => !sessionGamesSet.has(g));
      
      // Find removed games
      const removedGames = session.games.filter(g => !currentFavoritesSet.has(g));
      
      if (addedGames.length === 0 && removedGames.length === 0) return;
      
      let updatedGames = [...session.games];
      
      // Remove games
      if (removedGames.length > 0) {
          updatedGames = updatedGames.filter(g => !removedGames.includes(g));
      }
      
      // Add games (append to end to preserve existing random order)
      if (addedGames.length > 0) {
          // Shuffle new additions before appending
          updatedGames = [...updatedGames, ...this._shuffleArray(addedGames)];
      }
      
      // Update completed games (remove if game removed)
      const updatedCompleted = session.completedGames.filter(g => updatedGames.includes(g));
      
      this._currentSession.set({
          ...session,
          games: updatedGames,
          completedGames: updatedCompleted
      });
  }

  private _checkAndResetDaily() {
    const today = new Date().toISOString().split('T')[0];
    const session = this._currentSession();

    if (!session || session.date !== today) {
      // If we had a session from yesterday that wasn't completed, reset streak
      if (session && session.date !== today) {
         if (session.completedGames.length < session.games.length) {
            this._currentStreak.set(0);
         }
      }

      const allFavorites = this._gamesService.allGames
        .filter(g => this._gamesService.isFavourite(g))
        .map(g => g.name);

      if (allFavorites.length > 0) {
        const newSession: DailySession = {
          date: today,
          games: this._shuffleArray(allFavorites),
          completedGames: [],
          startTime: Date.now()
        };
        this._currentSession.set(newSession);
      }
    } else {
        // We do minimal sync on load here, but real sync happens via the effect
        // Just handle empty initialization case
        const allFavorites = this._gamesService.allGames
        .filter(g => this._gamesService.isFavourite(g))
        .map(g => g.name);

        if (session.games.length === 0 && allFavorites.length > 0) {
             const newSession: DailySession = {
                date: today,
                games: this._shuffleArray(allFavorites),
                completedGames: [],
                startTime: Date.now()
             };
             this._currentSession.set(newSession);
        }
    }
  }

  private _incrementStreak() {
    this._currentStreak.update(s => s + 1);
  }

  private _shuffleArray(array: string[]): string[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private _saveState() {
    if (isPlatformBrowser(this.platformId)) {
      const state = {
        session: this._currentSession(),
        streak: this._currentStreak()
      };
      localStorage.setItem('dailyDoku-walkthrough', JSON.stringify(state));
    }
  }

  private _loadState() {
    const saved = localStorage.getItem('dailyDoku-walkthrough');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this._currentSession.set(state.session);
        this._currentStreak.set(state.streak || 0);
      } catch (e) {
        console.error('Failed to load walkthrough state', e);
      }
    }
  }
}
