# Astro Landing Page Boilerplate — Design

- **Data:** 2026-11-03
- **Status:** aprovado em conversa (seções 1–5); aguardando revisão desta spec escrita
- **Repositório:** `projects/astro-landing-page` (branch `main`)

## 1. Objetivo

Boilerplate reutilizável de landing page para clientes. Para cada novo cliente, o desenvolvedor clona o repositório e personaliza **apenas** conteúdo (`src/content/`), configuração global (`src/site.config.ts`), tokens visuais (`src/styles/global.css`) e variáveis de ambiente — sem editar componentes.

### Critérios de sucesso

- Personalizar um cliente sem tocar em `src/components/`.
- Lighthouse ≥ 90 em Performance, Accessibility, Best Practices e SEO (verificado em CI).
- Zero violações axe `serious`/`critical` nas páginas publicadas.
- Formulário de contato grava no Firestore protegido por Security Rules + App Check.
- Deploy automatizado em S3 + CloudFront via GitHub Actions com OIDC.
- Commits padronizados (Conventional Commits) e formatação automática ao salvar.
- Bibliotecas de mercado em vez de código próprio, para manutenção sem IA.

## 2. Decisões

| Tema            | Decisão                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Propósito       | Boilerplate reutilizável para clientes                                                                                        |
| Framework       | Astro 7.x, `output: 'static'`, TypeScript `strict`                                                                            |
| Interatividade  | Alpine.js via `@astrojs/alpinejs` + `@alpinejs/ui`, `@alpinejs/focus`, `@alpinejs/collapse`                                   |
| Estilo          | Tailwind CSS v4 (`@tailwindcss/vite`), tokens em `@theme`; fontes self-hosted via Fontsource                                  |
| Dark mode       | Não (tokens preparados para adicionar depois)                                                                                 |
| Idiomas         | Somente pt-BR, textos de UI centralizados em `src/i18n/pt-BR.ts`                                                              |
| Conteúdo        | Astro Content Collections (YAML) com schemas Zod + `site.config.ts`                                                           |
| Ícones          | `astro-icon` + Iconify (Lucide)                                                                                               |
| Carrossel       | Embla Carousel (+ plugins autoplay e fade)                                                                                    |
| Formulário      | Campos nome, e-mail, telefone (opcional, máscara BR via IMask), assunto (select), mensagem, consentimento LGPD; validação Zod |
| Backend do form | Firestore direto do navegador (SDK modular carregado sob demanda)                                                             |
| Antispam        | Honeypot + Firestore Security Rules estritas + Firebase App Check (reCAPTCHA v3)                                              |
| Pós-envio       | Apenas grava; notificação por e-mail documentada (extensão Trigger Email)                                                     |
| Cookies         | `vanilla-cookieconsent` v3 + Google Tag Manager com Consent Mode v2                                                           |
| Hospedagem      | AWS S3 + CloudFront (OAC), deploy via GitHub Actions com OIDC                                                                 |
| Infra AWS       | Criada manualmente pelo usuário, documentada em `docs/aws-setup.md`                                                           |
| Testes          | Vitest, testes de Firestore Rules (emulator), Playwright E2E + axe, Lighthouse CI                                             |
| Repositório     | pnpm, Husky, lint-staged, commitlint (inglês), Dependabot, release-please                                                     |
| Abordagem de JS | **Ilhas sob demanda**: Firebase via `import()` dinâmico; Embla só quando há 2+ slides                                         |

## 3. Arquitetura e estrutura

```
astro-landing-page/
├─ .github/
│  ├─ workflows/ci.yml
│  ├─ workflows/deploy.yml
│  ├─ workflows/release.yml
│  ├─ dependabot.yml
│  ├─ PULL_REQUEST_TEMPLATE.md
│  └─ ISSUE_TEMPLATE/ (bug_report.yml, feature_request.yml)
├─ .husky/ (pre-commit, commit-msg)
├─ .vscode/ (settings.json, extensions.json)
├─ docs/ (aws-setup.md, firebase-setup.md, security-headers.md)
├─ firebase/
│  ├─ firestore.rules
│  ├─ firestore.indexes.json
│  └─ firebase.json            # emulators + deploy de rules (sem hosting)
├─ public/ (favicons, robots.txt, site.webmanifest)
├─ src/
│  ├─ assets/                  # imagens otimizadas por astro:assets
│  ├─ components/
│  │  ├─ layout/               # Header, Footer, MobileMenu, SkipLink, CookieConsent
│  │  ├─ sections/             # Hero, Logos, Features, HowItWorks, Testimonials,
│  │  │                        # Pricing, Faq, FinalCta, Contact
│  │  ├─ hero/                 # HeroSlide, SlideBackground
│  │  ├─ ui/                   # Button, Container, SectionHeading, ...
│  │  └─ seo/                  # Seo, JsonLd
│  ├─ content/                 # YAML por seção + legal/*.md
│  ├─ content.config.ts
│  ├─ i18n/pt-BR.ts
│  ├─ layouts/BaseLayout.astro
│  ├─ lib/
│  │  ├─ alpine.ts             # entrypoint do Alpine (plugins + Alpine.data)
│  │  ├─ firebase.ts           # init lazy singleton (app + App Check + Firestore)
│  │  ├─ contact-schema.ts     # schema Zod do formulário (fonte única)
│  │  ├─ contact-form.ts       # componente Alpine do formulário
│  │  ├─ carousel.ts           # componente Alpine que encapsula Embla
│  │  ├─ consent.ts            # config cookieconsent + Consent Mode v2
│  │  └─ env.ts                # leitura tipada das variáveis (astro:env)
│  ├─ pages/                   # index, privacidade, termos, 404, og/[...route].ts
│  ├─ styles/global.css
│  └─ site.config.ts
├─ tests/ (unit/, rules/, e2e/)
├─ .env.example, .nvmrc, .editorconfig
├─ commitlint.config.js, eslint.config.js, prettier.config.js, lighthouserc.json
├─ astro.config.ts, tsconfig.json, package.json, pnpm-workspace.yaml
└─ README.md, CONTRIBUTING.md, CHANGELOG.md (gerado)
```

### Princípios

- Componentes `.astro` são **apresentacionais**: renderizam HTML a partir do conteúdo, sem lógica de interação.
- Toda interatividade fica em `src/lib/*.ts` como componentes Alpine registrados com `Alpine.data()`; o markup usa apenas `x-data="nomeDoComponente"`. Esses módulos são tipados e testáveis no Vitest.
- `alpine.ts` registra os plugins `ui`, `focus` e `collapse` e os componentes globais.
- O Firebase nunca está no bundle inicial: `lib/firebase.ts` é importado dinamicamente pelo `contactForm`.
- Embla só é importado pelo componente `carousel` quando o hero tem 2+ slides.

## 4. Conteúdo e modelo de dados

Cada seção corresponde a um arquivo YAML em `src/content/`, validado por schema Zod em `content.config.ts`. Um erro de schema falha o build com mensagem clara.

- Seção com `enabled: false` (ou arquivo ausente) não é renderizada e seu link é removido automaticamente da navegação.
- Imagens referenciadas no YAML usam o helper `image()` das collections e são otimizadas pelo `astro:assets` (AVIF/WebP).
- Conteúdo de exemplo genérico ("Sua Empresa") com imagens placeholder leves versionadas.

### Hero

```yaml
enabled: true
autoplay: { enabled: true, intervalMs: 7000 }
transition: fade # fade | slide
slides:
  - background:
      type: image # image | video | youtube
      src: ../assets/hero/slide-1.jpg
      alt: 'Descrição da imagem'
    overlay: 0.45 # 0–0.9
    align: left # left | center | right
    title: 'Título principal'
    description: 'Subtítulo'
    buttons: # 0 a 2
      - { label: 'Comece agora', href: '#contato', variant: primary }
      - { label: 'Saiba mais', href: '#features', variant: secondary }
```

Regras do schema:

- `slides`: mínimo 1.
- `background` é união discriminada por `type`:
  - `image`: `src` (imagem), `alt` obrigatórios.
  - `video`: `src` (caminho de MP4 em `public/`), `poster` (imagem) obrigatórios.
  - `youtube`: `videoId`, `poster` (imagem) obrigatórios.
- `buttons`: máximo 2; `variant` ∈ `primary | secondary`.
- `overlay`: número entre 0 e 0.9, padrão 0.4.
- `align`: padrão `center`.

Comportamento:

- 1 slide → hero estático, sem carregar Embla.
- 2+ slides → carrossel.
- Primeiro slide com `loading="eager"` e `fetchpriority="high"` (LCP); demais lazy.

### Demais seções

| Arquivo                                   | Campos principais                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `header.yaml`                             | logo, links de navegação (âncoras), CTA                                                                         |
| `logos.yaml`                              | `enabled`, título, itens `{ name, image }`                                                                      |
| `features.yaml`                           | `enabled`, título, subtítulo, itens `{ icon, title, description }`                                              |
| `how-it-works.yaml`                       | `enabled`, título, passos `{ title, description }`                                                              |
| `testimonials.yaml`                       | `enabled`, título, itens `{ quote, name, role, company, avatar? }`                                              |
| `pricing.yaml`                            | `enabled`, título, `billingToggle`, planos `{ name, priceMonthly, priceYearly?, features[], highlighted, cta }` |
| `faq.yaml`                                | `enabled`, título, itens `{ question, answer }` (answer em Markdown)                                            |
| `cta.yaml`                                | `enabled`, título, descrição, botões (0–2)                                                                      |
| `contact.yaml`                            | `enabled`, título, descrição, opções de assunto, texto do consentimento                                         |
| `footer.yaml`                             | colunas de links, redes sociais, copyright                                                                      |
| `legal/privacidade.md`, `legal/termos.md` | Markdown; a tabela de cookies é injetada a partir de `consent.ts`                                               |

### `site.config.ts`

Nome da empresa, URL base (de `PUBLIC_SITE_URL`), idioma (`pt-BR`), e-mail, telefone, endereço opcional, redes sociais, logo padrão (OG/JSON-LD), versão da política de privacidade (`privacyPolicyVersion`, ex. `"2026-11-03"`).

## 5. Seções e componentes interativos

Páginas: `/` (todas as seções), `/privacidade`, `/termos`, `404`.

Ordem das seções em `/`: Header → Hero → Logos → Features → Como funciona → Depoimentos → Pricing → FAQ → CTA final → Contato → Footer. Banner de cookies sobreposto.

| Componente                    | Implementação                                                               |
| ----------------------------- | --------------------------------------------------------------------------- |
| Menu mobile                   | `x-dialog` do `@alpinejs/ui` (focus trap, Esc fecha, foco retorna ao botão) |
| Toggle mensal/anual (pricing) | `x-switch` do `@alpinejs/ui`                                                |
| FAQ                           | `x-disclosure` do `@alpinejs/ui` + `x-collapse`                             |
| Carrossel                     | componente Alpine `carousel` encapsulando Embla                             |
| Formulário                    | componente Alpine `contactForm`                                             |
| Banner de cookies             | `vanilla-cookieconsent`                                                     |

### Carrossel

- Embla + `embla-carousel-autoplay`; `embla-carousel-fade` quando `transition: fade`.
- Autoplay com intervalo configurável; pausa em hover e em foco do teclado.
- Botão visível de pausar/reproduzir (WCAG 2.2.2).
- Setas, indicadores (dots), navegação por teclado (setas esquerda/direita quando o carrossel tem foco) e swipe.
- `prefers-reduced-motion: reduce` → sem autoplay e vídeos não tocam automaticamente (exibem o poster).
- MP4: `<video muted autoplay loop playsinline poster>`; somente o slide ativo toca, os demais ficam pausados.
- YouTube: iframe `youtube-nocookie.com` em modo de fundo (mudo, sem controles, loop, `playlist=<videoId>`), com o poster sobreposto até carregar; só carrega com consentimento da categoria **Mídia** — sem consentimento, mostra o poster e um botão "Ativar vídeo" que abre as preferências de cookies.
- Semântica: container com `aria-roledescription="carousel"` e `aria-label`; cada slide `role="group"`, `aria-roledescription="slide"`, `aria-label="X de N"`; região `aria-live="polite"` quando pausado, `off` durante autoplay.

## 6. Formulário de contato e Firebase

### Fluxo

1. Estados do `contactForm`: `idle → submitting → success | error`.
2. Carregamento lazy de `lib/firebase.ts` na primeira interação (foco em um campo) ou quando a seção de contato entra perto do viewport (IntersectionObserver, `rootMargin` de 200px). Singleton — inicializa uma vez.
3. `lib/firebase.ts` inicializa: `initializeApp` → `initializeAppCheck` com `ReCaptchaV3Provider` (`isTokenAutoRefreshEnabled: true`) → `getFirestore`. Com `PUBLIC_USE_FIREBASE_EMULATOR=true`: `connectFirestoreEmulator` e `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true`.
4. Validação com o schema Zod de `contact-schema.ts` no blur de cada campo e no submit. Erros inline com `aria-invalid` e `aria-describedby`. Em submit inválido, foco vai ao primeiro campo com erro.
5. Telefone: máscara IMask `(00) 0000-0000` / `(00) 00000-0000`; opcional; se preenchido, 10 ou 11 dígitos.
6. Honeypot: campo `website` visualmente oculto (`aria-hidden`, `tabindex="-1"`, `autocomplete="off"`). Se preenchido → transição para `success` sem enviar.
7. Envio: `addDoc(collection(db, 'contacts'), payload)`.
8. Sucesso: formulário substituído por mensagem com `role="status"`.
9. Erro (rede, App Check, permissão): alerta `role="alert"` com botão "Tentar novamente"; dados preenchidos preservados.

### Schema do formulário (`contact-schema.ts`)

| Campo     | Regra                                                              |
| --------- | ------------------------------------------------------------------ |
| `name`    | string trim, 2–100                                                 |
| `email`   | e-mail válido, máx. 254                                            |
| `phone`   | opcional; dígitos 10–11 (armazenado apenas como dígitos ou `null`) |
| `subject` | um dos valores de `contact.yaml`                                   |
| `message` | string trim, 10–2000                                               |
| `consent` | literal `true`                                                     |

### Documento Firestore — `contacts/{autoId}`

```ts
{
  name: string,
  email: string,
  phone: string | null,
  subject: string,
  message: string,
  consent: true,
  consentVersion: string,       // site.config.privacyPolicyVersion
  createdAt: serverTimestamp(),
  page: string                  // location.pathname
}
```

### `firestore.rules`

- `match /contacts/{id}`:
  - `allow create` somente se:
    - `request.resource.data.keys().hasOnly([...])` e `hasAll([...])` com o conjunto exato de chaves acima;
    - tipos corretos; tamanhos iguais ao schema Zod;
    - `email` casa com regex de e-mail;
    - `phone == null` ou string de 10–11 dígitos;
    - `subject` está na lista permitida (lista duplicada nas rules — documentado que deve espelhar `contact.yaml`);
    - `consent == true`; `consentVersion` string não vazia (máx. 20);
    - `createdAt == request.time`;
    - `page` string, máx. 200.
  - `allow read, update, delete: if false`.
- `match /{document=**}`: `allow read, write: if false`.
- Enforcement do App Check ligado no console do Firebase (passo a passo em `docs/firebase-setup.md`).
- Limitação conhecida: as Rules não fazem rate limiting por IP; a mitigação é o App Check. Rate limiting via Cloud Function fica fora do escopo.

### Desenvolvimento local

- `pnpm dev:emulators` sobe o Firestore Emulator e o `astro dev` em paralelo.
- `.env.example` documenta todas as variáveis com valores de exemplo para o emulator.

## 7. Consentimento de cookies e GTM

- No `<head>`, antes de qualquer tag: defaults do Consent Mode v2 com `ad_storage`, `analytics_storage`, `ad_user_data` e `ad_personalization` todos `denied` (e `wait_for_update`).
- O GTM é carregado só se `PUBLIC_GTM_ID` estiver definido.
- Categorias do `vanilla-cookieconsent`:
  - **Necessários** (somente leitura): o cookie da própria escolha e o reCAPTCHA/App Check (segurança do formulário).
  - **Analytics** → `analytics_storage: granted`.
  - **Marketing** → `ad_storage`, `ad_user_data`, `ad_personalization: granted`.
  - **Mídia** → libera embeds do YouTube.
- Em aceite ou alteração: `gtag('consent', 'update', …)` + evento `cookie_consent_update` no `dataLayer`.
- Link "Preferências de cookies" no footer reabre o modal.
- Textos em pt-BR vindos de `src/i18n/pt-BR.ts`.
- `consent.ts` exporta também a lista de cookies por categoria, usada para gerar a tabela em `/privacidade`.

## 8. SEO

- `@astrojs/sitemap`; `robots.txt` apontando para o sitemap.
- Componente `Seo`: `<title>`, description, canonical, Open Graph, Twitter Card.
- JSON-LD: `Organization` e `WebSite` em todas as páginas; `FAQPage` gerado de `faq.yaml` em `/`.
- Favicons + `site.webmanifest`.
- Imagem OG gerada no build com `astro-og-canvas` (título + logo + cor do tema) por página.

## 9. Tema e estilo

- Tailwind v4 via `@tailwindcss/vite`; tokens em `@theme` no `global.css` (cores primária/secundária/neutras, fontes, raios, sombras).
- Fontes self-hosted via Fontsource (sem Google Fonts remoto).
- Contraste AA garantido nos tokens padrão.
- Sem dark mode.

## 10. Acessibilidade (requisitos de base)

- Skip link para `#main`.
- Landmarks `header`, `nav`, `main`, `footer`.
- Hierarquia de headings correta (um `h1` por página).
- Foco visível em todos os elementos interativos.
- Componentes interativos conforme a seção 5.
- `prefers-reduced-motion` respeitado em animações e no carrossel.

## 11. Tooling

- **pnpm** com versão fixada em `packageManager`; `pnpm-workspace.yaml` com `minimumReleaseAge` de 14 dias.
- **Node 24** (`.nvmrc`, `engines`).
- **ESLint** flat config: `typescript-eslint`, `eslint-plugin-astro`, `eslint-plugin-jsx-a11y` (regras a11y em `.astro`), `eslint-config-prettier`.
- **Prettier**: `prettier-plugin-astro`, `prettier-plugin-tailwindcss`.
- **VS Code**: `editor.formatOnSave: true`, Prettier como formatter padrão, `source.fixAll.eslint` on save; extensões recomendadas: Astro, ESLint, Prettier, Tailwind CSS IntelliSense, Firebase.
- **Husky**: `pre-commit` → `lint-staged` (ESLint `--fix` + Prettier nos arquivos staged); `commit-msg` → `commitlint` com `@commitlint/config-conventional` (mensagens em inglês).
- **`.editorconfig`**.
- **Scripts**: `dev`, `dev:emulators`, `build`, `preview`, `check`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:rules`, `test:e2e`, `lhci`.

## 12. CI/CD

### `ci.yml` — PRs e push na `main`

1. Checkout, setup pnpm + Node 24 com cache.
2. `pnpm install --frozen-lockfile`.
3. `lint`, `format:check`, `check` (astro check).
4. `test` (Vitest).
5. `test:rules` (Firestore Emulator; Java via `actions/setup-java`).
6. `build` com `.env` de CI (valores fictícios + emulator).
7. `test:e2e` (Playwright Chromium contra `preview` + emulator, incluindo axe).
8. `lhci autorun` sobre `dist/` com asserts ≥ 0.9 nas 4 categorias.

### `deploy.yml` — push na `main` (após CI verde, via `workflow_run`) e `workflow_dispatch`

- GitHub Environment `production` (aprovação manual opcional, configurável pelo usuário).
- Permissões: `id-token: write`, `contents: read`.

1. Gera `.env` a partir de `vars.*` do environment (`PUBLIC_*`).
2. `pnpm build`.
3. `aws-actions/configure-aws-credentials` com `role-to-assume: ${{ vars.AWS_ROLE_ARN }}` e `aws-region: ${{ vars.AWS_REGION }}`.
4. `aws s3 sync` em duas passadas:
   - `dist/_astro/` → `Cache-Control: public, max-age=31536000, immutable`;
   - restante → `Cache-Control: public, max-age=0, must-revalidate`, com `--delete`.
5. `aws cloudfront create-invalidation --paths "/*"` usando `vars.CLOUDFRONT_DISTRIBUTION_ID`.

### `release.yml`

- `googleapis/release-please-action` gerando PR de release com `CHANGELOG.md` e bump de versão.

### `dependabot.yml`

- Ecossistemas `npm` e `github-actions`, semanal, com grupos para minor/patch.

### Variáveis de ambiente

Validadas via `astro:env` (schema em `astro.config.ts`); build falha se obrigatória ausente.

| Variável                       | Obrigatória          |
| ------------------------------ | -------------------- |
| `PUBLIC_SITE_URL`              | sim                  |
| `PUBLIC_FIREBASE_API_KEY`      | sim                  |
| `PUBLIC_FIREBASE_AUTH_DOMAIN`  | sim                  |
| `PUBLIC_FIREBASE_PROJECT_ID`   | sim                  |
| `PUBLIC_FIREBASE_APP_ID`       | sim                  |
| `PUBLIC_RECAPTCHA_SITE_KEY`    | sim                  |
| `PUBLIC_GTM_ID`                | não                  |
| `PUBLIC_USE_FIREBASE_EMULATOR` | não (padrão `false`) |

GitHub Environment `production` também contém: `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

## 13. Documentação

- **README.md**: visão geral, stack, como personalizar um cliente (passo a passo), scripts, variáveis, deploy, próximos passos fora do escopo.
- **CONTRIBUTING.md**: convenção de commits, fluxo de PR, como rodar testes.
- **docs/aws-setup.md**:
  - bucket S3 privado;
  - CloudFront com OAC e default root object `index.html`;
  - CloudFront Function (viewer request) que reescreve URIs sem extensão para `/<path>/index.html`;
  - resposta de erro 403/404 → `/404.html` com status 404;
  - provider OIDC `token.actions.githubusercontent.com` no IAM e role com política mínima (`s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject` no bucket; `cloudfront:CreateInvalidation` na distribution), com trust policy restrita ao repositório e ao environment `production`;
  - configuração do GitHub Environment.
- **docs/security-headers.md**: Response Headers Policy do CloudFront com CSP (liberando GTM/Google Analytics, Firebase/Firestore, reCAPTCHA, YouTube nocookie), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`.
- **docs/firebase-setup.md**: criar projeto, registrar app web, Firestore, deploy das rules (`firebase deploy --only firestore:rules`), App Check com reCAPTCHA v3, debug token local, enforcement, e como ativar a extensão Trigger Email (opcional).

## 14. Testes

### Vitest (`tests/unit/`)

- `contact-schema`: casos válidos/inválidos por campo.
- `contact-form`: transições de estado; honeypot não chama envio; erro de rede preserva dados. Firebase mockado na fronteira `lib/firebase.ts`.
- Schemas das collections: hero rejeita 3 botões; rejeita `youtube`/`video` sem `poster`.
- `consent`: cada categoria dispara o `gtag('consent','update')` correto.

### Firestore Rules (`tests/rules/`)

`@firebase/rules-unit-testing` contra o emulator:

- `create` válido passa;
- falham: chave extra, chave faltando, tipo errado, tamanho excedido, `consent: false`, `createdAt` forjado, `subject` fora da lista;
- falham: `read`, `update`, `delete`, escrita em outra coleção.

### Playwright (`tests/e2e/`)

Chromium, viewports 1280 e 390:

- Formulário: erros inline, envio bem-sucedido, documento verificado no emulator via REST.
- Carrossel: setas, dots, pausa; sem autoplay com `reducedMotion: 'reduce'`; YouTube exibe poster sem consentimento de Mídia.
- Menu mobile: abre, prende foco, fecha com Esc, foco retorna.
- FAQ: abre/fecha via teclado.
- Cookies: banner na primeira visita, escolha persiste, link do footer reabre.
- axe (`@axe-core/playwright`) em `/`, `/privacidade`, `/termos`, `404`: zero violações `serious`/`critical`.
- Sem visual regression (o visual muda por cliente).

### Lighthouse CI

- `lighthouserc.json` com asserts ≥ 0.9 em performance, accessibility, best-practices e seo, rodando sobre `dist/`.

## 15. Fora do escopo

Documentado no README como próximos passos:

- Notificação por e-mail (extensão Trigger Email).
- Rate limiting via Cloud Function.
- i18n completo.
- Dark mode.
- CMS visual (Keystatic/Decap).
- Infraestrutura AWS como código.
- Painel administrativo de contatos.

## 16. Riscos e pontos a validar no plano

- **`@astrojs/alpinejs` 1.0.0 com Astro 7**: confirmar compatibilidade e o uso de `entrypoint` para registrar plugins.
- **`@alpinejs/ui`**: documentação curta; confirmar API de `x-dialog`, `x-switch` e `x-disclosure` na versão 3.17.x antes de implementar.
- **Lighthouse ≥ 90 em Performance** com hero de vídeo/YouTube: depende do poster como LCP; vídeo só inicia após carga.
- **CSP**: GTM injeta scripts de terceiros; a CSP documentada precisa ser ajustada conforme as tags que o cliente adicionar ao GTM.
- **Firestore Emulator no CI** requer Java; tempo de job maior.
