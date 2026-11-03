import type { ImageMetadata } from 'astro';
import { PUBLIC_SITE_URL } from 'astro:env/client';
import logo from './assets/brand/logo.png';

export interface SiteConfig {
  name: string;
  url: string;
  locale: 'pt-BR';
  description: string;
  email: string;
  phone: string;
  address?: string;
  social: { label: string; href: string; icon: string }[];
  logo: ImageMetadata;
  /** RGB background used for generated OG images. */
  ogBackground: [number, number, number];
  privacyPolicyVersion: '2026-11-03';
}

export const site: SiteConfig = {
  name: 'Sua Empresa',
  url: PUBLIC_SITE_URL,
  locale: 'pt-BR',
  description: 'Descrição curta da sua empresa e do que ela oferece.',
  email: 'contato@example.com',
  phone: '(11) 99999-9999',
  address: 'Rua Exemplo, 123 - São Paulo, SP',
  social: [
    { label: 'Instagram', href: 'https://instagram.com/suaempresa', icon: 'lucide:instagram' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/suaempresa', icon: 'lucide:linkedin' },
  ],
  logo,
  ogBackground: [29, 78, 216],
  privacyPolicyVersion: '2026-11-03',
};
