import { Component, inject, OnInit } from '@angular/core';

import { HeaderComponent } from '@components/header/header.component';
import { GameListComponent } from '@components/game-list/game-list.component';
import { SeoService } from '@services/seo.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, GameListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Dailydoku: A place to discover puzzle games',
      description: 'Find your new favourite puzzle game. Search for games like wordle, cine2nerdle, pokedoku, and more.',
      url: '/',
      keywords: 'daily puzzle games, wordle, pokedoku, word games, trivia games, puzzle games, daily games, wordle alternatives',
      type: 'website'
    });
  }
}
