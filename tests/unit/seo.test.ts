import { describe, it, expect } from 'vitest';
import { organizationJsonLd, websiteJsonLd, faqPageJsonLd } from '../../src/lib/seo';

const s = {
  name: 'Sua Empresa',
  url: 'https://example.com',
  email: 'contato@example.com',
  social: [{ label: 'Instagram', href: 'https://instagram.com/x', icon: 'lucide:instagram' }],
  logoUrl: 'https://example.com/logo.png',
};

describe('seo', () => {
  it('organization includes sameAs from social links', () => {
    expect(organizationJsonLd(s)).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Sua Empresa',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      sameAs: ['https://instagram.com/x'],
    });
  });
  it('website has name and url', () => {
    expect(websiteJsonLd(s)).toMatchObject({ '@type': 'WebSite', url: 'https://example.com' });
  });
  it('faq page maps items to Question/Answer', () => {
    const ld = faqPageJsonLd([{ question: 'P?', answerText: 'R.' }]) as { mainEntity: unknown[] };
    expect(ld).toMatchObject({ '@type': 'FAQPage' });
    expect(ld.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'P?',
      acceptedAnswer: { '@type': 'Answer', text: 'R.' },
    });
  });
});
