import { Component, computed, inject, signal, HostListener } from "@angular/core";
import { Dialog, DialogModule } from "@angular/cdk/dialog";
import { SuggestDialogComponent } from "@components/dialogs/suggest-dialog/suggest-dialog.component";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";

import { GamesService } from "@services/games.service";
import { DailyWalkthroughService } from "@services/daily-walkthrough.service";
import { DailyWalkthroughComponent } from "@components/daily-walkthrough/daily-walkthrough.component";
import { IconComponent } from "@components/icon/icon.component";

@Component({
    selector: "app-header",
    imports: [DialogModule, CommonModule, DailyWalkthroughComponent, RouterLink, IconComponent],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss"
})
export class HeaderComponent {
  menuOpen = signal(false);
  searchTerm = computed(() => this._gamesService.searchTerm);

  private _gamesService: GamesService = inject(GamesService);
  private _walkthroughService: DailyWalkthroughService = inject(DailyWalkthroughService);
  private _dialog: Dialog = inject(Dialog);
  private _router = inject(Router);

  readonly dailyProgress = this._walkthroughService.progress;
  readonly isWalkthroughActive = this._walkthroughService.isActive;
  readonly dailySession = this._walkthroughService.session;

  @HostListener('document:keydown.escape')
  closeMenuOnEscape() { this.menuOpen.set(false); }

  @HostListener('document:keydown', ['$event'])
  focusSearchShortcut(event: KeyboardEvent) {
    if (event.key !== '/' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (document.querySelector('[role="dialog"], dialog[open], .cdk-overlay-pane')) return;
    const searches = Array.from(document.querySelectorAll<HTMLInputElement>('app-header input[type="search"]'));
    const visible = searches.find((input) => input.getClientRects().length > 0);
    if (visible) {
      event.preventDefault();
      visible.focus();
    }
  }

  showDiscover() {
    this._gamesService.setFilterFavourites(false);
    this.menuOpen.set(false);
    if (this._router.url !== '/') void this._router.navigateByUrl('/');
  }

  openSuggestDialog() {
    this._dialog.open(SuggestDialogComponent, {
      ariaModal: true,
      hasBackdrop: true,
      disableClose: false,
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this._gamesService.setSearchTerm(target.value);
    if (this._router.url !== '/') void this._router.navigateByUrl('/');
  }
}
