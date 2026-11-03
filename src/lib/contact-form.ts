import { createContactSchema, toContactDoc, type ContactDoc } from './contact-schema';

type Field = 'name' | 'email' | 'phone' | 'subject' | 'message' | 'consent';
type Status = 'idle' | 'submitting' | 'success' | 'error';

export interface ContactFormOptions {
  subjects: string[];
  consentVersion: string;
  submit?: (doc: ContactDoc) => Promise<void>;
}

const FIELDS: Field[] = ['name', 'email', 'phone', 'subject', 'message', 'consent'];

const defaultSubmit = (doc: ContactDoc) => import('./firebase').then((m) => m.submitContact(doc));

/** Alpine state for the contact form. Only `init` and focus handling touch `$el`/`$refs`. */
export default (opts: ContactFormOptions) => {
  const schema = createContactSchema(opts.subjects);
  const submit = opts.submit ?? defaultSubmit;

  return {
    values: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      consent: false,
      website: '',
    },
    errors: {} as Partial<Record<Field, string>>,
    status: 'idle' as Status,

    /** Loads the Firebase chunk shortly before the form is needed (once). */
    init() {
      const el = (this as unknown as { $el: HTMLElement }).$el;
      let done = false;
      const preload = () => {
        if (done) return;
        done = true;
        observer?.disconnect();
        el.removeEventListener('focusin', preload);
        void import('./firebase').then((m) => m.preloadFirebase()).catch(() => {});
      };
      const observer =
        typeof IntersectionObserver === 'undefined'
          ? undefined
          : new IntersectionObserver(
              (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) preload();
              },
              { rootMargin: '200px' },
            );
      observer?.observe(el);
      el.addEventListener('focusin', preload);
    },

    /** Applies the Brazilian phone mask (8 or 9 digit numbers); imask loads on demand. */
    async maskPhone(input: HTMLInputElement) {
      const { default: IMask } = await import('imask');
      const mask = IMask(input, {
        mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }],
      });
      mask.on('accept', () => {
        this.values.phone = mask.value;
      });
    },

    validate(): Partial<Record<Field, string>> {
      const result = schema.safeParse(this.values);
      const errors: Partial<Record<Field, string>> = {};
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0] as Field;
          errors[field] ??= issue.message;
        }
      }
      return errors;
    },

    validateField(field: Field) {
      const message = this.validate()[field];
      this.errors = { ...this.errors, [field]: message };
    },

    focusFirstInvalid() {
      const refs = (this as unknown as { $refs: Record<string, HTMLElement | undefined> }).$refs;
      const first = FIELDS.find((field) => this.errors[field]);
      refs[first ?? '']?.focus();
    },

    async onSubmit() {
      if (this.status === 'submitting') return;
      this.errors = this.validate();
      if (Object.keys(this.errors).length > 0) {
        this.status = 'idle';
        this.focusFirstInvalid();
        return;
      }
      // Honeypot: pretend success so bots get no signal.
      if (this.values.website) {
        this.status = 'success';
        return;
      }
      this.status = 'submitting';
      try {
        const data = schema.parse(this.values);
        await submit(
          toContactDoc(data, {
            consentVersion: opts.consentVersion,
            page: location.pathname,
          }),
        );
        this.status = 'success';
      } catch {
        this.status = 'error';
      }
    },

    retry() {
      return this.onSubmit();
    },
  };
};
