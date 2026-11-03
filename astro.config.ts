import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
import alpinejs from '@astrojs/alpinejs';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// astro.config is evaluated before Astro loads .env files, so load them here,
// honouring the CLI `--mode <x>` flag (e.g. `astro build --mode test` -> .env.test).
function resolveMode(argv: string[]): string {
  const flag = argv.findIndex((a) => a === '--mode' || a === '-m');
  if (flag !== -1 && argv[flag + 1]) return argv[flag + 1];
  const inline = argv.find((a) => a.startsWith('--mode='));
  if (inline) return inline.slice('--mode='.length);
  return argv.includes('dev') ? 'development' : 'production';
}

const env = loadEnv(resolveMode(process.argv), process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // Empty -> undefined so the env schema below reports the missing variable by name.
  site: env.PUBLIC_SITE_URL || undefined,
  output: 'static',
  integrations: [alpinejs({ entrypoint: '/src/lib/alpine' }), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public', url: true }),
      PUBLIC_FIREBASE_API_KEY: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_AUTH_DOMAIN: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_PROJECT_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_FIREBASE_APP_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_RECAPTCHA_SITE_KEY: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_GTM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_USE_FIREBASE_EMULATOR: envField.boolean({
        context: 'client',
        access: 'public',
        default: false,
      }),
    },
  },
});
