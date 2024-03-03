import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { ISuggestion } from '@models/Suggestion';

@Injectable({
  providedIn: 'root'
})
export class SuggestionsService {
  firestore: Firestore = inject(Firestore);

  private suggestionsCollection = collection(this.firestore, 'suggestions');

  constructor() { }

  async addSuggestion(suggestion: ISuggestion): Promise<void> {
    addDoc(this.suggestionsCollection, { suggestion });
  }
}
