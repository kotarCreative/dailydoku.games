import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-suggest-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './suggest-dialog.component.html',
  styleUrl: './suggest-dialog.component.scss',
})
export class SuggestDialogComponent {
  suggestionForm = new FormGroup({
    name: new FormControl(''),
    url: new FormControl(''),
  });

  constructor(public dialogRef: DialogRef<string>) {}

  onSubmit() {
    console.log('Thanks for the suggestion!');
    this.dialogRef.close('Thanks for the suggestion!');
  }
}
