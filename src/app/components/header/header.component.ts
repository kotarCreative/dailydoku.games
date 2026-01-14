import { Component, inject, signal, computed } from "@angular/core";
import { Dialog, DialogModule } from "@angular/cdk/dialog";
import { SuggestDialogComponent } from "@components/dialogs/suggest-dialog/suggest-dialog.component";
import { CommonModule } from "@angular/common";

import { GamesService } from "@services/games.service";
import { DailyWalkthroughService } from "@services/daily-walkthrough.service";
import { DailyWalkthroughComponent } from "@components/daily-walkthrough/daily-walkthrough.component";

@Component({
    selector: "app-header",
    imports: [DialogModule, CommonModule, DailyWalkthroughComponent],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss"
})
export class HeaderComponent {
  menuOpen = signal(false);
  filterFavourites = signal(false);
  searchTerm = signal('');

  private _gamesService: GamesService = inject(GamesService);
  private _walkthroughService: DailyWalkthroughService = inject(DailyWalkthroughService);
  private _dialog: Dialog = inject(Dialog);

  readonly dailyProgress = this._walkthroughService.progress;
  readonly isWalkthroughActive = this._walkthroughService.isActive;
  readonly dailySession = this._walkthroughService.session;

  constructor() {
    this.filterFavourites.set(this._gamesService.filterFavourites);
    this.searchTerm.set(this._gamesService.searchTerm);
  }

  openSuggestDialog() {
    this._dialog.open(SuggestDialogComponent, {
      ariaModal: true,
      hasBackdrop: true,
      disableClose: false,
    });
  }

  onFilterFavourites() {
    this.filterFavourites.set(!this.filterFavourites());
    this._gamesService.setFilterFavourites(this.filterFavourites());
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this._gamesService.setSearchTerm(target.value);
  }
}
