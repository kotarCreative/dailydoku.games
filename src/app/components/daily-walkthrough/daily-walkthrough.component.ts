import { Component, computed, inject, HostListener, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyWalkthroughService } from '@services/daily-walkthrough.service';
import { GamesService } from '@services/games.service';
import { IGame } from '@models/Game';
import { IconComponent } from '@components/icon/icon.component';

@Component({
  selector: 'app-daily-walkthrough',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './daily-walkthrough.component.html',
  styleUrls: ['./daily-walkthrough.component.scss']
})
export class DailyWalkthroughComponent implements OnInit, OnDestroy {
  private _walkthroughService = inject(DailyWalkthroughService);
  private _gamesService = inject(GamesService);
  private element = inject(ElementRef<HTMLElement>);
  private previousFocus: HTMLElement | null = null;
  private previousOverflow = '';

  readonly session = this._walkthroughService.session;
  readonly progress = this._walkthroughService.progress;
  readonly streak = this._walkthroughService.streak;

  readonly sortedGames = computed(() => {
    const session = this.session();
    if (!session) return [];
    
    // Return games in the random order determined for the day
    return session.games
       .map(name => this._gamesService.allGames.find(g => g.name === name) ?? this._gamesService.getGameBySlug(this._slugify(name)))
      .filter((g): g is IGame => !!g);
  });

  readonly remainingGamesCount = computed(() => {
     const session = this.session();
     return session ? session.games.length - session.completedGames.length : 0;
  });

  readonly visitedCount = computed(() => this.sortedGames().filter(g => this.isCompleted(g.name)).length);
  readonly nextGame = computed(() => this.sortedGames().find(g => !this.isCompleted(g.name)) ?? null);
  readonly summary = computed(() => this.sortedGames().length && this.visitedCount() === this.sortedGames().length ? 'All visited!' : 'Make a little time.');

  ngOnInit() {
    if (typeof document === 'undefined') return;
    this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => (this.element.nativeElement.querySelector('.close-btn') as HTMLElement | null)?.focus());
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.previousOverflow;
      this.previousFocus?.focus();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); this.exitWalkthrough(); }
    if (event.key !== 'Tab') return;
    const focusable = [...this.element.nativeElement.querySelectorAll('a[href],button:not([disabled]),[role="region"][tabindex="0"]')] as HTMLElement[];
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!this.element.nativeElement.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  isCompleted(gameName: string): boolean {
    return this._walkthroughService.getGameStatus(gameName) === 'completed';
  }

  toggleComplete(gameName: string, event: Event) {
    event.stopPropagation();
    this._walkthroughService.completeGame(gameName);
  }

  playGame(game: IGame) {
    // A game is visited only when its outbound link is activated.
    this._walkthroughService.completeGame(game.name);
  }
  
  exitWalkthrough() {
      this._walkthroughService.stopDailySession();
  }

  editFavourites() {
    this._gamesService.setFilterFavourites(true);
    this.exitWalkthrough();
    if (typeof document !== 'undefined') {
      document.querySelector('#games, #category-games, app-game-list')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private _slugify(text: string): string {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  }
}
