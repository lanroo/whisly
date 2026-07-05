-- Lista os amigos aceitos de um usuário (info pública do perfil).
-- SECURITY DEFINER porque a RLS de friendships só deixa ver as próprias
-- relações; aqui expomos apenas dados públicos (nome, @usuário, avatar) dos
-- amigos aceitos — usado nos perfis (meu e de outras pessoas).
-- (aplicado no projeto Supabase via MCP)
create or replace function public.list_friends(_user uuid)
returns table (id uuid, name text, handle text, avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.name, p.handle, p.avatar_url
  from friendships f
  join profiles p
    on p.id = case when f.requester_id = _user then f.addressee_id else f.requester_id end
  where f.status = 'accepted'
    and (f.requester_id = _user or f.addressee_id = _user)
  order by p.name nulls last;
$$;

revoke execute on function public.list_friends(uuid) from anon, public;
grant execute on function public.list_friends(uuid) to authenticated;
