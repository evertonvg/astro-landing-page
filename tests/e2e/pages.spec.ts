import { test, expect } from './fixtures';

test('privacy page renders cookie table', async ({ page }) => {
  await page.goto('/privacidade');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de Privacidade');
  await expect(page.getByRole('row').filter({ hasText: 'cc_cookie' })).toBeVisible();
});

test('terms page renders', async ({ page }) => {
  await page.goto('/termos');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Termos de Uso');
});

test('404 page', async ({ page }) => {
  await page.goto('/nao-existe');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');
  await expect(page.getByRole('link', { name: 'Voltar para o início' })).toBeVisible();
});

test('header anchors point back to the home page on other pages', async ({ page }) => {
  await page.goto('/termos');
  const links = page.locator('header nav a');
  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/#/);
});

test('og image exists', async ({ request }) => {
  const res = await request.get('/og/index.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
});

for (const path of ['/privacidade', '/termos', '/nao-existe']) {
  test(`no a11y violations on ${path}`, async ({ page, expectNoA11yViolations }) => {
    await page.goto(path);
    await expectNoA11yViolations(page);
  });
}
