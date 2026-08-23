import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from '@components/header/header.component';
import { SeoService } from '@services/seo.service';

/**
 * Serves as the '**' route so unknown URLs render a real 404 page (with
 * noindex) instead of silently redirecting home and registering soft-404s.
 */
@Component({
  selector: 'app-not-found',
  imports: [HeaderComponent, RouterLink],
  template: `
    <app-header />
    <main
      class="flex min-h-[60vh] flex-col items-center justify-center bg-slate-700 px-6 text-center"
    >
      <p class="text-6xl font-bold text-slate-100">404</p>
      <h1 class="mt-4 text-2xl font-semibold text-slate-200">
        This puzzle doesn't exist... yet
      </h1>
      <p class="mt-3 max-w-md text-base text-slate-300">
        The page you're looking for has wandered off. Head back to the daily
        puzzles directory to find your next game.
      </p>
      <a
        routerLink="/"
        class="mt-8 rounded bg-emerald-700 px-6 py-2 font-semibold text-white hover:bg-emerald-600"
      >
        Browse daily games
      </a>
    </main>
  `
})
export class NotFoundComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setMeta({
      title: `Page Not Found | DailyDoku`,
      description: 'The page you are looking for does not exist.',
      robots: 'noindex, follow',
      type: 'website'
    });
  }
}
