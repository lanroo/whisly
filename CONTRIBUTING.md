# Contribuindo com o Whisly

Padrões de **branch**, **commit** e **pull request** do projeto. Toda branch,
commit e PR carrega o número do card (issue) do
[GitHub Project](https://github.com/users/lanroo/projects/3).

> Sem card não há branch. Se não existe issue para o que você vai fazer, crie
> primeiro no board.

## Áreas (scope)

| Scope   | Significado                                  |
| ------- | -------------------------------------------- |
| `web`   | Frontend (`apps/web`)                        |
| `db`    | Banco / Supabase (`supabase/migrations`)     |
| `api`   | Edge functions / serviços (futuro)           |
| `auth`  | Autenticação                                 |
| `infra` | Configuração, build, tooling                 |
| `docs`  | Documentação                                 |

## Branch

Base **sempre** `main`. Formato:

```
<tipo>/<area>/<nº-do-card>-<slug-curto>
```

- `<tipo>`: `feat` · `fix` · `refactor` · `chore` · `docs` · `test`
- `<area>`: uma das áreas acima
- `<nº-do-card>`: número da issue no GitHub
- `<slug-curto>`: 2–4 palavras em kebab-case

Exemplos:

```
feat/web/12-home-empty-state
fix/web/14-remove-mock-shared-lists
feat/db/20-rls-colaboradores
```

## Commit

[Conventional Commits](https://www.conventionalcommits.org/), em **português**,
**uma frase** no imperativo, **sem coautor**, referenciando o card:

```
<tipo>(<area>): descrição no imperativo (#<nº>)
```

Exemplos:

```
feat(web): estado vazio de boas-vindas na home (#12)
fix(web): remove listas compartilhadas mockadas (#14)
feat(db): adiciona RLS de colaboradores (#20)
```

## Pull Request

- Destino **sempre** `main`.
- **Um PR por feature**, aberto ao final das tasks (não um PR por commit).
- Título no mesmo formato do commit: `<tipo>(<area>): descrição (#<nº>)`.
- No corpo, use `Closes #<nº>` para fechar o card automaticamente no merge.

## Rodando o projeto

Monorepo com **npm workspaces** (use `npm`, não `pnpm`):

```bash
nvm use        # alinha o Node ao .nvmrc (20)
npm install    # primeira vez / quando mudar dependências
npm run dev    # sobe o app em http://localhost:5173
```

O backend é Supabase hospedado; as credenciais ficam no `.env` da raiz
(ignorado pelo git — veja `.env.example`).
