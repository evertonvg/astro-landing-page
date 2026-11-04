import type { APIRoute } from 'astro';
import { site } from '../site.config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.name,
      lang: site.locale,
      start_url: '/',
      display: 'browser',
      theme_color: site.themeColor,
      background_color: site.backgroundColor,
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
