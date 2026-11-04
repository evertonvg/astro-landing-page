# Configuração da AWS (S3 + CloudFront)

O site é estático (`dist/`). A hospedagem usa um bucket S3 privado servido pelo CloudFront, e o deploy roda pelo GitHub Actions via OIDC (sem chaves de acesso de longa duração).

## 1. Bucket S3

1. Crie um bucket (ex.: `meu-cliente-landing`) na região desejada.
2. Mantenha **Block Public Access** ligado (todas as 4 opções). O bucket nunca é público.
3. Não habilite "Static website hosting": o acesso é só pelo CloudFront via OAC.

## 2. CloudFront

1. Crie uma distribution com o bucket como origem.
2. Em **Origin access**, escolha **Origin access control (OAC)** e crie um novo (assinatura `sigv4`, "Always sign").
3. Copie a **bucket policy** que o console gera e aplique no bucket.
4. **Default root object**: `index.html`.
5. Associe a **Response headers policy** descrita em [security-headers.md](./security-headers.md).
6. Domínio próprio: adicione o alias (CNAME) e o certificado do ACM (região `us-east-1`).

### CloudFront Function (viewer request)

O OAC acessa o S3 pela API REST, então URIs como `/privacidade/` ou `/privacidade` não resolvem sozinhas. Crie uma CloudFront Function (runtime `cloudfront-js-2.0`), publique-a e associe-a ao evento **Viewer request** do comportamento padrão:

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.split('/').pop().includes('.')) {
    request.uri = uri + '/index.html';
  }

  return request;
}
```

### Páginas de erro

Em **Error pages**, crie duas custom error responses:

| Código HTTP | Response page path | Código HTTP de resposta |
| ----------- | ------------------ | ----------------------- |
| 403         | `/404.html`        | 404                     |
| 404         | `/404.html`        | 404                     |

(O S3 privado devolve 403 para objetos inexistentes.)

## 3. OIDC do GitHub no IAM

1. IAM > Identity providers > Add provider > **OpenID Connect**.
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
2. Crie uma role (ex.: `github-deploy-meu-cliente`) com a **trust policy** abaixo. Troque `<ACCOUNT_ID>`, `<OWNER>` e `<REPO>`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:<OWNER>/<REPO>:environment:production"
        }
      }
    }
  ]
}
```

3. Anexe esta **policy mínima** à role. Troque `<BUCKET>`, `<ACCOUNT_ID>` e `<DISTRIBUTION_ID>`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::<BUCKET>"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<BUCKET>/*"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

## 4. GitHub Environment `production`

Em Settings > Environments > New environment > `production`, cadastre estas **variables** (não são segredos; tudo o que começa com `PUBLIC_` vai para o bundle do navegador de qualquer forma):

| Variable                      | Exemplo / origem                     |
| ----------------------------- | ------------------------------------ |
| `PUBLIC_SITE_URL`             | `https://www.cliente.com.br`         |
| `PUBLIC_FIREBASE_API_KEY`     | Config do app web no Firebase        |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Config do app web no Firebase        |
| `PUBLIC_FIREBASE_PROJECT_ID`  | Config do app web no Firebase        |
| `PUBLIC_FIREBASE_APP_ID`      | Config do app web no Firebase        |
| `PUBLIC_RECAPTCHA_SITE_KEY`   | Chave de site do reCAPTCHA v3        |
| `PUBLIC_GTM_ID`               | `GTM-XXXXXXX` (vazio desativa o GTM) |
| `AWS_ROLE_ARN`                | ARN da role criada acima             |
| `AWS_REGION`                  | Região do bucket (ex.: `sa-east-1`)  |
| `S3_BUCKET`                   | Nome do bucket                       |
| `CLOUDFRONT_DISTRIBUTION_ID`  | ID da distribution                   |

**Aprovação manual (opcional):** em "Required reviewers" do environment, adicione quem deve aprovar cada deploy. O workflow `Deploy` ficará em espera até a aprovação.

## 5. Como o deploy funciona

O workflow `Deploy` roda quando o workflow `CI` termina com sucesso na `main` (ou manualmente via "Run workflow"). Ele gera o `.env` com as variables, executa `pnpm build`, envia primeiro `_astro/` (arquivos com hash, cache imutável de 1 ano), depois o restante (HTML com `max-age=0,must-revalidate`, removendo o que não existe mais) e por fim invalida o cache do CloudFront.
