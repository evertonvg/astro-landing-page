import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../../src/components/sections/Hero.astro';
import slideImage from '../../src/assets/hero/slide-1.jpg';

const slide = (title: string) => ({
  background: { type: 'image' as const, src: slideImage, alt: 'Fundo' },
  overlay: 0.4,
  align: 'center' as const,
  title,
  buttons: [],
});

const data = (titles: string[]) => ({
  enabled: true,
  autoplay: { enabled: true, intervalMs: 7000 },
  transition: 'fade' as const,
  slides: titles.map(slide),
});

async function render(titles: string[]) {
  const container = await AstroContainer.create();
  return container.renderToString(Hero, { props: { data: data(titles) } });
}

describe('Hero', () => {
  it('single slide renders without carousel', async () => {
    const html = await render(['Único']);
    expect(html).toContain('<h1');
    expect(html).not.toContain('aria-roledescription="carousel"');
    expect(html).not.toContain('Próximo slide');
    expect(html).not.toContain('x-data="carousel');
  });

  it('multiple slides render carousel controls and a single h1', async () => {
    const html = await render(['Primeiro', 'Segundo']);
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('Ir para o slide 2');
    expect(html.match(/<h1/g)).toHaveLength(1);
  });
});
