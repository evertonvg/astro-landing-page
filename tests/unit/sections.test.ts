import { describe, it, expect } from 'vitest';
import { buildNav } from '../../src/lib/sections';

describe('buildNav', () => {
  it('drops links of disabled sections', () => {
    const links = [
      { label: 'Recursos', href: '#features', section: 'features' as const },
      { label: 'FAQ', href: '#faq', section: 'faq' as const },
      { label: 'Blog', href: '/blog' },
    ];
    expect(buildNav(links, new Set(['features']))).toEqual([links[0], links[2]]);
  });
});

describe('buildNav with footer links', () => {
  it('keeps extra link fields and drops disabled sections', () => {
    const links = [
      { label: 'Preços', href: '#precos', section: 'pricing' as const },
      { label: 'Termos', href: '/termos' },
    ];
    expect(buildNav(links, new Set())).toEqual([links[1]]);
  });
});
