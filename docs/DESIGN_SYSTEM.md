# Design System — Wishly

Referência dos tokens e componentes. **Toda tela nova deve usar estes primitivos** em vez de markup/CSS solto.

> Referência viva (visual): rode o app e acesse **`/dev/styleguide`**.

## Tokens (`apps/web/src/styles/tokens.css`)

| Grupo | Variáveis |
| --- | --- |
| Cor de ação | `--accent`, `--accent-strong`, `--accent-soft`, `--accent-gradient` |
| Superfícies | `--bg`, `--surface`, `--surface-strong`, `--surface-low`, `--surface-blue-strong` |
| Texto | `--text`, `--muted`, `--muted-2` |
| Semântico | `--success`, `--warning`, `--danger` |
| Espaçamento | `--space-1`…`--space-12` (escala 4px) |
| Tipografia | `--text-xs`…`--text-2xl` |
| Raio | `--radius-sm/md/lg` · Sombra: `--shadow-1/2` · Z: `--z-nav/modal/toast` |

Regra: **não usar cores/medidas hardcoded** — sempre `var(--token)`.

## Componentes (`apps/web/src/shared/ui`)

| Componente | Uso |
| --- | --- |
| `Button` | Ações. Variantes: `primary` (navy), `secondary`, `ghost`, `danger`; `size` `md/lg`; `icon`, `to`, `fullWidth` |
| `IconButton` | Ação só com ícone (exige `label` acessível) |
| `TextField` | Campo de texto (rótulo + ícone + erro) |
| `Badge` | Rótulos de status: `neutral/accent/success/warning/danger` |
| `Avatar` | Foto ou inicial; `size` `sm/md/lg` |
| `Card` | Superfície; `padded`, `interactive` |
| `SegmentedControl` | Abas/filtros (genérico tipado) |
| `EmptyState` | Estado vazio padrão (ícone + título + ação) |
| `Skeleton` | Loading; `variant` `text/rect/circle` |
| `Modal` | Diálogo acessível (foco preso, Esc, portal) |
| `Toast` / `useToast` | Notificações efêmeras |

Layout: `AppShell` (+ `TopNav`/`BottomNav` adaptativos), `TopBar`. Auth: `PasswordField`, `AuthSocialButtons`.

## Convenções

- Classes dos primitivos novos usam prefixo **`.ui-*`** (evita colisão com o CSS legado).
- Imports via barrel: `import { Button, Badge } from '@/shared/ui'`.
- Idioma da UI: **PT-BR** com acentuação.
- Mobile-first; validar em 375 / 768 / 1280.
