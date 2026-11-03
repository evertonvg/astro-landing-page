import { test, expect } from './fixtures';

const slide = (page: import('@playwright/test').Page, n: number) =>
  page.locator(`#hero [aria-roledescription="slide"][aria-label="${n} de 3"]`);

test.describe('carousel', () => {
  test('next/prev arrows change slide', async ({ page }) => {
    await page.goto('/');
    await expect(slide(page, 1)).toHaveAttribute('data-active', 'true');
    // Embla loads on demand, so early clicks may be no-ops until it is ready.
    await expect(async () => {
      await page.getByRole('button', { name: 'Próximo slide' }).click();
      await expect(slide(page, 2)).toHaveAttribute('data-active', 'true', { timeout: 1000 });
    }).toPass();
    await expect(slide(page, 2)).toHaveAttribute('aria-hidden', 'false');
    await page.getByRole('button', { name: 'Slide anterior' }).click();
    await expect(slide(page, 1)).toHaveAttribute('data-active', 'true');
  });

  test('dots navigate', async ({ page }) => {
    await page.goto('/');
    await expect(async () => {
      await page.getByRole('button', { name: 'Ir para o slide 3' }).click();
      await expect(slide(page, 3)).toHaveAttribute('data-active', 'true', { timeout: 1000 });
    }).toPass();
  });

  test('pause button toggles autoplay', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Pausar carrossel' }).click();
    await expect(page.getByRole('button', { name: 'Reproduzir carrossel' })).toBeVisible();
    await expect(page.locator('#hero [aria-live]').first()).toHaveAttribute('aria-live', 'polite');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(7000 + 1000);
    await expect(slide(page, 1)).toHaveAttribute('data-active', 'true');
  });

  test('reduced motion disables autoplay and video', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Pausar carrossel' })).toBeHidden();
    await page.waitForTimeout(8000);
    await expect(slide(page, 1)).toHaveAttribute('data-active', 'true');
    expect(await page.locator('#hero video').evaluate((el: HTMLVideoElement) => el.paused)).toBe(
      true,
    );
  });

  test('hero has no a11y violations', async ({ page, expectNoA11yViolations }) => {
    await page.goto('/');
    await expectNoA11yViolations(page);
  });

  test('page has a single h1 from the first slide', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, includeHidden: true })).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Faça sua empresa crescer com a gente');
  });
});

test.describe('youtube slide', () => {
  test.use({ presetConsent: false });

  test('shows poster without media consent', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Rejeitar todos' }).click();
    await page.getByRole('button', { name: 'Ir para o slide 2' }).click();
    await expect(page.locator('iframe[src*="youtube-nocookie"]')).toHaveCount(0);
    const enable = page.getByRole('button', { name: 'Ativar vídeo' });
    await expect(enable).toBeVisible();
    await enable.click();
    await expect(page.getByRole('dialog', { name: 'Preferências de cookies' })).toBeVisible();
  });

  test('revoking media consent removes youtube iframe', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar todos' }).click();
    await expect(page.locator('iframe[src*="youtube-nocookie"]')).toHaveCount(1);
    await page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Preferências de cookies' })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Preferências de cookies' });
    await dialog.getByRole('checkbox', { name: 'Mídia' }).uncheck({ force: true });
    await dialog.getByRole('button', { name: 'Salvar preferências' }).click();
    await expect(page.locator('iframe[src*="youtube-nocookie"]')).toHaveCount(0);
  });
});
