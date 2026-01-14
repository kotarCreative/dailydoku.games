import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, CollectionReference } from '@angular/fire/firestore';
import { ISuggestion } from '@models/Suggestion';

@Injectable({
  providedIn: 'root'
})
export class SuggestionsService {
  firestore: Firestore = inject(Firestore);

  private suggestionsCollection!: CollectionReference;

  constructor() {
    try {
        this.suggestionsCollection = collection(this.firestore, 'suggestions');
    } catch (e) {
        // Fallback for tests or when firestore is not properly initialized
        console.warn('Firestore not initialized correctly', e);
    }
  }

  async addSuggestion(suggestion: ISuggestion): Promise<void> {
    if (this.suggestionsCollection) {
        addDoc(this.suggestionsCollection, { suggestion });
    }
  }
}
