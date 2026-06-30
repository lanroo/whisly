-- ============================================================
-- Whisly — bucket público para imagens dos itens
-- A Edge Function link-preview baixa a imagem do produto e a hospeda aqui
-- (evita hotlink 403). Usuários também enviam imagens do dispositivo.
-- Leitura é pública (bucket public); escrita exige login (ver 0005).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;
