import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../../src/components/sections/Hero.astro';
import slideImage from '../../src/assets/hero/slide-1.jpg';
import posterImage from '../../src/assets/hero/poster-video.jpg';

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

const videoSlide = (background: Record<string, unknown>) => ({
  ...slide('Vídeo'),
  background,
});

async function renderSlides(slides: ReturnType<typeof slide>[]) {
  const container = await AstroContainer.create();
  return container.renderToString(Hero, {
    props: { data: { ...data([]), slides } },
  });
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

  it.each([
    ['mp4', { type: 'video', src: '/media/x.mp4', poster: posterImage }],
    ['youtube', { type: 'youtube', videoId: 'aqz-KE-bpKQ', poster: posterImage }],
  ])('single-slide %s hero has its own pause and play buttons', async (_name, background) => {
    const html = await renderSlides([videoSlide(background) as ReturnType<typeof slide>]);
    expect(html).toContain('x-data="heroVideo"');
    expect(html).toContain('aria-label="Pausar carrossel"');
    expect(html).toContain('aria-label="Reproduzir carrossel"');
    expect(html).not.toContain('aria-roledescription="carousel"');
  });

  it('single-slide image hero has no pause control', async () => {
    const html = await render(['Único']);
    expect(html).not.toContain('heroVideo');
    expect(html).not.toContain('Pausar carrossel');
  });

  it('carousel with a video slide enables pausing', async () => {
    const html = await renderSlides([
      slide('Primeiro'),
      videoSlide({ type: 'video', src: '/media/x.mp4', poster: posterImage }) as ReturnType<
        typeof slide
      >,
    ]);
    expect(html).toContain('&quot;hasVideo&quot;:true');
  });
});
