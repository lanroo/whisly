-- ============================================================
-- Whisly — 0002: itens, autor só edita/remove os próprios (RLS)
-- Aplicar no projeto Supabase (SQL Editor ou `supabase db push`).
--
-- Antes: items_update/items_delete usavam can_edit_list(list_id),
-- deixando qualquer editor alterar/apagar itens de OUTRAS pessoas.
-- Depois: adicionar continua para dono/editor; editar e apagar
-- ficam restritos ao AUTOR do item (added_by = auth.uid()).
-- ============================================================

-- INSERT: editor da lista E o autor declarado é o próprio usuário
drop policy if exists "items_insert_editors" on public.list_items;
create policy "items_insert_editors" on public.list_items
  for insert to authenticated
  with check (public.can_edit_list(list_id) and added_by = auth.uid());

-- UPDATE: somente o autor do item (e ainda editor da lista)
drop policy if exists "items_update_editors" on public.list_items;
create policy "items_update_own" on public.list_items
  for update to authenticated
  using (added_by = auth.uid() and public.can_edit_list(list_id))
  with check (added_by = auth.uid() and public.can_edit_list(list_id));

-- DELETE: somente o autor do item
drop policy if exists "items_delete_editors" on public.list_items;
create policy "items_delete_own" on public.list_items
  for delete to authenticated
  using (added_by = auth.uid() and public.can_edit_list(list_id));
