import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  contactSchema,
  ctaSchema,
  faqSchema,
  featuresSchema,
  footerSchema,
  headerSchema,
  heroSchema,
  howItWorksSchema,
  logosSchema,
  pricingSchema,
  testimonialsSchema,
} from './content/schemas';

const section = (key: string) => glob({ pattern: `${key}.yaml`, base: './src/content/sections' });

export const collections = {
  header: defineCollection({
    loader: section('header'),
    schema: ({ image }) => headerSchema(image),
  }),
  hero: defineCollection({ loader: section('hero'), schema: ({ image }) => heroSchema(image) }),
  logos: defineCollection({ loader: section('logos'), schema: ({ image }) => logosSchema(image) }),
  features: defineCollection({ loader: section('features'), schema: featuresSchema() }),
  'how-it-works': defineCollection({ loader: section('how-it-works'), schema: howItWorksSchema() }),
  testimonials: defineCollection({
    loader: section('testimonials'),
    schema: ({ image }) => testimonialsSchema(image),
  }),
  pricing: defineCollection({ loader: section('pricing'), schema: pricingSchema() }),
  faq: defineCollection({ loader: section('faq'), schema: faqSchema() }),
  cta: defineCollection({ loader: section('cta'), schema: ctaSchema() }),
  contact: defineCollection({ loader: section('contact'), schema: contactSchema() }),
  footer: defineCollection({ loader: section('footer'), schema: footerSchema() }),
};
