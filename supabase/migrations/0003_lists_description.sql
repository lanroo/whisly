-- ============================================================
-- Whisly — adiciona descrição às listas
-- Texto livre exibido no topo da tela de detalhes da lista.
-- A policy de UPDATE existente (lists_update_editors) já cobre a coluna.
-- ============================================================

alter table public.lists add column if not exists description text;
