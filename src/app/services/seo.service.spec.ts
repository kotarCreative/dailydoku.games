import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';
import { DEFAULT_OG_IMAGE, absoluteUrl } from '../site-config';

describe('SeoService', () => {
  let service: SeoService;
  let page: Document;

  beforeEach(() => {
    page = document.implementation.createHTMLDocument('SEO test');
    TestBed.configureTestingModule({ providers: [SeoService, { provide: DOCUMENT, useValue: page }] });
    service = TestBed.inject(SeoService);
  });

  it('replaces route metadata and removes stale keywords', () => {
    service.setMeta({ title: 'Game', description: 'Game details', url: '/games/wordle', keywords: 'Wordle' });
    service.setMeta({ title: 'Guide', description: 'Compare alternatives', url: '/games-like-wordle' });
    expect(page.title).toBe('Guide');
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(absoluteUrl('/games-like-wordle'));
    expect(page.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(page.querySelector('meta[name="keywords"]')).toBeNull();
    expect(page.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(DEFAULT_OG_IMAGE);
    expect(page.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('max-image-preview:large');
  });

  it('replaces and removes owned schema without removing site-wide schema', () => {
    service.setJsonLd('website', { '@type': 'WebSite' });
    service.setJsonLd('game', { '@type': 'Game', name: 'First' });
    service.setJsonLd('game', { '@type': 'Game', name: 'Second' });
    expect(page.querySelectorAll('[data-seo-key="game"]').length).toBe(1);
    service.removeJsonLd('game');
    expect(page.querySelector('[data-seo-key="game"]')).toBeNull();
    expect(page.querySelector('[data-seo-key="website"]')).not.toBeNull();
  });
});
