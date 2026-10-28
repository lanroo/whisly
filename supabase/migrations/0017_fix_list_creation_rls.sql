-- O INSERT retorna o id da nova lista. A policy de SELECT precisa reconhecer
-- diretamente o dono da linha recém-inserida; a função STABLE pode enxergar
-- apenas o snapshot anterior ao INSERT durante o RETURNING.
alter policy "lists_select_visible" on public.lists
  using (owner_id = auth.uid() or public.is_list_member(id));
