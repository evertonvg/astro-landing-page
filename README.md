# astro-landing-page

Boilerplate reutilizável de landing page em português (pt-BR): site estático, rápido e acessível, com formulário de contato, banner de cookies (LGPD) e deploy automatizado na AWS. Um novo cliente se configura editando conteúdo e tokens, sem tocar nos componentes.

## Stack

- [Astro 7](https://astro.build) (`output: 'static'`) + TypeScript 6 + Tailwind CSS 4
- Alpine.js (+ plugins `collapse`, `focus`, `ui`) para interações; Embla para carrosséis
- Conteúdo em YAML/Markdown (content collections validadas com Zod)
- Firebase: Firestore (contatos) + App Check (reCAPTCHA v3), carregados só sob demanda
- Google Tag Manager com Consent Mode, banner via `vanilla-cookieconsent`
- Testes: Vitest, regras do Firestore (emulator), Playwright + axe, Lighthouse CI
- CI/CD: GitHub Actions, S3 + CloudFront (OIDC), release-please, Dependabot

## Requisitos

- Node 24 (`.nvmrc`)
- pnpm 11.9 (`corepack enable` instala a versão do `packageManager`)
- **Java 21**: necessário para `pnpm test:rules`, `pnpm test:e2e` e `pnpm dev:emulators` (Firestore emulator). No Windows: `winget install EclipseAdoptium.Temurin.21.JDK`

## Quick start

```bash
pnpm install
cp .env.example .env   # já aponta para o emulator
pnpm dev:emulators     # emulator do Firestore + astro dev --mode test
```

`pnpm dev:emulators` roda o Astro com `--mode test`, que lê o `.env.test` versionado (projeto `demo-landing`, emulator ligado); já `pnpm dev` lê o seu `.env`.

Abra http://localhost:4321. Sem Java, `pnpm dev` sobe só o site (o envio do formulário falhará sem emulator ou projeto real).

## Personalizando para um cliente

1. **Conteúdo:** edite `src/content/sections/*.yaml` (hero, features, preços, FAQ, contato, header, footer etc.).
2. **Site:** ajuste `src/site.config.ts` (nome, descrição, contatos, redes). Ao alterar a política de privacidade, atualize também `privacyPolicyVersion`: ela é gravada em cada contato como `consentVersion`.
3. **Identidade visual:** tokens (cores, tipografia, raios) em `src/styles/global.css`. A cor do tema (`themeColor`/`backgroundColor`, usadas em `<meta name="theme-color">` e no `site.webmanifest` gerado) e as cores/logo das imagens OG também ficam em `src/site.config.ts`; nenhum componente precisa ser editado.
4. **Logo e ícones:** logo em `src/assets/brand/`; favicons e ícones em `public/` (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`).
5. **Textos legais:** substitua os placeholders `[NOME DA EMPRESA]`, `[CNPJ]` e `[E-MAIL DO ENCARREGADO]` em `src/content/legal/*.md` e revise o conteúdo com o jurídico do cliente.
6. **Assuntos do formulário:** a lista fica em `src/content/sections/contact.yaml` **e** em `firebase/firestore.rules`. As duas precisam ser idênticas; depois de mudar, rode `pnpm test:rules` e publique as regras.
7. **Ambiente:** copie `.env.example` para `.env` e preencha (veja a tabela abaixo). Configure o Firebase em [docs/firebase-setup.md](docs/firebase-setup.md).

### Comportamento do formulário de contato

- O envio expira após `SUBMIT_TIMEOUT_MS` (10 s, em `src/lib/firebase.ts`). Se a gravação enfileirada chegar depois do timeout, uma nova tentativa do usuário pode criar um documento duplicado.
- Com o emulator ligado, o App Check não é inicializado.

## Scripts

| Script               | O que faz                                                        |
| -------------------- | ---------------------------------------------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento do Astro                             |
| `pnpm dev:emulators` | Firestore emulator + `astro dev --mode test` (requer Java 21)    |
| `pnpm build`         | Gera o site estático em `dist/` (`--mode <x>` usa `.env.<x>`)    |
| `pnpm preview`       | Serve o `dist/` localmente                                       |
| `pnpm check`         | Checagem de tipos (`astro check`)                                |
| `pnpm lint`          | ESLint                                                           |
| `pnpm lint:fix`      | ESLint com correções automáticas                                 |
| `pnpm format`        | Prettier (escreve)                                               |
| `pnpm format:check`  | Prettier (só verifica)                                           |
| `pnpm test`          | Testes unitários (Vitest)                                        |
| `pnpm test:rules`    | Testes das regras do Firestore no emulator (requer Java 21)      |
| `pnpm test:e2e`      | Playwright + axe (requer Java 21)                                |
| `pnpm lhci`          | Lighthouse CI, perfil mobile, sobre `dist/` (rode o build antes) |
| `pnpm lhci:desktop`  | Lighthouse CI, perfil desktop                                    |

## Variáveis de ambiente

Todas são públicas (`PUBLIC_*`) e vão para o bundle do navegador. `.env.example` lista todas; `.env.test` é versionado (projeto `demo-landing`, emulator ligado, sem segredos) e é usado por `pnpm build --mode test`.

| Variável                       | Descrição                                               |
| ------------------------------ | ------------------------------------------------------- |
| `PUBLIC_SITE_URL`              | URL pública (canonical, sitemap, OG)                    |
| `PUBLIC_FIREBASE_API_KEY`      | Config do app web do Firebase                           |
| `PUBLIC_FIREBASE_AUTH_DOMAIN`  | Config do app web do Firebase                           |
| `PUBLIC_FIREBASE_PROJECT_ID`   | Id do projeto (`demo-landing` no emulator)              |
| `PUBLIC_FIREBASE_APP_ID`       | Config do app web do Firebase                           |
| `PUBLIC_RECAPTCHA_SITE_KEY`    | Chave de site do reCAPTCHA v3 (App Check)               |
| `PUBLIC_GTM_ID`                | Contêiner do GTM (vazio desativa)                       |
| `PUBLIC_USE_FIREBASE_EMULATOR` | `true` usa o emulator local, `false` usa o projeto real |

## Deploy

Push na `main` roda o workflow `CI`; se passar, o workflow `Deploy` publica no S3 e invalida o CloudFront. Configure tudo seguindo:

- [docs/aws-setup.md](docs/aws-setup.md): S3, CloudFront, OIDC e GitHub Environment `production`
- [docs/security-headers.md](docs/security-headers.md): cabeçalhos e CSP
- [docs/firebase-setup.md](docs/firebase-setup.md): Firestore, regras, App Check, e-mail

## Testes

- `pnpm test`: unitários (schema do contato, estado do formulário, consentimento, collections)
- `pnpm test:rules`: regras do Firestore contra o emulator
- `pnpm test:e2e`: formulário, carrossel, menu, FAQ, cookies e axe (zero violações serious/critical)
- `pnpm build --mode test && pnpm lhci`: orçamentos do Lighthouse (>= 0.9 em performance, acessibilidade, boas práticas e SEO)

**Lighthouse CI envia os relatórios para o `temporary-public-storage`, que gera URLs públicas.** Em sites de clientes privados, troque em `lighthouserc.json` por armazenamento local:

```json
"upload": { "target": "filesystem", "outputDir": ".lighthouseci/reports" }
```

e, se quiser guardar os relatórios, publique a pasta como artifact no workflow `CI`.

## Próximos passos (fora do escopo)

- Notificação por e-mail (extensão Trigger Email)
- Rate limiting via Cloud Function
- i18n completo
- Dark mode
- CMS visual (Keystatic/Decap)
- Infraestrutura AWS como código
- Painel administrativo de contatos

## Notas de operação

- **release-please e CI:** PRs abertos com o `GITHUB_TOKEN` padrão não disparam outros workflows, então o `CI` não roda neles. Se a branch protection exigir CI nesses PRs, configure o release-please com um PAT ou GitHub App.
- **Assets antigos no S3:** cada deploy sincroniza `_astro/` sem `--delete` (assets hash são imutáveis e páginas em cache ainda podem referenciá-los). Crie uma regra de lifecycle no bucket para expirar objetos de `_astro/` com mais de, por exemplo, 90 dias.

Para contribuir, veja [CONTRIBUTING.md](CONTRIBUTING.md).
