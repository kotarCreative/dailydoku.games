import { Component, effect, inject, signal } from "@angular/core";
import { Dialog, DialogModule } from "@angular/cdk/dialog";
import { SuggestDialogComponent } from "@components/dialogs/suggest-dialog/suggest-dialog.component";

import { GamesService } from "@services/games.service";

@Component({
    selector: "app-header",
    imports: [DialogModule],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss"
})
export class HeaderComponent {
  menuOpen = signal(false);
  filterFavourites = signal(false);

  private _gamesService: GamesService = inject(GamesService);
  private _dialog: Dialog = inject(Dialog);

  constructor() {
    this.filterFavourites.set(this._gamesService.filterFavourites);
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
}
