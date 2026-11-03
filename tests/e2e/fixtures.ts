import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Fixtures = {
  /** When true (default) a prior consent cookie is set so the banner stays out of the way. */
  presetConsent: boolean;
  /** Fails on any `serious` or `critical` axe violation (WCAG 2.0/2.1/2.2 A and AA). */
  expectNoA11yViolations: (page: Page) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  presetConsent: [true, { option: true }],
  context: async ({ context, presetConsent }, use) => {
    if (presetConsent) {
      const now = new Date().toISOString();
      const value = {
        categories: ['necessary'],
        revision: 1,
        data: null,
        consentTimestamp: now,
        consentId: '00000000-0000-4000-8000-000000000000',
        services: { necessary: [], analytics: [], marketing: [], media: [] },
        languageCode: 'pt-BR',
        lastConsentTimestamp: now,
        expirationTime: Date.now() + 182 * 24 * 3600 * 1000,
      };
      await context.addCookies([
        {
          name: 'cc_cookie',
          value: encodeURIComponent(JSON.stringify(value)),
          url: 'http://localhost:4321',
        },
      ]);
    }
    await use(context);
  },
  // eslint-disable-next-line no-empty-pattern
  expectNoA11yViolations: async ({}, use) => {
    await use(async (page) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(
        blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(', ')}`),
      ).toEqual([]);
    });
  },
});

export { expect };
