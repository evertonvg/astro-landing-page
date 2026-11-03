import { describe, expect, it } from 'vitest';
import { createContactSchema, toContactDoc } from '../../src/lib/contact-schema';

const schema = createContactSchema(['orcamento', 'duvida', 'suporte', 'outro']);
const valid = {
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: '(11) 98765-4321',
  subject: 'orcamento',
  message: 'Gostaria de um orçamento.',
  consent: true,
};

describe('contact schema', () => {
  it('accepts valid input and normalizes the phone to digits', () => {
    const r = schema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.phone).toBe('11987654321');
  });

  it.each(['', '(__) _____-____'])('turns empty masked phone %j into null', (phone) => {
    expect(schema.parse({ ...valid, phone }).phone).toBeNull();
  });

  it('validates name length and trims', () => {
    expect(schema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, name: 'A'.repeat(101) }).success).toBe(false);
    expect(schema.parse({ ...valid, name: '  Ana  ' }).name).toBe('Ana');
  });

  it('validates email', () => {
    expect(schema.safeParse({ ...valid, email: 'a@b' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, email: `${'a'.repeat(250)}@b.co` }).success).toBe(false);
  });

  it('validates phone digit count', () => {
    expect(schema.safeParse({ ...valid, phone: '123456789' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, phone: '123456789012' }).success).toBe(false);
  });

  it('validates message length', () => {
    expect(schema.safeParse({ ...valid, message: 'x'.repeat(9) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, message: 'x'.repeat(2001) }).success).toBe(false);
  });

  it('rejects unknown subject and missing consent', () => {
    expect(schema.safeParse({ ...valid, subject: 'spam' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it('toContactDoc adds meta and has no website key', () => {
    const doc = toContactDoc(schema.parse(valid), { consentVersion: '2026-11-03', page: '/' });
    expect(doc.consentVersion).toBe('2026-11-03');
    expect(doc.page).toBe('/');
    expect(doc).not.toHaveProperty('website');
  });
});
