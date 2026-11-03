import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Fixtures = {
  /** Fails on any `serious` or `critical` axe violation (WCAG 2.0/2.1/2.2 A and AA). */
  expectNoA11yViolations: (page: Page) => Promise<void>;
};

export const test = base.extend<Fixtures>({
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
