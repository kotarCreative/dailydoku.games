import { DialogRef } from "@angular/cdk/dialog";
import { Component, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { SuggestionsService } from "@services/suggestions.service";

@Component({
  selector: "app-suggest-dialog",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./suggest-dialog.component.html",
  styleUrl: "./suggest-dialog.component.scss",
})
export class SuggestDialogComponent {
  suggestionForm!: FormGroup;
  loading = signal(false);
  showThankYou = signal(true);

  get name() {
    return this.suggestionForm.get("name")!;
  }

  get url() {
    return this.suggestionForm.get("url")!;
  }

  constructor(
    public dialogRef: DialogRef<string>,
    private _suggestionsService: SuggestionsService,
  ) {}

  ngOnInit() {
    this.suggestionForm = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(3)]),
      url: new FormControl("", [
        Validators.required,
        Validators.pattern("https?://.+"),
      ]),
    });
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.loading() || this.suggestionForm.invalid) {
      return;
    }

    this.loading.set(true);
    this._suggestionsService
      .addSuggestion({
        name: this.name.value,
        url: this.url.value,
      })
      .then(() => {
        this.showThankYou.set(true);
        setTimeout(() => {
          this.dialogRef.close();
        }, 2000);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}
