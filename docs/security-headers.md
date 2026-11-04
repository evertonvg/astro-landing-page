# Cabeçalhos de segurança (CloudFront)

O hosting estático não consegue definir cabeçalhos HTTP, então eles ficam numa **Response headers policy** do CloudFront (CloudFront > Policies > Response headers > Create), associada ao comportamento padrão da distribution.

## Security headers

| Cabeçalho                   | Valor                                          |
| --------------------------- | ---------------------------------------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options`    | `nosniff`                                      |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`              |
| `X-Frame-Options`           | `DENY`                                         |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     |

HSTS com `preload` é difícil de reverter: só use em domínios que ficarão sempre em HTTPS, incluindo subdomínios.

## Content-Security-Policy

Cadastre como custom header `Content-Security-Policy` (com "Origin override" ligado), em uma única linha:

```text
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com; frame-src https://www.youtube-nocookie.com https://www.google.com/recaptcha/ https://recaptcha.google.com https://www.googletagmanager.com; img-src 'self' data: https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://i.ytimg.com; style-src 'self' 'unsafe-inline'; font-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

> Este bloco é a fonte única da política: `tests/e2e/csp.spec.ts` lê o primeiro bloco `text` desta seção e o injeta nas respostas HTML, então o documento e o teste não divergem.

### Por que `'unsafe-inline'`

O bootstrap do GTM e o do consentimento (Consent Mode, que define o estado padrão antes do carregamento do GTM) são scripts inline no `<head>`. Como o site é estático, não há como gerar nonces por requisição; por isso `script-src` e `style-src` precisam de `'unsafe-inline'`. As demais diretivas continuam restritivas (`object-src 'none'`, `frame-ancestors 'none'`, hosts explícitos).

### Por que `'unsafe-eval'`

O build padrão do Alpine.js avalia as expressões dos atributos (`x-data`, `@click`, `:aria-hidden` etc.) com `new AsyncFunction`, o que o CSP só permite com `'unsafe-eval'`. Sem ele o Alpine não inicializa em produção: menu, FAQ, carrossel e validação do formulário deixam de funcionar. O formulário de contato usa `method="post"` justamente para que, mesmo com o JavaScript morto, os dados nunca vão para a URL.

A alternativa mais restritiva é trocar `alpinejs` por [`@alpinejs/csp`](https://alpinejs.dev/advanced/csp), que dispensa `'unsafe-eval'`, mas exige reescrever todas as expressões inline dos componentes (só nomes de propriedades e métodos, sem lógica nos atributos). Fica fora do escopo deste boilerplate.

### Google Analytics 4

O GA4 (via GTM) usa `*.googletagmanager.com` (script e imagem) e envia hits para `*.google-analytics.com` e `*.analytics.google.com` (`connect-src`); todos já estão na política acima.

### Tags adicionadas no GTM

Cada tag nova no GTM (Meta Pixel, Hotjar, Clarity etc.) carrega scripts, imagens e conexões de outros domínios. Se o console do navegador mostrar bloqueios por CSP depois de publicar o contêiner, inclua os hosts necessários em `script-src`, `connect-src`, `img-src` ou `frame-src`, e revise a política de privacidade e o registro de cookies (`src/content/legal/`).
