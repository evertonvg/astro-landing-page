import type { SiteConfig } from '../site.config';

export type SeoSite = Pick<SiteConfig, 'name' | 'url' | 'email' | 'social'> & { logoUrl: string };

export function organizationJsonLd(s: SeoSite): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.name,
    url: s.url,
    logo: s.logoUrl,
    email: s.email,
    sameAs: s.social.map((link) => link.href),
  };
}

export function websiteJsonLd(s: SeoSite): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s.name,
    url: s.url,
  };
}

export function faqPageJsonLd(items: { question: string; answerText: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answerText },
    })),
  };
}

/** Serializes JSON-LD for inline `<script>`: escapes `<` so content can never close the tag. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, String.raw`\u003c`);
}

export const OG_SLUGS = ['index', 'privacidade', 'termos'] as const;

/** Slug of the generated OG image for a pathname; unknown pages fall back to `index`. */
export function ogSlug(pathname: string): (typeof OG_SLUGS)[number] {
  const slug = pathname.replace(/^\/|\/$/g, '') || 'index';
  return (OG_SLUGS as readonly string[]).includes(slug)
    ? (slug as (typeof OG_SLUGS)[number])
    : 'index';
}
