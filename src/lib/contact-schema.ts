import { z } from 'astro/zod';
import { t } from '../i18n/pt-BR';

/** Single source for contact limits; Firestore rules mirror these. */
export const CONTACT_LIMITS = {
  name: [2, 100],
  email: 254,
  phoneDigits: [10, 11],
  message: [10, 2000],
  consentVersion: 20,
  page: 200,
} as const;

const e = t.form.errors;
const [nameMin, nameMax] = CONTACT_LIMITS.name;
const [phoneMin, phoneMax] = CONTACT_LIMITS.phoneDigits;
const [messageMin, messageMax] = CONTACT_LIMITS.message;

export function createContactSchema(subjects: readonly string[]) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, e.required)
      .min(nameMin, e.nameLength)
      .max(nameMax, e.nameLength),
    email: z
      .string()
      .trim()
      .min(1, e.required)
      .max(CONTACT_LIMITS.email, e.email)
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, e.email),
    // Masked input -> digits only; empty (or an empty mask) -> null.
    phone: z
      .string()
      .transform((value) => value.replace(/\D/g, '') || null)
      .refine(
        (digits) => digits === null || (digits.length >= phoneMin && digits.length <= phoneMax),
        {
          message: e.phone,
        },
      ),
    subject: z.string().refine((value) => subjects.includes(value), { message: e.subject }),
    message: z
      .string()
      .trim()
      .min(1, e.required)
      .min(messageMin, e.messageLength)
      .max(messageMax, e.messageLength),
    consent: z.literal(true, { message: e.consent }),
  });
}

export type ContactSchema = ReturnType<typeof createContactSchema>;
export type ContactInput = z.input<ContactSchema>;
export type ContactData = z.output<ContactSchema>;
export type ContactDoc = ContactData & { consentVersion: string; page: string };

export function toContactDoc(
  data: ContactData,
  meta: { consentVersion: string; page: string },
): ContactDoc {
  return { ...data, consentVersion: meta.consentVersion, page: meta.page };
}
