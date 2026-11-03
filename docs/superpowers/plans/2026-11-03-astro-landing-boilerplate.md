# Astro Landing Page Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reusable, static Astro landing-page boilerplate (pt-BR) with content-driven sections, hero carousel, Firebase-backed contact form, consent-gated GTM, full test suite and AWS S3/CloudFront deploy pipeline.

**Architecture:** Astro static output; `.astro` components are presentational and read Zod-validated YAML content collections; all interactivity lives in typed Alpine components in `src/lib/` registered through the `@astrojs/alpinejs` entrypoint. Heavy JS (Firebase, Embla) is loaded on demand via dynamic `import()`.

**Tech Stack:** Astro 7.4, TypeScript 6.0 (strict), Alpine.js 3.17 + `@alpinejs/ui`/`focus`/`collapse`, Tailwind CSS 4.3 (`@tailwindcss/vite`), Embla Carousel 8.6, Firebase JS SDK 13 (Firestore + App Check), vanilla-cookieconsent 3.3, IMask 7, astro-icon + `@iconify-json/lucide`, astro-og-canvas, Vitest 5 + happy-dom, `@firebase/rules-unit-testing` 6, Playwright 1.64 + `@axe-core/playwright`, `@lhci/cli`, pnpm 11, Husky 9, lint-staged 17, commitlint 21, ESLint 10, Prettier 3.

**Spec:** `docs/superpowers/specs/2026-11-03-astro-landing-boilerplate-design.md`

## Global Constraints

- Work directly on `main`; Conventional Commits in English; every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Node 24 (`.nvmrc` = `24`, `engines.node` = `>=24`); pnpm 11 pinned via `packageManager`.
- Pin **exact** versions (`save-exact`); `pnpm-workspace.yaml` sets `minimumReleaseAge: 20160` (14 days). If a package's latest release is younger than 14 days, take the newest version that satisfies the age rule.
- `typescript` pinned to `6.0.x` (typescript-eslint requires `<6.1.0`, `@astrojs/check` requires `^5 || ^6`). Do NOT install TypeScript 7.
- `astro.config.ts`: `output: 'static'`, `site` from `PUBLIC_SITE_URL`, no adapter.
- `tsconfig.json` extends `astro/tsconfigs/strict`.
- Zod is imported from `astro/zod` everywhere (one Zod instance).
- All UI copy in pt-BR; reusable UI strings (buttons, errors, aria labels) live only in `src/i18n/pt-BR.ts`.
- `.astro` components contain no interaction logic; interactivity = `Alpine.data()` components in `src/lib/` referenced by `x-data="name"` or `x-data="name(args)"`.
- Firebase SDK and Embla must never be in the initial page bundle (only via dynamic `import()`).
- Accessibility floor: skip link, landmarks, one `h1` per page, visible focus, AA contrast, `prefers-reduced-motion` respected.
- No dark mode, no i18n routing, no CMS, no visual-regression screenshots.
- Firebase demo project id for emulator/tests/CI: `demo-landing` (the `demo-` prefix keeps the emulator offline-only).
- Contact limits (single source `CONTACT_LIMITS` in `src/lib/contact-schema.ts`, mirrored in rules): name 2–100, email ≤254, phone `null` or 10–11 digits, message 10–2000, consentVersion 1–20, page 1–200.
- Contact subjects (sample content and rules list must match): `orcamento`, `duvida`, `suporte`, `outro`.

### Deviation from spec (note for reviewer)

- Spec §6 step 3 sets the App Check debug token when the emulator is on. Plan: with `PUBLIC_USE_FIREBASE_EMULATOR=true`, **App Check is not initialized at all** (the emulator does not enforce it, and initializing it against `demo-landing` produces console errors that would fail Lighthouse "Best Practices"). The debug token is set instead when running `astro dev` against a real project (`import.meta.env.DEV && !useEmulator`).
- Spec §4 lists content files directly under `src/content/`. Plan puts section YAML in `src/content/sections/` and legal Markdown in `src/content/legal/`, each section being its own collection loaded with `glob({ pattern: '<name>.yaml', base: './src/content/sections' })` so each gets its own schema.

## Review Focus

1. **Hero with a single slide** → renders static hero, no carousel controls, Embla never fetched. Test: Task 7, unit (Container API) `single slide renders without carousel`.
2. **User double-clicks "Enviar"** → exactly one document written; button disabled while `submitting`. Test: Task 8, unit `ignores submit while submitting`.
3. **Consent revoked after YouTube iframe loaded** → iframe removed and poster shown again. Test: Task 7, E2E `revoking media consent removes youtube iframe`.
4. **Section disabled in YAML while its nav link remains** → link disappears from header and mobile menu, no broken anchors. Test: Task 3, unit `buildNav drops links of disabled sections`.
5. **Phone typed with mask then cleared** → stored as `null`, not `""`. Test: Task 8, unit `empty masked phone becomes null`.

---

## File Map

| Path | Responsibility | Task |
|---|---|---|
| `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `.gitattributes` | project + package manager | 1 |
| `eslint.config.js`, `prettier.config.js`, `.prettierignore`, `commitlint.config.js`, `.husky/*`, `.vscode/*` | code quality tooling | 1 |
| `astro.config.ts`, `tsconfig.json`, `src/env.d.ts` | Astro config, env schema, types | 1, 2 |
| `vitest.config.ts` | unit test runner | 2 |
| `src/site.config.ts` | global site data | 2 |
| `src/i18n/pt-BR.ts` | UI dictionary | 2 |
| `src/lib/env.ts` | typed env accessors | 2 |
| `src/lib/seo.ts` | JSON-LD builders | 2 |
| `src/layouts/BaseLayout.astro`, `src/components/seo/*`, `src/components/layout/SkipLink.astro` | document shell + SEO | 2 |
| `public/robots.txt`, `public/site.webmanifest`, `public/favicon*` | static SEO assets | 2 |
| `src/content/schemas.ts` | Zod schema factories per section | 3 |
| `src/content.config.ts` | collections wiring | 3 |
| `src/content/sections/*.yaml`, `src/assets/**` | sample content | 3 |
| `src/lib/sections.ts` | `getSection`, `buildNav` | 3 |
| `src/styles/global.css` | Tailwind + `@theme` tokens | 4 |
| `src/lib/alpine.ts`, `src/types/alpinejs-ui.d.ts` | Alpine entrypoint | 4 |
| `src/components/ui/*` | Button, Container, SectionHeading | 4 |
| `src/components/layout/{Header,MobileMenu,Footer}.astro` | chrome | 4 |
| `playwright.config.ts`, `tests/e2e/fixtures.ts` | E2E runner + axe helper | 4 |
| `src/components/sections/{Logos,Features,HowItWorks,Testimonials,Pricing,Faq,FinalCta}.astro`, `src/lib/pricing.ts` | static sections | 5 |
| `src/lib/consent.ts`, `src/components/layout/{CookieConsent,GtmHead,GtmBody}.astro` | consent + GTM | 6 |
| `src/lib/carousel.ts`, `src/lib/youtube-embed.ts`, `src/components/sections/Hero.astro`, `src/components/hero/*` | hero | 7 |
| `src/lib/contact-schema.ts`, `src/lib/contact-form.ts`, `src/lib/firebase.ts`, `src/components/sections/Contact.astro` | contact form | 8 |
| `firebase/*`, `tests/rules/*`, `.env.test`, `.env.example` | rules + emulator | 9 |
| `src/pages/{privacidade,termos,404}.astro`, `src/pages/og/[...route].ts`, `src/components/legal/CookieTable.astro`, `src/content/legal/*.md` | legal + OG | 10 |
| `.github/workflows/ci.yml`, `lighthouserc.json` | CI | 11 |
| `.github/workflows/{deploy,release}.yml`, `.github/dependabot.yml`, templates, `docs/*.md`, `README.md`, `CONTRIBUTING.md` | delivery + docs | 12 |

---

### Task 1: Project scaffold and code-quality tooling

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `.gitattributes`, `astro.config.ts`, `tsconfig.json`, `src/pages/index.astro` (placeholder), `eslint.config.js`, `prettier.config.js`, `.prettierignore`, `commitlint.config.js`, `.husky/pre-commit`, `.husky/commit-msg`, `.vscode/settings.json`, `.vscode/extensions.json`

**Interfaces:**
- Produces: scripts `dev`, `build`, `preview`, `check`, `lint`, `lint:fix`, `format`, `format:check`, `prepare` used by every later task.

- [ ] **Step 1: Scaffold Astro minimal template with pnpm**

Run `pnpm create astro@latest . --template minimal --typescript strict --no-git --install` (directory already contains `.git` and `docs/`; accept merging into a non-empty dir). Then set `"packageManager": "pnpm@11.9.0"`, `"engines": { "node": ">=24" }`, pin `typescript` to `6.0.3`, `.nvmrc` = `24`.

- [ ] **Step 2: Configure pnpm**

`pnpm-workspace.yaml`: `minimumReleaseAge: 20160`, `savePrefix: ''` (exact versions). Approve build scripts pnpm reports as blocked (expected: `esbuild`, `sharp`) via the `allowBuilds` setting. `.gitattributes`: `* text=auto eol=lf`. `.editorconfig`: utf-8, lf, 2 spaces, final newline. `.gitignore`: Astro defaults + `.env`, `.env.production`, `firebase-debug.log`, `firestore-debug.log`, `test-results/`, `playwright-report/`, `.lighthouseci/`.

- [ ] **Step 3: Add Tailwind, Alpine integration and Prettier/ESLint deps**

Run `pnpm astro add tailwind alpinejs sitemap --yes`, then add dev deps: `@astrojs/check`, `eslint`, `typescript-eslint`, `eslint-plugin-astro`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier`, `globals`, `prettier`, `prettier-plugin-astro`, `prettier-plugin-tailwindcss`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`.

- [ ] **Step 4: Write configs**

- `eslint.config.js` (flat): `js.configs.recommended`, `tseslint.configs.strict`, `eslintPluginAstro.configs.recommended`, `eslintPluginAstro.configs['jsx-a11y-strict']`, `eslintConfigPrettier` last; ignore `dist/`, `.astro/`, `node_modules/`, `coverage/`, `playwright-report/`, `.lighthouseci/`.
- `prettier.config.js`: `plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss']` (tailwind plugin last), `singleQuote: true`, `semi: true`, `printWidth: 100`, override `*.astro` → parser `astro`. Set `tailwindStylesheet: './src/styles/global.css'`.
- `commitlint.config.js`: `extends: ['@commitlint/config-conventional']`.
- `package.json` `lint-staged`: `*.{js,ts,astro}` → `eslint --fix`, `prettier --write`; `*.{json,md,yaml,yml,css}` → `prettier --write`.
- `.husky/pre-commit`: `pnpm exec lint-staged`; `.husky/commit-msg`: `pnpm exec commitlint --edit "$1"`.
- `.vscode/settings.json`: `editor.formatOnSave: true`, `editor.defaultFormatter: esbenp.prettier-vscode`, `editor.codeActionsOnSave: { "source.fixAll.eslint": "explicit" }`, `eslint.validate: ["javascript","typescript","astro"]`, `prettier.documentSelectors: ["**/*.astro"]`, `files.associations: { "*.css": "tailwindcss" }`.
- `.vscode/extensions.json`: `astro-build.astro-vscode`, `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`, `toba.vsfire`.
- Scripts: `"check": "astro check"`, `"lint": "eslint ."`, `"lint:fix": "eslint . --fix"`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`, `"prepare": "husky"`.

- [ ] **Step 5: Verify tooling**

Run: `pnpm lint && pnpm format:check && pnpm check && pnpm build`
Expected: all exit 0; `dist/index.html` exists.

Run: `echo "bad message" | pnpm exec commitlint`
Expected: non-zero exit with `subject may not be empty` / `type may not be empty`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro project with lint, format and commit tooling"
```
Expected: pre-commit hook runs lint-staged; commit-msg hook passes.

---

### Task 2: Env schema, site config, i18n, base layout and SEO

**Files:**
- Create: `vitest.config.ts`, `src/site.config.ts`, `src/i18n/pt-BR.ts`, `src/lib/env.ts`, `src/lib/seo.ts`, `src/layouts/BaseLayout.astro`, `src/components/seo/Seo.astro`, `src/components/seo/JsonLd.astro`, `src/components/layout/SkipLink.astro`, `public/robots.txt`, `public/site.webmanifest`, `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `.env.example` (initial), `.env` (local, gitignored, copy of example)
- Modify: `astro.config.ts`, `package.json`, `src/pages/index.astro`
- Test: `tests/unit/seo.test.ts`

**Interfaces:**
- Produces:
  - `astro:env/client` vars (all `context: 'client', access: 'public'`): `PUBLIC_SITE_URL` (string, url), `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID`, `PUBLIC_RECAPTCHA_SITE_KEY` (strings, required), `PUBLIC_GTM_ID` (string, optional), `PUBLIC_USE_FIREBASE_EMULATOR` (boolean, default `false`).
  - `src/lib/env.ts`: `export const firebaseOptions: FirebaseOptions`, `export const useFirebaseEmulator: boolean`, `export const recaptchaSiteKey: string`, `export const gtmId: string | undefined`.
  - `src/site.config.ts`: `export const site: SiteConfig` with `{ name, url, locale: 'pt-BR', description, email, phone, address?: string, social: { label: string; href: string; icon: string }[], logo: ImageMetadata, ogBackground: [number, number, number], privacyPolicyVersion: '2026-11-03' }`.
  - `src/i18n/pt-BR.ts`: `export const t = { ... } as const` (nested keys: `nav`, `carousel`, `form`, `consent`, `common`); later tasks add keys.
  - `src/lib/seo.ts`: `organizationJsonLd(s: SeoSite): object`, `websiteJsonLd(s: SeoSite): object`, `faqPageJsonLd(items: { question: string; answerText: string }[]): object`.
  - `BaseLayout.astro` props: `{ title: string; description?: string; ogImage?: string; jsonLd?: object[] }`; slots: default (inside `<main id="main">`), `header`, `footer`, `head`.

- [ ] **Step 1: Set up Vitest**

Add dev deps `vitest`, `happy-dom`. `vitest.config.ts` uses `getViteConfig` from `astro/config` with `test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' }` (files needing DOM opt in with `// @vitest-environment happy-dom`). Script `"test": "vitest run"`.

- [ ] **Step 2: Write failing test `tests/unit/seo.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { organizationJsonLd, websiteJsonLd, faqPageJsonLd } from '../../src/lib/seo';

const s = { name: 'Sua Empresa', url: 'https://example.com', email: 'contato@example.com',
  social: [{ label: 'Instagram', href: 'https://instagram.com/x', icon: 'lucide:instagram' }],
  logoUrl: 'https://example.com/logo.png' };

describe('seo', () => {
  it('organization includes sameAs from social links', () => {
    expect(organizationJsonLd(s)).toMatchObject({
      '@context': 'https://schema.org', '@type': 'Organization', name: 'Sua Empresa',
      url: 'https://example.com', logo: 'https://example.com/logo.png',
      sameAs: ['https://instagram.com/x'] });
  });
  it('website has name and url', () => {
    expect(websiteJsonLd(s)).toMatchObject({ '@type': 'WebSite', url: 'https://example.com' });
  });
  it('faq page maps items to Question/Answer', () => {
    const ld = faqPageJsonLd([{ question: 'P?', answerText: 'R.' }]) as { mainEntity: unknown[] };
    expect(ld).toMatchObject({ '@type': 'FAQPage' });
    expect(ld.mainEntity[0]).toEqual({ '@type': 'Question', name: 'P?',
      acceptedAnswer: { '@type': 'Answer', text: 'R.' } });
  });
});
```

Parameter type of `organizationJsonLd`/`websiteJsonLd`: `SeoSite = Pick<SiteConfig,'name'|'url'|'email'|'social'> & { logoUrl: string }` (the layout passes the resolved absolute logo URL).

- [ ] **Step 3: Run test — expect FAIL** (`Cannot find module '../../src/lib/seo'`)

Run: `pnpm test`

- [ ] **Step 4: Implement**

- `astro.config.ts`: `env.schema` per Interfaces using `envField`; `site` read with `loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '')` from `vite` (`PUBLIC_SITE_URL`); integrations sitemap/tailwind/alpine (`alpinejs({ entrypoint: '/src/lib/alpine' })` — the file is created in Task 4; create a stub `export default (Alpine: Alpine) => {}` now).
- `src/lib/seo.ts` per Interfaces.
- `Seo.astro`: `<title>{title} | {site.name}</title>`, description, `link rel=canonical` (`new URL(Astro.url.pathname, Astro.site)`), OG (`og:type website`, `og:locale pt_BR`, title, description, url, image), Twitter `summary_large_image`, favicon links, `site.webmanifest`, `theme-color`.
- `JsonLd.astro`: renders `<script type="application/ld+json" set:html={JSON.stringify(data)} />`.
- `SkipLink.astro`: `<a href="#main">` visually hidden until focus; text from `t.common.skipToContent` (`'Pular para o conteúdo'`).
- `BaseLayout.astro`: `<html lang="pt-BR">`, `Seo`, JSON-LD (Organization + WebSite always, plus `jsonLd` prop), `SkipLink`, `header` slot, `<main id="main" tabindex="-1">`, `footer` slot.
- `public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: /sitemap-index.xml` (write absolute URL at build: replace static file with `src/pages/robots.txt.ts` returning `Sitemap: ${new URL('sitemap-index.xml', site)}`).
- `.env.example` with every var from Interfaces, sample values and a comment per var (`PUBLIC_SITE_URL=http://localhost:4321`).

- [ ] **Step 5: Run tests and build — expect PASS**

Run: `pnpm test && pnpm check && pnpm build`
Expected: 3 tests pass; `dist/sitemap-index.xml` and `dist/robots.txt` exist; `dist/index.html` contains `application/ld+json` and `rel="canonical"`.

Run: `PUBLIC_SITE_URL= pnpm build` (env var empty)
Expected: build fails naming `PUBLIC_SITE_URL`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add env schema, site config, base layout and seo metadata"
```

---

### Task 3: Content collections, schemas and sample content

**Files:**
- Create: `src/content/schemas.ts`, `src/content.config.ts`, `src/lib/sections.ts`, `src/content/sections/{header,hero,logos,features,how-it-works,testimonials,pricing,faq,cta,contact,footer}.yaml`, sample images under `src/assets/{hero,logos,testimonials,brand}/` and `public/media/hero-sample.mp4` (≤1 MB, royalty-free or generated solid-color clip)
- Test: `tests/unit/schemas.test.ts`, `tests/unit/sections.test.ts`

**Interfaces:**
- Produces:
  - `src/content/schemas.ts`: `type ImageFn = SchemaContext['image']`; factories `headerSchema(image)`, `heroSchema(image)`, `logosSchema(image)`, `featuresSchema`, `howItWorksSchema`, `testimonialsSchema(image)`, `pricingSchema`, `faqSchema`, `ctaSchema`, `contactSchema`, `footerSchema`; shared `buttonSchema = z.object({ label: z.string().min(1), href: z.string().min(1), variant: z.enum(['primary','secondary']).default('primary') })`.
  - Section keys: `type SectionKey = 'hero'|'logos'|'features'|'how-it-works'|'testimonials'|'pricing'|'faq'|'cta'|'contact'`. Every section schema has `enabled: z.boolean().default(true)`; `header`/`footer` have no `enabled`.
  - Hero: `{ enabled, autoplay: { enabled: boolean (default true), intervalMs: number int 3000–20000 (default 7000) }, transition: 'fade'|'slide' (default 'fade'), slides: Slide[] (min 1) }`, `Slide = { background: Background, overlay: number 0–0.9 default 0.4, align: 'left'|'center'|'right' default 'center', title: string min 1, description?: string, buttons: Button[] max 2 default [] }`, `Background = discriminatedUnion('type', [ {type:'image', src: image(), alt: string}, {type:'video', src: string regex /^\/.+\.mp4$/, poster: image()}, {type:'youtube', videoId: string regex /^[\w-]{11}$/, poster: image()} ])`.
  - Header: `{ logo: image(), logoAlt: string, links: { label, href, section?: SectionKey }[], cta?: Button }`.
  - Contact: `{ enabled, title, description?, subjects: { value: string regex /^[a-z0-9-]+$/, label: string }[] min 1, consentLabel: string }`.
  - Pricing: `{ enabled, title, subtitle?, billingToggle: boolean default false, plans: { name, priceMonthly: number, priceYearly?: number, features: string[], highlighted: boolean default false, cta: Button }[] }` with refine: if `billingToggle` then every plan has `priceYearly`.
  - FAQ: `{ enabled, title, items: { question: string, answer: string /* markdown */ }[] min 1 }`.
  - Footer: `{ columns: { title, links: { label, href }[] }[], copyright: string }` (social links come from `site.config`).
  - Remaining schemas per spec §4 table.
  - `src/lib/sections.ts`: `getSection<K extends SectionKey | 'header' | 'footer'>(key: K): Promise<CollectionEntry<K>['data'] | null>` (null when entry missing or `enabled === false`); `enabledSections(): Promise<Set<SectionKey>>`; `buildNav(links: HeaderLink[], enabled: Set<SectionKey>): HeaderLink[]` (pure).
  - Each collection id equals its key; `getEntry(key, key)`.

- [ ] **Step 1: Write failing tests**

`tests/unit/schemas.test.ts` — use `const image = () => z.string()` stub:
- `hero accepts minimal image slide` (defaults: `overlay` 0.4, `align` 'center', `buttons` [], `transition` 'fade', `autoplay.intervalMs` 7000).
- `hero rejects 3 buttons` (error path `['slides',0,'buttons']`).
- `hero rejects youtube without poster`, `hero rejects video without poster`, `hero rejects youtube id of wrong length`.
- `hero rejects empty slides`.
- `pricing with billingToggle requires priceYearly on every plan`.
- `contact rejects subject value with spaces`.

`tests/unit/sections.test.ts`:
- `buildNav drops links of disabled sections` — links `[{href:'#features',section:'features'},{href:'#faq',section:'faq'},{href:'/blog'}]`, enabled `{'features'}` → keeps `#features` and `/blog`.

- [ ] **Step 2: Run — expect FAIL** (`pnpm test`, modules not found)

- [ ] **Step 3: Implement schemas, `content.config.ts` (one `defineCollection` per key with `glob({ pattern: '<key>.yaml', base: './src/content/sections' })` and `schema: ({ image }) => factory(image)`), `sections.ts`, and sample YAML**

Sample content: company "Sua Empresa"; hero with **3 slides** (image/left, youtube/center with a public-domain videoId, video `/media/hero-sample.mp4`/right); 6 logos, 6 features (Lucide icon names), 3 steps, 3 testimonials, 3 plans with `billingToggle: true`, 6 FAQ items, CTA with 2 buttons, contact subjects `orcamento`/`duvida`/`suporte`/`outro` with labels `Orçamento`/`Dúvida`/`Suporte`/`Outro`, consent label referencing `/privacidade`. Images: lightweight generated placeholders (≤150 KB each, JPG/PNG/SVG).

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm test && pnpm check && pnpm build`
Expected: all schema/section tests pass; build succeeds.

Run: temporarily add a 3rd button to the first hero slide, `pnpm build`
Expected: build fails with a message pointing at `hero` → `slides.0.buttons`. Revert.

- [ ] **Step 5: Commit** — `feat: add content collections with zod schemas and sample content`

---

### Task 4: Theme, Alpine entrypoint, UI primitives, header/footer and E2E harness

**Files:**
- Create: `src/styles/global.css`, `src/lib/alpine.ts` (replace stub), `src/types/alpinejs-ui.d.ts`, `src/components/ui/{Button,Container,SectionHeading}.astro`, `src/components/layout/{Header,MobileMenu,Footer}.astro`, `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/layout.spec.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `package.json`

**Interfaces:**
- Consumes: `getSection('header'|'footer')`, `buildNav`, `enabledSections` (Task 3); `site` (Task 2); `t` (Task 2).
- Produces:
  - `src/lib/alpine.ts`: `export default (Alpine: Alpine) => void` registering plugins `ui`, `focus`, `collapse` and later `Alpine.data(...)` registrations (Tasks 5–8 add lines here).
  - `Button.astro` props: `{ href: string; variant?: 'primary'|'secondary'|'ghost'; size?: 'md'|'lg'; class?: string }` (renders `<a>`); `Container.astro` (`max-w-7xl` + gutters); `SectionHeading.astro` props `{ title: string; subtitle?: string; id: string; level?: 2|3 }`.
  - Theme tokens in `@theme`: `--color-primary-{50..950}`, `--color-secondary-{50..950}`, `--color-neutral-*` (Tailwind default), `--font-sans: 'Inter Variable', system-ui, sans-serif`, `--font-display`, `--radius-card`, `--shadow-card`.
  - `tests/e2e/fixtures.ts`: `export const test` extending Playwright `test` with fixture `expectNoA11yViolations(page): Promise<void>` (AxeBuilder, tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`; fails on `serious`/`critical`).
  - Every section root gets `id` equal to its anchor (`hero`, `features`, `como-funciona`, `depoimentos`, `precos`, `faq`, `contato`).

- [ ] **Step 1: Install deps**

`alpinejs`, `@alpinejs/ui`, `@alpinejs/focus`, `@alpinejs/collapse`, `@types/alpinejs`, `astro-icon`, `@iconify-json/lucide`, `@fontsource-variable/inter`; dev: `@playwright/test`, `@axe-core/playwright`. Run `pnpm exec playwright install chromium`.

- [ ] **Step 2: Verify `@alpinejs/ui` API before coding**

Read `node_modules/@alpinejs/ui/src/{dialog,disclosure,switch}.js` and confirm directive names (`x-dialog`, `x-dialog:panel`, `x-dialog:title`, `x-disclosure`, `x-disclosure:button`, `x-disclosure:panel`, `x-switch:group`, `x-switch`, `x-switch:label`) and model binding (`x-model`). Write `src/types/alpinejs-ui.d.ts` (`declare module '@alpinejs/ui'` etc. for packages without types). If any API differs, use the actual one and note it in the commit body.

- [ ] **Step 3: Configure Playwright**

`playwright.config.ts`: `testDir: 'tests/e2e'`, projects `desktop` (1280×800) and `mobile` (390×844, `isMobile: true`), Chromium only, `baseURL: 'http://localhost:4321'`, `webServer: { command: 'pnpm build --mode test && pnpm preview --port 4321', url: 'http://localhost:4321', reuseExistingServer: !process.env.CI }` (Task 9 extends with the emulator). Create a minimal `.env.test` now (all vars, `PUBLIC_SITE_URL=http://localhost:4321`, `PUBLIC_FIREBASE_PROJECT_ID=demo-landing`, `PUBLIC_USE_FIREBASE_EMULATOR=true`, dummy strings for keys, no GTM id) — commit it (contains no secrets). Script `"test:e2e": "playwright test"`.

- [ ] **Step 4: Write failing E2E `tests/e2e/layout.spec.ts`**

- `skip link moves focus to main` — press Tab on `/`, first focused element has text `Pular para o conteúdo`; Enter → `#main` focused.
- `mobile menu opens, traps focus, closes on Escape and restores focus` (mobile project only): click button `name: 'Abrir menu'` → dialog visible with role `dialog`; Tab cycles inside dialog; Escape → dialog hidden, focus on the menu button.
- `header nav lists only enabled sections` — every `header nav a[href^="#"]` points to an existing element id.
- `footer has privacy, terms and cookie preferences links` — links `Política de privacidade`, `Termos de uso`, button `Preferências de cookies` (button inert until Task 6).
- `home has no serious a11y violations` — `expectNoA11yViolations(page)`.

- [ ] **Step 5: Run — expect FAIL** (`pnpm test:e2e`)

- [ ] **Step 6: Implement theme, primitives, Header (sticky, logo, desktop nav, CTA, mobile button), MobileMenu (`x-dialog` + `x-model="open"`, close button `Fechar menu`, links close menu on click), Footer (columns, social icons via `astro-icon`, copyright, legal links, `Preferências de cookies` button with `data-cc="show-preferencesModal"`), `index.astro` composing Header/Footer.**

Labels from `t.nav`: `openMenu: 'Abrir menu'`, `closeMenu: 'Fechar menu'`, `mainNav: 'Navegação principal'`; footer from `t.common`.

- [ ] **Step 7: Run — expect PASS**

Run: `pnpm test:e2e && pnpm lint && pnpm check`
Expected: all layout specs pass on both projects.

- [ ] **Step 8: Commit** — `feat: add theme tokens, alpine entrypoint, header, mobile menu and footer`

---

### Task 5: Static sections — logos, features, how it works, testimonials, pricing, FAQ, final CTA

**Files:**
- Create: `src/components/sections/{Logos,Features,HowItWorks,Testimonials,Pricing,Faq,FinalCta}.astro`, `src/lib/pricing.ts`
- Modify: `src/pages/index.astro`, `src/lib/alpine.ts`, `src/i18n/pt-BR.ts`
- Test: `tests/unit/pricing.test.ts`, `tests/e2e/sections.spec.ts`

**Interfaces:**
- Consumes: `getSection`, primitives (Task 4), `faqPageJsonLd` (Task 2).
- Produces:
  - `src/lib/pricing.ts`: `formatPrice(value: number): string` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })` when integer, else 2 decimals); `yearlySavingsPercent(monthly: number, yearly: number): number` (rounded integer, `Math.round((1 - yearly / (monthly * 12)) * 100)`); Alpine data `pricing()` → `{ yearly: boolean }` registered as `pricing`.
  - Each section component reads its own data via `getSection` and returns nothing when `null`.
  - FAQ answers rendered from Markdown with `marked` (add dep) at build time; plain text for JSON-LD obtained by stripping tags.

- [ ] **Step 1: Write failing tests**

`tests/unit/pricing.test.ts`:
- `formatPrice(99)` → matches `/R\$\s?99$/`; `formatPrice(99.9)` → matches `/R\$\s?99,90$/`.
- `yearlySavingsPercent(100, 1000)` → `17`.

`tests/e2e/sections.spec.ts`:
- `faq toggles with keyboard` — focus first question button, `aria-expanded="false"`; Enter → `"true"` and panel visible; Space → collapsed.
- `pricing switch shows yearly prices` — switch role `switch` named `Cobrança anual`; toggling flips `aria-checked` and changes the first plan's displayed price to the yearly value from sample content.
- `home includes FAQPage json-ld` — some `script[type="application/ld+json"]` parses to `@type: 'FAQPage'`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement sections**

Logos (grayscale grid, `alt` = name); Features (grid, Lucide icon, `h3` titles); HowItWorks (ordered list `<ol>`); Testimonials (`<figure>`/`<blockquote>`/`<figcaption>`); Pricing (`x-data="pricing"`, `x-switch` toggle only when `billingToggle`, highlighted plan badge `t.pricing.popular = 'Mais popular'`, savings badge); Faq (`x-disclosure` + `x-collapse`, passes `faqPageJsonLd` to layout via `index.astro`); FinalCta (0–2 buttons). Compose all in `index.astro` in spec order (Hero and Contact are added in Tasks 7–8).

- [ ] **Step 4: Run — expect PASS**

Run: `pnpm test && pnpm test:e2e && pnpm lint && pnpm check`

- [ ] **Step 5: Commit** — `feat: add landing sections with pricing toggle and faq`

---

### Task 6: Cookie consent and GTM with Consent Mode v2

**Files:**
- Create: `src/lib/consent.ts`, `src/components/layout/{CookieConsent,GtmHead,GtmBody}.astro`
- Modify: `src/layouts/BaseLayout.astro`, `src/i18n/pt-BR.ts`
- Test: `tests/unit/consent.test.ts`, `tests/e2e/consent.spec.ts`

**Interfaces:**
- Consumes: `gtmId` (Task 2), `t`.
- Produces (`src/lib/consent.ts`):
  - `type ConsentCategory = 'necessary'|'analytics'|'marketing'|'media'`.
  - `consentModeState(accepted: ConsentCategory[]): { analytics_storage: 'granted'|'denied'; ad_storage: …; ad_user_data: …; ad_personalization: … }` (pure).
  - `initConsent(): Promise<void>` — runs `CookieConsent.run(config)` (dynamic import of `vanilla-cookieconsent`), on `onConsent`/`onChange` calls `window.gtag('consent','update', consentModeState(...))`, pushes `{ event: 'cookie_consent_update', consent_categories: [...] }` to `dataLayer`, and dispatches `window` event `consent:change` with `detail: { categories: ConsentCategory[] }`.
  - `hasConsent(category: ConsentCategory): boolean` (wraps `CookieConsent.acceptedCategory`; false before init).
  - `openPreferences(): void`.
  - `cookieTable: { category: ConsentCategory; name: string; provider: string; purpose: string; duration: string }[]` — rows: `cc_cookie` (necessary, 6 meses), reCAPTCHA `_GRECAPTCHA` (necessary), GA `_ga`/`_ga_*` (analytics, 2 anos), Google Ads `_gcl_au` (marketing), YouTube (media; "via youtube-nocookie.com, cookies apenas após reprodução").
  - Consent cookie: name `cc_cookie`, expires 182 days, `revision: 1`.
- `GtmHead.astro`: inline script (`is:inline`) defining `dataLayer`, `gtag`, `gtag('consent','default', { all four: 'denied', wait_for_update: 500 })`, then GTM snippet only when `gtmId` set. Must be the first script in `<head>`.
- `GtmBody.astro`: `<noscript>` iframe only when `gtmId` set.

- [ ] **Step 1: Write failing tests**

`tests/unit/consent.test.ts`:
- `consentModeState(['necessary'])` → all four `'denied'`.
- `['necessary','analytics']` → only `analytics_storage: 'granted'`.
- `['necessary','marketing']` → `ad_storage`, `ad_user_data`, `ad_personalization` granted, analytics denied.
- `['media']` alone → all denied.
- `cookieTable has a row for every category`.

`tests/e2e/consent.spec.ts`:
- `banner shows on first visit` — dialog with button `Aceitar todos` visible.
- `rejecting hides banner and persists` — click `Rejeitar todos`, reload, banner absent; `cc_cookie` cookie present.
- `footer link reopens preferences` — click `Preferências de cookies` → preferences modal visible with toggles `Analytics`, `Marketing`, `Mídia`.
- `accepting updates consent mode` — `page.evaluate(() => window.dataLayer)` contains a `consent`/`update` entry with `analytics_storage: 'granted'` after `Aceitar todos`.
- `no a11y violations with banner open`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

Add dep `vanilla-cookieconsent`; import its CSS in `CookieConsent.astro` and override colors with theme tokens in `global.css` (`--cc-btn-primary-bg: var(--color-primary-700)` etc.). pt-BR translations in `t.consent` (title `Usamos cookies`, buttons `Aceitar todos`, `Rejeitar todos`, `Preferências`, `Salvar preferências`; category titles `Necessários`, `Analytics`, `Marketing`, `Mídia`). `CookieConsent.astro` runs `initConsent()` in a module `<script>`. Footer button uses `data-cc="show-preferencesModal"` (already present).

- [ ] **Step 4: Run — expect PASS** — `pnpm test && pnpm test:e2e && pnpm lint && pnpm check`

- [ ] **Step 5: Commit** — `feat: add cookie consent with gtm consent mode v2`

---

### Task 7: Hero with carousel and image/MP4/YouTube backgrounds

**Files:**
- Create: `src/lib/carousel.ts`, `src/lib/youtube-embed.ts`, `src/components/sections/Hero.astro`, `src/components/hero/{HeroSlide,SlideBackground}.astro`
- Modify: `src/lib/alpine.ts`, `src/pages/index.astro`, `src/i18n/pt-BR.ts`
- Test: `tests/unit/carousel.test.ts`, `tests/unit/hero.test.ts`, `tests/e2e/hero.spec.ts`

**Interfaces:**
- Consumes: hero schema (Task 3), `hasConsent`, `openPreferences`, `consent:change` event (Task 6).
- Produces:
  - `src/lib/carousel.ts`:
    - `shouldAutoplay(cfg: { enabled: boolean }, slideCount: number, reducedMotion: boolean): boolean` — true only if enabled && slideCount > 1 && !reducedMotion.
    - Alpine data `carousel(cfg: { autoplay: boolean; intervalMs: number; transition: 'fade'|'slide'; count: number })` registered as `carousel`, state `{ selected: number; playing: boolean; count }`, methods `next()`, `prev()`, `goTo(i: number)`, `togglePlay()`, `init()` (dynamic-imports `embla-carousel`, `embla-carousel-autoplay`, and `embla-carousel-fade` when `transition === 'fade'`; `loop: true`; autoplay `stopOnInteraction: false`, `stopOnMouseEnter: true`, `stopOnFocusIn: true`; on `select` updates `selected`, pauses non-active `<video>` and plays the active one unless reduced motion), `destroy()`.
  - `src/lib/youtube-embed.ts`: `youtubeEmbedUrl(videoId: string): string` → `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&mute=1&controls=0&loop=1&playlist=<id>&playsinline=1&rel=0&modestbranding=1&disablekb=1`; Alpine data `youtubeEmbed(videoId: string)` registered as `youtubeEmbed`, state `{ allowed: boolean, src: string | null }`; `init()` sets `allowed = hasConsent('media') && !reducedMotion` and listens to `consent:change`; when `allowed` becomes false the iframe is removed (`src = null`).
  - Slide markup: `<section id="hero" aria-roledescription="carousel" aria-label={t.carousel.label}>`; slide `role="group" aria-roledescription="slide" aria-label="{i} de {n}"`; live region `aria-live` = `off` while playing, `polite` when paused.
  - Labels in `t.carousel`: `label: 'Destaques'`, `prev: 'Slide anterior'`, `next: 'Próximo slide'`, `goTo: 'Ir para o slide {n}'`, `pause: 'Pausar carrossel'`, `play: 'Reproduzir carrossel'`, `enableVideo: 'Ativar vídeo'`.
  - First slide background image: `loading="eager"`, `fetchpriority="high"`; others lazy. Background `<Picture>` with `formats={['avif','webp']}`, `widths={[640, 1280, 1920]}`, `sizes="100vw"`.

- [ ] **Step 1: Write failing tests**

`tests/unit/carousel.test.ts`:
- `shouldAutoplay` table: `(enabled, 3, false) → true`, `(enabled, 1, false) → false`, `(enabled, 3, true) → false`, `(disabled, 3, false) → false`.
- `youtubeEmbedUrl('dQw4w9WgXcQ')` host is `www.youtube-nocookie.com` and has `playlist=dQw4w9WgXcQ`, `mute=1`, `loop=1`.

`tests/e2e/hero.spec.ts` (sample hero has 3 slides):
- `next/prev arrows change slide` — slide `aria-label="2 de 3"` becomes active (`aria-hidden` false / `data-active`) after `Próximo slide`.
- `dots navigate` — `Ir para o slide 3` activates slide 3.
- `pause button toggles autoplay` — button `Pausar carrossel` → label becomes `Reproduzir carrossel`; slide index unchanged after `intervalMs + 1000`.
- `reduced motion disables autoplay and video` — `page.emulateMedia({ reducedMotion: 'reduce' })`; active slide unchanged after 8 s; mp4 slide `<video>` is paused (`el.paused === true`).
- `youtube slide shows poster without media consent` — after `Rejeitar todos`, no `iframe[src*="youtube-nocookie"]`; button `Ativar vídeo` visible; clicking opens preferences modal.
- `revoking media consent removes youtube iframe` — accept all → iframe present; reopen preferences, uncheck `Mídia`, save → iframe absent.
- `hero has no a11y violations`.

`tests/unit/hero.test.ts` (Astro Container API, `experimental_AstroContainer.create()`; `Hero.astro` accepts an optional `data` prop of the hero data type, defaulting to `await getSection('hero')`):
- `single slide renders without carousel` — render with one image slide → HTML has no `aria-roledescription="carousel"`, no `Próximo slide`, no `x-data="carousel`.
- `multiple slides render carousel controls` — two slides → HTML contains `aria-roledescription="carousel"` and `Ir para o slide 2`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

Add deps `embla-carousel`, `embla-carousel-autoplay`, `embla-carousel-fade`. `Hero.astro`: 1 slide → static markup (no Alpine data, no controls); 2+ → carousel markup with `x-data="carousel({...})"`. `SlideBackground.astro` switches on `background.type`: `image` → `<Picture>`; `video` → `<video muted loop playsinline preload="none" poster=…>` (`autoplay` attribute only on the first slide and removed by script under reduced motion); `youtube` → poster `<Picture>` + `x-data="youtubeEmbed('<id>')"` with `<template x-if="src"><iframe title=… allow="autoplay; encrypted-media" tabindex="-1" aria-hidden="true"></iframe></template>` + `Ativar vídeo` button (`@click` → `openPreferences()`) shown when `!allowed`. Overlay `bg-black` with `style="opacity: {overlay}"`; content alignment via `align` (`items-start text-left` / `items-center text-center` / `items-end text-right`). Only the first slide's title is the page `h1`; others `p` with heading styles (one `h1` per page).

- [ ] **Step 4: Run — expect PASS** — `pnpm test && pnpm test:e2e && pnpm lint && pnpm check`; confirm in `dist/_astro/` that `embla` is a separate chunk not referenced by a `<script>` tag in `dist/index.html` (only imported dynamically).

- [ ] **Step 5: Commit** — `feat: add hero with carousel and image, video and youtube backgrounds`

---

### Task 8: Contact form (schema, Alpine component, lazy Firebase)

**Files:**
- Create: `src/lib/contact-schema.ts`, `src/lib/contact-form.ts`, `src/lib/firebase.ts`, `src/components/sections/Contact.astro`
- Modify: `src/lib/alpine.ts`, `src/pages/index.astro`, `src/i18n/pt-BR.ts`
- Test: `tests/unit/contact-schema.test.ts`, `tests/unit/contact-form.test.ts`

**Interfaces:**
- Consumes: `firebaseOptions`, `useFirebaseEmulator`, `recaptchaSiteKey` (Task 2); contact section data (Task 3); `site.privacyPolicyVersion`.
- Produces:
  - `src/lib/contact-schema.ts`: `CONTACT_LIMITS = { name: [2,100], email: 254, phoneDigits: [10,11], message: [10,2000], consentVersion: 20, page: 200 } as const`; `createContactSchema(subjects: readonly string[])` → Zod object `{ name, email, phone, subject, message, consent }` where `phone` transforms masked input to digits and `''` → `null`; `type ContactInput = z.input<…>`; `type ContactData = z.output<…>`; `type ContactDoc = ContactData & { consentVersion: string; page: string }`; `toContactDoc(data: ContactData, meta: { consentVersion: string; page: string }): ContactDoc`.
  - `src/lib/firebase.ts`: `submitContact(doc: ContactDoc): Promise<void>` (adds `createdAt: serverTimestamp()` and calls `addDoc(collection(db,'contacts'), …)`); internal singleton `getDb(): Promise<Firestore>` initializing `initializeApp(firebaseOptions)`; App Check `initializeAppCheck(app, { provider: new ReCaptchaV3Provider(recaptchaSiteKey), isTokenAutoRefreshEnabled: true })` **only when `!useFirebaseEmulator`** (with `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` when `import.meta.env.DEV`); `connectFirestoreEmulator(db, '127.0.0.1', 8080)` when `useFirebaseEmulator`. `preloadFirebase(): void` triggers `getDb()` without awaiting.
  - `src/lib/contact-form.ts`: Alpine data `contactForm(opts: { subjects: string[]; consentVersion: string; submit?: (doc: ContactDoc) => Promise<void> })` registered as `contactForm`. Default `submit` = `(doc) => import('./firebase').then(m => m.submitContact(doc))`. State: `{ values: { name, email, phone, subject, message, consent: false, website: '' }, errors: Partial<Record<field, string>>, status: 'idle'|'submitting'|'success'|'error' }`. Methods: `validateField(field)`, `onSubmit(): Promise<void>`, `retry(): Promise<void>`, `init()` (IntersectionObserver `rootMargin: '200px'` + first `focusin` → `import('./firebase').then(m => m.preloadFirebase())`, once). After invalid submit, focuses the first invalid field via `this.$refs[field]`. Methods other than `init`/focus must not touch `$el`/`$refs` so they are unit-testable.
  - Error messages (Zod issue → `t.form.errors.*`): `required: 'Campo obrigatório'`, `nameLength: 'Informe entre 2 e 100 caracteres'`, `email: 'Informe um e-mail válido'`, `phone: 'Informe um telefone com DDD'`, `messageLength: 'Escreva entre 10 e 2000 caracteres'`, `consent: 'É necessário aceitar a política de privacidade'`, `subject: 'Selecione um assunto'`. Status copy: `success: 'Mensagem enviada! Responderemos em breve.'`, `error: 'Não foi possível enviar. Verifique sua conexão e tente novamente.'`, `retry: 'Tentar novamente'`, `submit: 'Enviar mensagem'`, `submitting: 'Enviando…'`.

- [ ] **Step 1: Write failing tests**

`tests/unit/contact-schema.test.ts` (subjects `['orcamento','duvida','suporte','outro']`):
- valid full input passes; `phone '(11) 98765-4321'` → `'11987654321'`.
- `empty masked phone becomes null` — `phone: ''` and `phone: '(__) _____-____'` → `null`.
- name of 1 char fails; 101 chars fails; trimmed `'  Ana  '` → `'Ana'`.
- email `'a@b'` fails; 255-char email fails.
- phone with 9 digits fails; 12 digits fails.
- message 9 chars fails; 2001 fails.
- subject `'spam'` fails.
- `consent: false` fails.
- `toContactDoc` adds `consentVersion` and `page`, has no `website` key.

`tests/unit/contact-form.test.ts` (`// @vitest-environment happy-dom`; call the factory, bind `$refs` stub, inject `submit = vi.fn()`):
- invalid submit sets `errors.email` and keeps `status 'idle'`, `submit` not called.
- valid submit calls `submit` once with a `ContactDoc` (`consentVersion` from opts, `page` = `location.pathname`) and ends in `'success'`.
- `honeypot filled → success without calling submit`.
- `submit rejects → status 'error' and values preserved`; `retry()` calls `submit` again.
- `ignores submit while submitting` — two `onSubmit()` calls without awaiting → `submit` called once.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement schema, firebase module, form component, and `Contact.astro`**

Add deps `firebase`, `imask`. `Contact.astro`: `<section id="contato">`, `<form novalidate @submit.prevent="onSubmit">`; each field has `<label>`, `x-model`, `@blur="validateField('…')"`, `:aria-invalid`, `aria-describedby` pointing at an error `<p id="…-error">`; phone uses `x-init` IMask with mask `[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]`; subject `<select>` from `contact.yaml`; consent checkbox with label HTML linking `/privacidade`; honeypot `<div aria-hidden="true" class="sr-only">` containing `<input name="website" tabindex="-1" autocomplete="off">`; submit button `:disabled="status === 'submitting'"`; success block `role="status"` replacing the form; error block `role="alert"` with `Tentar novamente`.

- [ ] **Step 4: Run — expect PASS** — `pnpm test && pnpm lint && pnpm check && pnpm build`; confirm `dist/index.html` has no `<script>` referencing a chunk that contains `firestore` (grep chunk names imported statically from the page entry).

- [ ] **Step 5: Commit** — `feat: add contact form with zod validation and lazy firebase`

---

### Task 9: Firestore rules, emulator, rules tests and form E2E

**Files:**
- Create: `firebase/firestore.rules`, `firebase/firestore.indexes.json`, `firebase/firebase.json`, `.firebaserc`, `tests/rules/contacts.test.ts`, `vitest.rules.config.ts`, `tests/e2e/contact.spec.ts`
- Modify: `package.json`, `playwright.config.ts`, `.env.example`, `.env.test`

**Interfaces:**
- Consumes: `ContactDoc` shape and `CONTACT_LIMITS` (Task 8); subjects list (Task 3).
- Produces: scripts `"test:rules": "firebase emulators:exec --only firestore --project demo-landing --config firebase/firebase.json \"vitest run --config vitest.rules.config.ts\""`, `"dev:emulators": "concurrently -k -n fb,astro \"firebase emulators:start --only firestore --project demo-landing --config firebase/firebase.json\" \"astro dev --mode test\""`. Firestore emulator port `8080`, UI disabled in CI.

- [ ] **Step 1: Install** dev deps `firebase-tools`, `@firebase/rules-unit-testing`, `concurrently`. Requires Java 21+ locally (document in README).

- [ ] **Step 2: Write failing rules tests `tests/rules/contacts.test.ts`**

`initializeTestEnvironment({ projectId: 'demo-landing', firestore: { rules: readFileSync('firebase/firestore.rules','utf8'), host: '127.0.0.1', port: 8080 } })`; unauthenticated context; `valid()` helper builds a doc with `createdAt: serverTimestamp()`.
- `assertSucceeds` create valid doc; valid doc with `phone: null`.
- `assertFails`: extra key `foo`; missing `message`; `name` number; `name` 101 chars; `message` 9 chars; `email` `'nope'`; `phone` `'123'`; `subject` `'spam'`; `consent: false`; `createdAt` = `Timestamp.fromDate(new Date(2000,0,1))`; `consentVersion` 21 chars; `page` 201 chars.
- `assertFails`: get, list, update, delete on `contacts`; write to `other/x`.

- [ ] **Step 3: Run — expect FAIL** (`pnpm test:rules`; rules file missing/deny-all)

- [ ] **Step 4: Implement `firestore.rules`**

`rules_version = '2'`; function `isValidContact(d)` checking `d.keys().hasOnly(K) && d.keys().hasAll(K)` with K = `['name','email','phone','subject','message','consent','consentVersion','createdAt','page']`, types/sizes per Global Constraints, `d.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')`, `d.phone == null || (d.phone is string && d.phone.matches('^[0-9]{10,11}$'))`, `d.subject in ['orcamento','duvida','suporte','outro']` (comment: must mirror `src/content/sections/contact.yaml`), `d.consent == true`, `d.createdAt == request.time`. `match /contacts/{id} { allow create: if isValidContact(request.resource.data); allow read, update, delete: if false; }`, catch-all deny. `firebase.json`: `firestore.rules`, `firestore.indexes`, `emulators.firestore.port 8080`, `emulators.ui.enabled false`, `singleProjectMode true`.

- [ ] **Step 5: Run — expect PASS** — `pnpm test:rules`

- [ ] **Step 6: Write failing E2E `tests/e2e/contact.spec.ts`**

Playwright `webServer` becomes an array: Firestore emulator (`firebase emulators:start --only firestore --project demo-landing --config firebase/firebase.json`, `url: 'http://127.0.0.1:8080'`) + preview. `beforeEach` clears data: `DELETE http://127.0.0.1:8080/emulator/v1/projects/demo-landing/databases/(default)/documents`.
- `shows inline errors on empty submit` — click `Enviar mensagem`; `Campo obrigatório` visible under name; focus on name input.
- `submits and stores document` — fill all fields (phone `11987654321`, subject `Dúvida`), check consent, submit → `Mensagem enviada!` visible; `GET …/documents/contacts` returns 1 doc with `subject.stringValue === 'duvida'`, `phone.stringValue === '11987654321'`.
- `honeypot filled shows success but stores nothing` — `page.locator('input[name=website]').fill('x', { force: true })`, submit valid → success; emulator returns 0 docs.
- `contact section has no a11y violations`.

- [ ] **Step 7: Run — expect FAIL then implement remaining glue until PASS** — `pnpm test:e2e`

- [ ] **Step 8: Commit** — `feat: add firestore rules, emulator setup and contact e2e tests`

---

### Task 10: Legal pages, 404, cookie table and OG images

**Files:**
- Create: `src/content/legal/{privacidade,termos}.md`, `src/pages/privacidade.astro`, `src/pages/termos.astro`, `src/pages/404.astro`, `src/components/legal/CookieTable.astro`, `src/pages/og/[...route].ts`, `tests/e2e/pages.spec.ts`
- Modify: `src/content.config.ts` (add `legal` collection: `glob({ pattern: '*.md', base: './src/content/legal' })`, schema `{ title: string, description: string, updatedAt: z.coerce.date() }`), `src/components/seo/Seo.astro`

**Interfaces:**
- Consumes: `cookieTable` (Task 6), `site`.
- Produces: OG images at `/og/<slug>.png` for slugs `index`, `privacidade`, `termos` via `OGImageRoute` from `astro-og-canvas` (`param: 'route'`, `pages` map `{ index: { title: site.name, description: site.description }, … }`, `bgGradient: [site.ogBackground]`, `logo: { path: './src/assets/brand/logo.png' }`); `Seo.astro` default `ogImage` = `/og/<slug>.png` resolved absolute.

- [ ] **Step 1: Write failing E2E `tests/e2e/pages.spec.ts`**
- `privacy page renders cookie table` — `/privacidade` has `h1` from frontmatter and a `table` with a row containing `cc_cookie`.
- `terms page renders` — `/termos` has `h1`.
- `404 page` — `/nao-existe` (preview serves `404.html`) shows `h1` `Página não encontrada` and a link `Voltar para o início`.
- `og image exists` — `GET /og/index.png` returns 200 and `content-type` `image/png`.
- `no a11y violations` on `/privacidade`, `/termos`, `/nao-existe`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement** — legal Markdown templates in pt-BR with placeholders clearly marked `[NOME DA EMPRESA]`, `[CNPJ]`, `[E-MAIL DO ENCARREGADO]` (LGPD sections: dados coletados, finalidade, base legal, compartilhamento — Firebase/Google, cookies, direitos do titular, contato do encarregado); `privacidade.astro` renders content + `CookieTable` grouped by category; `404.astro` uses BaseLayout. Add dep `astro-og-canvas`.

- [ ] **Step 4: Run — expect PASS** — `pnpm test:e2e && pnpm build`

- [ ] **Step 5: Commit** — `feat: add legal pages, 404, cookie table and og images`

---

### Task 11: CI workflow and Lighthouse CI

**Files:**
- Create: `.github/workflows/ci.yml`, `lighthouserc.json`
- Modify: `package.json` (script `"lhci": "lhci autorun"`), any component needed to meet budgets

**Interfaces:**
- Consumes: all scripts from Tasks 1–10.
- Produces: workflow named `CI` (Task 12's deploy listens to it via `workflow_run`).

- [ ] **Step 1: Write `lighthouserc.json`**

`ci.collect.staticDistDir: './dist'`, `url: ['http://localhost/index.html','http://localhost/privacidade/index.html']`, `numberOfRuns: 3`, `settings.preset: 'desktop'` — plus a second run in CI with mobile default (two `lhci` invocations: `--collect.settings.preset=desktop` and default). `ci.assert.assertions`: `categories:performance`, `categories:accessibility`, `categories:best-practices`, `categories:seo` each `['error', { minScore: 0.9 }]`. `ci.upload.target: 'temporary-public-storage'`.

- [ ] **Step 2: Run locally — expect PASS or fix**

Run: `pnpm build --mode test && pnpm lhci`
Expected: all assertions pass. If performance < 0.9 on mobile, fix the cause (typical: hero LCP image priority, unoptimized poster, font preload — preload `inter` latin woff2 in `BaseLayout`), not the threshold.

- [ ] **Step 3: Write `ci.yml`**

Triggers: `pull_request`, `push` on `main`. `concurrency: ci-${{ github.ref }}` with cancel-in-progress. Single job `quality` on `ubuntu-latest`: checkout → `pnpm/action-setup` → `actions/setup-node` (`node-version-file: .nvmrc`, `cache: pnpm`) → `actions/setup-java` (temurin 21) → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm format:check` → `pnpm check` → `pnpm test` → `pnpm test:rules` → `pnpm exec playwright install --with-deps chromium` → `pnpm test:e2e` (CI uses `.env.test` via `--mode test`) → `pnpm lhci`. Upload `playwright-report/` as artifact on failure. Cache `~/.cache/firebase/emulators`.

- [ ] **Step 4: Validate workflow syntax** — `pnpm dlx @action-validator/cli .github/workflows/ci.yml` (or `actionlint` if available). Expected: no errors.

- [ ] **Step 5: Commit** — `ci: add quality workflow with tests and lighthouse budgets`

---

### Task 12: Deploy, release, dependency updates, templates and documentation

**Files:**
- Create: `.github/workflows/deploy.yml`, `.github/workflows/release.yml`, `release-please-config.json`, `.release-please-manifest.json`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/{bug_report.yml,feature_request.yml}`, `docs/aws-setup.md`, `docs/security-headers.md`, `docs/firebase-setup.md`, `README.md`, `CONTRIBUTING.md`
- Modify: `.env.example` (final review)

**Interfaces:**
- Consumes: workflow `CI` (Task 11); env var list (Task 2).
- Produces: GitHub Environment `production` contract — `vars`: `PUBLIC_SITE_URL`, `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID`, `PUBLIC_RECAPTCHA_SITE_KEY`, `PUBLIC_GTM_ID`, `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

- [ ] **Step 1: `deploy.yml`**

Triggers: `workflow_run: { workflows: ['CI'], types: [completed], branches: [main] }` and `workflow_dispatch`. Job condition: `github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'`. `environment: production`; `permissions: { id-token: write, contents: read }`; `concurrency: deploy-production` (no cancel). Steps: checkout (`ref: ${{ github.event.workflow_run.head_sha || github.sha }}`) → pnpm/node setup → install → **generate `.env`**: one `echo "NAME=${{ vars.NAME }}" >> .env` per `PUBLIC_*` var → `pnpm build` → `aws-actions/configure-aws-credentials@v4` (`role-to-assume: ${{ vars.AWS_ROLE_ARN }}`, `aws-region: ${{ vars.AWS_REGION }}`) → `aws s3 sync dist/_astro s3://$S3_BUCKET/_astro --cache-control "public,max-age=31536000,immutable"` → `aws s3 sync dist s3://$S3_BUCKET --delete --exclude "_astro/*" --cache-control "public,max-age=0,must-revalidate"` → `aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"`. Order matters: immutable assets first, then HTML.

- [ ] **Step 2: `release.yml`** — on push to `main`, `googleapis/release-please-action@v4` with `release-type: node` via `release-please-config.json` (`"packages": { ".": { "release-type": "node", "changelog-path": "CHANGELOG.md" } }`) and manifest `{ ".": "0.1.0" }`; set `"version": "0.1.0"` in `package.json`. Permissions `contents: write`, `pull-requests: write`.

- [ ] **Step 3: `dependabot.yml`** — ecosystems `npm` (directory `/`) and `github-actions`, `interval: weekly`, `day: monday`, `cooldown: { default-days: 14 }`, groups `minor-and-patch` (`update-types: [minor, patch]`), `commit-message.prefix: 'chore(deps)'`.

- [ ] **Step 4: Templates** — PR template checklist (Conventional Commit title, tests added, `pnpm lint/test/test:e2e` pass, screenshots for UI changes, a11y checked); issue forms for bug (steps, expected, actual, browser) and feature (problem, proposal).

- [ ] **Step 5: Docs (pt-BR)**

- `docs/aws-setup.md` — exactly the items in spec §13 (bucket privado com Block Public Access; CloudFront com OAC e bucket policy gerada; default root object `index.html`; CloudFront Function viewer-request com o código completo de rewrite: se a URI termina em `/` acrescenta `index.html`, se não tem extensão acrescenta `/index.html`; custom error responses 403 e 404 → `/404.html` com status 404; IAM OIDC provider `token.actions.githubusercontent.com` audience `sts.amazonaws.com`; role com trust policy `repo:<OWNER>/<REPO>:environment:production` e a policy JSON mínima completa; GitHub Environment `production` com a lista de vars do Interfaces; aprovação manual opcional).
- `docs/security-headers.md` — Response Headers Policy: HSTS `max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and the full CSP: `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://www.youtube-nocookie.com https://www.google.com/recaptcha/ https://recaptcha.google.com https://www.googletagmanager.com; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com https://i.ytimg.com; style-src 'self' 'unsafe-inline'; font-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`, plus a note on why `'unsafe-inline'` is needed (GTM/consent inline bootstrap) and that tags added in GTM may need extra hosts.
- `docs/firebase-setup.md` — spec §13 items: criar projeto, app web e copiar config para as vars; Firestore em modo produção; `pnpm exec firebase deploy --only firestore:rules --config firebase/firebase.json --project <id>`; App Check com reCAPTCHA v3 (domínios), debug token para `astro dev` contra projeto real, enforcement no Firestore; extensão Trigger Email (opcional, plano Blaze, SMTP via SES/Resend) — como habilitar e qual documento gravar.
- `README.md` — visão geral, stack, requisitos (Node 24, pnpm 11, Java 21 para emulator), quick start, **"Personalizando para um cliente"** checklist (content YAML, `site.config.ts`, tokens em `global.css`, logo/favicons, legal placeholders, lista de assuntos em YAML + rules, `.env`), scripts table, variáveis de ambiente table, deploy (link aws-setup), testes, próximos passos (spec §15 list).
- `CONTRIBUTING.md` — Conventional Commits with examples, branch/PR flow, how to run each test suite, release-please behavior.

- [ ] **Step 6: Validate**

Run: `pnpm dlx @action-validator/cli .github/workflows/deploy.yml && pnpm dlx @action-validator/cli .github/workflows/release.yml && pnpm format:check && pnpm lint`
Expected: no errors.

- [ ] **Step 7: Full verification**

Run: `pnpm lint && pnpm format:check && pnpm check && pnpm test && pnpm test:rules && pnpm test:e2e && pnpm build --mode test && pnpm lhci`
Expected: all green.

- [ ] **Step 8: Commit** — `ci: add deploy and release workflows, dependabot, templates and docs`
