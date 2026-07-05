-- ============================================================
-- Whisly — solicitar amizade de forma atômica e idempotente.
-- Evita 409 por grafo desatualizado / clique-duplo / direção reversa.
--   já amigos            -> 'friends'  (no-op)
--   a outra já me pediu  -> aceita e vira 'accepted'
--   eu já pedi           -> 'pending'  (no-op)
--   sem relação          -> cria pending -> 'pending'
-- (aplicado no projeto Supabase via MCP)
-- ============================================================
create or replace function public.request_friendship(_addressee uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _me uuid := auth.uid();
  _existing friendships%rowtype;
begin
  if _me is null then
    raise exception 'not authenticated';
  end if;
  if _me = _addressee then
    raise exception 'cannot friend yourself';
  end if;

  select * into _existing from friendships
  where (requester_id = _me and addressee_id = _addressee)
     or (requester_id = _addressee and addressee_id = _me)
  limit 1;

  if found then
    if _existing.status = 'accepted' then
      return 'friends';
    end if;
    -- pendente: se a outra pessoa é quem pediu, aceito automaticamente
    if _existing.addressee_id = _me then
      update friendships set status = 'accepted', updated_at = now()
        where id = _existing.id;
      return 'accepted';
    end if;
    return 'pending';
  end if;

  insert into friendships (requester_id, addressee_id, status)
  values (_me, _addressee, 'pending');
  return 'pending';
end;
$$;

revoke execute on function public.request_friendship(uuid) from anon, public;
grant execute on function public.request_friendship(uuid) to authenticated;
