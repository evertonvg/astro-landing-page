import { test, expect } from './fixtures';

test.use({ presetConsent: false });

test('banner shows on first visit', async ({ page }) => {
  await page.goto('/');
  const dialog = page.getByRole('dialog', { name: 'Usamos cookies' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Aceitar todos' })).toBeVisible();
});

test('rejecting hides banner and persists', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rejeitar todos' }).click();
  await expect(page.getByRole('dialog', { name: 'Usamos cookies' })).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Aceitar todos' })).toHaveCount(0);
  const cookies = await context.cookies();
  expect(cookies.some((c) => c.name === 'cc_cookie')).toBe(true);
});

test('footer link reopens preferences', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rejeitar todos' }).click();
  await page
    .getByRole('contentinfo')
    .getByRole('button', { name: 'Preferências de cookies' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Preferências de cookies' });
  await expect(dialog).toBeVisible();
  for (const name of ['Analytics', 'Marketing', 'Mídia']) {
    await expect(dialog.getByRole('checkbox', { name })).toBeAttached();
  }
});

test('accepting updates consent mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Aceitar todos' }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window.dataLayer as unknown[]).map((entry) => Array.from(entry as ArrayLike<unknown>)),
      ),
    )
    .toContainEqual([
      'consent',
      'update',
      expect.objectContaining({ analytics_storage: 'granted' }),
    ]);
});

test('no a11y violations with banner open', async ({ page, expectNoA11yViolations }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Usamos cookies' })).toBeVisible();
  await expectNoA11yViolations(page);
});
