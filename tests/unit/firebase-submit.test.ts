import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaV3Provider: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(() => new Promise(() => {})),
  collection: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  serverTimestamp: vi.fn(),
}));
vi.mock('../../src/lib/env', () => ({
  firebaseOptions: {},
  recaptchaSiteKey: 'k',
  useFirebaseEmulator: true,
}));

import { SUBMIT_TIMEOUT_MS, submitContact } from '../../src/lib/firebase';

const doc = {
  name: 'Ana',
  email: 'a@b.co',
  phone: null,
  subject: 'duvida',
  message: 'mensagem longa',
  consent: true as const,
  consentVersion: 'v1',
  page: '/',
};

describe('submitContact', () => {
  afterEach(() => vi.useRealTimers());

  it('rejects after the timeout when addDoc never settles', async () => {
    vi.useFakeTimers();
    const result = submitContact(doc);
    const assertion = expect(result).rejects.toThrow('submit timeout');
    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS);
    await assertion;
  });
});
