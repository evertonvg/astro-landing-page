# Contribuindo

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org) em inglês, validados pelo commitlint (hook `commit-msg`). Formato: `tipo(escopo opcional): descrição no imperativo`.

```text
feat: add pricing toggle
fix(contact): keep focus on retry after timeout
docs: explain CloudFront function setup
chore(deps): bump vitest from 5.0.4 to 5.0.5
feat!: rename section content keys
```

Tipos usuais: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Mudança incompatível: `!` após o tipo ou rodapé `BREAKING CHANGE:`.

## Fluxo de PR

1. Crie uma branch a partir da `main` (ex.: `feat/pricing-toggle`).
2. Faça commits pequenos; o hook de pre-commit roda ESLint e Prettier nos arquivos alterados.
3. Abra o PR usando o template. **O título do PR deve seguir Conventional Commits**, pois é ele que entra no changelog ao fazer squash.
4. O workflow `CI` precisa passar antes do merge.

## Rodando os testes

Requisitos: Node 24, pnpm 11.9 e Java 21 (emulator do Firestore).

| Suíte                | Comando                               |
| -------------------- | ------------------------------------- |
| Lint e formatação    | `pnpm lint` e `pnpm format:check`     |
| Tipos                | `pnpm check`                          |
| Unitários            | `pnpm test`                           |
| Regras do Firestore  | `pnpm test:rules`                     |
| E2E e acessibilidade | `pnpm test:e2e`                       |
| Lighthouse           | `pnpm build --mode test && pnpm lhci` |

Na primeira execução do E2E, instale o navegador: `pnpm exec playwright install chromium`.

## Releases

O [release-please](https://github.com/googleapis/release-please) roda a cada push na `main`. Ele lê os commits convencionais e mantém aberto um PR de release com o bump de versão em `package.json` (`feat` = minor, `fix` = patch, `!`/`BREAKING CHANGE` = major) e o `CHANGELOG.md`. Ao fazer merge desse PR, a tag e a release do GitHub são criadas. Não edite a versão nem o changelog à mão.
