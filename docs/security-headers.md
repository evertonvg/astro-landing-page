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
default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://www.youtube-nocookie.com https://www.google.com/recaptcha/ https://recaptcha.google.com https://www.googletagmanager.com; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com https://i.ytimg.com; style-src 'self' 'unsafe-inline'; font-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

### Por que `'unsafe-inline'`

O bootstrap do GTM e o do consentimento (Consent Mode, que define o estado padrão antes do carregamento do GTM) são scripts inline no `<head>`. Como o site é estático, não há como gerar nonces por requisição; por isso `script-src` e `style-src` precisam de `'unsafe-inline'`. As demais diretivas continuam restritivas (`object-src 'none'`, `frame-ancestors 'none'`, hosts explícitos).

### Tags adicionadas no GTM

Cada tag nova no GTM (Meta Pixel, Hotjar, Clarity etc.) carrega scripts, imagens e conexões de outros domínios. Se o console do navegador mostrar bloqueios por CSP depois de publicar o contêiner, inclua os hosts necessários em `script-src`, `connect-src`, `img-src` ou `frame-src`, e revise a política de privacidade e o registro de cookies (`src/content/legal/`).
