# Configuração do Firebase

O formulário de contato grava documentos na coleção `contacts` do Firestore, direto do navegador, protegido por regras de segurança e App Check.

## 1. Projeto e app web

1. No [console do Firebase](https://console.firebase.google.com), crie um projeto.
2. Project settings > General > Your apps > **Add app > Web**. Copie os valores de `firebaseConfig`:
   - `apiKey` para `PUBLIC_FIREBASE_API_KEY`
   - `authDomain` para `PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` para `PUBLIC_FIREBASE_PROJECT_ID`
   - `appId` para `PUBLIC_FIREBASE_APP_ID`
3. Use esses valores no `.env` local e nas variables do GitHub Environment `production` (veja [aws-setup.md](./aws-setup.md)).

## 2. Firestore

1. Build > Firestore Database > **Create database**, em **modo produção** (nega tudo por padrão).
2. Escolha a região mais próxima do público.

## 3. Deploy das regras

As regras ficam em `firebase/firestore.rules`. O `firebase-tools` é devDependency do projeto:

```bash
pnpm exec firebase login
pnpm exec firebase deploy --only firestore:rules --config firebase/firebase.json --project <id-do-projeto>
```

A lista de assuntos (`subject`) das regras precisa ser idêntica à de `src/content/sections/contact.yaml`. Rode `pnpm test:rules` depois de qualquer mudança.

## 4. App Check (reCAPTCHA v3)

1. [Console do reCAPTCHA](https://www.google.com/recaptcha/admin): crie uma chave **v3** e liste os domínios do site (produção e, se quiser, `localhost`).
2. Firebase > App Check > Apps > seu app web > **reCAPTCHA** e informe a chave secreta.
3. Coloque a chave de site em `PUBLIC_RECAPTCHA_SITE_KEY`.
4. **Debug token (desenvolvimento):** ao rodar `pnpm dev` contra um projeto real (`PUBLIC_USE_FIREBASE_EMULATOR=false`), o app ativa o modo debug e imprime um token no console do navegador. Registre-o em App Check > Apps > Manage debug tokens.
5. **Enforcement:** com o site já publicado e enviando tokens (confira as métricas), em App Check > APIs > Cloud Firestore clique em **Enforce**. Antes disso as requisições sem token ainda passam.

Com o emulator (`PUBLIC_USE_FIREBASE_EMULATOR=true`) o App Check não é inicializado.

## 5. Notificação por e-mail (opcional, extensão Trigger Email)

Requer o plano **Blaze** (pago por uso) e um provedor SMTP (Amazon SES, Resend etc.).

1. Firebase > Extensions > instale **Trigger Email from Firestore**.
2. Informe a URI SMTP (ex.: `smtps://usuario:senha@smtp.exemplo.com:465`), o remetente padrão e a coleção de e-mails (padrão: `mail`).
3. A extensão envia um e-mail para cada documento criado na coleção `mail`, neste formato:

```json
{
  "to": ["comercial@cliente.com.br"],
  "message": {
    "subject": "Novo contato pelo site",
    "text": "Nome: ...\nE-mail: ...\nMensagem: ..."
  }
}
```

As regras do projeto **negam qualquer escrita do navegador** em `mail`, e isso deve continuar assim. Para ligar o envio ao formulário, crie uma Cloud Function com trigger `onDocumentCreated('contacts/{id}')` que grave o documento acima em `mail` usando o Admin SDK (que ignora as regras). Essa função não vem no boilerplate; veja os próximos passos no README. Os dados do contato são dados pessoais, então mencione o envio por e-mail em `src/content/legal/privacidade.md`.
