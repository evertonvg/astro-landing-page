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
