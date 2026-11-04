import { test, expect } from './fixtures';

const DOCS = 'http://127.0.0.1:8080/v1/projects/demo-landing/databases/(default)/documents';

interface StoredContact {
  fields: Record<string, { stringValue?: string }>;
}

async function storedContacts(): Promise<StoredContact[]> {
  const res = await fetch(`${DOCS}/contacts`, { headers: { Authorization: 'Bearer owner' } });
  const body = (await res.json()) as { documents?: StoredContact[] };
  return body.documents ?? [];
}

test.beforeEach(async () => {
  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-landing/databases/(default)/documents',
    { method: 'DELETE' },
  );
});

async function fillValid(page: import('@playwright/test').Page) {
  await page.getByLabel('Nome', { exact: false }).first().fill('Ana Souza');
  await page.locator('#contact-email').fill('ana@example.com');
  await page.locator('#contact-phone').fill('11987654321');
  await page.locator('#contact-subject').selectOption({ label: 'Dúvida' });
  await page.locator('#contact-message').fill('Gostaria de saber mais sobre o produto.');
  await page.locator('#contact-consent').check();
}

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#contato').scrollIntoViewIfNeeded();
  });

  test('shows inline errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(page.locator('#contact-name-error')).toHaveText('Campo obrigatório');
    await expect(page.locator('#contact-name')).toBeFocused();
  });

  test('submits and stores document', async ({ page }) => {
    await fillValid(page);
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(page.getByText('Mensagem enviada!')).toBeVisible();
    await expect.poll(async () => (await storedContacts()).length).toBe(1);
    const [doc] = await storedContacts();
    expect(doc?.fields.subject?.stringValue).toBe('duvida');
    expect(doc?.fields.phone?.stringValue).toBe('11987654321');
  });

  test('honeypot filled shows success but stores nothing', async ({ page }) => {
    await fillValid(page);
    await page.locator('input[name=website]').fill('x', { force: true });
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(page.getByText('Mensagem enviada!')).toBeVisible();
    expect(await storedContacts()).toHaveLength(0);
  });

  test('shows the alert on network failure, keeps values and focus, then retries', async ({
    page,
  }) => {
    await page.clock.install();
    await fillValid(page);
    await page.route('http://127.0.0.1:8080/**', (route) => route.abort());
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();
    await page.clock.runFor(11_000);
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toBeFocused();
    await expect(page.getByRole('button', { name: 'Enviar mensagem' })).toBeVisible();
    await expect(page.locator('#contact-name')).toHaveValue('Ana Souza');

    await page.unroute('http://127.0.0.1:8080/**');
    await alert.getByRole('button', { name: 'Tentar novamente' }).click();
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    await expect(page.getByText('Mensagem enviada!')).toBeVisible({ timeout: 15_000 });
  });

  test('contact section has no a11y violations', async ({ page, expectNoA11yViolations }) => {
    await expectNoA11yViolations(page);
  });
});
