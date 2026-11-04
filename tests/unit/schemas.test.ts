import { describe, it, expect } from 'vitest';
import { z } from 'astro/zod';
import type { ImageFn } from '../../src/content/schemas';
import { heroSchema, pricingSchema, contactSchema, footerSchema } from '../../src/content/schemas';

// Stub for Astro's `image()` helper: images are plain strings in unit tests.
const image = (() => z.string()) as unknown as ImageFn;

const imageSlide = {
  background: { type: 'image', src: 'a.jpg', alt: 'Alt' },
  title: 'Título',
};
const button = { label: 'Ok', href: '#x' };

describe('hero schema', () => {
  const hero = heroSchema(image);

  it('accepts minimal image slide', () => {
    const parsed = hero.parse({ slides: [imageSlide] });
    expect(parsed.enabled).toBe(true);
    expect(parsed.transition).toBe('fade');
    expect(parsed.autoplay).toEqual({ enabled: true, intervalMs: 7000 });
    expect(parsed.slides[0]).toMatchObject({ overlay: 0.4, align: 'center', buttons: [] });
  });

  it('rejects 3 buttons', () => {
    const result = hero.safeParse({
      slides: [{ ...imageSlide, buttons: [button, button, button] }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['slides', 0, 'buttons']);
  });

  it('rejects youtube without poster', () => {
    const result = hero.safeParse({
      slides: [{ ...imageSlide, background: { type: 'youtube', videoId: 'aqz-KE-bpKQ' } }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects video without poster', () => {
    const result = hero.safeParse({
      slides: [{ ...imageSlide, background: { type: 'video', src: '/media/a.mp4' } }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects youtube id of wrong length', () => {
    const result = hero.safeParse({
      slides: [
        {
          ...imageSlide,
          background: { type: 'youtube', videoId: 'short', poster: 'p.jpg' },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty slides', () => {
    expect(hero.safeParse({ slides: [] }).success).toBe(false);
  });
});

describe('pricing schema', () => {
  const plan = { name: 'Básico', priceMonthly: 10, features: ['a'], cta: button };

  it('with billingToggle requires priceYearly on every plan', () => {
    const schema = pricingSchema();
    const base = { title: 'Preços', billingToggle: true };
    expect(
      schema.safeParse({ ...base, plans: [{ ...plan, priceYearly: 100 }, plan] }).success,
    ).toBe(false);
    expect(schema.safeParse({ ...base, plans: [{ ...plan, priceYearly: 100 }] }).success).toBe(
      true,
    );
  });
});

describe('contact schema', () => {
  it('rejects subject value with spaces', () => {
    const result = contactSchema().safeParse({
      title: 'Contato',
      subjects: [{ value: 'tem espaço', label: 'X' }],
      consentLabel: 'ok',
    });
    expect(result.success).toBe(false);
  });
});

describe('footer schema', () => {
  const footer = (link: object) => ({
    columns: [{ title: 'Empresa', links: [link] }],
    copyright: '© {year}',
  });

  it('accepts an optional section on links', () => {
    const schema = footerSchema();
    expect(
      schema.safeParse(footer({ label: 'Preços', href: '#precos', section: 'pricing' })).success,
    ).toBe(true);
    expect(schema.safeParse(footer({ label: 'Termos', href: '/termos' })).success).toBe(true);
  });

  it('rejects an unknown section', () => {
    expect(
      footerSchema().safeParse(footer({ label: 'X', href: '#x', section: 'nope' })).success,
    ).toBe(false);
  });
});
