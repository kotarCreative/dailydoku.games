import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from '@components/header/header.component';
import { DailyBannerComponent } from '@components/daily-banner/daily-banner.component';
import { SeoService } from '@services/seo.service';
import { absoluteUrl } from '../../site-config';

@Component({
  selector: 'app-about',
  imports: [HeaderComponent, DailyBannerComponent, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: '../editorial-page.scss'
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    for (const key of ['game', 'game-item-list', 'category-item-list', 'discovery-item-list']) {
      this.seoService.removeJsonLd(key);
    }
    this.seoService.setMeta({
      title: 'About DailyDoku: Daily Puzzle Discovery & Your Routine',
      description: 'Learn how DailyDoku helps you discover daily puzzles, how games are listed, and what favourites and visit streaks store on your device.',
      url: '/about'
    });
    this.seoService.setJsonLd('breadcrumb', {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Daily Puzzles & Games', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'About DailyDoku', item: absoluteUrl('/about') }
      ]
    });
  }
}
