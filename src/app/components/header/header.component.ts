import { Component, signal } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { SuggestDialogComponent } from '@components/dialogs/suggest-dialog/suggest-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  menuOpen = signal(false);

  constructor(private _dialog: Dialog) {}

  openSuggestDialog() {
    this._dialog.open(SuggestDialogComponent, {
      width: '40%',
      ariaModal: true,
      hasBackdrop: true,
      disableClose: false,
    });
  }
}
