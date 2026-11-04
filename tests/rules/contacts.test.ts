import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { parse } from 'yaml';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-landing',
    firestore: {
      rules: readFileSync('firebase/firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env?.cleanup();
});

const valid = (): Record<string, unknown> => ({
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: '11987654321',
  subject: 'duvida',
  message: 'Gostaria de saber mais.',
  consent: true,
  consentVersion: '2026-11-03',
  createdAt: serverTimestamp(),
  page: '/',
});

const db = () => env.unauthenticatedContext().firestore();
const create = (data: Record<string, unknown>) => addDoc(collection(db(), 'contacts'), data);

describe('contacts create', () => {
  it('accepts a valid document', async () => {
    await assertSucceeds(create(valid()));
  });

  // Parity: every subject offered by the form must be accepted by the rules.
  const contactYaml = parse(readFileSync('src/content/sections/contact.yaml', 'utf8')) as {
    subjects: { value: string }[];
  };
  for (const { value } of contactYaml.subjects) {
    it(`accepts contact.yaml subject "${value}"`, async () => {
      await assertSucceeds(create({ ...valid(), subject: value }));
    });
  }

  it('accepts phone null', async () => {
    await assertSucceeds(create({ ...valid(), phone: null }));
  });

  const invalid: Record<string, () => Record<string, unknown>> = {
    'extra key': () => ({ ...valid(), foo: 'bar' }),
    'missing message': () => {
      const data = valid();
      delete data.message;
      return data;
    },
    'name is a number': () => ({ ...valid(), name: 123 }),
    'name too short': () => ({ ...valid(), name: 'A' }),
    'name too long': () => ({ ...valid(), name: 'a'.repeat(101) }),
    'message too short': () => ({ ...valid(), message: 'a'.repeat(9) }),
    'message too long': () => ({ ...valid(), message: 'a'.repeat(2001) }),
    'invalid email': () => ({ ...valid(), email: 'nope' }),
    'email too long': () => ({ ...valid(), email: `${'a'.repeat(250)}@b.co` }),
    'email with whitespace': () => ({ ...valid(), email: 'a b@c.co' }),
    'invalid phone': () => ({ ...valid(), phone: '123' }),
    'unknown subject': () => ({ ...valid(), subject: 'spam' }),
    'consent false': () => ({ ...valid(), consent: false }),
    'client-supplied createdAt': () => ({
      ...valid(),
      createdAt: Timestamp.fromDate(new Date(2000, 0, 1)),
    }),
    'consentVersion too long': () => ({ ...valid(), consentVersion: 'a'.repeat(21) }),
    'empty consentVersion': () => ({ ...valid(), consentVersion: '' }),
    'page too long': () => ({ ...valid(), page: 'a'.repeat(201) }),
  };

  for (const [name, build] of Object.entries(invalid)) {
    it(`rejects ${name}`, async () => {
      await assertFails(create(build()));
    });
  }
});

describe('contacts other operations', () => {
  it('denies get, list, update and delete', async () => {
    let id = '';
    await env.withSecurityRulesDisabled(async (ctx) => {
      const ref = doc(collection(ctx.firestore(), 'contacts'));
      id = ref.id;
      await setDoc(ref, { ...valid(), createdAt: Timestamp.now() });
    });
    const ref = doc(db(), 'contacts', id);
    await assertFails(getDoc(ref));
    await assertFails(getDocs(collection(db(), 'contacts')));
    await assertFails(updateDoc(ref, { name: 'Outro Nome' }));
    await assertFails(deleteDoc(ref));
  });

  it('denies writes outside contacts', async () => {
    await assertFails(setDoc(doc(db(), 'other', 'x'), { a: 1 }));
  });
});
