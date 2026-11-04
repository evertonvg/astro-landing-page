export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'media';

type Grant = 'granted' | 'denied';

export interface ConsentModeState {
  analytics_storage: Grant;
  ad_storage: Grant;
  ad_user_data: Grant;
  ad_personalization: Grant;
}

export const CONSENT_COOKIE_NAME = 'cc_cookie';
export const CONSENT_REVISION = 1;

export interface CookieTableRow {
  category: ConsentCategory;
  name: string;
  provider: string;
  purpose: string;
  duration: string;
}

export const cookieTable: CookieTableRow[] = [
  {
    category: 'necessary',
    name: 'cc_cookie',
    provider: 'Este site',
    purpose: 'Guarda suas preferências de consentimento de cookies.',
    duration: '6 meses',
  },
  {
    category: 'necessary',
    name: '_GRECAPTCHA',
    provider: 'Google reCAPTCHA',
    purpose: 'Protege o formulário de contato contra spam e abuso.',
    duration: '6 meses',
  },
  {
    category: 'analytics',
    name: '_ga, _ga_*',
    provider: 'Google Analytics',
    purpose: 'Mede o uso do site de forma estatística para melhorarmos o conteúdo.',
    duration: '2 anos',
  },
  {
    category: 'marketing',
    name: '_gcl_au',
    provider: 'Google Ads',
    purpose: 'Mede a eficácia de campanhas de anúncios.',
    duration: '3 meses',
  },
  {
    category: 'media',
    name: 'YouTube',
    provider: 'Google (YouTube)',
    purpose: 'Reprodução de vídeos incorporados.',
    duration: 'Via youtube-nocookie.com, cookies apenas após reprodução',
  },
];

export function consentModeState(accepted: ConsentCategory[]): ConsentModeState {
  const grant = (category: ConsentCategory): Grant =>
    accepted.includes(category) ? 'granted' : 'denied';
  return {
    analytics_storage: grant('analytics'),
    ad_storage: grant('marketing'),
    ad_user_data: grant('marketing'),
    ad_personalization: grant('marketing'),
  };
}

type CookieConsentApi = typeof import('vanilla-cookieconsent');
let api: CookieConsentApi | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
  interface WindowEventMap {
    'consent:change': CustomEvent<{ categories: ConsentCategory[] }>;
  }
}

function acceptedCategories(): ConsentCategory[] {
  return (api?.getUserPreferences().acceptedCategories ?? []) as ConsentCategory[];
}

function publishConsent(): void {
  const categories = acceptedCategories();
  window.gtag('consent', 'update', consentModeState(categories));
  window.dataLayer.push({ event: 'cookie_consent_update', consent_categories: categories });
  window.dispatchEvent(new CustomEvent('consent:change', { detail: { categories } }));
}

export async function initConsent(): Promise<void> {
  const [CookieConsent, { t }] = await Promise.all([
    import('vanilla-cookieconsent'),
    import('../i18n/pt-BR'),
  ]);
  api = CookieConsent;
  const c = t.consent;

  await CookieConsent.run({
    revision: CONSENT_REVISION,
    // Playwright sets navigator.webdriver, which would otherwise hide the banner in E2E
    // (test builds, `--mode test`); production keeps the library default behaviour.
    hideFromBots: import.meta.env.MODE !== 'test',
    cookie: { name: CONSENT_COOKIE_NAME, expiresAfterDays: 182 },
    guiOptions: {
      consentModal: { layout: 'box inline', position: 'bottom right' },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {},
      marketing: {},
      media: {},
    },
    language: {
      default: 'pt-BR',
      translations: {
        'pt-BR': {
          consentModal: {
            title: c.title,
            description: c.description,
            acceptAllBtn: c.acceptAll,
            acceptNecessaryBtn: c.rejectAll,
            showPreferencesBtn: c.preferences,
          },
          preferencesModal: {
            title: c.preferencesTitle,
            acceptAllBtn: c.acceptAll,
            acceptNecessaryBtn: c.rejectAll,
            savePreferencesBtn: c.savePreferences,
            closeIconLabel: c.close,
            sections: [
              { title: c.preferencesIntroTitle, description: c.preferencesIntro },
              {
                title: c.categories.necessary.title,
                description: c.categories.necessary.description,
                linkedCategory: 'necessary',
              },
              {
                title: c.categories.analytics.title,
                description: c.categories.analytics.description,
                linkedCategory: 'analytics',
              },
              {
                title: c.categories.marketing.title,
                description: c.categories.marketing.description,
                linkedCategory: 'marketing',
              },
              {
                title: c.categories.media.title,
                description: c.categories.media.description,
                linkedCategory: 'media',
              },
            ],
          },
        },
      },
    },
    onConsent: publishConsent,
    onChange: publishConsent,
  });
}

export function hasConsent(category: ConsentCategory): boolean {
  return api?.acceptedCategory(category) ?? false;
}

export function openPreferences(): void {
  api?.showPreferences();
}
