import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures';

/** The documented policy is the single source: first `text` block under "Content-Security-Policy". */
function documentedCsp(): string {
  const doc = readFileSync('docs/security-headers.md', 'utf8');
  const section = doc.slice(doc.indexOf('## Content-Security-Policy'));
  const match = /```text\n([^\n]+)\n```/.exec(section);
  if (!match?.[1]) throw new Error('CSP code block not found in docs/security-headers.md');
  return match[1];
}

test.describe('documented CSP', () => {
  test.beforeEach(async ({ page }) => {
    const csp = documentedCsp();
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), 'content-security-policy': csp },
      });
    });
  });

  test('keeps Alpine interactions working without CSP violations', async ({ page, isMobile }) => {
    const violations: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        if (/content security policy|csp/i.test(message.text())) violations.push(message.text());
      }
    });
    page.on('pageerror', (error) => violations.push(error.message));

    await page.goto('/');

    // Carousel (Alpine + Embla)
    await page.getByRole('button', { name: 'Próximo slide' }).click();
    await expect(
      page.locator('#hero [aria-roledescription="slide"][aria-label="2 de 3"]'),
    ).toHaveAttribute('data-active', 'true');

    // FAQ (Alpine collapse)
    const faq = page.locator('#faq').getByRole('button').first();
    await faq.click();
    await expect(faq).toHaveAttribute('aria-expanded', 'true');

    if (isMobile) {
      await page.getByRole('button', { name: 'Abrir menu' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }

    expect(violations).toEqual([]);
  });

  test('contact form never puts field values in the URL when posted natively', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contato form')).toHaveAttribute('method', 'post');
  });
});
