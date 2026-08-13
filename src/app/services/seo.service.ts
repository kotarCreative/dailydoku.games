import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  TWITTER_HANDLE,
  absoluteUrl
} from '../site-config';

interface SeoConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  robots?: string;
  keywords?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  setMeta(config: SeoConfig): void {
    const {
      title,
      description,
      url,
      image = DEFAULT_OG_IMAGE,
      imageAlt = title,
      type = 'website',
      robots = 'index, follow',
      keywords
    } = config;

    const fullUrl = absoluteUrl(url);

    // Basic meta tags
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });

    // Keywords (if provided)
    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:site', content: TWITTER_HANDLE });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });

    // Canonical URL
    this.updateCanonicalUrl(fullUrl);
  }

  private updateCanonicalUrl(url: string): void {
    // Find existing canonical link or create new one
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  setJsonLd(key: string, data: object): void {
    let script = this.document.querySelector<HTMLScriptElement>(
      `script[type="application/ld+json"][data-seo-key="${key}"]`
    );

    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-key', key);
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }

  /**
   * Removes a previously injected JSON-LD block. Needed because the document is
   * reused across client-side navigations, so stale schema from another route
   * would otherwise linger in the head.
   */
  removeJsonLd(key: string): void {
    this.document
      .querySelector(`script[type="application/ld+json"][data-seo-key="${key}"]`)
      ?.remove();
  }
}
