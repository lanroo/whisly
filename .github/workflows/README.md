# CI/CD — GitHub Actions

Dois workflows:

| Workflow | Quando roda | O que faz | Precisa de secret? |
|----------|-------------|-----------|--------------------|
| `ci.yml` | PR e push na `main` | Lint + typecheck + build | Não |
| `deploy.yml` | PR (preview) e push na `main` (produção) | Build e deploy pela Vercel CLI | Sim (3) |

## Configurar o deploy (uma vez só)

O `ci.yml` já funciona sozinho. O `deploy.yml` precisa de dois passos:

### 1. Adicionar os secrets no repositório

Em **Settings → Secrets and variables → Actions → New repository secret**, crie:

- **`VERCEL_TOKEN`** — gere em https://vercel.com/account/tokens
- **`VERCEL_ORG_ID`** e **`VERCEL_PROJECT_ID`** — rode `vercel link` na raiz do projeto e pegue de `.vercel/project.json` (campos `orgId` e `projectId`), ou veja em Vercel → Project → Settings → General.

Pela CLI do GitHub também dá:

```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

### 2. Desligar o auto-deploy da Vercel (evita deploy duplicado)

Como a Vercel já está ligada ao repo via integração Git, ela deploya sozinha a cada push. Se deixar assim **e** rodar este workflow, o projeto builda duas vezes.

Escolha **um** dono do deploy:

- **Manter a Vercel como dona** → apague o `deploy.yml` e deixe só o `ci.yml`.
- **Actions como dona** → em Vercel → Project → **Settings → Git**, desative o deploy automático (ou configure o *Ignored Build Step* para sempre pular), e deixe este workflow publicar.
