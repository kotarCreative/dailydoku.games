import guides from '../discovery-guides.json';

export interface DiscoveryGuide {
  path: string;
  sourceSlug: string;
  heading: string;
  title: string;
  description: string;
  intro: string;
  selectionNote: string;
  chooseHeading: string;
  chooseText: string;
  picks: { slug: string; bestFor: string; comparison: string }[];
  questions: { question: string; answer: string }[];
}

/** Shared with sitemap generation; new guides cannot silently miss the sitemap. */
export const DISCOVERY_GUIDES: DiscoveryGuide[] = guides;

export function guidesForGame(slug: string): DiscoveryGuide[] {
  return DISCOVERY_GUIDES.filter(guide => guide.picks.some(pick => pick.slug === slug)
    || guide.sourceSlug === slug);
}
