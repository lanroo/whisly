-- ============================================================
-- Whisly — usuários logados podem enviar/editar/remover imagens
-- de itens no bucket público item-images (upload do dispositivo).
-- A Edge Function usa service role e não depende destas policies.
-- ============================================================

create policy "item_images_insert_auth"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'item-images');

create policy "item_images_update_auth"
  on storage.objects for update to authenticated
  using (bucket_id = 'item-images');

create policy "item_images_delete_auth"
  on storage.objects for delete to authenticated
  using (bucket_id = 'item-images');
