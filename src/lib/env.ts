import type { FirebaseOptions } from 'firebase/app';
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_APP_ID,
  PUBLIC_RECAPTCHA_SITE_KEY,
  PUBLIC_GTM_ID,
  PUBLIC_USE_FIREBASE_EMULATOR,
} from 'astro:env/client';

export const firebaseOptions: FirebaseOptions = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
};

export const useFirebaseEmulator: boolean = PUBLIC_USE_FIREBASE_EMULATOR;
export const recaptchaSiteKey: string = PUBLIC_RECAPTCHA_SITE_KEY;
export const gtmId: string | undefined = PUBLIC_GTM_ID || undefined;
