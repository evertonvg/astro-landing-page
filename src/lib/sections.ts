import { getEntry, type CollectionEntry } from 'astro:content';
import type { SectionKey } from '../content/schemas';

type CollectionKey = SectionKey | 'header' | 'footer';
export type HeaderLink = CollectionEntry<'header'>['data']['links'][number];

const SECTION_KEYS: SectionKey[] = [
  'hero',
  'logos',
  'features',
  'how-it-works',
  'testimonials',
  'pricing',
  'faq',
  'cta',
  'contact',
];

/** Returns a section's data, or null when the entry is missing or `enabled: false`. */
export async function getSection<K extends CollectionKey>(
  key: K,
): Promise<CollectionEntry<K>['data'] | null> {
  const entry = await getEntry(key, key);
  if (!entry) return null;
  const data = entry.data as CollectionEntry<K>['data'] & { enabled?: boolean };
  return data.enabled === false ? null : data;
}

export async function enabledSections(): Promise<Set<SectionKey>> {
  const found = await Promise.all(
    SECTION_KEYS.map(async (key) => ((await getSection(key)) ? key : null)),
  );
  return new Set(found.filter((key): key is SectionKey => key !== null));
}

/** Drops links that point to a disabled (or missing) section. */
export function buildNav<T extends { section?: SectionKey }>(
  links: T[],
  enabled: Set<SectionKey>,
): T[] {
  return links.filter((link) => !link.section || enabled.has(link.section));
}

/** Anchors (`#x`) only work on the home page; elsewhere they must point back to `/#x`. */
export function pageHref(href: string, pathname: string): string {
  return href.startsWith('#') && pathname !== '/' ? `/${href}` : href;
}
