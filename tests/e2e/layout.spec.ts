import { test, expect } from './fixtures';

test('skip link moves focus to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Pular para o conteúdo');
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('mobile menu opens, traps focus, closes on Escape and restores focus', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('/');
  const openButton = page.getByRole('button', { name: 'Abrir menu' });
  await openButton.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const focusables = await dialog.locator('a, button').count();
  for (let i = 0; i < focusables + 2; i++) {
    await page.keyboard.press('Tab');
    await expect(dialog.locator(':focus')).toHaveCount(1);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
});

test('header nav lists only enabled sections', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('header nav a[href^="#"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href') as string));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test('footer has privacy, terms and cookie preferences links', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Política de privacidade' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Termos de uso' })).toBeVisible();
  await expect(footer.getByRole('button', { name: 'Preferências de cookies' })).toBeVisible();
});

test('home has no serious a11y violations', async ({ page, expectNoA11yViolations }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
