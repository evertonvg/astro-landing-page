import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// astro.config is evaluated before Astro loads .env, so read it here (Node >= 24).
if (existsSync('.env')) process.loadEnvFile('.env');

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL,
  output: 'static',
  integrations: [alpinejs(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
