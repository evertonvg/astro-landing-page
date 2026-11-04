import { getEntry } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { site } from '../../site.config';

const legal = await Promise.all(
  (['privacidade', 'termos'] as const).map(async (slug) => {
    const entry = await getEntry('legal', slug);
    if (!entry) throw new Error(`Missing legal content (src/content/legal/${slug}.md)`);
    return [slug, { title: entry.data.title, description: site.name }] as const;
  }),
);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: {
    index: { title: site.name, description: site.description },
    ...Object.fromEntries(legal),
  },
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [site.ogBackground],
    logo: { path: site.ogLogoPath },
    font: {
      title: { color: [255, 255, 255] },
      description: { color: site.ogDescriptionColor },
    },
  }),
});
