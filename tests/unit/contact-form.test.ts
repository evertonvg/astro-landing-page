// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import contactForm from '../../src/lib/contact-form';

const subjects = ['orcamento', 'duvida', 'suporte', 'outro'];

function setup(submit = vi.fn().mockResolvedValue(undefined)) {
  const form = contactForm({ subjects, consentVersion: '2026-11-03', submit }) as ReturnType<
    typeof contactForm
  > &
    Record<string, unknown>;
  (form as unknown as { $refs: unknown }).$refs = {};
  Object.assign(form.values, {
    name: 'Ana Souza',
    email: 'ana@example.com',
    phone: '(11) 98765-4321',
    subject: 'orcamento',
    message: 'Gostaria de um orçamento.',
    consent: true,
  });
  return { form, submit };
}

describe('contactForm', () => {
  it('invalid submit sets errors and does not call submit', async () => {
    const { form, submit } = setup();
    form.values.email = 'nope';
    await form.onSubmit();
    expect(form.errors.email).toBe('Informe um e-mail válido');
    expect(form.status).toBe('idle');
    expect(submit).not.toHaveBeenCalled();
  });

  it('valid submit calls submit once with a ContactDoc and succeeds', async () => {
    const { form, submit } = setup();
    await form.onSubmit();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0]?.[0]).toMatchObject({
      name: 'Ana Souza',
      phone: '11987654321',
      consentVersion: '2026-11-03',
      page: location.pathname,
    });
    expect(submit.mock.calls[0]?.[0]).not.toHaveProperty('website');
    expect(form.status).toBe('success');
  });

  it('honeypot filled → success without calling submit', async () => {
    const { form, submit } = setup();
    form.values.website = 'http://spam';
    await form.onSubmit();
    expect(form.status).toBe('success');
    expect(submit).not.toHaveBeenCalled();
  });

  it('submit rejects → status error, values preserved; retry calls submit again', async () => {
    const submit = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue(undefined);
    const { form } = setup(submit);
    await form.onSubmit();
    expect(form.status).toBe('error');
    expect(form.values.name).toBe('Ana Souza');
    await form.retry();
    expect(submit).toHaveBeenCalledTimes(2);
    expect(form.status).toBe('success');
  });

  it('ignores submit while submitting', async () => {
    const { form, submit } = setup();
    const a = form.onSubmit();
    const b = form.onSubmit();
    await Promise.all([a, b]);
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
