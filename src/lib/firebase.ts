import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { firebaseOptions, recaptchaSiteKey, useFirebaseEmulator } from './env';
import type { ContactDoc } from './contact-schema';

let dbPromise: Promise<Firestore> | undefined;

async function createDb(): Promise<Firestore> {
  const app = initializeApp(firebaseOptions);
  // The emulator does not enforce App Check; skipping it avoids console errors offline.
  if (!useFirebaseEmulator) {
    if (import.meta.env.DEV) {
      (
        self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
  const db = getFirestore(app);
  if (useFirebaseEmulator) connectFirestoreEmulator(db, '127.0.0.1', 8080);
  return db;
}

function getDb(): Promise<Firestore> {
  dbPromise ??= createDb().catch((error: unknown) => {
    dbPromise = undefined; // allow a retry after a failed init
    throw error;
  });
  return dbPromise;
}

/** Warms up the SDK without blocking; errors surface later on submit. */
export function preloadFirebase(): void {
  getDb().catch(() => {});
}

export async function submitContact(doc: ContactDoc): Promise<void> {
  const db = await getDb();
  await addDoc(collection(db, 'contacts'), { ...doc, createdAt: serverTimestamp() });
}
