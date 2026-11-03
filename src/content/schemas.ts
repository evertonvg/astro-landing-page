import { z } from 'astro/zod';
import type { SchemaContext } from 'astro/content/config';

/** Astro's `image()` schema helper, injected by the collection schema callback. */
export type ImageFn = SchemaContext['image'];

export type SectionKey =
  | 'hero'
  | 'logos'
  | 'features'
  | 'how-it-works'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'contact';

const sectionKeySchema = z.enum([
  'hero',
  'logos',
  'features',
  'how-it-works',
  'testimonials',
  'pricing',
  'faq',
  'cta',
  'contact',
]);

const enabled = z.boolean().default(true);

export const buttonSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(['primary', 'secondary']).default('primary'),
});

const buttonsSchema = z.array(buttonSchema).max(2).default([]);

export const headerSchema = (image: ImageFn) =>
  z.object({
    logo: image(),
    logoAlt: z.string().min(1),
    links: z.array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        section: sectionKeySchema.optional(),
      }),
    ),
    cta: buttonSchema.optional(),
  });

const backgroundSchema = (image: ImageFn) =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('image'), src: image(), alt: z.string() }),
    z.object({
      type: z.literal('video'),
      src: z.string().regex(/^\/.+\.mp4$/),
      poster: image(),
    }),
    z.object({
      type: z.literal('youtube'),
      videoId: z.string().regex(/^[\w-]{11}$/),
      poster: image(),
    }),
  ]);

export const heroSchema = (image: ImageFn) =>
  z.object({
    enabled,
    autoplay: z
      .object({
        enabled: z.boolean().default(true),
        intervalMs: z.number().int().min(3000).max(20000).default(7000),
      })
      .default({ enabled: true, intervalMs: 7000 }),
    transition: z.enum(['fade', 'slide']).default('fade'),
    slides: z
      .array(
        z.object({
          background: backgroundSchema(image),
          overlay: z.number().min(0).max(0.9).default(0.4),
          align: z.enum(['left', 'center', 'right']).default('center'),
          title: z.string().min(1),
          description: z.string().optional(),
          buttons: buttonsSchema,
        }),
      )
      .min(1),
  });

export const logosSchema = (image: ImageFn) =>
  z.object({
    enabled,
    title: z.string().min(1),
    items: z.array(z.object({ name: z.string().min(1), image: image() })).min(1),
  });

export const featuresSchema = () =>
  z.object({
    enabled,
    title: z.string().min(1),
    subtitle: z.string().optional(),
    items: z
      .array(
        z.object({
          icon: z.string().min(1),
          title: z.string().min(1),
          description: z.string().min(1),
        }),
      )
      .min(1),
  });

export const howItWorksSchema = () =>
  z.object({
    enabled,
    title: z.string().min(1),
    steps: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(1),
  });

export const testimonialsSchema = (image: ImageFn) =>
  z.object({
    enabled,
    title: z.string().min(1),
    items: z
      .array(
        z.object({
          quote: z.string().min(1),
          name: z.string().min(1),
          role: z.string().min(1),
          company: z.string().min(1),
          avatar: image().optional(),
        }),
      )
      .min(1),
  });

export const pricingSchema = () =>
  z
    .object({
      enabled,
      title: z.string().min(1),
      subtitle: z.string().optional(),
      billingToggle: z.boolean().default(false),
      plans: z
        .array(
          z.object({
            name: z.string().min(1),
            priceMonthly: z.number().min(0),
            priceYearly: z.number().min(0).optional(),
            features: z.array(z.string().min(1)),
            highlighted: z.boolean().default(false),
            cta: buttonSchema,
          }),
        )
        .min(1),
    })
    .refine((d) => !d.billingToggle || d.plans.every((p) => p.priceYearly !== undefined), {
      message: 'billingToggle requires priceYearly on every plan',
      path: ['plans'],
    });

export const faqSchema = () =>
  z.object({
    enabled,
    title: z.string().min(1),
    items: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
  });

export const ctaSchema = () =>
  z.object({
    enabled,
    title: z.string().min(1),
    description: z.string().optional(),
    buttons: buttonsSchema,
  });

export const contactSchema = () =>
  z.object({
    enabled,
    title: z.string().min(1),
    description: z.string().optional(),
    subjects: z
      .array(z.object({ value: z.string().regex(/^[a-z0-9-]+$/), label: z.string().min(1) }))
      .min(1),
    consentLabel: z.string().min(1),
  });

export const footerSchema = () =>
  z.object({
    columns: z.array(
      z.object({
        title: z.string().min(1),
        links: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
      }),
    ),
    copyright: z.string().min(1),
  });

export const legalSchema = () =>
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    updatedAt: z.coerce.date(),
  });
