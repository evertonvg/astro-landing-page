import { test, expect } from './fixtures';

test('faq toggles with keyboard', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('#faq').getByRole('button').first();
  await button.focus();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const panelId = await button.getAttribute('aria-controls');
  await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('pricing switch shows yearly prices', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('switch', { name: 'Cobrança anual' });
  const firstPlan = page.locator('#precos article').first();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(firstPlan).toContainText(/R\$\s?49(?!\d)/);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(firstPlan).toContainText(/R\$\s?490(?!\d)/);
  await expect(firstPlan.getByText(/R\$\s?49(?!\d)/)).toBeHidden();
});

test('home includes FAQPage json-ld', async ({ page }) => {
  await page.goto('/');
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((b) => (JSON.parse(b) as { '@type': string })['@type']);
  expect(types).toContain('FAQPage');
});

test('sections have no a11y violations', async ({ page, expectNoA11yViolations }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
