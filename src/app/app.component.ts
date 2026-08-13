import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SeoService } from '@services/seo.service';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl
} from './site-config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  private seoService = inject(SeoService);

  constructor() {
    // Site-wide schema. Lives here rather than in index.html so the canonical
    // domain and description come from one place and stay in sync.
    this.seoService.setJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: 'Daily Doku',
      url: absoluteUrl('/'),
      description: DEFAULT_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#organization` }
    });

    this.seoService.setJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE
      }
    });
  }
}
